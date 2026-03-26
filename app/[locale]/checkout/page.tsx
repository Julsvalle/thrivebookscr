import { getTranslations } from "next-intl/server";
import CheckoutForm from "./CheckoutForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const t = await getTranslations("checkout");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-serif text-3xl font-bold text-[#1C1917] mb-8">
        {t("title")}
      </h1>
      <CheckoutForm />
    </div>
  );
}
