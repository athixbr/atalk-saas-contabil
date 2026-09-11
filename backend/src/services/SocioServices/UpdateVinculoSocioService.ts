import ClienteSocio from "../../models/ClienteSocio";
import AppError from "../../errors/AppError";

interface Request {
  vinculoData: {
    percentual?: number | string | null;
    cargo?: string | null;
    valorQuota?: number | string | null;
    quantidadeQuotas?: number | string | null;
    dataEntrada?: Date | string | null;
    dataSaida?: Date | string | null;
    podeAssinar?: boolean;
    poderIsolado?: boolean;
    isAdministrador?: boolean;
    recebeProlabore?: boolean;
    valorProlabore?: number | string | null;
    tipoParticipacao?: string | null;
    observacoes?: string | null;
    ativo?: boolean;
    modoCadastro?: string;
  };
  vinculoId: string | number;
  companyId: number;
}

const UpdateVinculoSocioService = async ({
  vinculoData,
  vinculoId,
  companyId,
}: Request): Promise<ClienteSocio> => {
  const vinculo = await ClienteSocio.findByPk(vinculoId, {
    include: [
      {
        association: "cliente",
        where: { companyId },
      },
    ],
  });

  if (!vinculo) {
    throw new AppError("Vínculo não encontrado", 404);
  }

  // Limpar e converter valores vazios para null
  const cleanPercentual = vinculoData.percentual && vinculoData.percentual !== "" 
    ? parseFloat(String(vinculoData.percentual)) 
    : null;
  const cleanValorQuota = vinculoData.valorQuota && vinculoData.valorQuota !== "" 
    ? parseFloat(String(vinculoData.valorQuota)) 
    : null;
  const cleanQuantidadeQuotas = vinculoData.quantidadeQuotas && vinculoData.quantidadeQuotas !== "" 
    ? parseInt(String(vinculoData.quantidadeQuotas)) 
    : null;
  const cleanValorProlabore = vinculoData.valorProlabore && vinculoData.valorProlabore !== "" 
    ? parseFloat(String(vinculoData.valorProlabore)) 
    : null;
  const cleanDataEntrada = vinculoData.dataEntrada && !isNaN(new Date(vinculoData.dataEntrada).getTime()) 
    ? vinculoData.dataEntrada 
    : null;
  const cleanDataSaida = vinculoData.dataSaida && !isNaN(new Date(vinculoData.dataSaida).getTime()) 
    ? vinculoData.dataSaida 
    : null;
  const cleanCargo = vinculoData.cargo && vinculoData.cargo.trim() !== ""
    ? vinculoData.cargo
    : null;
  const cleanObservacoes = vinculoData.observacoes && vinculoData.observacoes.trim() !== ""
    ? vinculoData.observacoes
    : null;
  const cleanTipoParticipacao = vinculoData.tipoParticipacao && String(vinculoData.tipoParticipacao).trim() !== ""
    ? vinculoData.tipoParticipacao
    : null;
  const cleanModoCadastro = vinculoData.modoCadastro === "basico" ? "basico" : "avancado";

  // Validar percentual se fornecido
  if (cleanPercentual !== null && (cleanPercentual < 0 || cleanPercentual > 100)) {
    throw new AppError("Percentual deve estar entre 0 e 100", 400);
  }

  // Preparar dados limpos para update
  const cleanedData = {
    ...(vinculoData.percentual !== undefined && { percentual: cleanPercentual }),
    ...(vinculoData.cargo !== undefined && { cargo: cleanCargo }),
    ...(vinculoData.valorQuota !== undefined && { valorQuota: cleanValorQuota }),
    ...(vinculoData.quantidadeQuotas !== undefined && { quantidadeQuotas: cleanQuantidadeQuotas }),
    ...(vinculoData.dataEntrada !== undefined && { dataEntrada: cleanDataEntrada }),
    ...(vinculoData.dataSaida !== undefined && { dataSaida: cleanDataSaida }),
    ...(vinculoData.podeAssinar !== undefined && { podeAssinar: vinculoData.podeAssinar }),
    ...(vinculoData.poderIsolado !== undefined && { poderIsolado: vinculoData.poderIsolado }),
    ...(vinculoData.isAdministrador !== undefined && { isAdministrador: vinculoData.isAdministrador }),
    ...(vinculoData.recebeProlabore !== undefined && { recebeProlabore: vinculoData.recebeProlabore }),
    ...(vinculoData.valorProlabore !== undefined && { valorProlabore: cleanValorProlabore }),
    ...(vinculoData.tipoParticipacao !== undefined && { tipoParticipacao: cleanTipoParticipacao }),
    ...(vinculoData.observacoes !== undefined && { observacoes: cleanObservacoes }),
    ...(vinculoData.ativo !== undefined && { ativo: vinculoData.ativo }),
    ...(vinculoData.modoCadastro !== undefined && { modoCadastro: cleanModoCadastro }),
  };

  await vinculo.update(cleanedData);

  await vinculo.reload({
    include: ["cliente", "socio"],
  });

  return vinculo;
};

export default UpdateVinculoSocioService;
