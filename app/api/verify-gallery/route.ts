import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const correct = process.env.GALLERY_PASSWORD;

    if (!correct) {
      return NextResponse.json({ error: "Gallery password not configured" }, { status: 500 });
    }

    if (password === correct) {
      return NextResponse.json({ authorized: true });
    } else {
      return NextResponse.json({ authorized: false, error: "Wrong password" });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}