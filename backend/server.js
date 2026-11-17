const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api/estado", (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log("Servidor en http://localhost:" + PORT);
});

app.get("/", (req, res) => {
  res.send("Funciona el servidor");
});