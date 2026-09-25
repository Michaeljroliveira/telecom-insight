"use client";

import { useState, useRef } from "react";
import {
  lerFicheiro,
  detetarTipo,
  processarInstalacoes,
  processarAvarias,
} from "@/lib/parsers/instalcare";
import { uploadInstalacoes, uploadAvarias } from "./actions";

type Estado = "inicial" | "a_processar" | "sucesso" | "erro";

interface Resultado {
  tipo: string;
  inseridos: number;
  atualizados: number;
  erros: string[];
}

export default function UploadPage() {
  const [estado, setEstado] = useState<Estado>("inicial");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [nomeFicheiro, setNomeFicheiro] = useState<string>("");
  const [aArrastar, setAArrastar] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function processarFicheiro(file: File) {
    setNomeFicheiro(file.name);
    setEstado("a_processar");
    setResultado(null);

    try {
      // 1. Ler ficheiro
      const linhas = await lerFicheiro(file);

      if (linhas.length === 0) {
        throw new Error("O ficheiro está vazio ou não foi possível ler.");
      }

      // 2. Detetar tipo
      const tipo = detetarTipo(linhas);

      if (tipo === "desconhecido") {
        throw new Error(
          "Formato não reconhecido. O ficheiro deve ter colunas 'Id Instalación' ou 'Id Avería'."
        );
      }

      // 3. Processar
      if (tipo === "instalacoes") {
        const instalacoes = processarInstalacoes(linhas);
        const res = await uploadInstalacoes(instalacoes);
        setResultado({
          tipo: "Instalações",
          inseridos: res.inseridos,
          atualizados: res.atualizados,
          erros: res.erros,
        });
      } else {
        const avarias = processarAvarias(linhas);
        const res = await uploadAvarias(avarias);
        setResultado({
          tipo: "Avarias",
          inseridos: res.inseridos,
          atualizados: res.atualizados,
          erros: res.erros,
        });
      }

      setEstado("sucesso");
    } catch (error: any) {
      setResultado({
        tipo: "?",
        inseridos: 0,
        atualizados: 0,
        erros: [error.message || "Erro desconhecido"],
      });
      setEstado("erro");
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processarFicheiro(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setAArrastar(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processarFicheiro(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setAArrastar(true);
  }

  function handleDragLeave() {
    setAArrastar(false);
  }

  function reiniciar() {
    setEstado("inicial");
    setResultado(null);
    setNomeFicheiro("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📤 Upload de Planilhas
          </h1>
          <p className="text-gray-500">
            Importa ficheiros do InstalCare (CSV ou XLSX). Os dados são
            anonimizados automaticamente antes de serem guardados.
          </p>
        </header>

        {/* ESTADO INICIAL — Zona de drag & drop */}
        {estado === "inicial" && (
          <div
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
              aArrastar
                ? "border-[#0026FF] bg-blue-50 scale-[1.02]"
                : "border-gray-300 bg-white hover:border-[#0026FF] hover:bg-blue-50"
            }`}
          >
            <div className="text-6xl mb-4">📁</div>
            <p className="text-xl font-bold text-gray-900 mb-2">
              Arrasta o ficheiro para aqui
            </p>
            <p className="text-sm text-gray-500 mb-4">
              ou clica para escolher
            </p>
            <p className="text-xs text-gray-400">
              Formatos aceites: .csv, .xlsx, .xls
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* ESTADO A PROCESSAR */}
        {estado === "a_processar" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4 animate-pulse">⏳</div>
            <p className="text-xl font-bold text-gray-900 mb-2">
              A processar...
            </p>
            <p className="text-sm text-gray-500">
              Ficheiro: <strong>{nomeFicheiro}</strong>
            </p>
          </div>
        )}

        {/* ESTADO SUCESSO */}
        {estado === "sucesso" && resultado && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">✅</div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                Upload concluído!
              </p>
              <p className="text-sm text-gray-500">
                Ficheiro: <strong>{nomeFicheiro}</strong> · Tipo:{" "}
                <strong>{resultado.tipo}</strong>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-green-700">
                  {resultado.inseridos}
                </p>
                <p className="text-xs text-green-600 font-semibold mt-1">
                  Inseridos
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-blue-700">
                  {resultado.atualizados}
                </p>
                <p className="text-xs text-blue-600 font-semibold mt-1">
                  Atualizados
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-red-700">
                  {resultado.erros.length}
                </p>
                <p className="text-xs text-red-600 font-semibold mt-1">
                  Erros
                </p>
              </div>
            </div>

            {resultado.erros.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="font-bold text-red-700 mb-2">Erros:</p>
                <ul className="text-xs text-red-600 space-y-1 max-h-40 overflow-y-auto">
                  {resultado.erros.map((e, i) => (
                    <li key={i}>• {e}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={reiniciar}
              className="w-full bg-[#0026FF] hover:bg-[#001BB3] text-white font-bold py-3 rounded-lg transition-colors"
            >
              📤 Carregar outro ficheiro
            </button>
          </div>
        )}

        {/* ESTADO ERRO */}
        {estado === "erro" && resultado && (
          <div className="bg-white rounded-2xl border-2 border-red-200 p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">❌</div>
              <p className="text-2xl font-bold text-red-700 mb-1">
                Erro no upload
              </p>
              <p className="text-sm text-gray-500">
                Ficheiro: <strong>{nomeFicheiro}</strong>
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              {resultado.erros.map((e, i) => (
                <p key={i} className="text-sm text-red-700">
                  {e}
                </p>
              ))}
            </div>

            <button
              onClick={reiniciar}
              className="w-full bg-[#0026FF] hover:bg-[#001BB3] text-white font-bold py-3 rounded-lg transition-colors"
            >
              🔄 Tentar novamente
            </button>
          </div>
        )}

        {/* INFO */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm font-bold text-blue-900 mb-1">
            🔒 Privacidade garantida
          </p>
          <p className="text-xs text-blue-700">
            Nomes de clientes, moradas e telefones são removidos
            automaticamente antes de os dados serem guardados na base de
            dados.
          </p>
        </div>
      </div>
    </main>
  );
}
