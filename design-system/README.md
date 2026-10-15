The Lucky Goose is a pass-the-phone fantasy adventure for friends and families, run by an AI game master. It should feel like a candlelit tavern table: warm, cozy, a little silly, and readable by anyone holding the phone. No D&D knowledge needed.

## Voice and copy

The Lucky Goose is the tavern; the game master is its warm barkeep, not a rulebook.

- Short lines. One or two sentences per story line; button labels of one to four words.
- Playful verbs, plain words. "Roll for it", not "Initiate check". "Knocked out", not "Incapacitated". "Who's joining?", not "Configure party".
- Talk to the table as "you". Name the hero whose turn it is: "Mira's turn. What do you do?"
- Sentence case everywhere. Uppercase only in `tag` style (stat and DC tags).
- Never mean, even on a fail. A Natural 1 gets a gentle joke: "Always a miss. It happens to the best of us."
- Only three game words are allowed in the interface: HP, DC and the stat names (STR, DEX, INT, CHA). Each always sits next to a number.
- No emoji in the interface or the story.

Real lines to copy the feel of:

| Moment | Copy |
| --- | --- |
| Party setup | "Gather the party", "What's your hero called?", "+ Add a hero (3 of 4)" |
| Quest board | "Pick a quest", "Or dream up your own quest", "Start the quest" |
| Turn | "Pass the phone to Mira.", "Mira's turn. What do you do?", "Type my own" |
| Roll | "Roll for it", "14 + 3 = 17 vs DC 12", "Success!", "Miss" |
| Natural 20 | "Natural 20!", "Always a success. Everybody cheer!" |
| Victory | "Victory!", "The tavern roars. Drinks are on the house." |
| Defeat | "Defeat", "The party is out cold. The tavern saves your seats." |

## Colour

The whole app sits on dark oak. Anything players read aloud sits on parchment.

- Page background is `oak-900`. Raised panels (party bar, sheets, fields) are `oak-800`; tiles and secondary buttons are `oak-700`.
- Text on wood is `cream`, secondary text `cream-muted`.
- Story lines, choices, quest cards and recaps are `parchment-100` cards with `ink` text and `ink-muted` secondary text. Read lines fade to `parchment-200`.
- `candle-500` is the main action, the active hero, HP fill and success. One candle button per screen.
- `wax-600` (red wax) means danger: low HP, defeat, Natural 1, leaving a quest. `wax-400` for danger text on wood.
- Class colours: `knight` (ember red), `thief` (forest green), `wizard` (arcane blue), `jester` (magenta). Use the plain token as a fill with `on-class` text; use the `-bright` token for text, rings and dots on wood.
- Colour never works alone. Classes always show their name and stat; HP always shows its number; results always say Success! or Miss.
- Every text pair named in a token's usage note meets 4.5:1. Meaningful borders on wood use `edge` (3:1 or better), never `oak-600`.

## Type

Three faces, each with one job. All are free on Google Fonts and load from `components/bundle.css`.

- **Pirata One** (`display`) is the tavern sign. Titles only: `title-xl`, `title-lg`, `title-md` and the `die-number`. Never for sentences or buttons.
- **Alegreya** (`story`) is the storybook. Story lines in `story`, the current line in `story-lead`, older lines and recaps in `story-small`. Never under 17px.
- **Nunito** (`ui`) runs the interface: `button`, `label`, `body`, `caption`, `tag`. Rounded and friendly, easy at a glance.
- Body text on a phone is never under 16px; inputs are 18px so iOS does not zoom.

## Layout and touch

- One centred column, max `screen-max` (440px), side gutter `space-4`.
- Every tappable thing is at least `tap-min` (56px) tall; the screen's main button is `tap-lg` (64px) and sits at the bottom of the column, in thumb reach.
- Stack cards with `space-3`; separate sections with `space-5`.
- Radii: `radius-md` for cards and fields, `radius-lg` for buttons and sheets, `radius-pill` for HP bars and discs, `radius-sm` for tags.
- Parchment cards rest on wood with `shadow-card`. Buttons have the chunky `shadow-press` lip that disappears when pressed.

## Focus and motion

- Focus is a solid 3px `focus` ring (candle-300) offset 3px. It reads on oak and on parchment.
- Motion is quick and bouncy: presses 80ms, the dice tumble about 700ms, story lines stream in letter by letter.
- The Natural 20 is the one big moment: rays, glow, the loudest title on any screen. Add a haptic buzz where the device allows.
- Under `prefers-reduced-motion`, the tumble, rays and caret blink are off and results appear at once.

## Key screens

- **Party setup:** `title-lg` "Gather the party", a list of HeroSlot rows, then a TextField and ClassPicker for the next hero, then the candle "Pick a quest" button.
- **Quest board:** "Pick a quest", 3 to 5 QuestCards, a multiline TextField for a custom quest, then "Start the quest".
- **Story view:** PartyBar pinned at the top, StoryLines scrolling below, then the turn prompt and 2 to 3 ChoiceCards plus "Type my own".
- **Dice roll:** DiceRoll in a sheet over the story, then "Keep going".
- **Endings:** EndScreen with a recap that names every hero.

## Iconography

There is no icon set or logo yet. Set the name in Pirata One as plain type. Heroes are marked by a monogram disc (first letter of their name, in the display face) in their class colour, not by icons. The d20 is drawn as a simple line shape inside DiceRoll.
