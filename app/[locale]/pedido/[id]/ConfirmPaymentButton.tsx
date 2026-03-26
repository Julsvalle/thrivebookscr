"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";

export default function ConfirmPaymentButton({ orderId }: { orderId: string }) {
  const t = useTranslations("order");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    const supabase = createClient();

    await supabase
      .from("orders")
      .update({
        status: "awaiting_confirmation",
        sinpe_confirmed_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleConfirm}
      disabled={loading}
      className="w-full bg-green-700 text-white text-sm font-semibold py-3 rounded-xl hover:bg-green-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? "Guardando..." : t("confirmPayment")}
    </button>
  );
}
