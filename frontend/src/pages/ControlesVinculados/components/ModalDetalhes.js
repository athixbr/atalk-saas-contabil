import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Divider,
  Chip,
  IconButton,
  Card,
  CardContent,
  CircularProgress,
} from "@material-ui/core";
import {
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { format, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import api from "../../../services/api";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    padding: theme.spacing(3),
  },
  section: {
    marginBottom: theme.spacing(3),
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1.5),
    gap: theme.spacing(1),
  },
  chipAtivo: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
  chipVencendo: {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
  },
  chipVencido: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
  chipInativo: {
    backgroundColor: theme.palette.grey[400],
    color: theme.palette.common.white,
  },
  alertBox: {
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  alertWarning: {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
  },
  alertError: {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  },
  alertSuccess: {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
  },
  tarefaCard: {
    marginBottom: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
  },
  tarefasContainer: {
    maxHeight: 300,
    overflowY: "auto",
  },
}));

const ModalDetalhes = ({ open, onClose, vinculoId }) => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [vinculo, setVinculo] = useState(null);
  const [tarefas, setTarefas] = useState([]);

  useEffect(() => {
    if (open && vinculoId) {
      carregarDetalhes();
    }
  }, [open, vinculoId]);

  const carregarDetalhes = async () => {
    try {
      setLoading(true);
      const [vinculoRes, tarefasRes] = await Promise.all([
        api.get(`/controle-clientes/vinculos/${vinculoId}`),
        api.get(`/tarefas?controleClienteId=${vinculoId}`),
      ]);

      setVinculo(vinculoRes.data);
      setTarefas(tarefasRes.data.tarefas || []);
    } catch (err) {
      console.error("Erro ao carregar detalhes:", err);
      toast.error("Erro ao carregar detalhes");
    } finally {
      setLoading(false);
    }
  };

  const calcularDiasRestantes = (dataFim) => {
    if (!dataFim) return null;
    return differenceInDays(parseISO(dataFim), new Date());
  };

  const getStatusChip = () => {
    if (!vinculo) return null;

    if (!vinculo.ativo) {
      return (
        <Chip
          label="Inativo"
          size="small"
          className={classes.chipInativo}
        />
      );
    }

    if (!vinculo.dataFim) {
      return (
        <Chip
          label="Ativo"
          size="small"
          className={classes.chipAtivo}
          icon={<CheckCircleIcon />}
        />
      );
    }

    const dias = calcularDiasRestantes(vinculo.dataFim);

    if (dias < 0) {
      return (
        <Chip
          label={`Vencido há ${Math.abs(dias)} dias`}
          size="small"
          className={classes.chipVencido}
          icon={<WarningIcon />}
        />
      );
    }

    if (dias <= 30) {
      return (
        <Chip
          label={`Vence em ${dias} dias`}
          size="small"
          className={classes.chipVencendo}
          icon={<WarningIcon />}
        />
      );
    }

    return (
      <Chip
        label="Ativo"
        size="small"
        className={classes.chipAtivo}
        icon={<CheckCircleIcon />}
      />
    );
  };

  const getAlertBox = () => {
    if (!vinculo || !vinculo.dataFim || !vinculo.ativo) return null;

    const dias = calcularDiasRestantes(vinculo.dataFim);

    if (dias < 0) {
      return (
        <Box className={`${classes.alertBox} ${classes.alertError}`}>
          <WarningIcon />
          <Typography variant="body2">
            <strong>Atenção!</strong> Este controle está vencido há {Math.abs(dias)} dias.
            É necessário renovar ou desvincular.
          </Typography>
        </Box>
      );
    }

    if (dias <= 30) {
      return (
        <Box className={`${classes.alertBox} ${classes.alertWarning}`}>
          <WarningIcon />
          <Typography variant="body2">
            <strong>Atenção!</strong> Este controle vence em {dias} dias.
            Providencie a renovação com antecedência.
          </Typography>
        </Box>
      );
    }

    return (
      <Box className={`${classes.alertBox} ${classes.alertSuccess}`}>
        <CheckCircleIcon />
        <Typography variant="body2">
          Este controle está em dia e vence em {dias} dias.
        </Typography>
      </Box>
    );
  };

  if (!vinculo && loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (!vinculo) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Detalhes do Controle
        <IconButton
          aria-label="close"
          onClick={onClose}
          style={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className={classes.dialogContent}>
        {/* Status Alert */}
        {getAlertBox()}

        {/* Informações Principais */}
        <Box className={classes.section}>
          <Typography variant="h6" gutterBottom>
            Informações do Controle
          </Typography>
          
          <Box className={classes.infoRow}>
            <AssignmentIcon color="action" />
            <Typography variant="body1">
              <strong>{vinculo.controleConfig?.codigo}</strong> - {vinculo.controleConfig?.nome}
            </Typography>
            {getStatusChip()}
          </Box>

          <Box className={classes.infoRow}>
            <BusinessIcon color="action" />
            <Typography variant="body1">
              <strong>Cliente:</strong> {vinculo.cliente?.nome}
            </Typography>
          </Box>

          {vinculo.controleConfig?.descricao && (
            <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
              {vinculo.controleConfig.descricao}
            </Typography>
          )}
        </Box>

        <Divider />

        {/* Datas */}
        <Box className={classes.section} mt={3}>
          <Typography variant="h6" gutterBottom>
            Vigência
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box className={classes.infoRow}>
                <CalendarIcon color="action" />
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Data Início
                  </Typography>
                  <Typography variant="body1">
                    {vinculo.dataInicio
                      ? format(parseISO(vinculo.dataInicio), "dd/MM/yyyy", { locale: ptBR })
                      : "N/A"}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={6}>
              <Box className={classes.infoRow}>
                <CalendarIcon color="action" />
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Data Fim
                  </Typography>
                  <Typography variant="body1">
                    {vinculo.dataFim
                      ? format(parseISO(vinculo.dataFim), "dd/MM/yyyy", { locale: ptBR })
                      : "Indeterminado"}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Responsáveis */}
        <Box className={classes.section} mt={3}>
          <Typography variant="h6" gutterBottom>
            Responsáveis
          </Typography>
          
          {vinculo.departamento && (
            <Box className={classes.infoRow}>
              <BusinessIcon color="action" />
              <Typography variant="body1">
                <strong>Departamento:</strong> {vinculo.departamento.nome}
              </Typography>
            </Box>
          )}

          {vinculo.usuario && (
            <Box className={classes.infoRow}>
              <PersonIcon color="action" />
              <Typography variant="body1">
                <strong>Usuário:</strong> {vinculo.usuario.name}
              </Typography>
            </Box>
          )}

          {!vinculo.departamento && !vinculo.usuario && (
            <Typography variant="body2" color="textSecondary">
              Nenhum responsável atribuído
            </Typography>
          )}
        </Box>

        <Divider />

        {/* Tarefas Relacionadas */}
        <Box className={classes.section} mt={3}>
          <Typography variant="h6" gutterBottom>
            Tarefas Relacionadas ({tarefas.length})
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress size={24} />
            </Box>
          ) : tarefas.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              Nenhuma tarefa vinculada a este controle
            </Typography>
          ) : (
            <Box className={classes.tarefasContainer}>
              {tarefas.map((tarefa) => (
                <Card key={tarefa.id} className={classes.tarefaCard} variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2">
                        {tarefa.titulo}
                      </Typography>
                      <Chip
                        label={tarefa.status}
                        size="small"
                        color={tarefa.status === "concluida" ? "primary" : "default"}
                      />
                    </Box>
                    {tarefa.descricao && (
                      <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                        {tarefa.descricao}
                      </Typography>
                    )}
                    {tarefa.dataPrevista && (
                      <Typography variant="caption" color="textSecondary" display="block" mt={0.5}>
                        Prevista para: {format(parseISO(tarefa.dataPrevista), "dd/MM/yyyy", { locale: ptBR })}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>

        {vinculo.observacoes && (
          <>
            <Divider />
            <Box className={classes.section} mt={3}>
              <Typography variant="h6" gutterBottom>
                Observações
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {vinculo.observacoes}
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalDetalhes;
