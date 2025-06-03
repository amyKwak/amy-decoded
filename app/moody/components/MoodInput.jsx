"use client";
import { useState } from "react";

const BUTTON_COLORS = {
  1: "bg-[#FFE4C9]",
  2: "bg-[#FFF6BF]",
  3: "bg-[#D3FFDD]",
  4: "bg-[#CDF3FF]",
  5: "bg-[#E4E4FE]",
};

export default function MoodInput({ onSubmit: handleSubmit }) {
  const [rating, setRating] = useState(5);

  const handleChange = (e) => {
    setRating(Number(e.target.value));
  };

  const handleSave = () => {
    handleSubmit(rating, "test");
  };

  return (
    <div className="mx-auto w-100 p-8 bg-white rounded-2xl shadow">
      <h2 className="mb-2.5 text-xl font-semibold">Thankful for:</h2>
      <form className="w-full">
        {[1, 2, 3].map((bullet) => {
          return (
            <div key={bullet} className="h-10 align-center">
              <label>
                {bullet}.
                <input
                  type="text"
                  name={bullet}
                  className="outline-none pl-2"
                />
              </label>
            </div>
          );
        })}
      </form>

      <div className="w-full h-[1px] bg-gray-200 mb-5"></div>

      <h2 className="text-xl font-semibold mb-10">
        How are you feeling today?
      </h2>
      <div className="flex flex-col items-center gap-4">
        <input
          type="range"
          min="1"
          max="10"
          step="0.1"
          value={rating}
          onChange={handleChange}
          className="w-full h-2 bg-gray-300 mb-10 rounded-lg appearance-none cursor-pointer custom-slider"
        />
      </div>

      <button
        type="submit"
        className="rounded bg-blue-500 w-full text-white h-10"
        value="Submit"
        onClick={handleSave}
      >
        Submit
      </button>
    </div>
  );
}
