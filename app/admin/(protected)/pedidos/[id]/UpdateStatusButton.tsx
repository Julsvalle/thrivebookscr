"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdateStatusButton({
  orderId,
  status,
  label,
  isCurrent,
}: {
  orderId: string;
  status: string;
  label: string;
  isCurrent: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    if (isCurrent) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("orders").update({ status }).eq("id", orderId);
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleUpdate}
      disabled={isCurrent || loading}
      className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
        isCurrent
          ? "bg-[#1C1917] text-white cursor-default"
          : "bg-[#F5F1ED] text-[#57534E] hover:bg-[#E8E3DC] disabled:opacity-60"
      }`}
    >
      {loading ? "..." : label}
    </button>
  );
}
