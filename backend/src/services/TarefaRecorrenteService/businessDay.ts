import { getDaysInMonth, isSaturday, isSunday } from "date-fns";

// Máximo de "Nº dia útil" oferecido no formulário (ver UTIL_MAX no frontend)
export const UTIL_MAX = 20;

const isDiaUtil = (data: Date, sabadoUtil: boolean): boolean => {
  if (isSunday(data)) return false;
  if (isSaturday(data)) return sabadoUtil;
  return true;
};

// Retorna o dia (1-31) do Nº dia útil do mês, ou null se o mês não tiver dias úteis suficientes
export const getNesimoDiaUtil = (
  ano: number,
  mes: number,
  n: number,
  sabadoUtil: boolean
): number | null => {
  const diasNoMes = getDaysInMonth(new Date(ano, mes - 1));
  let contagem = 0;
  for (let dia = 1; dia <= diasNoMes; dia++) {
    if (isDiaUtil(new Date(ano, mes - 1, dia), sabadoUtil)) {
      contagem += 1;
      if (contagem === n) return dia;
    }
  }
  return null;
};

// Retorna o dia (1-31) do último dia útil do mês
export const getUltimoDiaUtil = (ano: number, mes: number, sabadoUtil: boolean): number => {
  const diasNoMes = getDaysInMonth(new Date(ano, mes - 1));
  for (let dia = diasNoMes; dia >= 1; dia--) {
    if (isDiaUtil(new Date(ano, mes - 1, dia), sabadoUtil)) return dia;
  }
  return diasNoMes;
};

// Extrai o N de um sentinela "util_N" (ex.: "util_5" -> 5). Retorna null se não for desse formato.
export const parseDiaUtilSentinela = (valor: unknown): number | null => {
  if (typeof valor !== "string" || !valor.startsWith("util_")) return null;
  const n = Number(valor.slice(5));
  return Number.isInteger(n) && n >= 1 && n <= UTIL_MAX ? n : null;
};
