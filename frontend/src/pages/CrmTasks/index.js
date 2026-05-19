import React, { useState, useEffect, useContext } from "react";
import {
  Paper,
  Typography,
  makeStyles,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Chip,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@material-ui/core";
import { Edit, Delete, Visibility, Add } from "@material-ui/icons";
import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import CrmTaskModal from "../../components/CrmTaskModal";
import CrmTaskViewModal from "../../components/CrmTaskViewModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import moment from "moment";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  filters: {
    marginBottom: theme.spacing(2),
  },
  statusChip: {
    fontWeight: "bold",
  },
}));

const CrmTasks = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    userId: "",
    type: "" // lead ou client
  });

  useEffect(() => {
    loadTasks();
  }, [filters]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.userId) params.userId = filters.userId;

      const { data } = await api.get("/crm/tasks", { params });
      
      // Filtrar por tipo (lead/cliente) no frontend se necessário
      let filteredTasks = data;
      if (filters.type === "lead") {
        filteredTasks = data.filter(t => t.leadId && !t.clienteId);
      } else if (filters.type === "client") {
        filteredTasks = data.filter(t => t.clienteId);
      }
      
      setTasks(filteredTasks);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar tarefas");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Tem certeza que deseja excluir esta tarefa?")) {
      try {
        await api.delete(`/crm/tasks/${taskId}`);
        toast.success("Tarefa excluída com sucesso!");
        loadTasks();
      } catch (err) {
        console.error(err);
        toast.error("Erro ao excluir tarefa");
      }
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "default",
      in_progress: "primary",
      completed: "secondary",
      cancelled: "error"
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pendente",
      in_progress: "Em Andamento",
      completed: "Concluída",
      cancelled: "Cancelada"
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "#4caf50",
      medium: "#ff9800",
      high: "#f44336"
    };
    return colors[priority] || "#757575";
  };

  const getRecurrenceLabel = (recurrence) => {
    const labels = {
      monthly: "Mensal",
      quarterly: "Trimestral",
      semiannual: "Semestral",
      annual: "Anual"
    };
    return labels[recurrence] || "";
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Tarefas CRM</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setTaskModalOpen(true)}
            startIcon={<Add />}
          >
            Nova Tarefa
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        {/* Filtros */}
        <Grid container spacing={2} className={classes.filters}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Tipo</InputLabel>
              <Select
                label="Tipo"
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="lead">Leads</MenuItem>
                <MenuItem value="client">Clientes</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="pending">Pendente</MenuItem>
                <MenuItem value="in_progress">Em Andamento</MenuItem>
                <MenuItem value="completed">Concluída</MenuItem>
                <MenuItem value="cancelled">Cancelada</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Prioridade</InputLabel>
              <Select
                label="Prioridade"
                value={filters.priority}
                onChange={(e) => handleFilterChange("priority", e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="low">Baixa</MenuItem>
                <MenuItem value="medium">Média</MenuItem>
                <MenuItem value="high">Alta</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setFilters({ status: "", priority: "", userId: "", type: "" })}
            >
              Limpar Filtros
            </Button>
          </Grid>
        </Grid>

        {/* Tabela */}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Relacionado a</TableCell>
              <TableCell>Responsável</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Recorrência</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Prioridade</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>
                    {task.clienteId ? (
                      <>Cliente: {task.cliente?.nome || task.cliente?.razaoSocial}</>
                    ) : (
                      <>Lead: {task.lead?.name}</>
                    )}
                  </TableCell>
                  <TableCell>{task.user?.name}</TableCell>
                  <TableCell>
                    {task.dueDate ? moment(task.dueDate).format("DD/MM/YYYY") : "-"}
                  </TableCell>
                  <TableCell>
                    {task.recurrence ? (
                      <Chip
                        label={getRecurrenceLabel(task.recurrence)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(task.status)}
                      size="small"
                      className={classes.statusChip}
                      color={getStatusColor(task.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.priority === "low" ? "Baixa" : task.priority === "medium" ? "Média" : "Alta"}
                      size="small"
                      style={{
                        backgroundColor: getPriorityColor(task.priority),
                        color: "#fff"
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      size="small" 
                      title="Visualizar"
                      onClick={() => {
                        setSelectedTask(task);
                        setViewModalOpen(true);
                      }}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      title="Editar"
                      onClick={() => handleEditTask(task)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      title="Excluir"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="textSecondary">
                    Nenhuma tarefa encontrada
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <CrmTaskModal
        open={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onSuccess={loadTasks}
        task={selectedTask}
      />

      <CrmTaskViewModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />
    </MainContainer>
  );
};

export default CrmTasks;
