import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey =
      process.env.OPENROUTER_API_KEY ||
      process.env.OPENAI_API_KEY ||
      "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";

    const systemInstruction = {
      role: "system",
      content: `
      أنت كاتب مقالات وبحوث أكاديمية محترف باللغة العربية.
      
      التعليمات الصارمة:
      1. جميع الردود يجب أن تكون باللغة العربية الفصحى 100%.
      2. يمنع منعاً باتاً طباعة أفكارك الداخلية أو التفكير باللغة الإنجليزية.
      3. نسّق المخرجات باستخدام وسوم HTML النظيفة فقط (مثل <h1>, <h2>, <p>, <ul>, <li>).
     تنبيه هام جداً: اكتب جميع النصوص والمصطلحات باللغة العربية الفصحى فقط، ويمنع منعاً باتاً استخدام أي رموز أو حروف صينية أو بلغات أخرى
      `,
    };

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Arabic Document Writer",
        },
        body: JSON.stringify({
          model: "openrouter/free", // الموديل المجاني المطلوب
          messages: [systemInstruction, ...messages],
          stream: true,
          reasoning: { effort: "none" }, // طلب تعطيل إرسال التفكير الداخلي
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return new NextResponse(errorText, { status: response.status });
    }

    // 💡 فلترة الـ SSE Stream لتسليم النص الصافي فقط ومنع طباعة الـ JSON أو Processing
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = decoder.decode(chunk, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          const trimmed = line.trim();
          
          // إهمال رسائل الـ Processing والأسطر الفارغة
          if (!trimmed || trimmed.startsWith(":") || trimmed.includes("OPENROUTER PROCESSING")) {
            continue;
          }

          if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.replace("data: ", "");
            if (dataStr === "[DONE]") continue;

            try {
              const json = JSON.parse(dataStr);
              // قراءة المحتوى الفعلي فقط واستبعاد الـ reasoning
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(encoder.encode(content));
              }
            } catch (e) {
              // تجاوز الأجزاء غير المكتملة
            }
          }
        }
      },
    });

    return new Response(response.body?.pipeThrough(transformStream), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("API Chat Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}