import { NextResponse } from "next/server";
import { hashPassword, generateToken, setAuthCookie } from "@utils/auth";
import prisma from "@lib/prisma";


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, sector, locations, customerLocations, dataTypes, 
            infra, customerType, orgSize, revenue, recommendations } = body;
    
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
            infrastructure: infra,
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
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}









