"use client";

import { useTranslations } from "next-intl";
import { useCart } from "@/lib/CartContext";
import type { Book } from "@/lib/types";
import { useState } from "react";

export default function AddToCartButton({ book }: { book: Book }) {
  const t = useTranslations("book");
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart(book);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={handleAdd}
      className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
        added
          ? "bg-green-600 text-white"
          : "bg-[#1C1917] text-white hover:bg-[#A0785A]"
      }`}
    >
      {added ? "¡Agregado al carrito! ✓" : t("addToCart")}
    </button>
  );
}
