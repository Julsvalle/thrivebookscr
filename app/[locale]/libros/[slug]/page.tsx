import { notFound } from "next/navigation";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import AddToCartButton from "./AddToCartButton";
import { formatCRC } from "@/lib/format";
import type { Book } from "@/lib/types";

interface BookPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

const CONDITION_LABELS: Record<string, { es: string; en: string }> = {
  nuevo: { es: "Nuevo", en: "New" },
  usado_buen_estado: { es: "Usado — Buen estado", en: "Used — Good condition" },
  usado: { es: "Usado", en: "Used" },
};

const LANGUAGE_LABELS: Record<string, { es: string; en: string }> = {
  espanol: { es: "Español", en: "Spanish" },
  ingles: { es: "Inglés", en: "English" },
  otro: { es: "Otro", en: "Other" },
};

export default async function BookPage({ params }: BookPageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations("book");

  const supabase = await createClient();
  const { data: book } = await supabase
    .from("books")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (!book) notFound();

  const b = book as Book;
  const lang = locale as "es" | "en";

  const description =
    lang === "en" ? b.description_en : b.description_es;
  const conditionLabel =
    CONDITION_LABELS[b.condition]?.[lang] ?? b.condition;
  const languageLabel =
    LANGUAGE_LABELS[b.language]?.[lang] ?? b.language;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/libros"
        className="inline-flex items-center gap-1 text-sm text-[#78716C] hover:text-[#1C1917] mb-8 transition-colors"
      >
        {t("backToCatalog")}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Cover */}
        <div className="relative aspect-[3/4] max-w-sm mx-auto w-full bg-[#F5F1ED] rounded-xl overflow-hidden shadow-lg">
          {b.cover_url ? (
            <Image
              src={b.cover_url}
              alt={b.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
              <span className="text-7xl">📖</span>
              <p className="text-center font-serif text-lg text-[#A09590]">
                {b.title}
              </p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917] leading-tight">
              {b.title}
            </h1>
            <p className="mt-2 text-lg text-[#57534E]">{b.author}</p>
          </div>

          <p className="text-3xl font-semibold text-[#1C1917]">
            {formatCRC(b.price_crc)}
          </p>

          {/* Metadata */}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-[#78716C] text-xs uppercase tracking-wide">
                {t("condition")}
              </dt>
              <dd className="font-medium text-[#1C1917] mt-0.5">
                {conditionLabel}
              </dd>
            </div>
            <div>
              <dt className="text-[#78716C] text-xs uppercase tracking-wide">
                {t("language")}
              </dt>
              <dd className="font-medium text-[#1C1917] mt-0.5">
                {languageLabel}
              </dd>
            </div>
            <div>
              <dt className="text-[#78716C] text-xs uppercase tracking-wide">
                {t("stock")}
              </dt>
              <dd className="font-medium text-[#1C1917] mt-0.5">
                {b.stock > 0 ? `${b.stock} disponible${b.stock > 1 ? "s" : ""}` : t("outOfStock")}
              </dd>
            </div>
          </dl>

          {/* Description */}
          {description && (
            <div>
              <h2 className="text-xs font-semibold text-[#78716C] uppercase tracking-wide mb-2">
                {t("description")}
              </h2>
              <p className="text-[#57534E] leading-relaxed text-sm">
                {description}
              </p>
            </div>
          )}

          {/* Add to cart */}
          <div className="mt-2">
            {b.stock > 0 ? (
              <AddToCartButton book={b} />
            ) : (
              <p className="text-[#A09590] italic text-sm">{t("outOfStock")}</p>
            )}
          </div>

          {/* Shipping info */}
          <div className="mt-2 p-4 bg-[#F5F1ED] rounded-xl text-sm text-[#57534E] space-y-1.5">
            <p className="font-medium text-[#1C1917] text-xs uppercase tracking-wide mb-2">
              Envío disponible
            </p>
            <p>🚗 Uber Flash / Didi — Mismo día (GAM)</p>
            <p>📬 Correos CR — Nacional, 3-5 días hábiles</p>
            <p>💳 Pago fácil con SINPE Móvil</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: BookPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: book } = await supabase
    .from("books")
    .select("title, author, description_es")
    .eq("slug", slug)
    .single();

  if (!book) return {};

  return {
    title: `${book.title} — ${book.author}`,
    description: book.description_es?.slice(0, 150),
  };
}
