import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const API = import.meta.env.VITE_API_URL || "http://localhost:8081";

function App() {
  const [time, setTime] = useState(null);
  const [source, setSource] = useState(null);
  const [hits, setHits] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTime = async () => {
    setLoading(true);
    const r = await fetch(`${API}/api/time`);
    const j = await r.json();
    setTime(j.value);
    setSource(j.source);
    setLoading(false);
  };

  const fetchHits = async () => {
    const r = await fetch(`${API}/api/hits`);
    const j = await r.json();
    setHits(j.hits);
  };

  useEffect(() => {
    fetchTime();
    fetchHits();
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 720, margin: "40px auto" }}>
      <h1>React → Backend → Redis</h1>
      <p>
        <strong>API:</strong> {API}
      </p>

      <section style={{ padding: "12px 0" }}>
        <h3>Кешований час</h3>
        <p>
          {loading ? "Завантаження..." : time ? `${time}` : "—"}
          {source && !loading ? ` (source: ${source})` : ""}
        </p>
        <button onClick={fetchTime}>Оновити час</button>
      </section>

      <section style={{ padding: "12px 0" }}>
        <h3>Лічильник хітів (Redis INCR)</h3>
        <p>hits: {hits ?? "—"}</p>
        <button onClick={fetchHits}>+1</button>
      </section>

      <hr/>
      <small>Перевір: при швидких оновленнях час деякий час приходить із cache.</small>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
