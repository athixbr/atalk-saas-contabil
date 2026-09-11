import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FileCopy as FileCopyIcon,
  Send as SendIcon,
} from "@material-ui/icons";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import EmailTemplateEditor from "./EmailTemplateEditor";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(3),
    width: "100%",
    boxSizing: "border-box",
  },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "auto",
    overflowX: "hidden",
    width: "100%",
    boxSizing: "border-box",
    ...theme.scrollbarStyles,
  },
  tabPanel: {
    padding: theme.spacing(2, 0),
  },
  paper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  configCard: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    border: "1px solid",
    borderColor: theme.palette.divider,
    borderRadius: theme.shape.borderRadius,
    position: "relative",
  },
  providerChip: {
    marginRight: theme.spacing(1),
  },
  actions: {
    display: "flex",
    gap: theme.spacing(1),
  },
  tableContainer: {
    width: "100%",
    overflowX: "auto",
  },
  logStatusSent: {
    color: "#4caf50",
    fontWeight: 600,
  },
  logStatusFailed: {
    color: "#f44336",
    fontWeight: 600,
  },
}));

const PROVIDER_LABELS = {
  resend: "Resend (API Key)",
  smtp: "SMTP Genérico",
  gmail: "Gmail / Google Workspace",
  hotmail: "Hotmail / Outlook",
  exchange: "Microsoft Exchange",
};

const PROVIDER_COLORS = {
  resend: "#7c3aed",
  smtp: "#0284c7",
  gmail: "#ea4335",
  hotmail: "#0078d4",
  exchange: "#107c10",
};

function TabPanel({ children, value, index }) {
  return value === index ? <Box mt={2}>{children}</Box> : null;
}

