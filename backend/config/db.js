import pkg from 'pg';
const { Pool } = pkg;

const db = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'lumina_db1',
    password: 'root', 
    port: 5432,
    max: 10, 
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

export default db;