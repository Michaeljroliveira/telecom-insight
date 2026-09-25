// =============================================
// PARSER INSTALCARE
// Lê CSV/XLSX, anonimiza e normaliza
// =============================================

import Papa from "papaparse";
import * as XLSX from "xlsx";

// ------------------------------
// TIPOS
// ------------------------------

export interface InstalacaoParseada {
  id_instalacao: number;
  id_cliente: number | null;
  estado: string;
  tipo_instalacao: string;
  perfil: string | null;
  tecnico_email: string | null;
  data_criacao: string | null;
  data_agendamento: string | null;
  data_conclusao: string | null;
  codigo_postal: string | null;
  localidade: string | null;
  provincia: string | null;
}

export interface AvariaParseada {
  id_avaria: number;
  id_instalacao_original: number | null;
  id_cliente: number | null;
  estado: string;
  tipo_avaria: string | null;
  tecnico_email: string | null;
  ultimo_tecnico: string | null;
  data_criacao: string | null;
  data_agendamento: string | null;
  data_conclusao: string | null;
  periodo_infancia: string | null;
  codigo_postal: string | null;
  localidade: string | null;
  provincia: string | null;
}

export interface ResultadoParse {
  instalacoes: InstalacaoParseada[];
  avarias: AvariaParseada[];
  totalLinhas: number;
  erros: string[];
}

// ------------------------------
// LER FICHEIRO (CSV ou XLSX)
// ------------------------------

export async function lerFicheiro(file: File): Promise<any[]> {
  const nome = file.name.toLowerCase();

  // CSV
  if (nome.endsWith(".csv")) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        delimiter: "", // deteta automaticamente (`,`, `;`, `\t`)
        complete: (result) => resolve(result.data),
        error: (error) => reject(error),
      });
    });
  }

  // XLSX
  if (nome.endsWith(".xlsx") || nome.endsWith(".xls")) {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const primeiraSheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(primeiraSheet, { raw: false });
  }

  throw new Error("Formato não suportado. Usa CSV ou XLSX.");
}

// ------------------------------
// CONVERSORES AUXILIARES
// ------------------------------

function paraNumero(valor: any): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = Number(String(valor).trim());
  return isNaN(n) ? null : n;
}

function paraTexto(valor: any): string | null {
  if (valor === null || valor === undefined) return null;
  const texto = String(valor).trim();
  return texto === "" ? null : texto;
}

function paraData(valor: any): string | null {
  if (!valor) return null;
  const texto = String(valor).trim();
  if (texto === "") return null;

  // Formato: "2026-09-22 10:00:00" ou "2026-09-22"
  const match = texto.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s|T)?(\d{2})?:?(\d{2})?:?(\d{2})?/);
  if (match) {
    const [, ano, mes, dia, hora = "00", min = "00", seg = "00"] = match;
    return `${ano}-${mes}-${dia}T${hora}:${min}:${seg}`;
  }

  // Formato: "22/09/2026 10:00"
  const match2 = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s|T)?(\d{2})?:?(\d{2})?/);
  if (match2) {
    const [, dia, mes, ano, hora = "00", min = "00"] = match2;
    return `${ano}-${mes}-${dia}T${hora}:${min}:00`;
  }

  return null;
}

// ------------------------------
// ANONIMIZAÇÃO
// ------------------------------

/**
 * Remove campos sensíveis:
 * - Nome do cliente
 * - Morada completa
 * Mantém apenas:
 * - ID do cliente
 * - Código postal (para análises geográficas)
 * - Localidade
 * - Província
 */
function anonimizar(linha: any): void {
  delete linha["Nombre del cliente"];
  delete linha["Dirección"];
  delete linha["Zip code"];
  delete linha["Teléfono cliente"];
  delete linha["Telefone cliente"];
  delete linha["Empresa"];
  delete linha["Operador"];
}

// ------------------------------
// DETETAR TIPO DE FICHEIRO
// ------------------------------

export function detetarTipo(linhas: any[]): "instalacoes" | "avarias" | "desconhecido" {
  if (linhas.length === 0) return "desconhecido";

  const primeira = linhas[0];
  const colunas = Object.keys(primeira);

  // Se tem "Id Instalación" → instalações
  if (colunas.some((c) => c.toLowerCase().includes("id instalación"))) {
    return "instalacoes";
  }

  // Se tem "Id Avería" ou "ID Instalación" (mas não Id Instalación direto)
  if (
    colunas.some((c) => c.toLowerCase().includes("id avería")) ||
    colunas.some((c) => c.toLowerCase().includes("id averia"))
  ) {
    return "avarias";
  }

  return "desconhecido";
}

// ------------------------------
// PROCESSAR INSTALAÇÕES
// ------------------------------

export function processarInstalacoes(linhas: any[]): InstalacaoParseada[] {
  const resultado: InstalacaoParseada[] = [];

  for (const linhaOriginal of linhas) {
    // Clonar para não alterar o original
    const linha = { ...linhaOriginal };
    anonimizar(linha);

    const id_instalacao = paraNumero(linha["Id Instalación"]);
    if (!id_instalacao) continue;

    resultado.push({
      id_instalacao,
      id_cliente: paraNumero(linha["ID Cliente"] || linha["Id Cliente"]),
      estado: paraTexto(linha["Estado"]) || "",
      tipo_instalacao: paraTexto(linha["Tipo de instalación"]) || "",
      perfil: paraTexto(linha["Perfil"]),
      tecnico_email: paraTexto(linha["Persona asignada"]),
      data_criacao: paraData(linha["Creada"]),
      data_agendamento: paraData(linha["Citada"]),
      data_conclusao: null, // calculado depois se estado = Finished
      codigo_postal: paraTexto(linha["Código postal"] || linha["Codigo postal"]),
      localidade: paraTexto(linha["Localidad"]),
      provincia: paraTexto(linha["Provincia"]),
    });
  }

  return resultado;
}

// ------------------------------
// PROCESSAR AVARIAS
// ------------------------------

export function processarAvarias(linhas: any[]): AvariaParseada[] {
  const resultado: AvariaParseada[] = [];

  for (const linhaOriginal of linhas) {
    const linha = { ...linhaOriginal };
    anonimizar(linha);

    const id_avaria = paraNumero(linha["Id Avería"] || linha["Id Averia"]);
    if (!id_avaria) continue;

    resultado.push({
      id_avaria,
      id_instalacao_original: paraNumero(linha["ID Instalación"] || linha["ID Instalacion"]),
      id_cliente: paraNumero(linha["ID Cliente"] || linha["Id Cliente"]),
      estado: paraTexto(linha["Estado"]) || "",
      tipo_avaria: paraTexto(linha["Tipo de Avería"] || linha["Tipo de Averia"]),
      tecnico_email: paraTexto(linha["Persona asignada"]),
      ultimo_tecnico: paraTexto(linha["Último técnico"] || linha["Ultimo tecnico"]),
      data_criacao: paraData(linha["Creada"]),
      data_agendamento: paraData(linha["Citada"]),
      data_conclusao: null,
      periodo_infancia: paraTexto(linha["Periodo de Infancia"]),
      codigo_postal: paraTexto(linha["Código postal"] || linha["Codigo postal"]),
      localidade: paraTexto(linha["Localidad"]),
      provincia: paraTexto(linha["Provincia"]),
    });
  }

  return resultado;
}
