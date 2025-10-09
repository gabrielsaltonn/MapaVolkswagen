// server.js
require('dotenv').config();


const express = require('express');
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const printersRouter = require("./routes/printers.js");
app.use("/api/impressoras", printersRouter);

// Rota para a página inicial
app.get('/', (req, res) => {
    res.send('Servidor funcionando! ✅');
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
