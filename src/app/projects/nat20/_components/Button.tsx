import type { ButtonHTMLAttributes } from "react";
import { focusRing, press } from "./ui";

const VARIANT = {
  /** The one main action on a screen. */
  primary: `bg-(--candle-500) text-(--on-candle) active:bg-(--candle-600) ${press}`,
  secondary: `bg-(--oak-700) text-(--cream) shadow-[inset_0_0_0_2px_var(--edge),var(--shadow-press)] transition-[translate,box-shadow] duration-80 ease-out active:translate-y-0.5 active:shadow-none motion-reduce:transition-none`,
  /** Only for leaving or ending a quest. */
  danger: `bg-(--wax-600) text-(--on-wax) ${press}`,
  ghost: "bg-transparent text-(--candle-500) underline underline-offset-4",
};

export function Button({
  variant = "primary",
  size,
  block,
  className = "",
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANT;
  /** lg is 64px tall, for the screen's main action at the bottom. */
  size?: "lg";
  block?: boolean;
}) {
  return (
    <button
      type={type}
      className={`button inline-flex cursor-pointer items-center justify-center gap-(--space-2) rounded-(--radius-lg) border-0 px-(--space-5) [-webkit-tap-highlight-color:transparent] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:translate-y-0 ${
        size === "lg" ? "min-h-(--tap-lg) text-[20px]" : "min-h-(--tap-min)"
      } ${block ? "w-full" : ""} ${VARIANT[variant]} ${focusRing} ${className}`}
      {...rest}
    />
  );
}
