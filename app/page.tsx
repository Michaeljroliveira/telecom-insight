export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-digi-blue text-white p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold mb-4">
          📡 Telecom Insight
        </h1>
        <p className="text-xl mb-8 opacity-90">
          Plataforma de gestão operacional
        </p>
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-8">
          <p className="text-lg font-semibold mb-2">
            ✅ Sprint 1 concluído!
          </p>
          <p className="text-sm opacity-80">
            Next.js + TypeScript + Tailwind CSS instalados e a funcionar.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
            <div className="text-2xl mb-2">🔐</div>
            <div className="font-bold">Login</div>
            <div className="text-xs opacity-70">Próximo sprint</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-bold">Dashboard</div>
            <div className="text-xs opacity-70">Sprint 3</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
            <div className="text-2xl mb-2">📤</div>
            <div className="font-bold">Upload</div>
            <div className="text-xs opacity-70">Sprint 4</div>
          </div>
        </div>
      </div>
    </main>
  );
}
