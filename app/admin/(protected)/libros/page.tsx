import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatCRC } from "@/lib/format";
import type { Book } from "@/lib/types";
import ToggleBookButton from "./ToggleBookButton";

const CONDITION_LABELS: Record<string, string> = {
  nuevo: "Nuevo",
  usado_buen_estado: "Usado – Buen estado",
  usado: "Usado",
};

export default async function AdminBooksPage() {
  const supabase = await createClient();
  const { data: books } = await supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-[#1C1917]">Libros</h1>
        <Link
          href="/admin/libros/nuevo"
          className="bg-[#1C1917] text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#A0785A] transition-colors"
        >
          + Agregar libro
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E3DC] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F1ED]">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#78716C] uppercase tracking-wide">
                  Libro
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#78716C] uppercase tracking-wide">
                  Precio
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#78716C] uppercase tracking-wide">
                  Stock
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#78716C] uppercase tracking-wide">
                  Condición
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#78716C] uppercase tracking-wide">
                  Estado
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE5]">
              {(books as Book[] ?? []).map((book) => (
                <tr key={book.id} className={`hover:bg-[#FAFAF7] ${!book.active ? "opacity-50" : ""}`}>
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-medium text-[#1C1917] line-clamp-1">
                        {book.title}
                      </p>
                      <p className="text-xs text-[#78716C]">{book.author}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-[#1C1917]">
                    {formatCRC(book.price_crc)}
                  </td>
                  <td className="px-4 py-3.5 text-[#57534E]">{book.stock}</td>
                  <td className="px-4 py-3.5 text-[#57534E]">
                    {CONDITION_LABELS[book.condition] ?? book.condition}
                  </td>
                  <td className="px-4 py-3.5">
                    <ToggleBookButton
                      bookId={book.id}
                      active={book.active}
                      featured={book.featured}
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/admin/libros/${book.id}`}
                      className="text-xs text-[#A0785A] hover:underline"
                    >
                      Editar
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
