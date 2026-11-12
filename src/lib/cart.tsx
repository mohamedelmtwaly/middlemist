import { createContext, useContext, useState, type ReactNode } from "react";
import { WHATSAPP } from "./store-data";

export type CartItem = {
  key: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  options?: string[];
};

type Ctx = {
  items: CartItem[];
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (item: Omit<CartItem, "key" | "qty">) => void;
  setQty: (key: string, qty: number) => void;
  total: number;
  count: number;
};

const CartContext = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  const add: Ctx["add"] = (item) => {
    const key = item.name + "|" + (item.options ?? []).join("|") + "|" + item.price;
    setItems((prev) => {
      const ex = prev.find((i) => i.key === key);
      if (ex) return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...item, key, qty: 1 }];
    });
    setOpen(true);
  };
  const setQty = (key: string, qty: number) =>
    setItems((prev) => (qty <= 0 ? prev.filter((i) => i.key !== key) : prev.map((i) => (i.key === key ? { ...i, qty } : i))));

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);
  return <CartContext.Provider value={{ items, open, setOpen, add, setQty, total, count }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart outside provider");
  return c;
}

export function whatsappOrderUrl(items: CartItem[], total: number, note: string) {
  const lines = items.map(
    (i) => `• ${i.name} × ${i.qty} — ${i.price * i.qty} ر.س${i.options?.length ? "\n   " + i.options.join("\n   ") : ""}`,
  );
  const msg = `مرحباً Middlemist Flower 🌸\nأرغب بطلب:\n${lines.join("\n")}\n\nالإجمالي: ${total} ر.س${note ? `\nملاحظات: ${note}` : ""}`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
}
