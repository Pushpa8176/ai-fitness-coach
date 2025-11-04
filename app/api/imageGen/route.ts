import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = (body?.prompt || "").toString().trim();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    // Free placeholder image service — no API keys, no billing.
    const placeholderUrl = `https://placehold.co/1024x768?text=${encodeURIComponent(prompt)}`;

    // Return the placeholder URL so the frontend can open it in a new tab
    return NextResponse.json({ url: placeholderUrl });
  } catch (err) {
    console.error("ImageGen Error:", err);
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
  }
}

// optional: reject GET with helpful message
export async function GET() {
  return NextResponse.json({ error: "Use POST method only" }, { status: 405 });
}
