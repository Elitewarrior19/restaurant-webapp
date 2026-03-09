"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { useRequireRole } from "@/lib/auth-context";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { buildCloudinaryUrl } from "@/lib/cloudinary";

type Order = {
  id: string;
  totalAmount?: number;
  createdAt?: string;
  status?: string;
  deliveryId?: string | null;
  paymentMethod?: string;
  paymentStatus?: string;
  isCOD?: boolean;
};

type StockItem = {
  id: string;
  name: string;
  currentQty: number;
  lowThreshold: number;
};

type DeliveryUser = {
  id: string;
  uid: string;
  email?: string | null;
  role: string;
};

type AdminUser = {
  id: string;
  email?: string | null;
  role?: string;
  createdAt?: string;
  lastLoginAt?: string;
};

type DemoMenuItem = {
  name: string;
  categoryName: string;
  price: number;
  isVeg: boolean;
  description: string;
};

const demoMenuItems: DemoMenuItem[] = [
  {
    name: "Palermo Pizza",
    categoryName: "Pizza",
    price: 730,
    isVeg: false,
    description: "Loaded cheese + classic toppings, light crispy base."
  },
  {
    name: "Chicken B.B.Q Pizza",
    categoryName: "Pizza",
    price: 780,
    isVeg: false,
    description: "Smoky BBQ chicken, onions, extra cheese, halka sweet taste."
  },
  {
    name: "Malai Boti Pizza",
    categoryName: "Pizza",
    price: 780,
    isVeg: false,
    description: "Creamy malai boti chunks, mild masala, kids-friendly."
  },
  {
    name: "Lala's Special Pizza",
    categoryName: "Pizza",
    price: 850,
    isVeg: false,
    description: "House special toppings, double cheese, full flavour."
  },
  {
    name: "Plain Fries",
    categoryName: "Fries & Sides",
    price: 390,
    isVeg: true,
    description: "Golden crispy fries, light namak."
  },
  {
    name: "Masala Fries",
    categoryName: "Fries & Sides",
    price: 490,
    isVeg: true,
    description: "Chatpata masala, thori tez spice."
  },
  {
    name: "Cheese Fries",
    categoryName: "Fries & Sides",
    price: 440,
    isVeg: true,
    description: "Fries with melted cheese sauce on top."
  },
  {
    name: "Chicken Chowmein",
    categoryName: "Chowmein",
    price: 810,
    isVeg: false,
    description: "Street-style noodles, chicken strips, veggies, soya sauce."
  },
  {
    name: "Special Chowmein",
    categoryName: "Chowmein",
    price: 860,
    isVeg: false,
    description: "Extra chicken + veggies, thora zyada flavour."
  },
  {
    name: "BAR.B.Q Wings",
    categoryName: "Wings & Fish",
    price: 860,
    isVeg: false,
    description: "Smoky glaze, sticky sweet BBQ wings."
  },
  {
    name: "Crispy Wings",
    categoryName: "Wings & Fish",
    price: 900,
    isVeg: false,
    description: "Crispy coating, juicy andar, garlic dip ke sath."
  },
  {
    name: "Pizza Roll",
    categoryName: "Rolls",
    price: 580,
    isVeg: false,
    description: "Pizza fillings soft roll ke andar, on-the-go snack."
  },
  {
    name: "Zinger Roll",
    categoryName: "Rolls",
    price: 330,
    isVeg: false,
    description: "Crispy zinger strip, mayo, salad, soft paratha."
  },
  {
    name: "Beef Manchurian",
    categoryName: "Chicken Attraction",
    price: 1150,
    isVeg: false,
    description: "Chinese style gravy, tender beef cubes, rice ke sath best."
  },
  {
    name: "Chicken Chilli (Dry)",
    categoryName: "Chicken Attraction",
    price: 1020,
    isVeg: false,
    description: "Spicy chicken cubes, capsicum, onion, dry style."
  },
  {
    name: "Beef Spaghetti",
    categoryName: "Pastas",
    price: 990,
    isVeg: false,
    description: "Rich tomato beef sauce, parmesan sprinkle."
  },
  {
    name: "Alfredo Pasta",
    categoryName: "Pastas",
    price: 990,
    isVeg: false,
    description: "Creamy white sauce pasta, grilled chicken strips."
  },
  {
    name: "Chicken Steak Sizzling with Rice",
    categoryName: "Steak",
    price: 1570,
    isVeg: false,
    description: "Hot sizzling platter, grilled chicken + butter rice."
  },
  {
    name: "Mix Fried Rice",
    categoryName: "Rice",
    price: 590,
    isVeg: false,
    description: "Egg + chicken + veggies, full flavour."
  },
  {
    name: "Beef Tenderlion in Oyster Sauce",
    categoryName: "Beef Tenderlion",
    price: 1150,
    isVeg: false,
    description: "Soft beef strips, savoury oyster sauce, Chinese style."
  }
];

