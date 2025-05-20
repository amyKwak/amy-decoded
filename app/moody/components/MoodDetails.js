"use client";

import { useState, useEffect, useRef } from "react";
import Picker from "emoji-picker-react";

const BUTTON_COLORS = {
  1: "bg-[#FFE4C9]",
  2: "bg-[#FFF6BF]",
  3: "bg-[#D3FFDD]",
  4: "bg-[#CDF3FF]",
  5: "bg-[#E4E4FE]",
};

const MoodInput = ({ setEditingRating, onSave, onRatingChange }) => {
  return (
    <div className="flex justify-between max-w-xs">
      {[1, 2, 3, 4, 5].map((n) => {
        const submitRating = () => {
          onRatingChange(n);
          setEditingRating(false);
        };

        return (
          <button
            key={n}
            onClick={submitRating}
            className={`
      w-14 h-14 rounded-full text-lg font-medium cursor-pointer
      ${BUTTON_COLORS[n]}
    `}
          ></button>
        );
      })}
    </div>
  );
};

export default function MoodDetails({
  onEmojiClick,
  onNoteChange,
  onSave,
  onTitleChange,
  title,
  note,
  emoji,
  rating,
  selectedDate,
  onRatingChange,
  showPicker,
  togglePicker,
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [editingRating, setEditingRating] = useState(false);

  const titleRef = useRef(null);
  const noteRef = useRef(null);
  const containerRef = useRef(null);

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

  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        showPicker &&
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        togglePicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker, togglePicker]);

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
    <div
      ref={containerRef}
      className="relative mt-4 p-4 bg-white rounded shadow max-w-lg mx-auto space-y-4"
    >
      <h3 className="text-lg font-semibold">Details for {selectedDate}</h3>

      {/* Rating */}
      {rating && !editingRating ? (
        <>
          <button
            className={`
              mr-4
              h-[48px]
              w-[40px]
              rounded
              cursor-pointer
              ${BUTTON_COLORS[rating] ?? "bg-gray-100"}
            `}
            onClick={() => setEditingRating(true)}
          />
        </>
      ) : (
        <MoodInput
          onRatingChange={onRatingChange}
          setEditingRating={setEditingRating}
          onSave={onSave}
        />
      )}

      {/* Emoji picker button */}
      <div>
        <button
          className={`
          h-[48px]
          w-[40px]
          text-2xl
          rounded
          ${emoji ? "" : "bg-gray-100"}
        `}
          onClick={() => togglePicker((v) => !v)}
        >
          {emoji || "❓"}
        </button>
      </div>

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
