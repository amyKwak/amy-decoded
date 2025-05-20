"use client";

import { useState } from "react";

export default function ChatAssistant({ entries }) {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setAnswer("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries, question: query }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || res.statusText);

      setAnswer(json.answer);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Ask a question:</h2>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2"
          placeholder="e.g. Which day was my happiest?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "…" : "Ask"}
        </button>
      </form>
      {error && <p className="mt-2 text-red-600">Error: {error}</p>}
      {answer && <div className="mt-4 whitespace-pre-wrap">{answer}</div>}
    </div>
  );
}
