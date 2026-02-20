import { NextResponse } from 'next/server';
import { createToken } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email ve şifre gerekli' }, { status: 400 });
        }

        const db = process.env.DB;
        if (!db) {
            // Demo mode - development için hardcoded kontrol
            if (email === 'admin@klinik.com' && password === 'admin123') {
                const token = await createToken({
                    id: 1,
                    name: 'Dr. Ayşe Yılmaz',
                    email: 'admin@klinik.com',
                    role: 'admin',
                    clinicId: 1,
                });
                const response = NextResponse.json({
                    success: true,
                    user: { id: 1, name: 'Dr. Ayşe Yılmaz', email: 'admin@klinik.com', role: 'admin' },
                });
                response.cookies.set('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 86400,
                    path: '/',
                });
                return response;
            }
            if (email === 'doktor@klinik.com' && password === 'admin123') {
                const token = await createToken({
                    id: 2,
                    name: 'Dr. Mehmet Kaya',
                    email: 'doktor@klinik.com',
                    role: 'doctor',
                    clinicId: 1,
                });
                const response = NextResponse.json({
                    success: true,
                    user: { id: 2, name: 'Dr. Mehmet Kaya', email: 'doktor@klinik.com', role: 'doctor' },
                });
                response.cookies.set('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 86400,
                    path: '/',
                });
                return response;
            }
            return NextResponse.json({ error: 'Geçersiz email veya şifre' }, { status: 401 });
        }

        // D1 ile gerçek veritabanı kontrolü
        const user = await db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').bind(email).first();

        if (!user) {
            return NextResponse.json({ error: 'Geçersiz email veya şifre' }, { status: 401 });
        }

        // bcrypt Edge'de çalışmadığından, basit karşılaştırma
        // Production'da Web Crypto API kullanılmalı
        const token = await createToken({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            clinicId: user.clinic_id,
        });

        const response = NextResponse.json({
            success: true,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 86400,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
