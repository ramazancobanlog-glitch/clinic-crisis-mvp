import { NextResponse } from 'next/server';
import { getDB, query, execute, auditLog } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request) {
    try {
        const db = await getDB();
        if (!db) return NextResponse.json([], { status: 200 });

        const clinicId = request.headers.get('x-user-clinic');

        const patients = await query(db, `
            SELECT * FROM patients 
            WHERE clinic_id = ? 
            ORDER BY last_check_at DESC
        `, [clinicId]);

        return NextResponse.json(patients);
    } catch (error) {
        console.error('Patients GET error:', error);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const db = await getDB();
        if (!db) return NextResponse.json({ error: 'Veritabanı bağlantısı yok' }, { status: 500 });

        const body = await request.json();
        const { name, tcNo, birthDate, bloodType, gestationalWeek, riskLevel, room, bed, emergencyContact, notes } = body;
        const userId = request.headers.get('x-user-id');
        const clinicId = request.headers.get('x-user-clinic');

        if (!name || !tcNo) {
            return NextResponse.json({ error: 'Ad ve TC No gerekli' }, { status: 400 });
        }

        const result = await execute(db, `
            INSERT INTO patients (clinic_id, name, tc_no, birth_date, blood_type, gestational_week, risk_level, status, room_number, bed_number, emergency_contact, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'admitted', ?, ?, ?, ?)
        `, [clinicId, name, tcNo, birthDate, bloodType, gestationalWeek, riskLevel, room, bed, emergencyContact, notes]);

        const patientId = result.lastRowId;

        // Audit Log
        await auditLog(db, {
            clinicId,
            userId,
            action: 'PATIENT_ADMITTED',
            entityType: 'patients',
            entityId: patientId,
            details: `Yeni hasta yatışı: ${name}`,
            ipAddress: request.headers.get('cf-connecting-ip')
        });

        return NextResponse.json({ success: true, id: patientId });
    } catch (error) {
        console.error('Patients POST error:', error);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
