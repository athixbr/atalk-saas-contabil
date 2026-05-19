import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as ClienteController from "../controllers/ClienteController";
import * as ClienteCNAEController from "../controllers/ClienteCNAEController";
import * as ClienteContatoController from "../controllers/ClienteContatoController";
import * as ClienteRedeSocialController from "../controllers/ClienteRedeSocialController";
import * as DemaisIdentificadoresController from "../controllers/DemaisIdentificadoresController";
import * as ResponsavelDepartamentoController from "../controllers/ResponsavelDepartamentoController";
import * as AnotacaoEmpresaController from "../controllers/AnotacaoEmpresaController";

const clienteRoutes = Router();

clienteRoutes.get("/clientes", isAuth, ClienteController.index);
clienteRoutes.get("/clientes/:clienteId", isAuth, ClienteController.show);
clienteRoutes.post("/clientes", isAuth, ClienteController.store);
clienteRoutes.put("/clientes/:clienteId", isAuth, ClienteController.update);
clienteRoutes.patch("/clientes/:clienteId/certidoes", isAuth, ClienteController.updateCertidoes);
clienteRoutes.delete("/clientes/:clienteId", isAuth, ClienteController.remove);

// Rotas de CNAE
clienteRoutes.get("/clientes/:clienteId/cnaes", isAuth, ClienteCNAEController.index);
clienteRoutes.post("/clientes/:clienteId/cnaes", isAuth, ClienteCNAEController.store);
clienteRoutes.put("/clientes/:clienteId/cnaes/:cnaeId", isAuth, ClienteCNAEController.update);
clienteRoutes.delete("/clientes/:clienteId/cnaes/:cnaeId", isAuth, ClienteCNAEController.remove);

// Rotas de Contatos
clienteRoutes.get("/clientes/:clienteId/contatos", isAuth, ClienteContatoController.index);
clienteRoutes.post("/clientes/:clienteId/contatos", isAuth, ClienteContatoController.store);
clienteRoutes.put("/clientes/:clienteId/contatos/:contatoId", isAuth, ClienteContatoController.update);
clienteRoutes.delete("/clientes/:clienteId/contatos/:contatoId", isAuth, ClienteContatoController.remove);

// Rotas de Redes Sociais
clienteRoutes.get("/clientes/:clienteId/redes-sociais", isAuth, ClienteRedeSocialController.index);
clienteRoutes.post("/clientes/:clienteId/redes-sociais", isAuth, ClienteRedeSocialController.store);
clienteRoutes.put("/clientes/:clienteId/redes-sociais/:redeId", isAuth, ClienteRedeSocialController.update);
clienteRoutes.delete("/clientes/:clienteId/redes-sociais/:redeId", isAuth, ClienteRedeSocialController.remove);

// Rotas de Demais Identificadores
clienteRoutes.get("/clientes/:clienteId/demais-identificadores", isAuth, DemaisIdentificadoresController.index);
clienteRoutes.post("/clientes/:clienteId/demais-identificadores", isAuth, DemaisIdentificadoresController.store);
clienteRoutes.put("/clientes/:clienteId/demais-identificadores/:identificadorId", isAuth, DemaisIdentificadoresController.update);
clienteRoutes.delete("/clientes/:clienteId/demais-identificadores/:identificadorId", isAuth, DemaisIdentificadoresController.remove);

// Rotas de Responsáveis de Departamento
clienteRoutes.get("/clientes/:clienteId/responsaveis-departamento", isAuth, ResponsavelDepartamentoController.index);
clienteRoutes.post("/clientes/:clienteId/responsaveis-departamento", isAuth, ResponsavelDepartamentoController.store);
clienteRoutes.delete("/clientes/:clienteId/responsaveis-departamento/:responsavelId", isAuth, ResponsavelDepartamentoController.remove);

// Rotas de Anotações da Empresa
clienteRoutes.get("/clientes/:clienteId/anotacoes", isAuth, AnotacaoEmpresaController.index);
clienteRoutes.post("/clientes/:clienteId/anotacoes", isAuth, AnotacaoEmpresaController.store);

export default clienteRoutes;
