import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

export async function POST(req: Request) {
  const { videoUrl } = await req.json();

  const output = await replicate.run("catid/pose-resnet:latest", {
    input: { video: videoUrl },
  });

  return NextResponse.json({ analysis: output });
}
