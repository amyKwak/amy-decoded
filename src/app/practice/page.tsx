"use client";

import {
  useState,
  useEffect,
  useRef,
  useId,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

// In the search flavor, suggestions are query STRINGS (things you could search
// for), not entities to slot into a field. Selecting one runs a search.
const CORPUS: string[] = [
  "laptop",
  "laptop stand",
  "laptop charger",
  "laptop sleeve",
  "wireless mouse",
  "wireless keyboard",
  "wireless earbuds",
  "mechanical keyboard",
  "keyboard wrist rest",
  "usb c hub",
  "usb c cable",
  "monitor",
  "monitor arm",
  "monitor light bar",
  "webcam",
  "webcam cover",
  "desk mat",
  "desk lamp",
  "standing desk",
  "office chair",
  "chair cushion",
  "noise cancelling headphones",
];

function fetchSuggestions(
  query: string,
  signal: AbortSignal,
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const latency = 200 + Math.random() * 700; // uneven, so the race guard matters
    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      resolve(CORPUS.filter((s) => s.includes(q)).slice(0, 8));
    }, latency);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

type SearchBoxProps = {
  onSearch?: (term: string) => void; // ⟵ FLAVOR: caller runs the search / navigates
};

export default function SearchBox({ onSearch }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]); // ⟵ FLAVOR: empty-state list
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [submitted, setSubmitted] = useState<string | null>(null); // simulates results page

  const debouncedQuery = useDebounce(query, 300);
  const cache = useRef(new Map<string, string[]>());
  const requestId = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const isTyping = query.trim().length > 0;
  // The list currently on screen: suggestions while typing, recents when empty.
  // Keyboard nav and Enter both operate on this unified list.
  const items = isTyping ? suggestions : recent;

  useEffect(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) {
      setSuggestions([]);
      setError(null);
      setLoading(false);
      return;
    }

    const cached = cache.current.get(q);
    if (cached) {
      setSuggestions(cached);
      setError(null);
      setLoading(false);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    const myId = ++requestId.current;
    setLoading(true);
    setError(null);

    fetchSuggestions(q, controller.signal)
      .then((data) => {
        if (myId !== requestId.current) return; // drop stale response
        cache.current.set(q, data);
        setSuggestions(data);
        setActiveIndex(-1);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (myId !== requestId.current) return;
        setError("Something went wrong. Try again.");
      })
      .finally(() => {
        if (myId === requestId.current) setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // ⟵ FLAVOR: the core difference. Selecting doesn't fill a field, it runs a
  // search: record it, close, hand off to the caller (who would navigate).
  function submitSearch(term: string) {
    const t = term.trim();
    if (!t) return;
    setRecent((prev) => [t, ...prev.filter((r) => r !== t)].slice(0, 5));
    setQuery(t);
    setOpen(false);
    setActiveIndex(-1);
    setSubmitted(t);
    onSearch?.(t); // real app: router.push(`/search?q=${encodeURIComponent(t)}`)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setSubmitted(null);
    setOpen(true);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open && e.key === "ArrowDown") {
      setOpen(true);
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        if (items.length === 0) return;
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % items.length);
        break;
      case "ArrowUp":
        if (items.length === 0) return;
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + items.length) % items.length);
        break;
      case "Enter":
        e.preventDefault();
        // ⟵ FLAVOR: if a suggestion is highlighted, search it; otherwise
        // search the raw typed text. Google does exactly this.
        if (activeIndex >= 0) submitSearch(items[activeIndex]);
        else submitSearch(query);
        break;
      case "Escape":
        setOpen(false);
        setActiveIndex(-1);
        break;
    }
  }

  function renderHighlighted(text: string, raw: string) {
    const q = raw.trim();
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (!q || idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark>{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    );
  }

  const showPanel = open && (isTyping || recent.length > 0);

  return (
    <div className="sb" ref={rootRef}>
      <style>{`
        .sb { font-family: ui-sans-serif, system-ui, sans-serif; max-width: 460px; position: relative; }
        .sb__field { display: flex; align-items: center; gap: 9px; padding: 11px 14px;
          border: 1px solid #cbd2dd; border-radius: 999px; background: #fff; }
        .sb__field:focus-within { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.15); }
        .sb__icon { color: #9ca3af; flex: none; }
        .sb__input { border: none; outline: none; font-size: 15px; width: 100%; background: transparent; }
        .sb__panel { position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: #fff;
          border: 1px solid #e5e7eb; border-radius: 14px; box-shadow: 0 8px 24px rgba(0,0,0,.10);
          padding: 6px; z-index: 10; }
        .sb__section { font-size: 12px; color: #9ca3af; padding: 6px 12px 2px; }
        .sb__list { list-style: none; margin: 0; padding: 0; }
        .sb__opt { padding: 9px 12px; font-size: 15px; border-radius: 9px; cursor: pointer;
          display: flex; align-items: center; gap: 9px; }
        .sb__opt--active { background: #eef2ff; }
        .sb__opt mark { background: transparent; color: #4338ca; font-weight: 600; }
        .sb__msg { padding: 10px 12px; font-size: 14px; color: #6b7280; }
        .sb__msg--err { color: #b91c1c; }
        .sb__results { margin-top: 16px; padding: 14px 16px; background: #f9fafb;
          border-radius: 12px; font-size: 14px; color: #374151; }
        .sb__results b { color: #111827; }
      `}</style>

      <div className="sb__field">
        <span className="sb__icon" aria-hidden="true">
          ⌕
        </span>
        <input
          className="sb__input"
          type="text"
          value={query}
          placeholder="Search products…"
          autoComplete="off"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
          }
        />
      </div>

      {showPanel && (
        <div className="sb__panel">
          {isTyping ? (
            <>
              {loading && <div className="sb__msg">Searching…</div>}
              {!loading && error && (
                <div className="sb__msg sb__msg--err">{error}</div>
              )}
              {!loading && !error && suggestions.length === 0 && (
                <div className="sb__msg">No suggestions</div>
              )}
              {!loading && !error && suggestions.length > 0 && (
                <ul className="sb__list" id={listboxId} role="listbox">
                  {suggestions.map((s, i) => (
                    <li
                      key={s}
                      id={`${listboxId}-opt-${i}`}
                      role="option"
                      aria-selected={i === activeIndex}
                      className={`sb__opt${i === activeIndex ? "sb__opt--active" : ""}`}
                      onMouseEnter={() => setActiveIndex(i)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => submitSearch(s)}
                    >
                      <span className="sb__icon" aria-hidden="true">
                        ⌕
                      </span>
                      <span>{renderHighlighted(s, query)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <>
              <div className="sb__section">Recent searches</div>
              <ul className="sb__list" id={listboxId} role="listbox">
                {recent.map((r, i) => (
                  <li
                    key={r}
                    id={`${listboxId}-opt-${i}`}
                    role="option"
                    aria-selected={i === activeIndex}
                    className={`sb__opt${i === activeIndex ? "sb__opt--active" : ""}`}
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => submitSearch(r)}
                  >
                    <span className="sb__icon" aria-hidden="true">
                      ↺
                    </span>
                    {r}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {submitted && (
        <div className="sb__results">
          Showing results for <b>“{submitted}”</b> (in a real app you'd be on
          /search now)
        </div>
      )}
    </div>
  );
}
