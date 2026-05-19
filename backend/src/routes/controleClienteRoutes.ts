import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as ControleClienteController from "../controllers/ControleClienteController";

const controleClienteRoutes = Router();

// Todas as rotas requerem autenticação
controleClienteRoutes.use(isAuth);

// Vincular clientes a um controle
controleClienteRoutes.post("/controle-clientes/vinculos", ControleClienteController.vincular);

// Listar vínculos com filtros
controleClienteRoutes.get("/controle-clientes/vinculos", ControleClienteController.listar);

// Buscar vínculo específico
controleClienteRoutes.get("/controle-clientes/vinculos/:controleClienteId", ControleClienteController.buscarPorId);

// Buscar histórico de alterações
controleClienteRoutes.get("/controle-clientes/vinculos/:controleClienteId/historico", ControleClienteController.buscarHistorico);

// Alterar datas de um vínculo
controleClienteRoutes.put("/controle-clientes/vinculos/:controleClienteId/datas", ControleClienteController.alterarDatas);

// Alterar responsável de um vínculo
controleClienteRoutes.put("/controle-clientes/vinculos/:controleClienteId/responsavel", ControleClienteController.alterarResponsavel);

// Desvincular cliente
controleClienteRoutes.delete("/controle-clientes/vinculos/:controleClienteId", ControleClienteController.desvincular);

// Gerar tarefas para um vínculo
controleClienteRoutes.post("/controle-clientes/vinculos/:controleClienteId/gerar-tarefas", ControleClienteController.gerarTarefas);

// Estatísticas gerais
controleClienteRoutes.get("/controle-clientes/estatisticas", ControleClienteController.estatisticas);

// Operações em lote
controleClienteRoutes.put("/controle-clientes/vinculos/lote/datas", ControleClienteController.alterarDatasEmLote);
controleClienteRoutes.post("/controle-clientes/vinculos/lote/desvincular", ControleClienteController.desvincularEmLote);

export default controleClienteRoutes;
