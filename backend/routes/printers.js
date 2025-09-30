// routes/printers.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// GET - listar todas impressoras
router.get("/", (req, res) => {
  db.all("SELECT * FROM printers", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    rows.forEach(r => r.photos = JSON.parse(r.photos || "[]"));
    res.json(rows);
  });
});

// POST - criar impressora
router.post("/", (req, res) => {
  const { model, serial, ip, loc, col, notes, backup, photos, x, y } = req.body;
  db.run(
    `INSERT INTO printers (model, serial, ip, loc, col, notes, backup, photos, x, y)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [model, serial, ip, loc, col, notes, backup ? 1 : 0, JSON.stringify(photos || []), x, y],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      // retorna o objeto salvo com ID + dados corretos
      res.json({
        id: this.lastID,
        model,
        serial,
        ip,
        loc,
        col,
        notes,
        backup: backup ? true : false,
        photos: photos || [],
        x,
        y
      });
    }
  );
});

// PUT - atualizar impressora
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const fields = req.body;
  const updates = Object.keys(fields).map(k => `${k} = ?`).join(", ");
  const values = Object.values(fields);
  if (fields.photos) {
    values[values.indexOf(fields.photos)] = JSON.stringify(fields.photos);
  }
  db.run(`UPDATE printers SET ${updates} WHERE id = ?`, [...values, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, ...fields });
  });
});

// DELETE - remover impressora
router.delete("/:id", (req, res) => {
  db.run("DELETE FROM printers WHERE id = ?", req.params.id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// DELETE em massa
router.post("/bulk-delete", (req, res) => {
  const { ids } = req.body;
  if (!ids || !ids.length) return res.json({ deleted: 0 });
  const placeholders = ids.map(() => "?").join(",");
  db.run(`DELETE FROM printers WHERE id IN (${placeholders})`, ids, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
