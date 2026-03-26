"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/libros", label: "Libros", icon: "📚" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "📦" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="w-56 bg-[#1C1917] text-white flex flex-col min-h-screen flex-shrink-0">
      <div className="p-5 border-b border-[#292524]">
        <span className="font-serif font-bold text-lg">
          thrivebooks<span className="text-[#A0785A]">cr</span>
        </span>
        <p className="text-xs text-[#78716C] mt-0.5">Admin</p>
      </div>

      <ul className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active =
            href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#A0785A] text-white"
                    : "text-[#A09590] hover:bg-[#292524] hover:text-white"
                }`}
              >
                <span>{icon}</span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="p-3 border-t border-[#292524]">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-[#78716C] hover:text-white px-3 py-2"
        >
          ← Ver sitio
        </Link>
      </div>
    </nav>
  );
}
