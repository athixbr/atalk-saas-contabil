import { Router } from "express";

import userRoutes from "./userRoutes";
import authRoutes from "./authRoutes";
import settingRoutes from "./settingRoutes";
import contactRoutes from "./contactRoutes";
import ticketRoutes from "./ticketRoutes";
import whatsappRoutes from "./whatsappRoutes";
import messageRoutes from "./messageRoutes";
import whatsappSessionRoutes from "./whatsappSessionRoutes";
import queueRoutes from "./queueRoutes";
import companyRoutes from "./companyRoutes";
import planRoutes from "./planRoutes";
import ticketNoteRoutes from "./ticketNoteRoutes";
import quickMessageRoutes from "./quickMessageRoutes";
import helpRoutes from "./helpRoutes";
import dashboardRoutes from "./dashboardRoutes";
import scheduleRoutes from "./scheduleRoutes";
import tagRoutes from "./tagRoutes";
import contactListRoutes from "./contactListRoutes";
import contactListItemRoutes from "./contactListItemRoutes";
import campaignRoutes from "./campaignRoutes";
import campaignSettingRoutes from "./campaignSettingRoutes";
import announcementRoutes from "./announcementRoutes";
import chatRoutes from "./chatRoutes";
import queueIntegrationRoutes from "./queueIntegrationRoutes";
import chatBotRoutes from "./chatBotRoutes";
import webHookRoutes from "./webHookRoutes";
import subScriptionRoutes from "./subScriptionRoutes";
import invoiceRoutes from "./invoicesRoutes";
import apiRoutes from "./apiRoutes";
import versionRouter from "./versionRoutes";
import filesRoutes from "./filesRoutes";
import queueOptionRoutes from "./queueOptionRoutes";
import ticketTagRoutes from "./ticketTagRoutes";
import apiCompanyRoutes from "./api/apiCompanyRoutes";
import apiContactRoutes from "./api/apiContactRoutes";
import companySettingsRoutes from "./companySettingsRoutes";
import passwordRoutes from "./passwordRoutes";
import promptRoutes from "./promptRouter";
import PlantaoRoutes from "./plantaoRoutes";
import ticketMetricsRoutes from "./ticketMetricsRoutes";
import tarefasGeradasRoutes from "./tarefasGeradasRoutes";
import tarefasRecorrentesRoutes from "./tarefasRecorrentesRoutes";
import tarefaConfigRoutes from "./tarefaConfigRoutes";
import controleClienteRoutes from "./controleClienteRoutes";
import controleConfigRoutes from "./controleConfigRoutes";
import clienteRoutes from "./clienteRoutes";
import socioRoutes from "./socioRoutes";
import departamentoRoutes from "./departamentoRoutes";
import parametrosRoutes from "./parametrosRoutes";
import modeloParametrosRoutes from "./modeloParametrosRoutes";
import taskRoutes from "./taskRoutes";
import checklistRoutes from "./checklistRoutes";
import tipoServicoRoutes from "./tipoServicoRoutes";
import grupoServicoRoutes from "./grupoServicoRoutes";
import certidaoRoutes from "./certidaoRoutes";
import gedRoutes from "./gedRoutes";
import knowledgeBaseArticleRoutes from "./knowledgeBaseArticleRoutes";
import knowledgeBaseCategoryRoutes from "./knowledgeBaseCategoryRoutes";
import crmLeadRoutes from "./crmLeadRoutes";
import crmTaskRoutes from "./crmTaskRoutes";
import crmClientRoutes from "./crmClientRoutes";
import crmInteractionRoutes from "./crmInteractionRoutes";
import crmStageRoutes from "./crmStageRoutes";
import crmSourceRoutes from "./crmSourceRoutes";
import crmTaskCategoryRoutes from "./crmTaskCategoryRoutes";
import crmTaskStageRoutes from "./crmTaskStageRoutes";
import crmBusinessTypeRoutes from "./crmBusinessTypeRoutes";
import crmTaxRegimeRoutes from "./crmTaxRegimeRoutes";
import perfilCargoRoutes from "./perfilCargoRoutes";
import billingRoutes from "./billingRoutes";
import campaignGrupoRoutes from "./campaignGrupoRoutes";
import clienteViewPreferenceRoutes from "./clienteViewPreferenceRoutes";
import userClientesPreferencesRoutes from "./userClientesPreferencesRoutes";
import whatsappGroupRoutes from "./whatsappGroupRoutes";
import wwebjsRoutes from "./wwebjsRoutes";
import documentReaderRoutes from "./documentReaderRoutes";

