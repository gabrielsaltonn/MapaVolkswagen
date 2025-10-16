// routes/printers.js (versão MySQL)
const express = require("express");
const router = express.Router();
const db = require("../db.js");

// GET - listar todas impressoras
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM printers");
    rows.forEach(r => r.photos = JSON.parse(r.photos || "[]"));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - criar impressora
router.post("/", async (req, res) => {
  try {
    const { model, serial, ip, loc, col, notes, backup, photos, x, y } = req.body;
    const [result] = await db.query(
      `INSERT INTO printers (model, serial, ip, loc, col, notes, backup, photos, x, y)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [model, serial, ip, loc, col, notes, backup ? 1 : 0, JSON.stringify(photos || []), x, y]
    );
    res.json({ id: result.insertId, model, serial, ip, loc, col, notes, backup: !!backup, photos, x, y });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - atualizar impressora
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const fields = req.body;
    const updates = Object.keys(fields).map(k => `${k} = ?`).join(", ");
    const values = Object.values(fields);
    if (fields.photos) {
      values[values.indexOf(fields.photos)] = JSON.stringify(fields.photos);
    }
    await db.query(`UPDATE printers SET ${updates} WHERE id = ?`, [...values, id]);
    res.json({ id, ...fields });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - remover impressora
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM printers WHERE id = ?", [req.params.id]);
    res.json({ deleted: result.affectedRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE em massa
router.post("/bulk-delete", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !ids.length) return res.json({ deleted: 0 });
    const placeholders = ids.map(() => "?").join(",");
    const [result] = await db.query(`DELETE FROM printers WHERE id IN (${placeholders})`, ids);
    res.json({ deleted: result.affectedRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verificação de senha
router.post("/check-password", (req, res) => {
  const { password } = req.body;
  const correct = process.env.ADMIN_PASSWORD;
  if (password === correct) {
    return res.json({ valid: true });
  } else {
    return res.status(401).json({ valid: false });
  }
});

module.exports = router;