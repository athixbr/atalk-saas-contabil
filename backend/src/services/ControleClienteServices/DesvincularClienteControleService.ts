import ControleCliente from "../../models/ControleCliente";
import ControleClienteHistorico from "../../models/ControleClienteHistorico";
import ControleNotificacao from "../../models/ControleNotificacao";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";

interface DesvincularData {
  controleClienteId: number;
  companyId: number;
  usuarioLogadoId: number;
  observacao?: string;
  excluirDefinitivamente?: boolean;
}

const DesvincularClienteControleService = async ({
  controleClienteId,
  companyId,
  usuarioLogadoId,
  observacao,
  excluirDefinitivamente = false,
}: DesvincularData): Promise<ControleCliente | null> => {
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

  // Salvar dados antes da desvinculação
  const dadosAnteriores = {
    controleConfigId: vinculo.controleConfigId,
    clienteId: vinculo.clienteId,
    dataInicio: vinculo.dataInicio,
    dataFim: vinculo.dataFim,
    departamentoId: vinculo.departamentoId,
    usuarioId: vinculo.usuarioId,
    ativo: vinculo.ativo,
    observacoes: vinculo.observacoes,
  };

  if (excluirDefinitivamente) {
    // Excluir definitivamente
    await vinculo.destroy();

    // Registrar no histórico
    await ControleClienteHistorico.create({
      controleClienteId: vinculo.id,
      acao: "desvinculacao",
      dadosAnteriores,
      dadosNovos: null,
      usuarioId: usuarioLogadoId,
      companyId,
      observacao: observacao || `Controle desvinculado definitivamente do cliente ${vinculo.cliente?.nome}`,
    });

    // Criar notificação
    const notificacao = await ControleNotificacao.create({
      controleClienteId: vinculo.id,
      controleConfigId: vinculo.controleConfigId,
      clienteId: vinculo.clienteId,
      tipo: "desvinculacao",
      titulo: "Controle Desvinculado",
      mensagem: `O controle "${vinculo.controleConfig?.nome}" foi desvinculado do cliente "${vinculo.cliente?.nome}"`,
      departamentoId: vinculo.departamentoId,
      usuarioId: vinculo.usuarioId,
      lida: false,
      metadata: {
        excluido: true,
        observacao,
      },
      companyId,
    });

    // Emitir eventos
    const io = getIO();
    io.emit(`company-${companyId}-controle-vinculo`, {
      action: "delete",
      controleClienteId: vinculo.id,
      notificacao,
    });

    return null;
  } else {
    // Apenas desativar (soft delete)
    await vinculo.update({ ativo: false });

    // Registrar no histórico
    await ControleClienteHistorico.create({
      controleClienteId: vinculo.id,
      acao: "desativacao",
      dadosAnteriores,
      dadosNovos: { ...dadosAnteriores, ativo: false },
      usuarioId: usuarioLogadoId,
      companyId,
      observacao: observacao || `Controle desativado para o cliente ${vinculo.cliente?.nome}`,
    });

    // Criar notificação
    const notificacao = await ControleNotificacao.create({
      controleClienteId: vinculo.id,
      controleConfigId: vinculo.controleConfigId,
      clienteId: vinculo.clienteId,
      tipo: "desvinculacao",
      titulo: "Controle Desativado",
      mensagem: `O controle "${vinculo.controleConfig?.nome}" foi desativado para o cliente "${vinculo.cliente?.nome}"`,
      departamentoId: vinculo.departamentoId,
      usuarioId: vinculo.usuarioId,
      lida: false,
      metadata: {
        desativado: true,
        observacao,
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

    return vinculo;
  }
};

export default DesvincularClienteControleService;
