"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Load Lucide Icons
    const script = document.createElement("script");
    script.src = "https://unpkg.com/lucide@latest";
    script.onload = () => {
      window.lucide.createIcons();
    };
    document.body.appendChild(script);
  }, []);

  const sendMessage = () => {
    const userInput = document.getElementById("userInput");
    const chatHistory = document.getElementById("chat-history");

    const text = userInput.value.trim();
    if (text === "") return;

    const userDiv = document.createElement("div");
    userDiv.className = "message-bubble user-message cursor-pointer";
    userDiv.innerText = text;
    userDiv.onclick = () => openModal(text);
    chatHistory.appendChild(userDiv);

    userInput.value = "";

    chatHistory.scrollTop = chatHistory.scrollHeight;

    setTimeout(() => {
      const aiDiv = document.createElement("div");
      aiDiv.className = "message-bubble ai-message";
      aiDiv.innerText =
        "I've received your message. How else can I assist you with this design?";
      chatHistory.appendChild(aiDiv);
      chatHistory.scrollTop = chatHistory.scrollHeight;
    }, 600);
  };

  const openModal = (title) => {
    document.getElementById("modalTitle").innerText = title;
    document.getElementById("modal").classList.remove("hidden");
  };

  const closeModal = () => {
    document.getElementById("modal").classList.add("hidden");
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap');

        body {
          font-family: 'Inter', sans-serif;
          background-color: #ffffff;
          color: #333;
        }

        .chat-container {
          max-width: 800px;
          margin: 0 auto;
          height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .message-bubble {
          max-width: 80%;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .ai-message {
          background-color: #f1f3f5;
          align-self: flex-start;
          border-bottom-left-radius: 2px;
        }

        .user-message {
          background-color: #ffffff;
          border: 1px solid #e9ecef;
          align-self: flex-end;
          border-bottom-right-radius: 2px;
        }

        .input-area {
          border-top: 1px solid #f1f3f5;
          padding: 2rem 0;
        }

        .custom-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1.5px solid #000;
          border-radius: 4px;
          outline: none;
        }

        .modal-overlay {
          background-color: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(4px);
        }
      `}</style>

      <div className="chat-container px-6">
        <header className="py-8">
          <h1 className="text-xs font-bold tracking-widest text-gray-400 uppercase">
            AI Assistant
          </h1>
          <hr className="mt-4 border-gray-100" />
        </header>

        <main
          id="chat-history"
          className="flex-1 overflow-y-auto flex flex-col pt-4"
        >
          <div className="message-bubble ai-message">
            Hello. How can I help you today?
          </div>

          <div
            className="message-bubble user-message cursor-pointer"
            onClick={() => openModal("Minimalism Inquiry")}
          >
            Can you explain the concept of minimalism?
          </div>

          <div className="message-bubble ai-message">
            Minimalism is about focusing on the essential. In design, it means
            using only the necessary elements—limiting color palettes,
            maximizing white space, and prioritizing function over ornament.
          </div>

          <div
            className="message-bubble user-message cursor-pointer"
            onClick={() => openModal("Interface Feedback")}
          >
            That makes sense. This interface is a good example.
          </div>

          <div className="message-bubble ai-message">
            Exactly. By removing distractions like bright colors or complex
            shadows, the user can focus entirely on the conversation.
          </div>
        </main>

        <footer className="input-area">
          <div className="relative flex items-center">
            <input
              type="text"
              id="userInput"
              placeholder="Type a message..."
              className="custom-input pr-16"
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <button
              onClick={sendMessage}
              className="absolute right-4 text-sm font-medium hover:text-gray-500 transition-colors"
            >
              Send
            </button>
          </div>
        </footer>
      </div>

      {/* Modal */}
      <div
        id="modal"
        className="hidden fixed inset-0 modal-overlay flex items-center justify-center z-50 p-6"
      >
        <div className="bg-white border border-gray-200 shadow-xl rounded-lg max-w-md w-full p-8 relative">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-gray-400 hover:text-black"
          >
            <i data-lucide="x" className="w-5 h-5"></i>
          </button>

          <h2 id="modalTitle" className="text-lg font-medium mb-4">
            Task Details
          </h2>

          <p className="text-gray-600 text-sm leading-relaxed">
            This is a functional modal designed to match the minimalist theme.
            It uses high contrast and plenty of negative space.
          </p>

          <button
            onClick={closeModal}
            className="mt-8 w-full py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}