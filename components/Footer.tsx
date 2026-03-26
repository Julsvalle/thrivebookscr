import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("nav");

  return (
    <footer className="bg-[#1C1917] text-[#A09590] mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <span className="font-serif text-xl font-bold text-white tracking-tight">
              thrivebooks<span className="text-[#A0785A]">cr</span>
            </span>
            <p className="mt-3 text-sm leading-relaxed">
              Libros nuevos y usados con envío a todo Costa Rica.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#78716C] mb-4">
              Navegación
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/libros"
                  className="hover:text-white transition-colors"
                >
                  {t("books")}
                </Link>
              </li>
              <li>
                <Link
                  href="/nosotros"
                  className="hover:text-white transition-colors"
                >
                  Nosotros
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#78716C] mb-4">
              Contacto
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://instagram.com/thrivebookscr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  @thrivebookscr
                </a>
              </li>
              <li>
                <span className="text-[#57534E]">thrivebookscr.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#292524] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>© {new Date().getFullYear()} ThrivebooksCR. Todos los derechos reservados.</p>
          <p>Hecho con 📚 en Costa Rica</p>
        </div>
      </div>
    </footer>
  );
}
