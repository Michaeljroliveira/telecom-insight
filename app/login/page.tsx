"use client";

import { useState } from "react";
import { login } from "@/app/auth/actions";

export default function LoginPage() {
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setErro(null);

    const result = await login(formData);

    if (result?.error) {
      setErro(result.error);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-digi-blue p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-digi-blue mb-2">
            📡 Telecom Insight
          </h1>
          <p className="text-gray-500 text-sm">
            Plataforma de gestão operacional
          </p>
        </div>

        <form action={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="nome@empresa.pt"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-digi-blue focus:ring-2 focus:ring-digi-blue/20"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-digi-blue focus:ring-2 focus:ring-digi-blue/20"
              disabled={loading}
            />
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              ❌ {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-digi-blue hover:bg-digi-blue-dark text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "A entrar..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Acesso restrito a supervisores autorizados
        </p>
      </div>
    </main>
  );
}
