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
  Typography,
  Grid,
  CircularProgress,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Divider,
} from "@material-ui/core";
import { Add as AddIcon, Delete as DeleteIcon,  Save as SaveIcon } from "@material-ui/icons";
import { toast } from "react-toastify";
import api from "../../services/api";

const ResponsavelDepartamento = ({ clienteId }) => {
  const [responsaveis, setResponsaveis] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    departamentoId: "",
    userIds: [],
  });

  useEffect(() => {
    // Carrega departamentos e usuários sempre
    fetchDepartamentos();
    fetchUsuarios();
    
    // Só carrega responsáveis se houver clienteId
    if (clienteId) {
      fetchResponsaveis();
    }
  }, [clienteId]);

  const fetchResponsaveis = async () => {
    if (!clienteId) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/clientes/${clienteId}/responsaveis-departamento`);
      setResponsaveis(data);
    } catch (err) {
      console.error("Erro ao carregar responsáveis:", err);
      toast.error("Erro ao carregar responsáveis");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartamentos = async () => {
    try {
      const { data } = await api.get("/departamentos");
      setDepartamentos(Array.isArray(data) ? data : (data.departamentos || []));
    } catch (err) {
      console.error("Erro ao carregar departamentos:", err);
      toast.error("Erro ao carregar departamentos");
      setDepartamentos([]);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const { data } = await api.get("/users/list");
      setUsuarios(Array.isArray(data) ? data : (data.users || []));
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
      toast.error("Erro ao carregar usuários");
      setUsuarios([]);
    }
  };

  const handleDepartamentoChange = (e) => {
    const departamentoId = e.target.value;
    setFormData({
      departamentoId,
      userIds: [],
    });
    
    // Filtrar usuários quando seleciona departamento
    if (departamentoId) {
      const usuariosDept = usuarios.filter(u => 
        u.departamentos?.some(d => d.id === parseInt(departamentoId))
      );
      setUsuariosFiltrados(usuariosDept);
    } else {
      setUsuariosFiltrados([]);
    }
  };

  const handleUsuariosChange = (e) => {
    setFormData({
      ...formData,
      userIds: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (!formData.departamentoId) {
      toast.warning("Selecione um departamento");
      return;
    }

    if (!formData.userIds || formData.userIds.length === 0) {
      toast.warning("Selecione pelo menos um usuário");
      return;
    }

    if (!clienteId) {
      toast.warning("Salve o cliente primeiro para adicionar responsáveis");
      return;
    }

    try {
      setSaving(true);
      const response = await api.post(`/clientes/${clienteId}/responsaveis-departamento`, {
        departamentoId: formData.departamentoId,
        userIds: formData.userIds,
      });
      
      if (response.data.created && response.data.created.length > 0) {
        toast.success(response.data.message || "Responsáveis adicionados com sucesso");
      }
      
      if (response.data.skipped && response.data.skipped.length > 0) {
        toast.info(`${response.data.skipped.length} usuário(s) já cadastrado(s) foram ignorados`);
      }
      
      // Limpar formulário
      setFormData({
        departamentoId: "",
        userIds: [],
      });
      setUsuariosFiltrados([]);
      
      // Recarregar lista
      fetchResponsaveis();
    } catch (err) {
      console.error("Erro ao adicionar responsável:", err);
      const errorMessage = err.response?.data?.error || "Erro ao adicionar responsável";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (responsavelId) => {
    if (!window.confirm("Deseja realmente remover este responsável?")) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/clientes/${clienteId}/responsaveis-departamento/${responsavelId}`);
      toast.success("Responsável removido com sucesso");
      fetchResponsaveis();
    } catch (err) {
      console.error("Erro ao remover responsável:", err);
      toast.error("Erro ao remover responsável");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Responsabilidade pelo Departamento
      </Typography>

      {/* Formulário de Adição - Sem Modal */}
      <Paper style={{ padding: '20px', marginBottom: '20px', backgroundColor: '#f5f5f5' }}>
        <Typography variant="subtitle2" gutterBottom color="textSecondary">
          Adicionar Responsáveis
        </Typography>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Departamento</InputLabel>
              <Select
                value={formData.departamentoId}
                onChange={handleDepartamentoChange}
                label="Departamento"
              >
                <MenuItem value="">
                  <em>Selecione um departamento</em>
                </MenuItem>
                {departamentos.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Usuários</InputLabel>
              <Select
                multiple
                value={formData.userIds}
                onChange={handleUsuariosChange}
                label="Usuários"
                disabled={!formData.departamentoId}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((userId) => {
                      const user = usuariosFiltrados.find(u => u.id === userId);
                      return user ? (
                        <Chip key={userId} label={user.name} size="small" />
                      ) : null;
                    })}
                  </Box>
                )}
              >
                {!formData.departamentoId ? (
                  <MenuItem disabled>
                    <em>Selecione um departamento primeiro</em>
                  </MenuItem>
                ) : usuariosFiltrados.length === 0 ? (
                  <MenuItem disabled>
                    <em>Nenhum usuário neste departamento</em>
                  </MenuItem>
                ) : (
                  usuariosFiltrados.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleSubmit}
              disabled={saving || !formData.departamentoId || formData.userIds.length === 0}
            >
              Salvar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Divider style={{ margin: '20px 0' }} />

      {/* Tabela de Responsáveis */}
      {loading && responsaveis.length === 0 ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Departamento</TableCell>
                <TableCell>Responsável</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {responsaveis.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography color="textSecondary">
                      Nenhum responsável cadastrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                responsaveis.map((resp) => (
                  <TableRow key={resp.id}>
                    <TableCell>{resp.departamento?.nome || "-"}</TableCell>
                    <TableCell>{resp.user?.name || "-"}</TableCell>
                    <TableCell>{resp.user?.email || "-"}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => handleDelete(resp.id)}
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ResponsavelDepartamento;
