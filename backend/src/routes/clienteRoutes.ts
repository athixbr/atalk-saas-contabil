import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as ClienteController from "../controllers/ClienteController";
import * as ClienteCNAEController from "../controllers/ClienteCNAEController";
import * as ClienteContatoController from "../controllers/ClienteContatoController";
import * as ContatoDepartamentoController from "../controllers/ContatoDepartamentoController";
import * as ContatoAppAcessoController from "../controllers/ContatoAppAcessoController";
import * as ClienteRedeSocialController from "../controllers/ClienteRedeSocialController";
import * as DemaisIdentificadoresController from "../controllers/DemaisIdentificadoresController";
import * as ResponsavelDepartamentoController from "../controllers/ResponsavelDepartamentoController";
import * as AnotacaoEmpresaController from "../controllers/AnotacaoEmpresaController";
import * as ClienteVigenciaController from "../controllers/ClienteVigenciaController";
import * as EndpointsController from "../controllers/EndpointsController";

const clienteRoutes = Router();

clienteRoutes.get("/clientes", isAuth, ClienteController.index);
clienteRoutes.get("/clientes/proximo-codigo-sistema", isAuth, ClienteController.nextCodigoSistema);
clienteRoutes.get("/clientes/:clienteId", isAuth, ClienteController.show);
clienteRoutes.post("/clientes", isAuth, ClienteController.store);
clienteRoutes.put("/clientes/:clienteId", isAuth, ClienteController.update);
clienteRoutes.patch("/clientes/:clienteId/certidoes", isAuth, ClienteController.updateCertidoes);
clienteRoutes.delete("/clientes/:clienteId", isAuth, ClienteController.remove);

// Rotas de CNAE
clienteRoutes.get("/clientes/:clienteId/cnaes", isAuth, ClienteCNAEController.index);
clienteRoutes.post("/clientes/:clienteId/cnaes", isAuth, ClienteCNAEController.store);
clienteRoutes.post("/clientes/:clienteId/cnaes/bulk", isAuth, ClienteCNAEController.bulkStore);
clienteRoutes.put("/clientes/:clienteId/cnaes/:cnaeId", isAuth, ClienteCNAEController.update);
clienteRoutes.delete("/clientes/:clienteId/cnaes/:cnaeId", isAuth, ClienteCNAEController.remove);

// Rotas de Contatos
clienteRoutes.get("/clientes/:clienteId/contatos", isAuth, ClienteContatoController.index);
clienteRoutes.post("/clientes/:clienteId/contatos", isAuth, ClienteContatoController.store);
clienteRoutes.put("/clientes/:clienteId/contatos/:contatoId", isAuth, ClienteContatoController.update);
clienteRoutes.delete("/clientes/:clienteId/contatos/:contatoId", isAuth, ClienteContatoController.remove);

// Rotas de Departamentos do Contato
clienteRoutes.get("/clientes/:clienteId/contatos/:contatoId/departamentos", isAuth, ContatoDepartamentoController.index);
clienteRoutes.put("/clientes/:clienteId/contatos/:contatoId/departamentos", isAuth, ContatoDepartamentoController.update);

// Rotas de Acesso ao App do Contato
clienteRoutes.get("/clientes/:clienteId/contatos/:contatoId/app-acesso", isAuth, ContatoAppAcessoController.index);
clienteRoutes.put("/clientes/:clienteId/contatos/:contatoId/app-acesso", isAuth, ContatoAppAcessoController.update);

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

// Rotas de Vigências
clienteRoutes.get("/clientes/:clienteId/vigencias", isAuth, ClienteVigenciaController.index);
clienteRoutes.post("/clientes/:clienteId/vigencias", isAuth, ClienteVigenciaController.store);
clienteRoutes.put("/clientes/:clienteId/vigencias/:vigenciaId", isAuth, ClienteVigenciaController.update);
clienteRoutes.delete("/clientes/:clienteId/vigencias/:vigenciaId", isAuth, ClienteVigenciaController.remove);

// Rotas de Endpoints de Parâmetros do Cliente (vinculados por vigência)
clienteRoutes.get("/clientes/:clienteId/vigencias/:vigenciaId/parametros-endpoints", isAuth, EndpointsController.indexCliente);
clienteRoutes.put("/clientes/:clienteId/vigencias/:vigenciaId/parametros-endpoints", isAuth, EndpointsController.salvarCliente);

export default clienteRoutes;
