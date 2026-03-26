import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import BookCard from "@/components/BookCard";
import type { Book } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ThrivebooksCR — Libros nuevos y usados en Costa Rica",
};

export default async function HomePage() {
  const tHero = await getTranslations("home.hero");
  const tHome = await getTranslations("home");

  const supabase = await createClient();
  const { data: books } = await supabase
    .from("books")
    .select("*")
    .eq("active", true)
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#F5F1ED] to-[#FAFAF7] py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-5xl sm:text-6xl font-bold text-[#1C1917] leading-tight">
            {tHero("title")}
          </h1>
          <p className="mt-5 text-lg text-[#78716C] leading-relaxed max-w-xl mx-auto">
            {tHero("subtitle")}
          </p>
          <Link
            href="/libros"
            className="mt-8 inline-block bg-[#1C1917] text-white font-medium text-sm px-8 py-3.5 rounded-full hover:bg-[#A0785A] transition-colors"
          >
            {tHero("cta")}
          </Link>
        </div>
      </section>

      {/* Featured books */}
      {books && books.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-serif text-3xl font-semibold text-[#1C1917]">
              {tHome("featured")}
            </h2>
            <Link
              href="/libros"
              className="text-sm text-[#A0785A] font-medium hover:underline underline-offset-2"
            >
              {tHome("allBooks")} →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {(books as Book[]).map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-[#F5F1ED] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-semibold text-[#1C1917] mb-10">
            ¿Cómo funciona?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "🔍", step: "1", label: "Explora el catálogo" },
              { icon: "📦", step: "2", label: "Realiza tu pedido" },
              { icon: "📱", step: "3", label: "Paga con SINPE Móvil" },
              { icon: "🏠", step: "4", label: "Recibe tu libro" },
            ].map(({ icon, step, label }) => (
              <div key={step} className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-white border border-[#D6CFC7] flex items-center justify-center text-2xl shadow-sm">
                  {icon}
                </div>
                <p className="text-sm font-medium text-[#1C1917]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
