import { NextResponse } from 'next/server';
import { getDB, execute, auditLog } from '@/lib/db';

export const runtime = 'edge';

export async function POST(request) {
    try {
        const db = await getDB();
        if (!db) return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });

        const body = await request.json();
        const { alertId, notes } = body;
        const userId = request.headers.get('x-user-id');
        const clinicId = request.headers.get('x-user-clinic');

        if (!alertId) {
            return NextResponse.json({ error: 'Alert ID gerekli' }, { status: 400 });
        }

        // Acknowledge kaydı ekle
        await execute(db, `
            INSERT INTO crisis_acknowledgments (alert_id, user_id, notes)
            VALUES (?, ?, ?)
        `, [alertId, userId, notes]);

        // Opsiyonel: Alert durumunu güncelle (e.g. if solving)
        // Burada sadece onaylandığını belirtiyoruz

        // Audit Log
        await auditLog(db, {
            clinicId,
            userId,
            action: 'CRISIS_ACKNOWLEDGED',
            entityType: 'crisis_alerts',
            entityId: alertId,
            details: `Kriz onaylandı. Not: ${notes || '-'}`,
            ipAddress: request.headers.get('cf-connecting-ip')
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Crisis Acknowledge error:', error);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
