import React, { useState, useEffect, useContext } from "react";
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
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import { toast } from "react-toastify";
import MainHeader from "../../components/MainHeader";

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

  const [formData, setFormData] = useState({
    titulo: "",
    body: "",
    usuariosIds: [],
    departamentosIds: [],
    expirationDays: 0,
  });

  useEffect(() => {
    loadNotifications();
    loadUsersAndDepartamentos();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/announcements");
      
      // Garantir que data seja sempre um array
      let notificationsArray = [];
      if (Array.isArray(data)) {
        notificationsArray = data;
      } else if (data && Array.isArray(data.records)) {
        notificationsArray = data.records;
      } else if (data && Array.isArray(data.announcements)) {
        notificationsArray = data.announcements;
      }
      
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
      setUsers(usersRes.data || []);
      setDepartamentos(depRes.data || []);
    } catch (error) {
      toast.error("Erro ao carregar usuários e departamentos");
      console.error(error);
    }
    setLoadingData(false);
  };

  const handleOpenDialog = (notification = null) => {
    if (notification) {
      setFormData({
        titulo: notification.titulo || "",
        body: notification.body || "",
        usuariosIds: notification.usuariosIds || [],
        departamentosIds: notification.departamentosIds || [],
        expirationDays: notification.expirationDays || 0,
      });
      setEditingId(notification.id);
    } else {
      setFormData({
        titulo: "",
        body: "",
        usuariosIds: [],
        departamentosIds: [],
        expirationDays: 0,
      });
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.titulo.trim()) {
      toast.error("Preencha o título");
      return;
    }
    if (!formData.body.trim()) {
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

    setLoading(true);
    try {
      const payload = {
        titulo: formData.titulo,
        body: formData.body,
        tipo: "admin_notification",
        usuariosIds: formData.usuariosIds,
        departamentosIds: formData.departamentosIds,
        expirationDays: formData.expirationDays,
      };

      if (editingId) {
        await api.put(`/announcements/${editingId}`, payload);
        toast.success("Notificação atualizada com sucesso");
      } else {
        await api.post("/announcements", payload);
        toast.success("Notificação criada com sucesso");
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
    return dep ? dep.name : `Departamento ${id}`;
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
                        <TableCell align="right">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {notifications.map((notification) => (
                        <TableRow key={notification.id}>
                          <TableCell>
                            <Tooltip title={notification.body}>
                              <span>
                                {notification.titulo?.substr(0, 30) ||
                                  "Sem título"}
                                ...
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
              value={formData.titulo}
              onChange={(e) => handleFormChange("titulo", e.target.value)}
              placeholder="Ex: Parabéns! Você recebeu um bônus"
            />

            <TextField
              label="Mensagem"
              fullWidth
              multiline
              rows={4}
              value={formData.body}
              onChange={(e) => handleFormChange("body", e.target.value)}
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
                    {dep.name}
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
