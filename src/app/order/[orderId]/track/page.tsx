"use client";

import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { getDb } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";

type Location = {
  lat: number;
  lng: number;
};

type OrderDoc = {
  status: string;
  etaMinutes?: number;
  totalAmount?: number;
  deliveryAddress?: string | null;
  createdAt?: string;
  location?: Location | null;
  riderLocation?: Location | null;
};

const DynamicOrderMap = dynamic(
  () => import("@/components/maps/OrderMap").then((m) => m.OrderMap),
  { ssr: false }
);

const steps = [
  { key: "received", label: "Received" },
  { key: "confirmed", label: "Confirmed" },
  { key: "cooking", label: "Cooking" },
  { key: "ready", label: "Ready" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" }
] as const;

export default function OrderTrackByIdPage() {
  const params = useParams<{ orderId: string }>() as { orderId: string };
  const orderId = params.orderId;
  const [order, setOrder] = useState<OrderDoc | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getDb();
    const ref = doc(db, "orders", orderId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setError("Order nahi mila.");
          setOrder(null);
          return;
        }
        setError(null);
        setOrder(snap.data() as OrderDoc);
      },
      (err) => {
        console.error(err);
        setError("Tracking load nahi ho saki.");
      }
    );
    return () => unsub();
  }, [orderId]);

  const currentIdx = useMemo(() => {
    const status = order?.status ?? "received";
    const idx = steps.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  }, [order?.status]);

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-red-600">{error}</p>
        <Link href="/order/track" className="text-xs text-saffron underline">
          Tracking page par wapas
        </Link>
      </div>
    );
  }

  if (!order) {
    return <p className="text-xs text-gray-600">Tracking load ho rahi hai...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold">Order tracking</h1>
          <p className="text-xs text-gray-600">
            Order #{orderId.slice(-6)} • ETA {order.etaMinutes ?? 35} min
          </p>
        </div>
        <Link href={`/order/${orderId}/chat`}>
          <Button variant="secondary" size="sm">
            Chat
          </Button>
        </Link>
      </div>

      {/* Progress Bar */}
      <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-gray-800">Order Status</span>
          <span className="text-[11px] text-gray-500">
            {order.createdAt && new Date(order.createdAt).toLocaleTimeString()}
          </span>
        </div>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200" />
          <div
            className="absolute left-0 top-5 h-0.5 bg-deepGreen transition-all duration-500"
            style={{
              width: `${(currentIdx / (steps.length - 1)) * 100}%`
            }}
          />
          {/* Steps */}
          <div className="relative flex items-start justify-between">
            {steps.map((s, idx) => {
              const active = idx <= currentIdx;
              const completed = idx < currentIdx;
              return (
                <div key={s.key} className="flex flex-1 flex-col items-center">
                  <div
                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                      completed
                        ? "bg-deepGreen text-cream shadow-md"
                        : active
                        ? "bg-deepGreen text-cream ring-4 ring-deepGreen/20"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {completed ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span className="mt-2 text-center text-[10px] font-medium text-gray-700">
                    {s.label}
                  </span>
                  {order.createdAt && idx <= currentIdx && (
                    <span className="mt-0.5 text-[9px] text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Order Card */}
      <section className="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
        <div className="text-xs font-medium text-gray-800">Order Details</div>
        <div className="space-y-1 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Order ID</span>
            <span className="font-medium">#{orderId.slice(-6)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">₹{(order.totalAmount ?? 0).toFixed(0)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">ETA</span>
            <span className="font-medium text-saffron">{order.etaMinutes ?? 35} min</span>
          </div>
        </div>
      </section>

      <section className="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-gray-800">Delivery</span>
          <span className="text-[11px] text-gray-500">
            Total ₹{(order.totalAmount ?? 0).toFixed(0)}
          </span>
        </div>
        <p className="text-[11px] text-gray-600">
          {order.deliveryAddress ?? "Pickup order / address not set"}
        </p>
        <div className="mt-2 space-y-1">
          <DynamicOrderMap
            customerLocation={order.location ?? null}
            riderLocation={order.riderLocation ?? null}
          />
          <p className="text-[10px] text-gray-500">
            Blue pin aapka address, hara dot rider ki current location (agar share ki ho).
          </p>
        </div>
      </section>

      {/* Floating Chat Button */}
      <Link
        href={`/order/${orderId}/chat`}
        className="fixed bottom-6 right-4 z-30 flex items-center gap-2 rounded-full bg-deepGreen px-4 py-3 text-xs font-medium text-cream shadow-lg transition hover:scale-105 hover:shadow-xl"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span>Delivery se baat karein…</span>
      </Link>
    </div>
  );
}

