import { NextResponse } from "next/server";
import { Pool } from 'pg';
import { getCurrentUser } from "@utils/auth";

// Configure PostgreSQL connection
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
});

export async function GET() {
  try {
    const user = getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to the database
    const client = await pool.connect();
    
    try {
      // Get recommendations for the current user
      const result = await client.query(
        `SELECT required_frameworks, recommended_frameworks 
         FROM recommendations 
         WHERE org_id = $1`,
        [user.id]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Recommendations not found' }, { status: 404 });
      }
      
      const recommendations = {
        required: result.rows[0].required_frameworks,
        recommended: result.rows[0].recommended_frameworks
      };
      
      return NextResponse.json(recommendations);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}