import React, { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import {
  AddCircle,
  CalendarTick,
  Cpu,
  DocumentText,
  MagicStar,
  People,
  Profile2User,
  Send2,
  TaskSquare,
  TickCircle,
} from "iconsax-react";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "calc(100vh - 96px)",
    padding: theme.spacing(3),
    background: "#f6f8fb",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  titleWrap: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  titleIcon: {
    width: 48,
    height: 48,
    color: "#fff",
    background: "#065183",
  },
  statusChip: {
    background: "#e9f7ef",
    color: "#1b7f45",
    fontWeight: 700,
  },
  shell: {
    minHeight: 640,
  },
  chatPanel: {
    height: "100%",
    minHeight: 640,
    display: "flex",
    flexDirection: "column",
    borderRadius: 8,
    overflow: "hidden",
  },
  chatHeader: {
    padding: theme.spacing(2),
    background: "#ffffff",
    borderBottom: "1px solid #e6ebf1",
  },
  messages: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "auto",
    background: "#fbfcfe",
  },
  messageRow: {
    display: "flex",
    marginBottom: theme.spacing(1.5),
  },
  messageUser: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "76%",
    padding: theme.spacing(1.4, 1.7),
    borderRadius: 8,
    fontSize: 14,
    lineHeight: 1.45,
    whiteSpace: "pre-line",
  },
  bubbleAi: {
    background: "#eef5ff",
    color: "#17324d",
    border: "1px solid #d9e9ff",
  },
  bubbleUser: {
    background: "#065183",
    color: "#fff",
  },
  suggestions: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    padding: theme.spacing(0, 2, 1.5),
    background: "#fbfcfe",
  },
  composer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(1.5),
    borderTop: "1px solid #e6ebf1",
    background: "#ffffff",
  },
  sidePanel: {
    borderRadius: 8,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  planHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  metricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1.5),
  },
  metric: {
    padding: theme.spacing(1.2),
    borderRadius: 8,
    background: "#f4f7fb",
    border: "1px solid #e5ebf2",
  },
  previewCard: {
    borderRadius: 8,
    border: "1px solid #e5ebf2",
    padding: theme.spacing(1.5),
    marginTop: theme.spacing(1),
  },
  previewTitle: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    fontWeight: 700,
  },
  actionBar: {
    display: "flex",
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  muted: {
    color: "#6c7a89",
  },
}));

const initialMessages = [
  {
    role: "ai",
    text:
      "Oi, eu sou o Assistente AI. Posso guiar cadastros e configurar tarefas perguntando passo a passo. O que voce quer montar agora?",
  },
  {
    role: "user",
    text:
      "Cadastrar um cliente novo e deixar as tarefas mensais configuradas.",
  },
  {
    role: "ai",
    text:
      "Combinado. Vou confirmar os dados essenciais: cliente pessoa juridica, regime tributario, responsavel interno, socios e recorrencias. Depois mostro um resumo antes de salvar.",
  },
  {
    role: "ai",
    text:
      "Sugestao encontrada nos dados atuais: usar o checklist fiscal padrao e vincular ao departamento Contabil. Quer seguir com essa configuracao?",
  },
];

const planItems = [
  "Criar cliente: Solaris Comercio Ltda",
  "Vincular responsavel: Marina Costa",
  "Adicionar socio administrador: Rafael Nunes",
  "Aplicar checklist fiscal mensal",
  "Criar 3 tarefas recorrentes com vencimento no dia 10",
];

const relatedData = [
  { label: "Clientes consultados", value: "128" },
  { label: "Checklists ativos", value: "14" },
  { label: "Tarefas modelo", value: "36" },
];

const quickPrompts = [
  "Cadastrar cliente",
  "Criar tarefa recorrente",
  "Vincular socio",
  "Configurar checklist",
];

