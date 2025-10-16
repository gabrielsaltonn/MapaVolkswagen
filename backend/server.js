// server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

// CORS configurado para permitir o GitHub Pages
app.use(cors({
  origin: "https://gabrielsaltonn.github.io",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));

// Para interpretar JSON no corpo das requisições
app.use(express.json());

// Rotas da API
const printersRouter = require("./routes/printers.js");
app.use("/api/impressoras", printersRouter);

// Rota de teste (verifica se o servidor está no ar)
app.get("/", (req, res) => {
  res.send("Servidor funcionando!");
});

//Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
