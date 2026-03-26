import AdminLoginForm from "./AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#F5F1ED] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="font-serif text-2xl font-bold text-[#1C1917] mb-2">
          Admin
        </h1>
        <p className="text-sm text-[#78716C] mb-6">
          Acceso exclusivo para administradores
        </p>
        <AdminLoginForm />
      </div>
    </div>
  );
}
