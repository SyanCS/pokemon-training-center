"use client";

import { useState, useCallback } from "react";
import { Message } from "@/lib/types";
import { sendChatMessage } from "@/lib/api";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const send = useCallback(async (text: string) => {
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const data = await sendChatMessage(text);
      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        intent: data.intent?.intent,
        data: data.data,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          err instanceof Error && err.name === "AbortError"
            ? "Request timed out. Please try again."
            : err instanceof Error
              ? err.message
              : "Something went wrong. Is the backend running?",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { messages, send, isLoading };
}
