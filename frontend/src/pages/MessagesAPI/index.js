import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { toast } from "react-toastify";
import usePlans from "../../hooks/usePlans";
import { AuthContext } from "../../context/Auth/AuthContext";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(3),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  tabs: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(3),
  },
  tab: {
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.95rem",
  },
  section: {
    marginBottom: theme.spacing(3),
  },
  methodChip: {
    fontWeight: "bold",
    marginRight: theme.spacing(1),
  },
  codeBlock: {
    backgroundColor: theme.palette.type === "dark" ? "#1e1e1e" : "#f5f5f5",
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    fontFamily: "monospace",
    fontSize: "0.85rem",
    overflowX: "auto",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    border: `1px solid ${theme.palette.divider}`,
  },
  endpoint: {
    backgroundColor: theme.palette.type === "dark" ? "#2d2d2d" : "#e8f5e9",
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(0.5),
    fontFamily: "monospace",
    fontSize: "0.9rem",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
    wordBreak: "break-all",
  },
  accordion: {
    marginBottom: theme.spacing(2),
  },
  paramTable: {
    marginTop: theme.spacing(2),
  },
  requiredBadge: {
    backgroundColor: "#f44336",
    color: "white",
    fontSize: "0.7rem",
    height: "20px",
    marginLeft: theme.spacing(1),
  },
  optionalBadge: {
    backgroundColor: "#4caf50",
    color: "white",
    fontSize: "0.7rem",
    height: "20px",
    marginLeft: theme.spacing(1),
  },
  exampleTitle: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    fontWeight: 600,
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`api-tabpanel-${index}`}
      aria-labelledby={`api-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const MessagesAPI = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { getPlanCompany } = usePlans();
  const [tabValue, setTabValue] = useState(0);

  const baseURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useExternalApi) {
        toast.error(
          "Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando."
        );
        setTimeout(() => {
          history.push(`/`);
        }, 1000);
      }
    }
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Componente de parâmetros em tabela
  const ParamTable = ({ params }) => (
    <TableContainer className={classes.paramTable}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell><strong>Parâmetro</strong></TableCell>
            <TableCell><strong>Tipo</strong></TableCell>
            <TableCell><strong>Obrigatório</strong></TableCell>
            <TableCell><strong>Descrição</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {params.map((param, index) => (
            <TableRow key={index}>
              <TableCell><code>{param.name}</code></TableCell>
              <TableCell>{param.type}</TableCell>
              <TableCell>
                {param.required ? (
                  <Chip label="Sim" size="small" className={classes.requiredBadge} />
                ) : (
                  <Chip label="Não" size="small" className={classes.optionalBadge} />
                )}
              </TableCell>
              <TableCell>{param.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <MainContainer>
      <MainHeader>
        <Title>Documentação da API</Title>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Typography variant="body1" paragraph>
          Documentação completa para integração com as APIs do sistema. Utilize o token de autenticação disponível na seção de configurações.
        </Typography>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          className={classes.tabs}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Mensagens" className={classes.tab} />
          <Tab label="Tarefas" className={classes.tab} />
          <Tab label="Cobrança" className={classes.tab} />
        </Tabs>

        {/* TAB 1: API de Mensagens */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h5" gutterBottom>
            API de Mensagens
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Envie mensagens de texto e mídia via WhatsApp através da API REST.
          </Typography>

          <Divider style={{ margin: "24px 0" }} />

          {/* Enviar Mensagem de Texto */}
          <Accordion className={classes.accordion} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Chip label="POST" color="primary" className={classes.methodChip} size="small" />
              <Typography variant="h6">Enviar Mensagem de Texto</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box width="100%">
                <Typography variant="body2" paragraph>
                  Envia uma mensagem de texto para um número de WhatsApp.
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  <strong>Endpoint:</strong>
                </Typography>
                <Box className={classes.endpoint}>
                  POST {baseURL}/api/messages/send
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  <strong>Headers:</strong>
                </Typography>
                <Box className={classes.codeBlock}>
                  Authorization: Bearer SEU_TOKEN{"\n"}
                  Content-Type: application/json
                </Box>

                <Typography variant="subtitle2" gutterBottom style={{ marginTop: 16 }}>
                  <strong>Parâmetros do Body:</strong>
                </Typography>
                <ParamTable
                  params={[
                    { name: "number", type: "string", required: true, description: "Número do destinatário com código do país (ex: 5511999999999)" },
                    { name: "body", type: "string", required: true, description: "Texto da mensagem" },
                    { name: "userId", type: "number", required: false, description: "ID do usuário que enviará a mensagem" },
                    { name: "queueId", type: "number", required: false, description: "ID da fila para direcionar a mensagem" },
                    { name: "sendSignature", type: "boolean", required: false, description: "Adicionar assinatura do usuário (true/false)" },
                  ]}
                />

                <Typography className={classes.exampleTitle}>
                  Exemplo de Request:
                </Typography>
                <Box className={classes.codeBlock}>
{`{
  "number": "5511999999999",
  "body": "Olá! Esta é uma mensagem de teste.",
  "userId": 1,
  "queueId": 2,
  "sendSignature": true
}`}
                </Box>

                <Typography className={classes.exampleTitle}>
                  Resposta de Sucesso (200):
                </Typography>
                <Box className={classes.codeBlock}>
{`{
  "id": 12345,
  "body": "Olá! Esta é uma mensagem de teste.",
  "ack": 0,
  "read": false,
  "fromMe": true,
  "mediaUrl": null,
  "mediaType": "chat",
  "timestamp": 1234567890,
  "quotedMsgId": null,
  "ticketId": 789,
  "contactId": 456
}`}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Enviar Mensagem com Mídia */}
          <Accordion className={classes.accordion}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Chip label="POST" color="primary" className={classes.methodChip} size="small" />
              <Typography variant="h6">Enviar Mensagem com Mídia</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box width="100%">
                <Typography variant="body2" paragraph>
                  Envia uma mensagem com arquivo de mídia (imagem, vídeo, documento, áudio).
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  <strong>Endpoint:</strong>
                </Typography>
                <Box className={classes.endpoint}>
                  POST {baseURL}/api/messages/send
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  <strong>Headers:</strong>
                </Typography>
                <Box className={classes.codeBlock}>
                  Authorization: Bearer SEU_TOKEN{"\n"}
                  Content-Type: multipart/form-data
                </Box>

                <Typography variant="subtitle2" gutterBottom style={{ marginTop: 16 }}>
                  <strong>Parâmetros do FormData:</strong>
                </Typography>
                <ParamTable
                  params={[
                    { name: "number", type: "string", required: true, description: "Número do destinatário com código do país" },
                    { name: "body", type: "string", required: false, description: "Legenda da mídia (opcional)" },
                    { name: "medias", type: "file", required: true, description: "Arquivo de mídia (imagem, vídeo, PDF, etc)" },
                    { name: "userId", type: "number", required: false, description: "ID do usuário" },
                    { name: "queueId", type: "number", required: false, description: "ID da fila" },
                    { name: "sendSignature", type: "boolean", required: false, description: "Adicionar assinatura" },
                  ]}
                />

                <Typography className={classes.exampleTitle}>
                  Exemplo de Request (JavaScript):
                </Typography>
                <Box className={classes.codeBlock}>
{`const formData = new FormData();
formData.append('number', '5511999999999');
formData.append('body', 'Segue o documento solicitado');
formData.append('medias', fileInput.files[0]);
formData.append('userId', '1');

fetch('${baseURL}/api/messages/send', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer SEU_TOKEN'
  },
  body: formData
});`}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        </TabPanel>

        {/* TAB 2: API de Tarefas */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h5" gutterBottom>
            API de Tarefas
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Gerencie tarefas do sistema através da API REST.
          </Typography>

          <Divider style={{ margin: "24px 0" }} />

          {/* Listar Tarefas */}
          <Accordion className={classes.accordion} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Chip label="GET" style={{ backgroundColor: "#4caf50", color: "white" }} className={classes.methodChip} size="small" />
              <Typography variant="h6">Listar Tarefas</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box width="100%">
                <Typography variant="body2" paragraph>
                  Retorna a lista de tarefas com paginação e filtros.
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  <strong>Endpoint:</strong>
                </Typography>
                <Box className={classes.endpoint}>
                  GET {baseURL}/tasks
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  <strong>Headers:</strong>
                </Typography>
                <Box className={classes.codeBlock}>
                  Authorization: Bearer SEU_TOKEN
                </Box>

                <Typography variant="subtitle2" gutterBottom style={{ marginTop: 16 }}>
                  <strong>Query Parameters:</strong>
                </Typography>
                <ParamTable
                  params={[
                    { name: "searchParam", type: "string", required: false, description: "Busca por título ou descrição" },
                    { name: "pageNumber", type: "number", required: false, description: "Número da página (padrão: 1)" },
                    { name: "status", type: "string", required: false, description: "Filtrar por status: pending, in_progress, completed, cancelled" },
                    { name: "priority", type: "string", required: false, description: "Filtrar por prioridade: low, medium, high" },
                    { name: "assignedToId", type: "number", required: false, description: "Filtrar por usuário responsável" },
                    { name: "contactId", type: "number", required: false, description: "Filtrar por contato" },
                  ]}
                />

                <Typography className={classes.exampleTitle}>
                  Exemplo de Request:
                </Typography>
                <Box className={classes.codeBlock}>
                  GET {baseURL}/tasks?status=pending&pageNumber=1
                </Box>

                <Typography className={classes.exampleTitle}>
                  Resposta de Sucesso (200):
                </Typography>
                <Box className={classes.codeBlock}>
{`{
  "tasks": [
    {
      "id": 1,
      "title": "Enviar proposta",
      "description": "Enviar proposta comercial para cliente",
      "status": "pending",
      "priority": "high",
      "dueDate": "2025-12-10T10:00:00.000Z",
      "assignedToId": 2,
      "contactId": 15,
      "createdBy": 1,
      "createdAt": "2025-12-02T08:00:00.000Z",
      "updatedAt": "2025-12-02T08:00:00.000Z"
    }
  ],
  "count": 25,
  "hasMore": true
}`}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Criar Tarefa */}
          <Accordion className={classes.accordion}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Chip label="POST" color="primary" className={classes.methodChip} size="small" />
              <Typography variant="h6">Criar Tarefa</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box width="100%">
                <Typography variant="body2" paragraph>
                  Cria uma nova tarefa no sistema.
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  <strong>Endpoint:</strong>
                </Typography>
                <Box className={classes.endpoint}>
                  POST {baseURL}/tasks
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  <strong>Headers:</strong>
                </Typography>
                <Box className={classes.codeBlock}>
                  Authorization: Bearer SEU_TOKEN{"\n"}
                  Content-Type: application/json
                </Box>

                <Typography variant="subtitle2" gutterBottom style={{ marginTop: 16 }}>
                  <strong>Parâmetros do Body:</strong>
                </Typography>
                <ParamTable
                  params={[
                    { name: "title", type: "string", required: true, description: "Título da tarefa" },
                    { name: "description", type: "string", required: false, description: "Descrição detalhada" },
                    { name: "status", type: "string", required: false, description: "Status: pending, in_progress, completed, cancelled (padrão: pending)" },
                    { name: "priority", type: "string", required: false, description: "Prioridade: low, medium, high (padrão: medium)" },
                    { name: "dueDate", type: "datetime", required: false, description: "Data de vencimento (ISO 8601)" },
                    { name: "assignedToId", type: "number", required: false, description: "ID do usuário responsável" },
                    { name: "contactId", type: "number", required: false, description: "ID do contato relacionado" },
                    { name: "ticketId", type: "number", required: false, description: "ID do ticket relacionado" },
                  ]}
                />

                <Typography className={classes.exampleTitle}>
                  Exemplo de Request:
                </Typography>
                <Box className={classes.codeBlock}>
{`{
  "title": "Revisar contrato",
  "description": "Revisar cláusulas do contrato antes do envio",
  "status": "pending",
  "priority": "high",
  "dueDate": "2025-12-15T17:00:00.000Z",
  "assignedToId": 3,
  "contactId": 42
}`}
                </Box>

                <Typography className={classes.exampleTitle}>
                  Resposta de Sucesso (200):
                </Typography>
                <Box className={classes.codeBlock}>
{`{
  "id": 25,
  "title": "Revisar contrato",
  "description": "Revisar cláusulas do contrato antes do envio",
  "status": "pending",
  "priority": "high",
  "dueDate": "2025-12-15T17:00:00.000Z",
  "assignedToId": 3,
  "contactId": 42,
  "createdBy": 1,
  "createdAt": "2025-12-02T10:30:00.000Z",
  "updatedAt": "2025-12-02T10:30:00.000Z"
}`}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Atualizar Tarefa */}
          <Accordion className={classes.accordion}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Chip label="PUT" style={{ backgroundColor: "#ff9800", color: "white" }} className={classes.methodChip} size="small" />
              <Typography variant="h6">Atualizar Tarefa</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box width="100%">
                <Typography variant="body2" paragraph>
                  Atualiza os dados de uma tarefa existente.
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  <strong>Endpoint:</strong>
                </Typography>
                <Box className={classes.endpoint}>
                  PUT {baseURL}/tasks/:taskId
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  <strong>Headers:</strong>
                </Typography>
                <Box className={classes.codeBlock}>
                  Authorization: Bearer SEU_TOKEN{"\n"}
                  Content-Type: application/json
                </Box>

                <Typography variant="subtitle2" gutterBottom style={{ marginTop: 16 }}>
                  <strong>Parâmetros do Body (todos opcionais):</strong>
                </Typography>
                <ParamTable
                  params={[
                    { name: "title", type: "string", required: false, description: "Novo título" },
                    { name: "description", type: "string", required: false, description: "Nova descrição" },
                    { name: "status", type: "string", required: false, description: "Novo status" },
                    { name: "priority", type: "string", required: false, description: "Nova prioridade" },
                    { name: "dueDate", type: "datetime", required: false, description: "Nova data de vencimento" },
                    { name: "assignedToId", type: "number", required: false, description: "Novo responsável" },
                  ]}
                />

                <Typography className={classes.exampleTitle}>
                  Exemplo de Request:
                </Typography>
                <Box className={classes.codeBlock}>
{`PUT ${baseURL}/tasks/25

