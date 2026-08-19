const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// เช็กว่ามีไฟล์ ca.pem ในโฟลเดอร์หลักหรือไม่
const caPath = path.join(__dirname, 'ca.pem');
const sslOption = fs.existsSync(caPath) 
  ? { ca: fs.readFileSync(caPath) } 
  : false;

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'quickfix_db',
    ssl: process.env.DB_HOST ? sslOption : false, // ถ้าใช้ Cloud DB (มี DB_HOST) จะเปิดใช้งาน SSL
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();