import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
  Paper,
  Container,
  TextField,
  Button,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  InputAdornment,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import SearchIcon from "@material-ui/icons/Search";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import InfoIcon from "@material-ui/icons/Info";
import SettingsIcon from "@material-ui/icons/Settings";
import ChecklistIcon from "@material-ui/icons/PlaylistAddCheck";
import NotificationsIcon from "@material-ui/icons/Notifications";
import AttachMoneyIcon from "@material-ui/icons/AttachMoney";
import PeopleIcon from "@material-ui/icons/People";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    maxWidth: "1400px",
    margin: "0 auto",
  },
  paper: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
  },
  accordion: {
    marginBottom: theme.spacing(2),
    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
    "&:before": {
      display: "none",
    },
  },
  accordionSummary: {
    backgroundColor: "#f5f5f5",
    borderRadius: "4px",
    minHeight: "56px",
    "&.Mui-expanded": {
      minHeight: "56px",
    },
  },
  accordionTitle: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    fontWeight: 600,
  },
  accordionDetails: {
    padding: theme.spacing(3),
  },
  saveButton: {
    background: "linear-gradient(135deg, #0596cd 0%, #047ba5 100%)",
    color: "#fff",
    padding: "10px 30px",
    "&:hover": {
      background: "linear-gradient(135deg, #047ba5 0%, #035c7d 100%)",
    },
  },
  searchField: {
    marginBottom: theme.spacing(2),
  },
  tableContainer: {
    maxHeight: "400px",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
  },
  helperText: {
    fontSize: "0.75rem",
    color: "#666",
    marginTop: "4px",
  },
}));

