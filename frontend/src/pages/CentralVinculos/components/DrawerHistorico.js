import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  CircularProgress,
  Chip,
  Avatar,
} from "@material-ui/core";
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  SwapHoriz as SwapHorizIcon,
} from "@material-ui/icons";
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent } from "@material-ui/lab";
import { toast } from "react-toastify";
import api from "../../../services/api";
import { makeStyles } from "@material-ui/core/styles";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: 600,
    maxWidth: "90vw",
  },
  header: {
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  content: {
    padding: theme.spacing(3),
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  infoBox: {
    backgroundColor: theme.palette.action.hover,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(3),
  },
  timelineItem: {
    "&::before": {
      flex: 0,
      padding: 0,
    },
  },
  timelineDate: {
    minWidth: 80,
  },
  alteracaoCard: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
  },
  alteracaoItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(0.5, 0),
  },
  chipVinculacao: {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
  },
  chipDesvinculacao: {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  },
  chipAlteracao: {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.contrastText,
  },
}));

const DrawerHistorico = ({ open, onClose, vinculoId, clienteNome }) => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    if (open && vinculoId) {
      carregarHistorico();
    }
  }, [open, vinculoId]);

  const carregarHistorico = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/controle-clientes/vinculos/${vinculoId}/historico`);
      setHistorico(data.historico || []);
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
      toast.error("Erro ao carregar histórico");
    } finally {
      setLoading(false);
    }
  };

  const getAcaoLabel = (acao) => {
    const labels = {
      vinculacao: "Vinculação",
      desvinculacao: "Desvinculação",
      alteracao_datas: "Alteração de Datas",
      alteracao_responsavel: "Alteração de Responsável",
    };
    return labels[acao] || acao;
  };

  const getAcaoIcon = (acao) => {
    switch (acao) {
      case "vinculacao":
        return <CheckCircleIcon />;
      case "desvinculacao":
        return <CancelIcon />;
      case "alteracao_datas":
        return <EditIcon />;
      case "alteracao_responsavel":
        return <SwapHorizIcon />;
      default:
        return <EditIcon />;
    }
  };

  const getAcaoColor = (acao) => {
    switch (acao) {
      case "vinculacao":
        return "primary";
      case "desvinculacao":
        return "secondary";
      case "alteracao_datas":
        return "default";
      case "alteracao_responsavel":
        return "default";
      default:
        return "default";
    }
  };

  const renderAlteracoes = (dadosAnteriores, dadosNovos) => {
    if (!dadosAnteriores || !dadosNovos) return null;

    const campos = Object.keys(dadosNovos);
    
    return (
      <Box className={classes.alteracaoCard}>
        {campos.map((campo) => {
          const anterior = dadosAnteriores[campo];
          const novo = dadosNovos[campo];
          
          if (anterior === novo) return null;

          return (
            <Box key={campo} className={classes.alteracaoItem}>
              <Typography variant="caption" color="textSecondary">
                <strong>{campo}:</strong>
              </Typography>
              <Box display="flex" gap={1} alignItems="center">
                <Chip
                  size="small"
                  label={anterior || "N/A"}
                  color="default"
                  variant="outlined"
                />
                <Typography variant="caption">→</Typography>
                <Chip
                  size="small"
                  label={novo || "N/A"}
                  color="primary"
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      classes={{ paper: classes.drawer }}
    >
      <Box className={classes.header}>
        <Box>
          <Typography variant="h6">Histórico de Alterações</Typography>
          {clienteNome && (
            <Typography variant="caption" color="textSecondary">
              {clienteNome}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box className={classes.content}>
        {loading ? (
          <Box className={classes.loading}>
            <CircularProgress />
          </Box>
        ) : historico.length === 0 ? (
          <Box textAlign="center" py={5}>
            <Typography color="textSecondary">
              Nenhum histórico encontrado
            </Typography>
          </Box>
        ) : (
          <Timeline>
            {historico.map((item, index) => (
              <TimelineItem key={item.id} className={classes.timelineItem}>
                <TimelineOppositeContent className={classes.timelineDate}>
                  <Typography variant="caption" color="textSecondary">
                    {format(parseISO(item.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block">
                    {format(parseISO(item.createdAt), "HH:mm", { locale: ptBR })}
                  </Typography>
                </TimelineOppositeContent>

                <TimelineSeparator>
                  <TimelineDot color={getAcaoColor(item.acao)}>
                    {getAcaoIcon(item.acao)}
                  </TimelineDot>
                  {index < historico.length - 1 && <TimelineConnector />}
                </TimelineSeparator>

                <TimelineContent>
                  <Box mb={2}>
                    <Chip
                      size="small"
                      label={getAcaoLabel(item.acao)}
                      className={
                        item.acao === "vinculacao"
                          ? classes.chipVinculacao
                          : item.acao === "desvinculacao"
                          ? classes.chipDesvinculacao
                          : classes.chipAlteracao
                      }
                    />
                    
                    <Typography variant="body2" style={{ marginTop: 8 }}>
                      Por: <strong>{item.usuario?.name || "Sistema"}</strong>
                    </Typography>

                    {item.observacoes && (
                      <Typography variant="body2" color="textSecondary" style={{ marginTop: 4 }}>
                        {item.observacoes}
                      </Typography>
                    )}

                    {(item.acao === "alteracao_datas" || item.acao === "alteracao_responsavel") &&
                      renderAlteracoes(item.dadosAnteriores, item.dadosNovos)}
                  </Box>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        )}
      </Box>
    </Drawer>
  );
};

export default DrawerHistorico;
