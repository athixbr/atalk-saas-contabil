import ControleCliente from "../../models/ControleCliente";
import ControleClienteHistorico from "../../models/ControleClienteHistorico";
import Cliente from "../../models/Cliente";
import ControleConfig from "../../models/ControleConfig";
import TarefaConfig from "../../models/TarefaConfig";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";

interface DesvincularEmLoteData {
  controleClienteIds: number[];
  companyId: number;
  usuarioLogadoId: number;
  observacao?: string;
  excluirDefinitivamente?: boolean;
}

const DesvincularEmLoteService = async ({
  controleClienteIds,
  companyId,
  usuarioLogadoId,
  observacao,
  excluirDefinitivamente = false,
}: DesvincularEmLoteData): Promise<{ vinculosRemovidos: number; erros: any[] }> => {
  if (!controleClienteIds || controleClienteIds.length === 0) {
    throw new AppError("Nenhum vínculo informado", 400);
  }

  const vinculosRemovidos: number[] = [];
  const erros: any[] = [];

  for (const controleClienteId of controleClienteIds) {
    try {
      // Verificar se o vínculo existe
      const vinculo = await ControleCliente.findOne({
        where: { id: controleClienteId },
        include: [
          {
            association: "controleConfig",
            where: { companyId },
          },
          { association: "tarefaConfig" },
          { association: "cliente" },
        ],
      });

      if (!vinculo) {
        erros.push({
          controleClienteId,
          erro: "Vínculo não encontrado",
        });
        continue;
      }

      if (excluirDefinitivamente) {
        // Criar histórico antes de excluir
        await ControleClienteHistorico.create({
          controleClienteId: vinculo.id,
          companyId,
          usuarioId: usuarioLogadoId,
          acao: "EXCLUSAO_DEFINITIVA",
          descricao: observacao || "Vínculo excluído definitivamente em lote",
          dadosAntigos: {
            controleConfigId: vinculo.controleConfigId,
            tarefaConfigId: vinculo.tarefaConfigId,
            clienteId: vinculo.clienteId,
            dataInicio: vinculo.dataInicio,
            dataFim: vinculo.dataFim,
            departamentoId: vinculo.departamentoId,
            usuarioId: vinculo.usuarioId,
            ativo: vinculo.ativo,
          },
        });

        // Excluir definitivamente
        await vinculo.destroy();
      } else {
        // Apenas desativar
        vinculo.ativo = false;
        await vinculo.save();

        // Criar histórico
        await ControleClienteHistorico.create({
          controleClienteId: vinculo.id,
          companyId,
          usuarioId: usuarioLogadoId,
          acao: "DESATIVACAO",
          descricao: observacao || "Vínculo desativado em lote",
          dadosAntigos: { ativo: true },
          dadosNovos: { ativo: false },
        });
      }

      vinculosRemovidos.push(controleClienteId);

      // Emitir evento via socket
      const io = getIO();
      io.to(`company-${companyId}`)
        .to(`vinculo-${vinculo.id}`)
        .emit(`company-${companyId}-vinculo`, {
          action: excluirDefinitivamente ? "delete" : "update",
          vinculo: vinculo,
        });
    } catch (error: any) {
      erros.push({
        controleClienteId,
        erro: error.message || "Erro ao remover vínculo",
      });
    }
  }

  return {
    vinculosRemovidos: vinculosRemovidos.length,
    erros,
  };
};

export default DesvincularEmLoteService;
