import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | ThrivebooksCR",
    default: "ThrivebooksCR — Libros nuevos y usados en Costa Rica",
  },
  description:
    "Compra libros nuevos y usados con envío a todo Costa Rica. Paga fácil con SINPE Móvil.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-[#FAFAF7] text-[#1C1917] antialiased">
        {children}
      </body>
    </html>
  );
}
