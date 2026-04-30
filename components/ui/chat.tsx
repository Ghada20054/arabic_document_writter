import React from 'react';

interface ChatProps {
  children: React.ReactNode;
  messages?: any[];
}

// حاوي الدردشة
export const Chat = ({ children }: ChatProps) => (
  <div className="flex flex-col gap-10 w-full max-w-2xl mx-auto py-12 animate-in fade-in duration-700">
    {children}
  </div>
);

// لتنظيم اتجاه الرسائل (يمين للمستخدم، يسار للبوت)
export const MessageGroup = ({ children, isUser }: { children: React.ReactNode, isUser: boolean }) => (
  <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-3 px-6`}>
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}>
      {children}
    </div>
  </div>
);

// تصميم فقاعة الرسالة - تم تعديل لون المستخدم للرمادي
export const Message = ({ content, variant, className }: { content: string, variant: 'sent' | 'received', className?: string }) => (
  <div
    className={`px-5 py-3 rounded-xl text-[16px] leading-relaxed transition-all duration-300 font-normal ${
      variant === 'sent'
        ? 'bg-[#F2F3F5] text-[#1A1A1A] border-none shadow-none' // تم التغيير للرمادي وإلغاء الظل والحدود
        : 'bg-[#F2F3F5] text-[#1A1A1A] border-none shadow-none' // البوت أيضاً بنفس الشكل
    } ${className}`}
  >
    {content}
  </div>
);