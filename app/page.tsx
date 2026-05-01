"use client";

import React, { useState, useRef } from 'react';

export default function GeminiCanvasUI() {
  const [inputText, setInputText] = useState("");
  const [docTitle, setDocTitle] = useState("Basic Arabic Phrases");
const editorRef = useRef<HTMLDivElement | null>(null);
  // Helper to apply formatting to the document
 const applyFormat = (command: string, value: string | null = null) => {
  editorRef.current?.focus();

  // 👇 Heading 1
  if (command === 'h1') {
    document.execCommand('fontSize', false, '6'); // حجم كبير
    document.execCommand('bold');
    return;
  }

  // 👇 Heading 2
  if (command === 'h2') {
    document.execCommand('fontSize', false, '5');
    document.execCommand('bold');
    return;
  }

  // 👇 Paragraph (يرجع طبيعي)
  if (command === 'p') {
    document.execCommand('removeFormat');
    document.execCommand('fontSize', false, '3');
    return;
  }

document.execCommand(command, false, value ?? undefined);};

  // Function for the "Create" button - Starts a fresh document
  const handleCreateNew = () => {
    if (window.confirm("Start a new document? Current changes will be cleared.")) {
      if (editorRef.current) {
        editorRef.current.innerHTML = "<h1>Untitled Document</h1><p>Start writing...</p>";
        setDocTitle("Untitled Document");
      }
    }
  };

  // Function to download the document as a file
  const downloadDocument = () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const sendToAI = async (message: string) =>  {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();

    return data.reply;
  } catch (error) {
    console.error("AI Error:", error);
    return "حدث خطأ في الاتصال بالذكاء الاصطناعي";
  }
};

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();

    const prompt = inputText;
    setInputText("");

    if (!prompt.trim()) return;

    // 🧠 إرسال طلب عام لأي موضوع
    const aiText = await sendToAI(
      `
أنت كاتب محتوى عربي محترف.

اكتب مقالًا داخل مستند حول الموضوع التالي:
"${prompt}"

الشروط:
- اكتب باللغة العربية فقط 100%
- لا تستخدم أي كلمات إنجليزية
- اجعل النص مناسب لمستند رسمي أو تعليمي
- قسمه إلى:
  1) عنوان رئيسي
  2) مقدمة
  3) فقرات منظمة
  4) خاتمة
- استخدم تنسيق جميل وسهل القراءة
      `
    );

    // ✨ كتابة داخل المستند مباشرة
    if (editorRef.current) {
  editorRef.current.innerHTML = aiText;
}
  }
};

  return (
    <div className="flex flex-col h-screen bg-white text-[#1f1f1f] font-sans overflow-hidden">
      
      {/* TOP GLOBAL NAVBAR */}
      <nav className="h-14 border-b border-zinc-200 flex items-center justify-between px-4 bg-white z-50">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-zinc-100 rounded-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
          <span className="text-xl font-medium text-zinc-700">Gemini</span>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* LEFT PANEL: CHAT */}
   {/* LEFT PANEL: CHAT */}
<section className="w-[38%] flex flex-col border-r border-zinc-200 relative bg-white">
  <div className="flex-1 overflow-y-auto p-6 space-y-8">
    {/* تم حذف الرسالة السابقة وزر Try again وتم الإبقاء فقط على استجابة الذكاء الاصطناعي الأساسية */}
    <div className="flex gap-4">
      <div className="mt-1 text-blue-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/>
        </svg>
      </div>
      <div className="flex-1 space-y-4">
        <p className="text-[15px] leading-relaxed">
          أهلاً بك! سأقوم بكتابة نص احترافي باللغة العربية حول الموضوع الذي تطلبه، وسأنسق الملف داخل المحرر مباشرة ليسهل عليك تعديله أو تحميله.
        </p>
        
        {/* ملف المحتوى الصغير */}
        <div className="bg-[#f0f4f8] rounded-2xl p-4 flex items-center justify-between border border-zinc-100 max-w-[320px]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                 <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>
               </svg>
            </div>
            <div>
              <p className="text-sm font-medium">{docTitle}</p>
              <p className="text-[10px] text-zinc-500 uppercase">جاري العمل الآن</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* مدخل النص السفلي (Input Area) */}
  <div className="p-4 bg-white">
    {/* ... يبقى كما هو في الكود الأصلي لديك ... */}
    <div className="bg-[#f0f4f9] rounded-[32px] p-4 flex flex-col gap-2 border border-transparent focus-within:border-zinc-300 transition-all shadow-sm">
      <textarea 
        className="bg-transparent border-none focus:ring-0 w-full resize-none min-h-[60px] text-zinc-700"
        placeholder="اكتب موضوعك هنا..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-zinc-200 rounded-full text-zinc-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
        <div className="flex items-center gap-3 text-zinc-500">
          <button className="p-2 hover:bg-zinc-200 rounded-full">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><path d="M12 19v4M8 23h8"/></svg>
          </button>
        </div>
      </div>
    </div>
    <p className="text-[11px] text-center text-zinc-400 mt-2">Gemini is AI and can make mistakes.</p>
  </div>