const routes = Router();

routes.use(userRoutes);
routes.use("/auth", authRoutes);
routes.use("/api/messages", apiRoutes);
routes.use(settingRoutes);
routes.use(contactRoutes);
routes.use(ticketRoutes);
routes.use(whatsappRoutes);
routes.use(messageRoutes);
routes.use(messageRoutes);
routes.use(whatsappSessionRoutes);
routes.use(queueRoutes);
routes.use(companyRoutes);
routes.use(planRoutes);
routes.use(ticketNoteRoutes);
routes.use(quickMessageRoutes);
routes.use(helpRoutes);
routes.use(dashboardRoutes);
routes.use(scheduleRoutes);
routes.use(tagRoutes);
routes.use(contactListRoutes);
routes.use(contactListItemRoutes);
routes.use(campaignRoutes);
routes.use(campaignSettingRoutes);
routes.use(announcementRoutes);
routes.use(chatRoutes);
routes.use(chatBotRoutes);
routes.use("/webhook", webHookRoutes);
routes.use(subScriptionRoutes);
routes.use(invoiceRoutes);
routes.use(versionRouter);
routes.use(filesRoutes);
routes.use(queueOptionRoutes);
routes.use(queueIntegrationRoutes);
routes.use(ticketTagRoutes);
routes.use(promptRoutes);
routes.use("/api", apiCompanyRoutes);
routes.use("/api", apiContactRoutes);
routes.use(passwordRoutes);
routes.use(PlantaoRoutes);
routes.use(companySettingsRoutes);
routes.use(ticketMetricsRoutes);

// Módulo de Tarefas e Controles
routes.use(tarefasGeradasRoutes);
routes.use(tarefasRecorrentesRoutes);
routes.use(tarefaConfigRoutes);
routes.use(controleClienteRoutes);
routes.use(controleConfigRoutes);
routes.use(taskRoutes);
routes.use(checklistRoutes);

// Módulo de Clientes e Departamentos
routes.use(clienteRoutes);
routes.use(socioRoutes);
routes.use(departamentoRoutes);
routes.use(parametrosRoutes);
routes.use(modeloParametrosRoutes);
routes.use(clienteViewPreferenceRoutes);
routes.use(userClientesPreferencesRoutes);

// Módulo de Serviços
routes.use(tipoServicoRoutes);
routes.use(grupoServicoRoutes);

// Módulo de Certidões e Documentos
routes.use(certidaoRoutes);
routes.use(gedRoutes);
routes.use(documentReaderRoutes);

// Base de Conhecimento
routes.use(knowledgeBaseArticleRoutes);
routes.use(knowledgeBaseCategoryRoutes);

// CRM
routes.use(crmLeadRoutes);
routes.use(crmTaskRoutes);
routes.use(crmClientRoutes);
routes.use(crmInteractionRoutes);
routes.use(crmStageRoutes);
routes.use(crmSourceRoutes);
routes.use(crmTaskCategoryRoutes);
routes.use(crmTaskStageRoutes);
routes.use(crmBusinessTypeRoutes);
routes.use(crmTaxRegimeRoutes);

// Outros módulos
routes.use(perfilCargoRoutes);
routes.use(billingRoutes);
routes.use(campaignGrupoRoutes);
routes.use(whatsappGroupRoutes);
routes.use(wwebjsRoutes);

export default routes;
