import { useId, type ChangeEvent, type InputHTMLAttributes } from "react";
import { focusRing } from "./ui";

/** A wooden text field for hero names, custom quests and custom actions. */
export function TextField({
  label,
  hint,
  multiline,
  value,
  onChange,
  placeholder,
  maxLength,
  id,
  ...rest
}: {
  label?: string;
  hint?: string;
  multiline?: boolean;
  value: string;
  onChange: (value: string) => void;
} & Pick<
  InputHTMLAttributes<HTMLInputElement>,
  "placeholder" | "maxLength" | "id" | "enterKeyHint" | "autoComplete"
>) {
  const auto = useId();
  const fieldId = id ?? auto;
  const hintId = `${fieldId}-hint`;
  const field = {
    id: fieldId,
    value,
    placeholder,
    maxLength,
    "aria-describedby": hint ? hintId : undefined,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    // 18px text keeps phones from zooming on focus.
    className: `min-h-(--tap-min) w-full box-border rounded-(--radius-md) border-2 border-(--edge) bg-(--oak-800) px-(--space-4) py-(--space-3) font-(family-name:--font-ui) text-[18px] leading-[26px] font-semibold text-(--cream) placeholder:text-(--cream-muted) placeholder:opacity-100 ${focusRing}`,
  };
  return (
    <div className="flex flex-col gap-(--space-2) font-(family-name:--font-ui)">
      {label && (
        <label htmlFor={fieldId} className="label text-(--cream)">
          {label}
        </label>
      )}
      {multiline ? (
        <textarea rows={2} {...field} />
      ) : (
        <input autoComplete="off" {...rest} {...field} />
      )}
      {hint && (
        <span id={hintId} className="caption text-(--cream-muted)">
          {hint}
        </span>
      )}
    </div>
  );
}
