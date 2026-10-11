"use client";

import { useState } from "react";
import { cleanTags } from "@/lib/moody/extract-parse";
import { focusRing } from "./ui";

/**
 * Emotional granularity (Barrett): the user confirms specific feeling words.
 * Suggestions toggle on and off; the user can add their own.
 */
export function FeelingPicker({
  suggestions,
  selected,
  onChange,
}: {
  suggestions: string[];
  selected: string[];
  onChange: (words: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const custom = selected.filter((w) => !suggestions.includes(w));

  function toggle(word: string) {
    onChange(selected.includes(word) ? selected.filter((w) => w !== word) : [...selected, word]);
  }

  function add() {
    const [word] = cleanTags([draft], 1);
    if (word && !selected.includes(word)) onChange([...selected, word]);
    setDraft("");
  }

  const chip = `rounded-full border px-3.5 py-1.5 text-sm ${focusRing}`;

  return (
    <div>
      <ul className="flex flex-wrap gap-2" aria-label="Suggested feelings">
        {suggestions.map((w) => {
          const on = selected.includes(w);
          return (
            <li key={w}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => toggle(w)}
                className={`${chip} ${on ? "border-moody-ink bg-moody-pink font-bold text-moody-ink" : "border-moody-ink bg-white text-moody-ink hover:bg-moody-pink-pale"}`}
              >
                {w}
              </button>
            </li>
          );
        })}
        {custom.map((w) => (
          <li key={w}>
            <button
              type="button"
              onClick={() => toggle(w)}
              aria-label={`Remove ${w}`}
              className={`${chip} border-moody-ink bg-moody-pink font-bold text-moody-ink`}
            >
              {w} <span aria-hidden="true">×</span>
            </button>
          </li>
        ))}
      </ul>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <label htmlFor="moody-own-word" className="sr-only">
          Add your own feeling word
        </label>
        <input
          id="moody-own-word"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={40}
          placeholder="Add your own word"
          className={`min-w-0 flex-1 rounded-full border-2 border-moody-ink bg-white px-4 py-2 text-sm text-moody-ink placeholder:text-moody-muted ${focusRing}`}
        />
        <button type="submit" disabled={!draft.trim()} className={`rounded-full border-2 border-moody-ink bg-white px-4 py-2 text-sm font-semibold text-moody-ink disabled:opacity-40 ${focusRing}`}>
          Add
        </button>
      </form>
    </div>
  );
}
