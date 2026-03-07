"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";

export function BottomCartBar() {
  const pathname = usePathname();
  const { itemCount, subtotal } = useCart();

  if (pathname?.startsWith("/checkout")) return null;
  if (itemCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-lg md:max-w-2xl lg:max-w-4xl border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-charcoal">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
          <p className="text-xs text-gray-500">
            Rs. {subtotal.toLocaleString()}
          </p>
        </div>
        <Link
          href="/checkout"
          className="rounded-xl bg-saffron px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-saffron/90"
        >
          View Cart
        </Link>
      </div>
    </div>
  );
}
