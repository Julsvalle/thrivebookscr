"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/CartContext";
import { formatCRC } from "@/lib/cart";
import Image from "next/image";

export default function CartDrawer() {
  const t = useTranslations("cart");
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, total } =
    useCart();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#FAFAF7] z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E3DC]">
          <h2 className="font-serif text-lg font-semibold text-[#1C1917]">
            {t("title")}
          </h2>
          <button
            onClick={closeCart}
            className="text-[#78716C] hover:text-[#1C1917] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-5 h-5"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="text-5xl">📚</div>
              <p className="font-medium text-[#1C1917]">{t("empty")}</p>
              <p className="text-sm text-[#78716C]">{t("emptySubtitle")}</p>
              <Link
                href="/libros"
                onClick={closeCart}
                className="mt-2 text-sm font-medium text-[#A0785A] underline underline-offset-2"
              >
                {t("browseCatalog")}
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map(({ book, quantity }) => (
                <li
                  key={book.id}
                  className="flex gap-3 py-3 border-b border-[#F0EBE5]"
                >
                  {/* Cover */}
                  <div className="w-14 h-20 bg-[#F0EBE5] rounded overflow-hidden flex-shrink-0">
                    {book.cover_url ? (
                      <Image
                        src={book.cover_url}
                        alt={book.title}
                        width={56}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#C4B8AD] text-xs text-center p-1">
                        📖
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[#1C1917] truncate">
                      {book.title}
                    </p>
                    <p className="text-xs text-[#78716C] truncate">
                      {book.author}
                    </p>
                    <p className="text-sm font-semibold text-[#A0785A] mt-1">
                      {formatCRC(book.price_crc)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(book.id, quantity - 1)
                        }
                        className="w-6 h-6 rounded border border-[#D6CFC7] flex items-center justify-center text-sm text-[#57534E] hover:bg-[#F0EBE5]"
                      >
                        −
                      </button>
                      <span className="text-sm text-[#1C1917] w-4 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(book.id, quantity + 1)
                        }
                        className="w-6 h-6 rounded border border-[#D6CFC7] flex items-center justify-center text-sm text-[#57534E] hover:bg-[#F0EBE5]"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(book.id)}
                        className="ml-2 text-xs text-[#A87060] hover:underline"
                      >
                        {t("remove")}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#E8E3DC] px-6 py-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#57534E]">{t("subtotal")}</span>
              <span className="font-semibold text-[#1C1917]">
                {formatCRC(total)}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full text-center bg-[#1C1917] text-white text-sm font-medium py-3 rounded-lg hover:bg-[#292524] transition-colors"
            >
              {t("checkout")}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
