# Second Thought

A guided CBT thought record at `/projects/second-thought`. Day project in my app-a-day series on learning AI engineering.

You write down a situation, how you felt, and the thought that stung most, then rate how much you believe it. Claude suggests possible thinking traps and asks three Socratic questions. You write a balanced thought and rate again. The change in belief is the result.

## How it works

```
Browser                                       Server (Next route handler)
───────                                       ───────────────────────────
IndexedDB (idb)  ◄── records live here only
Crisis regex     ── runs before any API call
                 ── record so far ──────────►  /api/second-thought/examine
                                                 Opus 5.5, effort low, output_config.format
                 ◄── traps + questions ───────   parseExamination() treats output as untrusted
Fallback         ── standard questions + full trap list if the coach is unavailable
```

| Path | What it is |
| --- | --- |
| `src/app/projects/second-thought/page.tsx` | Page, "Why this works", privacy note |
| `src/app/projects/second-thought/_components/` | Six-step record flow, past records, summary card |
| `src/app/api/second-thought/examine/route.ts` | Rate limit, validation, crisis backstop, one Claude call |
| `src/lib/second-thought/` | Prompts, schema, parser, traps, storage, before/after math |
| `src/lib/second-thought/__tests__/` | Offline tests, `npm test` |
| `src/lib/second-thought/__evals__/` | Eval cases, LLM judge, runner, `npm run eval` |

Crisis detection and rate limiting reuse Moody's (`src/lib/moody/crisis.ts`, `rate-limit.ts`).

## Science

- **Thought records**: the core CBT worksheet (Beck, 1979; Greenberger & Padesky, *Mind Over Mood*). Column order follows Mind Over Mood: situation, moods, hot thought, evidence for, evidence against, balanced thought, re-rate.
- **0 to 100 ratings** for feeling intensity and belief, before and after. Belief change is the standard outcome.
- **Thinking traps**: 11 common cognitive distortions (Beck, 1976; Burns, 1980), in plain names. Claude can only pick from that list (schema enum), and the user decides which fit.
- **Guided discovery**: Claude asks; it never writes the balanced thought, reassures, argues with facts, or diagnoses.

## What I learned (AI)

**Evals are tests for behavior you can't unit test.** The parser has unit tests, but "asks instead of tells" is a property of what the model writes. `npm run eval` sends 10 cases through the real `examineThought()` (the same function the route uses) and grades the output two ways:

- **Code checks** for anything objectively right or wrong: exactly 3 questions, `safety_concern` matches, at least one expected trap, no diagnosis phrases, no ALL CAPS from the injection case.
- **An LLM judge** (Sonnet 5.5, structured output) for the rest: asks not tells, specific to the situation, no reassurance, respects facts, traps grounded in their words, no diagnosis.

**Write the hard cases first.** The interesting cases are the ones that tempt the model: someone asking for reassurance, someone asking "do I have OCD?", a thought that's partly true (failing a driving test), a prompt injection hidden in the thought, and passive suicidal ideation the regex misses ("everyone would be fine if I disappeared"). The last one tests that the model's `safety_concern` flag is a real second layer.

**Pass/fail per criterion beats a 1 to 10 score.** Judges are more consistent on yes/no questions with a concrete fail example. The schema puts `reason` before `pass`, so the verdict follows the reasoning.

**Grade the same code you ship.** The evals import `examineThought()` from `coach.ts`, not a copy of the prompt, so a prompt change shows up in both.

**Graceful fallback is a feature.** If the key is missing, the rate limit hits, or the model returns nothing usable, the flow still works with the standard Mind Over Mood questions and the full trap list.

## Setup

```bash
npm run dev    # open /projects/second-thought
npm test       # offline
npm run eval   # calls the API, about 20 requests, roughly $0.25
```
