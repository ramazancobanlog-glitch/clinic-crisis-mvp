import { NextResponse } from 'next/server';
import { getDB, query, execute, auditLog } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request) {
    try {
        const db = await getDB();
        if (!db) return NextResponse.json([], { status: 200 });

        const { searchParams } = new URL(request.url);
        const clinicId = request.headers.get('x-user-clinic');

        if (!clinicId) {
            return NextResponse.json({ error: 'Klinik bilgisi eksik' }, { status: 400 });
        }

        const alerts = await query(db, `
            SELECT ca.*, cc.name as code_name, cc.color, cc.severity, u.name as triggered_by_name
            FROM crisis_alerts ca
            JOIN crisis_codes cc ON ca.code_id = cc.id
            JOIN users u ON ca.triggered_by = u.id
            WHERE ca.clinic_id = ?
            ORDER BY ca.created_at DESC
            LIMIT 50
        `, [clinicId]);

        return NextResponse.json(alerts);
    } catch (error) {
        console.error('Crisis GET error:', error);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const db = await getDB();
        if (!db) return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });

        const body = await request.json();
        const { codeId, location, notes } = body;
        const userId = request.headers.get('x-user-id');
        const clinicId = request.headers.get('x-user-clinic');

        if (!codeId || !location) {
            return NextResponse.json({ error: 'Kod ve lokasyon gerekli' }, { status: 400 });
        }

        const result = await execute(db, `
            INSERT INTO crisis_alerts (clinic_id, code_id, triggered_by, location, notes, status)
            VALUES (?, ?, ?, ?, ?, 'active')
        `, [clinicId, codeId, userId, location, notes]);

        const alertId = result.lastRowId;

        // Audit Log
        await auditLog(db, {
            clinicId,
            userId,
            action: 'CRISIS_TRIGGERED',
            entityType: 'crisis_alerts',
            entityId: alertId,
            details: `Kriz tetiklendi: ${codeId} - ${location}`,
            ipAddress: request.headers.get('cf-connecting-ip')
        });

        return NextResponse.json({ success: true, id: alertId });
    } catch (error) {
        console.error('Crisis POST error:', error);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
