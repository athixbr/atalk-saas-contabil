import ControleConfig from "../../models/ControleConfig";
import ControleCliente from "../../models/ControleCliente";
import AppError from "../../errors/AppError";

interface ControleClienteData {
  clienteId: number;
  dataVencimento: string;
}

interface Request {
  controleConfigId: number;
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
  clientes?: ControleClienteData[];
}

const UpdateControleConfigService = async ({
  controleConfigId,
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
  clientes = [],
}: Request): Promise<ControleConfig> => {
  const controleConfig = await ControleConfig.findByPk(controleConfigId);

  if (!controleConfig) {
    throw new AppError("ERR_CONTROLE_CONFIG_NOT_FOUND", 404);
  }

  // Verificar duplicação de código (exceto o próprio registro)
  const controleExists = await ControleConfig.findOne({
    where: {
      codigo,
      companyId: controleConfig.companyId,
    },
  });

  if (controleExists && controleExists.id !== controleConfigId) {
    throw new AppError("ERR_CONTROLE_CONFIG_DUPLICATED", 400);
  }

  // Atualizar ControleConfig
  await controleConfig.update({
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
  });

  // Gerenciar clientes
  // 1. Remover todos os clientes antigos
  await ControleCliente.destroy({
    where: { controleConfigId },
  });

  // 2. Se tipoControle é 'cliente' e tem novos clientes, criar
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

export default UpdateControleConfigService;
