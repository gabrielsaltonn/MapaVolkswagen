// db.js
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./printers.db");
const path = require("path");
const dbPath = path.resolve(__dirname, "printers.db");

// cria tabela se não existir
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS printers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT,
    serial TEXT,
    ip TEXT,
    loc TEXT,
    col TEXT,
    notes TEXT,
    backup INTEGER,
    photos TEXT,
    x REAL,
    y REAL
  )`);
});

module.exports = db;
