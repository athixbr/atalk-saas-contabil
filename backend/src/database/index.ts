import { Sequelize } from "sequelize-typescript";
import User from "../models/User";
import Setting from "../models/Setting";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import Whatsapp from "../models/Whatsapp";
import ContactCustomField from "../models/ContactCustomField";
import Message from "../models/Message";
import Queue from "../models/Queue";
import WhatsappQueue from "../models/WhatsappQueue";
import UserQueue from "../models/UserQueue";
import Company from "../models/Company";
import Plan from "../models/Plan";
import TicketNote from "../models/TicketNote";
import QuickMessage from "../models/QuickMessage";
import Help from "../models/Help";
import TicketTraking from "../models/TicketTraking";
import UserRating from "../models/UserRating";
import Schedule from "../models/Schedule";
import Tag from "../models/Tag";
import TicketTag from "../models/TicketTag";
import ContactList from "../models/ContactList";
import ContactListItem from "../models/ContactListItem";
import Campaign from "../models/Campaign";
import CampaignSetting from "../models/CampaignSetting";
import Baileys from "../models/Baileys";
import CampaignShipping from "../models/CampaignShipping";
import Announcement from "../models/Announcement";
import Chat from "../models/Chat";
import ChatUser from "../models/ChatUser";
import ChatMessage from "../models/ChatMessage";
import Chatbot from "../models/Chatbot";
import DialogChatBots from "../models/DialogChatBots";
import QueueIntegrations from "../models/QueueIntegrations";
import Invoices from "../models/Invoices";
import Subscriptions from "../models/Subscriptions";
import ApiUsages from "../models/ApiUsages";
import Files from "../models/Files";
import FilesOptions from "../models/FilesOptions";
import ContactTag from "../models/ContactTag";
import CompaniesSettings from "../models/CompaniesSettings";
import LogTicket from "../models/LogTicket";
import Prompt from "../models/Prompt";
import Plantao from "../models/Plantao";

