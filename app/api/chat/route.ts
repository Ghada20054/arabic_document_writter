import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return new Response("لم يتم إرسال أي نص", { status: 400 });
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
        model: "openai/gpt-4o",
        stream: true, // ✅ IMPORTANT: enable streaming
        messages: [
         {
  role: "system",
  content: `
 

أنت كاتب محتوى عربي محترف لمحرر مستندات (Google Docs style).

🧠 فكر بشكل منطقي قبل الكتابة وقم بتحليل الموضوع داخليًا، ولكن:
❌ لا تعرض التحليل
❌ لا تكتب خطوات التفكير
❌ لا تكتب أي شيء خارج النص النهائي

⚠️ مهم جدًا:
- اكتب الناتج النهائي فقط
- لا تستخدم Markdown
- لا تستخدم أي نص خارج HTML
- لا تكتب [التحليل] أو أي عناوين مشابهة

التنسيق المطلوب:
- <h1> عنوان رئيسي
- <h2> عناوين فرعية
- <p> فقرات
- <ul><li> قوائم

هيكل المقال:
1. عنوان
2. مقدمة
3. فقرات منظمة
4. (اختياري) قائمة
5. خاتمة

الأسلوب:
- احترافي
- واضح
- مترابط


أنت كاتب محتوى عربي محترف لمحرر مستندات (Google Docs style).

🧠 قبل أن تكتب:
- حلل الموضوع أولاً
- حدد الفكرة الرئيسية
- قسم المحتوى إلى أجزاء منطقية
- رتب الأفكار بشكل متسلسل

ثم اكتب الناتج النهائي فقط.

⚠️ مهم جدًا:
- لا تستخدم Markdown (# أو ## أو ###)
- لا تستخدم رموز تنسيق


التنسيق المطلوب:
- استخدم <h1> للعنوان الرئيسي
- استخدم <h2> للعناوين الفرعية
- استخدم <p> للفقرات
- استخدم <ul><li> للقوائم

هيكل المقال:
1. عنوان رئيسي واضح
2. مقدمة قصيرة
3. فقرات مترابطة ومنظمة
4. أمثلة أو نقاط (إن وجدت)
5. خاتمة

الأسلوب:
- احترافي
- واضح
- مترابط
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

    // ✅ Handle API error
    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter Error:", errorText);
      return new Response("خطأ في الاتصال بـ OpenRouter", { status: 500 });
    }

    // ✅ Streaming logic
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();

        if (!reader) {
          controller.close();
          return;
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const json = line.replace("data: ", "").trim();

              if (json === "[DONE]") {
                controller.close();
                return;
              }

              try {
                const parsed = JSON.parse(json);
                const content = parsed?.choices?.[0]?.delta?.content;

                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch (err) {
                console.error("Parse error:", err);
              }
            }
          }
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });

  } catch (error) {
    console.error("Server Error:", error);
    return new Response("حدث خطأ في السيرفر", { status: 500 });
  }
}