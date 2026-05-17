import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { title: "Untitled Document" },
        { status: 400 }
      );
    }

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "أعد عنوان قصير فقط (2-6 كلمات) بدون شرح.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await res.json();

    const title =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Untitled Document";

    return NextResponse.json({ title });
  } catch (error) {
    console.error("TITLE API ERROR:", error);

    return NextResponse.json(
      { title: "Untitled Document" },
      { status: 500 }
    );
  }
}