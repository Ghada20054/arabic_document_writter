import { NextResponse } from "next/server";

process.env.OPENAI_API_KEY = "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";
process.env.OPENAI_BASE_URL = "https://openrouter.ai/api/v1";
process.env.OPENAI_TRACING_ENABLED = "false";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { title: "Untitled Document" },
        { status: 400 }
      );
    }

    const res = await fetch(`${process.env.OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Arabic Document Writer",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          {
            role: "system",
            content: "أعد عنوان قصير فقط (2-6 كلمات) بدون شرح أو علامات تنصيص.",
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