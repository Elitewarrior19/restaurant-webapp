"use client";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDb } from "@/lib/firebase";
import { useRequireRole } from "@/lib/auth-context";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Order = {
  id: string;
  status: string;
  createdAt?: string;
  items?: { name: string; qty: number }[];
  notes?: string;
};

export default function KitchenDashboardPage() {
  const { allowed, loading } = useRequireRole(["kitchen", "admin"]);
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const db = getDb();

  useEffect(() => {
    if (!loading && !allowed) {
      router.push("/login");
    }
  }, [allowed, loading, router]);

  useEffect(() => {
    if (!allowed) return;
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list: Order[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Order, "id">)
      }));
      setOrders(list);
    });
    return () => unsub();
  }, [allowed]);

  if (!allowed) {
    return <p className="text-xs text-gray-600">Access check ho raha hai...</p>;
  }

  async function setStatus(orderId: string, status: string) {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
      alert("Status update nahi ho saka.");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Kitchen dashboard</h1>
      <p className="text-xs text-gray-600">
        Queue-based orders, timers aur quick status buttons.
      </p>

      <div className="space-y-2">
        {orders.map((order) => (
          <Card key={order.id} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Order #{order.id.slice(-6)}</span>
              <span className="rounded-full bg-cream px-2 py-1 text-[10px] uppercase">
                {order.status ?? "received"}
              </span>
            </div>
            <ul className="space-y-1 text-[11px] text-gray-700">
              {order.items?.map((it, idx) => (
                <li key={idx}>
                  {it.qty} × {it.name}
                </li>
              )) ?? <li>Items abhi dummy structure mein hain.</li>}
            </ul>
            {order.notes && (
              <p className="text-[11px] text-gray-500">Note: {order.notes}</p>
            )}
            <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setStatus(order.id, "confirmed")}
              >
                Confirm
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setStatus(order.id, "cooking")}
              >
                Start cooking
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setStatus(order.id, "ready")}
              >
                Mark cooked
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setStatus(order.id, "ready")}
              >
                Ready for dispatch
              </Button>
            </div>
          </Card>
        ))}
        {orders.length === 0 && (
          <p className="text-xs text-gray-600">
            Abhi koi orders nahi aaye. Jaise hi orders place honge, yahan appear
            honge.
          </p>
        )}
      </div>
    </div>
  );
}

