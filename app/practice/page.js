"use client";
import React, { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

// Assume you already have this:
async function fetchProducts({ query, category, page }) {
  const params = new URLSearchParams({ query, category, page: String(page) });
  const res = await fetch(`/api/products?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json(); // expected: { items: Product[], total: number }
}

function expensiveScore(p, q) {
  // Intentionally heavy-ish CPU work to simulate real render cost
  let score = 0;
  const s = (p.name + p.description).toLowerCase();
  const qq = q.toLowerCase();
  for (let i = 0; i < 400; i++) {
    score += s.includes(qq) ? 1 : 0;
  }
  return score + (p.price % 7);
}

export default function ProductsBad() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);

  const renderCount = useRef(0);
  renderCount.current += 1;
  console.log("ProductsBad renders:", renderCount.current);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["products", { query, category, page }],
    queryFn: () => fetchProducts({ query, category, page }),
  });

  const items = data?.items ?? [];

  // ❌ BAD: compute-heavy filtering/sorting in render for every keystroke
  const filteredAndSorted = items
    .filter((p) => {
      if (!query) return true;
      return (p.name + p.description)
        .toLowerCase()
        .includes(query.toLowerCase());
    })
    .map((p) => ({ p, score: expensiveScore(p, query) }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);

  return (
    <div style={{ padding: 16 }}>
      <h2>Products (Bad)</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {/* ❌ BAD: controlled input drives expensive rerender + recompute every keystroke */}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          style={{ padding: 8, width: 320 }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: 8 }}
        >
          <option value="all">all</option>
          <option value="food">food</option>
          <option value="toys">toys</option>
        </select>

        <button
          onClick={() => setPage(page + 1)} // ❌ inline handler
          style={{ padding: "8px 12px" }}
        >
          Next page
        </button>
      </div>

      {isLoading ? <div>Loading…</div> : null}
      {isFetching ? <div>Fetching…</div> : null}

      {/* ❌ BAD: render everything */}
      <div>
        {filteredAndSorted.map((p) => (
          <div
            key={p.id}
            style={{
              borderBottom: "1px solid #eee",
              padding: 12,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{p.description}</div>
            </div>

            {/* ❌ inline handler and inline object props everywhere */}
            <button
              onClick={() => console.log("Add to cart", p.id)}
              style={{ padding: "6px 10px" }}
            >
              Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
