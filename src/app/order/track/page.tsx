"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState("");
  const router = useRouter();

  function goToOrder() {
    const id = orderId.trim();
    if (!id) return;
    router.push(`/order/${id}/track`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-charcoal">Track your order</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter the order ID you received after checkout.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <label className="block text-sm font-medium text-gray-700">Order ID</label>
        <div className="mt-2 flex gap-2">
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20"
            placeholder="e.g. abc123..."
          />
          <button
            onClick={goToOrder}
            className="rounded-xl bg-saffron px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-saffron/90"
          >
            Track
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-medium text-gray-700">Restaurant location</h2>
        <div className="mt-2 overflow-hidden rounded-xl border border-gray-200">
          <iframe
            title="Lala's Foods location"
            src="https://www.google.com/maps?q=Lala%27s+Foods+restaurant&output=embed"
            className="h-44 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
