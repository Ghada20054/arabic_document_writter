import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai"
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openrouter("openai/gpt-4o-mini"),

    messages: [
      {
        role: "system",
        content: `
أنت كاتب محتوى عربي محترف.
- اكتب باللغة العربية فقط 100%
- لا تستخدم أي كلمات إنجليزية
- لا تستخدم تنسيق Markdown نهائياً
- لا تستخدم رموز # أو * أو -
- اجعل النص مناسب لمستند رسمي أو تعليمي
- قسمه إلى:
  1) عنوان رئيسي
  2) مقدمة
  3) فقرات منظمة
  4) خاتمة
        `.trim(),
      },

      ...messages,
    ],
  });

  return result.toTextStreamResponse();
}