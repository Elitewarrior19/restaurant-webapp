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

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [stats, setStats] = useState<OrderStats>({ count: 0, lastOrderAt: null });
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

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
        snap.forEach((d) => {
          const data = d.data() as { createdAt?: string };
          if (data.createdAt) {
            if (!lastOrderAt || data.createdAt > lastOrderAt) {
              lastOrderAt = data.createdAt;
            }
          }
        });
        setStats({ count: snap.size, lastOrderAt });
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
          <div className="space-y-2 text-xs">
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
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-charcoal">Security</h2>
        <p className="text-xs text-gray-600">
          Jab aap logout karte hain to is device se aapka session close ho jata hai. Dobara login karne ke liye email
          ya Google ka use karein.
        </p>
        <Button variant="secondary" onClick={handleLogout} className="w-full justify-center text-sm">
          Log out
        </Button>
      </section>
    </div>
  );
}

