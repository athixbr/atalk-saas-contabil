import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useParams, useHistory } from "react-router-dom";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import Chip from "@material-ui/core/Chip";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Checkbox from "@material-ui/core/Checkbox";
import { 
  ArrowBack, 
  Add, 
  Edit, 
  Delete, 
  Phone, 
  Email, 
  Business,
  Description,
  Schedule,
  CheckCircle,
  AccessTime,
} from "@material-ui/icons";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AuthContext } from "../../context/Auth/AuthContext";
import { 
  getLead,
  updateLead,
  getCrmTasks,
  createCrmTask,
  updateCrmTask,
  deleteCrmTask,
  getInteractions,
  createInteraction,
  deleteInteraction,
  getTaskCategories,
} from "../../services/crmApi";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  backButton: {
    background: "linear-gradient(135deg, #757575 0%, #616161 100%)",
    color: "#fff",
    "&:hover": {
      background: "linear-gradient(135deg, #616161 0%, #424242 100%)",
    },
  },
  leadInfo: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  infoGrid: {
    marginTop: theme.spacing(2),
  },
  infoLabel: {
    fontSize: "13px",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
  },
  infoValue: {
    fontSize: "15px",
    fontWeight: 500,
  },
  tabs: {
    marginBottom: theme.spacing(3),
    backgroundColor: "#fff",
    borderRadius: "12px",
  },
  tabContent: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: theme.spacing(3),
  },
  addButton: {
    background: "linear-gradient(135deg, #0596cd 0%, #047ba5 100%)",
    color: "#fff",
    "&:hover": {
      background: "linear-gradient(135deg, #047ba5 0%, #035c7d 100%)",
    },
  },
  timeline: {
    position: "relative",
    paddingLeft: theme.spacing(4),
    "&::before": {
      content: '""',
      position: "absolute",
      left: "20px",
      top: 0,
      bottom: 0,
      width: "2px",
      backgroundColor: theme.palette.divider,
    },
  },
  timelineItem: {
    position: "relative",
    marginBottom: theme.spacing(3),
    "&::before": {
      content: '""',
      position: "absolute",
      left: "-28px",
      top: "12px",
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      backgroundColor: theme.palette.primary.main,
      border: "2px solid #fff",
      boxShadow: "0 0 0 2px " + theme.palette.primary.main,
    },
  },
  taskItem: {
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#e3f2fd",
      transform: "translateX(4px)",
    },
  },
  taskCompleted: {
    backgroundColor: "#e8f5e9",
    opacity: 0.8,
    textDecoration: "line-through",
  },
  priorityChip: {
    marginLeft: theme.spacing(1),
  },
}));

