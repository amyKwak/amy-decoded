"use client";
import React, { useState, useEffect } from "react";

const STORAGE_KEY = "gratitudeAppEntries";

// Helper: get the most recent Sunday at midnight
function getThisSunday() {
  const now = new Date();
  const day = now.getDay(); // Sunday = 0
  const diff = day;
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - diff);
  sunday.setHours(0, 0, 0, 0);
  return sunday;
}

function App() {
  const [entries, setEntries] = useState({});
  const [items, setItems] = useState(["", "", "", "", ""]);
  const [rating, setRating] = useState(5.0);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const thisSunday = getThisSunday().toISOString();
  const unlocked = new Date() >= new Date(thisSunday);
  const submittedThisWeek = entries[thisSunday] !== undefined;

  const handleItemChange = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleSubmit = () => {
    if (items.some((item) => item.trim() === "")) {
      alert("Please fill in all 5 gratitude items.");
      return;
    }
    const roundedRating = parseFloat(rating.toFixed(1));
    const updated = {
      ...entries,
      [thisSunday]: { items, rating: roundedRating },
    };
    setEntries(updated);
  };

  const entryWeeks = Object.keys(entries).sort(
    (a, b) => new Date(b) - new Date(a)
  );
  const last10 = entryWeeks.slice(0, 10);
  const weeksRemaining = Math.max(0, 10 - entryWeeks.length);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-4">Weekly Gratitude Challenge</h1>
        {!unlocked && (
          <p className="text-center">
            Come back Sunday at 12:00 AM to unlock this week&apos;s gratitude
            entry.
          </p>
        )}
        {unlocked && !submittedThisWeek && (
          <div>
            <h2 className="font-semibold mb-2">
              Write 5 things you&apos;re grateful for:
            </h2>
            {items.map((itm, idx) => (
              <input
                key={idx}
                type="text"
                value={itm}
                onChange={(e) => handleItemChange(idx, e.target.value)}
                placeholder={`Gratitude #${idx + 1}`}
                className="w-full border rounded-xl p-2 mb-2"
              />
            ))}
            <div className="my-4">
              <label className="block mb-1">
                How happy are you today? (0.0–10.0):{" "}
                <span className="font-semibold">{rating.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none bg-gray-200"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600"
            >
              Submit
            </button>
          </div>
        )}
        {submittedThisWeek && (
          <div>
            <p className="mb-4">
              Great job! You&apos;ve submitted for this week.
            </p>
            <h2 className="font-semibold mb-2">Last {last10.length} Weeks</h2>
            <ul className="list-disc list-inside mb-4">
              {last10.map((weekKey) => {
                const { items, rating } = entries[weekKey];
                const date = new Date(weekKey).toLocaleDateString();
                return (
                  <li key={weekKey} className="mb-2">
                    <span className="font-medium">{date}</span>:{" "}
                    {items.join(", ")} (Happiness: {rating.toFixed(1)})
                  </li>
                );
              })}
            </ul>
            {weeksRemaining > 0 && (
              <p>
                {weeksRemaining} {weeksRemaining === 1 ? "week" : "weeks"}{" "}
                remaining in 10-week challenge.
              </p>
            )}
            {weeksRemaining === 0 && (
              <p>🎉 You&apos;ve completed the 10-week challenge! 🎉</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
