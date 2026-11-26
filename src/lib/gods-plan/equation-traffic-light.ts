/**
 * Equation Traffic Light, the third game of the S3 final of The Devil's Plan,
 * the show God's Plan is inspired by.
 *
 * Each player hides a nine-cell equation. Players take turns guessing the
 * other's, and every cell of a guess lights up: green if it's in the right
 * place, yellow if it's in the equation somewhere else, red if it isn't.
 *
 * Rules the host stated: digits 0-9 and + - × ÷ = ^, repeats allowed, the
 * equation must be mathematically valid, no two symbols side by side, a
 * number always follows ^, no leading zero on a single digit, and guesses
 * don't have to be valid. Gaps we filled: exactly one =, the equation starts
 * and ends with a number, no multi-digit number starts with 0 (so "05" is
 * out too), exponents first, then × ÷, then + - (as the players confirmed on
 * the show), and chained exponents read right to left like in math class.
 */

export const CELLS = 9;
export const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;
export const SYMBOLS = ["+", "-", "×", "÷", "^", "="] as const;
export type Tile = (typeof DIGITS)[number] | (typeof SYMBOLS)[number];
export type Light = "green" | "yellow" | "red";

const TILES = new Set<string>([...DIGITS, ...SYMBOLS]);
const isDigit = (t: string) => t >= "0" && t <= "9";

