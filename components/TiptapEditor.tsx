"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Maximize2,
  FileText,
  RefreshCw,
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  Type,
} from "lucide-react";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  onSelectAI?: (
    action: "expand" | "summarize" | "rewrite" | "autocomplete",
    selectedText: string,
    insertResult: (text: string) => void
  ) => void;
}

export default function TiptapEditor({
  content,
  onChange,
  onSelectAI,
}: TiptapEditorProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPos, setSlashMenuPos] = useState({ top: 0, left: 0 });

  const [showBubbleMenu, setShowBubbleMenu] = useState(false);
  const [bubbleMenuPos, setBubbleMenuPos] = useState({ top: 0, left: 0 });

  const slashMenuRef = useRef<HTMLDivElement>(null);
  const bubbleMenuRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder:
          "اكتب موضوعك هنا، أو اكتب '/' لإظهار خيارات Notion والذكاء الاصطناعي...",
      }),
    ],
    content: content,
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const isTextSelected = from !== to;

      if (isTextSelected) {
        const coords = editor.view.coordsAtPos(from);
        const domRect = editor.view.dom.getBoundingClientRect();

        setBubbleMenuPos({
          top: coords.top - domRect.top - 45,
          left: Math.max(10, coords.left - domRect.left - 50),
        });
        setShowBubbleMenu(true);
      } else {
        setShowBubbleMenu(false);
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());

      const { selection } = editor.state;
      const textBefore = editor.state.doc.textBetween(
        Math.max(0, selection.from - 1),
        selection.from
      );

      if (textBefore === "/") {
        const coords = editor.view.coordsAtPos(selection.from);
        const domRect = editor.view.dom.getBoundingClientRect();

        setSlashMenuPos({
          top: coords.bottom - domRect.top + 10,
          left: coords.left - domRect.left,
        });
        setShowSlashMenu(true);
      } else {
        setShowSlashMenu(false);
      }
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        slashMenuRef.current &&
        !slashMenuRef.current.contains(event.target as Node)
      ) {
        setShowSlashMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!editor) return null;

  // 🛠️ دالة التعامل مع الذكاء الاصطناعي بطريقة آمنة تمنع خطأ ProseMirror
  const handleAIAction = (
    action: "expand" | "summarize" | "rewrite" | "autocomplete"
  ) => {
    if (!onSelectAI) return;

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");

    onSelectAI(action, selectedText, (newText) => {
      if (!newText) return;

      if (action === "autocomplete") {
        // إضافة النص بعد نهاية التحديد/المؤشر مباشرة
        editor.chain().focus().setTextSelection(to).insertContent(" " + newText).run();
      } else {
        // استبدال النص المحدد بالنص الجديد الصادر من الذكاء الاصطناعي
        editor.chain().focus().deleteRange({ from, to }).insertContent(newText).run();
      }
    });

    setShowBubbleMenu(false);
    setShowSlashMenu(false);
  };

  const applyCommand = (command: () => void) => {
    const { from } = editor.state.selection;
    if (from > 1) {
      const textBefore = editor.state.doc.textBetween(from - 1, from);
      if (textBefore === "/") {
        editor.chain().focus().deleteRange({ from: from - 1, to: from }).run();
      }
    }
    command();
    setShowSlashMenu(false);
  };

  return (
    <div
      className="w-full max-w-[850px] bg-white border border-zinc-200 rounded-2xl shadow-sm min-h-[600px] relative p-10 text-zinc-800 font-sans"
      style={{ direction: "rtl" }}
    >
      {/* 1. 🪄 قائمة التظليل العائمة (عند تحديد نص بالماوس) */}
      {showBubbleMenu && (
        <div
          ref={bubbleMenuRef}
          className="absolute flex items-center gap-1 bg-zinc-900 text-white p-1.5 rounded-xl shadow-xl border border-zinc-800 z-50 transition-all duration-150"
          style={{
            top: `${bubbleMenuPos.top}px`,
            right: "30px",
          }}
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 hover:bg-zinc-800 rounded-lg text-xs ${
              editor.isActive("bold") ? "bg-zinc-700 text-blue-400" : ""
            }`}
            title="عريض"
          >
            <Bold size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 hover:bg-zinc-800 rounded-lg text-xs ${
              editor.isActive("italic") ? "bg-zinc-700 text-blue-400" : ""
            }`}
            title="مائل"
          >
            <Italic size={14} />
          </button>

          <div className="w-[1px] h-4 bg-zinc-700 mx-1" />

          <button
            onClick={() => handleAIAction("rewrite")}
            className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-zinc-800 text-xs font-medium rounded-lg text-blue-300 transition"
          >
            <RefreshCw size={13} />
            إعادة كتابة
          </button>

          <button
            onClick={() => handleAIAction("expand")}
            className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-zinc-800 text-xs font-medium rounded-lg text-purple-300 transition"
          >
            <Maximize2 size={13} />
            توسيع
          </button>

          <button
            onClick={() => handleAIAction("summarize")}
            className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-zinc-800 text-xs font-medium rounded-lg text-amber-300 transition"
          >
            <FileText size={13} />
            تلخيص
          </button>
        </div>
      )}

      {/* 2. 📜 قائمة السلاش / (عند كتابة الحرف /) */}
      {showSlashMenu && (
        <div
          ref={slashMenuRef}
          className="absolute bg-white border border-zinc-200 rounded-xl shadow-2xl p-2 w-64 z-50 flex flex-col gap-1 text-right max-h-80 overflow-y-auto"
          style={{ top: `${slashMenuPos.top}px`, right: "30px" }}
        >
          <div className="px-2 py-1 text-[11px] font-bold text-blue-600 uppercase flex items-center gap-1">
            <Sparkles size={12} />
            أدوات الذكاء الاصطناعي
          </div>

          <button
            onClick={() => applyCommand(() => handleAIAction("autocomplete"))}
            className="w-full px-3 py-2 text-sm hover:bg-blue-50 rounded-lg text-right flex justify-between items-center text-blue-700 font-medium"
          >
            <Sparkles size={15} />
            <span>أكمل النص تلقائياً</span>
          </button>

          <button
            onClick={() => applyCommand(() => handleAIAction("rewrite"))}
            className="w-full px-3 py-2 text-sm hover:bg-zinc-100 rounded-lg text-right flex justify-between items-center"
          >
            <RefreshCw size={14} className="text-zinc-400" />
            <span>إعادة صياغة النص</span>
          </button>

          <button
            onClick={() => applyCommand(() => handleAIAction("summarize"))}
            className="w-full px-3 py-2 text-sm hover:bg-zinc-100 rounded-lg text-right flex justify-between items-center"
          >
            <FileText size={14} className="text-zinc-400" />
            <span>تلخيص الفقرة</span>
          </button>

          <button
            onClick={() => applyCommand(() => handleAIAction("expand"))}
            className="w-full px-3 py-2 text-sm hover:bg-zinc-100 rounded-lg text-right flex justify-between items-center"
          >
            <Maximize2 size={14} className="text-zinc-400" />
            <span>توسيع وشرح النص</span>
          </button>

          <div className="w-full h-[1px] bg-zinc-100 my-1" />

          <div className="px-2 py-1 text-[11px] font-bold text-zinc-400 uppercase">
            تنسيقات Notion
          </div>

          <button
            onClick={() =>
              applyCommand(() => editor.chain().focus().setParagraph().run())
            }
            className="w-full px-3 py-2 text-sm hover:bg-zinc-100 rounded-lg text-right flex justify-between items-center"
          >
            <Type size={14} className="text-zinc-400" />
            <span>نص عادي</span>
          </button>

          <button
            onClick={() =>
              applyCommand(() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              )
            }
            className="w-full px-3 py-2 text-sm hover:bg-zinc-100 rounded-lg text-right flex justify-between items-center font-bold"
          >
            <Heading1 size={15} className="text-zinc-400" />
            <span>عنوان رئيسي H1</span>
          </button>

          <button
            onClick={() =>
              applyCommand(() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              )
            }
            className="w-full px-3 py-2 text-sm hover:bg-zinc-100 rounded-lg text-right flex justify-between items-center font-semibold"
          >
            <Heading2 size={15} className="text-zinc-400" />
            <span>عنوان فرعي H2</span>
          </button>

          <button
            onClick={() =>
              applyCommand(() => editor.chain().focus().toggleBulletList().run())
            }
            className="w-full px-3 py-2 text-sm hover:bg-zinc-100 rounded-lg text-right flex justify-between items-center"
          >
            <List size={15} className="text-zinc-400" />
            <span>قائمة نقطية</span>
          </button>
        </div>
      )}

      {/* محتوى المحرر */}
      <div className="prose prose-lg max-w-none text-right prose-headings:font-bold prose-h1:text-3xl prose-h1:mb-4 prose-h1:text-blue-900 prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h2:text-zinc-800 prose-p:text-zinc-700 prose-p:leading-relaxed prose-li:my-1">
        <EditorContent editor={editor} className="outline-none min-h-[500px]" />
      </div>
    </div>
  );
}