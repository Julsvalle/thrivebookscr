"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ToggleBookButton({
  bookId,
  active,
  featured,
}: {
  bookId: string;
  active: boolean;
  featured: boolean;
}) {
  const router = useRouter();
  const [loadingActive, setLoadingActive] = useState(false);
  const [loadingFeatured, setLoadingFeatured] = useState(false);

  async function toggle(field: "active" | "featured", value: boolean) {
    if (field === "active") setLoadingActive(true);
    else setLoadingFeatured(true);

    const supabase = createClient();
    await supabase.from("books").update({ [field]: value }).eq("id", bookId);
    router.refresh();

    if (field === "active") setLoadingActive(false);
    else setLoadingFeatured(false);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => toggle("active", !active)}
        disabled={loadingActive}
        className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
          active
            ? "bg-green-100 text-green-800 hover:bg-green-200"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        {active ? "Activo" : "Inactivo"}
      </button>
      <button
        onClick={() => toggle("featured", !featured)}
        disabled={loadingFeatured}
        title="Destacado en Home"
        className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
          featured
            ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
        }`}
      >
        ★
      </button>
    </div>
  );
}
