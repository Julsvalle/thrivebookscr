import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatCRC } from "@/lib/format";
import UpdateStatusButton from "./UpdateStatusButton";
import type { Order, OrderItem, Book } from "@/lib/types";

interface AdminOrderDetailProps {
  params: Promise<{ id: string }>;
}

const ALL_STATUSES = [
  { value: "pending_payment", label: "Esperando pago" },
  { value: "awaiting_confirmation", label: "Verificando pago" },
  { value: "confirmed", label: "Confirmado" },
  { value: "preparing", label: "Preparando" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
];

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: order }, { data: items }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).single(),
    supabase.from("order_items").select("*, book:books(*)").eq("order_id", id),
  ]);

  if (!order) notFound();

  const o = order as Order;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1C1917]">
            {o.order_number}
          </h1>
          <p className="text-sm text-[#78716C] mt-0.5">
            {new Date(o.created_at).toLocaleString("es-CR")}
          </p>
        </div>
      </div>

      {/* Update status */}
      <div className="bg-white border border-[#E8E3DC] rounded-2xl p-5 mb-5">
        <h2 className="font-semibold text-[#1C1917] mb-4 text-sm">
          Actualizar estado
        </h2>
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map(({ value, label }) => (
            <UpdateStatusButton
              key={value}
              orderId={o.id}
              status={value}
              label={label}
              isCurrent={o.status === value}
            />
          ))}
        </div>
      </div>

      {/* Order items */}
      <div className="bg-white border border-[#E8E3DC] rounded-2xl p-5 mb-5">
        <h2 className="font-semibold text-[#1C1917] mb-4 text-sm">
          Libros pedidos
        </h2>
        <ul className="space-y-3">
          {(items as (OrderItem & { book: Book })[] ?? []).map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <div>
                <p className="font-medium text-[#1C1917]">
                  {item.book?.title ?? "—"}
                </p>
                <p className="text-xs text-[#78716C]">
                  {item.book?.author} · x{item.quantity}
                </p>
              </div>
              <span className="font-medium text-[#1C1917]">
                {formatCRC(item.unit_price_crc * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-t border-[#F0EBE5] mt-4 pt-3 flex justify-between font-bold text-[#1C1917]">
          <span>Total</span>
          <span>{formatCRC(o.total_crc)}</span>
        </div>
      </div>

      {/* Customer info */}
      <div className="bg-white border border-[#E8E3DC] rounded-2xl p-5">
        <h2 className="font-semibold text-[#1C1917] mb-4 text-sm">
          Información del cliente
        </h2>
        <dl className="space-y-2 text-sm">
          <Row label="Nombre" value={o.guest_name ?? "—"} />
          <Row label="Email" value={o.guest_email ?? "—"} />
          <Row label="Teléfono" value={o.guest_phone ?? "—"} />
          <Row
            label="Método de envío"
            value={
              o.shipping_method === "uber_flash"
                ? "Uber Flash"
                : o.shipping_method === "didi"
                ? "Didi Envíos"
                : "Correos CR"
            }
          />
          {o.shipping_address && (
            <Row
              label="Dirección"
              value={`${(o.shipping_address as any).address_line}, ${(o.shipping_address as any).canton}, ${(o.shipping_address as any).province}`}
            />
          )}
          {o.sinpe_confirmed_at && (
            <Row
              label="SINPE confirmado"
              value={new Date(o.sinpe_confirmed_at).toLocaleString("es-CR")}
            />
          )}
        </dl>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="text-[#78716C] w-36 flex-shrink-0">{label}</dt>
      <dd className="text-[#1C1917]">{value}</dd>
    </div>
  );
}
