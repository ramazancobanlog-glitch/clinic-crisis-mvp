import { NextResponse } from 'next/server';
import { getDB, query, execute, auditLog } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request) {
    try {
        const db = await getDB();
        if (!db) return NextResponse.json([], { status: 200 });

        const clinicId = request.headers.get('x-user-clinic');

        const operations = await query(db, `
            SELECT o.*, p.name as patient_name, u.name as doctor_name, r.name as room_name
            FROM operations o
            JOIN patients p ON o.patient_id = p.id
            JOIN users u ON o.doctor_id = u.id
            JOIN operating_rooms r ON o.room_id = r.id
            WHERE o.clinic_id = ?
            ORDER BY o.start_time ASC
        `, [clinicId]);

        return NextResponse.json(operations);
    } catch (error) {
        console.error('Operations GET error:', error);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const db = await getDB();
        if (!db) return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });

        const body = await request.json();
        const { patientId, roomId, doctorId, type, startTime, endTime, notes } = body;
        const userId = request.headers.get('x-user-id');
        const clinicId = request.headers.get('x-user-clinic');

        if (!patientId || !roomId || !startTime || !endTime) {
            return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
        }

        // Çakışma kontrolü
        const conflict = await db.prepare(`
            SELECT id FROM operations 
            WHERE room_id = ? 
            AND status != 'cancelled'
            AND (
                (start_time >= ? AND start_time < ?) OR
                (end_time > ? AND end_time <= ?) OR
                (start_time <= ? AND end_time >= ?)
            )
        `).bind(roomId, startTime, endTime, startTime, endTime, startTime, endTime).first();

        if (conflict) {
            return NextResponse.json({ error: 'Bu saatler arasında ameliyathane dolu' }, { status: 409 });
        }

        const result = await execute(db, `
            INSERT INTO operations (clinic_id, patient_id, room_id, doctor_id, type, start_time, end_time, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled', ?)
        `, [clinicId, patientId, roomId, doctorId, type, startTime, endTime, notes]);

        const opId = result.lastRowId;

        // Audit Log
        await auditLog(db, {
            clinicId,
            userId,
            action: 'OPERATION_SCHEDULED',
            entityType: 'operations',
            entityId: opId,
            details: `Yeni operasyon planlandı: ${type}`,
            ipAddress: request.headers.get('cf-connecting-ip')
        });

        return NextResponse.json({ success: true, id: opId });
    } catch (error) {
        console.error('Operations POST error:', error);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
