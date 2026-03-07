"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export function NavBar() {
  const { user, loading } = useAuth();
  const isStaff = user && ["kitchen", "delivery", "admin"].includes(user.role);

  return (
    <nav className="flex items-center gap-1.5 sm:gap-2.5">
      <Link
        href="/menu"
        className="inline-flex h-9 items-center rounded-full px-3 text-xs font-medium text-gray-700 transition hover:bg-gray-100 hover:text-charcoal sm:text-sm"
      >
        Menu
      </Link>
      <Link
        href="/order/track"
        className="hidden h-9 items-center rounded-full px-3 text-xs font-medium text-gray-600 transition hover:bg-gray-100 hover:text-charcoal sm:inline-flex sm:text-sm"
      >
        Track order
      </Link>

      {!loading && isStaff && (
        <Link
          href="/admin"
          className="hidden h-9 items-center rounded-full border border-gray-200 bg-white px-3 text-[11px] font-medium text-gray-700 transition hover:border-deepGreen hover:bg-deepGreen/5 hover:text-deepGreen sm:inline-flex"
        >
          Admin
        </Link>
      )}

      {user ? (
        <Link
          href="/checkout"
          className="inline-flex h-9 items-center gap-2 rounded-full bg-deepGreen px-3 text-xs font-medium text-cream shadow-sm transition hover:bg-deepGreen-hover sm:text-sm"
          aria-label="Account & checkout"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cream/10 text-[11px] font-semibold">
            {user.email?.[0]?.toUpperCase() ?? user.name?.[0] ?? "U"}
          </span>
          <span className="hidden sm:inline">Account</span>
        </Link>
      ) : (
        <>
          <Link
            href="/login"
            className="hidden h-9 items-center rounded-full px-3 text-[11px] font-medium text-gray-700 transition hover:bg-gray-100 hover:text-charcoal sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-9 items-center rounded-full bg-saffron px-3 text-[11px] font-semibold text-white shadow-sm transition hover:bg-saffron-hover sm:px-4 sm:text-sm"
          >
            Sign up
          </Link>
        </>
      )}
    </nav>
  );
}
