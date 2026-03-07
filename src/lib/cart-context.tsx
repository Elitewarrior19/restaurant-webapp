"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode
} from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

type CartState = {
  items: CartItem[];
};

type CartAction =
  | { type: "hydrate"; payload: CartState }
  | { type: "add"; payload: { id: string; name: string; price: number; qty?: number } }
  | { type: "remove"; payload: { id: string } }
  | { type: "setQty"; payload: { id: string; qty: number } }
  | { type: "clear" };

const STORAGE_KEY = "lalas_foods_cart_v1";

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return action.payload;
    case "add": {
      const qtyToAdd = action.payload.qty ?? 1;
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === action.payload.id ? { ...i, qty: i.qty + qtyToAdd } : i
          )
        };
      }
      return {
        items: [
          ...state.items,
          {
            id: action.payload.id,
            name: action.payload.name,
            price: action.payload.price,
            qty: qtyToAdd
          }
        ]
      };
    }
    case "remove":
      return { items: state.items.filter((i) => i.id !== action.payload.id) };
    case "setQty": {
      const qty = Math.max(0, Math.floor(action.payload.qty));
      if (qty === 0) {
        return { items: state.items.filter((i) => i.id !== action.payload.id) };
      }
      return {
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, qty } : i
        )
      };
    }
    case "clear":
      return { items: [] };
    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: { id: string; name: string; price: number; qty?: number }) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as CartState;
      if (!parsed?.items) return;
      dispatch({ type: "hydrate", payload: parsed });
    } catch {
      // ignore corrupted storage
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage failures
    }
  }, [state]);

  const derived = useMemo(() => {
    const itemCount = state.items.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = state.items.reduce((sum, i) => sum + i.qty * i.price, 0);
    return { itemCount, subtotal };
  }, [state.items]);

  const value: CartContextValue = {
    items: state.items,
    itemCount: derived.itemCount,
    subtotal: derived.subtotal,
    addItem: (item) => dispatch({ type: "add", payload: item }),
    removeItem: (id) => dispatch({ type: "remove", payload: { id } }),
    setQty: (id, qty) => dispatch({ type: "setQty", payload: { id, qty } }),
    clear: () => dispatch({ type: "clear" })
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

