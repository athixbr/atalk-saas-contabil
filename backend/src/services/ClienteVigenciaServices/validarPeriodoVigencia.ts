import { Op } from "sequelize";
import ClienteVigencia from "../../models/ClienteVigencia";
import AppError from "../../errors/AppError";

interface PeriodoVigencia {
  dataInicial: string;
  dataFinal?: string | null;
}

const DATA_MAXIMA = "9999-12-31";

// Valida que o período (dataInicial–dataFinal) de uma vigência ATIVA (sem
// data final) não coincide nem se sobrepõe ao de outra vigência já
// cadastrada para o mesmo cliente. Exceção: quando a nova vigência começa
// hoje, sobreposição é permitida (fechar uma vigência e abrir outra no
// mesmo dia é o fluxo normal).
//
// Vigências com data final preenchida são registros históricos/encerrados
// (backfill de anos anteriores) e não passam por essa validação — podem
// ser cadastradas livremente, sem limite de data.
const validarPeriodoVigencia = async (
  clienteId: number,
  novaVigencia: PeriodoVigencia,
  vigenciaIdExcluida?: number
): Promise<void> => {
  const novoFim = novaVigencia.dataFinal || null;
  if (novoFim) {
    return;
  }

  const hoje = new Date().toISOString().split("T")[0];
  const novoInicio = novaVigencia.dataInicial;
  const comecaHoje = novoInicio === hoje;

  const where: any = { clienteId };
  if (vigenciaIdExcluida) {
    where.id = { [Op.ne]: vigenciaIdExcluida };
  }

  if (comecaHoje) {
    return;
  }

  const outrasVigencias = await ClienteVigencia.findAll({ where });

  for (const vigencia of outrasVigencias) {
    const fimExistente = vigencia.dataFinal || null;

    // Como a nova vigência é ativa (sem data final), ela cobre até o
    // infinito — só sobrepõe se seu início ocorrer antes do fim de uma
    // vigência existente (ou se essa vigência existente também for aberta).
    const sobrepoe = novoInicio <= (fimExistente || DATA_MAXIMA);
    if (sobrepoe) {
      throw new AppError(
        "O período desta vigência se sobrepõe ao de outra vigência já cadastrada para este cliente.",
        400
      );
    }
  }
};

export default validarPeriodoVigencia;
