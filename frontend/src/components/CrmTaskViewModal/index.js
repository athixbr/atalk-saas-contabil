import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Chip,
  Divider,
  makeStyles
} from "@material-ui/core";
import moment from "moment";

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    minWidth: 500,
  },
  section: {
    marginBottom: theme.spacing(2),
  },
  label: {
    fontWeight: "bold",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
  },
  value: {
    color: theme.palette.text.primary,
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  chip: {
    marginRight: theme.spacing(1),
  },
}));

const CrmTaskViewModal = ({ open, onClose, task }) => {
  const classes = useStyles();

  if (!task) return null;

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pendente",
      in_progress: "Em Andamento",
      completed: "Concluída",
      cancelled: "Cancelada"
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "default",
      in_progress: "primary",
      completed: "secondary",
      cancelled: "default"
    };
    return colors[status] || "default";
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      low: "Baixa",
      medium: "Média",
      high: "Alta"
    };
    return labels[priority] || priority;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "#4caf50",
      medium: "#ff9800",
      high: "#f44336"
    };
    return colors[priority] || "#9e9e9e";
  };

  const getRecurrenceLabel = (recurrence) => {
    const labels = {
      daily: "Diária",
      weekly: "Semanal",
      monthly: "Mensal",
      yearly: "Anual"
    };
    return labels[recurrence] || "-";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalhes da Tarefa</DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Grid container spacing={2}>
          {/* Título e Descrição */}
          <Grid item xs={12} className={classes.section}>
            <Typography className={classes.label}>Título</Typography>
            <Typography variant="h6" className={classes.value}>
              {task.title}
            </Typography>
          </Grid>

          {task.description && (
            <Grid item xs={12} className={classes.section}>
              <Typography className={classes.label}>Descrição</Typography>
              <Typography className={classes.value}>
                {task.description}
              </Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider className={classes.divider} />
          </Grid>

          {/* Status e Prioridade */}
          <Grid item xs={6} className={classes.section}>
            <Typography className={classes.label}>Status</Typography>
            <Chip
              label={getStatusLabel(task.status)}
              color={getStatusColor(task.status)}
              className={classes.chip}
            />
          </Grid>

          <Grid item xs={6} className={classes.section}>
            <Typography className={classes.label}>Prioridade</Typography>
            <Chip
              label={getPriorityLabel(task.priority)}
              style={{
                backgroundColor: getPriorityColor(task.priority),
                color: "#fff"
              }}
              className={classes.chip}
            />
          </Grid>

          {/* Categoria e Etapa */}
          {task.category && (
            <Grid item xs={6} className={classes.section}>
              <Typography className={classes.label}>Categoria</Typography>
              <Typography className={classes.value}>
                {task.category.name}
              </Typography>
            </Grid>
          )}

          {task.stage && (
            <Grid item xs={6} className={classes.section}>
              <Typography className={classes.label}>Etapa do Funil</Typography>
              <Chip
                label={task.stage.name}
                style={{
                  backgroundColor: task.stage.color || "#757575",
                  color: "#fff"
                }}
                className={classes.chip}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider className={classes.divider} />
          </Grid>

          {/* Cliente ou Lead */}
          {task.clienteId ? (
            <Grid item xs={12} className={classes.section}>
              <Typography className={classes.label}>Cliente</Typography>
              <Typography className={classes.value}>
                {task.cliente?.nome || task.cliente?.razaoSocial || "N/A"}
              </Typography>
            </Grid>
          ) : task.leadId ? (
            <Grid item xs={12} className={classes.section}>
              <Typography className={classes.label}>Lead</Typography>
              <Typography className={classes.value}>
                {task.lead?.name || "N/A"}
              </Typography>
            </Grid>
          ) : null}

          {/* Responsável */}
          {task.user && (
            <Grid item xs={12} className={classes.section}>
              <Typography className={classes.label}>Responsável</Typography>
              <Typography className={classes.value}>
                {task.user.name}
              </Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider className={classes.divider} />
          </Grid>

          {/* Datas */}
          <Grid item xs={6} className={classes.section}>
            <Typography className={classes.label}>Data de Vencimento</Typography>
            <Typography className={classes.value}>
              {task.dueDate ? moment(task.dueDate).format("DD/MM/YYYY") : "-"}
            </Typography>
          </Grid>

          {task.completedDate && (
            <Grid item xs={6} className={classes.section}>
              <Typography className={classes.label}>Data de Conclusão</Typography>
              <Typography className={classes.value}>
                {moment(task.completedDate).format("DD/MM/YYYY HH:mm")}
              </Typography>
            </Grid>
          )}

          {/* Recorrência e Lembrete */}
          {task.recurrence && (
            <Grid item xs={6} className={classes.section}>
              <Typography className={classes.label}>Recorrência</Typography>
              <Typography className={classes.value}>
                {getRecurrenceLabel(task.recurrence)}
              </Typography>
            </Grid>
          )}

          {task.reminderDays > 0 && (
            <Grid item xs={6} className={classes.section}>
              <Typography className={classes.label}>Lembrete</Typography>
              <Typography className={classes.value}>
                {task.reminderDays} {task.reminderDays === 1 ? "dia" : "dias"} antes
              </Typography>
            </Grid>
          )}

          {task.nextOccurrence && (
            <Grid item xs={12} className={classes.section}>
              <Typography className={classes.label}>Próxima Ocorrência</Typography>
              <Typography className={classes.value}>
                {moment(task.nextOccurrence).format("DD/MM/YYYY")}
              </Typography>
            </Grid>
          )}

          {/* Info de criação */}
          <Grid item xs={12}>
            <Divider className={classes.divider} />
          </Grid>

          <Grid item xs={12} className={classes.section}>
            <Typography variant="caption" color="textSecondary">
              Criada em {moment(task.createdAt).format("DD/MM/YYYY HH:mm")}
              {task.updatedAt && task.updatedAt !== task.createdAt && 
                ` • Atualizada em ${moment(task.updatedAt).format("DD/MM/YYYY HH:mm")}`
              }
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CrmTaskViewModal;
