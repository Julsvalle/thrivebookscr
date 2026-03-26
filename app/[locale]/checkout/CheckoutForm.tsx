"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCart } from "@/lib/CartContext";
import { formatCRC } from "@/lib/cart";
import { SHIPPING_COSTS, ShippingMethod } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

const PROVINCES = [
  "san_jose",
  "alajuela",
  "cartago",
  "heredia",
  "guanacaste",
  "puntarenas",
  "limon",
] as const;

const SHIPPING_METHODS: ShippingMethod[] = ["uber_flash", "didi", "correos"];

export default function CheckoutForm() {
  const t = useTranslations("checkout");
  const tProv = useTranslations("provinces");
  const router = useRouter();
  const { items, total, clearCart } = useCart();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    shipping_method: "correos" as ShippingMethod,
    province: "san_jose",
    canton: "",
    address_line: "",
    address_notes: "",
    create_account: false,
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const shippingCost = SHIPPING_COSTS[form.shipping_method];
  const orderTotal = total + shippingCost;

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (items.length === 0) {
      setError("Tu carrito está vacío.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Generate a unique order number
      const year = new Date().getFullYear();
      const rand = Math.floor(Math.random() * 9000) + 1000;
      const orderNumber = `TB-${year}-${rand}`;

      // Insert order
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          guest_name: form.name,
          guest_email: form.email,
          guest_phone: form.phone,
          shipping_method: form.shipping_method,
          shipping_address: {
            province: form.province,
            canton: form.canton,
            address_line: form.address_line,
            notes: form.address_notes,
          },
          status: "pending_payment",
          total_crc: orderTotal,
        })
        .select("id")
        .single();

      if (orderErr || !order) {
        throw new Error(orderErr?.message ?? "Error al crear el pedido");
      }

      // Insert order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        book_id: item.book.id,
        quantity: item.quantity,
        unit_price_crc: item.book.price_crc,
      }));

      const { error: itemsErr } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsErr) throw new Error(itemsErr.message);

      // Clear cart and redirect
      clearCart();
      router.push(`/pedido/${order.id}`);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al procesar el pedido"
      );
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="text-5xl">🛒</span>
        <p className="text-[#57534E]">Tu carrito está vacío.</p>
        <a href="/libros" className="text-sm text-[#A0785A] hover:underline">
          Ver catálogo
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Form fields */}
      <div className="lg:col-span-2 space-y-8">
        {/* Contact info */}
        <section>
          <h2 className="font-semibold text-[#1C1917] mb-4">
            {t("contactInfo")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label={t("name")}
              required
              value={form.name}
              onChange={(v) => set("name", v)}
            />
            <Field
              label={t("email")}
              type="email"
              required
              value={form.email}
              onChange={(v) => set("email", v)}
            />
            <Field
              label={t("phone")}
              type="tel"
              placeholder="8888-8888"
              required
              value={form.phone}
              onChange={(v) => set("phone", v)}
            />
          </div>
        </section>

        {/* Shipping method */}
        <section>
          <h2 className="font-semibold text-[#1C1917] mb-4">{t("shipping")}</h2>
          <div className="space-y-3">
            {SHIPPING_METHODS.map((method) => (
              <label
                key={method}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  form.shipping_method === method
                    ? "border-[#A0785A] bg-[#FDF8F4]"
                    : "border-[#D6CFC7] hover:border-[#A0785A]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    value={method}
                    checked={form.shipping_method === method}
                    onChange={() => set("shipping_method", method)}
                    className="accent-[#A0785A]"
                  />
                  <span className="text-sm text-[#1C1917]">
                    {t(`shippingMethods.${method}` as any)}
                  </span>
                </div>
                <span className="text-sm font-semibold text-[#A0785A]">
                  {formatCRC(SHIPPING_COSTS[method])}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Address */}
        <section>
          <h2 className="font-semibold text-[#1C1917] mb-4">{t("address")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Province */}
            <div>
              <label className="block text-xs font-medium text-[#57534E] mb-1.5">
                {t("province")}
              </label>
              <select
                value={form.province}
                onChange={(e) => set("province", e.target.value)}
                className="w-full border border-[#D6CFC7] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#A0785A]"
              >
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {tProv(p)}
                  </option>
                ))}
              </select>
            </div>

            <Field
              label={t("canton")}
              required
              placeholder="Ej: Escazú"
              value={form.canton}
              onChange={(v) => set("canton", v)}
            />
            <div className="sm:col-span-2">
              <Field
                label={t("addressLine")}
                required
                placeholder="Calle, barrio, señas..."
                value={form.address_line}
                onChange={(v) => set("address_line", v)}
              />
            </div>
            <div className="sm:col-span-2">
              <Field
                label={t("addressNotes")}
                placeholder="Color de la casa, portón azul..."
                value={form.address_notes}
                onChange={(v) => set("address_notes", v)}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Right: Order summary */}
      <div className="lg:col-span-1">
        <div className="bg-[#F5F1ED] rounded-2xl p-6 sticky top-20">
          <h2 className="font-semibold text-[#1C1917] mb-4">
            {t("orderSummary")}
          </h2>

          <ul className="space-y-3 mb-4">
            {items.map(({ book, quantity }) => (
              <li key={book.id} className="flex justify-between text-sm">
                <span className="text-[#57534E] flex-1 pr-2 truncate">
                  {book.title}{" "}
                  {quantity > 1 && (
                    <span className="text-[#78716C]">×{quantity}</span>
                  )}
                </span>
                <span className="font-medium text-[#1C1917]">
                  {formatCRC(book.price_crc * quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="border-t border-[#D6CFC7] pt-3 space-y-2">
            <div className="flex justify-between text-sm text-[#57534E]">
              <span>Subtotal</span>
              <span>{formatCRC(total)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#57534E]">
              <span>{t("shippingCost")}</span>
              <span>{formatCRC(shippingCost)}</span>
            </div>
            <div className="flex justify-between font-bold text-[#1C1917] pt-1 border-t border-[#D6CFC7]">
              <span>{t("total")}</span>
              <span>{formatCRC(orderTotal)}</span>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full bg-[#1C1917] text-white text-sm font-semibold py-3.5 rounded-xl hover:bg-[#A0785A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Procesando..." : t("placeOrder")}
          </button>

          <p className="mt-3 text-xs text-[#78716C] text-center">
            Pagarás por SINPE Móvil después de confirmar
          </p>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
  required,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#57534E] mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-[#D6CFC7] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#A0785A] focus:border-transparent"
      />
    </div>
  );
}
