import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data: tecnicos, error, count } = await supabase
    .from("tecnicos")
    .select("*", { count: "exact" });

  return (
    <main className="min-h-screen bg-digi-blue text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8 pt-8">
          <h1 className="text-5xl font-bold mb-3">📡 Telecom Insight</h1>
          <p className="text-xl opacity-90">Plataforma de gestão operacional</p>
        </header>

        {/* DEBUG — remover depois */}
        <div className="bg-black/30 border border-yellow-300 rounded-xl p-4 mb-6 text-sm">
          <p className="font-bold text-yellow-300 mb-2">🔍 DEBUG:</p>
          <p>Count: {count ?? "null"}</p>
          <p>Length: {tecnicos?.length ?? "null"}</p>
          <p>Error: {error?.message ?? "nenhum"}</p>
          <details className="mt-2">
            <summary className="cursor-pointer">Ver dados crus</summary>
            <pre className="mt-2 text-xs overflow-auto max-h-64">
              {JSON.stringify(tecnicos, null, 2)}
            </pre>
          </details>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">👥 Técnicos</h2>
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-bold">
              {tecnicos?.length || 0} registos
            </span>
          </div>

          {tecnicos && tecnicos.length > 0 ? (
            <div className="grid gap-3">
              {tecnicos.map((tecnico) => (
                <div
                  key={tecnico.email}
                  className="bg-white/10 border border-white/20 rounded-xl p-4"
                >
                  <p className="font-bold text-lg">{tecnico.nome}</p>
                  <p className="text-sm opacity-70">{tecnico.email}</p>
                  <p className="text-xs opacity-50 mt-1">
                    ativo: {String(tecnico.ativo)} | tipo: {tecnico.tipo_contrato}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center opacity-70 py-8">
              {error ? `❌ ${error.message}` : "Nenhum técnico encontrado."}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
