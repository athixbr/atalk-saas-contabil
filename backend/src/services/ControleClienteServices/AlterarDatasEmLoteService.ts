import ControleCliente from "../../models/ControleCliente";
import ControleClienteHistorico from "../../models/ControleClienteHistorico";
import Cliente from "../../models/Cliente";
import ControleConfig from "../../models/ControleConfig";
import TarefaConfig from "../../models/TarefaConfig";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";

interface VinculoData {
  controleClienteId: number;
  dataInicio?: Date;
  dataFim?: Date;
}

interface AlterarDatasEmLoteData {
  vinculos: VinculoData[];
  companyId: number;
  usuarioLogadoId: number;
  observacao?: string;
}

const AlterarDatasEmLoteService = async ({
  vinculos,
  companyId,
  usuarioLogadoId,
  observacao,
}: AlterarDatasEmLoteData): Promise<{ vinculosAlterados: number; erros: any[] }> => {
  if (!vinculos || vinculos.length === 0) {
    throw new AppError("Nenhum vínculo informado", 400);
  }

  const vinculosAlterados: ControleCliente[] = [];
  const erros: any[] = [];

  for (const vinculoData of vinculos) {
    try {
      const { controleClienteId, dataInicio, dataFim } = vinculoData;

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

      // Validar datas
      if (dataInicio && dataFim && new Date(dataInicio) > new Date(dataFim)) {
        erros.push({
          controleClienteId,
          erro: "Data de início não pode ser maior que data fim",
        });
        continue;
      }

      // Guardar dados antigos para histórico
      const dataInicioAntiga = vinculo.dataInicio;
      const dataFimAntiga = vinculo.dataFim;

      // Atualizar datas
      if (dataInicio !== undefined) {
        vinculo.dataInicio = dataInicio;
      }
      if (dataFim !== undefined) {
        vinculo.dataFim = dataFim;
      }

      await vinculo.save();

      // Criar histórico
      await ControleClienteHistorico.create({
        controleClienteId: vinculo.id,
        companyId,
        usuarioId: usuarioLogadoId,
        acao: "ALTERACAO_DATAS",
        descricao: observacao || "Datas alteradas em lote",
        dadosAntigos: {
          dataInicio: dataInicioAntiga,
          dataFim: dataFimAntiga,
        },
        dadosNovos: {
          dataInicio: vinculo.dataInicio,
          dataFim: vinculo.dataFim,
        },
      });

      vinculosAlterados.push(vinculo);

      // Emitir evento via socket
      const io = getIO();
      io.to(`company-${companyId}`)
        .to(`vinculo-${vinculo.id}`)
        .emit(`company-${companyId}-vinculo`, {
          action: "update",
          vinculo: vinculo,
        });
    } catch (error: any) {
      erros.push({
        controleClienteId: vinculoData.controleClienteId,
        erro: error.message || "Erro ao alterar datas",
      });
    }
  }

  return {
    vinculosAlterados: vinculosAlterados.length,
    erros,
  };
};

export default AlterarDatasEmLoteService;
