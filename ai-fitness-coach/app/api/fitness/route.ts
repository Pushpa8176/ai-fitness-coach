import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // 🔥 Send the dynamic prompt to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or "gpt-3.5-turbo" if you prefer
      messages: [
        {
          role: "system",
          content:
            "You are an AI fitness coach that creates personalized 7-day fitness and diet plans in clear bullet points.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
    });

    const message = completion.choices[0].message?.content || "No response received.";

    return NextResponse.json({ message });
  } catch (error: any) {
    console.error("Error generating plan:", error);
    return NextResponse.json(
      { message: "Error generating fitness plan." },
      { status: 500 }
    );
  }
}
