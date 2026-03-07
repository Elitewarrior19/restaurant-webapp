"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { useCart } from "@/lib/cart-context";
import {
  getStaticMenuByCategory,
  STATIC_MENU_CATEGORIES,
} from "@/lib/menu-data";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  categoryName?: string;
  isVeg?: boolean;
  imageUrl?: string;
};

function MenuPageContent() {
  const [firestoreItems, setFirestoreItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "price">("default");
  const searchParams = useSearchParams()!;
  const category = searchParams.get("category");
  const { addItem } = useCart();

  useEffect(() => {
    const db = getDb();
    const ref = collection(db, "menuItems");
    const q = category
      ? query(ref, where("categoryName", "==", category), limit(200))
      : query(ref, limit(500));
    getDocs(q)
      .then((snap) => {
        setFirestoreItems(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MenuItem, "id">) }))
        );
      })
      .catch(() => setFirestoreItems([]))
      .finally(() => setLoading(false));
  }, [category]);

  const baseItems = useMemo((): MenuItem[] => {
    if (firestoreItems.length > 0) return firestoreItems;
    return getStaticMenuByCategory(category ?? "").map((i) => ({
      id: i.id,
      name: i.name,
      price: i.price,
      categoryName: i.categoryName,
      imageUrl: undefined,
    }));
  }, [firestoreItems, category]);

  const items = useMemo(() => {
    let list = baseItems;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q));
    }
    if (sortBy === "price") {
      list = [...list].sort((a, b) => a.price - b.price);
    }
    return list;
  }, [baseItems, search, sortBy]);

  const categories = ["All", ...STATIC_MENU_CATEGORIES];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-charcoal">Menu</h1>
          <p className="text-sm text-gray-500">
            {baseItems.length} items
          </p>
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-saffron transition hover:text-saffron/80"
        >
          Home
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-saffron focus:ring-2 focus:ring-saffron/20"
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((c) => {
          const active = (!category && c === "All") || category === c;
          return (
            <Link
              key={c}
              href={c === "All" ? "/menu" : `/menu?category=${encodeURIComponent(c)}`}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-deepGreen text-white"
                  : "bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-gray-300"
              }`}
            >
              {c}
            </Link>
          );
        })}
      </div>

      {/* Sort */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setSortBy(sortBy === "price" ? "default" : "price")}
          className="text-sm text-gray-600 hover:text-charcoal"
        >
          {sortBy === "price" ? "Sort: Price ↑" : "Sort: Default"}
        </button>
      </div>

      {/* Items grid */}
      {loading ? (
        <div className="py-12 text-center text-sm text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-12 text-center text-sm text-gray-500">
          No items found
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-charcoal line-clamp-2">
                  {item.name}
                </h3>
                <p className="mt-1 text-sm font-semibold text-deepGreen">
                  Rs. {item.price.toLocaleString()}
                </p>
                <button
                  onClick={() => addItem({ id: item.id, name: item.name, price: item.price })}
                  className="mt-2 rounded-lg bg-saffron px-3 py-1.5 text-xs font-medium text-white transition hover:bg-saffron/90"
                >
                  Add
                </button>
              </div>
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-20 w-20 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-2xl text-gray-300">
                  •
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-gray-500">Loading...</div>}>
      <MenuPageContent />
    </Suspense>
  );
}
