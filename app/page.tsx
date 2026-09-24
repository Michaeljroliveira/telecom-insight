import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "NÃO DEFINIDO";
  const keyPreview =
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").slice(0, 20) + "...";

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

        <div className="bg-black/30 border border-yellow-300 rounded-xl p-4 mb-6 text-sm">
          <p className="font-bold text-yellow-300 mb-2">🔍 DEBUG:</p>
          <p className="break-all">
            <strong>URL:</strong> {supabaseUrl}
          </p>
          <p className="break-all">
            <strong>Key (início):</strong> {keyPreview}
          </p>
          <p>
            <strong>Count:</strong> {count ?? "null"}
          </p>
          <p>
            <strong>Error:</strong> {error?.message ?? "nenhum"}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">
            👥 Técnicos ({tecnicos?.length || 0})
          </h2>

          {tecnicos && tecnicos.length > 0 ? (
            <div className="grid gap-3">
              {tecnicos.map((tecnico) => (
                <div
                  key={tecnico.email}
                  className="bg-white/10 border border-white/20 rounded-xl p-4"
                >
                  <p className="font-bold text-lg">{tecnico.nome}</p>
                  <p className="text-sm opacity-70">{tecnico.email}</p>
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
