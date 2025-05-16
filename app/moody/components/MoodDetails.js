"use client";

import { useState, useEffect, useRef } from "react";
import Picker from "emoji-picker-react";

export default function MoodDetails({
  selectedDate,
  emoji,
  title,
  note,
  showPicker,
  togglePicker,
  onEmojiClick,
  onTitleChange,
  onNoteChange,
  onSave,
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const titleRef = useRef(null);
  const noteRef = useRef(null);

  // Focus inputs when editing starts
  useEffect(() => {
    if (editingTitle) titleRef.current?.focus();
  }, [editingTitle]);
  useEffect(() => {
    if (editingNote) noteRef.current?.focus();
  }, [editingNote]);

  // Close editors when date changes
  useEffect(() => {
    setEditingTitle(false);
    setEditingNote(false);
  }, [selectedDate]);

  const finishTitle = () => {
    setEditingTitle(false);
    onSave();
  };
  const finishNote = () => {
    setEditingNote(false);
    onSave();
  };

  const handleTitleKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.blur();
    }
  };
  const handleNoteKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.blur();
    }
  };

  return (
    <div className="relative mt-4 p-4 bg-white rounded shadow max-w-lg mx-auto space-y-4">
      <h3 className="text-lg font-semibold">Details for {selectedDate}</h3>

      {/* Emoji picker button */}
      <button
        className={`text-2xl p-2 rounded ${emoji ? "" : "bg-gray-100"}`}
        onClick={() => togglePicker((v) => !v)}
      >
        {emoji || "❓"}
      </button>
      {showPicker && (
        <div className="absolute z-50 mt-2">
          <Picker onEmojiClick={onEmojiClick} />
        </div>
      )}

      {/* Title (click to edit) */}
      {editingTitle ? (
        <input
          ref={titleRef}
          className="w-full border rounded p-2 focus:outline-none focus:ring-0"
          value={title}
          onChange={onTitleChange}
          onBlur={finishTitle}
          onKeyDown={handleTitleKey}
          placeholder="Title"
        />
      ) : (
        <div
          className={`w-full p-2 cursor-text ${title ? "" : "text-gray-400"}`}
          onClick={() => setEditingTitle(true)}
        >
          {title || "Title"}
        </div>
      )}

      {/* Note (click to edit) */}
      {editingNote ? (
        <textarea
          ref={noteRef}
          className="w-full border rounded p-2 focus:outline-none focus:ring-0"
          value={note}
          onChange={onNoteChange}
          onBlur={finishNote}
          onKeyDown={handleNoteKey}
          rows={3}
          placeholder="Notes"
        />
      ) : (
        <div
          className={`w-full p-2 h-20 cursor-text ${
            note ? "" : "text-gray-400"
          }`}
          onClick={() => setEditingNote(true)}
        >
          {note || "Notes"}
        </div>
      )}
    </div>
  );
}
