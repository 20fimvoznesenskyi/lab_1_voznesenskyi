import express from "express";
import fetch from "node-fetch";
import pkg from "pg";
const { Pool } = pkg;

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const LOGGER_URL = process.env.LOGGER_URL;

const pool = new Pool({
  host: process.env.PGHOST || "db",
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || "appdb",
  user: process.env.PGUSER || "appuser",
  password: process.env.PGPASSWORD || "apppass",
});

// Ініціалізація таблиці
async function init() {
  await pool.query(`
    create table if not exists users (
      id serial primary key,
      name text not null,
      created_at timestamptz not null default now()
    );
  `);
  console.log("DB ready");
}
init().catch(err => {
  console.error("DB init error:", err);
  process.exit(1);
});

// Хелсчек
app.get("/health", (req, res) => res.json({ ok: true }));

// Створити користувача (запис у БД + лог у logger)
app.post("/api/users", async (req, res) => {
  try {
    const name = (req.body?.name || "Anonymous").toString();
    const ins = await pool.query(
      "insert into users(name) values($1) returning id, name, created_at",
      [name]
    );
    // неблокуючий лог (без await)
    fetch(LOGGER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level: "info",
        message: `User created: ${name}`,
        meta: ins.rows[0],
      }),
    }).catch(() => {});
    res.status(201).json(ins.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "insert_failed" });
  }
});

// Перелік користувачів
app.get("/api/users", async (req, res) => {
  const rs = await pool.query("select * from users order by id desc");
  res.json(rs.rows);
});

app.listen(PORT, () => console.log(`API listening on :${PORT}`));
