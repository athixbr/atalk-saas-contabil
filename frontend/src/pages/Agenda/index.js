import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import {
  Paper,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Switch,
  Grid,
  Badge,
  Chip,
  ButtonGroup,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from "@material-ui/core";
import {
  ChevronLeft,
  ChevronRight,
  Today,
  Visibility,
  Add,
  OpenInNew,
} from "@material-ui/icons";
import { toast } from "react-toastify";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  isToday,
  isBefore,
  startOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(3),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2),
    },
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    flexWrap: "wrap",
    gap: theme.spacing(2),
  },
  navigation: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  monthYear: {
    fontWeight: 600,
    fontSize: "1.5rem",
    minWidth: "200px",
    textAlign: "center",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    flexWrap: "wrap",
  },
  calendar: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1),
    },
  },
  weekDays: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      gap: theme.spacing(0.5),
    },
  },
  weekDay: {
    textAlign: "center",
    fontWeight: 600,
    padding: theme.spacing(1),
    color: theme.palette.text.secondary,
    fontSize: "0.875rem",
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.75rem",
      padding: theme.spacing(0.5),
    },
  },
  daysGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      gap: theme.spacing(0.5),
    },
  },
  dayCell: {
    aspectRatio: "1",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: theme.spacing(1),
    cursor: "pointer",
    position: "relative",
    transition: "all 0.2s",
    "&:hover": {
      backgroundColor: "#f5f5f5",
      transform: "scale(1.05)",
      boxShadow: theme.shadows[2],
    },
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(0.5),
      borderRadius: "4px",
    },
  },
  dayCellToday: {
    backgroundColor: "#e3f2fd",
    border: "2px solid #2196f3",
  },
  dayCellOtherMonth: {
    opacity: 0.3,
  },
  dayNumber: {
    fontSize: "0.875rem",
    fontWeight: 500,
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.75rem",
    },
  },
  taskBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    minWidth: "24px",
    height: "24px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#fff",
    [theme.breakpoints.down("sm")]: {
      minWidth: "20px",
      height: "20px",
      fontSize: "0.65rem",
    },
  },
  modalContent: {
    minWidth: "400px",
    maxHeight: "60vh",
    overflowY: "auto",
    [theme.breakpoints.down("sm")]: {
      minWidth: "100%",
    },
  },
  taskItem: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1.5),
    borderRadius: "8px",
    marginBottom: theme.spacing(1),
    backgroundColor: "#f5f5f5",
    "&:hover": {
      backgroundColor: "#eeeeee",
    },
  },
  taskCompleted: {
    opacity: 0.6,
    textDecoration: "line-through",
  },
  dayView: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: theme.spacing(3),
  },
  dayViewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
}));

