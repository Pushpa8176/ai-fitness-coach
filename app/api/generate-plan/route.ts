import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { name, age, goal } = await req.json();

    const prompt = `
    Create a 7-day personalized ${goal} fitness plan for ${name}, aged ${age}.
    Include:
    - Short summary paragraph
    - Workout array (name, sets, reps, rest)
    - Meal array (meal name and food items)
    Return JSON format only — no markdown, no extra text.
    Example:
    {
      "summary": "...",
      "workouts": [{ "name": "...", "sets": 3, "reps": 12, "rest": "60s" }],
      "meals": [{ "meal": "Breakfast", "items": ["Oats", "Eggs", "Banana"] }]
    }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    let content = completion.choices[0].message?.content || "{}";

    // 🧹 Remove markdown formatting if present
    content = content.replace(/```json|```/g, "").trim();

    const plan = JSON.parse(content);

    return NextResponse.json({ plan });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