const LeadDetail = () => {
  const classes = useStyles();
  const { leadId } = useParams();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [lead, setLead] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [taskCategories, setTaskCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Task Modal
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    userId: user?.id,
    dueDate: "",
    priority: "medium",
    status: "pending",
  });

  // Interaction Modal
  const [interactionModalOpen, setInteractionModalOpen] = useState(false);
  const [interactionForm, setInteractionForm] = useState({
    type: "call",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadLead();
    loadUsers();
    loadTaskCategories();
  }, [leadId]);

  useEffect(() => {
    if (tabValue === 1) {
      loadTasks();
    } else if (tabValue === 2) {
      loadInteractions();
    }
  }, [tabValue]);

  const loadLead = async () => {
    try {
      const data = await getLead(leadId);
      setLead(data);
    } catch (error) {
      toast.error("Erro ao carregar lead");
      history.push("/crm");
    }
  };

  const loadTasks = async () => {
    try {
      const data = await getCrmTasks({ leadId });
      setTasks(data);
    } catch (error) {
      toast.error("Erro ao carregar tarefas");
    }
  };

  const loadInteractions = async () => {
    try {
      const data = await getInteractions({ leadId });
      setInteractions(data);
    } catch (error) {
      toast.error("Erro ao carregar interações");
    }
  };

  const loadTaskCategories = async () => {
    try {
      const data = await getTaskCategories({ active: true });
      setTaskCategories(data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data.users || []);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  };

  const handleOpenTaskModal = () => {
    setSelectedTask(null);
    setTaskForm({
      title: "",
      description: "",
      categoryId: "",
      userId: user?.id,
      dueDate: "",
      priority: "medium",
      status: "pending",
    });
    setTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      categoryId: task.categoryId || "",
      userId: task.userId || "",
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      priority: task.priority || "medium",
      status: task.status || "pending",
    });
    setTaskModalOpen(true);
  };

  const handleSaveTask = async () => {
    try {
      if (!taskForm.title) {
        toast.error("Título é obrigatório");
        return;
      }

      const data = { ...taskForm, leadId: parseInt(leadId) };

      if (selectedTask) {
        await updateCrmTask(selectedTask.id, data);
        toast.success("Tarefa atualizada!");
      } else {
        await createCrmTask(data);
        toast.success("Tarefa criada!");
      }

      setTaskModalOpen(false);
      loadTasks();
    } catch (error) {
      toast.error("Erro ao salvar tarefa");
    }
  };

  const handleToggleTaskStatus = async (task) => {
    try {
      const newStatus = task.status === "completed" ? "pending" : "completed";
      await updateCrmTask(task.id, { status: newStatus });
      loadTasks();
    } catch (error) {
      toast.error("Erro ao atualizar tarefa");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Deseja excluir esta tarefa?")) return;

    try {
      await deleteCrmTask(taskId);
      toast.success("Tarefa excluída!");
      loadTasks();
    } catch (error) {
      toast.error("Erro ao excluir tarefa");
    }
  };

  const handleSaveInteraction = async () => {
    try {
      if (!interactionForm.description) {
        toast.error("Descrição é obrigatória");
        return;
      }

      await createInteraction({
        ...interactionForm,
        leadId: parseInt(leadId),
        userId: user.id,
      });

      toast.success("Interação registrada!");
      setInteractionModalOpen(false);
      setInteractionForm({
        type: "call",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      loadInteractions();
    } catch (error) {
      toast.error("Erro ao registrar interação");
    }
  };

  const handleDeleteInteraction = async (interactionId) => {
    if (!window.confirm("Deseja excluir esta interação?")) return;

    try {
      await deleteInteraction(interactionId);
      toast.success("Interação excluída!");
      loadInteractions();
    } catch (error) {
      toast.error("Erro ao excluir interação");
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  const formatDateTime = (date) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#f44336";
      case "medium":
        return "#ff9800";
      case "low":
        return "#4caf50";
      default:
        return "#757575";
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "high":
        return "Alta";
      case "medium":
        return "Média";
      case "low":
        return "Baixa";
      default:
        return priority;
    }
  };

  const getInteractionTypeLabel = (type) => {
    const types = {
      call: "Ligação",
      email: "E-mail",
      meeting: "Reunião",
      note: "Nota",
      whatsapp: "WhatsApp",
    };
    return types[type] || type;
  };

  if (!lead) {
    return (
      <div className={classes.root}>
        <Typography>Carregando...</Typography>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Button
          variant="contained"
          className={classes.backButton}
          startIcon={<ArrowBack />}
          onClick={() => history.push("/crm")}
        >
          Voltar
        </Button>
        <div style={{ flex: 1 }}>
          <Typography variant="h5">{lead.name}</Typography>
          <Typography variant="body2" color="textSecondary">
            Lead #{lead.id}
          </Typography>
        </div>
      </div>

      <Paper className={classes.leadInfo} elevation={0}>
        <Typography variant="h6" gutterBottom>
          Informações do Lead
        </Typography>
        <Divider style={{ marginBottom: 16 }} />
        
        <Grid container spacing={3} className={classes.infoGrid}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography className={classes.infoLabel}>Telefone</Typography>
            <Typography className={classes.infoValue}>
              <Phone style={{ fontSize: 16, verticalAlign: "middle", marginRight: 8 }} />
              {lead.phone || "-"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography className={classes.infoLabel}>E-mail</Typography>
            <Typography className={classes.infoValue}>
              <Email style={{ fontSize: 16, verticalAlign: "middle", marginRight: 8 }} />
              {lead.email || "-"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography className={classes.infoLabel}>Tipo de Negócio</Typography>
            <Typography className={classes.infoValue}>
              <Business style={{ fontSize: 16, verticalAlign: "middle", marginRight: 8 }} />
              {lead.businessType?.name || "-"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography className={classes.infoLabel}>Valor Estimado</Typography>
            <Typography className={classes.infoValue} style={{ color: "#4caf50" }}>
              {formatCurrency(lead.estimatedValue)}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography className={classes.infoLabel}>Regime Tributário</Typography>
            <Typography className={classes.infoValue}>
              {lead.taxRegime?.name || "-"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography className={classes.infoLabel}>Fonte</Typography>
            <Typography className={classes.infoValue}>
              {lead.source?.name || "-"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography className={classes.infoLabel}>Responsável</Typography>
            <Typography className={classes.infoValue}>
              {lead.user?.name || "-"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography className={classes.infoLabel}>Etapa</Typography>
            <Chip
              label={lead.stage || "-"}
              style={{ backgroundColor: "#0596cd", color: "#fff" }}
            />
          </Grid>

          {lead.notes && (
            <Grid item xs={12}>
              <Typography className={classes.infoLabel}>Observações</Typography>
              <Typography className={classes.infoValue}>
                <Description style={{ fontSize: 16, verticalAlign: "middle", marginRight: 8 }} />
                {lead.notes}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Paper className={classes.tabs} elevation={0}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Visão Geral" />
          <Tab label="Tarefas" />
          <Tab label="Timeline" />
        </Tabs>
      </Paper>

      <Paper className={classes.tabContent} elevation={0}>
        {tabValue === 0 && (
          <div>
            <Typography variant="h6" gutterBottom>
              Resumo
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Visão geral das atividades e status do lead.
            </Typography>
            <Grid container spacing={3} style={{ marginTop: 16 }}>
              <Grid item xs={12} sm={4}>
                <Paper style={{ padding: 16, textAlign: "center" }} elevation={0}>
                  <Typography variant="h4">{tasks.length}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Tarefas
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper style={{ padding: 16, textAlign: "center" }} elevation={0}>
                  <Typography variant="h4">
                    {tasks.filter((t) => t.status === "completed").length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Concluídas
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper style={{ padding: 16, textAlign: "center" }} elevation={0}>
                  <Typography variant="h4">{interactions.length}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Interações
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </div>
        )}

        {tabValue === 1 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <Typography variant="h6">Tarefas</Typography>
              <Button
                variant="contained"
                className={classes.addButton}
                startIcon={<Add />}
                onClick={handleOpenTaskModal}
              >
                Nova Tarefa
              </Button>
            </div>

            {tasks.length === 0 ? (
              <Typography variant="body2" color="textSecondary" align="center">
                Nenhuma tarefa cadastrada
              </Typography>
            ) : (
              <div>
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`${classes.taskItem} ${
                      task.status === "completed" ? classes.taskCompleted : ""
                    }`}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Checkbox
                          checked={task.status === "completed"}
                          onChange={() => handleToggleTaskStatus(task)}
                          color="primary"
                        />
                        <div>
                          <Typography variant="body1" style={{ fontWeight: 500 }}>
                            {task.title}
                          </Typography>
                          {task.description && (
                            <Typography variant="body2" color="textSecondary">
                              {task.description}
                            </Typography>
                          )}
                          <div style={{ marginTop: 8 }}>
                            {task.dueDate && (
                              <Chip
                                size="small"
                                icon={<Schedule />}
                                label={formatDate(task.dueDate)}
                                style={{ marginRight: 8 }}
                              />
                            )}
                            <Chip
                              size="small"
                              label={getPriorityLabel(task.priority)}
                              style={{
                                backgroundColor: getPriorityColor(task.priority),
                                color: "#fff",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <IconButton size="small" onClick={() => handleEditTask(task)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteTask(task.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tabValue === 2 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <Typography variant="h6">Timeline de Interações</Typography>
              <Button
                variant="contained"
                className={classes.addButton}
                startIcon={<Add />}
                onClick={() => setInteractionModalOpen(true)}
              >
                Nova Interação
              </Button>
            </div>

            {interactions.length === 0 ? (
              <Typography variant="body2" color="textSecondary" align="center">
                Nenhuma interação registrada
              </Typography>
            ) : (
              <div className={classes.timeline}>
                {interactions.map((interaction) => (
                  <div key={interaction.id} className={classes.timelineItem}>
                    <Paper style={{ padding: 16 }} elevation={1}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                        <div style={{ flex: 1 }}>
                          <Chip
                            label={getInteractionTypeLabel(interaction.type)}
                            size="small"
                            color="primary"
                            style={{ marginBottom: 8 }}
                          />
                          <Typography variant="body1" gutterBottom>
                            {interaction.description}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatDateTime(interaction.date)} - {interaction.user?.name}
                          </Typography>
                        </div>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteInteraction(interaction.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </div>
                    </Paper>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Paper>

      {/* Task Modal */}
      <Dialog open={taskModalOpen} onClose={() => setTaskModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedTask ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: 8 }}>
            <Grid item xs={12}>
              <TextField
                label="Título *"
                fullWidth
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descrição"
                fullWidth
                multiline
                rows={3}
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={taskForm.categoryId}
                  onChange={(e) => setTaskForm({ ...taskForm, categoryId: e.target.value })}
                >
                  <MenuItem value="">
                    <em>Nenhuma</em>
                  </MenuItem>
                  {taskCategories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Prioridade</InputLabel>
                <Select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                >
                  <MenuItem value="low">Baixa</MenuItem>
                  <MenuItem value="medium">Média</MenuItem>
                  <MenuItem value="high">Alta</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Data de Vencimento"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Responsável</InputLabel>
                <Select
                  value={taskForm.userId}
                  onChange={(e) => setTaskForm({ ...taskForm, userId: e.target.value })}
                >
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveTask} variant="contained" className={classes.addButton}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Interaction Modal */}
      <Dialog
        open={interactionModalOpen}
        onClose={() => setInteractionModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nova Interação</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: 8 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={interactionForm.type}
                  onChange={(e) => setInteractionForm({ ...interactionForm, type: e.target.value })}
                >
                  <MenuItem value="call">Ligação</MenuItem>
                  <MenuItem value="email">E-mail</MenuItem>
                  <MenuItem value="meeting">Reunião</MenuItem>
                  <MenuItem value="whatsapp">WhatsApp</MenuItem>
                  <MenuItem value="note">Nota</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Data"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={interactionForm.date}
                onChange={(e) => setInteractionForm({ ...interactionForm, date: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descrição *"
                fullWidth
                multiline
                rows={4}
                value={interactionForm.description}
                onChange={(e) =>
                  setInteractionForm({ ...interactionForm, description: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInteractionModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveInteraction} variant="contained" className={classes.addButton}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LeadDetail;
