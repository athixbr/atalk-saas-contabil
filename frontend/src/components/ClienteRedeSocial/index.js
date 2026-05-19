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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Link,
} from "@material-ui/core";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Facebook,
  Instagram,
  LinkedIn,
  Twitter,
  YouTube,
  Language,
} from "@material-ui/icons";
import { toast } from "react-toastify";
import api from "../../services/api";

const TIPOS_REDE_SOCIAL = [
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "linkedin", label: "LinkedIn", icon: LinkedIn },
  { value: "twitter", label: "Twitter/X", icon: Twitter },
  { value: "youtube", label: "YouTube", icon: YouTube },
  { value: "site", label: "Website", icon: Language },
  { value: "outro", label: "Outro", icon: Language },
];

const ClienteRedeSocial = ({ clienteId }) => {
  const [redesSociais, setRedesSociais] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRede, setEditingRede] = useState(null);
  const [formData, setFormData] = useState({
    tipo: "",
    url: "",
    usuario: "",
  });

  useEffect(() => {
    if (clienteId) {
      fetchRedesSociais();
    }
  }, [clienteId]);

  const fetchRedesSociais = async () => {
    if (!clienteId) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/clientes/${clienteId}/redes-sociais`);
      setRedesSociais(data);
    } catch (err) {
      console.error("Erro ao carregar redes sociais:", err);
      toast.error("Erro ao carregar redes sociais");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (rede = null) => {
    if (rede) {
      setEditingRede(rede);
      setFormData({
        tipo: rede.tipo || "",
        url: rede.url || "",
        usuario: rede.usuario || "",
      });
    } else {
      setEditingRede(null);
      setFormData({
        tipo: "",
        url: "",
        usuario: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRede(null);
    setFormData({
      tipo: "",
      url: "",
      usuario: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    if (!formData.tipo) {
      toast.warning("Selecione o tipo de rede social");
      return;
    }
    if (!formData.url.trim()) {
      toast.warning("Informe a URL");
      return;
    }

    try {
      setLoading(true);
      if (editingRede) {
        await api.put(`/clientes/${clienteId}/redes-sociais/${editingRede.id}`, formData);
        toast.success("Rede social atualizada com sucesso");
      } else {
        await api.post(`/clientes/${clienteId}/redes-sociais`, formData);
        toast.success("Rede social adicionada com sucesso");
      }
      handleCloseDialog();
      fetchRedesSociais();
    } catch (err) {
      console.error("Erro ao salvar rede social:", err);
      toast.error("Erro ao salvar rede social");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (redeId) => {
    if (!window.confirm("Deseja realmente excluir esta rede social?")) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/clientes/${clienteId}/redes-sociais/${redeId}`);
      toast.success("Rede social excluída com sucesso");
      fetchRedesSociais();
    } catch (err) {
      console.error("Erro ao excluir rede social:", err);
      toast.error("Erro ao excluir rede social");
    } finally {
      setLoading(false);
    }
  };

  const getRedeIcon = (tipo) => {
    const rede = TIPOS_REDE_SOCIAL.find((r) => r.value === tipo);
    if (!rede) return <Language />;
    const IconComponent = rede.icon;
    return <IconComponent />;
  };

  const getRedeLabel = (tipo) => {
    const rede = TIPOS_REDE_SOCIAL.find((r) => r.value === tipo);
    return rede ? rede.label : tipo;
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Redes Sociais do Cliente</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
        >
          Adicionar Rede Social
        </Button>
      </Box>

      {loading && redesSociais.length === 0 ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : redesSociais.length === 0 ? (
        <Paper>
          <Box p={3} textAlign="center">
            <Typography variant="body1" color="textSecondary">
              Nenhuma rede social cadastrada
            </Typography>
          </Box>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tipo</TableCell>
                <TableCell>Usuário</TableCell>
                <TableCell>URL</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {redesSociais.map((rede) => (
                <TableRow key={rede.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getRedeIcon(rede.tipo)}
                      <span>{getRedeLabel(rede.tipo)}</span>
                    </Box>
                  </TableCell>
                  <TableCell>{rede.usuario}</TableCell>
                  <TableCell>
                    <Link href={rede.url} target="_blank" rel="noopener noreferrer">
                      {rede.url}
                    </Link>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(rede)}
                      disabled={loading}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => handleDelete(rede.id)}
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRede ? "Editar Rede Social" : "Adicionar Rede Social"}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo de Rede Social</InputLabel>
            <Select name="tipo" value={formData.tipo} onChange={handleInputChange} label="Tipo de Rede Social">
              {TIPOS_REDE_SOCIAL.map((tipo) => (
                <MenuItem key={tipo.value} value={tipo.value}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {React.createElement(tipo.icon)}
                    <span>{tipo.label}</span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Usuário/Nome da Página"
            name="usuario"
            value={formData.usuario}
            onChange={handleInputChange}
            margin="normal"
            placeholder="@usuario ou nome da página"
          />
          <TextField
            fullWidth
            label="URL Completa"
            name="url"
            value={formData.url}
            onChange={handleInputChange}
            margin="normal"
            required
            placeholder="https://..."
          />
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
    </Box>
  );
};

export default ClienteRedeSocial;
