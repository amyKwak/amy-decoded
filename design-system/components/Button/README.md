Big, chunky tavern buttons with a pressed lip; every one is at least `tap-min` (56px) tall.

**You provide:** the label as children, `onClick`, and optionally `variant`, `size`, `block`.

- `primary` (candle-500 with `on-candle` text) is the one main action on a screen: Roll for it, Start the quest, New quest. Never two on one screen.
- `secondary` (oak-700 with an `edge` border) for the second choice: Type my own, New party.
- `danger` (wax-600) only for leaving or ending a quest.
- `ghost` for low-stakes text actions like Skip.
- Use `size="lg"` (64px) and `block` for the screen's main action at the bottom of the column, within thumb reach.
- Labels are short verbs in sentence case: "Roll for it", not "Initiate check" or "ROLL".
- Disabled buttons say what is missing: "Add a hero to start".
