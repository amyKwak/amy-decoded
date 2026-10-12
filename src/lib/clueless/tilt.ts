/**
 * Turning phone tilt into game moves. The phone is held on your forehead with
 * the screen facing out (straight up and down). Tilting it so the screen faces
 * the floor (a nod down) scores a point; tilting it so the screen faces the
 * ceiling passes, like Heads Up.
 */

export type Move = "correct" | "pass";

/** How far (in degrees) the screen has to turn from upright to count as a move. */
export const TRIGGER_DEG = 40;
/** How close to upright it has to come back before the next move counts. */
export const RESET_DEG = 20;

/**
 * The screen's angle above the horizon, from a deviceorientation event's beta
 * and gamma: 0 when the screen is upright, +90 facing the ceiling, -90 facing
 * the floor. It's the vertical part of the screen's normal, cos(beta)·cos(gamma),
 * so it reads the same whichever way the phone is turned sideways.
 */
export function screenElevation(beta: number, gamma: number): number {
  const rad = Math.PI / 180;
  const z = Math.cos(beta * rad) * Math.cos(gamma * rad);
  return Math.asin(Math.max(-1, Math.min(1, z))) / rad;
}

export type TiltState = {
  /** True once the phone is back near upright, so the next tilt counts. */
  armed: boolean;
};

/**
 * One step of the tilt detector. A tilt only counts when the phone was
 * upright before it, so holding it tilted doesn't fire over and over.
 */
export function readTilt(
  state: TiltState,
  beta: number,
  gamma: number,
): { state: TiltState; move: Move | null } {
  const elevation = screenElevation(beta, gamma);
  if (Math.abs(elevation) < RESET_DEG) {
    return { state: { armed: true }, move: null };
  }
  if (state.armed && Math.abs(elevation) > TRIGGER_DEG) {
    return {
      state: { armed: false },
      move: elevation < 0 ? "correct" : "pass",
    };
  }
  return { state, move: null };
}
