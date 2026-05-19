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
  Chip,
  FormControlLabel,
  Switch,
  CircularProgress,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from "@material-ui/icons";
import { toast } from "react-toastify";
import api from "../../services/api";

const ClienteCNAE = ({ clienteId }) => {
  const [cnaes, setCnaes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCnae, setEditingCnae] = useState(null);
  const [formData, setFormData] = useState({
    cnae: "",
    descricao: "",
    principal: false,
  });

  // Estados para Autocomplete com API IBGE
  const [cnaeOptions, setCnaeOptions] = useState([]);
  const [loadingCnaes, setLoadingCnaes] = useState(false);
  const [selectedCnaeOption, setSelectedCnaeOption] = useState(null);

  useEffect(() => {
    if (clienteId) {
      fetchCnaes();
    }
  }, [clienteId]);

  // Carregar CNAEs da API do IBGE
  const fetchCnaesIBGE = async () => {
    try {
      setLoadingCnaes(true);
      const response = await fetch("https://servicodados.ibge.gov.br/api/v2/cnae/classes");
      const data = await response.json();
      
      // Mapear para formato { codigo, descricao }
      const cnaeList = data.map((item) => ({
        id: item.id, // Ex: "6201500"
        codigo: item.id,
        descricao: item.descricao || "",
        observacoes: item.observacoes || "",
      }));
      
      setCnaeOptions(cnaeList);
    } catch (err) {
      console.error("Erro ao carregar CNAEs do IBGE:", err);
      toast.error("Erro ao carregar lista de CNAEs do IBGE");
      setCnaeOptions([]);
    } finally {
      setLoadingCnaes(false);
    }
  };

  const fetchCnaes = async () => {
    if (!clienteId) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/clientes/${clienteId}/cnaes`);
      setCnaes(data);
    } catch (err) {
      console.error("Erro ao carregar CNAEs:", err);
      toast.error("Erro ao carregar CNAEs");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (cnae = null) => {
    if (cnae) {
      setEditingCnae(cnae);
      setFormData({
        cnae: cnae.cnae || "",
        descricao: cnae.descricao || "",
        principal: cnae.principal || false,
      });
      // Ao editar, não preencher o autocomplete (apenas os campos texto)
      setSelectedCnaeOption(null);
    } else {
      setEditingCnae(null);
      setFormData({
        cnae: "",
        descricao: "",
        principal: false,
      });
      setSelectedCnaeOption(null);
    }
    
    // Carregar CNAEs do IBGE se ainda não carregou
    if (cnaeOptions.length === 0) {
      fetchCnaesIBGE();
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCnae(null);
    setSelectedCnaeOption(null);
    setFormData({
      cnae: "",
      descricao: "",
      principal: false,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handler para quando selecionar um CNAE no Autocomplete
  const handleCnaeSelect = (event, newValue) => {
    setSelectedCnaeOption(newValue);
    
    if (newValue) {
      // Formatar código CNAE (ex: 6201500 -> 6201-5/00)
      const formatarCNAE = (codigo) => {
        if (codigo.length === 7) {
          return `${codigo.slice(0, 4)}-${codigo.slice(4, 5)}/${codigo.slice(5)}`;
        }
        return codigo;
      };

      setFormData({
        ...formData,
        cnae: formatarCNAE(newValue.codigo),
        descricao: newValue.descricao,
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.cnae.trim()) {
      toast.warning("Informe o código CNAE");
      return;
    }

    if (!clienteId) {
      toast.warning("Salve o cliente primeiro para adicionar CNAEs");
      return;
    }

    try {
      setLoading(true);
      if (editingCnae) {
        await api.put(`/clientes/${clienteId}/cnaes/${editingCnae.id}`, formData);
        toast.success("CNAE atualizado com sucesso");
      } else {
        await api.post(`/clientes/${clienteId}/cnaes`, formData);
        toast.success("CNAE adicionado com sucesso");
      }
      handleCloseDialog();
      fetchCnaes();
    } catch (err) {
      console.error("Erro ao salvar CNAE:", err);
      toast.error("Erro ao salvar CNAE");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cnaeId) => {
    if (!window.confirm("Deseja realmente excluir este CNAE?")) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/clientes/${clienteId}/cnaes/${cnaeId}`);
      toast.success("CNAE excluído com sucesso");
      fetchCnaes();
    } catch (err) {
      console.error("Erro ao excluir CNAE:", err);
      toast.error("Erro ao excluir CNAE");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">CNAEs do Cliente</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
        >
          Adicionar CNAE
        </Button>
      </Box>

      {loading && cnaes.length === 0 ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : cnaes.length === 0 ? (
        <Paper>
          <Box p={3} textAlign="center">
            <Typography variant="body1" color="textSecondary">
              Nenhum CNAE cadastrado
            </Typography>
          </Box>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>CNAE</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="center">Tipo</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cnaes.map((cnae) => (
                <TableRow key={cnae.id}>
                  <TableCell>{cnae.cnae}</TableCell>
                  <TableCell>{cnae.descricao}</TableCell>
                  <TableCell align="center">
                    {cnae.principal ? (
                      <Chip label="Principal" color="primary" size="small" />
                    ) : (
                      <Chip label="Secundário" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(cnae)}
                      disabled={loading}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => handleDelete(cnae.id)}
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
        <DialogTitle>{editingCnae ? "Editar CNAE" : "Adicionar CNAE"}</DialogTitle>
        <DialogContent>
          {/* Autocomplete para buscar CNAE na API do IBGE */}
          <Box mb={2} mt={1}>
            <Autocomplete
              options={cnaeOptions}
              value={selectedCnaeOption}
              onChange={handleCnaeSelect}
              loading={loadingCnaes}
              getOptionLabel={(option) => 
                option.codigo 
                  ? `${option.codigo} - ${option.descricao.substring(0, 80)}${option.descricao.length > 80 ? '...' : ''}`
                  : ""
              }
              filterOptions={(options, { inputValue }) => {
                const searchTerm = inputValue.toLowerCase().replace(/[^\w\s]/gi, '');
                return options.filter((option) => {
                  const codigo = option.codigo.toLowerCase();
                  const descricao = option.descricao.toLowerCase();
                  return codigo.includes(searchTerm) || descricao.includes(searchTerm);
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="🔍 Buscar CNAE (código ou descrição)"
                  variant="outlined"
                  placeholder="Digite o código ou parte da descrição..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingCnaes ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(option) => (
                <Box>
                  <Typography variant="body2" style={{ fontWeight: 600 }}>
                    {option.codigo}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {option.descricao}
                  </Typography>
                </Box>
              )}
              noOptionsText="Nenhum CNAE encontrado"
              loadingText="Carregando CNAEs do IBGE..."
            />
            <Typography variant="caption" color="textSecondary" style={{ marginTop: 4, display: 'block' }}>
              💡 Pesquise por código (ex: 6201) ou por nome da atividade (ex: desenvolvimento)
            </Typography>
          </Box>

          {/* Campos editáveis após seleção */}
          <TextField
            fullWidth
            label="Código CNAE"
            name="cnae"
            value={formData.cnae}
            onChange={handleInputChange}
            margin="normal"
            required
            placeholder="Ex: 6201-5/00"
            helperText="Código formatado do CNAE"
          />
          <TextField
            fullWidth
            label="Descrição"
            name="descricao"
            value={formData.descricao}
            onChange={handleInputChange}
            margin="normal"
            multiline
            rows={3}
            placeholder="Descrição da atividade"
            helperText="Você pode editar a descrição se necessário"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.principal}
                onChange={handleInputChange}
                name="principal"
                color="primary"
              />
            }
            label="CNAE Principal"
            style={{ marginTop: 16 }}
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

export default ClienteCNAE;
