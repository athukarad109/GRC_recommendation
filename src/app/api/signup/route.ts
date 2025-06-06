import { NextResponse } from "next/server";
import { hashPassword, generateToken, setAuthCookie } from "@utils/auth";
import prisma from "@lib/prisma";
import { SignupFormData } from "@/types/formData";

// Password validation
function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  return { isValid: true };
}

// Email validation
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, sector, locations, customerLocations, dataTypes, 
            infrastructure, customerType, orgSize, revenue, recommendations } = body as SignupFormData;
    
    // Validate email
    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 });
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(password);
    
    try {
      // Use Prisma transaction to create organization and recommendations
      const result = await prisma.$transaction(async (prisma) => {
        // Create organization
        const organization = await prisma.organization.create({
          data: {
            name,
            email,
            password: hashedPassword,
            sector,
            locations,
            customerLocations,
            dataTypes,
            infrastructure,
            customerType,
            orgSize,
            revenue,
          },
        });
        
        // Create recommendation
        await prisma.recommendation.create({
          data: {
            orgId: organization.id,
            requiredFrameworks: recommendations.required,
            recommendedFrameworks: recommendations.recommended,
          },
        });
        
        return organization;
      });
      
      // Generate JWT token
      const token = generateToken({ id: result.id, email: result.email, name: result.name });

      // Set auth cookie
      await setAuthCookie(token);

      return NextResponse.json({ success: true, orgId: result.id });
    } catch (error: any) {
      console.error('Database error:', error);
      // Handle duplicate email error
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}









