import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'clinic-crisis-mvp-secret-key-change-in-production'
);

const TOKEN_EXPIRY = '24h';

export async function createToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/token=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

export async function getUser(request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return await verifyToken(token);
}

export function checkRole(user, allowedRoles) {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  SECRETARY: 'secretary',
};

export const ROLE_LABELS = {
  superadmin: 'Süper Admin',
  admin: 'Başhekim / Yönetici',
  doctor: 'Doktor',
  nurse: 'Hemşire',
  secretary: 'Sekreter',
};
