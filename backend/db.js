require("dotenv").config();
const mysql = require("mysql2/promise");

const db = mysql.createPool({
  hots: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "printersdb",
  port: process.env.DB_PORT | 3306, 
  waitForConnections: true,
  connectionLimit: 0    
});

(async() => {
  try{
    const conn = await db.getConnection();
    console.log("Conectado ao banco MySQL!");
    await conn.query(`
      CREATE TABLE IF NOT EXISTIS PRINTERS (
        id INT AUTO_INCREMENT PRIMARY KEY,
        model VARCHAR(255),
        serial VARCHAR(255),
        ip VARCHAR(255),
        loc VARCHAR(255),
        col VARCHAR(255),
        notes TEXT,
        backup BOOLEAN,
        photos JSON,
        x FLOAT,
        y float
      );
    `);
    conn.release();
  } catch (err) {
    console.error("Erro ao conectar no MySQL:", err);
  }
})();

module.exports = db;
