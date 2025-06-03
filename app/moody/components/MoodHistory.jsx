"use client";

import { useMemo, useCallback } from "react";

const colorMap = {
  1: "bg-[#FFE4C9]",
  2: "bg-[#FFF6BF]",
  3: "bg-[#D3FFDD]",
  4: "bg-[#CDF3FF]",
  5: "bg-[#E4E4FE]",
};

export default function MoodHistory({ entries, todayKey, onDayClick }) {
  // Compute last 30 days with Monday as first day
  const rawDays = useMemo(() => {
    const [year, month, day] = todayKey.split("-").map(Number);
    const base = new Date(year, month - 1, day);
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date(base);
      date.setDate(base.getDate() - (29 - i));
      const iso = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");
      const label = `${date.getMonth() + 1}/${date.getDate()}`;
      const isoWeekdayIndex = (date.getDay() + 6) % 7; // Monday=0
      return { iso, label, isoWeekdayIndex };
    });
  }, [todayKey]);

  // Pad first week to start on Monday
  const days = useMemo(() => {
    if (!rawDays.length) return [];
    const blanks = Array.from(
      { length: rawDays[0].isoWeekdayIndex },
      () => null
    );
    return [...blanks, ...rawDays];
  }, [rawDays]);

  // Group into weeks
  const weeks = useMemo(() => {
    const arr = [];
    for (let i = 0; i < days.length; i += 7) {
      arr.push(days.slice(i, i + 7));
    }
    return arr;
  }, [days]);

  const handleDayClickInternal = useCallback(
    (iso) => {
      console.log(`clicked ${iso}`);
      onDayClick?.(iso);
    },
    [onDayClick]
  );

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Last 30 Days</h2>

      {/* Weekday labels */}
      <div className="flex space-x-2 mb-2">
        {weekdays.map((d) => (
          <div
            key={d}
            className="w-16 h-6 flex items-center justify-center text-xs font-semibold"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-2">
        {weeks.map((week, wi) => (
          <div
            key={wi}
            className="flex space-x-2"
            style={{ cursor: "pointer" }}
            onMouseLeave={(e) =>
              e.currentTarget.classList.remove("bg-gray-200")
            }
          >
            {week.map((day, di) => {
              if (!day) {
                return (
                  <div key={`blank-${di}`} className="w-16 aspect-square" />
                );
              }
              const entry = entries.find((e) => e.date === day.iso);

              const getColorKey = (rating) => {
                if (rating <= 2) return 1;
                if (rating <= 4) return 2;
                if (rating <= 6) return 3;
                if (rating <= 8) return 4;
                return 5;
              };

              const bgClass = entry
                ? colorMap[getColorKey(entry.rating)]
                : "bg-gray-100";
              return (
                <div
                  key={day.iso}
                  className={`w-16 aspect-square flex flex-col items-center justify-start pt-1 rounded ${bgClass} hover:bg-gray-200 cursor-pointer`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDayClickInternal(day.iso);
                  }}
                >
                  <div className="text-sm text-center w-full text-gray-500">
                    {day.label}
                  </div>

                  <div className="flex gap-1">
                    <h3 className="font-semibold text-lg">{entry?.rating}</h3>
                  </div>

                  <div className="text-lg mt-1 text-center w-full"></div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
