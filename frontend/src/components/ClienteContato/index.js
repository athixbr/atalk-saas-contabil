import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  FormControlLabel,
  Switch,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, AccountTree as AccountTreeIcon, Apps as AppsIcon, Phone, Email } from "@material-ui/icons";
import { toast } from "react-toastify";
import api from "../../services/api";
import ContatoDepartamentosModal from "../ContatoDepartamentosModal";
import ContatoAppAcessoModal from "../ContatoAppAcessoModal";

const ClienteContato = ({ clienteId }) => {
  const [contatos, setContatos] = useState([]);
  const [cargosSocio, setCargosSocio] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingContato, setEditingContato] = useState(null);
  const [openDepartamentosModal, setOpenDepartamentosModal] = useState(false);
  const [contatoDepartamentos, setContatoDepartamentos] = useState(null);
  const [openAppAcessoModal, setOpenAppAcessoModal] = useState(false);
  const [contatoAppAcesso, setContatoAppAcesso] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    cargo: "",
    email: "",
    telefone: "",
    celular: "",
    observacoes: "",
    ativo: true,
  });

  useEffect(() => {
    loadCargosSocio();
    if (clienteId) {
      fetchContatos();
    }
  }, [clienteId]);

  const loadCargosSocio = async () => {
    try {
      const { data } = await api.get("/parametros/cargosocio");
      setCargosSocio(data || []);
    } catch (error) {
      console.error("Erro ao carregar cargos de sócio", error);
      setCargosSocio([]);
    }
  };

  const fetchContatos = async () => {
    if (!clienteId) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/clientes/${clienteId}/contatos`);
      setContatos(data);
    } catch (err) {
      console.error("Erro ao carregar contatos:", err);
      toast.error("Erro ao carregar contatos");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (contato = null) => {
    if (contato) {
      setEditingContato(contato);
      setFormData({
        nome: contato.nome || "",
        cargo: contato.cargo || "",
        email: contato.email || "",
        telefone: contato.telefone || "",
        celular: contato.celular || "",
        observacoes: contato.observacoes || "",
        ativo: contato.ativo !== undefined ? contato.ativo : true,
      });
    } else {
      setEditingContato(null);
      setFormData({
        nome: "",
        cargo: "",
        email: "",
        telefone: "",
        celular: "",
        observacoes: "",
        ativo: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingContato(null);
    setFormData({
      nome: "",
      cargo: "",
      email: "",
      telefone: "",
      celular: "",
      observacoes: "",
      ativo: true,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async () => {
    if (!formData.nome.trim()) {
      toast.warning("Informe o nome do contato");
      return;
    }

    if (!clienteId) {
      toast.warning("Salve o cliente primeiro para adicionar contatos");
      return;
    }

    try {
      setLoading(true);
      if (editingContato) {
        await api.put(`/clientes/${clienteId}/contatos/${editingContato.id}`, formData);
        toast.success("Contato atualizado com sucesso");
      } else {
        await api.post(`/clientes/${clienteId}/contatos`, formData);
        toast.success("Contato adicionado com sucesso");
      }
      handleCloseDialog();
      fetchContatos();
    } catch (err) {
      console.error("Erro ao salvar contato:", err);
      toast.error("Erro ao salvar contato");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDepartamentosModal = (contato) => {
    setContatoDepartamentos(contato);
    setOpenDepartamentosModal(true);
  };

  const handleCloseDepartamentosModal = () => {
    setOpenDepartamentosModal(false);
    setContatoDepartamentos(null);
  };

  const handleOpenAppAcessoModal = (contato) => {
    setContatoAppAcesso(contato);
    setOpenAppAcessoModal(true);
  };

  const handleCloseAppAcessoModal = () => {
    setOpenAppAcessoModal(false);
    setContatoAppAcesso(null);
  };

  const handleDelete = async (contatoId) => {
    if (!window.confirm("Deseja realmente excluir este contato?")) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/clientes/${clienteId}/contatos/${contatoId}`);
      toast.success("Contato excluído com sucesso");
      fetchContatos();
    } catch (err) {
      console.error("Erro ao excluir contato:", err);
      toast.error("Erro ao excluir contato");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Contatos do Cliente</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
        >
          Adicionar Contato
        </Button>
      </Box>

      {loading && contatos.length === 0 ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : contatos.length === 0 ? (
        <Paper>
          <Box p={3} textAlign="center">
            <Typography variant="body1" color="textSecondary">
              Nenhum contato cadastrado
            </Typography>
          </Box>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Cargo</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Celular</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contatos.map((contato) => (
                <TableRow key={contato.id}>
                  <TableCell>{contato.nome}</TableCell>
                  <TableCell>{contato.cargo}</TableCell>
                  <TableCell>{contato.email}</TableCell>
                  <TableCell>{contato.telefone}</TableCell>
                  <TableCell>{contato.celular}</TableCell>
                  <TableCell>
                    <Chip
                      label={contato.ativo ? "Ativo" : "Inativo"}
                      color={contato.ativo ? "primary" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(contato)}
                      disabled={loading}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      title="Departamentos"
                      onClick={() => handleOpenDepartamentosModal(contato)}
                      disabled={loading}
                    >
                      <AccountTreeIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      title="Acesso ao App"
                      onClick={() => handleOpenAppAcessoModal(contato)}
                      disabled={loading}
                    >
                      <AppsIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => handleDelete(contato.id)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog de Adicionar/Editar */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingContato ? "Editar Contato" : "Adicionar Contato"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.ativo}
                    onChange={handleInputChange}
                    name="ativo"
                    color="primary"
                  />
                }
                label="Ativo"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Cargo</InputLabel>
                <Select
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleInputChange}
                  label="Cargo"
                >
                  <MenuItem value="">
                    <em>Selecione</em>
                  </MenuItem>
                  {cargosSocio.map((cargo) => (
                    <MenuItem key={cargo.id} value={cargo.nome}>
                      {cargo.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="E-mail"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                margin="normal"
                placeholder="(00) 0000-0000"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Celular"
                name="celular"
                value={formData.celular}
                onChange={handleInputChange}
                margin="normal"
                placeholder="(00) 00000-0000"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      <ContatoDepartamentosModal
        open={openDepartamentosModal}
        onClose={handleCloseDepartamentosModal}
        clienteId={clienteId}
        contato={contatoDepartamentos}
      />

      <ContatoAppAcessoModal
        open={openAppAcessoModal}
        onClose={handleCloseAppAcessoModal}
        clienteId={clienteId}
        contato={contatoAppAcesso}
      />
    </Box>
  );
};

export default ClienteContato;
