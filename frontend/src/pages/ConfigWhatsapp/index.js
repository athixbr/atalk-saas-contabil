import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import StarIcon from "@material-ui/icons/Star";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import AddIcon from "@material-ui/icons/Add";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import { toast } from "react-toastify";
import api from "../../services/api";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import WhatsappTemplateEditor from "./WhatsappTemplateEditor";

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
    padding: theme.spacing(0, 2, 2),
    overflowY: "auto",
    overflowX: "hidden",
    width: "100%",
    boxSizing: "border-box",
    ...theme.scrollbarStyles,
  },
  tabContent: { padding: theme.spacing(3) },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  addButton: {
    background: "linear-gradient(135deg,#25d366 0%,#128c7e 100%)",
    color: "#fff",
    "&:hover": { background: "linear-gradient(135deg,#128c7e 0%,#075e54 100%)" },
  },
  statusChip: { fontSize: "0.7rem" },
  connectionCard: {
    border: "1px solid #e0e0e0",
    borderRadius: 8,
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1.5),
    "&.default": {
      border: "2px solid #25d366",
      background: "#f1fff6",
    },
  },
  connInfo: { display: "flex", alignItems: "center", gap: theme.spacing(1.5) },
  whatsappIcon: { color: "#25d366", fontSize: 32 },
  tableContainer: {
    width: "100%",
    overflowX: "auto",
  },
  logStatus: {
    "&.sent": { color: "#2e7d32", fontWeight: 700 },
    "&.failed": { color: "#c62828", fontWeight: 700 },
  },
}));

function TabPanel({ children, value, index }) {
  return value === index ? <Box>{children}</Box> : null;
}

