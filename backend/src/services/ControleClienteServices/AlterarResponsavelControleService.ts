import ControleCliente from "../../models/ControleCliente";
import ControleClienteHistorico from "../../models/ControleClienteHistorico";
import ControleNotificacao from "../../models/ControleNotificacao";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";

interface AlterarResponsavelData {
  controleClienteId: number;
  departamentoId?: number | null;
  usuarioId?: number | null;
  usuariosIds?: number[];
  companyId: number;
  usuarioLogadoId: number;
  observacao?: string;
}

const AlterarResponsavelControleService = async ({
  controleClienteId,
  departamentoId,
  usuarioId,
  usuariosIds,
  companyId,
  usuarioLogadoId,
  observacao,
}: AlterarResponsavelData): Promise<ControleCliente> => {
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

  // Salvar dados anteriores
  const dadosAnteriores = {
    departamentoId: vinculo.departamentoId,
    usuarioId: vinculo.usuarioId,
  };

  // Atualizar responsável
  const novosDados: any = {};
  if (departamentoId !== undefined) {
    novosDados.departamentoId = departamentoId;
  }
  if (usuarioId !== undefined) {
    novosDados.usuarioId = usuarioId;
  }

  await vinculo.update(novosDados);

  // Salvar novos dados
  const dadosNovos = {
    departamentoId: vinculo.departamentoId,
    usuarioId: vinculo.usuarioId,
  };

  // Registrar no histórico
  await ControleClienteHistorico.create({
    controleClienteId: vinculo.id,
    acao: "alteracao_responsavel",
    dadosAnteriores,
    dadosNovos,
    usuarioId: usuarioLogadoId,
    companyId,
    observacao: observacao || `Responsável do controle alterado para o cliente ${vinculo.cliente?.nome}`,
  });

  // Criar notificação
  const notificacao = await ControleNotificacao.create({
    controleClienteId: vinculo.id,
    controleConfigId: vinculo.controleConfigId,
    clienteId: vinculo.clienteId,
    tipo: "alteracao",
    titulo: "Responsável do Controle Alterado",
    mensagem: `O responsável pelo controle "${vinculo.controleConfig?.nome}" foi alterado para o cliente "${vinculo.cliente?.nome}"`,
    departamentoId: vinculo.departamentoId,
    usuarioId: vinculo.usuarioId,
    usuariosIds: usuariosIds || [],
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

  // Notificar novos responsáveis
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

  if (usuariosIds && usuariosIds.length > 0) {
    usuariosIds.forEach((uid) => {
      io.emit(`company-${companyId}-user-${uid}-notification`, {
        action: "new",
        notificacao,
      });
    });
  }

  return vinculo;
};

export default AlterarResponsavelControleService;
