import express from "express";
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 9000;

app.get("/health", (req, res) => res.json({ ok: true }));

// Проста приймальна логів
app.post("/log", (req, res) => {
  const { level = "info", message = "", meta = {} } = req.body || {};
  const stamp = new Date().toISOString();
  // Логуємо у stdout — docker збере їх як логи контейнера
  console.log(`[${stamp}] [${level.toUpperCase()}] ${message} ${JSON.stringify(meta)}`);
  res.status(204).end();
});

app.listen(PORT, () => console.log(`Logger listening on :${PORT}`));
