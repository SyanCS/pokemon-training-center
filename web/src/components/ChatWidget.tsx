"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import ChatMessage from "./ChatMessage";

interface ChatWidgetProps {
  mode: "embedded" | "full";
  initialMessage?: string;
}

export default function ChatWidget({ mode, initialMessage }: ChatWidgetProps) {
  const { messages, send, isLoading } = useChat();
  const [input, setInput] = useState(initialMessage ?? "");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    send(text);
  };

  const containerClasses =
    mode === "full"
      ? "flex h-full flex-col"
      : "flex h-[500px] w-[380px] flex-col rounded-2xl border border-border-main/30 bg-bg-primary shadow-2xl";

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border-main/30 bg-bg-secondary/50 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
            <line x1="2" y1="12" x2="22" y2="12" stroke="white" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" fill="white" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-text-primary">PTC Assistant</p>
          <p className="text-xs text-text-secondary">AI Scheduling Helper</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {/* Welcome message */}
        {messages.length === 0 && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl rounded-bl-sm border border-border-main/30 bg-bg-secondary px-4 py-3 text-sm leading-relaxed text-text-primary">
              Welcome to the Pokemon Training Center! I can help you enroll Pokemon,
              schedule lessons, get recommendations, or cancel bookings. What would
              you like to do?
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm border border-border-main/30 bg-bg-secondary px-4 py-3 text-sm italic text-text-secondary">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border-main/30 bg-bg-secondary/50 p-3">
        <div className="flex gap-2">
          <label htmlFor="chat-input" className="sr-only">
            Type a message
          </label>
          <input
            ref={inputRef}
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1 rounded-lg border border-border-main/30 bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder-text-secondary outline-none transition-colors duration-200 focus:border-primary disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="cursor-pointer rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
