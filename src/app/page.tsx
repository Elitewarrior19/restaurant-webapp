"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { getDb } from "@/lib/firebase";

const CATEGORIES = [
  { name: "Pizza", href: "/menu?category=Pizza", emoji: "🍕" },
  { name: "Special Deals", href: "/menu?category=Special%20Deals", emoji: "🎁" },
  { name: "Biryani & Rice", href: "/menu?category=Rice", emoji: "🍚" },
  { name: "Burgers & Rolls", href: "/menu?category=Roll", emoji: "🍔" },
  { name: "Wings & Fish", href: "/menu?category=Wings%20%26%20Fish", emoji: "🍗" },
  { name: "Steak", href: "/menu?category=Steak", emoji: "🥩" },
  { name: "Fries", href: "/menu?category=Fries", emoji: "🍟" },
  { name: "Chowmein", href: "/menu?category=Chowmein", emoji: "🍜" },
];

export default function HomePage() {
  const [lastOrders, setLastOrders] = useState<{ id: string; totalAmount?: number; createdAt?: string }[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    getDocs(
      query(
        collection(getDb(), "orders"),
        orderBy("createdAt", "desc"),
        limit(3)
      )
    )
      .then((snap) =>
        setLastOrders(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        )
      )
      .catch(() => {});
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-saffron via-deepGreen to-emerald-700 shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 left-4 h-32 w-32 rounded-full bg-black/10 blur-2xl" />
        <div className="relative px-6 py-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            Fresh. Fast. Local.
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Lala&apos;s Special Foods
          </h1>
          <p className="mt-3 max-w-md text-sm text-balance text-white/90 sm:text-base">
            Wood-fired pizzas, juicy steaks, biryani & more. Hot food at your door in 25–35 minutes.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/menu" className="btn-primary flex items-center gap-2 rounded-full px-6 py-3 text-sm sm:text-base">
              <span>Order Now</span>
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/order/track"
              className="btn-secondary rounded-full border-white/40 bg-white/10 px-5 py-2.5 text-xs font-medium text-white backdrop-blur hover:bg-white/15 sm:text-sm"
            >
              Track order
            </Link>
            {!user && (
              <span className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-black/15 px-3 py-1 text-[11px] font-medium text-white sm:text-xs">
                New here?
                <Link href="/signup" className="underline underline-offset-2">
                  Create free account
                </Link>
              </span>
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-4 text-xs text-white/80 sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-[11px]">
                25–35
              </span>
              <span>Average delivery time</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-[11px]">
                ⭐
              </span>
              <span>4.8 rating from regulars</span>
            </div>
          </div>
        </div>
      </section>

      {/* Deliver to */}
      <section className="rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Deliver to</span>
          <Link
            href="/checkout"
            className="text-sm font-medium text-saffron transition hover:text-saffron/80"
          >
            {user ? "Saved address" : "Add address"}
          </Link>
        </div>
      </section>

      {/* Mid-page CTA */}
      {!user && (
        <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-cream via-saffron-light to-cream p-[1px]">
          <div className="flex flex-col items-start justify-between gap-3 rounded-[18px] bg-white/90 px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:px-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-saffron">
                Hungry?
              </p>
              <p className="mt-1 text-sm font-semibold text-charcoal sm:text-base">
                Start your first order in under a minute.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Pick your favourites, add your address, and track every step.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Link href="/menu" className="btn-primary w-full rounded-full px-4 py-2 text-xs sm:w-auto sm:text-sm">
                Browse full menu
              </Link>
              <Link
                href="/signup"
                className="btn-secondary w-full rounded-full border-saffron/30 bg-saffron-light px-4 py-2 text-xs text-saffron hover:border-saffron hover:bg-saffron/10 sm:w-auto sm:text-sm"
              >
                Create an account
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section>
        <h2 className="mb-1 text-base font-semibold text-charcoal">Browse by category</h2>
        <p className="mb-3 text-xs text-gray-500">Tap a category to see all the good stuff.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group relative flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white/90 p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-saffron/40 hover:shadow-md"
            >
              <span className="text-2xl drop-shadow-sm">{cat.emoji}</span>
              <span className="text-center text-xs font-medium text-charcoal group-hover:text-saffron">
                {cat.name}
              </span>
              <span className="mt-0.5 text-[10px] text-gray-400 group-hover:text-saffron/80">
                Tap to explore
              </span>
              <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/0 via-white/0 to-saffron/3 opacity-0 transition group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </section>

      {/* Reorder */}
      {user && lastOrders.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-semibold text-charcoal">Reorder</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {lastOrders.map((o) => (
              <Link
                key={o.id}
                href={`/order/${o.id}/track`}
                className="flex min-w-[140px] flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <span className="text-xs font-medium text-charcoal">
                  Order #{String(o.id).slice(-6)}
                </span>
                <span className="text-[11px] text-gray-500">
                  ₹{o.totalAmount?.toFixed(0) ?? 0}
                </span>
                <span className="text-xs font-medium text-saffron">View</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
