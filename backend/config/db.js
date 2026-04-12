import mysql from 'mysql2/promise';

const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',        
  password: 'root',    
  database: 'lumina_db1'
});

export default db;
