"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import ChatWidget from "./ChatWidget";

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Don't show on the dedicated chat page
  if (pathname === "/chat") return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat panel */}
      {open && (
        <div className="mb-4 animate-[slideUp_200ms_ease-out]">
          <style>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <ChatWidget mode="embedded" />
        </div>
      )}

      {/* Pokeball toggle button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="ml-auto flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-accent shadow-lg transition-all duration-200 hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-primary"
      >
        {open ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-7 w-7"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
            <line x1="2" y1="12" x2="22" y2="12" stroke="white" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" fill="white" />
          </svg>
        )}
      </button>
    </div>
  );
}
