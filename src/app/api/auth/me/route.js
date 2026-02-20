import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export const runtime = 'edge';

export async function GET(request) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                clinicId: user.clinicId,
            }
        });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
