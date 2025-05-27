import { NextResponse } from "next/server";
import { Pool } from 'pg';
import { hashPassword, generateToken, setAuthCookie } from "@utils/auth";

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
    const body = await req.json();
    const { name, email, password, sector, locations, customerLocations, dataTypes, 
            infra, customerType, orgSize, revenue, recommendations } = body;
    
    // Hash the password
    const hashedPassword = await hashPassword(password);
    
    // Connect to the database
    const client = await pool.connect();
    
    try {
      // Begin transaction
      await client.query('BEGIN');
      
      // Insert organization data with password
      const orgResult = await client.query(
        `INSERT INTO organizations (name, email, password, sector, locations, customer_locations, 
                                   data_types, infrastructure, customer_type, org_size, revenue)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id`,
        [name, email, hashedPassword, JSON.stringify(sector), JSON.stringify(locations), 
         JSON.stringify(customerLocations), JSON.stringify(dataTypes), 
         JSON.stringify(infra), customerType, orgSize, revenue]
      );
      
      const orgId = orgResult.rows[0].id;
      
      // Insert recommendations
      await client.query(
        `INSERT INTO recommendations (org_id, required_frameworks, recommended_frameworks)
         VALUES ($1, $2, $3)`,
        [orgId, JSON.stringify(recommendations.required), JSON.stringify(recommendations.recommended)]
      );
      
      // Commit transaction
      await client.query('COMMIT');
      
      // Generate JWT token
      const token = generateToken({ id: orgId, email, name });
      
      // Set auth cookie
      setAuthCookie(token);
      
      return NextResponse.json({ success: true, orgId });
    } catch (error) {
      // Rollback in case of error
      await client.query('ROLLBACK');
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