{
  "status": "completed",
  "description": "Contrato revisado e aprovado"
}`}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Deletar Tarefa */}
          <Accordion className={classes.accordion}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Chip label="DELETE" style={{ backgroundColor: "#f44336", color: "white" }} className={classes.methodChip} size="small" />
              <Typography variant="h6">Deletar Tarefa</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box width="100%">
                <Typography variant="body2" paragraph>
                  Remove uma tarefa (soft delete - mantém histórico).
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  <strong>Endpoint:</strong>
                </Typography>
                <Box className={classes.endpoint}>
                  DELETE {baseURL}/tasks/:taskId
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  <strong>Headers:</strong>
                </Typography>
                <Box className={classes.codeBlock}>
                  Authorization: Bearer SEU_TOKEN
                </Box>

                <Typography className={classes.exampleTitle}>
                  Resposta de Sucesso (200):
                </Typography>
                <Box className={classes.codeBlock}>
{`{
  "message": "Tarefa removida com sucesso"
}`}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        </TabPanel>

        {/* TAB 3: API de Cobrança */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h5" gutterBottom>
            API de Cobrança
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Gerencie cobranças e controle financeiro através da API REST.
          </Typography>

          <Divider style={{ margin: "24px 0" }} />

          {/* Listar Cobranças */}
          <Accordion className={classes.accordion} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Chip label="GET" style={{ backgroundColor: "#4caf50", color: "white" }} className={classes.methodChip} size="small" />
              <Typography variant="h6">Listar Cobranças</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box width="100%">
                <Typography variant="body2" paragraph>
                  Retorna a lista de cobranças com paginação e filtros.
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  <strong>Endpoint:</strong>
                </Typography>
                <Box className={classes.endpoint}>
                  GET {baseURL}/billings
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  <strong>Headers:</strong>
                </Typography>
                <Box className={classes.codeBlock}>
                  Authorization: Bearer SEU_TOKEN
                </Box>

                <Typography variant="subtitle2" gutterBottom style={{ marginTop: 16 }}>
                  <strong>Query Parameters:</strong>
                </Typography>
                <ParamTable
                  params={[
                    { name: "searchParam", type: "string", required: false, description: "Busca por nome do cliente ou nome fantasia" },
                    { name: "pageNumber", type: "number", required: false, description: "Número da página (padrão: 1)" },
                    { name: "status", type: "string", required: false, description: "Filtrar por status da cobrança" },
                    { name: "contactId", type: "number", required: false, description: "Filtrar por contato" },
                  ]}
                />

                <Typography className={classes.exampleTitle}>
                  Exemplo de Request:
                </Typography>
                <Box className={classes.codeBlock}>
                  GET {baseURL}/billings?status=pendente&pageNumber=1
                </Box>

                <Typography className={classes.exampleTitle}>
                  Resposta de Sucesso (200):
                </Typography>
                <Box className={classes.codeBlock}>
{`{
  "billings": [
    {
      "id": 1,
      "clientName": "João Silva",
      "tradeName": "Silva Comércio LTDA",
      "accountPayable": 5000.00,
      "accountReceivable": 8000.00,
      "balance": 3000.00,
      "totalAmount": 13000.00,
      "dueDate": "2025-12-20T00:00:00.000Z",
      "nextContactDate": "2025-12-05T00:00:00.000Z",
      "contractNumber": "CONT-2025-001",
      "paymentMethod": "boleto",
      "status": "pendente",
      "notes": "Cliente aguardando aprovação interna",
      "contactId": 25,
      "createdAt": "2025-12-01T10:00:00.000Z",
      "updatedAt": "2025-12-01T10:00:00.000Z"
    }
  ],
  "count": 45,
  "hasMore": true
}`}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Criar Cobrança */}
          <Accordion className={classes.accordion}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Chip label="POST" color="primary" className={classes.methodChip} size="small" />
              <Typography variant="h6">Criar Cobrança</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box width="100%">
                <Typography variant="body2" paragraph>
                  Cria uma nova cobrança no sistema.
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  <strong>Endpoint:</strong>
                </Typography>
                <Box className={classes.endpoint}>
                  POST {baseURL}/billings
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  <strong>Headers:</strong>
                </Typography>
                <Box className={classes.codeBlock}>
                  Authorization: Bearer SEU_TOKEN{"\n"}
                  Content-Type: application/json
                </Box>

                <Typography variant="subtitle2" gutterBottom style={{ marginTop: 16 }}>
                  <strong>Parâmetros do Body:</strong>
                </Typography>
                <ParamTable
                  params={[
                    { name: "clientName", type: "string", required: true, description: "Nome do cliente" },
                    { name: "tradeName", type: "string", required: false, description: "Nome fantasia da empresa" },
                    { name: "accountPayable", type: "number", required: false, description: "Valor a pagar" },
                    { name: "accountReceivable", type: "number", required: false, description: "Valor a receber" },
                    { name: "totalAmount", type: "number", required: false, description: "Valor total" },
                    { name: "dueDate", type: "date", required: false, description: "Data de vencimento" },
                    { name: "nextContactDate", type: "date", required: false, description: "Data do próximo contato" },
                    { name: "contractNumber", type: "string", required: false, description: "Número do contrato" },
                    { name: "paymentMethod", type: "string", required: false, description: "Método de pagamento: boleto, pix, cartao_credito, cartao_debito, transferencia, dinheiro, outros" },
                    { name: "status", type: "string", required: false, description: "Status: pendente, aguardando_cliente, sem_resposta, andamento_com_parcelamento, andamento_sem_parcelamento, renegociacao, pago, cancelado, juridico" },
                    { name: "notes", type: "string", required: false, description: "Observações" },
                    { name: "contactId", type: "number", required: false, description: "ID do contato relacionado" },
                  ]}
                />

                <Typography className={classes.exampleTitle}>
                  Exemplo de Request:
                </Typography>
                <Box className={classes.codeBlock}>
{`{
  "clientName": "Maria Santos",
  "tradeName": "Santos Empreendimentos",
  "accountPayable": 2500.00,
  "accountReceivable": 7000.00,
  "totalAmount": 9500.00,
  "dueDate": "2025-12-30",
  "nextContactDate": "2025-12-10",
  "contractNumber": "CONT-2025-015",
  "paymentMethod": "pix",
  "status": "pendente",
  "notes": "Primeira cobrança do cliente",
  "contactId": 88
}`}
                </Box>

                <Typography className={classes.exampleTitle}>
                  Resposta de Sucesso (200):
                </Typography>
                <Box className={classes.codeBlock}>
{`{
  "id": 50,
  "clientName": "Maria Santos",
  "tradeName": "Santos Empreendimentos",
  "accountPayable": 2500.00,
  "accountReceivable": 7000.00,
  "balance": 4500.00,
  "totalAmount": 9500.00,
  "dueDate": "2025-12-30T00:00:00.000Z",
  "nextContactDate": "2025-12-10T00:00:00.000Z",
  "contractNumber": "CONT-2025-015",
  "paymentMethod": "pix",
  "status": "pendente",
  "notes": "Primeira cobrança do cliente",
  "contactId": 88,
  "createdBy": 1,
  "createdAt": "2025-12-02T14:30:00.000Z",
  "updatedAt": "2025-12-02T14:30:00.000Z"
}`}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Atualizar Cobrança */}
          <Accordion className={classes.accordion}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Chip label="PUT" style={{ backgroundColor: "#ff9800", color: "white" }} className={classes.methodChip} size="small" />
              <Typography variant="h6">Atualizar Cobrança</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box width="100%">
                <Typography variant="body2" paragraph>
                  Atualiza os dados de uma cobrança existente.
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  <strong>Endpoint:</strong>
                </Typography>
                <Box className={classes.endpoint}>
                  PUT {baseURL}/billings/:billingId
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  <strong>Headers:</strong>
                </Typography>
                <Box className={classes.codeBlock}>
                  Authorization: Bearer SEU_TOKEN{"\n"}
                  Content-Type: application/json
                </Box>

                <Typography className={classes.exampleTitle}>
                  Exemplo de Request:
                </Typography>
                <Box className={classes.codeBlock}>
{`PUT ${baseURL}/billings/50