</section>

        {/* RIGHT PANEL: CANVAS EDITOR */}
        <section className="flex-1 bg-[#f8f9fa] flex flex-col overflow-hidden relative">
          {/* EDITOR TOOLBAR */}
          <div className="h-14 border-b border-zinc-200 bg-white flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <svg className="text-zinc-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
              <span className="text-sm font-medium">{docTitle}</span>
              <div className="flex items-center gap-1 ml-4 border-l pl-4 border-zinc-200">
                <button onClick={() => applyFormat('undo')} className="p-1.5 hover:bg-zinc-100 rounded text-zinc-500"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 14 4 9l5-5M15 4l5 5-5 5"/></svg></button>
                <div className="h-4 w-px bg-zinc-200 mx-1"></div>
                
                {/* Heading 1 Button (Functional) */}
               <select 
  onChange={(e) => applyFormat(e.target.value)}
  className="bg-transparent text-sm text-zinc-600 hover:bg-zinc-100 px-2 py-1 rounded outline-none border-none cursor-pointer"
>
  <option value="p">Paragraph</option>
  <option value="h1">Heading 1</option>
  <option value="h2">Heading 2</option>
</select>

                <div className="h-4 w-px bg-zinc-200 mx-1"></div>
                <button onClick={() => applyFormat('bold')} className="p-1.5 font-bold hover:bg-zinc-100 rounded w-8">B</button>
                <button onClick={() => applyFormat('italic')} className="p-1.5 italic hover:bg-zinc-100 rounded w-8 font-serif text-lg">I</button>
                <button onClick={() => applyFormat('insertUnorderedList')} className="p-1.5 hover:bg-zinc-100 rounded"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg></button>
                <button onClick={() => applyFormat('removeFormat')} className="p-1.5 hover:bg-zinc-100 rounded text-zinc-400">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.5 19L19 17.5L6.5 5L5 6.5L17.5 19Z"/><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => window.print()} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg></button>
              <button className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></button>
              
              {/* Create Button (Functional) */}
              <div className="flex overflow-hidden rounded-full border border-blue-200">
                <button 
                  onClick={handleCreateNew}
                  className="bg-blue-50 text-blue-700 px-4 py-1.5 text-sm font-semibold border-r border-blue-200 hover:bg-blue-100 transition"
                >
                  Create
                </button>
                <button className="bg-blue-50 text-blue-700 px-2 py-1.5 hover:bg-blue-100"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6"/></svg></button>
              </div>
            </div>
          </div>

          {/* DOCUMENT BODY */}
          <div className="flex-1 overflow-y-auto pt-8 pb-20 px-4 flex justify-center">
            <div 
              ref={editorRef}
className="w-full max-w-[1000px] bg-white min-h-[3000px] p-16 shadow-sm border border-zinc-200 rounded-sm outline-none break-words whitespace-pre-wrap"
style={{ direction: "rtl", textAlign: "right" }}              contentEditable="true" 
              suppressContentEditableWarning={true}
              onBlur={(e) => {
                const firstTag = e.currentTarget.firstChild;

if (
  firstTag &&
  firstTag instanceof HTMLElement &&
  (firstTag.nodeName === "H1" || firstTag.nodeName === "H2")
) {
  setDocTitle(firstTag.innerText);
}
              }}
            >
              
            </div>
          </div>

          {/* FLOATING ACTION SIDEBAR */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 bg-white p-2 rounded-2xl border border-zinc-200 shadow-xl z-10">
              <button onClick={() => applyFormat('hiliteColor', 'yellow')} className="p-2.5 hover:bg-zinc-100 rounded-xl text-zinc-500" title="Highlight">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m13.5 6.5 4 4M21 4.5l-3-3L5 14l-2 7 7-2z"/></svg>
              </button>
              <button onClick={() => { const url = prompt("Enter URL:"); if(url) applyFormat('createLink', url); }} className="p-2.5 hover:bg-zinc-100 rounded-xl text-zinc-500" title="Add Link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <div className="h-px bg-zinc-100 mx-1"></div>
              <button onClick={downloadDocument} className="p-2.5 hover:bg-zinc-100 rounded-xl text-zinc-500" title="Download Document">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              </button>
          </div>
        </section>
      </main>
    </div>
  );
}