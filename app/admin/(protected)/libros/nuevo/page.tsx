import BookForm from "../BookForm";

export default function NewBookPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-[#1C1917] mb-6">
        Agregar nuevo libro
      </h1>
      <BookForm />
    </div>
  );
}
