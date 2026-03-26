"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface BookFormProps {
  initial?: {
    id: string;
    slug: string;
    title: string;
    author: string;
    description_es: string;
    description_en: string;
    price_crc: number;
    genre: string;
    language: string;
    condition: string;
    stock: number;
    featured: boolean;
    active: boolean;
    cover_url: string | null;
  };
}

const GENRES = [
  { value: "ficcion", label: "Ficción" },
  { value: "nonficcion", label: "No ficción" },
  { value: "infantil", label: "Infantil" },
  { value: "autoayuda", label: "Autoayuda" },
  { value: "historia", label: "Historia" },
  { value: "ciencia", label: "Ciencia" },
  { value: "romance", label: "Romance" },
  { value: "thriller", label: "Thriller" },
  { value: "biografia", label: "Biografía" },
  { value: "otro", label: "Otro" },
];

const LANGUAGES = [
  { value: "espanol", label: "Español" },
  { value: "ingles", label: "Inglés" },
  { value: "otro", label: "Otro" },
];

const CONDITIONS = [
  { value: "nuevo", label: "Nuevo" },
  { value: "usado_buen_estado", label: "Usado — Buen estado" },
  { value: "usado", label: "Usado" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function BookForm({ initial }: BookFormProps) {
  const router = useRouter();
  const isEditing = !!initial?.id;

  const [form, setForm] = useState({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    author: initial?.author ?? "",
    description_es: initial?.description_es ?? "",
    description_en: initial?.description_en ?? "",
    price_crc: initial?.price_crc?.toString() ?? "",
    genre: initial?.genre ?? "ficcion",
    language: initial?.language ?? "espanol",
    condition: initial?.condition ?? "nuevo",
    stock: initial?.stock?.toString() ?? "1",
    featured: initial?.featured ?? false,
    active: initial?.active ?? true,
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    initial?.cover_url ?? null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleTitleChange(title: string) {
    set("title", title);
    if (!isEditing) {
      set("slug", slugify(title));
    }
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      let cover_url = initial?.cover_url ?? null;

      // Upload cover image if selected
      if (coverFile) {
        const ext = coverFile.name.split(".").pop();
        const fileName = `${form.slug}-${Date.now()}.${ext}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("covers")
          .upload(fileName, coverFile, { upsert: true });

        if (uploadError) throw new Error(uploadError.message);

        const {
          data: { publicUrl },
        } = supabase.storage.from("covers").getPublicUrl(uploadData.path);

        cover_url = publicUrl;
      }

      const bookData = {
        slug: form.slug,
        title: form.title,
        author: form.author,
        description_es: form.description_es,
        description_en: form.description_en,
        price_crc: parseInt(form.price_crc),
        genre: form.genre,
        language: form.language,
        condition: form.condition,
        stock: parseInt(form.stock),
        featured: form.featured,
        active: form.active,
        ...(cover_url && { cover_url }),
      };

      if (isEditing) {
        const { error: updateError } = await supabase
          .from("books")
          .update(bookData)
          .eq("id", initial!.id);
        if (updateError) throw new Error(updateError.message);
      } else {
        const { error: insertError } = await supabase
          .from("books")
          .insert(bookData);
        if (insertError) throw new Error(insertError.message);
      }

      router.push("/admin/libros");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar el libro");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2">
          <Field
            label="Título"
            required
            value={form.title}
            onChange={handleTitleChange}
          />
        </div>

        {/* Author */}
        <Field
          label="Autor"
          required
          value={form.author}
          onChange={(v) => set("author", v)}
        />

        {/* Slug */}
        <Field
          label="Slug (URL)"
          required
          value={form.slug}
          onChange={(v) => set("slug", v)}
          hint="Se genera automáticamente. Ej: el-principito"
        />

        {/* Price */}
        <Field
          label="Precio (₡ colones)"
          type="number"
          required
          value={form.price_crc}
          onChange={(v) => set("price_crc", v)}
          placeholder="4500"
        />

        {/* Stock */}
        <Field
          label="Stock (unidades)"
          type="number"
          required
          value={form.stock}
          onChange={(v) => set("stock", v)}
        />

        {/* Genre */}
        <Select
          label="Género"
          value={form.genre}
          onChange={(v) => set("genre", v)}
          options={GENRES}
        />

        {/* Language */}
        <Select
          label="Idioma"
          value={form.language}
          onChange={(v) => set("language", v)}
          options={LANGUAGES}
        />

        {/* Condition */}
        <Select
          label="Condición"
          value={form.condition}
          onChange={(v) => set("condition", v)}
          options={CONDITIONS}
        />

        {/* Description ES */}
        <div className="md:col-span-2">
          <Textarea
            label="Descripción (Español)"
            value={form.description_es}
            onChange={(v) => set("description_es", v)}
          />
        </div>

        {/* Description EN */}
        <div className="md:col-span-2">
          <Textarea
            label="Description (English)"
            value={form.description_en}
            onChange={(v) => set("description_en", v)}
          />
        </div>

        {/* Cover image */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-[#57534E] mb-1.5">
            Portada del libro
          </label>
          <div className="flex items-start gap-4">
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Portada"
                className="w-20 h-28 object-cover rounded-lg border border-[#D6CFC7]"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="text-sm text-[#57534E] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[#F5F1ED] file:text-[#1C1917] file:text-sm file:font-medium hover:file:bg-[#E8E3DC]"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-6">
          <Toggle
            label="Activo"
            checked={form.active}
            onChange={(v) => set("active", v)}
          />
          <Toggle
            label="Destacado (Home)"
            checked={form.featured}
            onChange={(v) => set("featured", v)}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#1C1917] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#A0785A] transition-colors disabled:opacity-60"
        >
          {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Agregar libro"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm font-medium text-[#57534E] px-6 py-3 rounded-xl border border-[#D6CFC7] hover:bg-[#F5F1ED]"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function Field({
  label, type = "text", placeholder, required, value, onChange, hint,
}: {
  label: string; type?: string; placeholder?: string; required?: boolean;
  value: string; onChange: (v: string) => void; hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#57534E] mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type} placeholder={placeholder} required={required} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-[#D6CFC7] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#A0785A]"
      />
      {hint && <p className="text-xs text-[#78716C] mt-1">{hint}</p>}
    </div>
  );
}

function Select({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#57534E] mb-1.5">{label}</label>
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border border-[#D6CFC7] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#A0785A]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function Textarea({
  label, value, onChange,
}: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#57534E] mb-1.5">{label}</label>
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)} rows={4}
        className="w-full border border-[#D6CFC7] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#A0785A] resize-y"
      />
    </div>
  );
}

function Toggle({
  label, checked, onChange,
}: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-[#A0785A]"
      />
      <span className="text-sm text-[#57534E]">{label}</span>
    </label>
  );
}
