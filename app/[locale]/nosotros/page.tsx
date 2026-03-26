import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nosotros" };

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-serif text-4xl font-bold text-[#1C1917] mb-2">
        {t("title")}
      </h1>
      <p className="text-[#A0785A] font-medium text-lg mb-8">{t("subtitle")}</p>

      <p className="text-[#57534E] leading-relaxed text-lg mb-12">
        {t("story")}
      </p>

      {/* How it works */}
      <section className="mb-12">
        <h2 className="font-serif text-2xl font-semibold text-[#1C1917] mb-6">
          {t("howItWorks")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { icon: "🔍", label: t("steps.browse") },
            { icon: "📦", label: t("steps.order") },
            { icon: "📱", label: t("steps.pay") },
            { icon: "🏠", label: t("steps.receive") },
          ].map(({ icon, label }, i) => (
            <div key={i} className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-[#F5F1ED] border border-[#D6CFC7] flex items-center justify-center text-2xl">
                {icon}
              </div>
              <p className="text-sm font-medium text-[#1C1917]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="bg-[#F5F1ED] rounded-2xl p-8">
        <h2 className="font-serif text-2xl font-semibold text-[#1C1917] mb-5">
          {t("contact")}
        </h2>
        <ul className="space-y-3 text-sm text-[#57534E]">
          <li className="flex items-center gap-3">
            <span>📸</span>
            <a
              href="https://instagram.com/thrivebookscr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#A0785A] hover:underline"
            >
              @thrivebookscr
            </a>
          </li>
          <li className="flex items-center gap-3">
            <span>🛒</span>
            <span>{t("facebook")}</span>
          </li>
          <li className="flex items-center gap-3">
            <span>💬</span>
            <span>WhatsApp disponible</span>
          </li>
        </ul>
      </section>

      <div className="mt-10 text-center">
        <Link
          href="/libros"
          className="inline-block bg-[#1C1917] text-white font-medium text-sm px-8 py-3.5 rounded-full hover:bg-[#A0785A] transition-colors"
        >
          Ver catálogo de libros
        </Link>
      </div>
    </div>
  );
}
