"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useCart } from "@/lib/CartContext";
import { Book } from "@/lib/types";
import { formatCRC } from "@/lib/cart";

const CONDITION_LABELS: Record<string, { es: string; en: string }> = {
  nuevo: { es: "Nuevo", en: "New" },
  usado_buen_estado: { es: "Usado – Buen estado", en: "Used – Good condition" },
  usado: { es: "Usado", en: "Used" },
};

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const t = useTranslations("book");
  const locale = useLocale();
  const { addToCart } = useCart();

  const conditionLabel =
    CONDITION_LABELS[book.condition]?.[locale as "es" | "en"] ??
    book.condition;

  return (
    <div className="group flex flex-col bg-white rounded-xl overflow-hidden border border-[#EDE9E3] hover:border-[#C4B8AD] hover:shadow-md transition-all duration-200">
      {/* Cover */}
      <Link href={`/libros/${book.slug}`} className="block">
        <div className="relative aspect-[2/3] bg-[#F5F1ED] overflow-hidden">
          {book.cover_url ? (
            <Image
              src={book.cover_url}
              alt={book.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
              <span className="text-4xl">📖</span>
              <p className="text-center text-xs text-[#A09590] font-medium line-clamp-3">
                {book.title}
              </p>
            </div>
          )}
          {/* Condition badge */}
          {book.condition !== "nuevo" && (
            <span className="absolute top-2 left-2 bg-white/90 text-[#57534E] text-[10px] font-medium px-2 py-0.5 rounded-full border border-[#D6CFC7]">
              {conditionLabel}
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-1">
        <Link href={`/libros/${book.slug}`}>
          <h3 className="font-serif font-semibold text-sm text-[#1C1917] line-clamp-2 leading-snug hover:text-[#A0785A] transition-colors">
            {book.title}
          </h3>
        </Link>
        <p className="text-xs text-[#78716C] truncate">{book.author}</p>

        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="font-semibold text-[#1C1917] text-sm">
            {formatCRC(book.price_crc)}
          </span>

          {book.stock > 0 ? (
            <button
              onClick={() => addToCart(book)}
              className="text-xs font-medium bg-[#1C1917] text-white px-3 py-1.5 rounded-lg hover:bg-[#A0785A] transition-colors"
            >
              {t("addToCart")}
            </button>
          ) : (
            <span className="text-xs text-[#A09590] italic">
              {t("outOfStock")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
