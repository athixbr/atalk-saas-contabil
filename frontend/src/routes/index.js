import React, { useEffect, useState } from "react";
import { BrowserRouter, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import LoggedInLayout from "../layout";
import Dashboard from "../pages/Dashboard/";
import TicketResponsiveContainer from "../pages/TicketResponsiveContainer";
import Signup from "../pages/Signup";
import Login from "../pages/Login/";
import Connections from "../pages/Connections/";
import SettingsCustom from "../pages/SettingsCustom/";
import Financeiro from "../pages/Financeiro/";
import Users from "../pages/Users";
import Contacts from "../pages/Contacts/";
import ChatMoments from "../pages/Moments"
import Queues from "../pages/Queues/";
import Tags from "../pages/Tags/";
import MessagesAPI from "../pages/MessagesAPI/";
import Helps from "../pages/Helps/";
import ContactLists from "../pages/ContactLists/";
import ContactListItems from "../pages/ContactListItems/";
import Companies from "../pages/Companies/";
import QuickMessages from "../pages/QuickMessages/";
import { AuthProvider } from "../context/Auth/AuthContext";
import { TicketsContextProvider } from "../context/Tickets/TicketsContext";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext";
import Route from "./Route";
import Schedules from "../pages/Schedules";
import Campaigns from "../pages/Campaigns";
import CampaignsConfig from "../pages/CampaignsConfig";
import CampaignReport from "../pages/CampaignReport";
import Annoucements from "../pages/Annoucements";
import Chat from "../pages/Chat";
import PasswordReset from "../pages/PasswordReset";
import { Plantao } from "../pages/Plantao";

// import Integrations from '../pages/Integrations';
// import GoogleCalendarComponent from '../pages/Integrations/components/GoogleCalendarComponent';

import Subscription from "../pages/Subscription/";
import QueueIntegration from "../pages/QueueIntegration";
import Files from "../pages/Files/";
import GED from "../pages/GED/";
import Prompts from "../pages/Prompts";
import ToDoList from "../pages/ToDoList/";
import Kanban from "../pages/Kanban";
import TagsKanban from "../pages/TagsKanban";
import GridReport from '../pages/Reports/GridReport';
import TicketTimeReports from '../pages/Reports/TicketTimeReports';
import UserPerformanceReports from '../pages/Reports/UserPerformanceReports';
import Tarefas from "../pages/Tarefas";
import Agenda from "../pages/Agenda";
import Controles from "../pages/Controles";
import CRM from "../pages/CRM";
import LeadDetail from "../pages/CRM/LeadDetail";
import CrmTasks from "../pages/CrmTasks";
import CrmTasksPipeline from "../pages/CrmTasksPipeline";
import Certidoes from "../pages/Certidoes";
import Cobranca from "../pages/Cobranca";
import Grupos from "../pages/Grupos";
import GruposLista from "../pages/GruposLista";
import GruposConfig from "../pages/GruposConfig";
import GruposNovaCampanha from "../pages/GruposNovaCampanha";
import TarefasConfig from "../pages/TarefasConfig";
import TarefasCadastro from "../pages/TarefasConfig/Cadastro";
import TarefasVisualizar from "../pages/TarefasConfig/Visualizar";
import ControlesConfig from "../pages/ControlesConfig";
import ControlesCadastro from "../pages/ControlesConfig/Cadastro";
import Departamentos from "../pages/Departamentos";
import DepartamentosCadastro from "../pages/Departamentos/Cadastro";
import Parametros from "../pages/Parametros";
import ModelosParametros from "../pages/ModelosParametros";
import ModelosParametrosCadastro from "../pages/ModelosParametros/Cadastro";
import Clientes from "../pages/Clientes";
import ClientesCadastro from "../pages/Clientes/Cadastro";
import Socios from "../pages/Socios";
import SociosCadastro from "../pages/Socios/Cadastro";
import XmlNfe from "../pages/XmlNfe";
import PainelTarefas from "../pages/PainelTarefas";
import Recorrencia from "../pages/Recorrencia";
import Parcelamentos from "../pages/Parcelamentos";
import FormularioParcelamento from "../pages/Parcelamentos/FormularioParcelamento";
import Checklists from "../pages/Checklists";
import CadastroChecklist from "../pages/Checklists/Cadastro";
import VisualizarChecklist from "../pages/Checklists/Visualizar";
import ListaTarefasRecorrentes from "../pages/TarefasRecorrentes/Lista";
import FormularioTarefaRecorrente from "../pages/TarefasRecorrentes/NovoFormulario";
import GerenciamentoTarefasGeradas from "../pages/TarefasGeradas/Gerenciamento";
import CentralAtividades from "../pages/CentralAtividades";
import CentralVinculos from "../pages/CentralVinculos";
import VincularControles from "../pages/VincularControles";
import TipoServico from "../pages/TipoServico";
import GrupoServico from "../pages/GrupoServico";
import Profile from "../pages/Profile";
import DashboardPersonal from "../pages/DashboardPersonal";
import PerfilCargo from "../pages/Users/PerfilCargo";
import Holerites from "../pages/Users/Holerites";
import BaseConhecimento from "../pages/BaseConhecimento";
import ViewArticle from "../pages/BaseConhecimento/ViewArticle";
import ArticleForm from "../pages/BaseConhecimento/ArticleForm";
import CategoriesManager from "../pages/BaseConhecimento/CategoriesManager";
import AdminNotifications from "../pages/AdminNotifications";
import WhatsappStory from "../pages/WhatsappStory";

const Routes = () => {
  const [showCampaigns, setShowCampaigns] = useState(false);

  useEffect(() => {
    const cshow = localStorage.getItem("cshow");
    if (cshow !== undefined) {
      setShowCampaigns(true);
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <TicketsContextProvider>
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route exact path="/signup" component={Signup} />
            <Route exact path="/recovery-password" component={PasswordReset} />
            <WhatsAppsProvider>
              <LoggedInLayout>
                <Route exact path="/financeiro-aberto" component={Financeiro} isPrivate />
                <Route exact path="/financeiro" component={Financeiro} isPrivate />
                <Route exact path="/companies" component={Companies} isPrivate />
                <Route exact path="/" component={Dashboard} isPrivate />
                <Route exact path="/reports" component={GridReport} isPrivate />
                <Route exact path="/reports/tickets/time-analysis" component={TicketTimeReports} isPrivate />
                <Route exact path="/reports/users/performance" component={UserPerformanceReports} isPrivate />
                <Route exact path="/tickets/:ticketId?" component={TicketResponsiveContainer} isPrivate />
                <Route exact path="/connections" component={Connections} isPrivate />
                <Route exact path="/quick-messages" component={QuickMessages} isPrivate />
                <Route exact path="/todolist" component={ToDoList} isPrivate />
                <Route exact path="/schedules" component={Schedules} isPrivate />
                <Route exact path="/tags" component={Tags} isPrivate />
                <Route exact path="/contacts" component={Contacts} isPrivate />
                <Route exact path="/helps" component={Helps} isPrivate />
                <Route exact path="/xml-nfe" component={XmlNfe} isPrivate />
                <Route exact path="/users" component={Users} isPrivate />
                <Route exact path="/users/perfil-cargo/:userId" component={PerfilCargo} isPrivate />
                <Route exact path="/users/holerites/:userId" component={Holerites} isPrivate />
                <Route exact path="/profile" component={Profile} isPrivate />
                <Route exact path="/dashboard" component={DashboardPersonal} isPrivate />
                <Route exact path="/messages-api" component={MessagesAPI} isPrivate />
                <Route exact path="/settings" component={SettingsCustom} isPrivate />
                <Route exact path="/queues" component={Queues} isPrivate />
                <Route exact path="/queue-integration" component={QueueIntegration} isPrivate />
                <Route exact path="/announcements" component={Annoucements} isPrivate />
                <Route exact path="/chats/:id?" component={Chat} isPrivate />
                <Route exact path="/plantao" component={Plantao} isPrivate />
                <Route exact path="/admin-notifications" component={AdminNotifications} isPrivate />
                <Route exact path="/files" component={GED} isPrivate />
                <Route exact path="/prompts" component={Prompts} isPrivate />
                <Route exact path="/moments" component={ChatMoments} isPrivate />
                <Route exact path="/Kanban" component={Kanban} isPrivate />
                <Route exact path="/TagsKanban" component={TagsKanban} isPrivate />
                <Route exact path="/tarefas" component={Tarefas} isPrivate />
                <Route exact path="/painel-tarefas" component={PainelTarefas} isPrivate />
                <Route exact path="/central-vinculos" component={CentralVinculos} isPrivate />
                <Route exact path="/vincular-controles" component={VincularControles} isPrivate />
                <Route exact path="/agenda" component={Agenda} isPrivate />
                <Route exact path="/controles" component={Controles} isPrivate />
                <Route exact path="/recorrencia" component={ListaTarefasRecorrentes} isPrivate />
                <Route exact path="/parcelamentos" component={Parcelamentos} isPrivate />
                <Route exact path="/crm" component={CRM} isPrivate />
                <Route exact path="/crm/leads/:leadId" component={LeadDetail} isPrivate />
                <Route exact path="/crm/tarefas" component={CrmTasks} isPrivate />
                <Route exact path="/crm/tarefas/pipeline" component={CrmTasksPipeline} isPrivate />
                <Route exact path="/cobranca" component={Cobranca} isPrivate />
                <Route exact path="/certidoes" component={Certidoes} isPrivate />
                
                {/* Rotas Base de Conhecimento */}
                <Route exact path="/base-conhecimento" component={BaseConhecimento} isPrivate />
                <Route exact path="/base-conhecimento/categorias" component={CategoriesManager} isPrivate />
                <Route exact path="/base-conhecimento/novo" component={ArticleForm} isPrivate />
                <Route exact path="/base-conhecimento/editar/:articleId" component={ArticleForm} isPrivate />
                <Route exact path="/base-conhecimento/artigos/:articleId" component={ViewArticle} isPrivate />
                
                {/* Rotas de Tarefas Recorrentes */}
                <Route exact path="/tarefas-recorrentes" component={ListaTarefasRecorrentes} isPrivate />
                <Route exact path="/tarefas-recorrentes/novo" component={FormularioTarefaRecorrente} isPrivate />
                <Route exact path="/tarefas-recorrentes/editar/:id" component={FormularioTarefaRecorrente} isPrivate />
                <Route exact path="/tarefas-geradas" component={GerenciamentoTarefasGeradas} isPrivate />
                
                {/* Rotas de Parcelamentos */}
                <Route exact path="/parcelamentos" component={Parcelamentos} isPrivate />
                <Route exact path="/parcelamentos/novo" component={FormularioParcelamento} isPrivate />
                <Route exact path="/parcelamentos/editar/:id" component={FormularioParcelamento} isPrivate />
                
                {/* Rotas de Checklists */}
                <Route exact path="/checklists" component={Checklists} isPrivate />
                <Route exact path="/checklists/cadastro/:id?" component={CadastroChecklist} isPrivate />
                <Route exact path="/checklists/:id" component={VisualizarChecklist} isPrivate />
                
                <Route exact path="/central-atividades" component={CentralAtividades} isPrivate />
                <Route exact path="/tipo-servico" component={TipoServico} isPrivate />
                <Route exact path="/grupo-servico" component={GrupoServico} isPrivate />
                
                {/* Rotas de Clientes */}
                <Route exact path="/clientes" component={Clientes} isPrivate />
                <Route exact path="/clientes/cadastro/:id?" component={ClientesCadastro} isPrivate />
                
                {/* Rotas de Sócios */}
                <Route exact path="/socios" component={Socios} isPrivate />
                <Route exact path="/socios/cadastro/:id?" component={SociosCadastro} isPrivate />
                
                {/* Rotas de Configuração - Tarefas e Departamentos */}
                <Route exact path="/tarefas-config" component={TarefasConfig} isPrivate />
                <Route exact path="/tarefas-config/cadastro/:id?" component={TarefasCadastro} isPrivate />
                <Route exact path="/tarefas-config/visualizar/:id" component={TarefasVisualizar} isPrivate />
                
                {/* Rotas de Configuração - Controles */}
                <Route exact path="/controles-config" component={ControlesConfig} isPrivate />
                <Route exact path="/controles-config/cadastro/:id?" component={ControlesCadastro} isPrivate />
                
                <Route exact path="/departamentos" component={Departamentos} isPrivate />
                <Route exact path="/departamentos/cadastro/:id?" component={DepartamentosCadastro} isPrivate />
                <Route exact path="/parametros" component={Parametros} isPrivate />
                <Route exact path="/modelos-parametros" component={ModelosParametros} isPrivate />
                <Route exact path="/modelos-parametros/cadastro/:id?" component={ModelosParametrosCadastro} isPrivate />
                
                {/* Rotas do módulo Grupos - rotas específicas ANTES da rota com :id */}
                <Route exact path="/grupos/nova" component={GruposNovaCampanha} isPrivate />
                <Route exact path="/grupos/lista" component={GruposLista} isPrivate />
                <Route exact path="/grupos/config" component={GruposConfig} isPrivate />
                <Route exact path="/grupos/campanha/:id" component={GruposNovaCampanha} isPrivate />
                <Route exact path="/grupos" component={Grupos} isPrivate />
                <Route exact path="/whatsapp-stories" component={WhatsappStory} isPrivate />


                {showCampaigns && (
                  <>
                    <Route exact path="/contact-lists" component={ContactLists} isPrivate />
                    <Route exact path="/contact-lists/:contactListId/contacts" component={ContactListItems} isPrivate />
                    <Route exact path="/campaigns" component={Campaigns} isPrivate />
                    <Route exact path="/campaign/:campaignId/report" component={CampaignReport} isPrivate />
                    <Route exact path="/campaigns-config" component={CampaignsConfig} isPrivate />
                  </>
                )}
              </LoggedInLayout>
            </WhatsAppsProvider>
          </Switch>
          <ToastContainer autoClose={3000} />
        </TicketsContextProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;
