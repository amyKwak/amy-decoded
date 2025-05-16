import { useEffect, useState } from "react";
import MoodInput from "./MoodInput";
import MoodHistory from "./MoodHistory";
import Picker from "emoji-picker-react";

export default function MoodyApp() {
  const STORAGE_KEY = "moody-entries";

  const [entries, setEntries] = useState([]);
  const [todayKey, setTodayKey] = useState("");
  const [hasToday, setHasToday] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [selectedDate, setSelectedDate] = useState(null);
  const [emoji, setEmoji] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  // load on mount
  useEffect(() => {
    setMounted(true);
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

  // preload details
  useEffect(() => {
    if (!selectedDate) return;
    const e = entries.find((e) => e.date === selectedDate) || {};
    setEmoji(e.emoji || "");
    setTitle(e.title || "");
    setNote(e.note || "");
  }, [selectedDate, entries]);

  if (!mounted) return null;

  // submit today's rating
  const handleSubmit = (rating) => {
    const newEntry = { date: todayKey, rating };
    const updated = [...entries.filter((e) => e.date !== todayKey), newEntry];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setEntries(updated);
    setHasToday(true);
  };

  // update emoji state and close picker
  const onEmojiClick = (emojiData /*, event */) => {
    setEmoji(emojiData.emoji);
    setShowPicker(false);
  };

  // save emoji + title + note together
  const handleSaveDetails = () => {
    const updated = entries.map((en) =>
      en.date === selectedDate ? { ...en, emoji, title, note } : en
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setEntries(updated);
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
        <>
          <MoodHistory
            entries={entries}
            todayKey={todayKey}
            onDayClick={(iso) => setSelectedDate(iso)}
          />

          {selectedDate && (
            <div className="relative mt-4 p-4 bg-white rounded shadow max-w-lg mx-auto space-y-4">
              <h3 className="text-lg font-semibold">
                Details for {selectedDate}
              </h3>

              {/* emoji picker button */}
              <button
                className={`text-2xl p-2 rounded ${emoji ? "" : "bg-gray-200"}`}
                onClick={() => setShowPicker((v) => !v)}
              >
                {emoji || "😊"}
              </button>

              {showPicker && (
                <div className="absolute z-50 mt-2">
                  <Picker onEmojiClick={onEmojiClick} />
                </div>
              )}

              {/* title & note inputs */}
              <input
                className="w-full border rounded p-2"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="w-full border rounded p-2"
                rows={3}
                placeholder="Note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

              {/* Save all details */}
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleSaveDetails}
              >
                Save
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