// ─── Config Dialog ─────────────────────────────────────────────────────────────
function ConfigDialog({ open, onClose, onSave, editing }) {
  const classes = useStyles();
  const emptyForm = {
    provider: "resend",
    name: "",
    fromName: "",
    fromEmail: "",
    apiKey: "",
    smtpHost: "",
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: "",
    smtpPassword: "",
    active: true,
  };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        provider: editing.provider || "resend",
        name: editing.name || "",
        fromName: editing.fromName || "",
        fromEmail: editing.fromEmail || "",
        apiKey: editing.apiKey || "",
        smtpHost: editing.smtpHost || "",
        smtpPort: editing.smtpPort || 587,
        smtpSecure: editing.smtpSecure || false,
        smtpUser: editing.smtpUser || "",
        smtpPassword: editing.smtpPassword || "",
        active: editing.active !== false,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editing, open]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.name || !form.fromEmail) {
      toast.error("Preencha o nome e o e-mail remetente.");
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      toastError(err);
    } finally {
      setSaving(false);
    }
  };

  const isResend = form.provider === "resend";
  const isSmtpBased = ["smtp", "gmail", "hotmail", "exchange"].includes(form.provider);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editing ? "Editar Configuração" : "Nova Configuração de E-mail"}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Provedor</InputLabel>
              <Select
                value={form.provider}
                onChange={handleChange("provider")}
                label="Provedor"
              >
                {Object.entries(PROVIDER_LABELS).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Nome da configuração"
              value={form.name}
              onChange={handleChange("name")}
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Ex: E-mail principal"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Nome do remetente"
              value={form.fromName}
              onChange={handleChange("fromName")}
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Seu Escritório"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="E-mail remetente"
              value={form.fromEmail}
              onChange={handleChange("fromEmail")}
              fullWidth
              size="small"
              variant="outlined"
              placeholder="contato@empresa.com"
              required
            />
          </Grid>

          {isResend && (
            <Grid item xs={12}>
              <TextField
                label="API Key do Resend"
                value={form.apiKey}
                onChange={handleChange("apiKey")}
                fullWidth
                size="small"
                variant="outlined"
                placeholder="re_xxxxxxxxxxxx"
                type="password"
              />
            </Grid>
          )}

          {isSmtpBased && form.provider !== "gmail" && form.provider !== "hotmail" && (
            <>
              <Grid item xs={8}>
                <TextField
                  label="Servidor SMTP"
                  value={form.smtpHost}
                  onChange={handleChange("smtpHost")}
                  fullWidth
                  size="small"
                  variant="outlined"
                  placeholder="smtp.empresa.com"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Porta"
                  value={form.smtpPort}
                  onChange={handleChange("smtpPort")}
                  fullWidth
                  size="small"
                  variant="outlined"
                  type="number"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.smtpSecure}
                      onChange={handleChange("smtpSecure")}
                      color="primary"
                    />
                  }
                  label="Usar SSL/TLS"
                />
              </Grid>
            </>
          )}

          {isSmtpBased && (
            <>
              <Grid item xs={12}>
                <TextField
                  label="Usuário"
                  value={form.smtpUser}
                  onChange={handleChange("smtpUser")}
                  fullWidth
                  size="small"
                  variant="outlined"
                  placeholder="usuario@empresa.com"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Senha"
                  value={form.smtpPassword}
                  onChange={handleChange("smtpPassword")}
                  fullWidth
                  size="small"
                  variant="outlined"
                  type="password"
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.active}
                  onChange={handleChange("active")}
                  color="primary"
                />
              }
              label="Configuração ativa"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button onClick={handleSave} color="primary" variant="contained" disabled={saving}>
          {saving ? <CircularProgress size={20} /> : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Test Send Dialog ─────────────────────────────────────────────────────────
function TestSendDialog({ open, onClose, onSend, title }) {
  const [to, setTo] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) setTo("");
  }, [open]);

  const handleSend = async () => {
    if (!to) {
      toast.error("Informe o e-mail de destino.");
      return;
    }
    setSending(true);
    try {
      await onSend(to);
      onClose();
    } catch (err) {
      toastError(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title || "Enviar Teste"}</DialogTitle>
      <DialogContent>
        <TextField
          label="E-mail de destino"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          fullWidth
          size="small"
          variant="outlined"
          placeholder="destinatario@email.com"
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={sending}>Cancelar</Button>
        <Button onClick={handleSend} color="primary" variant="contained" disabled={sending}>
          {sending ? <CircularProgress size={20} /> : "Enviar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Duplicate Template Dialog ────────────────────────────────────────────────
function DuplicateTemplateDialog({ open, onClose, onDuplicate, source }) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && source) {
      setTitle(`${source.title} (cópia)`);
      setSubject(source.subject || "");
    }
  }, [open, source]);

  const handleSave = async () => {
    if (!title || !subject) {
      toast.error("Preencha o nome e o assunto do template.");
      return;
    }
    setSaving(true);
    try {
      await onDuplicate({ title, subject });
      onClose();
    } catch (err) {
      toastError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Duplicar Template</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Nome do template"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              autoFocus
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Assunto"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              helperText="Você pode usar variáveis, ex: {{competencia}}, {{razaoSocial}}"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button onClick={handleSave} color="primary" variant="contained" disabled={saving}>
          {saving ? <CircularProgress size={20} /> : "Duplicar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const ConfigEmail = () => {
  const classes = useStyles();
  const [tab, setTab] = useState(0);

  // Configs
  const [configs, setConfigs] = useState([]);
  const [loadingConfigs, setLoadingConfigs] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [testConfigId, setTestConfigId] = useState(null);

  // Templates
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [testTemplateId, setTestTemplateId] = useState(null);
  const [duplicatingTemplate, setDuplicatingTemplate] = useState(null);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);

  // Logs
  const [logs, setLogs] = useState([]);
  const [logsCount, setLogsCount] = useState(0);
  const [logsPage, setLogsPage] = useState(0);
  const [logsPerPage, setLogsPerPage] = useState(20);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchConfigs = useCallback(async () => {
    setLoadingConfigs(true);
    try {
      const { data } = await api.get("/email-configs");
      setConfigs(data);
    } catch (err) {
      toastError(err);
    } finally {
      setLoadingConfigs(false);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const { data } = await api.get("/email-templates");
      setTemplates(data);
    } catch (err) {
      toastError(err);
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const { data } = await api.get("/email-logs", {
        params: { page: logsPage + 1, limit: logsPerPage },
      });
      setLogs(data.logs);
      setLogsCount(data.count);
    } catch (err) {
      toastError(err);
    } finally {
      setLoadingLogs(false);
    }
  }, [logsPage, logsPerPage]);

  useEffect(() => {
    fetchConfigs();
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (tab === 2) fetchLogs();
  }, [tab, logsPage, logsPerPage]);

  // ── Config actions ──
  const handleSaveConfig = async (form) => {
    if (editingConfig) {
      await api.put(`/email-configs/${editingConfig.id}`, form);
      toast.success("Configuração atualizada!");
    } else {
      await api.post("/email-configs", form);
      toast.success("Configuração criada!");
    }
    fetchConfigs();
  };

  const handleDeleteConfig = async (id) => {
    if (!window.confirm("Remover esta configuração?")) return;
    try {
      await api.delete(`/email-configs/${id}`);
      toast.success("Configuração removida.");
      fetchConfigs();
    } catch (err) {
      toastError(err);
    }
  };

  const handleTestConfig = async (to) => {
    await api.post(`/email-configs/${testConfigId}/send-test`, { to });
    toast.success("E-mail de teste enviado!");
  };

  // ── Template actions ──
  const handleSaveTemplate = async (form) => {
    if (editingTemplate) {
      await api.put(`/email-templates/${editingTemplate.id}`, form);
      toast.success("Template atualizado!");
    } else {
      await api.post("/email-templates", form);
      toast.success("Template criado!");
    }
    fetchTemplates();
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm("Remover este template?")) return;
    try {
      await api.delete(`/email-templates/${id}`);
      toast.success("Template removido.");
      fetchTemplates();
    } catch (err) {
      toastError(err);
    }
  };

  const handleTestTemplate = async (to) => {
    await api.post(`/email-templates/${testTemplateId}/send-test`, { to });
    toast.success("E-mail de teste enviado!");
  };

  const handleDuplicateTemplate = async ({ title, subject }) => {
    const { data } = await api.post("/email-templates", {
      title,
      subject,
      body: duplicatingTemplate.body,
      design: duplicatingTemplate.design,
    });
    toast.success("Template duplicado!");
    await fetchTemplates();
    setEditingTemplate(data);
    setTemplateDialogOpen(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("pt-BR");
  };

  return (
    <div className={classes.mainContainer}>
      <MainHeader>
        <Title>Configuração de E-mail</Title>
        <MainHeaderButtonsWrapper>
          {tab === 0 && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => { setEditingConfig(null); setConfigDialogOpen(true); }}
            >
              Nova Configuração
            </Button>
          )}
          {tab === 1 && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => { setEditingTemplate(null); setTemplateDialogOpen(true); }}
            >
              Novo Template
            </Button>
          )}
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Configurações" />
          <Tab label="Templates" />
          <Tab label="Logs" />
        </Tabs>

        <Divider />

        {/* ─── ABA: CONFIGURAÇÕES ─── */}
        <TabPanel value={tab} index={0}>
          {loadingConfigs ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : configs.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Typography color="textSecondary">
                Nenhuma configuração de e-mail cadastrada.
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                style={{ marginTop: 16 }}
                onClick={() => { setEditingConfig(null); setConfigDialogOpen(true); }}
              >
                Adicionar primeira configuração
              </Button>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {configs.map((config) => (
                <Grid item xs={12} md={6} key={config.id}>
                  <Paper className={classes.configCard} variant="outlined">
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                          {config.name}
                        </Typography>
                        <Box mt={0.5} display="flex" alignItems="center" flexWrap="wrap" gap={1}>
                          <Chip
                            label={PROVIDER_LABELS[config.provider] || config.provider}
                            size="small"
                            className={classes.providerChip}
                            style={{
                              backgroundColor: PROVIDER_COLORS[config.provider] + "22",
                              color: PROVIDER_COLORS[config.provider],
                              border: `1px solid ${PROVIDER_COLORS[config.provider]}`,
                              fontWeight: 600,
                            }}
                          />
                          {!config.active && (
                            <Chip label="Inativa" size="small" color="default" />
                          )}
                        </Box>
                        <Typography variant="body2" color="textSecondary" style={{ marginTop: 4 }}>
                          {config.fromName ? `${config.fromName} <${config.fromEmail}>` : config.fromEmail}
                        </Typography>
                      </Box>
                      <Box className={classes.actions}>
                        <Tooltip title="Enviar e-mail de teste">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => setTestConfigId(config.id)}
                          >
                            <SendIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => { setEditingConfig(config); setConfigDialogOpen(true); }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remover">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleDeleteConfig(config.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* ─── ABA: TEMPLATES ─── */}
        <TabPanel value={tab} index={1}>
          {loadingTemplates ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : templates.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Typography color="textSecondary">
                Nenhum template cadastrado.
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                style={{ marginTop: 16 }}
                onClick={() => { setEditingTemplate(null); setTemplateDialogOpen(true); }}
              >
                Adicionar primeiro template
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined" className={classes.tableContainer}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Nome</strong></TableCell>
                    <TableCell><strong>Assunto</strong></TableCell>
                    <TableCell><strong>Criado em</strong></TableCell>
                    <TableCell align="right"><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {templates.map((tpl) => (
                    <TableRow key={tpl.id} hover>
                      <TableCell>{tpl.title}</TableCell>
                      <TableCell>{tpl.subject}</TableCell>
                      <TableCell>{formatDate(tpl.createdAt)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Enviar teste">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => setTestTemplateId(tpl.id)}
                          >
                            <SendIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => { setEditingTemplate(tpl); setTemplateDialogOpen(true); }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Duplicar">
                          <IconButton
                            size="small"
                            onClick={() => { setDuplicatingTemplate(tpl); setDuplicateDialogOpen(true); }}
                          >
                            <FileCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remover">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleDeleteTemplate(tpl.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* ─── ABA: LOGS ─── */}
        <TabPanel value={tab} index={2}>
          {loadingLogs ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined" className={classes.tableContainer}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Data</strong></TableCell>
                      <TableCell><strong>Destinatário</strong></TableCell>
                      <TableCell><strong>Assunto</strong></TableCell>
                      <TableCell><strong>Provedor</strong></TableCell>
                      <TableCell><strong>Template</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Erro</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography color="textSecondary">Nenhum log encontrado.</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log) => (
                        <TableRow key={log.id} hover>
                          <TableCell style={{ whiteSpace: "nowrap" }}>
                            {formatDate(log.createdAt)}
                          </TableCell>
                          <TableCell>{log.toEmail}</TableCell>
                          <TableCell>{log.subject}</TableCell>
                          <TableCell>
                            <Chip
                              label={PROVIDER_LABELS[log.provider] || log.provider || "-"}
                              size="small"
                              style={{ fontSize: "0.65rem" }}
                            />
                          </TableCell>
                          <TableCell>
                            {log.emailTemplate ? log.emailTemplate.title : "-"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                log.status === "sent"
                                  ? classes.logStatusSent
                                  : classes.logStatusFailed
                              }
                            >
                              {log.status === "sent" ? "Enviado" : "Falhou"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {log.errorMessage ? (
                              <Tooltip title={log.errorMessage}>
                                <Typography
                                  variant="caption"
                                  color="error"
                                  style={{
                                    maxWidth: 200,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    display: "block",
                                  }}
                                >
                                  {log.errorMessage}
                                </Typography>
                              </Tooltip>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={logsCount}
                page={logsPage}
                onPageChange={(_, p) => setLogsPage(p)}
                rowsPerPage={logsPerPage}
                onRowsPerPageChange={(e) => {
                  setLogsPerPage(parseInt(e.target.value, 10));
                  setLogsPage(0);
                }}
                labelRowsPerPage="Linhas por página:"
                rowsPerPageOptions={[10, 20, 50]}
              />
            </>
          )}
        </TabPanel>
      </Paper>

      {/* Dialogs */}
      <ConfigDialog
        open={configDialogOpen}
        onClose={() => { setConfigDialogOpen(false); setEditingConfig(null); }}
        onSave={handleSaveConfig}
        editing={editingConfig}
      />

      <EmailTemplateEditor
        open={templateDialogOpen}
        onClose={() => { setTemplateDialogOpen(false); setEditingTemplate(null); }}
        onSave={handleSaveTemplate}
        editing={editingTemplate}
      />

      <TestSendDialog
        open={!!testConfigId}
        onClose={() => setTestConfigId(null)}
        onSend={handleTestConfig}
        title="Teste de Configuração"
      />

      <TestSendDialog
        open={!!testTemplateId}
        onClose={() => setTestTemplateId(null)}
        onSend={handleTestTemplate}
        title="Teste de Template"
      />

      <DuplicateTemplateDialog
        open={duplicateDialogOpen}
        onClose={() => { setDuplicateDialogOpen(false); setDuplicatingTemplate(null); }}
        onDuplicate={handleDuplicateTemplate}
        source={duplicatingTemplate}
      />
    </div>
  );
};

export default ConfigEmail;
