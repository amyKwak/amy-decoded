import { useEffect, useState } from "react";
import MoodInput from "./MoodInput";
import MoodHistory from "./MoodHistory";

export default function MoodyApp() {
  const STORAGE_KEY = "moody-entries";
  const [entries, setEntries] = useState([]);
  const [todayKey, setTodayKey] = useState("");
  const [hasToday, setHasToday] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // build a local YYYY-MM-DD string
    const key = new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    setTodayKey(key);

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    setEntries(stored);
    setHasToday(stored.some((e) => e.date === key));
  }, []);

  if (!mounted) return null;

  const handleSubmit = (rating) => {
    const newEntry = { date: todayKey, rating };
    const updated = [...entries.filter((e) => e.date !== todayKey), newEntry];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setEntries(updated);
    setHasToday(true);
  };

  return (
    <div
      className={`min-h-screen bg-gray-50 ${
        !hasToday ? "flex items-center justify-center" : "py-10"
      }`}
    >
      {!hasToday ? (
        <MoodInput onSubmit={handleSubmit} />
      ) : (
        <MoodHistory entries={entries} todayKey={todayKey} />
      )}
    </div>
  );
}
