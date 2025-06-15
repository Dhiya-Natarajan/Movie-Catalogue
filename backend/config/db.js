import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create the pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'netflix_clone',
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  // max no.of connecitons in the pool
  queueLimit: 0
  // max no.of queued connection requests (0 means unlimited)
});

// Test connection function
export const connectDB = async () => {
  try {
    const connection = await db.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ MySQL connected and ping successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Export the pool directly as default
export default db;
