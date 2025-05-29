import { NextResponse } from "next/server";
import { comparePasswords, generateToken, setAuthCookie } from "@utils/auth";
import prisma from "@lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    try {
      // Find organization by email
      const organization = await prisma.organization.findUnique({
        where: { email },
      });
      
      if (!organization) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      
      // Verify password
      const isPasswordValid = await comparePasswords(password, organization.password);
      
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      
      // Generate JWT token
      const token = generateToken({ 
        id: organization.id, 
        email: organization.email, 
        name: organization.name 
      });
      
      // Set auth cookie
      await setAuthCookie(token);

      // Include the token in the response for debugging
      return NextResponse.json({ 
        success: true, 
        orgId: organization.id,
        token: token // This helps with debugging
      });
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}



