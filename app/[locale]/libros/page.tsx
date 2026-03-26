import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import BookCard from "@/components/BookCard";
import type { Book } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Catálogo de libros" };

interface CatalogPageProps {
  searchParams: Promise<{
    genero?: string;
    idioma?: string;
    condicion?: string;
    q?: string;
  }>;
}

const GENRES = [
  "ficcion",
  "nonficcion",
  "infantil",
  "autoayuda",
  "historia",
  "ciencia",
  "romance",
  "thriller",
  "biografia",
  "otro",
];

const LANGUAGES = ["espanol", "ingles", "otro"];
const CONDITIONS = ["nuevo", "usado_buen_estado", "usado"];

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const t = await getTranslations("catalog");
  const { genero, idioma, condicion, q } = await searchParams;

  const supabase = await createClient();

  let query = supabase
    .from("books")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (genero) query = query.eq("genre", genero);
  if (idioma) query = query.eq("language", idioma);
  if (condicion) query = query.eq("condition", condicion);
  if (q) query = query.ilike("title", `%${q}%`);

  const { data: books } = await query;

  const activeFilters = [genero, idioma, condicion, q].filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-serif text-4xl font-bold text-[#1C1917] mb-8">
        {t("title")}
      </h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="md:w-56 flex-shrink-0">
          <form className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm text-[#1C1917] uppercase tracking-wide">
                {t("filters.title")}
              </h3>
              {activeFilters > 0 && (
                <a
                  href="/libros"
                  className="text-xs text-[#A0785A] hover:underline"
                >
                  {t("filters.clear")}
                </a>
              )}
            </div>

            {/* Genre */}
            <div>
              <p className="text-xs font-semibold text-[#78716C] uppercase tracking-widest mb-2">
                {t("filters.genre")}
              </p>
              <div className="space-y-1.5">
                <FilterOption
                  name="genero"
                  value=""
                  label={t("genres.all")}
                  checked={!genero}
                />
                {GENRES.map((g) => (
                  <FilterOption
                    key={g}
                    name="genero"
                    value={g}
                    label={t(`genres.${g}` as any)}
                    checked={genero === g}
                  />
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <p className="text-xs font-semibold text-[#78716C] uppercase tracking-widest mb-2">
                {t("filters.language")}
              </p>
              <div className="space-y-1.5">
                <FilterOption
                  name="idioma"
                  value=""
                  label={t("languages.all")}
                  checked={!idioma}
                />
                {LANGUAGES.map((l) => (
                  <FilterOption
                    key={l}
                    name="idioma"
                    value={l}
                    label={t(`languages.${l}` as any)}
                    checked={idioma === l}
                  />
                ))}
              </div>
            </div>

            {/* Condition */}
            <div>
              <p className="text-xs font-semibold text-[#78716C] uppercase tracking-widest mb-2">
                {t("filters.condition")}
              </p>
              <div className="space-y-1.5">
                <FilterOption
                  name="condicion"
                  value=""
                  label={t("conditions.all")}
                  checked={!condicion}
                />
                {CONDITIONS.map((c) => (
                  <FilterOption
                    key={c}
                    name="condicion"
                    value={c}
                    label={t(`conditions.${c}` as any)}
                    checked={condicion === c}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1C1917] text-white text-sm font-medium py-2 rounded-lg hover:bg-[#A0785A] transition-colors"
            >
              Aplicar filtros
            </button>
          </form>
        </aside>

        {/* Book grid */}
        <div className="flex-1">
          {/* Search bar */}
          <form className="mb-6">
            <div className="flex gap-2">
              <input
                name="q"
                defaultValue={q}
                placeholder="Buscar por título..."
                className="flex-1 border border-[#D6CFC7] rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#A0785A] focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-[#1C1917] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#A0785A] transition-colors"
              >
                Buscar
              </button>
            </div>
          </form>

          {!books || books.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <span className="text-5xl">📭</span>
              <p className="font-medium text-[#1C1917]">{t("noResults")}</p>
              <a
                href="/libros"
                className="text-sm text-[#A0785A] hover:underline"
              >
                {t("filters.clear")}
              </a>
            </div>
          ) : (
            <>
              <p className="text-sm text-[#78716C] mb-4">
                {books.length} libro{books.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {(books as Book[]).map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterOption({
  name,
  value,
  label,
  checked,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={checked}
        className="accent-[#A0785A]"
      />
      <span
        className={`text-sm transition-colors ${
          checked
            ? "text-[#1C1917] font-medium"
            : "text-[#57534E] group-hover:text-[#1C1917]"
        }`}
      >
        {label}
      </span>
    </label>
  );
}