import AdiantamentoFolha from "../models/AdiantamentoFolha";
import AgendamentoCertidao from "../models/AgendamentoCertidao";
import AnotacaoEmpresa from "../models/AnotacaoEmpresa";
import Billing from "../models/Billing";
import BillingAttachment from "../models/BillingAttachment";
import BillingHistory from "../models/BillingHistory";
import CampaignGrupo from "../models/CampaignGrupo";
import CampaignGrupoConfig from "../models/CampaignGrupoConfig";
import CampaignGrupoGroup from "../models/CampaignGrupoGroup";
import CargoSocio from "../models/CargoSocio";
import CategoriaCliente from "../models/CategoriaCliente";
import Certidao from "../models/Certidao";
import CertificadoDigital from "../models/CertificadoDigital";
import Checklist from "../models/Checklist";
import ChecklistItem from "../models/ChecklistItem";
import Cnae from "../models/Cnae";
import Cliente from "../models/Cliente";
import ClienteCNAE from "../models/ClienteCNAE";
import ClienteCertidao from "../models/ClienteCertidao";
import ClienteContato from "../models/ClienteContato";
import ContatoDepartamento from "../models/ContatoDepartamento";
import ContatoAppAcesso from "../models/ContatoAppAcesso";
import ClienteRedeSocial from "../models/ClienteRedeSocial";
import ClienteSocio from "../models/ClienteSocio";
import ClienteViewPreference from "../models/ClienteViewPreference";
import UserViewPreference from "../models/UserViewPreference";
import ClienteVigencia from "../models/ClienteVigencia";
import ClusterCliente from "../models/ClusterCliente";
import ControleCliente from "../models/ControleCliente";
import ControleClienteHistorico from "../models/ControleClienteHistorico";
import ControleConfig from "../models/ControleConfig";
import ControleNotificacao from "../models/ControleNotificacao";
import Controles from "../models/Controles";
import CrmBusinessType from "../models/CrmBusinessType";
import CrmClient from "../models/CrmClient";
import CrmInteraction from "../models/CrmInteraction";
import CrmLead from "../models/CrmLead";
import CrmSource from "../models/CrmSource";
import CrmStage from "../models/CrmStage";
import CrmTask from "../models/CrmTask";
import CrmTaskCategory from "../models/CrmTaskCategory";
import CrmTaskStage from "../models/CrmTaskStage";
import CrmTaxRegime from "../models/CrmTaxRegime";
import DemaisIdentificadores from "../models/DemaisIdentificadores";
import Departamento from "../models/Departamento";
import DepartamentoUsuario from "../models/DepartamentoUsuario";
import DocumentoClienteAcesso from "../models/DocumentoClienteAcesso";
import DistribuicaoLucros from "../models/DistribuicaoLucros";
import EnvioCorrespondencia from "../models/EnvioCorrespondencia";
import EscritorioGestor from "../models/EscritorioGestor";
import GedActivityLog from "../models/GedActivityLog";
import GedComment from "../models/GedComment";
import GedFile from "../models/GedFile";
import GedFileVersion from "../models/GedFileVersion";
import GedFolder from "../models/GedFolder";
import GedShare from "../models/GedShare";
import GrupoCliente from "../models/GrupoCliente";
import GrupoServico from "../models/GrupoServico";
import Holerite from "../models/Holerite";
import Integrations from "../models/Integrations";
import KnowledgeBaseArticle from "../models/KnowledgeBaseArticle";
import KnowledgeBaseArticleTag from "../models/KnowledgeBaseArticleTag";
import KnowledgeBaseAttachment from "../models/KnowledgeBaseAttachment";
import KnowledgeBaseCategory from "../models/KnowledgeBaseCategory";
import KnowledgeBaseComment from "../models/KnowledgeBaseComment";
import KnowledgeBaseRating from "../models/KnowledgeBaseRating";
import KnowledgeBaseTag from "../models/KnowledgeBaseTag";
import KnowledgeBaseVideo from "../models/KnowledgeBaseVideo";
import LocalizacaoCliente from "../models/LocalizacaoCliente";
import LogCertidao from "../models/LogCertidao";
import NfeXml from "../models/NfeXml";
import NfeXmlItem from "../models/NfeXmlItem";
import ModalFechBPO from "../models/ModalFechBPO";
import ModalidadeFechamentoContabil from "../models/ModalidadeFechamentoContabil";
import ModalidadeFechamentoDP from "../models/ModalidadeFechamentoDP";
import ModalidadeFechamentoFiscal from "../models/ModalidadeFechamentoFiscal";
import Parcelamentos from "../models/Parcelamentos";
import ParcelamentosParcela from "../models/ParcelamentosParcela";
import PerfilCargo from "../models/PerfilCargo";
import PeriodicidadeCliente from "../models/PeriodicidadeCliente";
import PorteEstadual from "../models/PorteEstadual";
import PorteFederal from "../models/PorteFederal";
import PorteMunicipal from "../models/PorteMunicipal";
import Prazo from "../models/Prazo";
import Prioridade from "../models/Prioridade";
import QueueOption from "../models/QueueOption";
import RegimeTributarioEstadual from "../models/RegimeTributarioEstadual";
import RegimeTributarioFederal from "../models/RegimeTributarioFederal";
import RegimeTributarioMunicipal from "../models/RegimeTributarioMunicipal";
import ResponsavelDepartamento from "../models/ResponsavelDepartamento";
import SedeCliente from "../models/SedeCliente";
import Segmento from "../models/Segmento";
import Atuacao from "../models/Atuacao";
import ServicosExtraordinarios from "../models/ServicosExtraordinarios";
import Socio from "../models/Socio";
import Status from "../models/Status";
import StatusCliente from "../models/StatusCliente";
import StatusComplementar from "../models/StatusComplementar";
import StatusControle from "../models/StatusControle";
import ControleComData from "../models/ControleComData";
import TagServico from "../models/TagServico";
import Tags from "../models/Tags";
import TagsParametros from "../models/TagsParametros";
import TarefaChecklist from "../models/TarefaChecklist";
import TarefaConfig from "../models/TarefaConfig";
import TarefaConfigChecklist from "../models/TarefaConfigChecklist";
import TarefaDocumento from "../models/TarefaDocumento";
import TarefaEntregaMensal from "../models/TarefaEntregaMensal";
import TarefaFinanceiro from "../models/TarefaFinanceiro";
import TarefaGerada from "../models/TarefaGerada";
import TarefaGeradaHistorico from "../models/TarefaGeradaHistorico";
import TarefaInfoGeral from "../models/TarefaInfoGeral";
import TarefaNotificacao from "../models/TarefaNotificacao";
import TarefaPrazoConfig from "../models/TarefaPrazoConfig";
import TarefaRecorrente from "../models/TarefaRecorrente";
import TarefaRecorrenteCliente from "../models/TarefaRecorrenteCliente";
import TarefaRecorrenteSocio from "../models/TarefaRecorrenteSocio";
import TarefaRecorrenteUsuario from "../models/TarefaRecorrenteUsuario";
import TarefaRecorrenteViewPreference from "../models/TarefaRecorrenteViewPreference";
import Task from "../models/Task";
import TaskFile from "../models/TaskFile";
import TaskHistory from "../models/TaskHistory";
import TemplateLeitura from "../models/TemplateLeitura";
import TicketInteractions from "../models/TicketInteractions";
import TicketMetrics from "../models/TicketMetrics";
import TicketUserMetrics from "../models/TicketUserMetrics";
import TierCliente from "../models/TierCliente";
import TipoCliente from "../models/TipoCliente";
import TipoConta from "../models/TipoConta";
import TipoDocumento from "../models/TipoDocumento";
import Esfera from "../models/Esfera";
import TipoServico from "../models/TipoServico";
import UserClientesPreference from "../models/UserClientesPreference";
import UserClientesSavedFilter from "../models/UserClientesSavedFilter";
import VolumeBPO from "../models/VolumeBPO";
import VolumeContabil from "../models/VolumeContabil";
import VolumeDP from "../models/VolumeDP";
import VolumeFiscal from "../models/VolumeFiscal";
import WhatsappGroup from "../models/WhatsappGroup";
import WhatsappStory from "../models/WhatsappStory";
import EmailConfig from "../models/EmailConfig";
import EmailTemplate from "../models/EmailTemplate";
import EmailLog from "../models/EmailLog";
import WhatsappTemplate from "../models/WhatsappTemplate";
import WhatsappLog from "../models/WhatsappLog";
import dbConfig from "../config/database";

