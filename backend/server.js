import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import aulasRouter from './routes/aulas.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'PlataformaCentroEducativo')));
app.use('/api/aulas', aulasRouter);

app.use((req, res) => res.status(404).json({ error: 'No encontrado' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));