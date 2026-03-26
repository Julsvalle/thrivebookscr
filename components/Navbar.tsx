"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useCart } from "@/lib/CartContext";
import { useState } from "react";

interface NavbarProps {
  locale: string;
}

export default function Navbar({ locale }: NavbarProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const { count, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const otherLocale = locale === "es" ? "en" : "es";

  function switchLocale() {
    router.replace(pathname, { locale: otherLocale });
  }

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAF7] border-b border-[#E8E3DC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold text-[#1C1917] tracking-tight">
              thrivebooks
              <span className="text-[#A0785A]">cr</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/libros"
              className="text-sm font-medium text-[#57534E] hover:text-[#1C1917] transition-colors"
            >
              {t("books")}
            </Link>
            <Link
              href="/nosotros"
              className="text-sm font-medium text-[#57534E] hover:text-[#1C1917] transition-colors"
            >
              {t("about")}
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <button
              onClick={switchLocale}
              className="hidden md:flex items-center text-xs font-medium text-[#57534E] hover:text-[#1C1917] border border-[#D6CFC7] rounded px-2 py-1 transition-colors uppercase tracking-wide"
            >
              {otherLocale}
            </button>

            {/* Cart button */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-1.5 text-sm font-medium text-[#1C1917] hover:text-[#A0785A] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="w-5 h-5"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#A0785A] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {count}
                </span>
              )}
              <span className="hidden sm:inline">{t("cart")}</span>
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-[#57534E]"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5"
              >
                {menuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#E8E3DC] py-4 flex flex-col gap-4">
            <Link
              href="/libros"
              className="text-sm font-medium text-[#57534E]"
              onClick={() => setMenuOpen(false)}
            >
              {t("books")}
            </Link>
            <Link
              href="/nosotros"
              className="text-sm font-medium text-[#57534E]"
              onClick={() => setMenuOpen(false)}
            >
              {t("about")}
            </Link>
            <button
              onClick={() => {
                switchLocale();
                setMenuOpen(false);
              }}
              className="text-left text-xs font-medium text-[#57534E] uppercase tracking-wide"
            >
              {locale === "es" ? "Switch to English" : "Cambiar a Español"}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
