import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  Grid,
  Card,
  CardContent,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  Box,
  Tabs,
  Tab,
} from "@material-ui/core";
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  Assessment,
  Phone,
  Email,
  WhatsApp,
  Description,
} from "@material-ui/icons";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import Autocomplete from "@material-ui/lab/Autocomplete";

import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  searchContainer: {
    display: "flex",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    flexWrap: "wrap",
  },
  searchField: {
    minWidth: "250px",
  },
  table: {
    minWidth: 650,
  },
  statusChip: {
    fontWeight: 500,
    fontSize: "0.75rem",
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(1),
  },
  summaryCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  summaryCard: {
    textAlign: "center",
    padding: theme.spacing(2),
  },
  historyTimeline: {
    maxHeight: "400px",
    overflowY: "auto",
  },
  historyItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  historyAvatar: {
    backgroundColor: theme.palette.primary.main,
  },
  dialogContent: {
    minHeight: "400px",
  },
  formField: {
    marginBottom: theme.spacing(2),
  },
}));

const statusOptions = [
  { value: "pendente", label: "Pendente", color: "#9e9e9e" },
  { value: "aguardando_cliente", label: "Aguardando Cliente", color: "#ff9800" },
  { value: "sem_resposta", label: "Sem Resposta", color: "#f44336" },
  { value: "andamento_com_parcelamento", label: "Andamento com Parcelamento", color: "#2196f3" },
  { value: "andamento_sem_parcelamento", label: "Andamento sem Parcelamento", color: "#03a9f4" },
  { value: "renegociacao", label: "Renegociação", color: "#ff5722" },
  { value: "pago", label: "Pago", color: "#4caf50" },
  { value: "cancelado", label: "Cancelado", color: "#757575" },
  { value: "juridico", label: "Jurídico", color: "#d32f2f" },
];

const paymentMethodOptions = [
  "Boleto",
  "PIX",
  "Cartão de Crédito",
  "Cartão de Débito",
  "Transferência Bancária",
  "Dinheiro",
  "Outros",
];

const contactTypeOptions = [
  "telefone",
  "email",
  "whatsapp",
  "presencial",
  "outro",
];

