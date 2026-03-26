import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BookForm from "../BookForm";
import type { Book } from "@/lib/types";

interface EditBookPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBookPage({ params }: EditBookPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: book } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .single();

  if (!book) notFound();

  const b = book as Book;

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-[#1C1917] mb-6">
        Editar libro
      </h1>
      <BookForm
        initial={{
          id: b.id,
          slug: b.slug,
          title: b.title,
          author: b.author,
          description_es: b.description_es,
          description_en: b.description_en,
          price_crc: b.price_crc,
          genre: b.genre,
          language: b.language,
          condition: b.condition,
          stock: b.stock,
          featured: b.featured,
          active: b.active,
          cover_url: b.cover_url,
        }}
      />
    </div>
  );
}
