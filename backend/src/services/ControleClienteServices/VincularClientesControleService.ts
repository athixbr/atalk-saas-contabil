import ControleCliente from "../../models/ControleCliente";
import ControleConfig from "../../models/ControleConfig";
import TarefaConfig from "../../models/TarefaConfig";
import Cliente from "../../models/Cliente";
import ControleClienteHistorico from "../../models/ControleClienteHistorico";
import ControleNotificacao from "../../models/ControleNotificacao";
import Departamento from "../../models/Departamento";
import User from "../../models/User";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";
import GerarTarefasService from "./GerarTarefasControleService";

interface ClienteVinculo {
  clienteId: number;
  dataInicio: Date;
  dataFim: Date;
}

interface VincularData {
  controleConfigId?: number;
  tarefaConfigId?: number;
  clientes: ClienteVinculo[];
  departamentoId?: number;
  usuarioId?: number;
  usuariosIds?: number[];
  observacoes?: string;
  companyId: number;
  usuarioLogadoId: number;
  gerarTarefasImediatamente?: boolean;
}

interface VinculoResult {
  vinculos: ControleCliente[];
  tarefasGeradas: number;
  notificacoesEnviadas: number;
}

const VincularClientesControleService = async ({
  controleConfigId,
  tarefaConfigId,
  clientes,
  departamentoId,
  usuarioId,
  usuariosIds,
  observacoes,
  companyId,
  usuarioLogadoId,
  gerarTarefasImediatamente = true,
}: VincularData): Promise<VinculoResult> => {
  // Validações
  if (!controleConfigId && !tarefaConfigId) {
    throw new AppError("ID do controle ou tarefa é obrigatório", 400);
  }

  if (controleConfigId && tarefaConfigId) {
    throw new AppError("Não é possível vincular controle e tarefa ao mesmo tempo", 400);
  }

  if (!clientes || clientes.length === 0) {
    throw new AppError("Pelo menos um cliente deve ser informado", 400);
  }

  // Log para debug
  console.log("VincularClientesControleService - Dados recebidos:", {
    controleConfigId,
    tarefaConfigId,
    clientesCount: clientes?.length,
    departamentoId,
    usuarioId,
    usuariosIds,
    companyId
  });

  if (!departamentoId && !usuarioId && (!usuariosIds || usuariosIds.length === 0)) {
    throw new AppError(
      "Deve ser informado um departamento, um usuário ou lista de usuários para notificação",
      400
    );
  }

  // Se não tem usuarioId mas tem usuariosIds, usar o primeiro como responsável principal
  let responsavelId = usuarioId;
  if (!responsavelId && usuariosIds && usuariosIds.length > 0) {
    responsavelId = usuariosIds[0];
    console.log(`Usando primeiro usuário da lista como responsável: ${responsavelId}`);
  }

  // Verificar se o controle ou tarefa existe
  let configNome: string;
  let configCodigo: string | undefined;
  
  if (controleConfigId) {
    const controleConfig = await ControleConfig.findOne({
      where: { id: controleConfigId, companyId },
      include: [
        { model: Departamento, as: "departamento" },
      ],
    });

    if (!controleConfig) {
      throw new AppError("Controle não encontrado", 404);
    }
    
    configNome = controleConfig.nome;
    configCodigo = controleConfig.codigo;
  } else {
    const tarefaConfig = await TarefaConfig.findOne({
      where: { id: tarefaConfigId, companyId },
    });

    if (!tarefaConfig) {
      throw new AppError("Tarefa não encontrada", 404);
    }
    
    configNome = tarefaConfig.titulo;
    configCodigo = undefined; // TarefaConfig não tem código
  }

  const vinculosCriados: ControleCliente[] = [];
  let tarefasGeradas = 0;

  // Processar cada cliente
  for (const clienteData of clientes) {
    const { clienteId, dataInicio, dataFim } = clienteData;

    // Verificar se o cliente existe
    const cliente = await Cliente.findOne({
      where: { id: clienteId, companyId },
    });

    if (!cliente) {
      console.warn(`Cliente ${clienteId} não encontrado, pulando...`);
      continue;
    }

    // Verificar se já existe vínculo ativo
    const vinculoExistente = await ControleCliente.findOne({
      where: {
        ...(controleConfigId && { controleConfigId }),
        ...(tarefaConfigId && { tarefaConfigId }),
        clienteId,
        ativo: true,
      },
    });

    if (vinculoExistente) {
      console.warn(
        `Cliente ${cliente.nome} já possui vínculo ativo com este ${controleConfigId ? 'controle' : 'tarefa'}, pulando...`
      );
      continue;
    }

    // Criar vínculo
    const vinculo = await ControleCliente.create({
      ...(controleConfigId && { controleConfigId }),
      ...(tarefaConfigId && { tarefaConfigId }),
      clienteId,
      dataInicio,
      dataFim,
      departamentoId,
      usuarioId: responsavelId, // Usa o responsável definido (pode vir de usuarioId ou primeiro de usuariosIds)
      ativo: true,
      observacoes,
    });

    await vinculo.reload({
      include: [
        { model: ControleConfig, as: "controleConfig" },
        { model: Cliente, as: "cliente" },
        { model: Departamento, as: "departamento" },
        { model: User, as: "usuario" },
      ],
    });

    vinculosCriados.push(vinculo);

    // Registrar histórico
    await ControleClienteHistorico.create({
      controleClienteId: vinculo.id,
      acao: "vinculacao",
      dadosAnteriores: null,
      dadosNovos: {
        ...(controleConfigId && { controleConfigId }),
        ...(tarefaConfigId && { tarefaConfigId }),
        clienteId,
        dataInicio,
        dataFim,
        departamentoId,
        usuarioId,
        observacoes,
      },
      usuarioId: usuarioLogadoId,
      companyId,
      observacao: `${controleConfigId ? 'Controle' : 'Tarefa'} vinculado ao cliente ${cliente.nome}`,
    });

    // Criar notificação
    console.log("Criando notificação com usuariosIds:", usuariosIds);
    const notificacao = await ControleNotificacao.create({
      controleClienteId: vinculo.id,
      ...(controleConfigId && { controleConfigId }),
      clienteId,
      tipo: "vinculacao",
      titulo: `Novo ${controleConfigId ? 'Controle' : 'Tarefa'} Vinculado`,
      mensagem: `${controleConfigId ? 'O controle' : 'A tarefa'} "${configNome}" foi vinculado ao cliente "${cliente.nome}"`,
      departamentoId,
      usuarioId,
      usuariosIds: usuariosIds || [],
      lida: false,
      metadata: {
        dataInicio,
        dataFim,
        vinculoId: vinculo.id,
        link: `/controles-vinculos/${vinculo.id}`,
      },
      companyId,
    });
    console.log("Notificação criada com sucesso:", notificacao.id);

    // Emitir evento via Socket.IO
    const io = getIO();
    io.emit(`company-${companyId}-controle-vinculo`, {
      action: "create",
      vinculo,
      notificacao,
    });

    // Emitir notificação específica
    if (departamentoId) {
      io.emit(`company-${companyId}-department-${departamentoId}-notification`, {
        action: "new",
        notificacao,
      });
    }

    if (responsavelId) {
      io.emit(`company-${companyId}-user-${responsavelId}-notification`, {
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

    // Gerar tarefas automaticamente para controles (não tarefas)
    // As tarefas são direcionadas para o departamento e usuário especificados
    if (gerarTarefasImediatamente && controleConfigId) {
      try {
        const resultado = await GerarTarefasService({
          controleClienteId: vinculo.id,
          companyId,
        });
        tarefasGeradas += resultado.tarefasGeradas;
        console.log(`${resultado.tarefasGeradas} tarefa(s) gerada(s) para vínculo ${vinculo.id}`);
      } catch (error) {
        console.error(`Erro ao gerar tarefas para vínculo ${vinculo.id}:`, error);
      }
    }
  }

  return {
    vinculos: vinculosCriados,
    tarefasGeradas,
    notificacoesEnviadas: vinculosCriados.length,
  };
};

export default VincularClientesControleService;
