import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  // Teste simples: verificar se consegue ligar ao Supabase
  let status = "A testar...";
  let statusColor = "text-yellow-300";
  let detalhes = "";

  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      status = "❌ Erro de ligação";
      statusColor = "text-red-300";
      detalhes = error.message;
    } else {
      status = "✅ Ligação OK";
      statusColor = "text-green-300";
      detalhes = "Supabase conectado com sucesso. Sessão: " + (data.session ? "ativa" : "não iniciada");
    }
  } catch (e: any) {
    status = "❌ Erro inesperado";
    statusColor = "text-red-300";
    detalhes = e.message || "Erro desconhecido";
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-digi-blue text-white p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold mb-4">📡 Telecom Insight</h1>
        <p className="text-xl mb-8 opacity-90">Plataforma de gestão operacional</p>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-8">
          <p className={`text-2xl font-bold mb-3 ${statusColor}`}>{status}</p>
          <p className="text-sm opacity-80">{detalhes}</p>
        </div>

        <div className="text-sm opacity-70">
          <p>Sprint 3 — Ligação ao Supabase</p>
        </div>
      </div>
    </main>
  );
}
