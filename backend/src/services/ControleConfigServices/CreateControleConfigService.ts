import ControleConfig from "../../models/ControleConfig";
import ControleCliente from "../../models/ControleCliente";
import AppError from "../../errors/AppError";

interface ControleClienteData {
  clienteId: number;
  dataVencimento: string;
}

interface Request {
  codigo: string;
  nome: string;
  departamentoId: number;
  grupoServicoId?: number;
  tipoServicoId?: number;
  prioridadeId?: number;
  prazoId?: number;
  tipoControle: string;
  recorrente: boolean;
  valorReferencial?: number;
  sabadoUtil: boolean;
  diasNaoUteis?: string;
  diasLembrete?: number;
  aceitaArquivos: boolean;
  ativo: boolean;
  companyId: number;
  clientes?: ControleClienteData[];
}

const CreateControleConfigService = async ({
  codigo,
  nome,
  departamentoId,
  grupoServicoId,
  tipoServicoId,
  prioridadeId,
  prazoId,
  tipoControle,
  recorrente,
  valorReferencial,
  sabadoUtil,
  diasNaoUteis,
  diasLembrete,
  aceitaArquivos,
  ativo,
  companyId,
  clientes = [],
}: Request): Promise<ControleConfig> => {
  // Validar se código já existe
  const controleExists = await ControleConfig.findOne({
    where: { codigo, companyId },
  });

  if (controleExists) {
    throw new AppError("ERR_CONTROLE_CONFIG_DUPLICATED", 400);
  }

  // Criar ControleConfig
  const controleConfig = await ControleConfig.create({
    codigo,
    nome,
    departamentoId,
    grupoServicoId,
    tipoServicoId,
    prioridadeId,
    prazoId,
    tipoControle,
    recorrente,
    valorReferencial,
    sabadoUtil,
    diasNaoUteis,
    diasLembrete,
    aceitaArquivos,
    ativo,
    companyId,
  });

  // Se tipoControle é 'cliente' e tem clientes, criar relacionamentos
  if (tipoControle === "cliente" && clientes.length > 0) {
    const controleClientesData = clientes.map((cliente) => ({
      controleConfigId: controleConfig.id,
      clienteId: cliente.clienteId,
      dataVencimento: cliente.dataVencimento,
    }));

    await ControleCliente.bulkCreate(controleClientesData);
  }

  // Recarregar com relacionamentos
  await controleConfig.reload({
    include: [
      { association: "departamento" },
      { association: "grupoServico" },
      { association: "tipoServico" },
      { association: "prioridade" },
      { association: "prazo" },
      {
        association: "controleClientes",
        include: [{ association: "cliente" }],
      },
    ],
  });

  return controleConfig;
};

export default CreateControleConfigService;
