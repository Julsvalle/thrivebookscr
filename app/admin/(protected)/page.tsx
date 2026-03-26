import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatCRC } from "@/lib/format";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [{ count: totalBooks }, { count: totalOrders }, { data: recentOrders }] =
    await Promise.all([
      supabase
        .from("books")
        .select("*", { count: "exact", head: true })
        .eq("active", true),
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const pendingCount = recentOrders?.filter(
    (o) => o.status === "pending_payment" || o.status === "awaiting_confirmation"
  ).length ?? 0;

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
    confirmed: "Pago confirmado",
    preparing: "Preparando",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-[#1C1917] mb-6">
        Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Libros activos" value={totalBooks ?? 0} icon="📚" />
        <StatCard label="Pedidos totales" value={totalOrders ?? 0} icon="📦" />
        <StatCard
          label="Pendientes de atención"
          value={pendingCount}
          icon="⏳"
          highlight={pendingCount > 0}
        />
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-[#E8E3DC] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E3DC]">
          <h2 className="font-semibold text-[#1C1917]">Pedidos recientes</h2>
          <Link
            href="/admin/pedidos"
            className="text-sm text-[#A0785A] hover:underline"
          >
            Ver todos →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F1ED]">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#78716C] uppercase tracking-wide">
                  Pedido
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#78716C] uppercase tracking-wide">
                  Cliente
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#78716C] uppercase tracking-wide">
                  Total
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#78716C] uppercase tracking-wide">
                  Estado
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE5]">
              {(recentOrders ?? []).map((order) => (
                <tr key={order.id} className="hover:bg-[#FAFAF7]">
                  <td className="px-6 py-3.5 font-mono text-xs text-[#1C1917]">
                    {order.order_number}
                  </td>
                  <td className="px-4 py-3.5 text-[#57534E]">
                    {order.guest_name ?? "—"}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-[#1C1917]">
                    {formatCRC(order.total_crc)}
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: number;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 border ${
        highlight
          ? "bg-amber-50 border-amber-200"
          : "bg-white border-[#E8E3DC]"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-[#1C1917]">{value}</p>
      <p className="text-sm text-[#78716C] mt-1">{label}</p>
    </div>
  );
}
