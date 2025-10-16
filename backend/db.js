// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Configuração CORS completa
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // permite qualquer origem (ou restrinja se quiser)
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  
  // responde pré-requisições (preflight)
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Middleware padrão
app.use(express.json());

// Rotas
const printersRouter = require("./routes/printers.js");
app.use("/api/impressoras", printersRouter);

// Rota principal
app.get("/", (req, res) => {
  res.send("Servidor funcionando! ✅");
});

// Inicializa servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
