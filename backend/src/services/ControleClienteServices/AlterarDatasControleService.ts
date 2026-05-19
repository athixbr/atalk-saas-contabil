import ControleCliente from "../../models/ControleCliente";
import ControleClienteHistorico from "../../models/ControleClienteHistorico";
import ControleNotificacao from "../../models/ControleNotificacao";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";

interface AlterarDatasData {
  controleClienteId: number;
  dataInicio?: Date;
  dataFim?: Date;
  companyId: number;
  usuarioLogadoId: number;
  observacao?: string;
}

const AlterarDatasControleService = async ({
  controleClienteId,
  dataInicio,
  dataFim,
  companyId,
  usuarioLogadoId,
  observacao,
}: AlterarDatasData): Promise<ControleCliente> => {
  // Buscar vínculo
  const vinculo = await ControleCliente.findOne({
    where: { id: controleClienteId },
    include: [
      { association: "controleConfig" },
      { association: "cliente" },
      { association: "departamento" },
      { association: "usuario" },
    ],
  });

  if (!vinculo) {
    throw new AppError("Vínculo não encontrado", 404);
  }

  // Validar datas
  if (dataInicio && dataFim && new Date(dataInicio) > new Date(dataFim)) {
    throw new AppError("Data de início não pode ser maior que data de fim", 400);
  }

  // Salvar dados anteriores
  const dadosAnteriores = {
    dataInicio: vinculo.dataInicio,
    dataFim: vinculo.dataFim,
  };

  // Atualizar datas
  const novosDados: any = {};
  if (dataInicio !== undefined) {
    novosDados.dataInicio = dataInicio;
  }
  if (dataFim !== undefined) {
    novosDados.dataFim = dataFim;
  }

  await vinculo.update(novosDados);

  // Salvar novos dados
  const dadosNovos = {
    dataInicio: vinculo.dataInicio,
    dataFim: vinculo.dataFim,
  };

  // Registrar no histórico
  await ControleClienteHistorico.create({
    controleClienteId: vinculo.id,
    acao: "alteracao_datas",
    dadosAnteriores,
    dadosNovos,
    usuarioId: usuarioLogadoId,
    companyId,
    observacao: observacao || `Datas do controle alteradas para o cliente ${vinculo.cliente?.nome}`,
  });

  // Criar notificação
  const notificacao = await ControleNotificacao.create({
    controleClienteId: vinculo.id,
    controleConfigId: vinculo.controleConfigId,
    clienteId: vinculo.clienteId,
    tipo: "alteracao",
    titulo: "Datas do Controle Alteradas",
    mensagem: `As datas do controle "${vinculo.controleConfig?.nome}" foram alteradas para o cliente "${vinculo.cliente?.nome}"`,
    departamentoId: vinculo.departamentoId,
    usuarioId: vinculo.usuarioId,
    lida: false,
    metadata: {
      dadosAnteriores,
      dadosNovos,
      observacao,
      link: `/controles-vinculos/${vinculo.id}`,
    },
    companyId,
  });

  await vinculo.reload();

  // Emitir eventos
  const io = getIO();
  io.emit(`company-${companyId}-controle-vinculo`, {
    action: "update",
    vinculo,
    notificacao,
  });

  // Notificar responsáveis
  if (vinculo.departamentoId) {
    io.emit(`company-${companyId}-department-${vinculo.departamentoId}-notification`, {
      action: "new",
      notificacao,
    });
  }

  if (vinculo.usuarioId) {
    io.emit(`company-${companyId}-user-${vinculo.usuarioId}-notification`, {
      action: "new",
      notificacao,
    });
  }

  return vinculo;
};

export default AlterarDatasControleService;
