import { useEffect, useState } from "react";
import MoodInput from "./MoodInput";
import MoodHistory from "./MoodHistory";
import MoodDetails from "./MoodDetails";

export default function MoodyApp() {
  const STORAGE_KEY = "moody-entries";

  const [entries, setEntries] = useState([]);
  const [todayKey, setTodayKey] = useState("");
  const [hasToday, setHasToday] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [selectedDate, setSelectedDate] = useState(null);
  const [details, setDetails] = useState("");
  const [rating, setRating] = useState(null);
  const [emoji, setEmoji] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  // On mount, load entries and today’s key
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

  // When you click a day, preload its details
  useEffect(() => {
    if (!selectedDate) return;
    const e = entries.find((e) => e.date === selectedDate) || {};
    setRating(e.rating || null);
    setEmoji(e.emoji || "");
    setTitle(e.title || "");
    setNote(e.note || "");
  }, [selectedDate, entries]);

  if (!mounted) return null;

  // Submit today’s rating
  const handleSubmit = (rating) => {
    const newEntry = { date: todayKey, rating };
    const updated = [...entries.filter((e) => e.date !== todayKey), newEntry];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setEntries(updated);
    setHasToday(true);
  };

  // Emoji picker callback: save and close
  const handleEmojiClick = (emojiData /*, event */) => {
    const newEmoji = emojiData.emoji;
    setEmoji(newEmoji);

    const updated = entries.map((en) =>
      en.date === selectedDate ? { ...en, emoji: newEmoji } : en
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setEntries(updated);
    setShowPicker(false);
  };

  // Save title & note
  const handleSaveDetails = () => {
    const updated = entries.map((en) =>
      en.date === selectedDate ? { ...en, emoji, title, note } : en
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setEntries(updated);
  };

  const handleSaveRating = (rating) => {
    const updated = entries.map((en) =>
      en.date === selectedDate ? { ...en, rating } : en
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setEntries(updated);
  };

  const handleCloseDetails = () => {
    setSelectedDate(null);
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
            <MoodDetails
              selectedDate={selectedDate}
              details={details}
              title={title}
              emoji={emoji}
              onCloseDetails={handleCloseDetails}
              note={note}
              showPicker={showPicker}
              rating={rating}
              togglePicker={setShowPicker}
              onEmojiClick={handleEmojiClick}
              onTitleChange={(e) => setTitle(e.target.value)}
              onNoteChange={(e) => setNote(e.target.value)}
              onRatingChange={(rating) => handleSaveRating(rating)}
              onSave={handleSaveDetails}
            />
          )}
        </>
      )}
    </div>
  );
}
