import { useState } from "react";

const BUTTON_COLORS = {
  1: "bg-[#FFE4C9]",
  2: "bg-[#FFF6BF]",
  3: "bg-[#D3FFDD]",
  4: "bg-[#CDF3FF]",
  5: "bg-[#E4E4FE]",
};

export default function MoodInput({ onSubmit }) {
  const [rating, setRating] = useState(null);

  return (
    <div className="mx-auto p-8 bg-white rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-4">How are you feeling today?</h2>
      <div className="flex justify-between gap-4">
        {[1, 2, 3, 4, 5].map((n) => {
          const submitRating = () => {
            onSubmit(n);
          };

          return (
            <button
              key={n}
              onClick={submitRating}
              className={`
              w-16 h-16 rounded-full text-lg font-medium cursor-pointer
              ${rating === n ? "bg-blue-500 text-white" : `${BUTTON_COLORS[n]}`}
            `}
            ></button>
          );
        })}
      </div>
    </div>
  );
}