{
  "status": "pago",
  "notes": "Pagamento recebido via PIX"
}`}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Adicionar Histórico */}
          <Accordion className={classes.accordion}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Chip label="POST" color="primary" className={classes.methodChip} size="small" />
              <Typography variant="h6">Adicionar Histórico de Contato</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box width="100%">
                <Typography variant="body2" paragraph>
                  Adiciona um registro de contato ao histórico da cobrança.
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  <strong>Endpoint:</strong>
                </Typography>
                <Box className={classes.endpoint}>
                  POST {baseURL}/billings/:billingId/history
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  <strong>Headers:</strong>
                </Typography>
                <Box className={classes.codeBlock}>
                  Authorization: Bearer SEU_TOKEN{"\n"}
                  Content-Type: application/json
                </Box>

                <Typography variant="subtitle2" gutterBottom style={{ marginTop: 16 }}>
                  <strong>Parâmetros do Body:</strong>
                </Typography>
                <ParamTable
                  params={[
                    { name: "contactDate", type: "datetime", required: true, description: "Data e hora do contato" },
                    { name: "contactType", type: "string", required: true, description: "Tipo: telefone, email, whatsapp, presencial, outro" },
                    { name: "description", type: "string", required: true, description: "Descrição do contato" },
                    { name: "newStatus", type: "string", required: false, description: "Novo status da cobrança (se mudou)" },
                    { name: "amountPaid", type: "number", required: false, description: "Valor pago neste contato" },
                  ]}
                />

                <Typography className={classes.exampleTitle}>
                  Exemplo de Request:
                </Typography>
                <Box className={classes.codeBlock}>
{`{
  "contactDate": "2025-12-02T15:00:00.000Z",
  "contactType": "whatsapp",
  "description": "Cliente confirmou pagamento para amanhã",
  "newStatus": "aguardando_cliente",
  "amountPaid": 0
}`}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Obter Relatório */}
          <Accordion className={classes.accordion}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Chip label="GET" style={{ backgroundColor: "#4caf50", color: "white" }} className={classes.methodChip} size="small" />
              <Typography variant="h6">Obter Relatório</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box width="100%">
                <Typography variant="body2" paragraph>
                  Gera relatório de cobranças por período.
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  <strong>Endpoint:</strong>
                </Typography>
                <Box className={classes.endpoint}>
                  GET {baseURL}/billings-report
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  <strong>Headers:</strong>
                </Typography>
                <Box className={classes.codeBlock}>
                  Authorization: Bearer SEU_TOKEN
                </Box>

                <Typography variant="subtitle2" gutterBottom style={{ marginTop: 16 }}>
                  <strong>Query Parameters:</strong>
                </Typography>
                <ParamTable
                  params={[
                    { name: "period", type: "string", required: true, description: "Período: daily, weekly, monthly" },
                    { name: "date", type: "date", required: false, description: "Data de referência (YYYY-MM-DD)" },
                  ]}
                />

                <Typography className={classes.exampleTitle}>
                  Exemplo de Request:
                </Typography>
                <Box className={classes.codeBlock}>
                  GET {baseURL}/billings-report?period=monthly&date=2025-12-01
                </Box>

                <Typography className={classes.exampleTitle}>
                  Resposta de Sucesso (200):
                </Typography>
                <Box className={classes.codeBlock}>
{`{
  "period": "monthly",
  "date": "2025-12-01",
  "summary": {
    "totalBillings": 120,
    "totalAmount": 450000.00,
    "totalAccountPayable": 180000.00,
    "totalAccountReceivable": 270000.00,
    "totalBalance": 90000.00,
    "totalContacts": 245
  },
  "byStatus": {
    "pendente": { "count": 45, "totalAmount": 180000.00 },
    "pago": { "count": 30, "totalAmount": 120000.00 },
    "aguardando_cliente": { "count": 20, "totalAmount": 75000.00 },
    "andamento_com_parcelamento": { "count": 15, "totalAmount": 50000.00 },
    "cancelado": { "count": 10, "totalAmount": 25000.00 }
  }
}`}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        </TabPanel>

        <Divider style={{ margin: "32px 0" }} />

        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Informações Importantes
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>
                <strong>Autenticação:</strong> Todas as requisições devem incluir o header{" "}
                <code>Authorization: Bearer SEU_TOKEN</code>
              </li>
              <li>
                <strong>Formato de Datas:</strong> Use formato ISO 8601 (ex: 2025-12-31T23:59:59.000Z)
              </li>
              <li>
                <strong>Números de Telefone:</strong> Devem incluir código do país sem caracteres especiais (ex: 5511999999999)
              </li>
              <li>
                <strong>Códigos de Erro:</strong>
                <ul>
                  <li><strong>400:</strong> Requisição inválida (parâmetros incorretos)</li>
                  <li><strong>401:</strong> Não autenticado (token inválido ou ausente)</li>
                  <li><strong>403:</strong> Sem permissão para acessar este recurso</li>
                  <li><strong>404:</strong> Recurso não encontrado</li>
                  <li><strong>500:</strong> Erro interno do servidor</li>
                </ul>
              </li>
              <li>
                <strong>Rate Limiting:</strong> A API possui limite de requisições por minuto. Implemente retry logic com backoff exponencial.
              </li>
            </ul>
          </Typography>
        </Box>
      </Paper>
    </MainContainer>
  );
};

export default MessagesAPI;