const AssistenteAI = () => {
  const classes = useStyles();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const progress = useMemo(() => (confirmed ? 100 : 72), [confirmed]);

  const handleSend = (text = input) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    setMessages((current) => [
      ...current,
      { role: "user", text: cleanText },
      {
        role: "ai",
        text:
          "Entendi. Vou incluir isso no rascunho e validar com os cadastros existentes antes da confirmacao final.",
      },
    ]);
    setInput("");
  };

  const handleConfirm = () => {
    setConfirmed(true);
    setMessages((current) => [
      ...current,
      {
        role: "ai",
        text:
          "Plano confirmado. Nesta demonstracao eu simulei a gravacao. Na etapa do backend, essa acao chamara as APIs reais de clientes, socios e tarefas.",
      },
    ]);
  };

  return (
    <Box className={classes.root}>
      <Box className={classes.header}>
        <Box className={classes.titleWrap}>
          <Avatar className={classes.titleIcon}>
            <MagicStar size={26} color="#fff" />
          </Avatar>
          <Box>
            <Typography variant="h5">Assistente AI</Typography>
            <Typography variant="body2" className={classes.muted}>
              Configure clientes, socios e tarefas por conversa guiada.
            </Typography>
          </Box>
        </Box>
        <Chip
          className={classes.statusChip}
          icon={<TickCircle size={18} color="#1b7f45" />}
          label="Prototipo visual"
        />
      </Box>

      <Grid container spacing={2} className={classes.shell}>
        <Grid item xs={12} md={8}>
          <Paper elevation={0} className={classes.chatPanel}>
            <Box className={classes.chatHeader}>
              <Typography variant="subtitle1">Conversa de configuracao</Typography>
              <Typography variant="body2" className={classes.muted}>
                A AI pergunta, consulta dados simulados e monta o rascunho antes de salvar.
              </Typography>
            </Box>

            <Box className={classes.messages}>
              {messages.map((message, index) => (
                <Box
                  key={`${message.role}-${index}`}
                  className={`${classes.messageRow} ${
                    message.role === "user" ? classes.messageUser : ""
                  }`}
                >
                  <Box
                    className={`${classes.bubble} ${
                      message.role === "user"
                        ? classes.bubbleUser
                        : classes.bubbleAi
                    }`}
                  >
                    {message.text}
                  </Box>
                </Box>
              ))}
            </Box>

            <Box className={classes.suggestions}>
              {quickPrompts.map((prompt) => (
                <Chip
                  key={prompt}
                  clickable
                  label={prompt}
                  onClick={() => handleSend(prompt)}
                />
              ))}
            </Box>

            <Box className={classes.composer}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Digite uma solicitacao para o Assistente AI"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyPress={(event) => {
                  if (event.key === "Enter") handleSend();
                }}
              />
              <IconButton color="primary" onClick={() => handleSend()}>
                <Send2 size={22} />
              </IconButton>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} className={classes.sidePanel}>
            <Box className={classes.planHeader}>
              <Typography variant="subtitle1">Plano montado pela AI</Typography>
              <Cpu size={22} color="#065183" />
            </Box>
            <LinearProgress variant="determinate" value={progress} />
            <List dense>
              {planItems.map((item) => (
                <ListItem key={item} disableGutters>
                  <ListItemIcon>
                    <TickCircle size={20} color="#1b7f45" />
                  </ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
            <Box className={classes.actionBar}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleConfirm}
                disabled={confirmed}
              >
                {confirmed ? "Confirmado" : "Confirmar"}
              </Button>
              <Button fullWidth variant="outlined">
                Editar
              </Button>
            </Box>
          </Paper>

          <Paper elevation={0} className={classes.sidePanel}>
            <Typography variant="subtitle1">Dados consultados</Typography>
            <Box className={classes.metricGrid}>
              {relatedData.map((item) => (
                <Box key={item.label} className={classes.metric}>
                  <Typography variant="h6">{item.value}</Typography>
                  <Typography variant="caption" className={classes.muted}>
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          <Paper elevation={0} className={classes.sidePanel}>
            <Typography variant="subtitle1">Previa das acoes</Typography>
            <Box className={classes.previewCard}>
              <Typography className={classes.previewTitle}>
                <Profile2User size={18} color="#065183" />
                Cliente
              </Typography>
              <Typography variant="body2" className={classes.muted}>
                Solaris Comercio Ltda, PJ, Simples Nacional.
              </Typography>
            </Box>
            <Box className={classes.previewCard}>
              <Typography className={classes.previewTitle}>
                <People size={18} color="#065183" />
                Socios
              </Typography>
              <Typography variant="body2" className={classes.muted}>
                Rafael Nunes como socio administrador.
              </Typography>
            </Box>
            <Box className={classes.previewCard}>
              <Typography className={classes.previewTitle}>
                <TaskSquare size={18} color="#065183" />
                Tarefas
              </Typography>
              <Typography variant="body2" className={classes.muted}>
                DAS, folha e conciliacao bancaria todo dia 10.
              </Typography>
            </Box>
            <Box className={classes.previewCard}>
              <Typography className={classes.previewTitle}>
                <CalendarTick size={18} color="#065183" />
                Recorrencia
              </Typography>
              <Typography variant="body2" className={classes.muted}>
                Geracao mensal automatica com responsavel interno.
              </Typography>
            </Box>
            <Divider style={{ margin: "16px 0" }} />
            <Button
              fullWidth
              variant="outlined"
              startIcon={<DocumentText size={18} />}
            >
              Ver resumo completo
            </Button>
            <Button
              fullWidth
              color="primary"
              style={{ marginTop: 8 }}
              startIcon={<AddCircle size={18} />}
            >
              Nova configuracao
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AssistenteAI;
