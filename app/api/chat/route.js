// app/api/chat/route.js
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { entries, question } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You’re a helpful, kind, and warm assistant analyzing mood entries who applies scientific reasoning based on my entries and gives useful answers.",
        },
        {
          role: "user",
          content: `Here are the mood entries:\n${JSON.stringify(
            entries,
            null,
            2
          )}\n\nQuestion: ${question}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return NextResponse.json({
      answer: response.choices[0].message.content,
    });
  } catch (err) {
    console.error("OpenAI error:", err);
    return NextResponse.json(
      { error: err.message || "OpenAI request failed" },
      { status: 500 }
    );
  }
}
