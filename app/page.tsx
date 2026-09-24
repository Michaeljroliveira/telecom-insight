import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

export default async function Home() {
  const supabase = await createClient();

  // Verificar se está autenticado
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Ler os técnicos
  const { data: tecnicos, error } = await supabase
    .from("tecnicos")
    .select("*")
    .eq("ativo", true)
    .order("nome");

  return (
    <main className="min-h-screen bg-digi-blue text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-start mb-12 pt-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">📡 Telecom Insight</h1>
            <p className="opacity-90">
              Bem-vindo, <strong>{user.email}</strong>
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
            >
              🚪 Sair
            </button>
          </form>
        </header>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">👥 Técnicos</h2>
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-bold">
              {tecnicos?.length || 0} ativos
            </span>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-300 rounded-lg p-4 mb-4">
              <p className="font-bold">❌ Erro</p>
              <p className="text-sm opacity-80">{error.message}</p>
            </div>
          )}

          {tecnicos && tecnicos.length > 0 ? (
            <div className="grid gap-3">
              {tecnicos.map((tecnico) => (
                <div
                  key={tecnico.email}
                  className="bg-white/10 border border-white/20 rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-lg">{tecnico.nome}</p>
                    <p className="text-sm opacity-70">{tecnico.email}</p>
                  </div>
                  <div>
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                      {tecnico.tipo_contrato}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center opacity-70 py-8">
              Nenhum técnico ativo encontrado.
            </p>
          )}
        </div>

        <p className="text-center text-sm opacity-60 mt-8">
          Sprint 6 — Login funcional ✅
        </p>
      </div>
    </main>
  );
}
