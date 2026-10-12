"use client";

import { useState } from "react";
import { cleanTags } from "@/lib/moody/extract-parse";
import { field, focusRing, pill, pillOn, secondaryBtn } from "./ui";

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
    onChange(
      selected.includes(word)
        ? selected.filter((w) => w !== word)
        : [...selected, word],
    );
  }

  function add() {
    const [word] = cleanTags([draft], 1);
    if (word && !selected.includes(word)) onChange([...selected, word]);
    setDraft("");
  }

  const chip = `${pill} ${focusRing}`;

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
                className={`${chip} ${on ? pillOn : ""}`}
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
              className={`${chip} ${pillOn} gap-1.5`}
            >
              {w} <span aria-hidden="true">×</span>
            </button>
          </li>
        ))}
      </ul>

      <form
        className="mt-3.5 flex gap-2"
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
          className={`${field} min-h-11 min-w-0 flex-1 rounded-full px-4.5 text-[15px]`}
        />
        <button type="submit" disabled={!draft.trim()} className={secondaryBtn}>
          Add
        </button>
      </form>
    </div>
  );
}
