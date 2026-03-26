import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { formatCRC } from "@/lib/format";
import ConfirmPaymentButton from "./ConfirmPaymentButton";
import type { Order, OrderItem, Book } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Confirmación de pedido" };

// Your SINPE Móvil number — change this!
const SINPE_NUMBER = "8888-8888";
const SINPE_NAME = "ThrivebooksCR";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const t = await getTranslations("order");

  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (!order) notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("*, book:books(*)")
    .eq("order_id", id);

  const o = order as Order;
  const STATUS_COLORS: Record<string, string> = {
    pending_payment: "bg-amber-100 text-amber-800",
    awaiting_confirmation: "bg-blue-100 text-blue-800",
    confirmed: "bg-green-100 text-green-800",
    preparing: "bg-purple-100 text-purple-800",
    shipped: "bg-teal-100 text-teal-800",
    delivered: "bg-gray-100 text-gray-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const statusColor =
    STATUS_COLORS[o.status] ?? "bg-gray-100 text-gray-700";

  const needsPayment =
    o.status === "pending_payment" || o.status === "awaiting_confirmation";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">
          {o.status === "delivered"
            ? "🎉"
            : o.status === "cancelled"
            ? "❌"
            : "✅"}
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#1C1917]">
          {t("title")}
        </h1>
        <p className="text-[#57534E] mt-2">{t("subtitle")}</p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="text-sm text-[#78716C]">
            {t("number")} <strong>{o.order_number}</strong>
          </span>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor}`}
          >
            {t(`statuses.${o.status}` as any)}
          </span>
        </div>
      </div>

      {/* SINPE Payment Box */}
      {needsPayment && (
        <div className="bg-[#FDF8F4] border border-[#D6CFC7] rounded-2xl p-6 mb-8">
          <h2 className="font-serif text-xl font-semibold text-[#1C1917] mb-5">
            {t("sinpeTitle")}
          </h2>

          <div className="space-y-4">
            <PaymentRow
              label={t("sinpeNumber")}
              value={SINPE_NUMBER}
              highlight
              subtext={SINPE_NAME}
            />
            <PaymentRow
              label={t("sinpeAmount")}
              value={formatCRC(o.total_crc)}
              highlight
            />
            <PaymentRow
              label={t("sinpeConcept")}
              value={o.order_number}
              highlight
            />
          </div>

          <div className="mt-5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            ⚠️ {t("sinpeWarning")}
          </div>

          {o.status === "pending_payment" && (
            <div className="mt-5">
              <ConfirmPaymentButton orderId={o.id} />
              <p className="text-xs text-[#78716C] text-center mt-2">
                {t("confirmationNote")}
              </p>
            </div>
          )}

          {o.status === "awaiting_confirmation" && (
            <div className="mt-5 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 text-center">
              Pago enviado — estamos verificando tu transferencia. 🔍
            </div>
          )}
        </div>
      )}

      {/* Order summary */}
      <div className="bg-white border border-[#E8E3DC] rounded-2xl p-6 mb-8">
        <h2 className="font-semibold text-[#1C1917] mb-4">
          Resumen del pedido
        </h2>
        <ul className="space-y-3">
          {(items ?? []).map((item: OrderItem & { book: Book }) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span className="text-[#57534E]">
                {item.book?.title ?? "Libro"}
                {item.quantity > 1 && (
                  <span className="text-[#78716C] ml-1">×{item.quantity}</span>
                )}
              </span>
              <span className="font-medium text-[#1C1917]">
                {formatCRC(item.unit_price_crc * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-t border-[#E8E3DC] mt-4 pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-[#57534E]">
            <span>Envío</span>
            <span>{o.shipping_method === "correos" ? "₡3,000" : o.shipping_method === "uber_flash" ? "₡2,500" : "₡2,000"}</span>
          </div>
          <div className="flex justify-between font-bold text-[#1C1917] text-base pt-1">
            <span>Total</span>
            <span>{formatCRC(o.total_crc)}</span>
          </div>
        </div>
      </div>

      {/* Shipping info */}
      <div className="bg-white border border-[#E8E3DC] rounded-2xl p-6">
        <h2 className="font-semibold text-[#1C1917] mb-3">
          Información de envío
        </h2>
        <dl className="space-y-2 text-sm">
          <div className="flex gap-3">
            <dt className="text-[#78716C] w-28 flex-shrink-0">Destinatario</dt>
            <dd className="text-[#1C1917]">
              {o.guest_name ?? "—"}
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="text-[#78716C] w-28 flex-shrink-0">Teléfono</dt>
            <dd className="text-[#1C1917]">{o.guest_phone ?? "—"}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="text-[#78716C] w-28 flex-shrink-0">Método</dt>
            <dd className="text-[#1C1917]">
              {o.shipping_method === "uber_flash"
                ? "Uber Flash"
                : o.shipping_method === "didi"
                ? "Didi Envíos"
                : "Correos de Costa Rica"}
            </dd>
          </div>
          {o.shipping_address && (
            <div className="flex gap-3">
              <dt className="text-[#78716C] w-28 flex-shrink-0">Dirección</dt>
              <dd className="text-[#1C1917]">
                {(o.shipping_address as any).address_line},{" "}
                {(o.shipping_address as any).canton},{" "}
                {(o.shipping_address as any).province}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

function PaymentRow({
  label,
  value,
  highlight,
  subtext,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  subtext?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-[#57534E] flex-shrink-0">{label}</span>
      <div className="text-right">
        <span
          className={`font-bold ${
            highlight ? "text-[#1C1917] text-lg" : "text-[#1C1917]"
          }`}
        >
          {value}
        </span>
        {subtext && (
          <p className="text-xs text-[#78716C]">{subtext}</p>
        )}
      </div>
    </div>
  );
}
