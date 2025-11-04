import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const eleven = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    // ✅ Proper call syntax: voiceId first, then request object
    const response = await eleven.textToSpeech.convert(
      "pMsXgVXv3BLzUgSXRplE", // Rachel’s voice ID
      {
        text,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128",
      }
    );

    // ✅ Convert ReadableStream to Buffer
    const reader = response.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }

    const buffer = Buffer.concat(chunks);

    return new Response(buffer, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (error) {
    console.error("Error generating voice:", error);
    return new Response("Error generating voice", { status: 500 });
  }
}
