import { recordShift } from "@/lib/second-thought/shift";
import { trapById } from "@/lib/second-thought/traps";
import type { ThoughtRecord } from "@/lib/second-thought/types";
import { label } from "./ui";

function Bar({ value, tone }: { value: number; tone: "before" | "after" }) {
  return (
    <div className="bg-st-track h-2.5 flex-1 overflow-hidden rounded-full">
      <div
        className={`h-full rounded-full ${tone === "before" ? "bg-st-peach" : "bg-st-accent"}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function BeforeAfter({ name, before, after }: { name: string; before: number; after: number }) {
  const change = after - before;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[15px]">
        <span className="font-semibold">{name}</span>
        <span className="text-st-muted tabular-nums">
          {before} → <strong className="text-st-ink">{after}</strong>
          <span className="sr-only">
            {change === 0 ? ", no change" : `, ${change < 0 ? "down" : "up"} ${Math.abs(change)}`}
          </span>
        </span>
      </div>
      <div className="space-y-1" aria-hidden="true">
        <div className="flex items-center gap-2">
          <span className="text-st-muted w-12 text-xs">Before</span>
          <Bar value={before} tone="before" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-st-muted w-12 text-xs">After</span>
          <Bar value={after} tone="after" />
        </div>
      </div>
    </div>
  );
}

/** A finished record: the thought, how belief and feelings moved, and the balanced thought. */
export function RecordSummary({ record }: { record: ThoughtRecord }) {
  const shift = recordShift(record);
  return (
    <div className="space-y-5">
      <div>
        <p className={`${label} mb-1.5`}>Hot thought</p>
        <p className="font-(family-name:--font-fraunces) text-lg leading-snug italic">
          &ldquo;{record.thought}&rdquo;
        </p>
      </div>

      {(shift.belief || shift.feelings.length > 0) && (
        <div className="space-y-4">
          {shift.belief && (
            <BeforeAfter name="Belief in the thought" before={shift.belief.before} after={shift.belief.after} />
          )}
          {shift.feelings.map((f) => (
            <BeforeAfter key={f.name} name={f.name[0].toUpperCase() + f.name.slice(1)} before={f.before} after={f.after} />
          ))}
        </div>
      )}

      {record.traps.length > 0 && (
        <div>
          <p className={`${label} mb-2`}>Thinking traps you spotted</p>
          <ul className="flex flex-wrap gap-2">
            {record.traps.map((id) => (
              <li key={id} className="bg-st-accent-soft rounded-full px-3.5 py-1.5 text-sm font-semibold">
                {trapById(id).name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {record.balanced && (
        <div className="bg-st-mint-pale rounded-2xl px-4.5 py-4">
          <p className={`${label} text-st-mint-ink mb-1.5`}>Balanced thought</p>
          <p className="text-[16px] leading-relaxed">{record.balanced}</p>
        </div>
      )}
    </div>
  );
}
