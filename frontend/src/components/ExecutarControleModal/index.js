import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Divider,
  CircularProgress,
  Chip,
  Paper,
  IconButton,
  Collapse,
} from "@material-ui/core";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from "@material-ui/lab";
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  dialog: {
    "& .MuiDialog-paper": {
      minWidth: "600px",
      maxWidth: "800px",
    },
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  content: {
    padding: theme.spacing(3),
  },
  section: {
    marginBottom: theme.spacing(3),
  },
  statusChip: {
    marginLeft: theme.spacing(1),
  },
  timelinePaper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  historicoSection: {
    marginTop: theme.spacing(2),
    backgroundColor: theme.palette.grey[50],
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
  },
  expandButton: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
  },
}));

const statusOptions = [
  { value: "pendente", label: "Pendente", color: "default", icon: <PauseIcon /> },
  { value: "em_andamento", label: "Em Andamento", color: "primary", icon: <PlayArrowIcon /> },
  { value: "concluida", label: "Concluída", color: "success", icon: <CheckCircleIcon /> },
  { value: "cancelada", label: "Cancelada", color: "error", icon: <CancelIcon /> },
];

const ExecutarControleModal = ({ open, onClose, tarefa, onUpdate }) => {
  const classes = useStyles();
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(tarefa?.status || "pendente");
  const [dataConclusao, setDataConclusao] = useState("");
  const [observacao, setObservacao] = useState("");
  const [historico, setHistorico] = useState([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);

  useEffect(() => {
    if (open && tarefa) {
      setStatus(tarefa.status);
      // Se já tiver data de conclusão, usar ela
      if (tarefa.dataConclusao) {
        setDataConclusao(format(parseISO(tarefa.dataConclusao), "yyyy-MM-dd'T'HH:mm"));
      } else {
        // Senão, usar data/hora atual como padrão
        setDataConclusao(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
      }
      setObservacao("");
      
      // Buscar histórico
      if (showHistorico) {
        fetchHistorico();
      }
    }
  }, [open, tarefa, showHistorico]);

  const fetchHistorico = async () => {
    if (!tarefa) return;
    
    setLoadingHistorico(true);
    try {
      const { data } = await api.get(`/tarefas-geradas/${tarefa.id}/historico`);
      setHistorico(data.historico || []);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      toast.error("Erro ao buscar histórico");
    } finally {
      setLoadingHistorico(false);
    }
  };

  const handleSave = async () => {
    if (!tarefa) return;

    setLoading(true);
    try {
      const payload = {
        status,
        observacoes: observacao,
      };

      // Se marcar como concluída, enviar data de conclusão
      if (status === "concluida") {
        payload.dataConclusao = dataConclusao;
      }

      const { data } = await api.put(`/tarefas-geradas/${tarefa.id}/status`, payload);
      
      toast.success("Status atualizado com sucesso!");
      onUpdate && onUpdate(data);
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statusValue) => {
    const option = statusOptions.find((opt) => opt.value === statusValue);
    return option?.color || "default";
  };

  const getStatusLabel = (statusValue) => {
    const option = statusOptions.find((opt) => opt.value === statusValue);
    return option?.label || statusValue;
  };

  const formatHistoricoData = (dataString) => {
    try {
      return format(parseISO(dataString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dataString;
    }
  };

  const getHistoricoIcon = (item) => {
    if (item.acao && item.acao.includes("concluida")) {
      return <CheckCircleIcon fontSize="small" color="primary" />;
    } else if (item.acao && item.acao.includes("em_andamento")) {
      return <PlayArrowIcon fontSize="small" color="action" />;
    } else if (item.acao && item.acao.includes("cancelada")) {
      return <CancelIcon fontSize="small" color="error" />;
    }
    return <HistoryIcon fontSize="small" color="disabled" />;
  };

  if (!tarefa) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth className={classes.dialog}>
      <Box className={classes.header}>
        <Box display="flex" alignItems="center">
          <Typography variant="h6">
            Executar Controle
          </Typography>
          <Chip
            label={tarefa.origem === "controle" ? "Controle" : "Tarefa"}
            size="small"
            className={classes.statusChip}
            style={{ backgroundColor: "#e1f5fe", color: "#0277bd" }}
          />
        </Box>
        <IconButton size="small" onClick={onClose} style={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent className={classes.content}>
        {/* Informações do Controle */}
        <Box className={classes.section}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            CONTROLE
          </Typography>
          <Typography variant="h6" gutterBottom>
            {tarefa.titulo}
          </Typography>
          
          {tarefa.controleCliente?.controleConfig && (
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Código: {tarefa.controleCliente.controleConfig.codigo}
            </Typography>
          )}

          {tarefa.cliente && (
            <Typography variant="body2" gutterBottom>
              Cliente: {tarefa.cliente.nomeFantasia || tarefa.cliente.razaoSocial}
            </Typography>
          )}

          {tarefa.departamento && (
            <Typography variant="body2" gutterBottom>
              Departamento: {tarefa.departamento.nome}
            </Typography>
          )}

          {tarefa.user && (
            <Typography variant="body2" gutterBottom>
              Responsável: {tarefa.user.name}
            </Typography>
          )}

          {tarefa.dataEntrega && (
            <Typography variant="body2" gutterBottom>
              Data de Entrega: {format(parseISO(tarefa.dataEntrega), "dd/MM/yyyy")}
            </Typography>
          )}
        </Box>

        <Divider />

        {/* Status Atual */}
        <Box className={classes.section} style={{ marginTop: 24 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            STATUS ATUAL
          </Typography>
          <Chip
            label={getStatusLabel(tarefa.status)}
            color={getStatusColor(tarefa.status)}
            icon={statusOptions.find((opt) => opt.value === tarefa.status)?.icon}
          />
        </Box>

        {/* Alteração de Status */}
        <Box className={classes.section}>
          <TextField
            select
            fullWidth
            label="Novo Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            variant="outlined"
            margin="normal"
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box display="flex" alignItems="center" gap={1}>
                  {option.icon}
                  <Typography>{option.label}</Typography>
                </Box>
              </MenuItem>
            ))}
          </TextField>

          {/* Data de Conclusão - só aparece se status for "concluída" */}
          {status === "concluida" && (
            <TextField
              fullWidth
              label="Data e Hora de Conclusão"
              type="datetime-local"
              value={dataConclusao}
              onChange={(e) => setDataConclusao(e.target.value)}
              variant="outlined"
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              helperText="Você pode selecionar uma data passada ou futura"
            />
          )}

          <TextField
            fullWidth
            label="Observação"
            multiline
            rows={3}
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            variant="outlined"
            margin="normal"
            placeholder="Adicione uma observação sobre esta alteração..."
          />
        </Box>

        <Divider />

        {/* Histórico */}
        <Box className={classes.historicoSection}>
          <Box
            className={classes.expandButton}
            onClick={() => {
              setShowHistorico(!showHistorico);
              if (!showHistorico && historico.length === 0) {
                fetchHistorico();
              }
            }}
          >
            <HistoryIcon style={{ marginRight: 8 }} />
            <Typography variant="subtitle1" style={{ flex: 1 }}>
              Histórico de Alterações
            </Typography>
            {showHistorico ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Box>

          <Collapse in={showHistorico}>
            <Box mt={2}>
              {loadingHistorico ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress size={30} />
                </Box>
              ) : historico.length === 0 ? (
                <Typography variant="body2" color="textSecondary" align="center">
                  Nenhum histórico encontrado
                </Typography>
              ) : (
                <Timeline>
                  {historico.map((item, index) => (
                    <TimelineItem key={item.id || index}>
                      <TimelineOppositeContent style={{ maxWidth: "120px", paddingTop: 12 }}>
                        <Typography variant="caption" color="textSecondary">
                          {formatHistoricoData(item.createdAt)}
                        </Typography>
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color={item.tipo === "tarefa" ? "primary" : "secondary"}>
                          {getHistoricoIcon(item)}
                        </TimelineDot>
                        {index < historico.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Paper elevation={1} className={classes.timelinePaper}>
                          <Typography variant="subtitle2">
                            {item.acao?.replace(/_/g, " ") || "Alteração"}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {item.observacao || item.observacao}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            por {item.usuario?.name || item.user?.name || "Sistema"}
                          </Typography>
                          <Chip
                            label={item.tipo === "tarefa" ? "Tarefa" : "Controle"}
                            size="small"
                            style={{ marginLeft: 8, height: 20 }}
                          />
                        </Paper>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              )}
            </Box>
          </Collapse>
        </Box>
      </DialogContent>

      <DialogActions style={{ padding: 16 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExecutarControleModal;
