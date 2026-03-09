"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { addDoc, collection } from "firebase/firestore";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { getDb } from "@/lib/firebase";
import { trackEvent } from "@/lib/analytics";

type Location = {
  lat: number;
  lng: number;
};

const DynamicMapPicker = dynamic(
  () => import("@/components/maps/MapPicker").then((m) => m.MapPicker),
  { ssr: false }
);

export default function CheckoutPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<"delivery" | "payment" | "review">("delivery");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [deliveryOption, setDeliveryOption] = useState<"asap" | "schedule">("asap");
  const [scheduledTime, setScheduledTime] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<Location | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"jazzcash" | "easypaisa" | "cod">("cod");
  const [paymentConfirmed, setPaymentConfirmed] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  const [orderNotes, setOrderNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const { items, subtotal, setQty, removeItem, clear, itemCount } = useCart();
  const { user } = useAuth();

  const tipPresets = [50, 100, 200, 500];
  const finalTotal = subtotal + tipAmount;

  async function detectCurrentLocation() {
    if (!("geolocation" in navigator)) {
      setLocationError("Aapka browser location support nahi karta.");
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        try {
          const res = await fetch(
            `/api/geocode?lat=${latitude}&lng=${longitude}`
          );
          if (res.ok) {
            const data = (await res.json()) as { address?: string };
            if (data.address) {
              setAddress(data.address);
            }
          }
        } catch {
          // ignore, manual entry still works
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        console.error(err);
        setLocating(false);
        setLocationError(
          "Location nahi mil saki. Permission allow kar ke dobara try karein."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleSelectPayment(method: "jazzcash" | "easypaisa" | "cod") {
    setPaymentMethod(method);
    // COD ko online gateway ki zaroorat nahi, isliye confirm by default.
    setPaymentConfirmed(method === "cod");
  }

  async function handleDemoPayment() {
    if (paymentMethod === "cod") return;
    setProcessingPayment(true);
    try {
      const res = await fetch("/api/payments/demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          method: paymentMethod,
          amount: finalTotal
        })
      });
      if (!res.ok) {
        throw new Error("Payment failed");
      }
      setPaymentConfirmed(true);
      alert(
        "Demo payment successful. Ye sirf testing hai, koi real paisa charge nahi hua."
      );
    } catch (err) {
      console.error(err);
      alert("Payment demo fail ho gaya. Thori dair baad dobara try karein.");
    } finally {
      setProcessingPayment(false);
    }
  }

  async function handlePlaceOrder() {
    if (!user) {
      router.push("/login");
      return;
    }
    if (itemCount === 0) {
      alert("Cart khaali hai. Pehle menu se items add karein.");
      return;
    }
    if (deliveryType === "delivery" && !address.trim()) {
      alert("Delivery address likhein ya current location use karein.");
      return;
    }
    if (paymentMethod !== "cod" && !paymentConfirmed) {
      alert("Pehele JazzCash / Easypaisa demo payment complete karein.");
      return;
    }
    setPlacing(true);
    try {
      const db = getDb();
      const isCOD = paymentMethod === "cod";
      const order = {
        userId: user.uid,
        status: "received",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deliveryId: null,
        items: items.map((i) => ({
          itemId: i.id,
          name: i.name,
          qty: i.qty,
          price: i.price
        })),
        totalAmount: finalTotal,
        tipAmount,
        orderNotes: orderNotes.trim() || null,
        deliveryOption,
        scheduledTime: deliveryOption === "schedule" ? scheduledTime : null,
        paymentMethod,
        paymentProvider: paymentMethod,
        isCOD,
        paymentStatus: isCOD ? "pending_cod" : "paid_demo",
        deliveryType,
        deliveryAddress: deliveryType === "delivery" ? address.trim() : null,
        location: location ?? null,
        etaMinutes: 35
      };
      const ref = await addDoc(collection(db, "orders"), order);
      void trackEvent("order_placed", { order_id: ref.id, total: subtotal });
      clear();
      router.push(`/order/${ref.id}/track`);
    } catch (err) {
      console.error(err);
      alert("Order place nahi ho saka. Thori dair baad try karein.");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Checkout</h1>
        <p className="text-xs text-gray-600">
          Address, payment aur timing choose karein.
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
        {(["delivery", "payment", "review"] as const).map((step, idx) => (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex flex-1 flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                  currentStep === step
                    ? "bg-saffron text-white"
                    : idx < (["delivery", "payment", "review"] as const).indexOf(currentStep)
                    ? "bg-deepGreen text-cream"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {idx + 1}
              </div>
              <span className="mt-1 text-[10px] capitalize">{step}</span>
            </div>
            {idx < 2 && (
              <div
                className={`h-0.5 flex-1 ${
                  idx < (["delivery", "payment", "review"] as const).indexOf(currentStep)
                    ? "bg-deepGreen"
                    : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Delivery Step */}
      {currentStep === "delivery" && (
        <>
          <section className="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-xs font-medium text-gray-800">
              Delivery ya pickup?
            </div>
        <div className="mt-2 flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => setDeliveryType("delivery")}
            className={`flex-1 rounded-full border px-3 py-2 ${
              deliveryType === "delivery"
                ? "border-deepGreen bg-deepGreen text-cream"
                : "border-gray-200 bg-white text-gray-700"
            }`}
          >
            Delivery
          </button>
          <button
            type="button"
            onClick={() => setDeliveryType("pickup")}
            className={`flex-1 rounded-full border px-3 py-2 ${
              deliveryType === "pickup"
                ? "border-deepGreen bg-deepGreen text-cream"
                : "border-gray-200 bg-white text-gray-700"
            }`}
          >
            Pickup
          </button>
        </div>
      </section>

      {deliveryType === "delivery" && (
        <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-gray-800">
              Delivery address
            </div>
            <button
              type="button"
              onClick={detectCurrentLocation}
              className="text-[11px] text-saffron underline-offset-2 hover:underline"
            >
              GPS se pin set karein
            </button>
          </div>
          <p className="text-[11px] text-gray-500">
            Map par tap karke pin set karein, ya niche address manually likhein.
          </p>
          <DynamicMapPicker
            value={location}
            onChange={(loc) => setLocation(loc)}
            onAddressChange={(addr) => setAddress(addr)}
          />
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-cream/40 p-2 text-xs outline-none focus:border-deepGreen focus:ring-1 focus:ring-deepGreen/40"
            placeholder="Flat / floor / landmark yahan likhein..."
          />
          {location && (
            <p className="text-[11px] text-gray-500">
              Map pin: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </p>
          )}
          {locating && (
            <p className="text-[11px] text-gray-500">
              Aapki location fetch ho rahi hai...
            </p>
          )}
          {locationError && (
            <p className="text-[11px] text-red-600">{locationError}</p>
          )}
        </section>
      )}

          <Button
            className="w-full"
            onClick={() => {
              if (deliveryType === "delivery" && !address.trim()) {
                alert("Delivery address likhein ya current location use karein.");
                return;
              }
              setCurrentStep("payment");
            }}
          >
            Continue to Payment
          </Button>
        </>
      )}

      {/* Payment Step */}
      {currentStep === "payment" && (
        <>
          <section className="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-xs font-medium text-gray-800">Payment options</div>
            <div className="grid grid-cols-3 gap-2">
              {(["jazzcash", "easypaisa", "cod"] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => handleSelectPayment(method)}
                  className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                    paymentMethod === method
                      ? "border-saffron bg-saffron text-white"
                      : "border-gray-200 bg-white text-gray-700"
                  }`}
                >
                  {method === "cod"
                    ? "Cash on delivery"
                    : method === "jazzcash"
                    ? "JazzCash"
                    : "Easypaisa"}
                </button>
              ))}
            </div>
            {paymentMethod !== "cod" && (
              <div className="mt-3 space-y-1 rounded-xl bg-cream/60 p-3 text-[11px] text-gray-700">
                <p className="font-medium">
                  JazzCash / Easypaisa demo mode (testing only)
                </p>
                <p>
                  Abhi ye demo integration hai – button press karne se sirf Firestore me
                  payment status update hoga, koi real paisa charge nahi hoga.
                </p>
                <Button
                  size="sm"
                  className="mt-1"
                  disabled={processingPayment}
                  onClick={handleDemoPayment}
                >
                  {processingPayment ? "Processing..." : "Demo payment complete karein"}
                </Button>
              </div>
            )}
          </section>

          {/* Tip Slider */}
          <section className="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-xs font-medium text-gray-800">Tip</div>
            <div className="flex gap-2">
              {tipPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTipAmount(preset)}
                  className={`flex-1 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    tipAmount === preset
                      ? "border-saffron bg-saffron text-white"
                      : "border-gray-200 bg-white text-gray-700"
                  }`}
                >
                  ₹{preset}
                </button>
              ))}
            </div>
            <div className="mt-2">
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span>Custom tip</span>
                <span>₹{tipAmount}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={tipAmount}
                onChange={(e) => setTipAmount(Number(e.target.value))}
                className="w-full accent-saffron"
              />
            </div>
          </section>

          {/* Order Notes */}
          <section className="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-xs font-medium text-gray-800">Order notes</div>
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-200 bg-cream/40 p-2 text-xs outline-none focus:border-saffron focus:ring-1 focus:ring-saffron/40"
              placeholder="Any special instructions..."
            />
          </section>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setCurrentStep("delivery")}
            >
              Back
            </Button>
            <Button className="flex-1" onClick={() => setCurrentStep("review")}>
              Review Order
            </Button>
          </div>
        </>
      )}

      {/* Review Step */}
      {currentStep === "review" && (
        <>
          <section className="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-xs font-medium text-gray-800">Order summary</div>
            {items.length === 0 ? (
              <p className="text-[11px] text-gray-500">
                Cart khaali hai. Menu se items add karein.
              </p>
            ) : (
              <div className="space-y-2">
                <ul className="space-y-2 text-[11px]">
                  {items.map((it) => (
                    <li key={it.id} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate font-medium text-gray-800">
                          {it.name}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          ₹{it.price.toFixed(0)} each
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="h-7 w-7 rounded-full border border-gray-200 bg-white text-xs"
                          onClick={() => setQty(it.id, it.qty - 1)}
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-xs">{it.qty}</span>
                        <button
                          type="button"
                          className="h-7 w-7 rounded-full border border-gray-200 bg-white text-xs"
                          onClick={() => setQty(it.id, it.qty + 1)}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="text-[10px] text-red-600 underline"
                          onClick={() => removeItem(it.id)}
                        >
                          remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="space-y-1 pt-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tip</span>
                    <span className="font-medium">₹{tipAmount.toFixed(0)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-2 font-semibold">
                    <span>Total</span>
                    <span>₹{finalTotal.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            )}

            <label className="mt-2 flex items-center gap-2 rounded-xl bg-cream/50 p-3 text-[11px] text-gray-600">
              <input type="checkbox" className="h-3 w-3 rounded border-gray-300" required />{" "}
              Main T&amp;C accept karta/karti hoon.
            </label>

            <div className="rounded-xl bg-amber-50 p-3 text-[11px] text-amber-800">
              Aapka order 5–10 min ke liye reserve hoga.
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setCurrentStep("payment")}
              >
                Back
              </Button>
              <Button className="flex-1" onClick={handlePlaceOrder} disabled={placing}>
                {placing ? "Order place ho raha hai..." : `Place Order — ₹${finalTotal.toFixed(0)}`}
              </Button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

