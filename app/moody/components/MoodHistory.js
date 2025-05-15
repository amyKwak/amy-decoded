"use client";

import { useMemo, useCallback } from "react";

const colorMap = {
  1: "bg-blue-100",
  2: "bg-blue-200",
  3: "bg-blue-300",
  4: "bg-blue-400",
  5: "bg-blue-500",
};

export default function MoodHistory({ entries, todayKey }) {
  // Compute last 30 days
  const rawDays = useMemo(() => {
    const [year, month, day] = todayKey.split("-").map(Number);
    const base = new Date(year, month - 1, day);
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date(base);
      date.setDate(base.getDate() - (29 - i));
      const iso = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");
      const label = `${date.getMonth() + 1}/${date.getDate()}`;
      const weekday = daysOfWeek[date.getDay()];
      // Monday-based index 0..6
      const isoWeekdayIndex = (date.getDay() + 6) % 7;
      return { iso, label, weekday, isoWeekdayIndex };
    });
  }, [todayKey]);

  // Pad beginning so first week starts on Monday
  const days = useMemo(() => {
    if (!rawDays.length) return [];
    const firstIndex = rawDays[0].isoWeekdayIndex;
    const padCount = firstIndex; // number of blank days to pad
    const blanks = Array.from({ length: padCount }, () => null);
    return [...blanks, ...rawDays];
  }, [rawDays]);

  // Chunk into weeks
  const weeks = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < days.length; i += 7) {
      chunks.push(days.slice(i, i + 7));
    }
    return chunks;
  }, [days]);

  const handleDayClick = useCallback((iso) => {
    console.log(`clicked ${iso}`);
  }, []);

  const handleWeekClick = useCallback((weekIndex) => {
    console.log(`clicked week ${weekIndex + 1}`);
  }, []);

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Last 30 Days</h2>
      <div className="space-y-2">
        {weeks.map((week, wi) => (
          <div
            key={wi}
            className="flex space-x-2"
            onClick={() => handleWeekClick(wi)}
            style={{ cursor: "pointer" }}
            onMouseEnter={(e) => e.currentTarget.classList.add("bg-gray-200")}
            onMouseLeave={(e) =>
              e.currentTarget.classList.remove("bg-gray-200")
            }
          >
            {week.map((day, di) => {
              if (!day) {
                return <div key={`blank-${di}`} className="w-16 h-16"></div>;
              }
              const entry = entries.find((e) => e.date === day.iso);
              const bgClass = entry ? colorMap[entry.rating] : "bg-gray-100";
              return (
                <div
                  key={day.iso}
                  className={`w-16 h-16 flex flex-col items-center justify-center rounded ${bgClass} hover:bg-gray-200 cursor-pointer`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDayClick(day.iso);
                  }}
                >
                  <div className="text-xs font-semibold">{day.weekday}</div>
                  <div className="text-sm">{day.label}</div>
                  <div className="font-bold">{entry?.rating ?? "–"}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
