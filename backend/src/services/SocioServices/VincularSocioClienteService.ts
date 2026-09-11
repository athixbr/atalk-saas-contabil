import ClienteSocio from "../../models/ClienteSocio";
import Cliente from "../../models/Cliente";
import Socio from "../../models/Socio";
import AppError from "../../errors/AppError";

interface Request {
  clienteId: number;
  socioId: number;
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
  companyId: number;
}

const VincularSocioClienteService = async ({
  clienteId,
  socioId,
  percentual,
  cargo,
  valorQuota,
  quantidadeQuotas,
  dataEntrada,
  dataSaida,
  podeAssinar = false,
  poderIsolado = false,
  isAdministrador = false,
  recebeProlabore = false,
  valorProlabore,
  tipoParticipacao,
  observacoes,
  ativo = true,
  modoCadastro = "avancado",
  companyId,
}: Request): Promise<ClienteSocio> => {
  // Verificar se cliente existe e pertence à company
  const cliente = await Cliente.findOne({
    where: { id: clienteId, companyId },
  });

  if (!cliente) {
    throw new AppError("Empresa/Cliente não encontrado", 404);
  }

  // Verificar se sócio existe e pertence à company
  const socio = await Socio.findOne({
    where: { id: socioId, companyId },
  });

  if (!socio) {
    throw new AppError("Sócio não encontrado", 404);
  }

  // Verificar se vínculo já existe
  const vinculoExistente = await ClienteSocio.findOne({
    where: { clienteId, socioId },
  });

  if (vinculoExistente) {
    throw new AppError("Sócio já vinculado a esta empresa", 400);
  }

  // Limpar valores vazios e converter para null
  const cleanPercentual = percentual && percentual !== "" ? parseFloat(String(percentual)) : null;
  const cleanValorQuota = valorQuota && valorQuota !== "" ? parseFloat(String(valorQuota)) : null;
  const cleanQuantidadeQuotas = quantidadeQuotas && quantidadeQuotas !== "" ? parseInt(String(quantidadeQuotas)) : null;
  const cleanValorProlabore = valorProlabore && valorProlabore !== "" ? parseFloat(String(valorProlabore)) : null;
  const cleanDataEntrada = dataEntrada && !isNaN(new Date(dataEntrada).getTime()) ? dataEntrada : null;
  const cleanDataSaida = dataSaida && !isNaN(new Date(dataSaida).getTime()) ? dataSaida : null;
  const cleanCargo = cargo && String(cargo).trim() !== "" ? cargo : null;
  const cleanObservacoes = observacoes && String(observacoes).trim() !== "" ? observacoes : null;
  const cleanTipoParticipacao = tipoParticipacao && String(tipoParticipacao).trim() !== "" ? tipoParticipacao : null;
  const cleanModoCadastro = modoCadastro === "basico" ? "basico" : "avancado";

  // Validar percentual se fornecido
  if (cleanPercentual !== null && (cleanPercentual < 0 || cleanPercentual > 100)) {
    throw new AppError("Percentual deve estar entre 0 e 100", 400);
  }

  // Criar vínculo
  const vinculo = await ClienteSocio.create({
    clienteId,
    socioId,
    percentual: cleanPercentual,
    cargo: cleanCargo,
    valorQuota: cleanValorQuota,
    quantidadeQuotas: cleanQuantidadeQuotas,
    dataEntrada: cleanDataEntrada,
    dataSaida: cleanDataSaida,
    podeAssinar,
    poderIsolado,
    isAdministrador,
    recebeProlabore,
    valorProlabore: cleanValorProlabore,
    tipoParticipacao: cleanTipoParticipacao,
    observacoes: cleanObservacoes,
    ativo,
    modoCadastro: cleanModoCadastro,
  });

  // Recarregar com relacionamentos
  await vinculo.reload({
    include: [
      {
        model: Cliente,
        as: "cliente",
        attributes: ["id", "nome", "cnpj", "tipoCliente"],
      },
      {
        model: Socio,
        as: "socio",
        attributes: ["id", "nome", "cpf"],
      },
    ],
  });

  return vinculo;
};

export default VincularSocioClienteService;
