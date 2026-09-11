import React, { useEffect, useMemo, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
} from "@material-ui/core";
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  DeleteOutline as DeleteOutlineIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
} from "@material-ui/icons";
import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import api from "../../services/api";

const STORAGE_KEY = "atalk.workflowDesigner.steps";
const TEMPLATES_STORAGE_KEY = "atalk.workflowDesigner.templates";
const ACTIVE_TEMPLATE_STORAGE_KEY = "atalk.workflowDesigner.activeTemplateId";

const useStyles = makeStyles((theme) => ({
  rootPaper: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "292px 1fr",
    minHeight: 0,
    overflow: "hidden",
    borderRadius: 0,
  },
  sidebar: {
    borderRight: "1px solid #dfe3e8",
    backgroundColor: "#f8fafc",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  },
  sidebarHeader: {
    padding: theme.spacing(1.5),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sidebarBody: {
    padding: theme.spacing(1.5),
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  searchField: {
    marginBottom: theme.spacing(1.5),
    backgroundColor: "#fff",
  },
  activityItem: {
    width: "100%",
    justifyContent: "flex-start",
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1.25),
    border: "1px solid #d5dde8",
    backgroundColor: "#fff",
    textTransform: "none",
  },
  canvasShell: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    minHeight: 0,
  },
  toolbar: {
    height: 50,
    borderBottom: "1px solid #e5e8ec",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(0, 1.5),
    backgroundColor: "#fff",
  },
  canvas: {
    position: "relative",
    flex: 1,
    overflow: "auto",
    backgroundColor: "#fbfdff",
    backgroundImage:
      "linear-gradient(#e9eef3 1px, transparent 1px), linear-gradient(90deg, #e9eef3 1px, transparent 1px)",
    backgroundSize: "20px 20px",
    padding: theme.spacing(6, 5),
  },
  flowRow: {
    display: "flex",
    alignItems: "center",
    minHeight: 320,
  },
  node: {
    width: 270,
    minHeight: 154,
    borderRadius: 8,
    color: "#fff",
    boxShadow: "0 10px 24px rgba(15,23,42,0.16)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  nodeHeader: {
    padding: theme.spacing(1.25, 1.5),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  nodeTitle: {
    fontWeight: 700,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  nodeBody: {
    padding: theme.spacing(0, 1.5, 1.5),
    display: "grid",
    gap: theme.spacing(0.75),
  },
  nodeText: {
    color: "rgba(255,255,255,0.92)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  nodeActions: {
    display: "flex",
    gap: 2,
    "& .MuiIconButton-root": {
      color: "#fff",
      padding: 5,
    },
  },
  connector: {
    width: 92,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#1e88e5",
  },
  connectorLine: {
    height: 3,
    flex: 1,
    backgroundColor: "#1e88e5",
  },
  emptyCanvas: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#607d8b",
    textAlign: "center",
  },
  statusStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(100px, 1fr))",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  statusItem: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 8,
    padding: theme.spacing(0.75),
  },
  dialogContent: {
    display: "grid",
    gap: theme.spacing(2),
    minWidth: 520,
    paddingTop: theme.spacing(2),
  },
  templateSelect: {
    minWidth: 260,
    backgroundColor: "#fff",
  },
}));

const blankStep = {
  id: null,
  title: "",
  tarefaConfigId: "",
  required: true,
  departamentoId: "",
  userId: "",
  color: "#22a862",
};

const aberturaEmpresaTemplate = [
  { title: "Coletar documentos", required: true, color: "#22a862" },
  { title: "Analisar viabilidade", required: true, color: "#22a862" },
  { title: "Registrar contrato social", required: true, color: "#f59e0b" },
  { title: "Emitir CNPJ e inscrições", required: true, color: "#1e88e5" },
  { title: "Configurar certificados e acessos", required: false, color: "#607d8b" },
];

const isCompleted = (task) => task.status === "Concluída" || task.status === "Concluida";
const isCanceled = (task) => task.status === "Cancelada" || task.status === "Cancelado";
const isLate = (task) => {
  if (!task.dueDate || isCompleted(task) || isCanceled(task)) return false;
  const dueDate = new Date(task.dueDate);
  dueDate.setHours(23, 59, 59, 999);
  return dueDate < new Date();
};

const safeList = (data, key) => data?.[key] || data || [];