const sequelize = new Sequelize(dbConfig);

const models = [
  Company,
  User,
  Contact,
  ContactTag,
  Ticket,
  Message,
  Whatsapp,
  ContactCustomField,
  Setting,
  Queue,
  WhatsappQueue,
  UserQueue,
  Plan,
  TicketNote,
  QuickMessage,
  Help,
  TicketTraking,
  UserRating,
  Schedule,
  Tag,
  TicketTag,
  ContactList,
  ContactListItem,
  Campaign,
  CampaignSetting,
  Baileys,
  CampaignShipping,
  Announcement,
  Chat,
  ChatUser,
  ChatMessage,
  Chatbot,
  DialogChatBots,
  QueueIntegrations,
  Invoices,
  Subscriptions,
  ApiUsages,
  Files,
  FilesOptions,
  CompaniesSettings,
  LogTicket,
  Prompt,
  Plantao,
  AdiantamentoFolha,
  AgendamentoCertidao,
  AnotacaoEmpresa,
  Billing,
  BillingAttachment,
  BillingHistory,
  CampaignGrupo,
  CampaignGrupoConfig,
  CampaignGrupoGroup,
  CargoSocio,
  CategoriaCliente,
  Certidao,
  CertificadoDigital,
  Checklist,
  ChecklistItem,
  Cnae,
  ClienteVigencia,
  Cliente,
  ClienteCNAE,
  ClienteCertidao,
  ClienteContato,
  ContatoDepartamento,
  ContatoAppAcesso,
  ClienteRedeSocial,
  ClienteSocio,
  ClienteViewPreference,
  UserViewPreference,
  ClusterCliente,
  ControleCliente,
  ControleClienteHistorico,
  ControleConfig,
  ControleNotificacao,
  Controles,
  CrmBusinessType,
  CrmClient,
  CrmInteraction,
  CrmLead,
  CrmSource,
  CrmStage,
  CrmTask,
  CrmTaskCategory,
  CrmTaskStage,
  CrmTaxRegime,
  DemaisIdentificadores,
  Departamento,
  DepartamentoUsuario,
  DocumentoClienteAcesso,
  DistribuicaoLucros,
  EnvioCorrespondencia,
  EscritorioGestor,
  GedActivityLog,
  GedComment,
  GedFile,
  GedFileVersion,
  GedFolder,
  GedShare,
  GrupoCliente,
  GrupoServico,
  Holerite,
  Integrations,
  KnowledgeBaseArticle,
  KnowledgeBaseArticleTag,
  KnowledgeBaseAttachment,
  KnowledgeBaseCategory,
  KnowledgeBaseComment,
  KnowledgeBaseRating,
  KnowledgeBaseTag,
  KnowledgeBaseVideo,
  LocalizacaoCliente,
  LogCertidao,
  NfeXml,
  NfeXmlItem,
  ModalFechBPO,
  ModalidadeFechamentoContabil,
  ModalidadeFechamentoDP,
  ModalidadeFechamentoFiscal,
  Parcelamentos,
  ParcelamentosParcela,
  PerfilCargo,
  PeriodicidadeCliente,
  PorteEstadual,
  PorteFederal,
  PorteMunicipal,
  Prazo,
  Prioridade,
  QueueOption,
  RegimeTributarioEstadual,
  RegimeTributarioFederal,
  RegimeTributarioMunicipal,
  ResponsavelDepartamento,
  SedeCliente,
  Segmento,
  Atuacao,
  ServicosExtraordinarios,
  Socio,
  Status,
  StatusCliente,
  StatusComplementar,
  StatusControle,
  ControleComData,
  TagServico,
  Tags,
  TagsParametros,
  TarefaChecklist,
  TarefaConfig,
  TarefaConfigChecklist,
  TarefaDocumento,
  TarefaEntregaMensal,
  TarefaFinanceiro,
  TarefaGerada,
  TarefaGeradaHistorico,
  TarefaInfoGeral,
  TarefaNotificacao,
  TarefaPrazoConfig,
  TarefaRecorrente,
  TarefaRecorrenteCliente,
  TarefaRecorrenteSocio,
  TarefaRecorrenteUsuario,
  TarefaRecorrenteViewPreference,
  Task,
  TaskFile,
  TaskHistory,
  TemplateLeitura,
  TicketInteractions,
  TicketMetrics,
  TicketUserMetrics,
  TierCliente,
  TipoCliente,
  TipoConta,
  TipoDocumento,
  TipoServico,
  Esfera,
  UserClientesPreference,
  UserClientesSavedFilter,
  VolumeBPO,
  VolumeContabil,
  VolumeDP,
  VolumeFiscal,
  WhatsappGroup,
  WhatsappStory,
  EmailConfig,
  EmailTemplate,
  EmailLog,
  WhatsappTemplate,
  WhatsappLog,
];

sequelize.addModels(models);

export default sequelize;
