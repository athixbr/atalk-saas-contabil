import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  Menu,
  MenuItem
} from "@material-ui/core";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon
} from "@material-ui/icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import CrmTaskModal from "../../components/CrmTaskModal";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  pipelineContainer: {
    display: "flex",
    gap: theme.spacing(2),
    overflowX: "auto",
    paddingBottom: theme.spacing(2),
    minHeight: "calc(100vh - 200px)",
  },
  stageColumn: {
    minWidth: 300,
    maxWidth: 300,
    backgroundColor: "#f5f5f5",
    borderRadius: theme.spacing(1),
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
  },
  stageHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(2),
  },
  stageTitle: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: "50%",
  },
  taskCard: {
    marginBottom: theme.spacing(1),
    cursor: "pointer",
    "&:hover": {
      boxShadow: theme.shadows[4],
    },
  },
  taskTitle: {
    fontWeight: 500,
    marginBottom: theme.spacing(1),
  },
  taskInfo: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
  },
  taskFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priorityChip: {
    height: 20,
    fontSize: "0.75rem",
  },
  addButton: {
    backgroundColor: "transparent",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04)",
    },
  },
  emptyState: {
    textAlign: "center",
    color: theme.palette.text.secondary,
    padding: theme.spacing(3),
  },
}));

const priorityColors = {
  low: "#4caf50",
  medium: "#ff9800",
  high: "#f44336",
};

const priorityLabels = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

const CrmTasksPipeline = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const [stages, setStages] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);

  useEffect(() => {
    loadStages();
    loadTasks();
  }, []);

  const loadStages = async () => {
    try {
      const { data } = await api.get("/crm/task-stages");
      setStages(data.stages || []);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar etapas");
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/crm/tasks");
      setTasks(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar tarefas");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) return;

    const taskId = parseInt(draggableId);
    const newStageId = parseInt(destination.droppableId);

    try {
      await api.put(`/crm/tasks/${taskId}`, { stageId: newStageId });
      
      // Atualizar localmente
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, stageId: newStageId } : task
        )
      );
      
      toast.success("Tarefa movida com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao mover tarefa");
    }
  };

  const handleOpenTaskModal = (stageId = null) => {
    setSelectedStageId(stageId);
    setSelectedTask(null);
    setTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
    handleMenuClose();
  };

  const handleDeleteTask = async (task) => {
    handleMenuClose();
    if (window.confirm(`Tem certeza que deseja excluir a tarefa "${task.title}"?`)) {
      try {
        await api.delete(`/crm/tasks/${task.id}`);
        toast.success("Tarefa excluída com sucesso!");
        loadTasks();
      } catch (err) {
        console.error(err);
        toast.error("Erro ao excluir tarefa");
      }
    }
  };

  const handleMenuOpen = (event, task) => {
    setAnchorEl(event.currentTarget);
    setCurrentTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentTask(null);
  };

  const getTasksByStage = (stageId) => {
    return tasks.filter((task) => task.stageId === stageId);
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Pipeline de Tarefas</Title>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Box className={classes.pipelineContainer}>
            {stages.map((stage) => (
              <Droppable key={stage.id} droppableId={String(stage.id)}>
                {(provided) => (
                  <Box
                    className={classes.stageColumn}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <Box className={classes.stageHeader}>
                      <Box className={classes.stageTitle}>
                        <Box
                          className={classes.colorIndicator}
                          style={{ backgroundColor: stage.color }}
                        />
                        <Typography variant="h6">{stage.name}</Typography>
                        <Chip
                          label={getTasksByStage(stage.id).length}
                          size="small"
                        />
                      </Box>
                      <IconButton
                        size="small"
                        className={classes.addButton}
                        onClick={() => handleOpenTaskModal(stage.id)}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>

                    {getTasksByStage(stage.id).length === 0 ? (
                      <Box className={classes.emptyState}>
                        <Typography variant="body2">
                          Nenhuma tarefa nesta etapa
                        </Typography>
                      </Box>
                    ) : (
                      getTasksByStage(stage.id).map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={String(task.id)}
                          index={index}
                        >
                          {(provided) => (
                            <Card
                              className={classes.taskCard}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <CardContent>
                                <Typography className={classes.taskTitle}>
                                  {task.title}
                                </Typography>

                                {task.lead && (
                                  <Box className={classes.taskInfo}>
                                    <PersonIcon fontSize="small" />
                                    <Typography variant="body2">
                                      Lead: {task.lead.name}
                                    </Typography>
                                  </Box>
                                )}

                                {task.cliente && (
                                  <Box className={classes.taskInfo}>
                                    <BusinessIcon fontSize="small" />
                                    <Typography variant="body2">
                                      Cliente: {task.cliente.nome || task.cliente.razaoSocial}
                                    </Typography>
                                  </Box>
                                )}

                                {task.dueDate && (
                                  <Box className={classes.taskInfo}>
                                    <CalendarIcon fontSize="small" />
                                    <Typography variant="body2">
                                      {format(new Date(task.dueDate), "dd/MM/yyyy", {
                                        locale: ptBR,
                                      })}
                                    </Typography>
                                  </Box>
                                )}
                              </CardContent>

                              <CardActions className={classes.taskFooter}>
                                <Chip
                                  label={priorityLabels[task.priority]}
                                  size="small"
                                  className={classes.priorityChip}
                                  style={{
                                    backgroundColor: priorityColors[task.priority],
                                    color: "#fff",
                                  }}
                                />
                                <Box>
                                  {task.user && (
                                    <Tooltip title={task.user.name}>
                                      <Avatar
                                        alt={task.user.name}
                                        src={task.user.profileImage}
                                        style={{ width: 24, height: 24 }}
                                      />
                                    </Tooltip>
                                  )}
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleMenuOpen(e, task)}
                                  >
                                    <MoreVertIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </CardActions>
                            </Card>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            ))}
          </Box>
        </DragDropContext>
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEditTask(currentTask)}>Editar</MenuItem>
        <MenuItem onClick={() => handleDeleteTask(currentTask)}>Excluir</MenuItem>
      </Menu>

      <CrmTaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSuccess={() => {
          loadTasks();
          setTaskModalOpen(false);
        }}
        task={selectedTask}
        defaultStageId={selectedStageId}
      />
    </MainContainer>
  );
};

export default CrmTasksPipeline;
