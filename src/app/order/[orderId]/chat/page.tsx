"use client";

import { useParams } from "next/navigation";
import { OrderChat } from "@/components/chat/OrderChat";

export default function OrderChatPage() {
  const params = useParams<{ orderId: string }>() as { orderId: string };
  const orderId = params.orderId;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Order chat</h1>
      <p className="text-xs text-gray-600">
        Yahan se aap delivery rider ya support se direct chat kar sakte hain.
      </p>
      <OrderChat orderId={orderId} />
    </div>
  );
}

