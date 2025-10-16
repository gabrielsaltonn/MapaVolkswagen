// db.js
require("dotenv").config();
const mysql = require("mysql2/promise");

// Conexão com o banco de dados MySQL
const db = mysql.createPool({
  host: process.env.MYSQLHOST || "localhost",
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "printersdb",
  database: process.env.MYSQLDATABASE || "railway",
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

// Criar tabela se não existir
(async () => {
  try {
    const conn = await db.getConnection();
    console.log("Conectado ao banco MySQL!");

    await conn.query(`
      CREATE TABLE IF NOT EXISTS printers (
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
        y FLOAT
      );
    `);

    conn.release();
  } catch (err) {
    console.error("Erro ao conectar no MySQL:", err);
  }
})();

module.exports = db;
