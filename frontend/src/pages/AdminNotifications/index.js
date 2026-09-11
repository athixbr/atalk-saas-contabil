import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { makeStyles } from "@material-ui/core/styles";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import AddIcon from "@material-ui/icons/Add";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import ScheduleIcon from "@material-ui/icons/Schedule";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import { toast } from "react-toastify";
import MainHeader from "../../components/MainHeader";

const toDateTimeLocal = (date) => {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(2),
  },
  card: {
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  buttonContainer: {
    display: "flex",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  formContainer: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "400px",
  },
}));

const AdminNotifications = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [users, setUsers] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const attachmentInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    text: "",
    usuariosIds: [],
    departamentosIds: [],
    expirationDays: 0,
    sendOption: "now",
    scheduledAt: "",
    mediaName: null,
    mediaPath: null,
  });

  useEffect(() => {
    loadNotifications();
    loadUsersAndDepartamentos();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/announcements/list", {
        params: { companyId: user.companyId },
      });

      const notificationsArray = Array.isArray(data) ? data : [];

      // Filtrar para pegar apenas admin_notifications
      const adminNotifications = notificationsArray.filter(
        (n) => n.tipo === "admin_notification"
      );

      setNotifications(adminNotifications);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
      toast.error("Erro ao carregar notificações");
      setNotifications([]);
    }
    setLoading(false);
  };

  const loadUsersAndDepartamentos = async () => {
    setLoadingData(true);
    try {
      const [usersRes, depRes] = await Promise.all([
        api.get("/users"),
        api.get("/departamentos"),
      ]);
      setUsers(usersRes.data.users || []);
      setDepartamentos(depRes.data.departamentos || []);
    } catch (error) {
      toast.error("Erro ao carregar usuários e departamentos");
      console.error(error);
    }
    setLoadingData(false);
  };

  const handleOpenDialog = (notification = null) => {
    if (notification) {
      const isPendingSchedule =
        notification.scheduledAt && !notification.notifiedAt;
      setFormData({
        title: notification.title || "",
        text: notification.text || "",
        usuariosIds: notification.usuariosIds || [],
        departamentosIds: notification.departamentosIds || [],
        expirationDays: 0,
        sendOption: isPendingSchedule ? "schedule" : "now",
        scheduledAt: isPendingSchedule
          ? toDateTimeLocal(notification.scheduledAt)
          : "",
        mediaName: notification.mediaName || null,
        mediaPath: notification.mediaPath || null,
      });
      setEditingId(notification.id);
    } else {
      setFormData({
        title: "",
        text: "",
        usuariosIds: [],
        departamentosIds: [],
        expirationDays: 0,
        sendOption: "now",
        scheduledAt: "",
        mediaName: null,
        mediaPath: null,
      });
      setEditingId(null);
    }
    setAttachment(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setAttachment(null);
  };

  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment(file);
    }
  };

  const handleRemoveAttachment = async () => {
    if (attachment) {
      setAttachment(null);
      if (attachmentInputRef.current) {
        attachmentInputRef.current.value = null;
      }
      return;
    }

    if (editingId && formData.mediaPath) {
      try {
        await api.delete(`/announcements/${editingId}/media-upload`);
        setFormData((prev) => ({ ...prev, mediaPath: null, mediaName: null }));
        toast.success("Arquivo removido");
      } catch (error) {
        toast.error("Erro ao remover arquivo");
        console.error(error);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Preencha o título");
      return;
    }
    if (!formData.text.trim()) {
      toast.error("Preencha a mensagem");
      return;
    }
    if (
      formData.usuariosIds.length === 0 &&
      formData.departamentosIds.length === 0
    ) {
      toast.error("Selecione pelo menos um usuário ou departamento");
      return;
    }
    if (formData.sendOption === "schedule" && !formData.scheduledAt) {
      toast.error("Selecione a data e hora do agendamento");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        text: formData.text,
        tipo: "admin_notification",
        priority: 2,
        status: true,
        usuariosIds: formData.usuariosIds,
        departamentosIds: formData.departamentosIds,
        expirationDays: formData.expirationDays,
        scheduledAt:
          formData.sendOption === "schedule" && formData.scheduledAt
            ? new Date(formData.scheduledAt).toISOString()
            : null,
      };

      let savedRecord = null;

      if (editingId) {
        const { data } = await api.put(`/announcements/${editingId}`, payload);
        savedRecord = data;
        toast.success("Notificação atualizada com sucesso");
      } else {
        const { data } = await api.post("/announcements", payload);
        savedRecord = data;
        toast.success("Notificação criada com sucesso");
      }

      if (attachment && savedRecord?.id) {
        const mediaFormData = new FormData();
        mediaFormData.append("typeArch", "announcements");
        mediaFormData.append("file", attachment);
        await api.post(
          `/announcements/${savedRecord.id}/media-upload`,
          mediaFormData
        );
      }

      handleCloseDialog();
      loadNotifications();
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao salvar notificação");
      console.error(error);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar esta notificação?")) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/announcements/${id}`);
      toast.success("Notificação deletada com sucesso");
      loadNotifications();
    } catch (error) {
      toast.error("Erro ao deletar notificação");
      console.error(error);
    }
    setLoading(false);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getUserName = (id) => {
    const user = users.find((u) => u.id === id);
    return user ? user.name : `Usuário ${id}`;
  };

  const getDepartamentoName = (id) => {
    const dep = departamentos.find((d) => d.id === id);
    return dep ? dep.nome : `Departamento ${id}`;
  };

  if (!user || user.profile !== "admin") {
    return (
      <Box className={classes.container}>
        <Alert severity="error">
          Você não tem permissão para acessar esta página
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <MainHeader />
      <Box className={classes.container}>
        <Card className={classes.card}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Gestão de Avisos para Usuários
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Crie notificações automáticas que aparecem para usuários
              selecionados na próxima vez que acessarem o sistema.
            </Typography>

            <Box className={classes.buttonContainer}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Nova Notificação
              </Button>
            </Box>

            {loading && (
              <Box className={classes.loadingContainer}>
                <CircularProgress />
              </Box>
            )}

            {!loading && notifications.length === 0 ? (
              <Alert severity="info">
                Nenhuma notificação criada ainda
              </Alert>
            ) : (
              !loading && (
                <TableContainer component={Paper}>
                  <Table className={classes.table}>
                    <TableHead>
                      <TableRow style={{ backgroundColor: "#f5f5f5" }}>
                        <TableCell>Título</TableCell>
                        <TableCell>Usuários</TableCell>
                        <TableCell>Departamentos</TableCell>
                        <TableCell>Expiração</TableCell>
                        <TableCell>Envio</TableCell>
                        <TableCell align="right">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {notifications.map((notification) => (
                        <TableRow key={notification.id}>
                          <TableCell>
                            <Tooltip title={notification.text || ""}>
                              <span>
                                {notification.title
                                  ? `${notification.title.substring(0, 30)}${
                                      notification.title.length > 30
                                        ? "..."
                                        : ""
                                    }`
                                  : "Sem título"}
                              </span>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            {notification.usuariosIds &&
                            notification.usuariosIds.length > 0 ? (
                              <Box>
                                {notification.usuariosIds
                                  .slice(0, 2)
                                  .map((userId) => (
                                    <Chip
                                      key={userId}
                                      label={getUserName(userId)}
                                      size="small"
                                      className={classes.chip}
                                    />
                                  ))}
                                {notification.usuariosIds.length > 2 && (
                                  <Chip
                                    label={`+${
                                      notification.usuariosIds.length - 2
                                    }`}
                                    size="small"
                                    className={classes.chip}
                                  />
                                )}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {notification.departamentosIds &&
                            notification.departamentosIds.length > 0 ? (
                              <Box>
                                {notification.departamentosIds
                                  .slice(0, 2)
                                  .map((depId) => (
                                    <Chip
                                      key={depId}
                                      label={getDepartamentoName(depId)}
                                      size="small"
                                      className={classes.chip}
                                    />
                                  ))}
                                {notification.departamentosIds.length > 2 && (
                                  <Chip
                                    label={`+${
                                      notification.departamentosIds.length - 2
                                    }`}
                                    size="small"
                                    className={classes.chip}
                                  />
                                )}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {notification.expiresAt
                              ? new Date(
                                  notification.expiresAt
                                ).toLocaleDateString("pt-BR")
                              : "Sem expiração"}
                          </TableCell>
                          <TableCell>
                            {notification.scheduledAt && !notification.notifiedAt ? (
                              <Chip
                                icon={<ScheduleIcon />}
                                size="small"
                                label={`Agendado: ${new Date(
                                  notification.scheduledAt
                                ).toLocaleString("pt-BR")}`}
                              />
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                {notification.notifiedAt
                                  ? `Enviado em ${new Date(
                                      notification.notifiedAt
                                    ).toLocaleString("pt-BR")}`
                                  : "Enviado"}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(notification)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Deletar">
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => handleDelete(notification.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Dialog de Formulário */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? "Editar Notificação" : "Nova Notificação"}
        </DialogTitle>
        <DialogContent>
          <Box className={classes.formContainer} style={{ marginTop: 16 }}>
            <TextField
              label="Título"
              fullWidth
              value={formData.title}
              onChange={(e) => handleFormChange("title", e.target.value)}
              placeholder="Ex: Parabéns! Você recebeu um bônus"
            />

            <TextField
              label="Mensagem"
              fullWidth
              multiline
              rows={4}
              value={formData.text}
              onChange={(e) => handleFormChange("text", e.target.value)}
              placeholder="Mensagem que será exibida para o usuário"
            />

            <FormControl fullWidth>
              <InputLabel>Usuários</InputLabel>
              <Select
                multiple
                value={formData.usuariosIds}
                onChange={(e) =>
                  handleFormChange(
                    "usuariosIds",
                    Array.isArray(e.target.value)
                      ? e.target.value
                      : [e.target.value]
                  )
                }
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((userId) => (
                      <Chip
                        key={userId}
                        label={getUserName(userId)}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Departamentos</InputLabel>
              <Select
                multiple
                value={formData.departamentosIds}
                onChange={(e) =>
                  handleFormChange(
                    "departamentosIds",
                    Array.isArray(e.target.value)
                      ? e.target.value
                      : [e.target.value]
                  )
                }
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((depId) => (
                      <Chip
                        key={depId}
                        label={getDepartamentoName(depId)}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              >
                {departamentos.map((dep) => (
                  <MenuItem key={dep.id} value={dep.id}>
                    {dep.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Expiração</InputLabel>
              <Select
                value={formData.expirationDays}
                onChange={(e) =>
                  handleFormChange("expirationDays", e.target.value)
                }
              >
                <MenuItem value={0}>Sem expiração</MenuItem>
                <MenuItem value={1}>1 dia</MenuItem>
                <MenuItem value={3}>3 dias</MenuItem>
                <MenuItem value={7}>7 dias</MenuItem>
                <MenuItem value={15}>15 dias</MenuItem>
                <MenuItem value={30}>30 dias</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Envio</InputLabel>
              <Select
                value={formData.sendOption}
                onChange={(e) =>
                  handleFormChange("sendOption", e.target.value)
                }
              >
                <MenuItem value="now">Enviar agora</MenuItem>
                <MenuItem value="schedule">Agendar envio</MenuItem>
              </Select>
            </FormControl>

            {formData.sendOption === "schedule" && (
              <TextField
                label="Data e hora do envio"
                type="datetime-local"
                fullWidth
                value={formData.scheduledAt}
                onChange={(e) =>
                  handleFormChange("scheduledAt", e.target.value)
                }
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: toDateTimeLocal(new Date()) }}
              />
            )}

            <input
              type="file"
              ref={attachmentInputRef}
              style={{ display: "none" }}
              onChange={handleAttachmentChange}
            />

            {attachment || formData.mediaPath ? (
              <Box display="flex" alignItems="center">
                <Chip
                  icon={<AttachFileIcon />}
                  label={attachment ? attachment.name : formData.mediaName}
                  onDelete={handleRemoveAttachment}
                />
              </Box>
            ) : (
              <Button
                variant="outlined"
                startIcon={<AttachFileIcon />}
                onClick={() => attachmentInputRef.current.click()}
              >
                Anexar arquivo
              </Button>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSave}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminNotifications;
