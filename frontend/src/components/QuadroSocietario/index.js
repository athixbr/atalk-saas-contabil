import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableFooter,
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
  Typography,
  Chip,
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
  NoteAdd as NoteAddIcon,
} from "@material-ui/icons";
import { toast } from "react-toastify";
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
    justifyContent: "space-between",
    gap: theme.spacing(1),
    color: theme.palette.text.secondary,
    flexWrap: "wrap",
  },
  recordsCount: {
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  selectedClientBox: {
    display: "flex",
    gap: theme.spacing(1),
    flexWrap: "wrap",
    marginTop: theme.spacing(2),
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.action.hover,
    borderRadius: 4,
  },
  selectedField: {
    minWidth: 140,
  },
  modalToolbar: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: theme.spacing(1),
  },
  modalSection: {
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const EMPTY_VINCULO_FORM = {
  socioId: null,
  codigoErp: "",
  percentual: "",
  cargo: "",
  ativo: true,
};

const EMPTY_NOVO_SOCIO_FORM = {
  nome: "",
  cpf: "",
};

const SOCIOS_SEARCH_LIMIT = 1000;

const getDocumentoLimpo = (value) => String(value || "").replace(/\D/g, "");

const getOptionUniqueKey = (option) => {
  const clienteOrigemId = option?.clienteOrigem?.id || option?.clienteOrigemId;
  const documento = getDocumentoLimpo(
    option?.clienteOrigem?.cnpj ||
    option?.clienteOrigem?.cpf ||
    option?.cnpj ||
    option?.cpf
  );
  const codigoSistema = option?.clienteOrigem?.codigoSistema || option?.codigoSistema;
  const codigoErp = option?.clienteOrigem?.codigoErp || option?.codigoErp;
  const nome = String(option?.nome || "").trim().toLowerCase();

  if (clienteOrigemId) return `cliente-${clienteOrigemId}`;
  if (documento) return `documento-${documento}`;
  if (codigoSistema) return `sistema-${codigoSistema}`;
  if (codigoErp) return `erp-${codigoErp}`;
  return `${nome}-${option?.optionType || ""}-${option?.id || option?.optionKey || ""}`;
};

const getOptionDisplayKey = (option) => {
  const documento = getDocumentoLimpo(option?.cpf || option?.cnpj);
  const nome = String(option?.nome || "").trim().toLowerCase();
  const codigoSistema = option?.codigoSistema || option?.clienteOrigem?.codigoSistema || "";
  const codigoErp = option?.codigoErp || option?.clienteOrigem?.codigoErp || "";

  return [nome, documento, codigoErp, codigoSistema].join("|");
};

const getUniqueOptions = (options) => {
  const optionsByKey = new Map();
  const keyByDisplay = new Map();

  options.forEach((option) => {
    const key = getOptionUniqueKey(option);
    const displayKey = getOptionDisplayKey(option);
    const existingOption = optionsByKey.get(key);
    const existingDisplayKey = keyByDisplay.get(displayKey);
    const existingDisplayOption = existingDisplayKey
      ? optionsByKey.get(existingDisplayKey)
      : null;

    if (existingDisplayOption) {
      if (option.optionType !== "socio") {
        return;
      }

      optionsByKey.delete(existingDisplayKey);
      optionsByKey.set(key, option);
      keyByDisplay.set(displayKey, key);
      return;
    }

    if (!existingOption || option.optionType === "socio") {
      optionsByKey.set(key, option);
      keyByDisplay.set(displayKey, key);
    }
  });

  return Array.from(optionsByKey.values());
};

const sortOptionsByDisplayName = (options) =>
  [...options].sort((a, b) =>
    String(a?.nome || "").localeCompare(String(b?.nome || ""), "pt-BR", {
      sensitivity: "base",
      numeric: true,
    })
  );

const QuadroSocietario = ({ clienteId, onVinculoChange }) => {
  const classes = useStyles();

  const [vinculos, setVinculos] = useState([]);
  const [socios, setSocios] = useState([]);
  const [cargosSocio, setCargosSocio] = useState([]);
  const [searchingSocios, setSearchingSocios] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deletingVinculo, setDeletingVinculo] = useState(null);
  const [editingVinculo, setEditingVinculo] = useState(null);
  const [editingSocio, setEditingSocio] = useState(null);

  const [vinculoForm, setVinculoForm] = useState({ ...EMPTY_VINCULO_FORM });

  // Modal de cadastro rápido de novo sócio
  const [novoSocioModalOpen, setNovoSocioModalOpen] = useState(false);
  const [novoSocioForm, setNovoSocioForm] = useState({ ...EMPTY_NOVO_SOCIO_FORM });
  const [salvandoNovoSocio, setSalvandoNovoSocio] = useState(false);

  useEffect(() => {
    loadSocios();
    loadCargosSocio();
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
        limit: SOCIOS_SEARCH_LIMIT,
        searchParam: searchQuery || searchTerm,
      };

      const clientesResponse = await api.get("/clientes", {
        params: {
          page: 1,
          limit: SOCIOS_SEARCH_LIMIT,
          searchParam: searchQuery || searchTerm,
          ativo: true,
        },
      });

      const clientesOptions = (clientesResponse.data.clientes || [])
        .filter((cliente) => !cliente.isSocioRow && String(cliente.id) !== String(clienteId))
        .map((cliente) => ({
          ...cliente,
          optionType: "cliente",
          optionKey: `cliente-${cliente.id}`,
          nome: cliente.apelido || cliente.nomeFantasia || cliente.razaoSocial || cliente.nome,
          cpf: cliente.cnpj || cliente.cpf || "",
          email: cliente.email || "",
          celular: cliente.celular || cliente.telefone || "",
        }));

      const sociosResponse = await api.get("/socios", { params });
      const sociosVinculadosACliente = (sociosResponse.data.socios || [])
        .filter((socio) => socio.clienteOrigem)
        .map((socio) => ({
          ...socio,
          optionType: "socio",
          optionKey: `socio-${socio.id}`,
          nome:
            socio.clienteOrigem.apelido ||
            socio.clienteOrigem.nomeFantasia ||
            socio.clienteOrigem.razaoSocial ||
            socio.nome,
          cpf: socio.clienteOrigem.cnpj || socio.clienteOrigem.cpf || socio.cpf || "",
        }));

      setSocios(
        sortOptionsByDisplayName(getUniqueOptions([...clientesOptions, ...sociosVinculadosACliente]))
      );
    } catch (error) {
      console.error("Erro ao carregar sócios/empresas", error);
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

  const getSocioClienteOrigem = (socio) => socio?.clienteOrigem || null;

  const getSocioField = (socio, field) => {
    const clienteOrigem = getSocioClienteOrigem(socio);
    if (field === "codigoSistema") return clienteOrigem?.codigoSistema || clienteOrigem?.id || socio?.codigoSistema || socio?.id || "";
    if (field === "codigoErp") return clienteOrigem?.codigoErp || socio?.codigoErp || "";
    if (field === "apelido") {
      return clienteOrigem?.apelido || clienteOrigem?.nomeFantasia || clienteOrigem?.razaoSocial || socio?.apelido || socio?.nomeFantasia || socio?.nome || "";
    }
    if (field === "documento") return clienteOrigem?.cnpj || clienteOrigem?.cpf || socio?.cpf || "";
    return "";
  };

  const handleOpenModal = (vinculo = null) => {
    if (vinculo) {
      setEditingVinculo(vinculo.ClienteSocio.id);
      setEditingSocio(vinculo);
      setVinculoForm({
        socioId: vinculo.id,
        codigoErp: getSocioField(vinculo, "codigoErp"),
        percentual: vinculo.ClienteSocio.percentual || "",
        cargo: vinculo.ClienteSocio.cargo || "",
        ativo: vinculo.ClienteSocio.ativo !== undefined ? vinculo.ClienteSocio.ativo : true,
      });
    } else {
      setEditingVinculo(null);
      setEditingSocio(null);
      setVinculoForm({ ...EMPTY_VINCULO_FORM });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingVinculo(null);
    setEditingSocio(null);
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setVinculoForm({
      ...vinculoForm,
      [name]: name === "codigoErp" ? value.replace(/\D/g, "").slice(0, 7) : type === "checkbox" ? checked : value,
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
        socioId: vinculoForm.socioId,
        percentual: vinculoForm.percentual,
        cargo: vinculoForm.cargo,
        ativo: vinculoForm.ativo,
        modoCadastro: "basico",
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

  // Handlers do modal de cadastro rápido de sócio
  const handleOpenNovoSocioModal = () => {
    setNovoSocioForm({ ...EMPTY_NOVO_SOCIO_FORM });
    setNovoSocioModalOpen(true);
  };

  const handleCloseNovoSocioModal = () => {
    setNovoSocioModalOpen(false);
  };

  const handleNovoSocioInputChange = (e) => {
    const { name, value } = e.target;
    setNovoSocioForm({
      ...novoSocioForm,
      [name]: value,
    });
  };

  const handleNovoSocioCpfChange = (e) => {
    setNovoSocioForm({ ...novoSocioForm, cpf: formatCpfCnpj(e.target.value) });
  };

  const handleSelectSocioOption = async (option) => {
    if (!option) {
      setVinculoForm({ ...vinculoForm, socioId: null });
      return;
    }

    if (option.optionType === "socio") {
      setVinculoForm({ ...vinculoForm, socioId: option.id, codigoErp: getSocioField(option, "codigoErp") });
      return;
    }

    await handleCriarSocioPorCliente(option);
  };

  const handleCriarSocioPorCliente = async (cliente) => {
    const documento = (cliente.cnpj || cliente.cpf || "").replace(/\D/g, "");
    if (!documento || ![11, 14].includes(documento.length)) {
      toast.error("A empresa selecionada não possui CPF/CNPJ válido para cadastrar como sócio");
      return;
    }

    try {
      setSearchingSocios(true);
      const { data: novoSocio } = await api.post("/socios", {
        clienteOrigemId: cliente.id,
        nome: cliente.apelido || cliente.nomeFantasia || cliente.razaoSocial || cliente.nome,
        cpf: documento,
        email: cliente.email || "",
        telefone: cliente.telefone || "",
        celular: cliente.celular || "",
        codigoErp: cliente.codigoErp || "",
        codigoSistema: cliente.codigoSistema || "",
      });

      toast.success(`Empresa "${novoSocio.nome}" cadastrada como sócio`);
      await loadSocios(searchTerm);
      setVinculoForm((prev) => ({
        ...prev,
        socioId: novoSocio.id,
      }));
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Erro ao cadastrar empresa como sócio";
      if (errorMsg.toLowerCase().includes("cpf/cnpj já cadastrado")) {
        const { data } = await api.get("/socios", {
          params: {
            pageNumber: 1,
            searchParam: documento,
          },
        });
        const socioExistente = (data.socios || []).find(
          (socio) => (socio.cpf || "").replace(/\D/g, "") === documento
        );

        if (socioExistente) {
          const codigoErpCliente = cliente.codigoErp || "";
          const codigoSistemaCliente = cliente.codigoSistema || cliente.id || "";
          if (
            (codigoErpCliente && codigoErpCliente !== socioExistente.codigoErp) ||
            (codigoSistemaCliente && String(codigoSistemaCliente) !== String(socioExistente.codigoSistema || ""))
          ) {
            await api.put(`/socios/${socioExistente.id}`, {
              codigoErp: codigoErpCliente,
              codigoSistema: String(codigoSistemaCliente),
              clienteOrigemId: cliente.id,
            });
            socioExistente.codigoErp = codigoErpCliente;
            socioExistente.codigoSistema = String(codigoSistemaCliente);
            socioExistente.clienteOrigem = cliente;
          }

          setVinculoForm((prev) => ({
            ...prev,
            socioId: socioExistente.id,
          }));
          toast.info(`Sócio "${socioExistente.nome}" já cadastrado e selecionado`);
          return;
        }
      }

      toast.error(errorMsg);
    } finally {
      setSearchingSocios(false);
    }
  };

  const handleSalvarNovoSocio = async () => {
    if (!novoSocioForm.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    const cpfLimpo = novoSocioForm.cpf.replace(/\D/g, "");
    if (!cpfLimpo || ![11, 14].includes(cpfLimpo.length)) {
      toast.error("CPF/CNPJ é obrigatório e deve ser válido");
      return;
    }

    setSalvandoNovoSocio(true);
    try {
      const { data: novoSocio } = await api.post("/socios", {
        nome: novoSocioForm.nome,
        cpf: cpfLimpo,
      });

      toast.success(`Sócio "${novoSocio.nome}" cadastrado com sucesso`);

      // Recarrega lista e auto-seleciona o novo sócio no formulário de vínculo,
      // já preenchendo cargo e data de entrada informados no cadastro rápido
      await loadSocios();
      setVinculoForm((prev) => ({
        ...prev,
        socioId: novoSocio.id,
      }));

      handleCloseNovoSocioModal();
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Erro ao cadastrar sócio";
      toast.error(errorMsg);
    } finally {
      setSalvandoNovoSocio(false);
    }
  };

  const handleViewSocio = (socio) => {
    const clienteOrigemId = socio?.clienteOrigem?.id || socio?.clienteOrigemId;
    if (clienteOrigemId) {
      window.open(`/clientes/cadastro/${clienteOrigemId}`, "_blank");
      return;
    }

    toast.info("Este sócio ainda não possui cadastro centralizado em Clientes.");
  };

  const formatCPF = (cpf) => {
    if (!cpf) return "";
    return cpf
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const formatCpfCnpj = (value) => {
    if (!value) return "";
    const digits = value.replace(/\D/g, "");

    if (digits.length > 11) {
      return digits
        .slice(0, 14)
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }

    return formatCPF(digits);
  };

  const totalParticipacao = vinculos.reduce(
    (sum, vinculo) => sum + (parseFloat(vinculo.ClienteSocio?.percentual) || 0),
    0
  );

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

      {/* Modal de vínculo societário */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingVinculo ? "Editar Vínculo Societário" : "Adicionar Sócio"}
        </DialogTitle>
        <DialogContent>
          <Box className={classes.modalToolbar}>
            <Tooltip title="Cadastrar novo sócio">
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<NoteAddIcon />}
                onClick={handleOpenNovoSocioModal}
              >
                Novo Sócio
              </Button>
            </Tooltip>
          </Box>

          <Grid container spacing={2} style={{ marginTop: 8 }}>
            {!editingVinculo && (
              <Grid item xs={12}>
                <Autocomplete
                  options={socios}
                  filterOptions={(options) => getUniqueOptions(options)}
                  getOptionSelected={(option, value) =>
                    getOptionUniqueKey(option) === getOptionUniqueKey(value) ||
                    getOptionDisplayKey(option) === getOptionDisplayKey(value)
                  }
                  getOptionLabel={(option) => {
                    const cpfFormatted = formatCpfCnpj(option.cpf);
                    return `${option.nome} - ${cpfFormatted}`;
                  }}
                  value={
                    socios.find(
                      (s) => s.optionType === "socio" && s.id === vinculoForm.socioId
                    ) || null
                  }
                  onChange={(e, newValue) => handleSelectSocioOption(newValue)}
                  onInputChange={(event, value) => {
                    setSearchTerm(value);
                    loadSocios(value);
                  }}
                  loading={searchingSocios}
                  renderOption={(option) => (
                      <Box className={classes.autocompleteOption}>
                      <Box className={classes.optionPrimary}>
                        {option.nome}
                      </Box>
                      <Box className={classes.optionSecondary}>
                        CPF/CNPJ: {formatCpfCnpj(option.cpf)}
                        {option.codigoErp && ` • ERP: ${option.codigoErp}`}
                        {option.codigoSistema && ` • ID: ${option.codigoSistema}`}
                        {option.email && ` • ${option.email}`}
                        {option.celular && ` • ${option.celular}`}
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Buscar cliente"
                      required
                      fullWidth
                      placeholder="Digite nome fantasia, CPF/CNPJ, apelido, ID ou ERP..."
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <SearchIcon style={{ marginLeft: 8, color: "#999" }} />
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
                    Digite para buscar no cadastro de clientes por nome, CPF/CNPJ, apelido, ID ou ERP
                  </Typography>
                  <Typography variant="caption" className={classes.recordsCount}>
                    {searchingSocios
                      ? "Carregando registros..."
                      : `Total de registros: ${socios.length}${socios.length >= SOCIOS_SEARCH_LIMIT ? "+" : ""}`}
                  </Typography>
                </Box>
              </Grid>
            )}

            {(editingSocio || vinculoForm.socioId) && (
              <Grid item xs={12}>
                <Box className={classes.selectedClientBox}>
                  {["codigoSistema", "codigoErp", "apelido", "documento"].map((field) => {
                    const labels = {
                      codigoSistema: "ID",
                      codigoErp: "ERP",
                      apelido: "Apelido",
                      documento: "CPF/CNPJ",
                    };
                    const selectedSocio = editingSocio || socios.find((s) => s.id === vinculoForm.socioId);
                    const value = field === "documento"
                      ? formatCpfCnpj(getSocioField(selectedSocio, field))
                      : getSocioField(selectedSocio, field);

                    return (
                      <Box key={field} className={classes.selectedField}>
                        <Typography variant="caption" color="textSecondary">
                          {labels[field]}
                        </Typography>
                        <Typography variant="body2">{value || "-"}</Typography>
                      </Box>
                    );
                  })}
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

          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {editingVinculo ? "Atualizar" : "Adicionar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de cadastro rápido de novo sócio */}
      <Dialog
        open={novoSocioModalOpen}
        onClose={handleCloseNovoSocioModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cadastrar Novo Sócio</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
            Use esta opção quando o sócio ainda não existir no cadastro de clientes.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={7}>
              <TextField
                label="Nome *"
                name="nome"
                value={novoSocioForm.nome}
                onChange={handleNovoSocioInputChange}
                fullWidth
                autoFocus
                disabled={salvandoNovoSocio}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                label="CPF/CNPJ *"
                name="cpf"
                value={novoSocioForm.cpf}
                onChange={handleNovoSocioCpfChange}
                fullWidth
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                inputProps={{ maxLength: 18 }}
                disabled={salvandoNovoSocio}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNovoSocioModal} disabled={salvandoNovoSocio}>
            Cancelar
          </Button>
          <Button
            onClick={handleSalvarNovoSocio}
            color="primary"
            variant="contained"
            disabled={salvandoNovoSocio}
            startIcon={salvandoNovoSocio ? <CircularProgress size={18} color="inherit" /> : <PersonAddIcon />}
          >
            {salvandoNovoSocio ? "Salvando..." : "Cadastrar Sócio"}
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
              onClick={() => window.open("/clientes", "_blank")}
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
              <TableCell>ID</TableCell>
              <TableCell>ERP</TableCell>
              <TableCell>Apelido</TableCell>
              <TableCell>CPF/CNPJ</TableCell>
              <TableCell>Participação</TableCell>
              <TableCell>Cargo</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vinculos.map((vinculo) => (
              <TableRow key={vinculo.id}>
                <TableCell>{getSocioField(vinculo, "codigoSistema") || "-"}</TableCell>
                <TableCell>{getSocioField(vinculo, "codigoErp") || "-"}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getSocioField(vinculo, "apelido")}
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
                <TableCell>{formatCpfCnpj(getSocioField(vinculo, "documento"))}</TableCell>
                <TableCell>{vinculo.ClienteSocio?.percentual || 0}%</TableCell>
                <TableCell>{vinculo.ClienteSocio?.cargo || "-"}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Ver/Editar Sócio">
                    <IconButton
                      size="small"
                      onClick={() => handleViewSocio(vinculo)}
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
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} align="right">
                <Typography variant="subtitle2" style={{ fontWeight: 600 }}>
                  Total
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="subtitle2"
                  style={{
                    fontWeight: 600,
                    color: totalParticipacao > 100 ? "#c62828" : undefined,
                  }}
                >
                  {totalParticipacao.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%
                </Typography>
              </TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          </TableFooter>
        </Table>
      )}
    </Box>
  );
};

export default QuadroSocietario;
