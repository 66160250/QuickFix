const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// เช็กว่าเป็น Localhost หรือไม่ (ถ้าเป็น localhost หรือ 127.0.0.1 จะถือว่าเป็น Local)
const dbHost = process.env.DB_HOST || 'localhost';
const isLocal = dbHost === 'localhost' || dbHost === '127.0.0.1';

// เช็กไฟล์ ca.pem และเปิด SSL เฉพาะเมื่อไม่ได้รันบน Localhost
const caPath = path.join(__dirname, 'ca.pem');
const sslOption = (!isLocal && fs.existsSync(caPath)) 
  ? { ca: fs.readFileSync(caPath) } 
  : false;

const pool = mysql.createPool({
    host: dbHost,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'quickfix_db',
    ssl: sslOption, // จะเป็น false ทันทีเมื่อรันบน Localhost (XAMPP)
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();