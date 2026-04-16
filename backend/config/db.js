import pkg from 'mysql2/promise';
const { createPool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const db = createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:         parseInt(process.env.DB_PORT  || '3306', 10),
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || 'root',
  database:           process.env.DB_NAME     || 'lumina_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+00:00',
});

export default db;
