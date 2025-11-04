import { NextResponse } from "next/server";

export async function GET() {
  const openaiKey = process.env.OPENAI_API_KEY;
  const elevenKey = process.env.ELEVENLABS_API_KEY;

  if (openaiKey && elevenKey) {
    return NextResponse.json({
      message: "✅ Environment variables found!",
    });
  } else {
    return NextResponse.json({
      message: "❌ Missing environment variables",
      openai: !!openaiKey,
      elevenlabs: !!elevenKey,
    });
  }
}
