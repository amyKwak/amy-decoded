The party's HP at a glance, pinned to the top of the story view.

**You provide:** `heroes`: `{ name, heroClass, hp, maxHp?, active? }` for 1 to 4 heroes.

- HP bars fill with `candle-500`; at 3 HP or less they turn `wax-600` and the number turns `wax-400`.
- The number is always shown ("8/10 HP"), so the bar never relies on colour alone.
- At 0 the hero dims and reads "Knocked out".
- The hero whose turn it is gets a candle border and `aria-current`.
