"use client";

import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { useCallback, useEffect, useState, useRef } from "react";
import TiptapEditor from "@/components/TiptapEditor"; 
import { Sparkles, RefreshCw, FileText, Bold, Italic, Heading1 } from "lucide-react";
import { marked } from "marked";

export default function GeminiCanvasUI() {
  const [editorContent, setEditorContent] = useState("");
  const [inputText, setInputText] = useState("");
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [docTitle, setDocTitle] = useState("");
  const [isReasoning, setIsReasoning] = useState(false);
  const [reasoningContent, setReasoningContent] = useState("");
  const [reasoningTokens, setReasoningTokens] = useState<string[]>([]);
  const [reasoningIndex, setReasoningIndex] = useState(0);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [showDocuments, setShowDocuments] = useState(false);

  useEffect(() => {
    const loadDocuments = async () => {
      const res = await fetch("/api/documents");
      const data = await res.json();
      setDocuments(data);
    };

    loadDocuments();
  }, []);

  const handleContextualAI = async (
    action: "expand" | "summarize" | "rewrite" | "autocomplete",
    selectedText: string,
    insertResult: (text: string) => void
  ) => {
    if (!selectedText && action !== "autocomplete") return;

    setIsReasoning(true);
    startReasoning("جاري معالجة النص باستخدام أدوات الذكاء الاصطناعي...");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: action,
          messages: [{ role: "user", content: selectedText || "أكمل كتابة الفقرة التالية بشكل متناسق ومحترف" }],
        }),
      });

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullReplacement = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        fullReplacement += decoder.decode(value, { stream: true });
        
        const cleanHtml = marked.parse(fullReplacement);
        insertResult(cleanHtml as string);
      }
    } catch (error) {
      console.error("AI Contextual Action Error:", error);
    } finally {
      setIsReasoning(false);
      setReasoningContent("");
      saveCurrentDocument(docTitle, chatMessages);
    }
  };

  const chunkIntoTokens = (text: string) => {
    const chunks: string[] = [];
    let i = 0;

    while (i < text.length) {
      const size = Math.floor(Math.random() * 2) + 3;
      chunks.push(text.slice(i, i + size));
      i += size;
    }

    return chunks;
  };

  const startReasoning = (text: string) => {
    const tokens = chunkIntoTokens(text);
    setReasoningTokens(tokens);
    setReasoningContent("");
    setReasoningIndex(0);
    setIsReasoning(true);
  };

  const reasoningSteps = [
    "Let me think about this problem step by step.",
    "\n\nFirst, I need to understand what the user is asking for.",
    "\n\nThey want a reasoning component that opens automatically when streaming begins and closes when streaming finishes.",
  ].join("");

  const handleCreateNew = () => {
    if (window.confirm("Start a new document? Current changes will be cleared.")) {
      setEditorContent("");
      setDocTitle("Untitled Document");
      setChatMessages([]);
    }
  };

  const downloadDocument = () => {
    const content = editorContent;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(docTitle || 'document').replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveCurrentDocument = async (
    title: string,
    messages: string[],
    contentToSave?: string
  ) => {
    const finalTitle = title.trim() || "Untitled Document";
    const finalContent = contentToSave !== undefined ? contentToSave : editorContent;

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: finalTitle,
          content: finalContent || "",
          messages: messages || [],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("API ERROR:", data);
        return;
      }

      setDocuments((prev) => [data, ...prev]);
    } catch (error) {
      console.error("Failed to save document:", error);
    }
  };

  const openDocument = (doc: any) => {
    setDocTitle(doc.title);
    setEditorContent(doc.content || "");
    setChatMessages(doc.messages || []);
    setActiveDocumentId(doc.id);
    setShowDocuments(false);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => { 
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const prompt = inputText;
      setInputText("");

      if (!prompt.trim()) return;

      const resTitle = await fetch("/api/title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await resTitle.json();
      const generatedTitle = data.title || "Untitled Document";
      setDocTitle(generatedTitle);

      const updatedMessages = [...chatMessages, prompt];
      setChatMessages(updatedMessages);

      const sendToAI = async (message: string) => {
        setIsReasoning(true);
        startReasoning(reasoningSteps);
        
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: message }],
          }),
        });

        if (!res.body) throw new Error("No stream");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let result = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          result += decoder.decode(value, { stream: true });

          const cleanHtml = marked.parse(result);
          setEditorContent(cleanHtml as string);
        }
        
        setIsReasoning(false);
        setReasoningContent("");

        return marked.parse(result) as string;
      };

      const generatedText = await sendToAI(prompt);

      await saveCurrentDocument(
        generatedTitle,
        updatedMessages,
        generatedText 
      );
    }
  };

  useEffect(() => {
    if (!isReasoning) return;

    if (reasoningIndex >= reasoningTokens.length) {
      setIsReasoning(false);
      return;
    }

    const timer = setTimeout(() => {
      setReasoningContent((prev) => prev + reasoningTokens[reasoningIndex]);
      setReasoningIndex((prev) => prev + 1);
    }, 20);

    return () => clearTimeout(timer);
  }, [isReasoning, reasoningIndex, reasoningTokens]);

  return (
    <div className="flex flex-col h-screen bg-white text-[#1f1f1f] font-sans overflow-hidden">
      {/* TOP GLOBAL NAVBAR */}
      <nav className="h-14 border-b border-zinc-200 flex items-center justify-between px-4 bg-white z-50">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-zinc-100 rounded-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>

          <span className="text-xl font-medium text-zinc-700">
            Gemini
          </span>

          <button
            onClick={() => setShowDocuments(true)}
            className="ml-4 px-4 py-1.5 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
          >
            Documents
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex flex-1 overflow-hidden">
        {showDocuments && (
          <div className="absolute inset-0 bg-white z-50 overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold">Documents</h1>
              <button
                onClick={() => setShowDocuments(false)}
                className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200"
              >
                Close
              </button>
            </div>

            {documents.length === 0 ? (
              <div className="text-zinc-500 text-sm">
                No documents yet
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id ?? doc.title}
                    onClick={() => openDocument(doc)}
                    className="p-5 rounded-2xl border border-zinc-200 hover:border-blue-400 cursor-pointer transition bg-white shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-zinc-100 rounded-lg">
                        📄
                      </div>
                      <div>
                        <h2 className="font-semibold text-sm">
                          {doc.title}
                        </h2>
                        <p className="text-xs text-zinc-500">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-600 line-clamp-3">
                      {doc.content?.slice(0, 100)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LEFT PANEL: CHAT */}
        <section className="w-[38%] flex flex-col border-r border-zinc-200 relative bg-white">
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {isReasoning && (
              <div className="mb-4">
                <Reasoning isStreaming={isReasoning}>
                  <ReasoningTrigger />
                  <ReasoningContent>{reasoningContent}</ReasoningContent>
                </Reasoning>
              </div>
            )}
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

                <div className="space-y-3">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className="bg-blue-50 text-zinc-700 p-3 rounded-2xl max-w-[80%] ml-auto text-sm"
                    >
                      {msg}
                    </div>
                  ))}
                </div>

                <div className="bg-[#f0f4f8] rounded-2xl p-4 flex items-center justify-between border border-zinc-100 max-w-[320px]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{docTitle || "مستند جديد"}</p>
                      <p className="text-[10px] text-zinc-500 uppercase">جاري العمل الآن</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white">
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
          <div className="h-14 border-b border-zinc-200 bg-white flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <svg className="text-zinc-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
              <span className="text-sm font-medium">{docTitle || "مستند جديد"}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => window.print()} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg></button>
              
              <div className="flex overflow-hidden rounded-full border border-blue-200">
                <button 
                  onClick={handleCreateNew}
                  className="bg-blue-50 text-blue-700 px-4 py-1.5 text-sm font-semibold border-r border-blue-200 hover:bg-blue-100 transition"
                >
                  Create
                </button>
              </div>
            </div>
          </div>

          {/* DOCUMENT BODY */}
          <div className="flex-1 overflow-y-auto py-8 px-4 flex justify-center items-start relative">
            <div className="w-full max-w-[850px] min-h-full flex flex-col items-center">
              <TiptapEditor 
                content={editorContent} 
                onChange={(html) => setEditorContent(html)} 
                onSelectAI={handleContextualAI} 
              />
            </div>
          </div>

          {/* FLOATING ACTION SIDEBAR */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 bg-white p-2 rounded-2xl border border-zinc-200 shadow-xl z-10">
            <button onClick={downloadDocument} className="p-2.5 hover:bg-zinc-100 rounded-xl text-zinc-500" title="Download Document">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}