const Cobranca = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [contacts, setContacts] = useState([]);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const [selectedBilling, setSelectedBilling] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [reportPeriod, setReportPeriod] = useState("daily");

  // Form states
  const [billingForm, setBillingForm] = useState({
    contactId: "",
    clientName: "",
    tradeName: "",
    accountPayable: "",
    accountReceivable: "",
    balance: "",
    totalAmount: "",
    dueDate: "",
    nextContactDate: "",
    contractNumber: "",
    paymentMethod: "",
    status: "pendente",
    notes: "",
  });

  const [historyForm, setHistoryForm] = useState({
    contactDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    contactType: "telefone",
    description: "",
    newStatus: "",
    amountPaid: "",
  });

  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadBillings();
    loadContacts();
  }, [searchParam, statusFilter]);

  const loadBillings = async () => {
    setLoading(true);
    try {
      const params = {
        searchParam,
        status: statusFilter,
      };
      const { data } = await api.get("/billings", { params });
      setBillings(data.billings || []);
    } catch (error) {
      console.error("Erro ao carregar cobranças:", error);
      toast.error("Erro ao carregar cobranças");
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      const { data } = await api.get("/contacts", {
        params: { searchParam: "", pageNumber: 1 },
      });
      setContacts(data.contacts || []);
    } catch (error) {
      console.error("Erro ao carregar contatos:", error);
    }
  };

  const loadBillingHistory = async (billingId) => {
    try {
      const { data } = await api.get(`/billings/${billingId}/history`);
      setBillingHistory(data || []);
    } catch (error) {
      toast.error("Erro ao carregar histórico");
    }
  };

  const loadReport = async () => {
    try {
      const { data } = await api.get("/billings-report", {
        params: { period: reportPeriod },
      });
      setReportData(data);
    } catch (error) {
      toast.error("Erro ao carregar relatório");
    }
  };

  const handleOpenModal = () => {
    setSelectedBilling(null);
    setBillingForm({
      contactId: "",
      clientName: "",
      tradeName: "",
      accountPayable: "",
      accountReceivable: "",
      balance: "",
      totalAmount: "",
      dueDate: "",
      nextContactDate: "",
      contractNumber: "",
      paymentMethod: "",
      status: "pendente",
      notes: "",
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBilling(null);
  };

  const handleOpenEditModal = (billing) => {
    setSelectedBilling(billing);
    setBillingForm({
      contactId: billing.contactId || "",
      clientName: billing.clientName || "",
      tradeName: billing.tradeName || "",
      accountPayable: billing.accountPayable || "",
      accountReceivable: billing.accountReceivable || "",
      balance: billing.balance || "",
      totalAmount: billing.totalAmount || "",
      dueDate: billing.dueDate ? format(parseISO(billing.dueDate), "yyyy-MM-dd") : "",
      nextContactDate: billing.nextContactDate
        ? format(parseISO(billing.nextContactDate), "yyyy-MM-dd")
        : "",
      contractNumber: billing.contractNumber || "",
      paymentMethod: billing.paymentMethod || "",
      status: billing.status || "pendente",
      notes: billing.notes || "",
    });
    setModalOpen(true);
  };

  const handleOpenViewModal = async (billing) => {
    setSelectedBilling(billing);
    await loadBillingHistory(billing.id);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedBilling(null);
    setBillingHistory([]);
  };

  const handleSaveBilling = async () => {
    try {
      if (!billingForm.clientName.trim()) {
        toast.error("Nome do cliente é obrigatório");
        return;
      }

      if (selectedBilling) {
        await api.put(`/billings/${selectedBilling.id}`, billingForm);
        toast.success("Cobrança atualizada com sucesso!");
      } else {
        await api.post("/billings", billingForm);
        toast.success("Cobrança criada com sucesso!");
      }
      loadBillings();
      handleCloseModal();
    } catch (error) {
      toast.error("Erro ao salvar cobrança");
    }
  };

  const handleDeleteBilling = async (billingId) => {
    if (window.confirm("Tem certeza que deseja excluir esta cobrança?")) {
      try {
        await api.delete(`/billings/${billingId}`);
        toast.success("Cobrança excluída com sucesso!");
        loadBillings();
      } catch (error) {
        toast.error("Erro ao excluir cobrança");
      }
    }
  };

  const handleAddHistory = async () => {
    try {
      if (!historyForm.description.trim()) {
        toast.error("Descrição é obrigatória");
        return;
      }

      await api.post(`/billings/${selectedBilling.id}/history`, {
        ...historyForm,
        previousStatus: selectedBilling.status,
        newStatus: historyForm.newStatus || selectedBilling.status,
      });

      toast.success("Contato adicionado com sucesso!");
      await loadBillingHistory(selectedBilling.id);
      await loadBillings();

      setHistoryForm({
        contactDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        contactType: "telefone",
        description: "",
        newStatus: "",
        amountPaid: "",
      });
    } catch (error) {
      toast.error("Erro ao adicionar contato");
    }
  };

  const handleOpenReportModal = () => {
    loadReport();
    setReportModalOpen(true);
  };

  const getStatusColor = (status) => {
    const statusObj = statusOptions.find((s) => s.value === status);
    return statusObj ? statusObj.color : "#9e9e9e";
  };

  const getStatusLabel = (status) => {
    const statusObj = statusOptions.find((s) => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const formatCurrency = (value) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    try {
      return format(parseISO(date), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "-";
    try {
      return format(parseISO(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>💰 Gestão de Cobranças</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Assessment />}
            onClick={handleOpenReportModal}
          >
            Relatórios
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleOpenModal}
          >
            Nova Cobrança
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        {/* Filtros */}
        <div className={classes.searchContainer}>
          <TextField
            className={classes.searchField}
            placeholder="Buscar por cliente, empresa ou contrato..."
            value={searchParam}
            onChange={(e) => setSearchParam(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            size="small"
          />

          <FormControl variant="outlined" size="small" style={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="">Todos</MenuItem>
              {statusOptions.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* Tabela */}
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Nome Fantasia</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Vencimento</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Próximo Contato</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRowSkeleton columns={7} />
            ) : (
              billings.map((billing) => (
                <TableRow key={billing.id}>
                  <TableCell>{billing.clientName}</TableCell>
                  <TableCell>{billing.tradeName || "-"}</TableCell>
                  <TableCell>{formatCurrency(billing.accountPayable)}</TableCell>
                  <TableCell>{formatDate(billing.dueDate)}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(billing.status)}
                      size="small"
                      className={classes.statusChip}
                      style={{
                        backgroundColor: getStatusColor(billing.status),
                        color: "#fff",
                      }}
                    />
                  </TableCell>
                  <TableCell>{formatDate(billing.nextContactDate)}</TableCell>
                  <TableCell align="center">
                    <div className={classes.actionButtons}>
                      <Tooltip title="Ver Detalhes">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenViewModal(billing)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEditModal(billing)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteBilling(billing.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!loading && billings.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
            <Typography variant="body1">
              Nenhuma cobrança encontrada. Clique em "Nova Cobrança" para começar.
            </Typography>
          </div>
        )}
      </Paper>

      {/* Modals serão adicionados aqui */}
      
      {/* Modal de Criação/Edição */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedBilling ? "Editar Cobrança" : "Nova Cobrança"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: 8 }}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={contacts}
                getOptionLabel={(option) => option.name || ""}
                value={contacts.find((c) => c.id === billingForm.contactId) || null}
                onChange={(e, newValue) => {
                  setBillingForm({
                    ...billingForm,
                    contactId: newValue?.id || "",
                    clientName: newValue?.name || billingForm.clientName,
                  });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Selecionar Contato (Opcional)" variant="outlined" fullWidth />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Nome do Cliente *"
                value={billingForm.clientName}
                onChange={(e) => setBillingForm({ ...billingForm, clientName: e.target.value })}
                variant="outlined"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Nome Fantasia"
                value={billingForm.tradeName}
                onChange={(e) => setBillingForm({ ...billingForm, tradeName: e.target.value })}
                variant="outlined"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Número do Contrato/NF"
                value={billingForm.contractNumber}
                onChange={(e) => setBillingForm({ ...billingForm, contractNumber: e.target.value })}
                variant="outlined"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Conta a Pagar"
                type="number"
                value={billingForm.accountPayable}
                onChange={(e) => setBillingForm({ ...billingForm, accountPayable: e.target.value })}
                variant="outlined"
                fullWidth
                InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Conta a Receber"
                type="number"
                value={billingForm.accountReceivable}
                onChange={(e) => setBillingForm({ ...billingForm, accountReceivable: e.target.value })}
                variant="outlined"
                fullWidth
                InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Saldo"
                type="number"
                value={billingForm.balance}
                onChange={(e) => setBillingForm({ ...billingForm, balance: e.target.value })}
                variant="outlined"
                fullWidth
                InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Valor Total"
                type="number"
                value={billingForm.totalAmount}
                onChange={(e) => setBillingForm({ ...billingForm, totalAmount: e.target.value })}
                variant="outlined"
                fullWidth
                InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Data de Vencimento"
                type="date"
                value={billingForm.dueDate}
                onChange={(e) => setBillingForm({ ...billingForm, dueDate: e.target.value })}
                variant="outlined"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Próximo Contato"
                type="date"
                value={billingForm.nextContactDate}
                onChange={(e) => setBillingForm({ ...billingForm, nextContactDate: e.target.value })}
                variant="outlined"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel>Forma de Pagamento</InputLabel>
                <Select
                  value={billingForm.paymentMethod}
                  onChange={(e) => setBillingForm({ ...billingForm, paymentMethod: e.target.value })}
                  label="Forma de Pagamento"
                >
                  <MenuItem value="">Nenhum</MenuItem>
                  {paymentMethodOptions.map((method) => (
                    <MenuItem key={method} value={method}>
                      {method}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={billingForm.status}
                  onChange={(e) => setBillingForm({ ...billingForm, status: e.target.value })}
                  label="Status"
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Observações"
                value={billingForm.notes}
                onChange={(e) => setBillingForm({ ...billingForm, notes: e.target.value })}
                variant="outlined"
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button onClick={handleSaveBilling} color="primary" variant="contained">
            {selectedBilling ? "Atualizar" : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Visualização com Histórico */}
      <Dialog open={viewModalOpen} onClose={handleCloseViewModal} maxWidth="md" fullWidth>
        <DialogTitle>Detalhes da Cobrança</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {selectedBilling && (
            <>
              <Tabs
                value={tabValue}
                onChange={(e, newValue) => setTabValue(newValue)}
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="Informações" />
                <Tab label="Histórico de Contatos" />
              </Tabs>

              {tabValue === 0 && (
                <Box p={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Cliente</Typography>
                      <Typography variant="body1" paragraph>{selectedBilling.clientName}</Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Nome Fantasia</Typography>
                      <Typography variant="body1" paragraph>{selectedBilling.tradeName || "-"}</Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Conta a Pagar</Typography>
                      <Typography variant="body1" paragraph>{formatCurrency(selectedBilling.accountPayable)}</Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                      <Chip
                        label={getStatusLabel(selectedBilling.status)}
                        style={{ backgroundColor: getStatusColor(selectedBilling.status), color: "#fff" }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {tabValue === 1 && (
                <Box p={2}>
                  <Paper style={{ padding: 16, marginBottom: 16 }}>
                    <Typography variant="h6" gutterBottom>Adicionar Novo Contato</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Data/Hora do Contato"
                          type="datetime-local"
                          value={historyForm.contactDate}
                          onChange={(e) => setHistoryForm({ ...historyForm, contactDate: e.target.value })}
                          variant="outlined"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <FormControl variant="outlined" fullWidth>
                          <InputLabel>Tipo de Contato</InputLabel>
                          <Select
                            value={historyForm.contactType}
                            onChange={(e) => setHistoryForm({ ...historyForm, contactType: e.target.value })}
                            label="Tipo de Contato"
                          >
                            {contactTypeOptions.map((type) => (
                              <MenuItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <FormControl variant="outlined" fullWidth>
                          <InputLabel>Novo Status</InputLabel>
                          <Select
                            value={historyForm.newStatus}
                            onChange={(e) => setHistoryForm({ ...historyForm, newStatus: e.target.value })}
                            label="Novo Status"
                          >
                            <MenuItem value="">Manter Atual</MenuItem>
                            {statusOptions.map((status) => (
                              <MenuItem key={status.value} value={status.value}>
                                {status.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Valor Pago (se houver)"
                          type="number"
                          value={historyForm.amountPaid}
                          onChange={(e) => setHistoryForm({ ...historyForm, amountPaid: e.target.value })}
                          variant="outlined"
                          fullWidth
                          InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          label="Descrição do Contato *"
                          value={historyForm.description}
                          onChange={(e) => setHistoryForm({ ...historyForm, description: e.target.value })}
                          variant="outlined"
                          fullWidth
                          multiline
                          rows={3}
                          placeholder="Descreva o que foi conversado..."
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Button variant="contained" color="primary" onClick={handleAddHistory} fullWidth>
                          Adicionar Contato
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>

                  <Typography variant="h6" gutterBottom>Histórico de Contatos</Typography>
                  <div className={classes.historyTimeline}>
                    {billingHistory.length === 0 ? (
                      <Typography variant="body2" color="textSecondary" align="center">
                        Nenhum contato registrado ainda.
                      </Typography>
                    ) : (
                      <List>
                        {billingHistory.map((history, index) => (
                          <React.Fragment key={history.id}>
                            <ListItem alignItems="flex-start">
                              <Avatar className={classes.historyAvatar}>
                                {history.contactType === "telefone" && <Phone />}
                                {history.contactType === "email" && <Email />}
                                {history.contactType === "whatsapp" && <WhatsApp />}
                                {!["telefone", "email", "whatsapp"].includes(history.contactType) && <Description />}
                              </Avatar>
                              <ListItemText
                                primary={
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="body2" component="span">
                                      {history.user?.name || "Usuário"}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary" component="span">
                                      {formatDateTime(history.contactDate)}
                                    </Typography>
                                    {history.newStatus !== history.previousStatus && (
                                      <Chip
                                        label={`${getStatusLabel(history.previousStatus)} → ${getStatusLabel(history.newStatus)}`}
                                        size="small"
                                        color="primary"
                                      />
                                    )}
                                  </Box>
                                }
                                secondary={
                                  <>
                                    <Typography variant="body2" component="p">{history.description}</Typography>
                                    {history.amountPaid && (
                                      <Typography variant="caption" color="primary" component="p">
                                        Valor pago: {formatCurrency(history.amountPaid)}
                                      </Typography>
                                    )}
                                  </>
                                }
                              />
                            </ListItem>
                            {index < billingHistory.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </div>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewModal}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Relatórios */}
      <Dialog open={reportModalOpen} onClose={() => setReportModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>📊 Relatórios de Cobrança</DialogTitle>
        <DialogContent>
          <FormControl variant="outlined" fullWidth style={{ marginBottom: 16 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={reportPeriod}
              onChange={(e) => {
                setReportPeriod(e.target.value);
                loadReport();
              }}
              label="Período"
            >
              <MenuItem value="daily">Diário</MenuItem>
              <MenuItem value="weekly">Semanal</MenuItem>
              <MenuItem value="monthly">Mensal</MenuItem>
            </Select>
          </FormControl>

          {reportData && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent className={classes.summaryCard}>
                    <Typography variant="h4">{reportData.totalBillings}</Typography>
                    <Typography variant="body2" color="textSecondary">Total de Cobranças</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent className={classes.summaryCard}>
                    <Typography variant="h4">{formatCurrency(reportData.totalAmount)}</Typography>
                    <Typography variant="body2" color="textSecondary">Total a Receber</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent className={classes.summaryCard}>
                    <Typography variant="h4">{reportData.contactsCount}</Typography>
                    <Typography variant="body2" color="textSecondary">Contatos no Período</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Cobranças por Status</Typography>
                <List>
                  {reportData.byStatus && reportData.byStatus.map((item) => (
                    <ListItem key={item.status}>
                      <Chip
                        label={getStatusLabel(item.status)}
                        style={{ backgroundColor: getStatusColor(item.status), color: "#fff", marginRight: 8 }}
                      />
                      <ListItemText
                        primary={`${item.count} cobrança(s)`}
                        secondary={formatCurrency(item.total)}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportModalOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </MainContainer>
  );
};

export default Cobranca;
