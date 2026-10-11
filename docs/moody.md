# Moody

A mood journal at `/projects/moody`. Day project in my app-a-day series on learning AI engineering.

You rate your own mood on an Affect Grid, log sleep, and optionally journal. Claude suggests specific feeling words, and "Ask Moody" answers questions about your entries by calling tools that run in your browser.

## How it works

```
Browser                                         Server (Next route handlers)
───────                                         ────────────────────────────
IndexedDB (idb)  ◄── entries live here only
Crisis regex     ── runs before any API call
                 ── journal ─────────────────►  /api/moody/extract
                                                  Haiku 5.5, ONE tool, forced via tool_choice
                 ◄── parsed + validated tags ──   parseExtraction() treats output as untrusted
Agent loop       ── messages ────────────────►  /api/moody/ask  (thin proxy)
  runs tools     ◄── content + stop_reason ───    adds system prompt + tools, calls Sonnet 5.5
  locally, sends
  tool_results back, max 6 steps
```

| Path | What it is |
| --- | --- |
| `src/app/projects/moody/page.tsx` | Page, "How Moody measures mood", privacy note |
| `src/app/projects/moody/_components/` | Affect Grid, check-in flow, history, Ask Moody (the agent loop), answer card |
| `src/lib/moody/answer.ts` | Answer schema, parser, quote verification, stat lookup |
| `src/app/api/moody/extract/route.ts` | Forced tool use for structured extraction |
| `src/app/api/moody/ask/route.ts` | One step of the agent loop |
| `src/lib/moody/` | Pure logic: crisis check, PHQ-4, stats, tools, parser, rate limit, demo data |
| `src/lib/moody/__tests__/` | Offline tests, `npm test` |

## Design

Quicksand, with a palette sampled from Burnt Toast Creative's work: soft pastels, black outlines, pill shapes. The quadrant colors are a slightly deeper step of that palette, with a truer red for the distressed quadrant. Pastels fail contrast against white on their own, so every colored mark has an ink outline and a text label.

## Measurement

Mood is always self-reported. Claude never assigns a score.

- **Affect Grid** (Russell, Weiss & Mendelsohn, 1989): 9x9, valence and arousal stored as 1 to 9.
- **Consensus Sleep Diary** (Carney et al., 2012): hours slept and quality, very poor to very good.
- **Emotional granularity** (Barrett): Claude suggests 3 to 5 words that fit the quadrant and entry; I pick, remove, or add my own.
- **PHQ-4** (Kroenke et al., 2009): optional, at most weekly. Total bands 0-2 normal, 3-5 mild, 6-8 moderate, 9-12 severe; a subscale of 3 or more is flagged. Shown as a screening signal with a nudge to see a clinician when elevated.

## Safety and public-site protection

- Crisis regex runs on journal text and questions before any network call (and again on the server). Shows 988, Crisis Text Line, and 911. The extraction model also returns `safety_concern`.
- Rate limits: extraction 20/hour per IP. Ask: 20 new questions/hour plus 120 total calls/hour per IP, since one question can take up to 6 calls.
  - These are in-memory, so on Vercel each server instance has its own counter. Good enough to stop casual abuse; **the real backstop is a monthly spend limit in the Anthropic console.**
- Input caps: journal 2,000 chars, question 500 chars, conversation 150 KB, max 60 messages.
- The Ask proxy only accepts short questions and tool results in user turns, so it can't be used as a free general-purpose Claude endpoint.
- Missing key: routes return a clear 503. If extraction fails, the check-in still saves with starter words for that quadrant.

## Setup

```bash
cp .env.example .env.local   # then paste your key
npm run dev                  # open /projects/moody, click "Load 30 days of sample data"
npm test
```

On Vercel, add `ANTHROPIC_API_KEY` under Project Settings, Environment Variables.

## What I learned (AI)

**Tool use is just a contract.** A "tool" is a name, a description, and a JSON Schema. The model doesn't run anything. It returns a `tool_use` block saying "call this with these arguments," and my code decides what happens. That's why I could run Moody's tools in the browser while the model call happens on the server.

**Forced tool use is structured output.** For extraction I gave Haiku exactly one tool, `record_entry`, whose `input_schema` is the shape I want back, and set `tool_choice` to that tool. The model has to fill in the schema. Nothing ever "executes" `record_entry`; the tool input is the answer. (Newer Sonnet and Opus models reject forced `tool_choice`. For those you'd use `auto` plus `strict: true`, or structured outputs. Haiku 5.5 still accepts it.)

**Model output is untrusted input.** Even with a schema, I parse it like form data from a stranger: check types, lowercase and dedupe tags, cap lengths, strip markup. The journal goes inside `<entry>` tags with an instruction that it's data, not commands, which is a basic prompt-injection defense. The parser is a pure function, so it's easy to test.

**The agent loop is a while loop.** The API is stateless. Each call returns a `stop_reason`:
- `tool_use`: run every requested tool, send all results back in one user message as `tool_result` blocks (matched by `tool_use_id`), call again.
- `end_turn`: done, show the text.

I capped it at 6 calls. On the last one the server sets `tool_choice: none`, so Claude has to answer with what it has instead of hanging mid-lookup. Errors from a tool go back as `is_error: true` so the model can recover instead of crashing the loop.

**Where the loop runs is an architecture decision.** I put it in the browser because the data lives in IndexedDB. The server is a thin proxy that adds the system prompt and tool definitions, so a visitor can't swap them out, and it holds the API key. The model only sees the entries it asks for, in a compact format with short keys and truncated journals to save tokens.

**Structured answers, but the numbers come from code.** Ask Moody's final reply uses `output_config.format` (a JSON schema), and tool calls still work during the loop. The schema asks for a headline, up to 3 findings, quotes, a confidence level, and one suggestion, so the UI can show a summary card instead of a wall of text. Two checks keep it honest:
- A finding doesn't contain numbers. It points at a stat (`metric`, `group_by`, `key`), and the browser draws the bar from its own `get_stats` results.
- Every quote is checked against that day's journal, and anything the model paraphrased or made up is dropped.

The model decides what matters. Code decides what's true.

**Keep math in code.** LLMs are bad at arithmetic and great at explaining. `get_stats` computes means, n, and difference from the overall average, and flags groups with fewer than 3 points as `reliable: false`. The system prompt says to use tools instead of guessing, cite dates and my own words, call out thin data, and never diagnose.

**Safety is layered.**
- A cheap, deterministic regex runs first, so help shows up instantly and doesn't depend on a network call.
- The model's `safety_concern` flag catches things the regex misses.
- The regex is tested against idioms like "this deadline is killing me" so it doesn't cry wolf.
