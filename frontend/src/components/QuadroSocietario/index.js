import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
  Chip,
  Link,
  Tooltip,
  CircularProgress,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  PersonAdd as PersonAddIcon,
  Launch as LaunchIcon,
  Search as SearchIcon,
} from "@material-ui/icons";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import api from "../../services/api";
import ConfirmationModal from "../../components/ConfirmationModal";

const useStyles = makeStyles((theme) => ({
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
  adminChip: {
    marginLeft: theme.spacing(1),
  },
  autocompleteOption: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: theme.spacing(1),
  },
  optionPrimary: {
    fontWeight: 500,
    fontSize: "0.95rem",
  },
  optionSecondary: {
    fontSize: "0.85rem",
    color: theme.palette.text.secondary,
  },
  searchHelperText: {
    marginTop: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  createSocioLink: {
    marginTop: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
}));

const QuadroSocietario = ({ clienteId, onVinculoChange }) => {
  const classes = useStyles();
  const history = useHistory();

  const [vinculos, setVinculos] = useState([]);
  const [socios, setSocios] = useState([]);
  const [cargosSocio, setCargosSocio] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchingSocios, setSearchingSocios] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deletingVinculo, setDeletingVinculo] = useState(null);
  const [editingVinculo, setEditingVinculo] = useState(null);

  const [vinculoForm, setVinculoForm] = useState({
    socioId: null,
    percentual: "",
    cargo: "",
    valorQuota: "",
    quantidadeQuotas: "",
    dataEntrada: "",
    dataSaida: "",
    podeAssinar: false,
    poderIsolado: false,
    isAdministrador: false,
    recebeProlabore: false,
    valorProlabore: "",
    observacoes: "",
    ativo: true,
  });

  useEffect(() => {
    // Carrega lista de sócios e cargos sempre
    loadSocios();
    loadCargosSocio();
    
    // Só carrega vínculos se houver clienteId
    if (clienteId) {
      loadVinculos();
    }
  }, [clienteId]);

  const loadVinculos = async () => {
    if (!clienteId) return;
    try {
      const { data } = await api.get(`/clientes/${clienteId}`);
      setVinculos(data.socios || []);
    } catch (error) {
      console.error("Erro ao carregar vínculos", error);
    }
  };

  const loadSocios = async (searchQuery = "") => {
    try {
      setSearchingSocios(true);
      const params = { 
        pageNumber: 1,
        searchParam: searchQuery || searchTerm,
      };
      const { data } = await api.get("/socios", { params });
      setSocios(data.socios || []);
    } catch (error) {
      console.error("Erro ao carregar sócios", error);
      setSocios([]);
    } finally {
      setSearchingSocios(false);
    }
  };

  const loadCargosSocio = async () => {
    try {
      const { data } = await api.get("/parametros/cargosocio");
      setCargosSocio(data || []);
    } catch (error) {
      console.error("Erro ao carregar cargos de sócio", error);
      setCargosSocio([]);
    }
  };

  const handleOpenModal = (vinculo = null) => {
    if (vinculo) {
      setEditingVinculo(vinculo.ClienteSocio.id);
      setVinculoForm({
        socioId: vinculo.id,
        percentual: vinculo.ClienteSocio.percentual || "",
        cargo: vinculo.ClienteSocio.cargo || "",
        valorQuota: vinculo.ClienteSocio.valorQuota || "",
        quantidadeQuotas: vinculo.ClienteSocio.quantidadeQuotas || "",
        dataEntrada: vinculo.ClienteSocio.dataEntrada || "",
        dataSaida: vinculo.ClienteSocio.dataSaida || "",
        podeAssinar: vinculo.ClienteSocio.podeAssinar || false,
        poderIsolado: vinculo.ClienteSocio.poderIsolado || false,
        isAdministrador: vinculo.ClienteSocio.isAdministrador || false,
        recebeProlabore: vinculo.ClienteSocio.recebeProlabore || false,
        valorProlabore: vinculo.ClienteSocio.valorProlabore || "",
        observacoes: vinculo.ClienteSocio.observacoes || "",
        ativo: vinculo.ClienteSocio.ativo !== undefined ? vinculo.ClienteSocio.ativo : true,
      });
    } else {
      setEditingVinculo(null);
      setVinculoForm({
        socioId: null,
        percentual: "",
        cargo: "",
        valorQuota: "",
        quantidadeQuotas: "",
        dataEntrada: "",
        dataSaida: "",
        podeAssinar: false,
        poderIsolado: false,
        isAdministrador: false,
        recebeProlabore: false,
        valorProlabore: "",
        observacoes: "",
        ativo: true,
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingVinculo(null);
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setVinculoForm({
      ...vinculoForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async () => {
    if (!vinculoForm.socioId && !editingVinculo) {
      toast.error("Selecione um sócio");
      return;
    }

    if (!clienteId) {
      toast.warning("Salve o cliente primeiro para adicionar sócios");
      return;
    }

    try {
      const payload = {
        ...vinculoForm,
        clienteId: parseInt(clienteId),
      };

      if (editingVinculo) {
        await api.put(`/socios/vinculos/${editingVinculo}`, payload);
        toast.success("Vínculo atualizado com sucesso");
      } else {
        await api.post("/socios/vinculos", payload);
        toast.success("Sócio vinculado com sucesso");
      }

      handleCloseModal();
      loadVinculos();
      if (onVinculoChange) onVinculoChange();
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Erro ao salvar vínculo";
      toast.error(errorMsg);
    }
  };

  const handleDeleteVinculo = async () => {
    try {
      await api.delete(`/socios/vinculos/${deletingVinculo}`);
      toast.success("Vínculo removido com sucesso");
      loadVinculos();
      if (onVinculoChange) onVinculoChange();
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Erro ao remover vínculo";
      toast.error(errorMsg);
    }
    setConfirmModalOpen(false);
    setDeletingVinculo(null);
  };

  const handleCreateNewSocio = () => {
    // Abre a página de cadastro de sócios em uma nova aba
    window.open("/socios/cadastro", "_blank");
  };

  const handleViewSocio = (socioId) => {
    // Abre a página de edição do sócio em uma nova aba
    window.open(`/socios/cadastro/${socioId}`, "_blank");
  };

  const formatCPF = (cpf) => {
    if (!cpf) return "";
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatMoney = (value) => {
    if (!value) return "R$ 0,00";
    return `R$ ${parseFloat(value).toFixed(2).replace(".", ",")}`;
  };

  return (
    <Box>
      <ConfirmationModal
        title="Remover Sócio"
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDeleteVinculo}
      >
        Tem certeza que deseja remover este sócio da empresa?
      </ConfirmationModal>

      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingVinculo ? "Editar Vínculo Societário" : "Adicionar Sócio"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: 8 }}>
            {!editingVinculo && (
              <Grid item xs={12}>
                <Autocomplete
                  options={socios}
                  getOptionLabel={(option) => {
                    const cpfFormatted = formatCPF(option.cpf);
                    return `${option.nome} - ${cpfFormatted}`;
                  }}
                  value={socios.find((s) => s.id === vinculoForm.socioId) || null}
                  onChange={(e, newValue) =>
                    setVinculoForm({ ...vinculoForm, socioId: newValue?.id || null })
                  }
                  onInputChange={(event, value) => {
                    setSearchTerm(value);
                    if (value && value.length >= 3) {
                      loadSocios(value);
                    }
                  }}
                  loading={searchingSocios}
                  renderOption={(option) => (
                    <Box className={classes.autocompleteOption}>
                      <Box className={classes.optionPrimary}>
                        {option.nome}
                      </Box>
                      <Box className={classes.optionSecondary}>
                        CPF: {formatCPF(option.cpf)}
                        {option.email && ` • ${option.email}`}
                        {option.celular && ` • ${option.celular}`}
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Buscar Sócio" 
                      required 
                      fullWidth
                      placeholder="Digite o nome ou CPF do sócio..."
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <SearchIcon style={{ marginLeft: 8, color: '#999' }} />
                            {params.InputProps.startAdornment}
                          </>
                        ),
                        endAdornment: (
                          <>
                            {searchingSocios ? <CircularProgress size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
                <Box className={classes.searchHelperText}>
                  <Typography variant="caption">
                    Digite ao menos 3 caracteres para buscar
                  </Typography>
                </Box>
                <Box className={classes.createSocioLink}>
                  <Typography variant="caption" color="textSecondary">
                    Não encontrou o sócio?
                  </Typography>
                  <Link
                    component="button"
                    variant="caption"
                    onClick={handleCreateNewSocio}
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <PersonAddIcon fontSize="small" />
                    Cadastrar novo sócio
                  </Link>
                </Box>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                label="Participação (%)"
                name="percentual"
                type="number"
                value={vinculoForm.percentual}
                onChange={handleInputChange}
                fullWidth
                inputProps={{ min: 0, max: 100, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Cargo</InputLabel>
                <Select
                  name="cargo"
                  value={vinculoForm.cargo}
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

            <Grid item xs={12} sm={6}>
              <TextField
                label="Valor da Participação"
                name="valorQuota"
                type="number"
                value={vinculoForm.valorQuota}
                onChange={handleInputChange}
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Quantidade de Quotas"
                name="quantidadeQuotas"
                type="number"
                value={vinculoForm.quantidadeQuotas}
                onChange={handleInputChange}
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Data de Entrada"
                name="dataEntrada"
                type="date"
                value={vinculoForm.dataEntrada}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Data de Saída"
                name="dataSaida"
                type="date"
                value={vinculoForm.dataSaida}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={vinculoForm.recebeProlabore}
                    onChange={handleInputChange}
                    name="recebeProlabore"
                    color="primary"
                  />
                }
                label="Recebe Pró-labore"
              />
            </Grid>

            {vinculoForm.recebeProlabore && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Valor Pró-labore"
                  name="valorProlabore"
                  type="number"
                  value={vinculoForm.valorProlabore}
                  onChange={handleInputChange}
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={vinculoForm.podeAssinar}
                    onChange={handleInputChange}
                    name="podeAssinar"
                    color="primary"
                  />
                }
                label="Pode Assinar"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={vinculoForm.poderIsolado}
                    onChange={handleInputChange}
                    name="poderIsolado"
                    color="primary"
                  />
                }
                label="Poder Isolado"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Observações"
                name="observacoes"
                value={vinculoForm.observacoes}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={vinculoForm.ativo}
                    onChange={handleInputChange}
                    name="ativo"
                    color="primary"
                  />
                }
                label="Vínculo Ativo"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {editingVinculo ? "Atualizar" : "Adicionar"}
          </Button>
        </DialogActions>
      </Dialog>

      <div className={classes.header}>
        <Typography variant="h6">Quadro Societário</Typography>
        <Box display="flex" gap={1}>
          <Tooltip title="Gerenciar todos os sócios">
            <Button
              variant="outlined"
              startIcon={<BusinessIcon />}
              onClick={() => window.open("/socios", "_blank")}
              size="small"
            >
              Ver Todos
            </Button>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
          >
            Adicionar Sócio
          </Button>
        </Box>
      </div>

      {vinculos.length === 0 ? (
        <div className={classes.emptyState}>
          <BusinessIcon style={{ fontSize: 48, marginBottom: 16 }} />
          <Typography variant="body1">Nenhum sócio cadastrado</Typography>
          <Typography variant="body2" color="textSecondary">
            Clique em "Adicionar Sócio" para vincular sócios a esta empresa
          </Typography>
        </div>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Sócio</TableCell>
              <TableCell>CPF</TableCell>
              <TableCell>Participação</TableCell>
              <TableCell>Cargo</TableCell>
              <TableCell>Pró-labore</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vinculos.map((vinculo) => (
              <TableRow key={vinculo.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {vinculo.nome}
                    {vinculo.ClienteSocio?.isAdministrador && (
                      <Chip
                        label="Admin"
                        size="small"
                        color="primary"
                        className={classes.adminChip}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>{formatCPF(vinculo.cpf)}</TableCell>
                <TableCell>{vinculo.ClienteSocio?.percentual || 0}%</TableCell>
                <TableCell>{vinculo.ClienteSocio?.cargo || "-"}</TableCell>
                <TableCell>
                  {vinculo.ClienteSocio?.recebeProlabore
                    ? formatMoney(vinculo.ClienteSocio?.valorProlabore)
                    : "Não"}
                </TableCell>
                <TableCell>
                  <Chip
                    label={vinculo.ClienteSocio?.ativo ? "Ativo" : "Inativo"}
                    color={vinculo.ClienteSocio?.ativo ? "primary" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Ver/Editar Sócio">
                    <IconButton 
                      size="small" 
                      onClick={() => handleViewSocio(vinculo.id)}
                      color="primary"
                    >
                      <LaunchIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar Vínculo">
                    <IconButton size="small" onClick={() => handleOpenModal(vinculo)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remover Vínculo">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setDeletingVinculo(vinculo.ClienteSocio.id);
                        setConfirmModalOpen(true);
                      }}
                      color="secondary"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default QuadroSocietario;
