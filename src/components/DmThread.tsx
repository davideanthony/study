"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage } from "@/app/messaggi/actions";
import { formatCommentDate } from "@/lib/notes";

type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

type DmThreadProps = {
  conversationId: string;
  myId: string;
  initialMessages: Message[];
};

export function DmThread({
  conversationId,
  myId,
  initialMessages,
}: DmThreadProps) {
  const [messages, setMessages] = useState(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`dm:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "dm_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [...prev, row];
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return (
    <div className="flex flex-col">
      <ul className="max-h-[50vh] min-h-[200px] space-y-3 overflow-y-auto rounded-2xl border border-gray-light bg-surface/80 p-4">
        {messages.length === 0 ? (
          <li className="text-center text-sm text-muted">Nessun messaggio. Scrivi il primo.</li>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === myId;
            return (
              <li
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                    mine
                      ? "bg-sage text-surface"
                      : "border border-gray-light bg-mint-light/40 text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <time className="mt-1 block text-[10px] opacity-70">
                    {formatCommentDate(m.created_at)}
                  </time>
                </div>
              </li>
            );
          })
        )}
        <div ref={bottomRef} />
      </ul>

      <form
        action={async (formData) => {
          await sendMessage(conversationId, formData);
        }}
        className="mt-4 flex gap-2"
      >
        <input
          name="body"
          required
          maxLength={4000}
          placeholder="Scrivi un messaggio…"
          className="input-field flex-1 px-4 py-3"
          autoComplete="off"
        />
        <button type="submit" className="btn-primary shrink-0 px-5 py-3">
          Invia
        </button>
      </form>
    </div>
  );
}
