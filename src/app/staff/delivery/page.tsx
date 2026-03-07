"use client";

import {
  collection,
  onSnapshot,
  query,
  where,
  updateDoc,
  doc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDb } from "@/lib/firebase";
import { useAuth, useRequireRole } from "@/lib/auth-context";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Order = {
  id: string;
  status: string;
  createdAt?: string;
  deliveryAddress?: string;
  totalAmount?: number;
  isCOD?: boolean;
};

export default function DeliveryDashboardPage() {
  const { user } = useAuth();
  const { allowed, loading } = useRequireRole(["delivery", "admin"]);
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const db = getDb();

  useEffect(() => {
    if (!loading && !allowed) {
      router.push("/login");
    }
  }, [allowed, loading, router]);

  useEffect(() => {
    if (!allowed || !user) return;
    const base = collection(db, "orders");
    const q = query(
      base,
      where("deliveryId", "==", user.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: Order[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Order, "id">)
      }));
      setOrders(
        list.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
      );
    });
    return () => unsub();
  }, [allowed, user, db]);

  useEffect(() => {
    if (!allowed || !user) return;
    const base = collection(db, "orders");
    const q = query(
      base,
      where("status", "==", "ready"),
      where("deliveryId", "==", null)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: Order[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Order, "id">)
      }));
      setReadyOrders(
        list.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
      );
    });
    return () => unsub();
  }, [allowed, user, db]);

  if (!allowed) {
    return <p className="text-xs text-gray-600">Access check ho raha hai...</p>;
  }

  async function updateStatus(orderId: string, status: string) {
    try {
      const ref = doc(db, "orders", orderId);
      await updateDoc(ref, { status, updatedAt: new Date().toISOString() });
    } catch (err) {
      console.error(err);
      alert("Status update nahi ho saka. Thori dair baad try karein.");
    }
  }

  async function acceptOrder(orderId: string) {
    if (!user) return;
    try {
      const ref = doc(db, "orders", orderId);
      await updateDoc(ref, {
        deliveryId: user.uid,
        status: "out_for_delivery",
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
      alert("Order accept nahi ho saka.");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Delivery dashboard</h1>
      <p className="text-xs text-gray-600">
        Yahan se pickup, route aur delivery status manage karein. Har order ke
        sath map link aur COD toggle bhi hai.
      </p>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold">Ready orders (pickup)</h2>
        {readyOrders.map((order) => (
          <Card key={order.id} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Order #{order.id.slice(-6)}</span>
              <span className="rounded-full bg-cream px-2 py-1 text-[10px] uppercase">
                ready
              </span>
            </div>
            <p className="text-[11px] text-gray-700">
              {order.deliveryAddress ?? "Address not set yet"}
            </p>
            <div className="flex items-center justify-between text-[11px] text-gray-600">
              <span>Total: ₹{order.totalAmount ?? 0}</span>
              <span>{order.isCOD ? "COD" : "Prepaid"}</span>
            </div>
            <Button size="sm" onClick={() => acceptOrder(order.id)}>
              Accept pickup
            </Button>
          </Card>
        ))}
        {readyOrders.length === 0 && (
          <p className="text-xs text-gray-600">
            Abhi koi ready orders unassigned nahi hain.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold">Aapke assigned orders</h2>
        {orders.map((order) => (
          <Card key={order.id} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Order #{order.id.slice(-6)}</span>
              <span className="rounded-full bg-cream px-2 py-1 text-[10px] uppercase">
                {order.status ?? "assigned"}
              </span>
            </div>
            <p className="text-[11px] text-gray-700">
              {order.deliveryAddress ?? "Address not set yet"}
            </p>
            <div className="flex items-center justify-between text-[11px] text-gray-600">
              <span>Total: ₹{order.totalAmount ?? 0}</span>
              <span>{order.isCOD ? "COD" : "Prepaid"}</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => updateStatus(order.id, "out_for_delivery")}
              >
                Confirm pickup
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => updateStatus(order.id, "out_for_delivery")}
              >
                On the way
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => updateStatus(order.id, "delivered")}
              >
                Delivered
              </Button>
            </div>
            <div className="flex items-center justify-between pt-1 text-[11px] text-gray-600">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-saffron underline"
              >
                Route maps kholen
              </a>
              {order.isCOD && (
                <span className="rounded-full bg-cream px-2 py-1">
                  Cash collect karna yaad rakhein
                </span>
              )}
            </div>
          </Card>
        ))}
        {orders.length === 0 && (
          <p className="text-xs text-gray-600">
            Abhi aap ke liye koi delivery assign nahi hai.
          </p>
        )}
      </div>
    </div>
  );
}

