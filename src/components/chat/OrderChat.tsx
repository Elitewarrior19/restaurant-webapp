"use client";

import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from "firebase/firestore";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { getDb } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";

type Message = {
  id: string;
  text: string;
  senderId: string;
  senderRole: string;
  sentAt?: { seconds: number; nanoseconds: number };
};

type Props = {
  orderId: string;
};

export function OrderChat({ orderId }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const db = getDb();

  useEffect(() => {
    const col = collection(db, "orders", orderId, "messages");
    const q = query(col, orderBy("sentAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const list: Message[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Message, "id">)
      }));
      setMessages(list);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });
    return () => unsub();
  }, [db, orderId]);

  async function sendMessage() {
    if (!user || !input.trim()) return;
    setSending(true);
    try {
      const col = collection(db, "orders", orderId, "messages");
      await addDoc(col, {
        text: input.trim(),
        senderId: user.uid,
        senderRole: user.role,
        sentAt: serverTimestamp()
      });
      setInput("");
    } catch (err) {
      console.error(err);
      alert("Message send nahi ho saka.");
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void sendMessage();
  }

  return (
    <div className="flex h-80 flex-col rounded-2xl bg-white p-3 text-xs shadow-sm">
      <div className="mb-2 text-[11px] font-medium text-gray-800">
        Chat — delivery se baat karein
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto rounded-xl bg-cream/40 p-2">
        {messages.map((m) => {
          const mine = user && m.senderId === user.uid;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-3 py-1.5 text-[11px] ${
                  mine
                    ? "bg-deepGreen text-cream"
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                <div className="mb-0.5 text-[9px] uppercase text-gray-400">
                  {m.senderRole}
                </div>
                <div>{m.text}</div>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <p className="text-[11px] text-gray-500">
            Abhi koi messages nahi. Pehla salam aap bhej sakte hain.
          </p>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-full border border-gray-200 bg-cream/40 px-3 py-2 text-[11px] outline-none focus:border-deepGreen focus:ring-1 focus:ring-deepGreen/40"
          placeholder="Delivery se baat karein..."
        />
        <Button
          type="submit"
          size="sm"
          disabled={sending}
        >
          Send
        </Button>
      </form>
    </div>
  );
}