const NovoParcelamento = () => {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams();
  const isEdit = !!id;

  // Estados para os acordeões
  const [expanded, setExpanded] = useState("informacoes");

  // Estados dos campos - Informações Gerais
  const [codigo, setCodigo] = useState("");
  const [classificacao, setClassificacao] = useState("");
  const [mininome, setMininome] = useState("");
  const [nomeTarefa, setNomeTarefa] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");

  // Estados - Prazos e Configurações
  const [prazoEntregaDias, setPrazoEntregaDias] = useState("");
  const [prazoEntregaHoras, setPrazoEntregaHoras] = useState("");
  const [esfera, setEsfera] = useState("");
  const [exigeAgendamento, setExigeAgendamento] = useState("");
  const [habilitarDeclaracao, setHabilitarDeclaracao] = useState("");
  const [notificaVencimento, setNotificaVencimento] = useState("");
  const [parecerAutomatico, setParecerAutomatico] = useState("");
  const [recorrente, setRecorrente] = useState("");
  const [requerAnexo, setRequerAnexo] = useState("");
  const [requerCampoProcesso, setRequerCampoProcesso] = useState("");
  const [responderProtocolo, setResponderProtocolo] = useState("");
  const [ativa, setAtiva] = useState("");
  const [retencaoMeses, setRetencaoMeses] = useState("");
  const [prazoMinimoRealizacao, setPrazoMinimoRealizacao] = useState("");
  const [semVencimento, setSemVencimento] = useState("");

  // Estados - Checklist
  const [checklistId, setChecklistId] = useState("");

  // Estados - Notificações
  const [canaisNotificacao, setCanaisNotificacao] = useState([]);

  // Estados - Financeiro
  const [valor, setValor] = useState("");

  // Estados - Clientes
  const [clientesSelecionados, setClientesSelecionados] = useState([]);
  const [searchCliente, setSearchCliente] = useState("");

  // Estados de dados carregados
  const [departamentos, setDepartamentos] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [contatosNotificacao, setContatosNotificacao] = useState([]);

  useEffect(() => {
    loadData();
    if (isEdit) {
      loadParcelamento();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const [deptResponse, checklistResponse, clientesResponse, contatosResponse] = await Promise.all([
        api.get("/queue"),
        api.get("/checklists"),
        api.get("/contacts"),
        api.get("/contacts"),
      ]);

      setDepartamentos(deptResponse.data || []);
      setChecklists(checklistResponse.data.checklists || checklistResponse.data || []);
      setClientes(clientesResponse.data.contacts || clientesResponse.data || []);
      setContatosNotificacao(contatosResponse.data.contacts || contatosResponse.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    }
  };

  const loadParcelamento = async () => {
    try {
      const { data } = await api.get(`/parcelamentos/${id}`);
      
      // Preencher campos
      setCodigo(data.codigo || "");
      setClassificacao(data.classificacao || "");
      setMininome(data.mininome || "");
      setNomeTarefa(data.nomeTarefa || "");
      setDepartamentoId(data.departamentoId || "");
      
      // Prazos
      setPrazoEntregaDias(data.prazoEntregaDias || "");
      setPrazoEntregaHoras(data.prazoEntregaHoras || "");
      setEsfera(data.esfera || "");
      setExigeAgendamento(data.exigeAgendamento || "");
      setHabilitarDeclaracao(data.habilitarDeclaracao || "");
      setNotificaVencimento(data.notificaVencimento || "");
      setParecerAutomatico(data.parecerAutomatico || "");
      setRecorrente(data.recorrente || "");
      setRequerAnexo(data.requerAnexo || "");
      setRequerCampoProcesso(data.requerCampoProcesso || "");
      setResponderProtocolo(data.responderProtocolo || "");
      setAtiva(data.ativa || "");
      setRetencaoMeses(data.retencaoMeses || "");
      setPrazoMinimoRealizacao(data.prazoMinimoRealizacao || "");
      setSemVencimento(data.semVencimento || "");
      
      // Outros
      setChecklistId(data.checklistId || "");
      setCanaisNotificacao(data.canaisNotificacao || []);
      setValor(data.valor || "");
      setClientesSelecionados(data.clientes?.map(c => c.id) || []);
    } catch (error) {
      console.error("Erro ao carregar parcelamento:", error);
      toast.error("Erro ao carregar parcelamento");
    }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleClienteToggle = (clienteId) => {
    setClientesSelecionados((prev) => {
      if (prev.includes(clienteId)) {
        return prev.filter((id) => id !== clienteId);
      }
      return [...prev, clienteId];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação básica
    if (!nomeTarefa.trim()) {
      toast.error("Nome da Tarefa é obrigatório");
      return;
    }

    const parcelamentoData = {
      codigo,
      classificacao,
      mininome,
      nomeTarefa,
      departamentoId,
      prazoEntregaDias,
      prazoEntregaHoras,
      esfera,
      exigeAgendamento,
      habilitarDeclaracao,
      notificaVencimento,
      parecerAutomatico,
      recorrente,
      requerAnexo,
      requerCampoProcesso,
      responderProtocolo,
      ativa,
      retencaoMeses,
      prazoMinimoRealizacao,
      semVencimento,
      checklistId,
      canaisNotificacao,
      valor,
      clientesIds: clientesSelecionados,
    };

    try {
      if (isEdit) {
        await api.put(`/parcelamentos/${id}`, parcelamentoData);
        toast.success("Parcelamento atualizado com sucesso!");
      } else {
        await api.post("/parcelamentos", parcelamentoData);
        toast.success("Parcelamento criado com sucesso!");
      }
      history.push("/parcelamentos");
    } catch (error) {
      console.error("Erro ao salvar parcelamento:", error);
      toast.error(error.response?.data?.message || "Erro ao salvar parcelamento");
    }
  };

  const clientesFiltrados = clientes.filter((cliente) =>
    cliente.name?.toLowerCase().includes(searchCliente.toLowerCase())
  );

  return (
    <Container className={classes.root}>
      <Paper className={classes.paper}>
        <Box display="flex" alignItems="center" mb={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => history.push("/parcelamentos")}
            style={{ marginRight: 16 }}
          >
            Voltar
          </Button>
          <Box>
            <Typography variant="h5" gutterBottom style={{ marginBottom: 0 }}>
              {isEdit ? "Editar Parcelamento" : "Novo Parcelamento"}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Preencha as informações do parcelamento abaixo
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* 1. Informações Gerais */}
          <Accordion
            expanded={expanded === "informacoes"}
            onChange={handleAccordionChange("informacoes")}
            className={classes.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className={classes.accordionSummary}
            >
              <div className={classes.accordionTitle}>
                <InfoIcon color="primary" />
                <Typography>Informações Gerais</Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Código"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    variant="outlined"
                    helperText="Código único para identificação"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Classificação"
                    value={classificacao}
                    onChange={(e) => setClassificacao(e.target.value)}
                    variant="outlined"
                    helperText="Classificação do parcelamento"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mininome"
                    value={mininome}
                    onChange={(e) => setMininome(e.target.value)}
                    variant="outlined"
                    helperText="Nome reduzido"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Nome do Parcelamento"
                    value={nomeTarefa}
                    onChange={(e) => setNomeTarefa(e.target.value)}
                    variant="outlined"
                    helperText="Nome completo do parcelamento"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Departamento</InputLabel>
                    <Select
                      value={departamentoId}
                      onChange={(e) => setDepartamentoId(e.target.value)}
                      label="Departamento"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      {departamentos.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* 2. Prazos e Configurações */}
          <Accordion
            expanded={expanded === "prazos"}
            onChange={handleAccordionChange("prazos")}
            className={classes.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className={classes.accordionSummary}
            >
              <div className={classes.accordionTitle}>
                <SettingsIcon color="primary" />
                <Typography>Prazos e Configurações</Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Prazo de Entrega (Dias)"
                    value={prazoEntregaDias}
                    onChange={(e) => setPrazoEntregaDias(e.target.value)}
                    variant="outlined"
                    helperText="Prazo em dias"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Prazo de Entrega (Horas)"
                    value={prazoEntregaHoras}
                    onChange={(e) => setPrazoEntregaHoras(e.target.value)}
                    variant="outlined"
                    helperText="Prazo em horas"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Esfera</InputLabel>
                    <Select
                      value={esfera}
                      onChange={(e) => setEsfera(e.target.value)}
                      label="Esfera"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      <MenuItem value="Municipal">Municipal</MenuItem>
                      <MenuItem value="Estadual">Estadual</MenuItem>
                      <MenuItem value="Federal">Federal</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Exige Agendamento</InputLabel>
                    <Select
                      value={exigeAgendamento}
                      onChange={(e) => setExigeAgendamento(e.target.value)}
                      label="Exige Agendamento"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      <MenuItem value="Sim">Sim</MenuItem>
                      <MenuItem value="Não">Não</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Habilitar Declaração</InputLabel>
                    <Select
                      value={habilitarDeclaracao}
                      onChange={(e) => setHabilitarDeclaracao(e.target.value)}
                      label="Habilitar Declaração"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      <MenuItem value="Sim">Sim</MenuItem>
                      <MenuItem value="Não">Não</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Notifica Vencimento</InputLabel>
                    <Select
                      value={notificaVencimento}
                      onChange={(e) => setNotificaVencimento(e.target.value)}
                      label="Notifica Vencimento"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      <MenuItem value="Sim">Sim</MenuItem>
                      <MenuItem value="Não">Não</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Parecer Automático</InputLabel>
                    <Select
                      value={parecerAutomatico}
                      onChange={(e) => setParecerAutomatico(e.target.value)}
                      label="Parecer Automático"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      <MenuItem value="Sim">Sim</MenuItem>
                      <MenuItem value="Não">Não</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Recorrente</InputLabel>
                    <Select
                      value={recorrente}
                      onChange={(e) => setRecorrente(e.target.value)}
                      label="Recorrente"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      <MenuItem value="Sim">Sim</MenuItem>
                      <MenuItem value="Não">Não</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Requer Anexo</InputLabel>
                    <Select
                      value={requerAnexo}
                      onChange={(e) => setRequerAnexo(e.target.value)}
                      label="Requer Anexo"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      <MenuItem value="Sim">Sim</MenuItem>
                      <MenuItem value="Não">Não</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Requer Campo Processo</InputLabel>
                    <Select
                      value={requerCampoProcesso}
                      onChange={(e) => setRequerCampoProcesso(e.target.value)}
                      label="Requer Campo Processo"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      <MenuItem value="Sim">Sim</MenuItem>
                      <MenuItem value="Não">Não</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Responder Protocolo</InputLabel>
                    <Select
                      value={responderProtocolo}
                      onChange={(e) => setResponderProtocolo(e.target.value)}
                      label="Responder Protocolo"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      <MenuItem value="Sim">Sim</MenuItem>
                      <MenuItem value="Não">Não</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Ativa</InputLabel>
                    <Select
                      value={ativa}
                      onChange={(e) => setAtiva(e.target.value)}
                      label="Ativa"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      <MenuItem value="Sim">Sim</MenuItem>
                      <MenuItem value="Não">Não</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Retenção (Meses)"
                    value={retencaoMeses}
                    onChange={(e) => setRetencaoMeses(e.target.value)}
                    variant="outlined"
                    helperText="Tempo de retenção em meses"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Prazo Mínimo de Realização"
                    value={prazoMinimoRealizacao}
                    onChange={(e) => setPrazoMinimoRealizacao(e.target.value)}
                    variant="outlined"
                    helperText="Dias mínimos para realização"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Sem Vencimento</InputLabel>
                    <Select
                      value={semVencimento}
                      onChange={(e) => setSemVencimento(e.target.value)}
                      label="Sem Vencimento"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      <MenuItem value="Sim">Sim</MenuItem>
                      <MenuItem value="Não">Não</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* 3. Checklist */}
          <Accordion
            expanded={expanded === "checklist"}
            onChange={handleAccordionChange("checklist")}
            className={classes.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className={classes.accordionSummary}
            >
              <div className={classes.accordionTitle}>
                <ChecklistIcon color="primary" />
                <Typography>Checklist</Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Checklist</InputLabel>
                    <Select
                      value={checklistId}
                      onChange={(e) => setChecklistId(e.target.value)}
                      label="Checklist"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      {checklists.map((checklist) => (
                        <MenuItem key={checklist.id} value={checklist.id}>
                          {checklist.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography variant="caption" className={classes.helperText}>
                    Selecione um checklist cadastrado no sistema
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* 4. Notificações */}
          <Accordion
            expanded={expanded === "notificacoes"}
            onChange={handleAccordionChange("notificacoes")}
            className={classes.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className={classes.accordionSummary}
            >
              <div className={classes.accordionTitle}>
                <NotificationsIcon color="primary" />
                <Typography>Notificações</Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Canais de Notificação</InputLabel>
                    <Select
                      multiple
                      value={canaisNotificacao}
                      onChange={(e) => setCanaisNotificacao(e.target.value)}
                      label="Canais de Notificação"
                      renderValue={(selected) => selected.join(", ")}
                    >
                      <MenuItem value="Email">
                        <Checkbox checked={canaisNotificacao.includes("Email")} />
                        Email
                      </MenuItem>
                      <MenuItem value="WhatsApp">
                        <Checkbox checked={canaisNotificacao.includes("WhatsApp")} />
                        WhatsApp
                      </MenuItem>
                      <MenuItem value="SMS">
                        <Checkbox checked={canaisNotificacao.includes("SMS")} />
                        SMS
                      </MenuItem>
                    </Select>
                  </FormControl>
                  <Typography variant="caption" className={classes.helperText}>
                    Selecione os canais para envio de notificações
                  </Typography>
                </Grid>
                {canaisNotificacao.length > 0 && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "#f5f5f5",
                        borderRadius: 1,
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      <Typography variant="body2" gutterBottom>
                        <strong>Resumo das Notificações:</strong>
                      </Typography>
                      <Typography variant="body2">
                        {canaisNotificacao.join(", ")}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* 5. Financeiro */}
          <Accordion
            expanded={expanded === "financeiro"}
            onChange={handleAccordionChange("financeiro")}
            className={classes.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className={classes.accordionSummary}
            >
              <div className={classes.accordionTitle}>
                <AttachMoneyIcon color="primary" />
                <Typography>Financeiro</Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Valor"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    }}
                    helperText="Valor do parcelamento"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* 6. Clientes */}
          <Accordion
            expanded={expanded === "clientes"}
            onChange={handleAccordionChange("clientes")}
            className={classes.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className={classes.accordionSummary}
            >
              <div className={classes.accordionTitle}>
                <PeopleIcon color="primary" />
                <Typography>Clientes</Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Buscar Cliente"
                    value={searchCliente}
                    onChange={(e) => setSearchCliente(e.target.value)}
                    variant="outlined"
                    className={classes.searchField}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TableContainer className={classes.tableContainer}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox">
                            <Checkbox
                              indeterminate={
                                clientesSelecionados.length > 0 &&
                                clientesSelecionados.length < clientes.length
                              }
                              checked={
                                clientes.length > 0 &&
                                clientesSelecionados.length === clientes.length
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setClientesSelecionados(clientes.map((c) => c.id));
                                } else {
                                  setClientesSelecionados([]);
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>Id</TableCell>
                          <TableCell>Nome</TableCell>
                          <TableCell>CPF/CNPJ</TableCell>
                          <TableCell>Código ERP</TableCell>
                          <TableCell>CNAEs</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {clientesFiltrados.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              Nenhum cliente encontrado
                            </TableCell>
                          </TableRow>
                        ) : (
                          clientesFiltrados.map((cliente) => (
                            <TableRow key={cliente.id} hover>
                              <TableCell padding="checkbox">
                                <Checkbox
                                  checked={clientesSelecionados.includes(cliente.id)}
                                  onChange={() => handleClienteToggle(cliente.id)}
                                />
                              </TableCell>
                              <TableCell>{cliente.id}</TableCell>
                              <TableCell>{cliente.name}</TableCell>
                              <TableCell>{cliente.cpfCnpj || "-"}</TableCell>
                              <TableCell>{cliente.codigoErp || "-"}</TableCell>
                              <TableCell>{cliente.cnaes || "-"}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography variant="caption" className={classes.helperText}>
                    Rows per page 10 • {clientesSelecionados.length} selecionados
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Botões de Ação */}
          <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" onClick={() => history.push("/parcelamentos")}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              className={classes.saveButton}
            >
              {isEdit ? "Atualizar" : "Salvar"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default NovoParcelamento;
