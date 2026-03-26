import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatCRC } from "@/lib/format";
import type { Order } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "bg-amber-100 text-amber-800",
  awaiting_confirmation: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  preparing: "bg-purple-100 text-purple-800",
  shipped: "bg-teal-100 text-teal-800",
  delivered: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Esperando pago",
  awaiting_confirmation: "Verificando pago",
  confirmed: "Confirmado",
  preparing: "Preparando",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data: orders } = await query;

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-[#1C1917] mb-6">
        Pedidos
      </h1>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterLink label="Todos" href="/admin/pedidos" active={!status} />
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <FilterLink
            key={key}
            label={label}
            href={`/admin/pedidos?status=${key}`}
            active={status === key}
          />
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E3DC] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F1ED]">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#78716C] uppercase tracking-wide">
                  Pedido
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#78716C] uppercase tracking-wide">
                  Cliente
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#78716C] uppercase tracking-wide">
                  Total
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#78716C] uppercase tracking-wide">
                  Envío
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#78716C] uppercase tracking-wide">
                  Estado
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#78716C] uppercase tracking-wide">
                  Fecha
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE5]">
              {(orders as Order[] ?? []).map((order) => (
                <tr key={order.id} className="hover:bg-[#FAFAF7]">
                  <td className="px-5 py-3.5 font-mono text-xs text-[#1C1917]">
                    {order.order_number}
                  </td>
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="text-[#1C1917]">{order.guest_name ?? "—"}</p>
                      <p className="text-xs text-[#78716C]">{order.guest_phone ?? ""}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-[#1C1917]">
                    {formatCRC(order.total_crc)}
                  </td>
                  <td className="px-4 py-3.5 text-[#57534E] text-xs">
                    {order.shipping_method === "uber_flash"
                      ? "Uber Flash"
                      : order.shipping_method === "didi"
                      ? "Didi"
                      : "Correos CR"}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        STATUS_COLORS[order.status] ?? "bg-gray-100"
                      }`}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#78716C]">
                    {new Date(order.created_at).toLocaleDateString("es-CR")}
                  </td>
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="text-xs text-[#A0785A] hover:underline"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
              {(!orders || orders.length === 0) && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-[#78716C]"
                  >
                    No hay pedidos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FilterLink({
  label, href, active,
}: {
  label: string; href: string; active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
        active
          ? "bg-[#1C1917] text-white"
          : "bg-white border border-[#D6CFC7] text-[#57534E] hover:border-[#A0785A]"
      }`}
    >
      {label}
    </Link>
  );
}
