"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { getDb } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";

type OrderStats = {
  count: number;
  lastOrderAt?: string | null;
};

type RecentOrder = {
  id: string;
  createdAt?: string;
  totalAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
};

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [stats, setStats] = useState<OrderStats>({ count: 0, lastOrderAt: null });
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [preferredPayment, setPreferredPayment] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.name ?? "");
    }
  }, [user]);

  useEffect(() => {
    async function loadOrderStats() {
      if (!user) return;
      setStatsLoading(true);
      setStatsError(null);
      try {
        const db = getDb();
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("userId", "==", user.uid));
        const snap = await getDocs(q);
        let lastOrderAt: string | null = null;
        const list: RecentOrder[] = [];
        const paymentCounts = new Map<string, number>();

        snap.forEach((d) => {
          const data = d.data() as {
            createdAt?: string;
            totalAmount?: number;
            paymentMethod?: string;
            paymentStatus?: string;
          };
          if (data.createdAt) {
            if (!lastOrderAt || data.createdAt > lastOrderAt) {
              lastOrderAt = data.createdAt;
            }
          }
          list.push({
            id: d.id,
            createdAt: data.createdAt,
            totalAmount: data.totalAmount,
            paymentMethod: data.paymentMethod,
            paymentStatus: data.paymentStatus
          });
          if (data.paymentMethod) {
            paymentCounts.set(
              data.paymentMethod,
              (paymentCounts.get(data.paymentMethod) ?? 0) + 1
            );
          }
        });

        list.sort(
          (a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
        );

        let topMethod: string | null = null;
        let topCount = 0;
        paymentCounts.forEach((count, method) => {
          if (count > topCount) {
            topCount = count;
            topMethod = method;
          }
        });

        setStats({ count: snap.size, lastOrderAt });
        setRecentOrders(list.slice(0, 3));
        setPreferredPayment(topMethod);
      } catch (err) {
        console.error(err);
        setStatsError("Order history load nahi ho saki.");
      } finally {
        setStatsLoading(false);
      }
    }
    void loadOrderStats();
  }, [user]);

  if (!user) {
    return null;
  }

  const isAdmin = user.role === "admin";

  async function handleSaveName() {
    const name = displayName.trim();
    setSavingName(true);
    try {
      const db = getDb();
      const usersCol = collection(db, "users");
      const ref = doc(usersCol, user!.uid);
      await setDoc(
        ref,
        {
          name: name || null
        },
        { merge: true }
      );
    } catch (err) {
      console.error(err);
      alert("Naam save nahi ho saka. Thodi der baad try karein.");
    } finally {
      setSavingName(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-charcoal">Account settings</h1>
            <p className="text-xs text-gray-500">
              Dekhein aap kaunse account se login hain, apna naam update karein aur orders ka overview dekhein.
            </p>
          </div>
          {isAdmin && (
            <span className="rounded-full bg-deepGreen/10 px-3 py-1 text-[11px] font-semibold text-deepGreen">
              Admin
            </span>
          )}
        </div>

        <div className="mt-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Logged in as</span>
            <span className="font-medium text-charcoal">{user.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Role</span>
            <span className="font-medium capitalize text-charcoal">{user.role}</span>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-charcoal">Profile</h2>
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-gray-700">Display name / username</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Jaise: Amrit, Lala, etc."
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              disabled={savingName}
              onClick={handleSaveName}
              className="px-4 py-1.5 text-xs"
            >
              {savingName ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-charcoal">Order activity</h2>
        {statsLoading ? (
          <p className="text-xs text-gray-600">Order history load ho rahi hai...</p>
        ) : statsError ? (
          <p className="text-xs text-red-600">{statsError}</p>
        ) : (
          <div className="space-y-3 text-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total orders</span>
                <span className="font-semibold text-charcoal">{stats.count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last order</span>
                <span className="font-medium text-charcoal">
                  {stats.lastOrderAt
                    ? new Date(stats.lastOrderAt).toLocaleString()
                    : "Abhi tak koi order nahi"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Preferred payment</span>
                <span className="font-medium text-charcoal">
                  {preferredPayment
                    ? preferredPayment === "cod"
                      ? "Cash on delivery"
                      : preferredPayment === "jazzcash"
                      ? "JazzCash"
                      : "Easypaisa"
                    : "Abhi tak clear nahi"}
                </span>
              </div>
            </div>
            {recentOrders.length > 0 && (
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-gray-700">Recent orders</p>
                <ul className="space-y-1">
                  {recentOrders.map((o) => (
                    <li
                      key={o.id}
                      className="flex items-center justify-between rounded-lg bg-cream/60 px-3 py-1.5"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-semibold text-charcoal">
                          #{o.id.slice(-6)}
                        </span>
                        <span className="block text-[10px] text-gray-500">
                          {o.createdAt
                            ? new Date(o.createdAt).toLocaleString()
                            : "Time unknown"}
                        </span>
                      </div>
                      <div className="text-right text-[10px] text-gray-600">
                        <div className="font-medium text-charcoal">
                          ₹{(o.totalAmount ?? 0).toFixed(0)}
                        </div>
                        <div>
                          {o.paymentMethod === "cod"
                            ? "COD"
                            : o.paymentMethod === "jazzcash"
                            ? "JazzCash"
                            : o.paymentMethod === "easypaisa"
                            ? "Easypaisa"
                            : "Payment"}
                          {o.paymentStatus && ` • ${o.paymentStatus}`}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-charcoal">Security</h2>
        <p className="text-xs text-gray-600">
          Jab aap logout karte hain to is device se aapka session close ho jata hai. Dobara login karne ke liye email
          ya Google ka use karein.
        </p>
        <div className="mt-2 space-y-1 text-xs text-gray-600">
          <div className="flex items-center justify-between">
            <span>Account created</span>
            <span className="font-medium text-charcoal">
              {user.createdAt
                ? new Date(user.createdAt).toLocaleString()
                : "Data unavailable"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Last login</span>
            <span className="font-medium text-charcoal">
              {user.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleString()
                : "Data unavailable"}
            </span>
          </div>
        </div>
        <Button variant="secondary" onClick={handleLogout} className="w-full justify-center text-sm">
          Log out
        </Button>
      </section>
    </div>
  );
}

