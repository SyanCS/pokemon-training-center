"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ChatWidget from "@/components/ChatWidget";

function ChatContent() {
  const searchParams = useSearchParams();
  const initialMessage = searchParams.get("message") ?? undefined;

  return (
    <div className="flex h-[calc(100vh-73px-89px)] flex-col">
      <ChatWidget mode="full" initialMessage={initialMessage} />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-73px-89px)] items-center justify-center text-text-secondary">
          Loading chat...
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
