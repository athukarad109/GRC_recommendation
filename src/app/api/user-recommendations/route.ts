import { NextResponse } from "next/server";
import { getCurrentUser } from "@utils/auth";
import prisma from "@lib/prisma";


export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    try {
      // Get recommendations for the current user
      const recommendation = await prisma.recommendation.findFirst({
        where: { orgId: user.id },
      });
      
      if (!recommendation) {
        return NextResponse.json({ error: 'Recommendations not found' }, { status: 404 });
      }
      
      return NextResponse.json({
        required: recommendation.requiredFrameworks,
        recommended: recommendation.recommendedFrameworks,
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



