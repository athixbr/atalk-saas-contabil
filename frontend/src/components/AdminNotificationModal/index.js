import React, { useState, useEffect, useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Chip
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import moment from "moment";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { socketConnection } from "../../services/socket";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    fontWeight: "bold",
    paddingBottom: theme.spacing(2)
  },
  dialogContent: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    minHeight: 200,
    maxHeight: 400,
    overflow: "auto"
  },
  messageText: {
    whiteSpace: "pre-line",
    lineHeight: 1.6,
    marginBottom: theme.spacing(2),
    fontSize: "0.95rem"
  },
  metaInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(1),
    borderTop: `1px solid ${theme.palette.divider}`
  },
  priorityChip: {
    marginRight: theme.spacing(1)
  },
  dialogActions: {
    padding: theme.spacing(2),
    justifyContent: "space-between"
  },
  dismissButton: {
    color: theme.palette.error.main
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200
  }
}));

const AdminNotificationModal = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadNotifications();

    // Setup socket para receber notificações em tempo real
    if (user?.companyId) {
      const socket = socketConnection({ companyId: user.companyId, userId: user.id });

      socket.on(`user${user.id}-admin-notification`, (data) => {
        if (data.action === "new") {
          setNotifications((prev) => [data.record, ...prev]);
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/announcements/admin/notifications");
      
      // Ordenar por mais recente primeiro
      const sorted = Array.isArray(data) 
        ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];
      
      setNotifications(sorted);
      setCurrentIndex(0);
    } catch (err) {
      toastError(err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const currentNotification = notifications[currentIndex];
  const isOpen = currentNotification && !loading;

  const handleDismiss = async () => {
    if (!currentNotification) return;

    try {
      setActionLoading(true);
      await api.patch(`/announcements/${currentNotification.id}/dismiss`);
      
      const newNotifications = notifications.filter((_, idx) => idx !== currentIndex);
      setNotifications(newNotifications);
      
      if (currentIndex >= newNotifications.length) {
        setCurrentIndex(Math.max(0, newNotifications.length - 1));
      }
    } catch (err) {
      toastError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkRead = async () => {
    if (!currentNotification) return;

    try {
      setActionLoading(true);
      await api.patch(`/announcements/${currentNotification.id}/read`);
      
      const newNotifications = notifications.filter((_, idx) => idx !== currentIndex);
      setNotifications(newNotifications);
      
      if (currentIndex >= newNotifications.length) {
        setCurrentIndex(Math.max(0, newNotifications.length - 1));
      }
    } catch (err) {
      toastError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      1: { label: "Alta", color: "secondary" },
      2: { label: "Média", color: "default" },
      3: { label: "Baixa", color: "primary" }
    };
    return labels[priority] || { label: "Normal", color: "default" };
  };

  const priorityInfo = getPriorityLabel(currentNotification?.priority);

  return (
    <Dialog
      open={isOpen}
      onClose={handleDismiss}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: "8px"
        }
      }}
    >
      <DialogTitle className={classes.dialogTitle}>
        {currentNotification?.title}
      </DialogTitle>

      <DialogContent className={classes.dialogContent}>
        {loading ? (
          <Box className={classes.loadingContainer}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography className={classes.messageText}>
              {currentNotification?.text}
            </Typography>

            {currentNotification?.mediaPath && (
              <Box
                style={{
                  marginBottom: "16px",
                  textAlign: "center",
                  border: "1px solid #e0e0e0",
                  borderRadius: "4px",
                  overflow: "hidden"
                }}
              >
                <img
                  src={currentNotification.mediaPath}
                  alt="Notificação"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "300px",
                    objectFit: "cover"
                  }}
                />
              </Box>
            )}

            <Box className={classes.metaInfo}>
              <Chip
                label={priorityInfo.label}
                color={priorityInfo.color}
                size="small"
                className={classes.priorityChip}
              />
              <Typography variant="caption" color="textSecondary">
                {moment(currentNotification?.createdAt).format("DD/MM/YYYY HH:mm")}
              </Typography>
            </Box>

            {notifications.length > 1 && (
              <Typography variant="caption" color="textSecondary" style={{ marginTop: "8px", display: "block" }}>
                {currentIndex + 1} de {notifications.length} notificações
              </Typography>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions className={classes.dialogActions}>
        <Button
          onClick={handleDismiss}
          color="secondary"
          disabled={actionLoading}
          className={classes.dismissButton}
        >
          Fechar/Descartar
        </Button>
        <Button
          onClick={handleMarkRead}
          color="primary"
          variant="contained"
          disabled={actionLoading}
        >
          {actionLoading ? <CircularProgress size={20} /> : "Marcar como Lida"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminNotificationModal;
