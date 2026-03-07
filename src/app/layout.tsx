import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { BottomCartBar } from "@/components/layout/BottomCartBar";
import { NavBar } from "@/components/layout/NavBar";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";

export const metadata: Metadata = {
  title: "Lala's Foods — Order Online",
  description: "Fresh food, fast delivery. Pizza, steaks, biryani & more — order in minutes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream font-sans text-charcoal antialiased">
        <AuthProvider>
          <CartProvider>
            <div className="mx-auto min-h-screen max-w-xl md:max-w-2xl lg:max-w-4xl px-3 sm:px-4">
              {/* Header */}
              <header className="sticky top-0 z-20 border-b border-white/40 bg-white/80 shadow-sm backdrop-blur-xl">
                <div className="flex h-14 items-center justify-between">
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-saffron font-bold text-white shadow-md">
                      L
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-charcoal">
                        Lala&apos;s Foods
                      </span>
                      <span className="block text-[10px] text-gray-500">
                        Wood-fired pizza & more
                      </span>
                    </div>
                  </Link>
                  <NavBar />
                </div>
              </header>

              {/* Main */}
              <main className="pb-24 pt-5 sm:pt-6">{children}</main>

              {/* Cart Bar */}
              <BottomCartBar />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
