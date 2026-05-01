import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { reply: "لم يتم إرسال أي نص" },
        { status: 400 }
      );
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Arabic Document Writer",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
          content: `
أنت كاتب محتوى عربي محترف لمحرر مستندات (Google Docs style).

مهمتك:
اكتب المقال باللغة العربية فقط.

⚠️ مهم جدًا:
- لا تستخدم Markdown (# أو ## أو ###)
- لا تستخدم رموز تنسيق
- اكتب باستخدام HTML فقط

التنسيق المطلوب:
- استخدم <h1> للعنوان الرئيسي
- استخدم <h2> للعناوين الفرعية
- استخدم <p> للفقرات
- استخدم <ul><li> للقوائم

الأسلوب:
- احترافي ومنظم
- مناسب لمستند تعليمي أو رسمي
`,
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    // ✅ تحقق من نجاح الطلب
    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter Error:", errorText);

      return NextResponse.json(
        { reply: "خطأ في الاتصال بـ OpenRouter" },
        { status: 500 }
      );
    }

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      "لم يتم الحصول على رد من الذكاء الاصطناعي";

    return NextResponse.json({ reply });

  } catch (error) {
    console.error("Server Error:", error);

    return NextResponse.json(
      { reply: "حدث خطأ في السيرفر" },
      { status: 500 }
    );
  }
}