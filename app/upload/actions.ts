"use server";
export const maxDuration = 60; // 60 segundos máximo
import { createClient } from "@/lib/supabase/server";
import {
  InstalacaoParseada,
  AvariaParseada,
} from "@/lib/parsers/instalcare";

interface ResultadoUpload {
  sucesso: boolean;
  inseridos: number;
  atualizados: number;
  erros: string[];
}

// ------------------------------
// UPLOAD DE INSTALAÇÕES
// ------------------------------

export async function uploadInstalacoes(
  instalacoes: InstalacaoParseada[]
): Promise<ResultadoUpload> {
  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      sucesso: false,
      inseridos: 0,
      atualizados: 0,
      erros: ["Não autenticado"],
    };
  }

  let inseridos = 0;
  let atualizados = 0;
  const erros: string[] = [];

  // Processar em lotes de 100 para não sobrecarregar
  const LOTE = 100;
  for (let i = 0; i < instalacoes.length; i += LOTE) {
    const lote = instalacoes.slice(i, i + LOTE);

    // Verificar quais já existem
    const ids = lote.map((x) => x.id_instalacao);
    const { data: existentes } = await supabase
      .from("instalacoes")
      .select("id_instalacao")
      .in("id_instalacao", ids);

    const idsExistentes = new Set(
      (existentes || []).map((x: any) => x.id_instalacao)
    );

    // Separar em novos e atualizações
    const novos = lote.filter((x) => !idsExistentes.has(x.id_instalacao));
    const updates = lote.filter((x) => idsExistentes.has(x.id_instalacao));

    // Inserir novos
    if (novos.length > 0) {
      const { error } = await supabase.from("instalacoes").insert(novos);
      if (error) {
        erros.push(`Erro ao inserir lote ${i}: ${error.message}`);
      } else {
        inseridos += novos.length;
      }
    }

    // Atualizar existentes
    for (const item of updates) {
      const { error } = await supabase
        .from("instalacoes")
        .update(item)
        .eq("id_instalacao", item.id_instalacao);
      if (error) {
        erros.push(`Erro ao atualizar ${item.id_instalacao}: ${error.message}`);
      } else {
        atualizados++;
      }
    }
  }

  return {
    sucesso: erros.length === 0,
    inseridos,
    atualizados,
    erros,
  };
}

// ------------------------------
// UPLOAD DE AVARIAS
// ------------------------------

export async function uploadAvarias(
  avarias: AvariaParseada[]
): Promise<ResultadoUpload> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      sucesso: false,
      inseridos: 0,
      atualizados: 0,
      erros: ["Não autenticado"],
    };
  }

  let inseridos = 0;
  let atualizados = 0;
  const erros: string[] = [];

  const LOTE = 100;
  for (let i = 0; i < avarias.length; i += LOTE) {
    const lote = avarias.slice(i, i + LOTE);

    const ids = lote.map((x) => x.id_avaria);
    const { data: existentes } = await supabase
      .from("avarias")
      .select("id_avaria")
      .in("id_avaria", ids);

    const idsExistentes = new Set(
      (existentes || []).map((x: any) => x.id_avaria)
    );

    const novos = lote.filter((x) => !idsExistentes.has(x.id_avaria));
    const updates = lote.filter((x) => idsExistentes.has(x.id_avaria));

    if (novos.length > 0) {
      const { error } = await supabase.from("avarias").insert(novos);
      if (error) {
        erros.push(`Erro ao inserir lote ${i}: ${error.message}`);
      } else {
        inseridos += novos.length;
      }
    }

    for (const item of updates) {
      const { error } = await supabase
        .from("avarias")
        .update(item)
        .eq("id_avaria", item.id_avaria);
      if (error) {
        erros.push(`Erro ao atualizar ${item.id_avaria}: ${error.message}`);
      } else {
        atualizados++;
      }
    }
  }

  return {
    sucesso: erros.length === 0,
    inseridos,
    atualizados,
    erros,
  };
}
