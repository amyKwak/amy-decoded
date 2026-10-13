A 2 by 2 grid of class tiles for choosing a hero's class during party setup.

**You provide:** `value`, `onChange(heroClass)`, and `showBlurb` on the first hero (so new players learn what each class does).

- Tiles are radio buttons: arrow keys and screen readers work as a group.
- The selected tile fills with its class colour and gets a ring in the `-bright` token.
- Each tile shows the bonus plainly: "+3 CHA". No other stats on screen.
