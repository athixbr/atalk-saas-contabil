import { Request, Response } from "express";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
import TarefaGerada from "../models/TarefaGerada";
import TarefaGeradaHistorico from "../models/TarefaGeradaHistorico";
import TarefaInfoGeral from "../models/TarefaInfoGeral";
import Cliente from "../models/Cliente";
import Departamento from "../models/Departamento";
import User from "../models/User";
import TarefaRecorrente from "../models/TarefaRecorrente";
import GenerateTarefasRecorrentesService from "../services/GenerateTarefasRecorrentesService";
import ControleClienteHistorico from "../models/ControleClienteHistorico";

// ==================== CENTRAL DE ATIVIDADES ====================

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const {
      status,
      clienteId,
      departamentoId,
      userId,
      dataInicio,
      dataFim,
      competencia
    } = req.query;

    const where: any = { companyId };

    if (status) where.status = status;
    if (clienteId) where.clienteId = clienteId;
    if (departamentoId) where.departamentoId = departamentoId;
    if (userId) where.userId = userId;
    if (competencia) where.competencia = competencia;

    if (dataInicio && dataFim) {
      where.dataEntrega = {
        [Op.between]: [dataInicio, dataFim]
      };
    }

    const tarefas = await TarefaGerada.findAll({
      where,
      include: [
        { model: TarefaInfoGeral, as: "tarefaInfo" },
        { model: Cliente, as: "cliente" },
        { model: Departamento, as: "departamento" },
        { model: User, as: "user", attributes: ["id", "name", "email"] },
      ],
      order: [["dataEntrega", "ASC"]]
    });

    return res.status(200).json(tarefas);
  } catch (error) {
    console.error("Erro ao listar tarefas geradas:", error);
    return res.status(500).json({ error: "Erro ao listar tarefas geradas" });
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const tarefaId = Number(id);
    if (!id || isNaN(tarefaId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const tarefa = await TarefaGerada.findOne({
      where: { id: tarefaId, companyId },
      include: [
        { model: TarefaInfoGeral, as: "tarefaInfo" },
        { model: Cliente, as: "cliente" },
        { model: Departamento, as: "departamento" },
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        {
          model: TarefaGeradaHistorico,
          as: "historico",
          include: [{ model: User, as: "user", attributes: ["id", "name"] }],
          order: [["createdAt", "DESC"]]
        }
      ]
    });

    if (!tarefa) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    return res.status(200).json(tarefa);
  } catch (error) {
    console.error("Erro ao buscar tarefa:", error);
    return res.status(500).json({ error: "Erro ao buscar tarefa" });
  }
};

export const updateStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { companyId, id: userId } = req.user;
    const { status, observacoes, dataConclusao } = req.body;

    const tarefaId = Number(id);
    if (!id || isNaN(tarefaId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const tarefa = await TarefaGerada.findOne({
      where: { id: tarefaId, companyId },
      include: [{ association: "controleCliente" }]
    });

    if (!tarefa) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    const oldStatus = tarefa.status;
    const oldDataConclusao = tarefa.dataConclusao;

    // Preparar dados de atualização
    const updateData: any = {
      status,
      observacoes,
      dataInicio: status === "em_andamento" && !tarefa.dataInicio ? new Date() : tarefa.dataInicio,
    };

    // Se marcar como concluída, usar data fornecida ou data atual
    if (status === "concluida") {
      updateData.dataConclusao = dataConclusao ? new Date(dataConclusao) : new Date();
    } else if (status !== "concluida" && oldStatus === "concluida") {
      // Se voltar de concluída para outro status, limpar data de conclusão
      updateData.dataConclusao = null;
    }

    // Atualizar status
    await tarefa.update(updateData);

    // Registrar no histórico da tarefa
    const dataFormatada = updateData.dataConclusao 
      ? new Date(updateData.dataConclusao).toLocaleString("pt-BR") 
      : '';
    
    await TarefaGeradaHistorico.create({
      companyId,
      tarefaGeradaId: tarefaId,
      userId,
      acao: `status_alterado_de_${oldStatus}_para_${status}`,
      observacao: observacoes || `Status alterado de "${oldStatus}" para "${status}"${
        status === "concluida" ? ` em ${dataFormatada}` : ""
      }`
    });

    // Se for de controle, registrar também no histórico do controle
    if (tarefa.controleClienteId) {
      
      await ControleClienteHistorico.create({
        controleClienteId: tarefa.controleClienteId,
        companyId,
        usuarioId: userId,
        acao: "alteracao_responsavel",
        dadosAnteriores: {
          tarefaGeradaId: tarefa.id,
          status: oldStatus,
          dataConclusao: oldDataConclusao,
        },
        dadosNovos: {
          tarefaGeradaId: tarefa.id,
          status: status,
          dataConclusao: updateData.dataConclusao,
        },
        observacao: observacoes || `Tarefa "${tarefa.titulo}": Status alterado de "${oldStatus}" para "${status}"${
          status === "concluida" ? ` em ${dataFormatada}` : ""
        }`,
      });
    }

    // Recarregar tarefa com associações
    await tarefa.reload({
      include: [
        { association: "controleCliente" },
        { association: "cliente" },
        { association: "user" },
        { association: "departamento" },
      ],
    });

    return res.status(200).json(tarefa);
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return res.status(500).json({ error: "Erro ao atualizar status" });
  }
};

export const reatribuir = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { companyId, id: userId } = req.user;
    const { departamentoId, novoUserId, observacao } = req.body;

    const tarefa = await TarefaGerada.findOne({
      where: { id, companyId }
    });

    if (!tarefa) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    const departamentoAnterior = tarefa.departamentoId;
    const usuarioAnterior = tarefa.userId;

    // Atualizar atribuição
    await tarefa.update({
      departamentoId,
      userId: novoUserId
    });

    // Registrar no histórico
    await TarefaGeradaHistorico.create({
      companyId,
      tarefaGeradaId: id,
      userId,
      acao: "reatribuida",
      departamentoAnterior,
      departamentoNovo: departamentoId,
      usuarioAnterior,
      usuarioNovo: novoUserId,
      observacao
    });

    // Buscar tarefa atualizada
    const tarefaAtualizada = await TarefaGerada.findByPk(id, {
      include: [
        { model: Departamento, as: "departamento" },
        { model: User, as: "user", attributes: ["id", "name", "email"] },
      ]
    });

    return res.status(200).json(tarefaAtualizada);
  } catch (error) {
    console.error("Erro ao reatribuir tarefa:", error);
    return res.status(500).json({ error: "Erro ao reatribuir tarefa" });
  }
};