// ─── Delete Confirm Dialog ───────────────────────────────────────
function DeleteDialog({ open, onClose, onConfirm, title }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Excluir template</DialogTitle>
      <DialogContent>
        <Typography>Deseja excluir o template <strong>{title}</strong>?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={onConfirm} variant="contained" color="secondary">Excluir</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export default function ConfigWhatsapp() {
  const classes = useStyles();
  const [tab, setTab] = useState(0);

  // Conexões
  const [connections, setConnections] = useState([]);

  // Templates
  const [templates, setTemplates] = useState([]);
  const [templateDialog, setTemplateDialog] = useState({ open: false, template: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, template: null });

  // Logs
  const [logs, setLogs] = useState([]);
  const [logPage, setLogPage] = useState(1);
  const [logPages, setLogPages] = useState(1);
  const [logCount, setLogCount] = useState(0);
  const [logLoading, setLogLoading] = useState(false);

  const loadConnections = useCallback(async () => {
    try {
      const { data } = await api.get("/whatsapp-connections-notif");
      setConnections(data.connections || []);
    } catch {
      toast.error("Erro ao carregar conexões");
    }
  }, []);

  const loadTemplates = useCallback(async () => {
    try {
      const { data } = await api.get("/whatsapp-templates");
      setTemplates(data.whatsappTemplates || []);
    } catch {
      toast.error("Erro ao carregar templates");
    }
  }, []);

  const loadLogs = useCallback(async (page = 1) => {
    setLogLoading(true);
    try {
      const { data } = await api.get(`/whatsapp-logs?page=${page}&limit=20`);
      setLogs(data.whatsappLogs || []);
      setLogCount(data.count || 0);
      setLogPages(data.pages || 1);
    } catch {
      toast.error("Erro ao carregar logs");
    } finally {
      setLogLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConnections();
    loadTemplates();
  }, [loadConnections, loadTemplates]);

  useEffect(() => {
    if (tab === 2) loadLogs(logPage);
  }, [tab, logPage, loadLogs]);

  // ── Conexões ──────────────────────────────────────────────────
  const handleSetDefault = async (conn) => {
    try {
      if (conn.isDefaultNotification) {
        await api.put("/whatsapp-connections-notif/unset-default");
        toast.success("Padrão removido");
      } else {
        await api.put(`/whatsapp-connections-notif/${conn.id}/set-default`);
        toast.success(`"${conn.name}" definida como padrão de notificação`);
      }
      loadConnections();
    } catch {
      toast.error("Erro ao atualizar conexão");
    }
  };

  const statusColor = (status) => {
    if (status === "CONNECTED") return "primary";
    if (status === "OPENING") return "default";
    return "secondary";
  };

  // ── Templates ─────────────────────────────────────────────────
  const handleSaveTemplate = async ({ title, body }) => {
    if (templateDialog.template) {
      await api.put(`/whatsapp-templates/${templateDialog.template.id}`, { title, body });
      toast.success("Template atualizado");
    } else {
      await api.post("/whatsapp-templates", { title, body });
      toast.success("Template criado");
    }
    loadTemplates();
  };

  const handleDeleteTemplate = async () => {
    try {
      await api.delete(`/whatsapp-templates/${deleteDialog.template.id}`);
      toast.success("Template excluído");
      setDeleteDialog({ open: false, template: null });
      loadTemplates();
    } catch {
      toast.error("Erro ao excluir template");
    }
  };

  return (
    <div className={classes.mainContainer}>
      <MainHeader>
        <Title>WhatsApp - Notificações</Title>
        <MainHeaderButtonsWrapper>
          {tab === 1 && (
            <Button
              variant="contained"
              className={classes.addButton}
              startIcon={<AddIcon />}
              onClick={() => setTemplateDialog({ open: true, template: null })}
            >
              Novo Template
            </Button>
          )}
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <Tabs value={tab} onChange={(_, v) => setTab(v)} indicatorColor="primary" textColor="primary">
          <Tab label="Conexões" />
          <Tab label="Templates" />
          <Tab label="Logs" />
        </Tabs>

        {/* ── ABA 0: CONEXÕES ────────────────────────────────── */}
        <TabPanel value={tab} index={0}>
          <Box className={classes.tabContent}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Selecione qual conexão será usada por padrão para envio de notificações de tarefas recorrentes.
            </Typography>

            {connections.length === 0 ? (
              <Box py={4} textAlign="center">
                <WhatsAppIcon style={{ fontSize: 48, color: "#ccc" }} />
                <Typography color="textSecondary" style={{ marginTop: 8 }}>
                  Nenhuma conexão WhatsApp encontrada. Acesse Conexões para adicionar.
                </Typography>
              </Box>
            ) : (
              connections.map((conn) => (
                <Box
                  key={conn.id}
                  className={`${classes.connectionCard}${conn.isDefaultNotification ? " default" : ""}`}
                >
                  <Box className={classes.connInfo}>
                    <WhatsAppIcon className={classes.whatsappIcon} />
                    <Box>
                      <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                        {conn.name}
                        {conn.isDefaultNotification && (
                          <Chip
                            label="Padrão"
                            size="small"
                            style={{ marginLeft: 8, background: "#25d366", color: "#fff" }}
                          />
                        )}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {conn.number || "Número não informado"}
                      </Typography>
                    </Box>
                    <Chip
                      label={conn.status || "—"}
                      size="small"
                      color={statusColor(conn.status)}
                      className={classes.statusChip}
                    />
                  </Box>
                  <Tooltip title={conn.isDefaultNotification ? "Remover como padrão" : "Definir como padrão"}>
                    <IconButton onClick={() => handleSetDefault(conn)}>
                      {conn.isDefaultNotification
                        ? <StarIcon style={{ color: "#f9a825" }} />
                        : <StarBorderIcon />}
                    </IconButton>
                  </Tooltip>
                </Box>
              ))
            )}
          </Box>
        </TabPanel>

        {/* ── ABA 1: TEMPLATES ───────────────────────────────── */}
        <TabPanel value={tab} index={1}>
          <Box className={classes.tabContent}>
            <Box className={classes.headerRow}>
              <Typography variant="h6">Templates de Mensagem</Typography>
            </Box>

            {templates.length === 0 ? (
              <Box py={4} textAlign="center">
                <Typography color="textSecondary">Nenhum template cadastrado.</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined" className={classes.tableContainer}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Título</TableCell>
                      <TableCell>Pré-visualização</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {templates.map((t) => (
                      <TableRow key={t.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2">{t.title}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="textSecondary" style={{ maxWidth: 500 }}>
                            {t.body.length > 120 ? t.body.substring(0, 120) + "…" : t.body}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => setTemplateDialog({ open: true, template: t })}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton size="small" onClick={() => setDeleteDialog({ open: true, template: t })}>
                              <DeleteIcon fontSize="small" color="error" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </TabPanel>

        {/* ── ABA 2: LOGS ────────────────────────────────────── */}
        <TabPanel value={tab} index={2}>
          <Box className={classes.tabContent}>
            <Box className={classes.headerRow}>
              <Typography variant="h6">
                Logs de Envio
                {logCount > 0 && (
                  <Typography component="span" variant="body2" color="textSecondary" style={{ marginLeft: 8 }}>
                    ({logCount} registros)
                  </Typography>
                )}
              </Typography>
            </Box>

            {logLoading ? (
              <Box py={4} textAlign="center"><CircularProgress /></Box>
            ) : logs.length === 0 ? (
              <Box py={4} textAlign="center">
                <Typography color="textSecondary">Nenhum log encontrado.</Typography>
              </Box>
            ) : (
              <>
                <TableContainer component={Paper} variant="outlined" className={classes.tableContainer}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Data</TableCell>
                        <TableCell>Para</TableCell>
                        <TableCell>Conexão</TableCell>
                        <TableCell>Template</TableCell>
                        <TableCell>Mensagem</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Erro</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id} hover>
                          <TableCell style={{ whiteSpace: "nowrap" }}>
                            {new Date(log.createdAt).toLocaleString("pt-BR")}
                          </TableCell>
                          <TableCell>{log.to}</TableCell>
                          <TableCell>{log.whatsapp?.name || "—"}</TableCell>
                          <TableCell>{log.whatsappTemplate?.title || "—"}</TableCell>
                          <TableCell>
                            <Typography variant="body2" style={{ maxWidth: 220 }}>
                              {log.body?.length > 60 ? log.body.substring(0, 60) + "…" : log.body}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <span className={`${classes.logStatus} ${log.status}`}>
                              {log.status === "sent" ? "✓ Enviado" : "✗ Falhou"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="error">{log.errorMessage || ""}</Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {logPages > 1 && (
                  <Box display="flex" justifyContent="center" alignItems="center" mt={2} gap={2}>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={logPage <= 1}
                      onClick={() => setLogPage((p) => p - 1)}
                    >
                      Anterior
                    </Button>
                    <Typography variant="body2">Página {logPage} de {logPages}</Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={logPage >= logPages}
                      onClick={() => setLogPage((p) => p + 1)}
                    >
                      Próxima
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Box>
        </TabPanel>
      </Paper>

      <WhatsappTemplateEditor
        open={templateDialog.open}
        onClose={() => setTemplateDialog({ open: false, template: null })}
        editing={templateDialog.template}
        onSave={handleSaveTemplate}
      />

      <DeleteDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, template: null })}
        onConfirm={handleDeleteTemplate}
        title={deleteDialog.template?.title}
      />
    </div>
  );
}