const FluxogramaWorkflow = () => {
  const classes = useStyles();
  const [templates, setTemplates] = useState([]);
  const [activeTemplateId, setActiveTemplateId] = useState("");
  const [steps, setSteps] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskConfigs, setTaskConfigs] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [editingStep, setEditingStep] = useState(blankStep);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksRes, configsRes, deptosRes, usersRes] = await Promise.all([
        api.get("/tasks", { params: { pageNumber: 1, pageSize: 1000, tipo: "todas" } }),
        api.get("/tarefas-config", { params: { limit: 999999, ativo: "true" } }),
        api.get("/departamentos"),
        api.get("/users"),
      ]);

      setTasks(tasksRes.data.tasks || []);
      setTaskConfigs(configsRes.data.tarefas || []);
      setDepartamentos(safeList(deptosRes.data, "departamentos"));
      setUsers(safeList(usersRes.data, "users"));
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar dados do workflow");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedTemplates = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    const oldSavedSteps = localStorage.getItem(STORAGE_KEY);
    let initialTemplates = savedTemplates ? JSON.parse(savedTemplates) : [];

    if (initialTemplates.length === 0 && oldSavedSteps) {
      initialTemplates = [
        {
          id: String(Date.now()),
          name: "Workflow padrão",
          steps: JSON.parse(oldSavedSteps),
        },
      ];
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(initialTemplates));
    }

    setTemplates(initialTemplates);

    if (initialTemplates.length > 0) {
      const savedActiveId = localStorage.getItem(ACTIVE_TEMPLATE_STORAGE_KEY);
      const activeTemplate =
        initialTemplates.find((template) => template.id === savedActiveId) || initialTemplates[0];
      setActiveTemplateId(activeTemplate.id);
      setTemplateName(activeTemplate.name);
      setSteps(activeTemplate.steps || []);
    }

    loadData();
  }, []);

  const filteredTaskConfigs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return taskConfigs.slice(0, 25);
    return taskConfigs
      .filter((item) => `${item.titulo || ""} ${item.descricao || ""}`.toLowerCase().includes(term))
      .slice(0, 25);
  }, [taskConfigs, search]);

  const getStepStats = (step) => {
    const relatedTasks = tasks.filter((task) => {
      if (step.tarefaConfigId && task.tarefaConfigId === Number(step.tarefaConfigId)) return true;
      return task.title === step.title;
    });
    const completed = relatedTasks.filter(isCompleted).length;
    const canceled = relatedTasks.filter(isCanceled).length;
    return {
      total: relatedTasks.length,
      open: relatedTasks.length - completed - canceled,
      completed,
      late: relatedTasks.filter(isLate).length,
    };
  };

  const persistSteps = (nextSteps) => {
    setSteps(nextSteps);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSteps));

    if (activeTemplateId) {
      const nextTemplates = templates.map((template) =>
        template.id === activeTemplateId ? { ...template, steps: nextSteps } : template
      );
      setTemplates(nextTemplates);
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(nextTemplates));
    }
  };

  const persistTemplates = (nextTemplates, nextActiveId = activeTemplateId) => {
    setTemplates(nextTemplates);
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(nextTemplates));

    if (nextActiveId) {
      setActiveTemplateId(nextActiveId);
      localStorage.setItem(ACTIVE_TEMPLATE_STORAGE_KEY, nextActiveId);
    } else {
      setActiveTemplateId("");
      localStorage.removeItem(ACTIVE_TEMPLATE_STORAGE_KEY);
    }
  };

  const handleSelectTemplate = (templateId) => {
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    setActiveTemplateId(template.id);
    setTemplateName(template.name);
    setSteps(template.steps || []);
    localStorage.setItem(ACTIVE_TEMPLATE_STORAGE_KEY, template.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(template.steps || []));
  };

  const openNewStep = (taskConfig = null) => {
    setEditingStep({
      ...blankStep,
      id: Date.now(),
      title: taskConfig?.titulo || "",
      tarefaConfigId: taskConfig?.id || "",
      departamentoId: taskConfig?.departamentoId || "",
      color: taskConfig?.status?.cor || "#22a862",
    });
    setDialogOpen(true);
  };

  const openEditStep = (step) => {
    setEditingStep(step);
    setDialogOpen(true);
  };

  const saveStep = () => {
    if (!editingStep.title.trim()) {
      toast.error("Informe o nome da etapa");
      return;
    }

    const exists = steps.some((step) => step.id === editingStep.id);
    const nextSteps = exists
      ? steps.map((step) => (step.id === editingStep.id ? editingStep : step))
      : [...steps, editingStep];

    persistSteps(nextSteps);
    setDialogOpen(false);
    toast.success("Etapa salva no workflow");
  };

  const removeStep = (stepId) => {
    persistSteps(steps.filter((step) => step.id !== stepId));
  };

  const moveStep = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;
    const nextSteps = [...steps];
    const [current] = nextSteps.splice(index, 1);
    nextSteps.splice(target, 0, current);
    persistSteps(nextSteps);
  };

  const loadAberturaEmpresa = () => {
    const nextSteps = aberturaEmpresaTemplate.map((item, index) => ({
      ...blankStep,
      ...item,
      id: Date.now() + index,
    }));
    persistSteps(nextSteps);
    toast.success("Template de abertura de empresa carregado");
  };

  const saveWorkflow = () => {
    if (!templateName.trim()) {
      setTemplateDialogOpen(true);
      return;
    }

    const templateId = activeTemplateId || String(Date.now());
    const nextTemplate = {
      id: templateId,
      name: templateName.trim(),
      steps,
    };
    const exists = templates.some((template) => template.id === templateId);
    const nextTemplates = exists
      ? templates.map((template) => (template.id === templateId ? nextTemplate : template))
      : [...templates, nextTemplate];

    persistTemplates(nextTemplates, templateId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(steps));
    toast.success("Template salvo");
  };

  const createTemplate = () => {
    const name = templateName.trim();
    if (!name) {
      toast.error("Informe o nome do template");
      return;
    }

    const templateId = String(Date.now());
    const nextTemplate = { id: templateId, name, steps };
    persistTemplates([...templates, nextTemplate], templateId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(steps));
    setTemplateDialogOpen(false);
    toast.success("Template criado");
  };

  const openNewTemplateDialog = () => {
    setTemplateName("");
    setTemplateDialogOpen(true);
  };

  const deleteTemplate = () => {
    if (!activeTemplateId) return;
    const nextTemplates = templates.filter((template) => template.id !== activeTemplateId);
    const nextActiveTemplate = nextTemplates[0];

    persistTemplates(nextTemplates, nextActiveTemplate?.id || "");
    setTemplateName(nextActiveTemplate?.name || "");
    setSteps(nextActiveTemplate?.steps || []);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextActiveTemplate?.steps || []));
    toast.success("Template excluído");
  };

  const totals = useMemo(() => {
    return steps.reduce(
      (acc, step) => {
        const relatedTasks = tasks.filter((task) => {
          if (step.tarefaConfigId && task.tarefaConfigId === Number(step.tarefaConfigId)) return true;
          return task.title === step.title;
        });
        const completed = relatedTasks.filter(isCompleted).length;
        const canceled = relatedTasks.filter(isCanceled).length;
        const stats = {
          total: relatedTasks.length,
          open: relatedTasks.length - completed - canceled,
          completed,
          late: relatedTasks.filter(isLate).length,
        };
        acc.total += stats.total;
        acc.open += stats.open;
        acc.completed += stats.completed;
        acc.late += stats.late;
        return acc;
      },
      { total: 0, open: 0, completed: 0, late: 0 }
    );
  }, [steps, tasks]);

  return (
    <MainContainer fullWidth>
      <MainHeader>
        <Title>Workflow de Tarefas</Title>
        <MainHeaderButtonsWrapper>
          <FormControl variant="outlined" size="small" className={classes.templateSelect}>
            <InputLabel>Template</InputLabel>
            <Select
              label="Template"
              value={activeTemplateId}
              onChange={(event) => handleSelectTemplate(event.target.value)}
            >
              <MenuItem value="">Nenhum template</MenuItem>
              {templates.map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button startIcon={<AddIcon />} onClick={openNewTemplateDialog}>
            Novo template
          </Button>
          <Button
            startIcon={<DeleteOutlineIcon />}
            onClick={deleteTemplate}
            disabled={!activeTemplateId}
          >
            Excluir template
          </Button>
          <Button startIcon={<RefreshIcon />} onClick={loadData} disabled={loading}>
            Atualizar
          </Button>
          <Button color="primary" variant="contained" startIcon={<SaveIcon />} onClick={saveWorkflow}>
            Salvar
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.rootPaper} variant="outlined">
        <Box className={classes.sidebar}>
          <Box className={classes.sidebarHeader}>
            <Typography variant="subtitle1"><strong>Atividades</strong></Typography>
            <IconButton size="small" onClick={() => openNewStep()}>
              <AddIcon />
            </IconButton>
          </Box>
          <Divider />
          <Box className={classes.sidebarBody}>
            <TextField
              className={classes.searchField}
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Buscar tarefa cadastrada"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <Button className={classes.activityItem} onClick={loadAberturaEmpresa}>
              Template: abertura de empresa
            </Button>

            <Typography variant="caption" color="textSecondary">Tarefas cadastradas</Typography>
            {filteredTaskConfigs.map((taskConfig) => (
              <Button
                key={taskConfig.id}
                className={classes.activityItem}
                onClick={() => openNewStep(taskConfig)}
              >
                {taskConfig.titulo}
              </Button>
            ))}
          </Box>
        </Box>

        <Box className={classes.canvasShell}>
          <Box className={classes.toolbar}>
            <Typography variant="body2" color="textSecondary">
              {steps.length} etapas | {totals.total} tarefas vinculadas | {totals.open} abertas | {totals.completed} concluídas | {totals.late} atrasadas
            </Typography>
            {loading && <CircularProgress size={22} />}
          </Box>

          <Box className={classes.canvas}>
            {steps.length === 0 ? (
              <Box className={classes.emptyCanvas}>
                <Box>
                  <Typography variant="h6">Monte o fluxo usando as tarefas do sistema</Typography>
                  <Typography variant="body2">
                    Selecione uma tarefa cadastrada na lateral ou carregue o template de abertura de empresa.
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box className={classes.flowRow}>
                {steps.map((step, index) => {
                  const stats = getStepStats(step);
                  return (
                    <React.Fragment key={step.id}>
                      <Box className={classes.node} style={{ backgroundColor: step.color || "#22a862" }}>
                        <Box className={classes.nodeHeader}>
                          <Typography className={classes.nodeTitle}>{step.title}</Typography>
                          <Box className={classes.nodeActions}>
                            <IconButton onClick={() => moveStep(index, -1)} disabled={index === 0}>
                              <ArrowBackIcon fontSize="small" />
                            </IconButton>
                            <IconButton onClick={() => openEditStep(step)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton onClick={() => removeStep(step.id)}>
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        <Box className={classes.nodeBody}>
                          <Typography className={classes.nodeText} variant="body2">
                            {step.required ? "Obrigatória" : "Opcional"}
                          </Typography>
                          <Typography className={classes.nodeText} variant="body2">
                            Departamento: {departamentos.find((item) => item.id === Number(step.departamentoId))?.nome || "Não definido"}
                          </Typography>
                          <Typography className={classes.nodeText} variant="body2">
                            Usuário: {users.find((item) => item.id === Number(step.userId))?.name || "Não definido"}
                          </Typography>
                          <Box className={classes.statusStrip}>
                            <Box className={classes.statusItem}><strong>{stats.total}</strong><br />Total</Box>
                            <Box className={classes.statusItem}><strong>{stats.open}</strong><br />Abertas</Box>
                            <Box className={classes.statusItem}><strong>{stats.completed}</strong><br />Ok</Box>
                            <Box className={classes.statusItem}><strong>{stats.late}</strong><br />Atraso</Box>
                          </Box>
                        </Box>
                      </Box>

                      {index < steps.length - 1 && (
                        <Box className={classes.connector}>
                          <Box className={classes.connectorLine} />
                          <ArrowForwardIcon />
                          <Box className={classes.connectorLine} />
                        </Box>
                      )}
                    </React.Fragment>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm">
        <DialogTitle>Etapa do workflow</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <TextField
            label="Nome da etapa"
            variant="outlined"
            value={editingStep.title}
            onChange={(event) => setEditingStep({ ...editingStep, title: event.target.value })}
          />
          <FormControl variant="outlined">
            <InputLabel>Tarefa cadastrada</InputLabel>
            <Select
              label="Tarefa cadastrada"
              value={editingStep.tarefaConfigId}
              onChange={(event) => {
                const taskConfig = taskConfigs.find((item) => item.id === Number(event.target.value));
                setEditingStep({
                  ...editingStep,
                  tarefaConfigId: event.target.value,
                  title: taskConfig?.titulo || editingStep.title,
                  departamentoId: taskConfig?.departamentoId || editingStep.departamentoId,
                });
              }}
            >
              <MenuItem value="">Sem vínculo</MenuItem>
              {taskConfigs.map((item) => (
                <MenuItem key={item.id} value={item.id}>{item.titulo}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={editingStep.required}
                onChange={(event) => setEditingStep({ ...editingStep, required: event.target.checked })}
                color="primary"
              />
            }
            label="Etapa obrigatória"
          />
          <FormControl variant="outlined">
            <InputLabel>Departamento</InputLabel>
            <Select
              label="Departamento"
              value={editingStep.departamentoId}
              onChange={(event) => setEditingStep({ ...editingStep, departamentoId: event.target.value })}
            >
              <MenuItem value="">Não definido</MenuItem>
              {departamentos.map((item) => (
                <MenuItem key={item.id} value={item.id}>{item.nome}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="outlined">
            <InputLabel>Usuário responsável</InputLabel>
            <Select
              label="Usuário responsável"
              value={editingStep.userId}
              onChange={(event) => setEditingStep({ ...editingStep, userId: event.target.value })}
            >
              <MenuItem value="">Não definido</MenuItem>
              {users.map((item) => (
                <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Cor"
            variant="outlined"
            type="color"
            value={editingStep.color}
            onChange={(event) => setEditingStep({ ...editingStep, color: event.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button color="primary" variant="contained" onClick={saveStep}>Salvar etapa</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Novo template de etapas</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <TextField
            label="Nome do template"
            variant="outlined"
            value={templateName}
            onChange={(event) => setTemplateName(event.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>Cancelar</Button>
          <Button color="primary" variant="contained" onClick={createTemplate}>Criar template</Button>
        </DialogActions>
      </Dialog>
    </MainContainer>
  );
};

export default FluxogramaWorkflow;