export default function AdminDashboardPage() {
  const { allowed, loading } = useRequireRole(["admin"]);
  const db = getDb();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [deliveryUsers, setDeliveryUsers] = useState<DeliveryUser[]>([]);
  const [menuName, setMenuName] = useState("");
  const [menuCategory, setMenuCategory] = useState("Burgers");
  const [menuPrice, setMenuPrice] = useState("");
  const [menuImageId, setMenuImageId] = useState<string | undefined>(undefined);
  const [creatingItem, setCreatingItem] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    async function load() {
      const [ordersSnap, stockSnap, deliverySnap, usersSnap] = await Promise.all([
        getDocs(collection(db, "orders")),
        getDocs(collection(db, "stockItems")),
        getDocs(query(collection(db, "users"), where("role", "==", "delivery"))),
        getDocs(collection(db, "users"))
      ]);
      setOrders(
        ordersSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, "id">) }))
      );
      setStock(
        stockSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<StockItem, "id">)
        }))
      );
      setDeliveryUsers(
        deliverySnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<DeliveryUser, "id">)
        }))
      );
      setUsers(
        usersSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<AdminUser, "id">)
        }))
      );
    }
    if (allowed) {
      void load();
    }
  }, [allowed, db]);

  const todayMetrics = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todaysOrders = orders.filter((o) =>
      (o.createdAt ?? "").startsWith(today)
    );
    const revenue = todaysOrders.reduce(
      (sum, o) => sum + (o.totalAmount ?? 0),
      0
    );
    return {
      orders: todaysOrders.length,
      revenue,
      aov: todaysOrders.length ? revenue / todaysOrders.length : 0
    };
  }, [orders]);

  const lowStock = stock.filter((s) => s.currentQty <= s.lowThreshold);

  if (!allowed && !loading) {
    return (
      <p className="text-xs text-gray-600">
        Sirf admin users yeh dashboard dekh sakte hain.
      </p>
    );
  }

  if (!allowed) {
    return <p className="text-xs text-gray-600">Access check ho raha hai...</p>;
  }

  async function createMenuItem(e: FormEvent) {
    e.preventDefault();
    if (!menuName || !menuPrice) return;
    setCreatingItem(true);
    try {
      await addDoc(collection(db, "menuItems"), {
        name: menuName,
        categoryName: menuCategory,
        price: Number(menuPrice),
        imageUrl: menuImageId ? buildCloudinaryUrl(menuImageId) : null,
        isActive: true
      });
      setMenuName("");
      setMenuCategory("Burgers");
      setMenuPrice("");
      setMenuImageId(undefined);
      alert("Menu item create ho gaya.");
    } catch (err) {
      console.error(err);
      alert("Menu item create nahi ho saka.");
    } finally {
      setCreatingItem(false);
    }
  }

  async function assignDelivery(orderId: string, deliveryId: string) {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        deliveryId,
        updatedAt: new Date().toISOString()
      });
      alert("Delivery assign ho gayi.");
    } catch (err) {
      console.error(err);
      alert("Assign nahi ho saka.");
    }
  }

  async function seedDemoMenu() {
    if (!window.confirm("Demo menu items add karne hain? Existing items rehain ge.")) {
      return;
    }
    try {
      const col = collection(db, "menuItems");
      await Promise.all(
        demoMenuItems.map((item) =>
          addDoc(col, {
            ...item,
            basePrepMinutes: 25,
            isActive: true,
            imageUrl: null
          })
        )
      );
      alert("Demo menu items add ho gaye.");
    } catch (err) {
      console.error(err);
      alert("Demo menu seed nahi ho saka.");
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold">Admin dashboard</h1>
      <p className="text-xs text-gray-600">
        Yahan se aap sales, stock, menu aur reports dekhein.
      </p>

      <section className="grid grid-cols-3 gap-3 text-xs">
        <Card>
          <div className="text-[11px] text-gray-500">Aaj ka revenue</div>
          <div className="mt-1 text-lg font-semibold">
            ₹{todayMetrics.revenue.toFixed(0)}
          </div>
        </Card>
        <Card>
          <div className="text-[11px] text-gray-500">Aaj ke orders</div>
          <div className="mt-1 text-lg font-semibold">
            {todayMetrics.orders}
          </div>
        </Card>
        <Card>
          <div className="text-[11px] text-gray-500">Average order value</div>
          <div className="mt-1 text-lg font-semibold">
            ₹{todayMetrics.aov.toFixed(0)}
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-2 gap-3 text-xs">
        <Card>
          <div className="mb-2 text-sm font-medium">Low stock items</div>
          {lowStock.length === 0 && (
            <p className="text-[11px] text-gray-600">
              Sab items safe level par hain.
            </p>
          )}
          <ul className="space-y-1 text-[11px] text-gray-700">
            {lowStock.map((s) => (
              <li key={s.id} className="flex items-center justify-between">
                <span>{s.name}</span>
                <span>
                  {s.currentQty} (threshold {s.lowThreshold})
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="mb-2 text-sm font-medium">Top dishes (simple)</div>
          <p className="text-[11px] text-gray-600">
            Detailed heatmaps baad mein add ho sakte hain. Filhal aap orders
            collection se manually analyze kar sakte hain.
          </p>
        </Card>
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm text-xs">
        <div className="text-sm font-medium">Orders (quick view)</div>
        {orders.length === 0 ? (
          <p className="text-[11px] text-gray-600">
            Abhi koi orders nahi.
          </p>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 10).map((o) => (
              <div
                key={o.id}
                className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-medium">
                    #{o.id.slice(-6)} • ₹{(o.totalAmount ?? 0).toFixed(0)}
                  </div>
                  <div className="text-[10px] uppercase text-gray-500">
                    {o.status ?? "received"}
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-600">
                  <span>
                    Payment:{" "}
                    {o.paymentMethod === "cod"
                      ? "Cash on delivery"
                      : o.paymentMethod === "jazzcash"
                      ? "JazzCash"
                      : o.paymentMethod === "easypaisa"
                      ? "Easypaisa"
                      : "Unknown"}
                    {o.paymentStatus && ` • ${o.paymentStatus}`}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[11px] text-gray-600">
                    Delivery: {o.deliveryId ? "assigned" : "not assigned"}
                  </div>
                  <select
                    className="rounded-full border border-gray-200 bg-cream/40 px-3 py-1 text-[11px]"
                    defaultValue=""
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      void assignDelivery(o.id, val);
                    }}
                  >
                    <option value="">Assign rider…</option>
                    {deliveryUsers.map((du) => (
                      <option key={du.uid} value={du.uid}>
                        {du.email ?? du.uid.slice(-6)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
            {orders.length > 10 && (
              <p className="text-[11px] text-gray-500">
                Showing first 10. (MVP) — baad mein full table add kar denge.
              </p>
            )}
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm text-xs">
        <div className="text-sm font-medium">Users & roles</div>
        {users.length === 0 ? (
          <p className="text-[11px] text-gray-600">
            Abhi tak koi users data load nahi hua ya users collection khaali hai.
          </p>
        ) : (
          <div className="space-y-1">
            {users.slice(0, 8).map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-lg bg-cream/50 px-3 py-1.5"
              >
                <div className="text-[11px]">
                  <div className="font-medium text-charcoal">
                    {u.email ?? u.id.slice(-6)}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Created:{" "}
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString()
                      : "n/a"}
                    {" • "}
                    Last login:{" "}
                    {u.lastLoginAt
                      ? new Date(u.lastLoginAt).toLocaleDateString()
                      : "n/a"}
                  </div>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-gray-700">
                  {u.role ?? "customer"}
                </div>
              </div>
            ))}
            {users.length > 8 && (
              <p className="text-[10px] text-gray-500">
                Sirf pehle 8 users dikhaye gaye hain. Baad me full table add ki ja sakti
                hai.
              </p>
            )}
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm text-xs">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Naya menu item add karein</div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={seedDemoMenu}
          >
            Demo menu auto-add
          </Button>
        </div>
        <form onSubmit={createMenuItem} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-gray-800">
              Item name
            </label>
            <input
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-cream/40 p-2 text-[11px] outline-none focus:border-deepGreen focus:ring-1 focus:ring-deepGreen/40"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-gray-800">
              Category
            </label>
            <select
              value={menuCategory}
              onChange={(e) => setMenuCategory(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-cream/40 p-2 text-[11px] outline-none focus:border-deepGreen focus:ring-1 focus:ring-deepGreen/40"
            >
              {["Burgers", "Biryani", "Rolls", "Fries"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-gray-800">
              Price (₹)
            </label>
            <input
              type="number"
              min={0}
              value={menuPrice}
              onChange={(e) => setMenuPrice(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-cream/40 p-2 text-[11px] outline-none focus:border-deepGreen focus:ring-1 focus:ring-deepGreen/40"
              required
            />
          </div>
          <ImageUploadField
            label="Image upload karein"
            value={menuImageId}
            onChange={setMenuImageId}
          />
          <Button type="submit" size="md" disabled={creatingItem}>
            {creatingItem ? "Ban raha hai..." : "Item add karein"}
          </Button>
        </form>
      </section>
    </div>
  );
}

