"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart-context";

type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  isVeg?: boolean;
  spiceLevelsAllowed?: string[];
  basePrepMinutes?: number;
  imageUrl?: string;
};

export default function MenuItemPage() {
  const params = useParams<{ id: string }>() as { id: string };
  const id = params.id;
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spiceLevel, setSpiceLevel] = useState(0);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const rating = 4.6;
  const reviewCount = 320;
  const addons = [
    { id: "extra-cheese", name: "Extra Cheese", price: 50 },
    { id: "fries", name: "French Fries", price: 390 },
    { id: "drink", name: "Soft Drink", price: 100 },
  ];

  useEffect(() => {
    const db = getDb();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const ref = doc(db, "menuItems", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError("Yeh item nahi mili.");
          return;
        }
        setItem({ id: snap.id, ...(snap.data() as Omit<MenuItem, "id">) });
      } catch (err) {
        console.error(err);
        setError("Item load nahi ho saki. Thori dair baad try karein.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  if (loading) {
    return <p className="text-xs text-gray-600">Item load ho rahi hai...</p>;
  }

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-red-600">{error}</p>
        <Link href="/menu" className="text-xs text-saffron underline">
          Menu par wapas jayein
        </Link>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="space-y-4">
      <Link href="/menu" className="text-xs text-saffron underline">
        ← Menu par wapas
      </Link>

      <Card className="space-y-4">
        {/* Hero Image */}
        {item.imageUrl && (
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-64 w-full object-cover"
            />
          </div>
        )}

        {/* Title + Rating */}
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">{item.name}</h1>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 font-medium text-yellow-600">
              ★ {rating}
            </span>
            <span className="text-gray-500">({reviewCount})</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">
              {item.basePrepMinutes ? `${item.basePrepMinutes}` : "25–35"} min
            </span>
            <span className="text-gray-400">•</span>
            <span className={item.isVeg ? "text-green-600" : "text-red-600"}>
              {item.isVeg ? "Veg" : "Non-veg"}
            </span>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-xs text-gray-700">{item.description}</p>
        )}

        {/* Spice Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-gray-800">
            <span>Kitni mirch chahiye?</span>
            <span>{spiceLevel}/5</span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            value={spiceLevel}
            onChange={(e) => setSpiceLevel(Number(e.target.value))}
            className="w-full accent-saffron"
          />
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>Mild</span>
            <span>Medium</span>
            <span>Spicy</span>
          </div>
        </div>

        {/* Add-ons / Combos */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-800">Add-ons / Combos</div>
          <div className="flex flex-wrap gap-2">
            {addons.map((addon) => {
              const isSelected = selectedAddons.includes(addon.id);
              return (
                <button
                  key={addon.id}
                  onClick={() => {
                    setSelectedAddons((prev) =>
                      isSelected
                        ? prev.filter((id) => id !== addon.id)
                        : [...prev, addon.id]
                    );
                  }}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
                    isSelected
                      ? "border-saffron bg-saffron text-white"
                      : "border-gray-200 bg-white text-gray-700"
                  }`}
                >
                  {addon.name} +₹{addon.price}
                </button>
              );
            })}
          </div>
        </div>

        {/* Estimated Prep Time */}
        <div className="flex items-center gap-2 rounded-lg bg-cream/50 p-2 text-xs">
          <svg
            className="h-4 w-4 text-saffron"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-gray-700">
            Estimated prep time: {item.basePrepMinutes ? `${item.basePrepMinutes}` : "20–25"} min
          </span>
        </div>

        {/* Quantity + Add to Cart */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 rounded-full border border-gray-200">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-2 text-sm font-medium text-gray-700"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-2 text-sm font-medium text-gray-700"
            >
              +
            </button>
          </div>
          <Button
            onClick={() => {
              const addonTotal = addons
                .filter((a) => selectedAddons.includes(a.id))
                .reduce((sum, a) => sum + a.price, 0);
              const totalPrice = (item.price + addonTotal) * quantity;
              for (let i = 0; i < quantity; i++) {
                addItem({
                  id: `${item.id}-${i}`,
                  name: `${item.name}${selectedAddons.length > 0 ? ` (with addons)` : ""}`,
                  price: item.price + addonTotal,
                });
              }
            }}
            className="flex-1"
          >
            Add to cart • ₹
            {(
              (item.price +
                addons
                  .filter((a) => selectedAddons.includes(a.id))
                  .reduce((sum, a) => sum + a.price, 0)) *
              quantity
            ).toFixed(0)}
          </Button>
        </div>
      </Card>
    </div>
  );
}