/** Turns typed text into tiles, accepting * and / for × and ÷. */
export function toTiles(text: string): Tile[] {
  return [...text.replace(/\*/g, "×").replace(/\//g, "÷").replace(/\s/g, "")].filter(
    (t): t is Tile => TILES.has(t),
  );
}

// Exact fractions, so 7÷2×2=7 is valid and nothing goes wrong with floats.
// (BigInt() instead of 0n literals, since tsconfig targets ES2017.)
const ZERO = BigInt(0);
const ONE = BigInt(1);
type Q = { n: bigint; d: bigint };
class Unbalanced extends Error {}

const abs = (x: bigint) => (x < ZERO ? -x : x);
const gcd = (a: bigint, b: bigint): bigint => (b === ZERO ? abs(a) : gcd(b, a % b));
const q = (n: bigint, d = ONE): Q => {
  if (d === ZERO) throw new Unbalanced("division by zero");
  if (d < ZERO) [n, d] = [-n, -d];
  const g = gcd(n, d) || ONE;
  return { n: n / g, d: d / g };
};
const add = (a: Q, b: Q) => q(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a: Q, b: Q) => q(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a: Q, b: Q) => q(a.n * b.n, a.d * b.d);
const div = (a: Q, b: Q) => q(a.n * b.d, a.d * b.n);

// Nine cells can't balance anything bigger than 9^99 against anything, so a
// side past this many bits is treated as unequal instead of computed.
const MAX_BITS = 2048;

function pow(base: Q, exp: Q): Q {
  // The exponent is built from digits and ^ only, so it's always a whole
  // number of at least zero.
  if (base.n === ZERO && exp.n === ZERO) throw new Unbalanced("0^0 is undefined");
  const bits = BigInt(base.n.toString(2).length + base.d.toString(2).length);
  if ((abs(base.n) > ONE || base.d > ONE) && bits * exp.n > BigInt(MAX_BITS)) throw new Unbalanced("too big");
  return q(base.n ** exp.n, base.d ** exp.n);
}

type Token = { num: Q } | { op: string };

/** Evaluates one side of the equation, or throws if it can't. */
function evaluate(tokens: Token[]): Q {
  let i = 0;
  const peek = () => tokens[i] as Token | undefined;
  const opIs = (...ops: string[]) => {
    const t = peek();
    return t !== undefined && "op" in t && ops.includes(t.op);
  };
  const number = (): Q => {
    const t = tokens[i++];
    if (!t || !("num" in t)) throw new Unbalanced("expected a number");
    return t.num;
  };
  const power = (): Q => {
    const base = number();
    if (!opIs("^")) return base;
    i++;
    return pow(base, power());
  };
  const term = (): Q => {
    let value = power();
    while (opIs("×", "÷")) {
      const op = (tokens[i++] as { op: string }).op;
      value = op === "×" ? mul(value, power()) : div(value, power());
    }
    return value;
  };
  let value = term();
  while (opIs("+", "-")) {
    const op = (tokens[i++] as { op: string }).op;
    value = op === "+" ? add(value, term()) : sub(value, term());
  }
  if (i !== tokens.length) throw new Unbalanced("leftover tokens");
  return value;
}

export type Check = { ok: true } | { ok: false; reason: string };

/** Whether tiles make a legal hidden equation, with a reason if not. */
export function checkEquation(tiles: readonly string[]): Check {
  const fail = (reason: string): Check => ({ ok: false, reason });

  if (tiles.length !== CELLS) return fail(`Use all ${CELLS} cells.`);
  if (tiles.some((t) => !TILES.has(t))) return fail("Only digits and + - × ÷ ^ = are allowed.");
  if (tiles.filter((t) => t === "=").length !== 1) return fail("Use exactly one =.");
  if (!isDigit(tiles[0]) || !isDigit(tiles[CELLS - 1]))
    return fail("Start and end with a number.");
  for (let i = 1; i < CELLS; i++) {
    if (!isDigit(tiles[i - 1]) && !isDigit(tiles[i]))
      return fail("Two symbols can't sit next to each other.");
  }

  // Split into numbers and operators for each side of the =.
  const sides: Token[][] = [[]];
  let run = "";
  const flush = () => {
    if (!run) return;
    sides[sides.length - 1].push({ num: q(BigInt(run)) });
    run = "";
  };
  for (const t of tiles) {
    if (isDigit(t)) {
      run += t;
      continue;
    }
    if (run.length > 1 && run[0] === "0") return fail("Numbers can't start with 0.");
    flush();
    if (t === "=") sides.push([]);
    else sides[sides.length - 1].push({ op: t });
  }
  if (run.length > 1 && run[0] === "0") return fail("Numbers can't start with 0.");
  flush();

  try {
    const [left, right] = sides.map(evaluate);
    if (left.n !== right.n || left.d !== right.d) return fail("Both sides must be equal.");
  } catch {
    return fail("Both sides must be equal.");
  }
  return { ok: true };
}

/**
 * Lights up each cell of a guess against the hidden equation. Greens go
 * first, then yellows only while the equation still has unmatched copies of
 * that tile, so a tile guessed twice that appears once lights up once.
 */
export function score(secret: readonly string[], guess: readonly string[]): Light[] {
  const lights: Light[] = guess.map(() => "red");
  const left = new Map<string, number>();
  guess.forEach((t, i) => {
    if (t === secret[i]) lights[i] = "green";
    else left.set(secret[i], (left.get(secret[i]) ?? 0) + 1);
  });
  guess.forEach((t, i) => {
    if (lights[i] === "green") return;
    const n = left.get(t) ?? 0;
    if (n > 0) {
      lights[i] = "yellow";
      left.set(t, n - 1);
    }
  });
  return lights;
}

export const isSolved = (lights: readonly Light[]) => lights.every((l) => l === "green");

const OPS = ["+", "+", "-", "-", "×", "×", "÷", "^"];

/**
 * A random valid equation for the computer to hide: an expression with at
 * least one operator, then =, then a number. Keeps trying random shapes
 * until one balances.
 */
export function randomEquation(random: () => number = Math.random): Tile[] {
  const pick = <T>(items: readonly T[]) => items[Math.floor(random() * items.length)];
  const digits = (length: number) =>
    Array.from({ length }, (_, i) => (i === 0 && length > 1 ? pick(DIGITS.slice(1)) : pick(DIGITS)));

  for (let attempt = 0; attempt < 20000; attempt++) {
    const leftLength = 5 + Math.floor(random() * 3); // 5 to 7 cells
    const left: string[] = [];
    while (left.length < leftLength) {
      const room = leftLength - left.length;
      const afterPower = left.at(-1) === "^";
      const length = Math.min(room, afterPower ? 1 : 1 + Math.floor(random() * 2));
      left.push(...digits(length));
      if (leftLength - left.length >= 2) left.push(pick(OPS));
    }
    if (left.every(isDigit)) continue;

    const rightLength = CELLS - 1 - leftLength;
    // Solve for the right side by checking the left against a placeholder.
    const tokens: Token[] = [];
    let run = "";
    for (const t of left) {
      if (isDigit(t)) run += t;
      else {
        tokens.push({ num: q(BigInt(run)) }, { op: t });
        run = "";
      }
    }
    tokens.push({ num: q(BigInt(run)) });
    let value: Q;
    try {
      value = evaluate(tokens);
    } catch {
      continue;
    }
    if (value.d !== ONE || value.n < ZERO) continue;
    const right = value.n.toString();
    if (right.length !== rightLength) continue;

    const tiles = [...left, "=", ...right] as Tile[];
    if (checkEquation(tiles).ok) return tiles;
  }
  return toTiles("12×3+4=40"); // a known valid one, unreachable in practice
}
