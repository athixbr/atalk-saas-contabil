import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  makeStyles,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography
} from "@material-ui/core";
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  Business,
  Phone,
  Email,
  WhatsApp
} from "@material-ui/icons";
import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import { AuthContext } from "../../context/Auth/AuthContext";
import {
  getCrmClients,
  createCrmClient,
  updateCrmClient,
  deleteCrmClient
} from "../../services/crmClients";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    margin: theme.spacing(1),
  },
  searchContainer: {
    display: "flex",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    flexWrap: "wrap",
  },
  statusChip: {
    fontWeight: "bold",
  },
}));

const CrmClients = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [taxRegimes, setTaxRegimes] = useState([]);
  const [users, setUsers] = useState([]);

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    cnpj: "",
    phone: "",
    whatsapp: "",
    email: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    businessTypeId: "",
    taxRegimeId: "",
    userId: "",
    status: "active",
    notes: ""
  });

  useEffect(() => {
    loadClients();
    loadBusinessTypes();
    loadTaxRegimes();
    loadUsers();
  }, [searchParam, statusFilter]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchParam) params.searchParam = searchParam;
      if (statusFilter) params.status = statusFilter;
      
      const data = await getCrmClients(params);
      setClients(data.clients || []);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  const loadBusinessTypes = async () => {
    try {
      const { data } = await api.get("/crm/business-types");
      setBusinessTypes(data || []);
    } catch (err) {
      console.error("Erro ao carregar tipos de negócio:", err);
    }
  };

  const loadTaxRegimes = async () => {
    try {
      const { data } = await api.get("/crm/tax-regimes");
      setTaxRegimes(data || []);
    } catch (err) {
      console.error("Erro ao carregar regimes tributários:", err);
    }
  };

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data.users || []);
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
    }
  };

  const handleOpenModal = (client = null) => {
    if (client) {
      setSelectedClient(client);
      setFormData({
        name: client.name || "",
        companyName: client.companyName || "",
        cnpj: client.cnpj || "",
        phone: client.phone || "",
        whatsapp: client.whatsapp || "",
        email: client.email || "",
        street: client.street || "",
        number: client.number || "",
        complement: client.complement || "",
        neighborhood: client.neighborhood || "",
        city: client.city || "",
        state: client.state || "",
        zipCode: client.zipCode || "",
        businessTypeId: client.businessTypeId || "",
        taxRegimeId: client.taxRegimeId || "",
        userId: client.userId || "",
        status: client.status || "active",
        notes: client.notes || ""
      });
    } else {
      setSelectedClient(null);
      setFormData({
        name: "",
        companyName: "",
        cnpj: "",
        phone: "",
        whatsapp: "",
        email: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        businessTypeId: "",
        taxRegimeId: "",
        userId: "",
        status: "active",
        notes: ""
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedClient(null);
  };

  const handleSaveClient = async () => {
    try {
      if (!formData.name || formData.name.trim() === "") {
        toast.error("Nome é obrigatório");
        return;
      }

      if (selectedClient) {
        await updateCrmClient(selectedClient.id, formData);
        toast.success("Cliente atualizado com sucesso!");
      } else {
        await createCrmClient(formData);
        toast.success("Cliente criado com sucesso!");
      }

      handleCloseModal();
      loadClients();
    } catch (err) {
      console.error("Erro ao salvar cliente:", err);
      const errorMessage = err.response?.data?.message || "Erro ao salvar cliente";
      toast.error(errorMessage);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm("Deseja realmente excluir este cliente?")) {
      return;
    }

    try {
      await deleteCrmClient(clientId);
      toast.success("Cliente excluído com sucesso!");
      loadClients();
    } catch (err) {
      console.error("Erro ao excluir cliente:", err);
      toast.error("Erro ao excluir cliente");
    }
  };

  const handleViewClient = (clientId) => {
    history.push(`/crm/clientes/${clientId}`);
  };

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const getStatusColor = (status) => {
    return status === "active" ? "primary" : "default";
  };

  const formatCNPJ = (cnpj) => {
    if (!cnpj) return "";
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Clientes CRM</Title>
        <MainHeader>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpenModal()}
          >
            Novo Cliente
          </Button>
        </MainHeader>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <div className={classes.searchContainer}>
          <TextField
            placeholder="Buscar por nome, empresa, CNPJ, telefone, email..."
            value={searchParam}
            onChange={(e) => setSearchParam(e.target.value)}
            variant="outlined"
            size="small"
            style={{ flex: 1, minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <FormControl variant="outlined" size="small" style={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="active">Ativo</MenuItem>
              <MenuItem value="inactive">Inativo</MenuItem>
            </Select>
          </FormControl>
        </div>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Empresa</TableCell>
              <TableCell>CNPJ</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Responsável</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="textSecondary">
                    Nenhum cliente encontrado. Clique em "Novo Cliente" para começar.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id} hover>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.companyName || "-"}</TableCell>
                  <TableCell>{client.cnpj ? formatCNPJ(client.cnpj) : "-"}</TableCell>
                  <TableCell>{client.phone || "-"}</TableCell>
                  <TableCell>{client.email || "-"}</TableCell>
                  <TableCell>{client.user?.name || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={client.status === "active" ? "Ativo" : "Inativo"}
                      color={getStatusColor(client.status)}
                      size="small"
                      className={classes.statusChip}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleViewClient(client.id)}
                      title="Visualizar"
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenModal(client)}
                      title="Editar"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClient(client.id)}
                      title="Excluir"
                      color="secondary"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Modal de Cadastro/Edição */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedClient ? "Editar Cliente" : "Novo Cliente"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nome do Contato *"
                fullWidth
                value={formData.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                variant="outlined"
                placeholder="Nome do responsável"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Razão Social"
                fullWidth
                value={formData.companyName}
                onChange={(e) => handleFormChange("companyName", e.target.value)}
                variant="outlined"
                placeholder="Nome da empresa"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="CNPJ"
                fullWidth
                value={formData.cnpj}
                onChange={(e) => handleFormChange("cnpj", e.target.value)}
                variant="outlined"
                placeholder="00.000.000/0000-00"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Telefone"
                fullWidth
                value={formData.phone}
                onChange={(e) => handleFormChange("phone", e.target.value)}
                variant="outlined"
                placeholder="(00) 0000-0000"
                InputProps={{
                  startAdornment: <Phone fontSize="small" style={{ marginRight: 8 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="WhatsApp"
                fullWidth
                value={formData.whatsapp}
                onChange={(e) => handleFormChange("whatsapp", e.target.value)}
                variant="outlined"
                placeholder="(00) 00000-0000"
                InputProps={{
                  startAdornment: <WhatsApp fontSize="small" style={{ marginRight: 8 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="E-mail"
                fullWidth
                value={formData.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
                variant="outlined"
                placeholder="email@exemplo.com"
                InputProps={{
                  startAdornment: <Email fontSize="small" style={{ marginRight: 8 }} />
                }}
              />
            </Grid>

            {/* Endereço */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary" style={{ marginTop: 16 }}>
                Endereço
              </Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Rua/Avenida"
                fullWidth
                value={formData.street}
                onChange={(e) => handleFormChange("street", e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Número"
                fullWidth
                value={formData.number}
                onChange={(e) => handleFormChange("number", e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Complemento"
                fullWidth
                value={formData.complement}
                onChange={(e) => handleFormChange("complement", e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Bairro"
                fullWidth
                value={formData.neighborhood}
                onChange={(e) => handleFormChange("neighborhood", e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="CEP"
                fullWidth
                value={formData.zipCode}
                onChange={(e) => handleFormChange("zipCode", e.target.value)}
                variant="outlined"
                placeholder="00000-000"
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Cidade"
                fullWidth
                value={formData.city}
                onChange={(e) => handleFormChange("city", e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Estado (UF)"
                fullWidth
                value={formData.state}
                onChange={(e) => handleFormChange("state", e.target.value)}
                variant="outlined"
                placeholder="SP"
                inputProps={{ maxLength: 2 }}
              />
            </Grid>

            {/* Dados Adicionais */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary" style={{ marginTop: 16 }}>
                Informações Adicionais
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Tipo de Negócio</InputLabel>
                <Select
                  value={formData.businessTypeId}
                  onChange={(e) => handleFormChange("businessTypeId", e.target.value)}
                  label="Tipo de Negócio"
                >
                  <MenuItem value="">Nenhum</MenuItem>
                  {businessTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Regime Tributário</InputLabel>
                <Select
                  value={formData.taxRegimeId}
                  onChange={(e) => handleFormChange("taxRegimeId", e.target.value)}
                  label="Regime Tributário"
                >
                  <MenuItem value="">Nenhum</MenuItem>
                  {taxRegimes.map((regime) => (
                    <MenuItem key={regime.id} value={regime.id}>
                      {regime.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Responsável</InputLabel>
                <Select
                  value={formData.userId}
                  onChange={(e) => handleFormChange("userId", e.target.value)}
                  label="Responsável"
                >
                  <MenuItem value="">Nenhum</MenuItem>
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleFormChange("status", e.target.value)}
                  label="Status"
                >
                  <MenuItem value="active">Ativo</MenuItem>
                  <MenuItem value="inactive">Inativo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Observações"
                fullWidth
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => handleFormChange("notes", e.target.value)}
                variant="outlined"
                placeholder="Anotações sobre o cliente..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={handleSaveClient}
            color="primary"
            variant="contained"
            disabled={!formData.name || formData.name.trim() === ""}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </MainContainer>
  );
};

export default CrmClients;
