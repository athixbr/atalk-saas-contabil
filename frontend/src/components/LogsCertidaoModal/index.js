import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Collapse,
  makeStyles
} from "@material-ui/core";
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as TimeoutIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from "@material-ui/icons";
import api from "../../services/api";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    minWidth: "800px",
    maxWidth: "90vw"
  },
  statusChip: {
    fontWeight: 600
  },
  successChip: {
    backgroundColor: theme.palette.success.main,
    color: "#fff"
  },
  errorChip: {
    backgroundColor: theme.palette.error.main,
    color: "#fff"
  },
  timeoutChip: {
    backgroundColor: theme.palette.warning.main,
    color: "#fff"
  },
  processingChip: {
    backgroundColor: theme.palette.info.main,
    color: "#fff"
  },
  detailsRow: {
    backgroundColor: theme.palette.grey[50]
  },
  jsonBlock: {
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(1),
    borderRadius: 4,
    fontSize: "12px",
    fontFamily: "monospace",
    maxHeight: "300px",
    overflow: "auto",
    whiteSpace: "pre-wrap",
    wordBreak: "break-all"
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(4)
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: theme.palette.text.secondary
  }
}));

const LogsCertidaoModal = ({ open, onClose, certidaoId, titulo }) => {
  const classes = useStyles();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    if (open && certidaoId) {
      loadLogs();
    }
  }, [open, certidaoId]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/certidoes/${certidaoId}/logs`);
      setLogs(data.logs || []);
    } catch (err) {
      console.error("Erro ao carregar logs:", err);
      toast.error("Erro ao carregar logs da certidão");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRow = (logId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [logId]: !prev[logId]
    }));
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      sucesso: {
        label: "Sucesso",
        icon: <SuccessIcon style={{ fontSize: 16 }} />,
        className: classes.successChip
      },
      erro: {
        label: "Erro",
        icon: <ErrorIcon style={{ fontSize: 16 }} />,
        className: classes.errorChip
      },
      timeout: {
        label: "Timeout",
        icon: <TimeoutIcon style={{ fontSize: 16 }} />,
        className: classes.timeoutChip
      },
      em_processamento: {
        label: "Processando",
        icon: <CircularProgress size={14} style={{ color: "#fff" }} />,
        className: classes.processingChip
      }
    };

    const config = statusConfig[status] || statusConfig.erro;

    return (
      <Chip
        icon={config.icon}
        label={config.label}
        size="small"
        className={`${classes.statusChip} ${config.className}`}
      />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatTempo = (ms) => {
    if (!ms) return "-";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatCusto = (custo) => {
    if (!custo) return "-";
    return `R$ ${parseFloat(custo).toFixed(2)}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      classes={{ paper: classes.dialogPaper }}
    >
      <DialogTitle>
        <Typography variant="h6" style={{ fontWeight: 700 }}>
          {titulo || "Logs da Certidão"}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <div className={classes.loadingContainer}>
            <CircularProgress />
          </div>
        ) : logs.length === 0 ? (
          <div className={classes.emptyState}>
            <Typography variant="body1">
              Nenhum log encontrado para esta certidão
            </Typography>
          </div>
        ) : (
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell style={{ width: 50 }}></TableCell>
                  <TableCell>Data/Hora</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Tentativa</TableCell>
                  <TableCell>Tempo</TableCell>
                  <TableCell>Custo</TableCell>
                  <TableCell>Erro</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <TableRow hover>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleRow(log.id)}
                        >
                          {expandedRows[log.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>{formatDate(log.createdAt)}</TableCell>
                      <TableCell>{getStatusChip(log.status)}</TableCell>
                      <TableCell>{log.tentativa}</TableCell>
                      <TableCell>{formatTempo(log.tempoResposta)}</TableCell>
                      <TableCell>{formatCusto(log.custoConsulta)}</TableCell>
                      <TableCell>
                        {log.codigoErro || "-"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={7} style={{ paddingBottom: 0, paddingTop: 0 }}>
                        <Collapse in={expandedRows[log.id]} timeout="auto" unmountOnExit>
                          <Box margin={2}>
                            {log.mensagemErro && (
                              <Box mb={2}>
                                <Typography variant="subtitle2" gutterBottom style={{ fontWeight: 600 }}>
                                  Mensagem de Erro:
                                </Typography>
                                <Typography variant="body2" color="error">
                                  {log.mensagemErro}
                                </Typography>
                              </Box>
                            )}

                            {log.requestData && (
                              <Box mb={2}>
                                <Typography variant="subtitle2" gutterBottom style={{ fontWeight: 600 }}>
                                  Dados Enviados:
                                </Typography>
                                <div className={classes.jsonBlock}>
                                  {JSON.stringify(log.requestData, null, 2)}
                                </div>
                              </Box>
                            )}

                            {log.responseData && (
                              <Box mb={2}>
                                <Typography variant="subtitle2" gutterBottom style={{ fontWeight: 600 }}>
                                  Resposta da API:
                                </Typography>
                                <div className={classes.jsonBlock}>
                                  {JSON.stringify(log.responseData, null, 2)}
                                </div>
                              </Box>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogsCertidaoModal;
