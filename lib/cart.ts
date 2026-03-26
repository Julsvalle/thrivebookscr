"use client";

import { CartItem, Book } from "./types";

const CART_KEY = "thrivebooks_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(book: Book): CartItem[] {
  const cart = getCart();
  const existing = cart.find((item) => item.book.id === book.id);
  let updated: CartItem[];

  if (existing) {
    updated = cart.map((item) =>
      item.book.id === book.id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
  } else {
    updated = [...cart, { book, quantity: 1 }];
  }

  saveCart(updated);
  return updated;
}

export function removeFromCart(bookId: string): CartItem[] {
  const cart = getCart();
  const updated = cart.filter((item) => item.book.id !== bookId);
  saveCart(updated);
  return updated;
}

export function updateQuantity(bookId: string, quantity: number): CartItem[] {
  if (quantity <= 0) return removeFromCart(bookId);
  const cart = getCart();
  const updated = cart.map((item) =>
    item.book.id === bookId ? { ...item, quantity } : item
  );
  saveCart(updated);
  return updated;
}

export function clearCart(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce(
    (total, item) => total + item.book.price_crc * item.quantity,
    0
  );
}

export function getCartCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export { formatCRC } from "./format";
