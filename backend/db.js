// db.js
require("dotenv").config();
const mysql = require("mysql2/promise");

//  Detecta ambiente (local ou Render/Railway)
const isProduction = process.env.NODE_ENV === "production";

//  Usa as variáveis certas conforme o ambiente
const dbConfig = {
  host: process.env.MYSQLHOST ||
        (isProduction ? "caboose.proxy.rlwy.net" : "localhost"),
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "printersdb",
  database: process.env.MYSQLDATABASE || "railway",
  port: process.env.MYSQLPORT ||
        (isProduction ? 57362 : 3306),
  waitForConnections: true,
  connectionLimit: 10,
};

//  Cria pool de conexões
const db = mysql.createPool(dbConfig);

//Testa conexão ao iniciar
(async () => {
  try {
    const conn = await db.getConnection();
    console.log("✅ Conectado ao banco MySQL!");
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
    console.error("❌ Erro ao conectar no MySQL:", err);
  }
})();

module.exports = db;
