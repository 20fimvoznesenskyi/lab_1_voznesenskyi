import express from "express";
import cors from "cors";
import { createClient } from "redis";

const app = express();
app.use(cors()); // для простоти, дозволяємо все

const PORT = process.env.PORT || 8080;
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);
const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS || 10);

const redis = createClient({ socket: { host: REDIS_HOST, port: REDIS_PORT } });
redis.on("error", (err) => console.error("Redis error:", err));
await redis.connect();

app.get("/api/ping", (req, res) => {
  res.json({ ok: true, service: "backend", redisHost: REDIS_HOST });
});

// Демонстраційний кеш: зберігаємо ISO-час на N секунд
app.get("/api/time", async (req, res) => {
  const key = "time:now";
  let value = await redis.get(key);
  let source = "cache";

  if (!value) {
    value = new Date().toISOString();
    await redis.setEx(key, CACHE_TTL_SECONDS, value);
    source = "fresh";
  }
  res.json({ value, source, ttl: CACHE_TTL_SECONDS });
});

// Додатково: лічильник переглядів (кеш/рахунок у Redis)
app.get("/api/hits", async (req, res) => {
  const n = await redis.incr("hits");
  res.json({ hits: n });
});

app.listen(PORT, () => {
  console.log(`Backend listening on :${PORT}`);
});