const Agenda = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showMyTasks, setShowMyTasks] = useState(true);
  const [viewMode, setViewMode] = useState("month"); // "month" ou "day"

  useEffect(() => {
    loadTasks();
  }, [currentDate, showMyTasks]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const params = {
        pageNumber: 1,
      };

      if (showMyTasks) {
        params.userId = user.id;
      }

      const { data } = await api.get("/tasks", { params });
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
      toast.error("Erro ao carregar tarefas");
    } finally {
      setLoading(false);
    }
  };

  const getMonthDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { locale: ptBR });
    const endDate = endOfWeek(monthEnd, { locale: ptBR });

    return eachDayOfInterval({ start: startDate, end: endDate });
  };

  const getTasksForDay = (day) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), day);
    });
  };

  const getTaskPriority = (dayTasks) => {
    if (dayTasks.length === 0) return null;

    const today = startOfDay(new Date());
    const hasOverdue = dayTasks.some(
      (task) =>
        task.status !== "Concluída" &&
        isBefore(startOfDay(new Date(task.dueDate)), today)
    );
    const hasToday = dayTasks.some((task) =>
      isSameDay(new Date(task.dueDate), today)
    );
    const allCompleted = dayTasks.every((task) => task.status === "Concluída");

    if (hasOverdue) return "overdue"; // Vermelho
    if (allCompleted) return "completed"; // Verde
    if (hasToday) return "today"; // Laranja
    return "future"; // Azul
  };

  const getBadgeColor = (priority) => {
    switch (priority) {
      case "overdue":
        return "#f44336";
      case "today":
        return "#ff9800";
      case "completed":
        return "#4caf50";
      case "future":
        return "#2196f3";
      default:
        return "#9e9e9e";
    }
  };

  const handleDayClick = (day) => {
    setSelectedDate(day);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDate(null);
  };

  const handleToggleTaskStatus = async (task) => {
    try {
      const newStatus = task.status === "Concluída" ? "Pendente" : "Concluída";
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      toast.success(`Tarefa ${newStatus === "Concluída" ? "concluída" : "reaberta"}`);
      loadTasks();
    } catch (error) {
      toast.error("Erro ao atualizar tarefa");
    }
  };

  const handleViewTask = (task) => {
    history.push(`/tarefas`);
  };

  const handleCreateTask = () => {
    history.push(`/tarefas`);
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    if (viewMode === "day") {
      setSelectedDate(new Date());
    }
  };

  const sortTasksByPriority = (dayTasks) => {
    const today = startOfDay(new Date());
    return [...dayTasks].sort((a, b) => {
      const aDate = startOfDay(new Date(a.dueDate));
      const bDate = startOfDay(new Date(b.dueDate));

      // Atrasadas primeiro
      const aOverdue = a.status !== "Concluída" && isBefore(aDate, today);
      const bOverdue = b.status !== "Concluída" && isBefore(bDate, today);
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      // Pendentes antes de concluídas
      if (a.status !== "Concluída" && b.status === "Concluída") return -1;
      if (a.status === "Concluída" && b.status !== "Concluída") return 1;

      return 0;
    });
  };

  const renderMonthView = () => {
    const days = getMonthDays();
    const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    return (
      <Paper className={classes.calendar} elevation={0}>
        <div className={classes.weekDays}>
          {weekDays.map((day) => (
            <div key={day} className={classes.weekDay}>
              {day}
            </div>
          ))}
        </div>

        <div className={classes.daysGrid}>
          {days.map((day) => {
            const dayTasks = getTasksForDay(day);
            const priority = getTaskPriority(dayTasks);
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div
                key={day.toString()}
                className={`${classes.dayCell} ${
                  isToday(day) ? classes.dayCellToday : ""
                } ${!isCurrentMonth ? classes.dayCellOtherMonth : ""}`}
                onClick={() => handleDayClick(day)}
              >
                <div className={classes.dayNumber}>{format(day, "d")}</div>
                {dayTasks.length > 0 && (
                  <div
                    className={classes.taskBadge}
                    style={{ backgroundColor: getBadgeColor(priority) }}
                  >
                    {dayTasks.length}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Paper>
    );
  };

  const renderDayView = () => {
    const viewDate = selectedDate || new Date();
    const dayTasks = sortTasksByPriority(getTasksForDay(viewDate));

    return (
      <Paper className={classes.dayView} elevation={0}>
        <div className={classes.dayViewHeader}>
          <IconButton onClick={() => setSelectedDate(subMonths(viewDate, 1))}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h5">
            {format(viewDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </Typography>
          <IconButton onClick={() => setSelectedDate(addMonths(viewDate, 1))}>
            <ChevronRight />
          </IconButton>
        </div>

        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleCreateTask}
          style={{ marginBottom: 16 }}
        >
          Nova Tarefa
        </Button>

        {dayTasks.length === 0 ? (
          <div className={classes.emptyState}>
            <Typography variant="body1">Nenhuma tarefa para este dia</Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleCreateTask}
              style={{ marginTop: 16 }}
            >
              Criar Primeira Tarefa
            </Button>
          </div>
        ) : (
          <List>
            {dayTasks.map((task, index) => (
              <React.Fragment key={task.id}>
                <ListItem className={classes.taskItem}>
                  <Checkbox
                    checked={task.status === "Concluída"}
                    onChange={() => handleToggleTaskStatus(task)}
                    color="primary"
                  />
                  <ListItemText
                    primary={task.title}
                    secondary={task.user?.name || "Sem responsável"}
                    className={
                      task.status === "Concluída" ? classes.taskCompleted : ""
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleViewTask(task)}
                    >
                      <Visibility />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < dayTasks.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    );
  };

  const renderTaskModal = () => {
    if (!selectedDate) return null;

    const dayTasks = sortTasksByPriority(getTasksForDay(selectedDate));

    return (
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Tarefas - {format(selectedDate, "dd/MM/yyyy")}
        </DialogTitle>
        <DialogContent className={classes.modalContent}>
          {dayTasks.length === 0 ? (
            <div className={classes.emptyState}>
              <Typography variant="body2">Nenhuma tarefa para este dia</Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => {
                  handleCloseModal();
                  handleCreateTask();
                }}
                style={{ marginTop: 16 }}
              >
                Criar Primeira Tarefa
              </Button>
            </div>
          ) : (
            <List>
              {dayTasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  <ListItem className={classes.taskItem}>
                    <Checkbox
                      checked={task.status === "Concluída"}
                      onChange={() => handleToggleTaskStatus(task)}
                      color="primary"
                    />
                    <ListItemText
                      primary={task.title}
                      secondary={task.user?.name || "Sem responsável"}
                      className={
                        task.status === "Concluída" ? classes.taskCompleted : ""
                      }
                    />
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleViewTask(task)}
                    >
                      <Visibility />
                    </IconButton>
                  </ListItem>
                  {index < dayTasks.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Fechar</Button>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => {
              handleCloseModal();
              handleCreateTask();
            }}
          >
            Nova Tarefa
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<OpenInNew />}
            onClick={() => {
              handleCloseModal();
              handleViewTask();
            }}
          >
            Abrir Tarefas
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <div className={classes.navigation}>
          <IconButton onClick={handlePrevMonth}>
            <ChevronLeft />
          </IconButton>
          <Typography className={classes.monthYear}>
            {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
          </Typography>
          <IconButton onClick={handleNextMonth}>
            <ChevronRight />
          </IconButton>
        </div>

        <div className={classes.controls}>
          <FormControlLabel
            control={
              <Switch
                checked={showMyTasks}
                onChange={(e) => setShowMyTasks(e.target.checked)}
                color="primary"
              />
            }
            label="Minhas Tarefas"
          />

          <ButtonGroup size="small" variant="outlined">
            <Button
              variant={viewMode === "month" ? "contained" : "outlined"}
              color={viewMode === "month" ? "primary" : "default"}
              onClick={() => setViewMode("month")}
            >
              Mês
            </Button>
            <Button
              variant={viewMode === "day" ? "contained" : "outlined"}
              color={viewMode === "day" ? "primary" : "default"}
              onClick={() => setViewMode("day")}
            >
              Dia
            </Button>
          </ButtonGroup>

          <Button
            variant="outlined"
            startIcon={<Today />}
            onClick={handleToday}
          >
            Hoje
          </Button>
        </div>
      </div>

      {viewMode === "month" ? renderMonthView() : renderDayView()}
      {renderTaskModal()}
    </div>
  );
};

export default Agenda;
