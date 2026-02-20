import { NextResponse } from 'next/server';
import { createToken } from '@/lib/auth';

export const runtime = 'edge';

// Demo kullanıcıları (DB bağlantısı olmadığında veya geliştirme modunda)
const DEMO_USERS = [
    { id: 1, name: 'Dr. Ayşe Yılmaz', email: 'admin@klinik.com', password: 'admin123', role: 'admin', clinic_id: 1 },
    { id: 2, name: 'Dr. Mehmet Kaya', email: 'doktor@klinik.com', password: 'admin123', role: 'doctor', clinic_id: 1 },
    { id: 3, name: 'Hmş. Fatma Demir', email: 'hemsire@klinik.com', password: 'admin123', role: 'nurse', clinic_id: 1 },
    { id: 4, name: 'Sek. Zeynep Ak', email: 'sekreter@klinik.com', password: 'admin123', role: 'secretary', clinic_id: 1 },
];

function createTokenResponse(user, token) {
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
}

export async function POST(request, { params }) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email ve şifre gerekli' }, { status: 400 });
        }

        // D1 bağlantısını merkezi yardımcı fonksiyonla al
        const { getDB } = await import('@/lib/db');
        const db = await getDB();

        // D1 kullanılabiliyorsa gerçek DB'ye bak
        if (db) {
            try {
                const user = await db.prepare(
                    'SELECT * FROM users WHERE email = ? AND is_active = 1'
                ).bind(email).first();

                if (user && user.password_hash === password) {
                    const token = await createToken({
                        id: user.id, name: user.name, email: user.email,
                        role: user.role, clinicId: user.clinic_id,
                    });
                    return createTokenResponse(user, token);
                }
                // DB'de bulunamadı, demo kullanıcılara da bak
            } catch (dbError) {
                console.error('DB query error:', dbError);
                // DB hatasında demo moda düş
            }
        }

        // Demo kullanıcı kontrolü (hem local dev hem de DB'de olmayan kullanıcılar için)
        const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
        if (demoUser) {
            const token = await createToken({
                id: demoUser.id, name: demoUser.name, email: demoUser.email,
                role: demoUser.role, clinicId: demoUser.clinic_id,
            });
            return createTokenResponse(demoUser, token);
        }

        return NextResponse.json({ error: 'Geçersiz email veya şifre' }, { status: 401 });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Sunucu hatası: ' + error.message }, { status: 500 });
    }
}
