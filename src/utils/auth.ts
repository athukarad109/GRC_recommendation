import { cookies } from 'next/headers';
import { verify, sign } from 'jsonwebtoken';
import { compare, hash } from 'bcryptjs';
import prisma from '@lib/prisma';

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export function generateToken(payload: { id: number; email: string; name: string }): string {
  return sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return null;
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as { id: number };
    const user = await prisma.organization.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        sector: true,
        locations: true,
        customerLocations: true,
        dataTypes: true,
        infrastructure: true,
        customerType: true,
        orgSize: true,
        revenue: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function getUserFromToken(token: string) {
  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { id: number };
    const user = await prisma.organization.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

export async function getUserFromResetToken(token: string) {
  try {
    const user = await prisma.organization.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        email: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error getting user from reset token:', error);
    return null;
  }
}

export async function clearResetToken(userId: number) {
  try {
    await prisma.organization.update({
      where: { id: userId },
      data: {
        resetToken: null,
        resetTokenExpires: null,
      },
    });
  } catch (error) {
    console.error('Error clearing reset token:', error);
    throw error;
  }
} 