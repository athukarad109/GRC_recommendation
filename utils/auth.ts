import { sign, verify } from 'jsonwebtoken';
import { hash, compare } from 'bcrypt';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, SALT_ROUNDS);
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword);
}

export function generateToken(payload: any): string {
  return sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): any {
  try {
    return verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = cookies();
  (await cookieStore).set({
    name: 'auth_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
    sameSite: 'lax',
  });
}

export async function getAuthCookie() {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value;
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}

export async function getCurrentUser() {
  const token = (await cookies()).get('auth_token')?.value;
  
  if (!token) {
    console.log('No auth token found in cookies');
    return null;
  }
  
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('Token verification failed');
      return null;
    }
    return decoded;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}















