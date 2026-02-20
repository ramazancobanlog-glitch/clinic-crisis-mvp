import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST() {
    const response = NextResponse.json({ success: true, message: 'Çıkış yapıldı' });
    response.cookies.delete('token');
    return response;
}
