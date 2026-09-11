import AppError from "../../errors/AppError";
import { parseDiaUtilSentinela } from "./businessDay";

// Dias reais de cada mês. Fevereiro aceita 29 (só é gerado em anos bissextos,
// veja GenerateTarefasRecorrentesService).
const DIAS_POR_MES: Record<number, number> = {
  1: 31, 2: 29, 3: 31, 4: 30, 5: 31, 6: 30,
  7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31
};

// Sentinelas aceitas no JSON de entregasMensais, além dos dias numéricos e de "util_N"
// ("Nº dia útil", validado à parte pois depende do calendário do ano em que for gerar)
const SENTINELAS_ENTREGA = ["ultimo", "nao_tem", "ultimo_util"];
const PRAZOS_FIXOS_OPTIONS = [
  "antecipar_dia_anterior",
  "postergar_proximo_dia_util",
  "manter_dia_exato"
];

export const validateEntregasMensais = (entregasMensais: unknown): void => {
  if (!entregasMensais || typeof entregasMensais !== "object") return;

  for (const [mes, valor] of Object.entries(entregasMensais as Record<string, unknown>)) {
    if (valor === "" || valor === null || valor === undefined) continue;
    if (typeof valor === "string" && SENTINELAS_ENTREGA.includes(valor)) continue;
    if (parseDiaUtilSentinela(valor) !== null) continue;

    const mesNum = Number(mes);
    const dia = Number(valor);
    const maxDia = DIAS_POR_MES[mesNum];

    if (!maxDia || Number.isNaN(dia) || dia < 1 || dia > maxDia) {
      throw new AppError(
        `ERR_ENTREGAS_MENSAIS_INVALIDO: dia "${valor}" inválido para o mês ${mes} em Entregas Mensais`,
        400
      );
    }
  }
};

// diasAntecipacao / diasInicio: inteiro positivo de até 4 dígitos
export const validateDiasField = (value: unknown, campo: string): void => {
  if (value === "" || value === null || value === undefined) return;
  if (!/^\d{1,4}$/.test(String(value))) {
    throw new AppError(
      `ERR_${campo.toUpperCase()}_INVALIDO: ${campo} deve ser um número de até 4 dígitos`,
      400
    );
  }
};

// Valor da Competência: inteiro (pode ser negativo) de até 4 dígitos
export const validateCompetenciaValor = (value: unknown): void => {
  if (value === "" || value === null || value === undefined) return;
  if (!/^[-+]?\d{1,4}$/.test(String(value))) {
    throw new AppError(
      "ERR_COMPETENCIA_INVALIDA: Valor da competência deve ser um número de até 4 dígitos",
      400
    );
  }
};

export const normalizePrazosFixos = (value: unknown): string | null | undefined => {
  if (value === "" || value === null || value === undefined) return value as null | undefined;
  if (value === "sim") return "antecipar_dia_anterior";
  if (value === "nao") return "manter_dia_exato";
  return String(value);
};

export const validatePrazosFixos = (value: unknown): void => {
  if (value === "" || value === null || value === undefined) return;
  if (!PRAZOS_FIXOS_OPTIONS.includes(String(value))) {
    throw new AppError(
      "ERR_PRAZOS_FIXOS_INVALIDO: Prazos Fixos deve ser uma das opções: antecipar para o dia anterior, postergar para o próximo dia útil ou manter o dia exato",
      400
    );
  }
};
