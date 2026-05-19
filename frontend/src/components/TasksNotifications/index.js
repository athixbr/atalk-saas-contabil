import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import Badge from "@material-ui/core/Badge";
import Popover from "@material-ui/core/Popover";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import { TaskSquare } from "iconsax-react";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { socketConnection } from "../../services/socket";

const useStyles = makeStyles((theme) => ({
  popover: {
    width: "350px",
    maxHeight: "400px",
  },
  header: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
  },
  listItem: {
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  emptyList: {
    padding: theme.spacing(3),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  taskTitle: {
    fontWeight: 600,
  },
  taskDate: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
  },
  urgent: {
    borderLeft: `4px solid ${theme.palette.error.main}`,
  },
  warning: {
    borderLeft: `4px solid ${theme.palette.warning.main}`,
  },
  footer: {
    padding: theme.spacing(1),
    textAlign: "center",
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  viewAllButton: {
    width: "100%",
    textTransform: "none",
  },
}));

const TasksNotifications = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    loadPendingTasks();
  }, []);

  useEffect(() => {
    const companyId = user?.companyId;
    if (!companyId) return;

    const socket = socketConnection({ companyId });

    socket.on(`company${companyId}-task`, (data) => {
      if (data.action === "create" || data.action === "update" || data.action === "delete") {
        loadPendingTasks();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const loadPendingTasks = async () => {
    try {
      const { data } = await api.get("/tasks?status=Pendente");
      const tasksList = data.tasks || [];
      setTasks(tasksList.slice(0, 5)); // Mostrar apenas as 5 primeiras
      setPendingCount(tasksList.length);
    } catch (err) {
      console.error("Erro ao carregar tarefas pendentes:", err);
      setTasks([]);
      setPendingCount(0);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTaskClick = (taskId) => {
    setAnchorEl(null);
    history.push(`/tarefas?taskId=${taskId}`);
  };

  const handleViewAllTasks = () => {
    setAnchorEl(null);
    history.push("/tarefas");
  };

  const isUrgent = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffHours = (due - now) / (1000 * 60 * 60);
    return diffHours < 24;
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label="notificações de tarefas"
      >
        <Badge badgeContent={pendingCount} color="error">
          <TaskSquare size={24} color="#fff" />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <div className={classes.popover}>
          <div className={classes.header}>
            <Typography variant="h6">Tarefas Pendentes</Typography>
            <Typography variant="caption">
              {pendingCount} tarefa(s) aguardando
            </Typography>
          </div>
          <Divider />
          {tasks.length === 0 ? (
            <div className={classes.emptyList}>
              <Typography variant="body2">
                Nenhuma tarefa pendente! 🎉
              </Typography>
            </div>
          ) : (
            <>
              <List>
                {tasks.map((task) => (
                  <React.Fragment key={task.id}>
                    <ListItem
                      button
                      onClick={() => handleTaskClick(task.id)}
                      className={`${classes.listItem} ${
                        isUrgent(task.dueDate) ? classes.urgent : classes.warning
                      }`}
                    >
                      <ListItemText
                        primary={
                          <Typography className={classes.taskTitle}>
                            {task.title}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography component="span" variant="body2">
                              {task.contact?.name || "Sem contato"}
                            </Typography>
                            <br />
                            <Typography
                              component="span"
                              className={classes.taskDate}
                            >
                              Vence:{" "}
                              {new Date(task.dueDate).toLocaleString("pt-BR")}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
              <div className={classes.footer}>
                <Button
                  className={classes.viewAllButton}
                  color="primary"
                  onClick={handleViewAllTasks}
                >
                  Ver todas as tarefas
                </Button>
              </div>
            </>
          )}
        </div>
      </Popover>
    </>
  );
};

export default TasksNotifications;
