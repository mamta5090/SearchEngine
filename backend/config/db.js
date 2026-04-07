import pkg from 'pg';
const { Pool } = pkg;

const db = new Pool({
    user: process.env.MYSQL_USER,
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_DATABASE,
    password: process.env.MYSQL_PASSWORD, 
    port: process.env.MYSQL_PORT,
    max: 10, 
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

export default db;