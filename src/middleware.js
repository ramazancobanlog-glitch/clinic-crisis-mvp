import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/register', '/_next', '/favicon.ico'];

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Public paths - erişime açık
    if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    // Token kontrolü
    const token = request.cookies.get('token')?.value;

    if (!token) {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const user = await verifyToken(token);
    if (!user) {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Geçersiz oturum' }, { status: 401 });
        }
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
    }

    // Kullanıcı bilgisini header'a ekle
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id.toString());
    requestHeaders.set('x-user-role', user.role);
    requestHeaders.set('x-user-clinic', user.clinicId.toString());
    requestHeaders.set('x-user-name', encodeURIComponent(user.name));

    // Root path'i dashboard'a yönlendir
    if (pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next({
        request: { headers: requestHeaders },
    });
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
