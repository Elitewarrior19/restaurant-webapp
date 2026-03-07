"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";

export function FloatingCart() {
  const pathname = usePathname();
  const { itemCount, subtotal, items } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  if (pathname?.startsWith("/checkout")) return null;
  if (itemCount === 0) return null;

  return (
    <>
      <Link
        href="/checkout"
        className="fixed bottom-6 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-saffron text-white shadow-lg shadow-saffron/40 transition hover:scale-110 hover:shadow-xl"
        aria-label={`Cart with ${itemCount} items`}
      >
        <div className="relative">
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {itemCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-deepGreen text-[10px] font-bold text-white">
              {itemCount > 9 ? "9+" : itemCount}
            </span>
          )}
        </div>
      </Link>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setIsOpen(false)}>
          <div
            className="fixed bottom-24 right-4 z-50 max-h-64 w-72 overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 text-xs font-semibold">Cart — {itemCount} items</div>
            <div className="space-y-2 text-[11px]">
              {items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <span className="truncate">{item.name}</span>
                  <span className="ml-2 font-medium">
                    ₹{(item.price * item.qty).toFixed(0)}
                  </span>
                </div>
              ))}
              {items.length > 3 && (
                <div className="text-[10px] text-gray-500">
                  +{items.length - 3} more items
                </div>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-2 text-xs font-semibold">
              <span>Total</span>
              <span>₹{subtotal.toFixed(0)}</span>
            </div>
            <Link
              href="/checkout"
              className="mt-2 block w-full rounded-full bg-saffron px-4 py-2 text-center text-xs font-medium text-white"
            >
              Checkout
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
