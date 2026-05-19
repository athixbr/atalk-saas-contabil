import fs from "fs";
import path from "path";
import { QueryTypes } from "sequelize";
import AppError from "../../errors/AppError";
import sequelize from "../../database";
import Company from "../../models/Company";
import Whatsapp from "../../models/Whatsapp";
import { removeWbot } from "../../libs/wbot";
import { logger } from "../../utils/logger";

const DeleteCompanyService = async (id: string): Promise<void> => {
  const company = await Company.findOne({ where: { id } });

  if (!company) {
    throw new AppError("ERR_NO_COMPANY_FOUND", 404);
  }

  const companyId = parseInt(id, 10);

  // Step 1: Disconnect all WhatsApp sessions gracefully
  const whatsapps = await Whatsapp.findAll({ where: { companyId } });
  for (const whatsapp of whatsapps) {
    try {
      await removeWbot(whatsapp.id, false);
    } catch (err) {
      logger.warn(`Failed to remove wbot session for whatsapp ${whatsapp.id}: ${err}`);
    }
  }

  // Step 2: Delete all company data in proper order within a transaction.
  // Tables are deleted children-first to avoid FK violations.
  const transaction = await sequelize.transaction();

  try {
    const del = async (table: string) => {
      await sequelize.query(
        `DELETE FROM "${table}" WHERE "companyId" = :companyId`,
        { replacements: { companyId }, type: QueryTypes.DELETE, transaction }
      );
    };

    // ── GED ──────────────────────────────────────────────────────────────────
    await del("GedActivityLogs");
    await del("GedComments");
    await del("GedFileVersions");
    await del("GedShares");
    await del("GedFiles");
    await del("GedFolders");

    // ── Knowledge Base ────────────────────────────────────────────────────────
    // Child tables reference KnowledgeBaseArticles (no companyId), delete via subquery
    const delByArticle = async (table: string) => {
      await sequelize.query(
        `DELETE FROM "${table}" WHERE "articleId" IN (SELECT id FROM "KnowledgeBaseArticles" WHERE "companyId" = :companyId)`,
        { replacements: { companyId }, type: QueryTypes.DELETE, transaction }
      );
    };
    await delByArticle("KnowledgeBaseRatings");
    await delByArticle("KnowledgeBaseComments");
    await delByArticle("KnowledgeBaseAttachments");
    await delByArticle("KnowledgeBaseArticleTags");
    await delByArticle("KnowledgeBaseVideos");
    await del("KnowledgeBaseArticles");
    // KnowledgeBaseCategories and KnowledgeBaseTags are global tables (no companyId), not deleted per-company

    // ── CRM ───────────────────────────────────────────────────────────────────
    await del("CrmTasks");
    await del("CrmInteractions");
    await del("CrmLeads");
    await del("CrmStages");
    await del("CrmTaskCategories");
    await del("CrmTaskStages");
    await del("CrmSources");
    await del("CrmBusinessTypes");
    await del("CrmTaxRegimes");
    await del("CrmClients");

    // ── Campaigns ─────────────────────────────────────────────────────────────
    // CampaignShipping has FK → Campaigns (no companyId), delete via subquery
    await sequelize.query(
      `DELETE FROM "CampaignShipping" WHERE "campaignId" IN (SELECT id FROM "Campaigns" WHERE "companyId" = :companyId)`,
      { replacements: { companyId }, type: QueryTypes.DELETE, transaction }
    );
    await del("Campaigns");
    await del("CampaignSettings");
    // CampaignGruposGroups has FK → CampaignGrupos (no companyId), delete via subquery
    await sequelize.query(
      `DELETE FROM "CampaignGruposGroups" WHERE "campaignGrupoId" IN (SELECT id FROM "CampaignGrupos" WHERE "companyId" = :companyId)`,
      { replacements: { companyId }, type: QueryTypes.DELETE, transaction }
    );
    await del("CampaignGruposConfig");
    await del("CampaignGrupos");

    // ── Contact lists ─────────────────────────────────────────────────────────
    await del("ContactListItems");
    await del("ContactLists");

    // ── Tickets extras ────────────────────────────────────────────────────────
    await del("TicketMetrics");
    await del("TicketUserMetrics");
    await del("TicketInteractions");

    // ── Tags (pivot tables cascade from Tags) ─────────────────────────────────
    await del("Tags");

    // ── Misc company tables ───────────────────────────────────────────────────
    await del("Announcements");
    await del("QuickMessages");
    await del("Schedules");
    // FilesOptions has FK → Files (no companyId), delete via subquery
    await sequelize.query(
      `DELETE FROM "FilesOptions" WHERE "fileId" IN (SELECT id FROM "Files" WHERE "companyId" = :companyId)`,
      { replacements: { companyId }, type: QueryTypes.DELETE, transaction }
    );
    await del("Files");
    await del("Prompts");
    await del("Integrations");
    await del("QueueIntegrations");
    await del("Plantao");
    // Helps is a global table (no companyId), not deleted per-company
    await del("ApiUsages");
    await del("Invoices");
    // BillingAttachments has FK → Billings (no companyId), delete via subquery
    await sequelize.query(
      `DELETE FROM "BillingAttachments" WHERE "billingId" IN (SELECT id FROM "Billings" WHERE "companyId" = :companyId)`,
      { replacements: { companyId }, type: QueryTypes.DELETE, transaction }
    );
    await del("Billings");
    await del("BillingHistory");
    await del("Subscriptions");

    // ── Chat ─────────────────────────────────────────────────────────────────
    // ChatMessages and ChatUsers have FK → Chats (no companyId), delete via subquery
    await sequelize.query(
      `DELETE FROM "ChatMessages" WHERE "chatId" IN (SELECT id FROM "Chats" WHERE "companyId" = :companyId)`,
      { replacements: { companyId }, type: QueryTypes.DELETE, transaction }
    );
    await sequelize.query(
      `DELETE FROM "ChatUsers" WHERE "chatId" IN (SELECT id FROM "Chats" WHERE "companyId" = :companyId)`,
      { replacements: { companyId }, type: QueryTypes.DELETE, transaction }
    );
    await del("Chats");

    // ── Tasks ─────────────────────────────────────────────────────────────────
    await del("TaskFiles");
    await del("TaskHistory");
    await del("Tasks");

    // ── Controles ─────────────────────────────────────────────────────────────
    await del("ControleNotificacoes");
    await del("ControleClienteHistorico");
    // ControleClientes has FK → ControlesConfig (no companyId), delete via subquery
    await sequelize.query(
      `DELETE FROM "ControleClientes" WHERE "controleConfigId" IN (SELECT id FROM "ControlesConfig" WHERE "companyId" = :companyId)`,
      { replacements: { companyId }, type: QueryTypes.DELETE, transaction }
    );
    await del("ControlesConfig");
    await del("Controles");

    // ── Tarefas ───────────────────────────────────────────────────────────────
    await del("TarefasGeradasHistorico");
    await del("TarefasGeradas");
    // TarefasRecorrentes* have FK → TarefasRecorrentes (no companyId), delete via subquery
    await sequelize.query(
      `DELETE FROM "TarefasRecorrentesUsuarios" WHERE "tarefaRecorrenteId" IN (SELECT id FROM "TarefasRecorrentes" WHERE "companyId" = :companyId)`,
      { replacements: { companyId }, type: QueryTypes.DELETE, transaction }
    );
    await sequelize.query(
      `DELETE FROM "TarefasRecorrentesClientes" WHERE "tarefaRecorrenteId" IN (SELECT id FROM "TarefasRecorrentes" WHERE "companyId" = :companyId)`,
      { replacements: { companyId }, type: QueryTypes.DELETE, transaction }
    );
    await sequelize.query(
      `DELETE FROM "TarefasRecorrentesSocios" WHERE "tarefaRecorrenteId" IN (SELECT id FROM "TarefasRecorrentes" WHERE "companyId" = :companyId)`,
      { replacements: { companyId }, type: QueryTypes.DELETE, transaction }
    );
    await del("TarefasRecorrentes");
    // TarefasConfigChecklist has FK → TarefasConfig (no companyId), delete via subquery
    await sequelize.query(
      `DELETE FROM "TarefasConfigChecklist" WHERE "tarefaConfigId" IN (SELECT id FROM "TarefasConfig" WHERE "companyId" = :companyId)`,
      { replacements: { companyId }, type: QueryTypes.DELETE, transaction }
    );
    await del("TarefasConfig");
    await del("TarefasNotificacoes");
    await del("TarefasFinanceiro");
    await del("TarefasDocumentos");
    await del("TarefasPrazosConfigs");
    await del("TarefasInfoGerais");
    await del("TarefasEntregasMensais");
    await del("TarefasChecklists");

    // ── Clientes ──────────────────────────────────────────────────────────────
    // ClientesCertidoes table does not exist in DB, skipped
    await del("LogsCertidoes");
    // ClienteContatos, ClienteCNAEs, ClienteRedesSociais, ClienteSocio have FK → Clientes (no companyId)
    await sequelize.query(
      `DELETE FROM "ClienteContatos" WHERE "clienteId" IN (SELECT id FROM "Clientes" WHERE "companyId" = :companyId)`,
      { replacements: { companyId }, type: QueryTypes.DELETE, transaction }
    );
    await sequelize.query(
      `DELETE FROM "ClienteCNAEs" WHERE "clienteId" IN (SELECT id FROM "Clientes" WHERE "companyId" = :companyId)`,
      { replacements: { companyId }, type: QueryTypes.DELETE, transaction }
    );
    await sequelize.query(
      `DELETE FROM "ClienteRedesSociais" WHERE "clienteId" IN (SELECT id FROM "Clientes" WHERE "companyId" = :companyId)`,
      { replacements: { companyId }, type: QueryTypes.DELETE, transaction }
    );
    await sequelize.query(
      `DELETE FROM "ClienteSocio" WHERE "clienteId" IN (SELECT id FROM "Clientes" WHERE "companyId" = :companyId)`,
      { replacements: { companyId }, type: QueryTypes.DELETE, transaction }
    );
    await del("ClientesViewPreferences");
    await del("AnotacoesEmpresa");
    await del("AgendamentosCertidoes");
    await del("CertificadosDigitais");
    await del("Certidoes");
    await del("AdiantamentoFolha");
    await del("DistribuicaoLucros");
    await del("EnvioCorrespondencia");
    await del("Holerites");
    await del("ParcelamentosParcelas");
    await del("Parcelamentos");
    await del("ServicosExtraordinarios");
    await del("TemplatesLeitura");
    await del("DemaisIdentificadores");
    await del("VolumeBPO");
    await del("VolumeContabil");
    await del("VolumeDP");
    await del("VolumeFiscal");
    await del("ModalFechBPO");
    await del("ModalidadeFechamentoContabil");
    await del("ModalidadeFechamentoDP");
    await del("ModalidadeFechamentoFiscal");
    await del("Clientes");

    // ── Parametros / lookup tables ────────────────────────────────────────────
    // UserClientesSavedFilters and UserClientesPreferences use 'empresaId' instead of 'companyId'
    await sequelize.query(
      `DELETE FROM "UserClientesSavedFilters" WHERE "empresaId" = :companyId`,
      { replacements: { companyId }, type: QueryTypes.DELETE, transaction }
    );
    await sequelize.query(
      `DELETE FROM "UserClientesPreferences" WHERE "empresaId" = :companyId`,
      { replacements: { companyId }, type: QueryTypes.DELETE, transaction }
    );
    await del("StatusComplementar");
    await del("StatusCliente");
    await del("StatusControle");
    await del("Status");
    await del("Segmento");
    await del("SedeCliente");
    await del("RegimeTributarioFederal");
    await del("RegimeTributarioEstadual");
    await del("RegimeTributarioMunicipal");
    await del("PorteFederal");
    await del("PorteEstadual");
    await del("PorteMunicipal");
    await del("LocalizacaoCliente");
    await del("CategoriaCliente");
    await del("GrupoCliente");
    await del("GrupoServico");
    await del("TipoCliente");
    await del("TipoDocumento");
    await del("TipoServico");
    await del("TierCliente");
    await del("ClusterCliente");
    await del("CargoSocio");
    await del("PerfilCargo");
    await del("PeriodicidadeCliente");
    await del("TagServico");
    await del("TagsParametros");
    await del("Prazos");
    await del("Prioridades");
    await del("Socios");
    await del("ResponsaveisDepartamento");
    // DepartamentoUsuarios has FK → Departamentos (no companyId), delete via subquery
    await sequelize.query(
      `DELETE FROM "DepartamentoUsuarios" WHERE "departamentoId" IN (SELECT id FROM "Departamentos" WHERE "companyId" = :companyId)`,
      { replacements: { companyId }, type: QueryTypes.DELETE, transaction }
    );
    await del("Departamentos");
    await del("EscritorioGestor");
    // ChecklistItens has FK → Checklists (no companyId), delete via subquery
    await sequelize.query(
      `DELETE FROM "ChecklistItens" WHERE "checklistId" IN (SELECT id FROM "Checklists" WHERE "companyId" = :companyId)`,
      { replacements: { companyId }, type: QueryTypes.DELETE, transaction }
    );
    await del("Checklists");
    // Chatbots: self-referencing tree via chatbotId, linked to company via queueId → Queues
    // First null out self-references to allow deletion, then delete DialogChatBots, then Chatbots
    await sequelize.query(
      `UPDATE "Chatbots" SET "chatbotId" = NULL WHERE "queueId" IN (SELECT id FROM "Queues" WHERE "companyId" = :companyId)`,
      { replacements: { companyId }, type: QueryTypes.UPDATE, transaction }
    );
    await sequelize.query(
      `DELETE FROM "DialogChatBots" WHERE "chatbotId" IN (SELECT id FROM "Chatbots" WHERE "queueId" IN (SELECT id FROM "Queues" WHERE "companyId" = :companyId))`,
      { replacements: { companyId }, type: QueryTypes.DELETE, transaction }
    );
    await sequelize.query(
      `DELETE FROM "Chatbots" WHERE "queueId" IN (SELECT id FROM "Queues" WHERE "companyId" = :companyId)`,
      { replacements: { companyId }, type: QueryTypes.DELETE, transaction }
    );
    await del("WhatsappGroups");
    await del("WhatsappStories");

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }

  // Step 3: Delete the company record.
  // Sequelize cascade (hooks: true) handles: Users, UserRatings, Queues,
  // Whatsapps, Messages, Contacts, Settings, CompaniesSettings, Tickets,
  // TicketTraking, LogTickets, Schedules, etc.
  await company.destroy();

  // Step 4: Remove the company's file storage folder
  const publicFolder = path.resolve(__dirname, "..", "..", "..", "..", "public");
  const companyFolder = path.resolve(publicFolder, `company${companyId}`);
  if (fs.existsSync(companyFolder)) {
    try {
      fs.rmSync(companyFolder, { recursive: true, force: true });
      logger.info(`Deleted company folder: ${companyFolder}`);
    } catch (err) {
      logger.warn(`Failed to delete company folder ${companyFolder}: ${err}`);
    }
  }
};

export default DeleteCompanyService;
