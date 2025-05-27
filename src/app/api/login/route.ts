import { NextResponse } from "next/server";
import { Pool } from 'pg';
import { comparePasswords, generateToken, setAuthCookie } from "@utils/auth";

// Configure PostgreSQL connection
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
});

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    // Connect to the database
    const client = await pool.connect();
    
    try {
      // Find organization by email
      const result = await client.query(
        `SELECT id, name, email, password FROM organizations WHERE email = $1`,
        [email]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      
      const org = result.rows[0];
      
      // Verify password
      const isPasswordValid = await comparePasswords(password, org.password);
      
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      
      // Generate JWT token
      const token = generateToken({ id: org.id, email: org.email, name: org.name });
      
      // Set auth cookie
      setAuthCookie(token);
      
      return NextResponse.json({ success: true, orgId: org.id });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}