export const updateChecklist = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { companyId, id: userId } = req.user;
    const { checklistCompleto } = req.body;

    const tarefa = await TarefaGerada.findOne({
      where: { id, companyId }
    });

    if (!tarefa) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    await tarefa.update({ checklistCompleto });

    // Registrar no histórico
    await TarefaGeradaHistorico.create({
      companyId,
      tarefaGeradaId: id,
      userId,
      acao: "checklist_atualizado"
    });

    return res.status(200).json(tarefa);
  } catch (error) {
    console.error("Erro ao atualizar checklist:", error);
    return res.status(500).json({ error: "Erro ao atualizar checklist" });
  }
};

export const getHistorico = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const tarefaId = Number(id);
    if (!id || isNaN(tarefaId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    // Buscar a tarefa para pegar o controleClienteId
    const tarefa = await TarefaGerada.findOne({
      where: { id: tarefaId, companyId },
      attributes: ["id", "controleClienteId"]
    });

    if (!tarefa) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    // Buscar histórico da tarefa gerada
    const historicoTarefa = await TarefaGeradaHistorico.findAll({
      where: {
        tarefaGeradaId: tarefaId,
        companyId
      },
      include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
      order: [["createdAt", "DESC"]]
    });

    // Se for de controle, buscar também histórico do controle
    let historicoControle: any[] = [];
    if (tarefa.controleClienteId) {
      
      historicoControle = await ControleClienteHistorico.findAll({
        where: {
          controleClienteId: tarefa.controleClienteId,
          companyId,
        },
        include: [
          {
            model: User,
            as: "usuario",
            attributes: ["id", "name", "email"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    }

    // Mesclar e ordenar por data
    const historico = [
      ...historicoTarefa.map((h) => ({
        ...h.toJSON(),
        tipo: "tarefa",
        usuario: h.user
      })),
      ...historicoControle.map((h) => ({
        ...h.toJSON(),
        tipo: "controle"
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.status(200).json({ historico });
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    return res.status(500).json({ error: "Erro ao buscar histórico" });
  }
};

// Estatísticas para dashboard
export const getStatistics = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const { dataInicio, dataFim } = req.query;

    const where: any = { companyId };

    if (dataInicio && dataFim) {
      where.dataEntrega = {
        [Op.between]: [dataInicio, dataFim]
      };
    }

    const total = await TarefaGerada.count({ where });
    const pendentes = await TarefaGerada.count({ where: { ...where, status: "pendente" } });
    const emAndamento = await TarefaGerada.count({ where: { ...where, status: "em_andamento" } });
    const concluidas = await TarefaGerada.count({ where: { ...where, status: "concluida" } });
    const canceladas = await TarefaGerada.count({ where: { ...where, status: "cancelada" } });

    return res.status(200).json({
      total,
      pendentes,
      emAndamento,
      concluidas,
      canceladas
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
};

// ==================== GERAÇÃO EM LOTE ====================

export const gerarLote = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const { tarefaRecorrenteId, ano, meses, clienteIds } = req.body;

    if (!tarefaRecorrenteId) {
      return res.status(400).json({ error: "ID da tarefa recorrente é obrigatório" });
    }

    if (!ano) {
      return res.status(400).json({ error: "Ano é obrigatório" });
    }

    const service = new GenerateTarefasRecorrentesService();
    const resultado = await service.execute({
      companyId,
      tarefaRecorrenteId,
      ano,
      meses,
      clienteIds
    });

    return res.status(200).json({
      message: "Lote gerado com sucesso",
      ...resultado
    });
  } catch (error) {
    console.error("Erro ao gerar lote:", error);
    return res.status(500).json({ error: "Erro ao gerar lote de tarefas" });
  }
};

export const excluirAvulsa = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { companyId, id: userId } = req.user;

    const tarefaId = Number(id);
    if (!id || isNaN(tarefaId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const tarefa = await TarefaGerada.findOne({
      where: { id: tarefaId, companyId }
    });

    if (!tarefa) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    // Registrar no histórico antes de excluir
    await TarefaGeradaHistorico.create({
      companyId,
      tarefaGeradaId: tarefaId,
      userId,
      acao: "excluida",
      observacao: "Tarefa excluída manualmente pelo usuário"
    });

    await tarefa.destroy();

    return res.status(200).json({ message: "Tarefa excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir tarefa:", error);
    return res.status(500).json({ error: "Erro ao excluir tarefa" });
  }
};

export const excluirLote = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId, id: userId } = req.user;
    const { tarefaRecorrenteId, ano, meses, clienteIds, status } = req.body;

    if (!tarefaRecorrenteId) {
      return res.status(400).json({ error: "ID da tarefa recorrente é obrigatório" });
    }

    const where: any = {
      companyId,
      tarefaRecorrenteId
    };

    // Filtros opcionais
    if (ano) {
      where.competencia = {
        [Op.like]: `%/${ano}`
      };
    }

    if (meses && meses.length > 0) {
      const competencias = meses.map((m: number) => `${String(m).padStart(2, '0')}/${ano || new Date().getFullYear()}`);
      where.competencia = {
        [Op.in]: competencias
      };
    }

    if (clienteIds && clienteIds.length > 0) {
      where.clienteId = {
        [Op.in]: clienteIds
      };
    }

    if (status) {
      where.status = status;
    }

    // Buscar tarefas a serem excluídas
    const tarefas = await TarefaGerada.findAll({ where });

    // Registrar no histórico
    for (const tarefa of tarefas) {
      await TarefaGeradaHistorico.create({
        companyId,
        tarefaGeradaId: tarefa.id,
        userId,
        acao: "excluida_em_lote",
        observacao: "Tarefa excluída em lote pelo usuário"
      });
    }

    // Excluir tarefas
    const quantidade = await TarefaGerada.destroy({ where });

    return res.status(200).json({
      message: "Lote excluído com sucesso",
      tarefasExcluidas: quantidade
    });
  } catch (error) {
    console.error("Erro ao excluir lote:", error);
    return res.status(500).json({ error: "Erro ao excluir lote de tarefas" });
  }
};

export const pausarLote = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId, id: userId } = req.user;
    const { tarefaRecorrenteId, ano, meses, clienteIds, status, novoStatus } = req.body;

    if (!tarefaRecorrenteId) {
      return res.status(400).json({ error: "ID da tarefa recorrente é obrigatório" });
    }

    if (novoStatus !== "pausada" && novoStatus !== "pendente") {
      return res.status(400).json({ error: "novoStatus deve ser 'pausada' ou 'pendente'" });
    }

    const where: any = {
      companyId,
      tarefaRecorrenteId
    };

    // Filtros opcionais (mesmo padrão de excluirLote)
    if (ano) {
      where.competencia = {
        [Op.like]: `%/${ano}`
      };
    }

    if (meses && meses.length > 0) {
      const competencias = meses.map((m: number) => `${String(m).padStart(2, '0')}/${ano || new Date().getFullYear()}`);
      where.competencia = {
        [Op.in]: competencias
      };
    }

    if (clienteIds && clienteIds.length > 0) {
      where.clienteId = {
        [Op.in]: clienteIds
      };
    }

    if (status) {
      where.status = status;
    }

    // Buscar tarefas a serem alteradas
    const tarefas = await TarefaGerada.findAll({ where });

    // Registrar no histórico
    for (const tarefa of tarefas) {
      await TarefaGeradaHistorico.create({
        companyId,
        tarefaGeradaId: tarefa.id,
        userId,
        acao: novoStatus === "pausada" ? "pausada_em_lote" : "despausada_em_lote",
        observacao: novoStatus === "pausada"
          ? "Tarefa pausada em lote pelo usuário"
          : "Tarefa despausada em lote pelo usuário"
      });
    }

    // Atualizar status
    const [quantidade] = await TarefaGerada.update({ status: novoStatus }, { where });

    return res.status(200).json({
      message: novoStatus === "pausada" ? "Lote pausado com sucesso" : "Lote despausado com sucesso",
      tarefasAlteradas: quantidade
    });
  } catch (error) {
    console.error("Erro ao pausar lote:", error);
    return res.status(500).json({ error: "Erro ao pausar lote de tarefas" });
  }
};

// Listar tarefas recorrentes com informações de tarefas geradas
export const listarRecorrentesComGeradas = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log("[listarRecorrentesComGeradas] Requisição recebida");
    console.log("[listarRecorrentesComGeradas] req.user:", req.user);
    console.log("[listarRecorrentesComGeradas] req.query:", req.query);
    
    const { companyId } = req.user;
    const { ano } = req.query;

    // Usar ano atual se não fornecido
    const anoFiltro = ano ? Number(ano) : new Date().getFullYear();
    
    console.log("[listarRecorrentesComGeradas] anoFiltro:", anoFiltro);

    const tarefasRecorrentes = await TarefaRecorrente.findAll({
      where: { companyId, ativa: true },
      include: [
        { model: Departamento, as: "departamento", attributes: ["id", "nome"], required: false },
        { model: Cliente, as: "clientes", through: { attributes: [] }, attributes: ["id", "nome"], required: false }
      ]
    });

    // Para cada tarefa recorrente, buscar estatísticas das geradas
    const resultado = await Promise.all(
      tarefasRecorrentes.map(async (tr) => {
        const totalGeradas = await TarefaGerada.count({
          where: {
            companyId,
            tarefaRecorrenteId: tr.id,
            competencia: { [Op.like]: `%/${anoFiltro}` }
          }
        });

        const pendentes = await TarefaGerada.count({
          where: {
            companyId,
            tarefaRecorrenteId: tr.id,
            competencia: { [Op.like]: `%/${anoFiltro}` },
            status: "pendente"
          }
        });

        const concluidas = await TarefaGerada.count({
          where: {
            companyId,
            tarefaRecorrenteId: tr.id,
            competencia: { [Op.like]: `%/${anoFiltro}` },
            status: "concluida"
          }
        });

        const trJson = tr.toJSON();
        
        return {
          ...trJson,
          estatisticas: {
            ano: anoFiltro,
            totalGeradas,
            pendentes,
            concluidas,
            clientesVinculados: tr.clientes?.length || 0
          }
        };
      })
    );

    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro ao listar recorrentes com geradas:", error);
    return res.status(500).json({ error: "Erro ao listar tarefas recorrentes" });
  }
};

