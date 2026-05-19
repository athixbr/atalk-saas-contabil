import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Typography,
  Chip,
  InputAdornment,
  Divider,
  FormGroup,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  OutlinedInput,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Add, Delete, Close } from "@material-ui/icons";
import { toast } from "react-toastify";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    maxWidth: "900px",
    width: "100%",
    height: "85vh",
  },
  dialogContent: {
    padding: theme.spacing(3),
    overflowY: "auto",
  },
  tabContent: {
    paddingTop: theme.spacing(3),
  },
  sectionTitle: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
  formGrid: {
    marginBottom: theme.spacing(2),
  },
  monthCheckbox: {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  clientList: {
    maxHeight: "300px",
    overflow: "auto",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: theme.spacing(1),
  },
  selectedChip: {
    margin: theme.spacing(0.5),
  },
  dayInput: {
    width: "80px",
  },
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`recorrencia-tabpanel-${index}`}
      aria-labelledby={`recorrencia-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const meses = [
  { id: 1, nome: "Janeiro" },
  { id: 2, nome: "Fevereiro" },
  { id: 3, nome: "Março" },
  { id: 4, nome: "Abril" },
  { id: 5, nome: "Maio" },
  { id: 6, nome: "Junho" },
  { id: 7, nome: "Julho" },
  { id: 8, nome: "Agosto" },
  { id: 9, nome: "Setembro" },
  { id: 10, nome: "Outubro" },
  { id: 11, nome: "Novembro" },
  { id: 12, nome: "Dezembro" },
];

const RecorrenciaModal = ({ open, onClose, recorrenciaId, onSave }) => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  // Informações Gerais
  const [codigo, setCodigo] = useState("");
  const [classificacao, setClassificacao] = useState("");
  const [mininome, setMininome] = useState("");
  const [nomeTarefa, setNomeTarefa] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");
  const [usuariosSelecionados, setUsuariosSelecionados] = useState([]);

  // Entregas Mensais
  const [entregasMensais, setEntregasMensais] = useState({
    1: "", 2: "", 3: "", 4: "", 5: "", 6: "",
    7: "", 8: "", 9: "", 10: "", 11: "", 12: ""
  });

  // Prazos e Configurações
  const [diasAntecipacao, setDiasAntecipacao] = useState("");
  const [diasInicio, setDiasInicio] = useState("");
  const [tipoDiasAntes, setTipoDiasAntes] = useState("corrido");
  const [prazosFixos, setPrazosFixos] = useState(false);
  const [sabadoUtil, setSabadoUtil] = useState(false);
  const [competencia, setCompetencia] = useState("atual");
  const [exigirRobo, setExigirRobo] = useState(false);
  const [passivelMulta, setPassivelMulta] = useState(false);
  const [alertaGuia, setAlertaGuia] = useState(false);
  const [checklistObrigatorio, setChecklistObrigatorio] = useState(false);
  const [esfera, setEsfera] = useState("");
  const [notificarCliente, setNotificarCliente] = useState(false);
  const [servicoLiberado, setServicoLiberado] = useState(true);
  const [ativa, setAtiva] = useState(true);
  const [baixarAutomatico, setBaixarAutomatico] = useState(false);

  // Checklist
  const [checklistId, setChecklistId] = useState("");

  // Notificações
  const [notificacaoEmail, setNotificacaoEmail] = useState(true);
  const [notificacaoWhatsapp, setNotificacaoWhatsapp] = useState(false);

  // Financeiro
  const [valor, setValor] = useState("");

  // Clientes
  const [clientesSelecionados, setClientesSelecionados] = useState([]);

  // Listas para selects
  const [departamentos, setDepartamentos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [classificacoes, setClassificacoes] = useState([]);

  useEffect(() => {
    if (open) {
      loadData();
      if (recorrenciaId) {
        loadRecorrencia();
      } else {
        resetForm();
      }
    }
  }, [open, recorrenciaId]);

  const loadData = async () => {
    try {
      // Carregar departamentos
      const { data: deptData } = await api.get("/departments");
      setDepartamentos(deptData);

      // Carregar usuários
      const { data: userDara } = await api.get("/users");
      setUsuarios(userDara.users || []);

      // Carregar checklists (se houver endpoint)
      // const { data: checklistData } = await api.get("/checklists");
      // setChecklists(checklistData);

      // Carregar clientes
      const { data: clientData } = await api.get("/contacts");
      setClientes(clientData.contacts || []);

      // Carregar classificações (se houver endpoint)
      // const { data: classData } = await api.get("/classificacoes");
      // setClassificacoes(classData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados necessários");
    }
  };

  const loadRecorrencia = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/recorrencias/${recorrenciaId}`);
      // Preencher todos os campos com os dados carregados
      setCodigo(data.codigo || "");
      setClassificacao(data.classificacao || "");
      setMininome(data.mininome || "");
      setNomeTarefa(data.nomeTarefa || "");
      setDepartamentoId(data.departamentoId || "");
      setUsuariosSelecionados(data.usuarios || []);
      setEntregasMensais(data.entregasMensais || {});
      setDiasAntecipacao(data.diasAntecipacao || "");
      setDiasInicio(data.diasInicio || "");
      setTipoDiasAntes(data.tipoDiasAntes || "corrido");
      setPrazosFixos(data.prazosFixos || false);
      setSabadoUtil(data.sabadoUtil || false);
      setCompetencia(data.competencia || "atual");
      setExigirRobo(data.exigirRobo || false);
      setPassivelMulta(data.passivelMulta || false);
      setAlertaGuia(data.alertaGuia || false);
      setChecklistObrigatorio(data.checklistObrigatorio || false);
      setEsfera(data.esfera || "");
      setNotificarCliente(data.notificarCliente || false);
      setServicoLiberado(data.servicoLiberado || true);
      setAtiva(data.ativa || true);
      setBaixarAutomatico(data.baixarAutomatico || false);
      setChecklistId(data.checklistId || "");
      setNotificacaoEmail(data.notificacaoEmail || true);
      setNotificacaoWhatsapp(data.notificacaoWhatsapp || false);
      setValor(data.valor || "");
      setClientesSelecionados(data.clientes || []);
    } catch (error) {
      console.error("Erro ao carregar recorrência:", error);
      toast.error("Erro ao carregar recorrência");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTabValue(0);
    setCodigo("");
    setClassificacao("");
    setMininome("");
    setNomeTarefa("");
    setDepartamentoId("");
    setUsuariosSelecionados([]);
    setEntregasMensais({
      1: "", 2: "", 3: "", 4: "", 5: "", 6: "",
      7: "", 8: "", 9: "", 10: "", 11: "", 12: ""
    });
    setDiasAntecipacao("");
    setDiasInicio("");
    setTipoDiasAntes("corrido");
    setPrazosFixos(false);
    setSabadoUtil(false);
    setCompetencia("atual");
    setExigirRobo(false);
    setPassivelMulta(false);
    setAlertaGuia(false);
    setChecklistObrigatorio(false);
    setEsfera("");
    setNotificarCliente(false);
    setServicoLiberado(true);
    setAtiva(true);
    setBaixarAutomatico(false);
    setChecklistId("");
    setNotificacaoEmail(true);
    setNotificacaoWhatsapp(false);
    setValor("");
    setClientesSelecionados([]);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEntregaMensalChange = (mes, valor) => {
    setEntregasMensais({
      ...entregasMensais,
      [mes]: valor
    });
  };

  const handleAddUsuario = (usuarioId) => {
    const usuario = usuarios.find(u => u.id === usuarioId);
    if (usuario && !usuariosSelecionados.find(u => u.id === usuarioId)) {
      setUsuariosSelecionados([...usuariosSelecionados, usuario]);
    }
  };

  const handleRemoveUsuario = (usuarioId) => {
    setUsuariosSelecionados(usuariosSelecionados.filter(u => u.id !== usuarioId));
  };

  const handleAddCliente = (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (cliente && !clientesSelecionados.find(c => c.id === clienteId)) {
      setClientesSelecionados([...clientesSelecionados, cliente]);
    }
  };

  const handleRemoveCliente = (clienteId) => {
    setClientesSelecionados(clientesSelecionados.filter(c => c.id !== clienteId));
  };

  const handleSave = async () => {
    // Validações
    if (!nomeTarefa) {
      toast.error("Nome da tarefa é obrigatório");
      return;
    }

    if (!departamentoId) {
      toast.error("Departamento é obrigatório");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        codigo,
        classificacao,
        mininome,
        nomeTarefa,
        departamentoId,
        usuarios: usuariosSelecionados.map(u => u.id),
        entregasMensais,
        diasAntecipacao: parseInt(diasAntecipacao) || 0,
        diasInicio: parseInt(diasInicio) || 0,
        tipoDiasAntes,
        prazosFixos,
        sabadoUtil,
        competencia,
        exigirRobo,
        passivelMulta,
        alertaGuia,
        checklistObrigatorio,
        esfera,
        notificarCliente,
        servicoLiberado,
        ativa,
        baixarAutomatico,
        checklistId,
        notificacaoEmail,
        notificacaoWhatsapp,
        valor: parseFloat(valor) || 0,
        clientes: clientesSelecionados.map(c => c.id),
      };

      if (recorrenciaId) {
        await api.put(`/recorrencias/${recorrenciaId}`, payload);
        toast.success("Tarefa recorrente atualizada com sucesso");
      } else {
        await api.post("/recorrencias", payload);
        toast.success("Tarefa recorrente criada com sucesso");
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar recorrência:", error);
      toast.error(error.response?.data?.message || "Erro ao salvar tarefa recorrente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      classes={{ paper: classes.dialogPaper }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {recorrenciaId ? "Editar Tarefa Recorrente" : "Nova Tarefa Recorrente"}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Informações Gerais" />
        <Tab label="Entregas Mensais" />
        <Tab label="Prazos e Configurações" />
        <Tab label="Checklist" />
        <Tab label="Notificações" />
        <Tab label="Financeiro" />
        <Tab label="Clientes" />
      </Tabs>

      <DialogContent className={classes.dialogContent}>
        {/* Tab 0 - Informações Gerais */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3} className={classes.formGrid}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Classificação"
                value={classificacao}
                onChange={(e) => setClassificacao(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mininome"
                value={mininome}
                onChange={(e) => setMininome(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Nome da Tarefa Recorrente"
                value={nomeTarefa}
                onChange={(e) => setNomeTarefa(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel>Departamento</InputLabel>
                <Select
                  value={departamentoId}
                  onChange={(e) => setDepartamentoId(e.target.value)}
                  label="Departamento"
                >
                  <MenuItem value="">
                    <em>Selecione um departamento</em>
                  </MenuItem>
                  {departamentos.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider />
              <Typography variant="subtitle1" className={classes.sectionTitle}>
                Usuários
              </Typography>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Adicionar Usuário</InputLabel>
                <Select
                  value=""
                  onChange={(e) => handleAddUsuario(e.target.value)}
                  label="Adicionar Usuário"
                >
                  <MenuItem value="">
                    <em>Selecione um usuário</em>
                  </MenuItem>
                  {usuarios
                    .filter(u => !usuariosSelecionados.find(us => us.id === u.id))
                    .map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <Box mt={2}>
                {usuariosSelecionados.map((user) => (
                  <Chip
                    key={user.id}
                    label={user.name}
                    onDelete={() => handleRemoveUsuario(user.id)}
                    className={classes.selectedChip}
                    color="primary"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 1 - Entregas Mensais */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="subtitle1" gutterBottom>
            Informe o dia de entrega para cada mês (deixe vazio para não aplicar)
          </Typography>
          <Grid container spacing={2} className={classes.formGrid}>
            {meses.map((mes) => (
              <Grid item xs={12} sm={6} md={4} key={mes.id}>
                <TextField
                  fullWidth
                  label={mes.nome}
                  type="number"
                  inputProps={{ min: 1, max: 31 }}
                  value={entregasMensais[mes.id]}
                  onChange={(e) => handleEntregaMensalChange(mes.id, e.target.value)}
                  variant="outlined"
                  placeholder="Dia"
                />
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Tab 2 - Prazos e Configurações */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3} className={classes.formGrid}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Dias de Antecipação"
                type="number"
                inputProps={{ min: 0 }}
                value={diasAntecipacao}
                onChange={(e) => setDiasAntecipacao(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Dias de Início"
                type="number"
                inputProps={{ min: 0 }}
                value={diasInicio}
                onChange={(e) => setDiasInicio(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Tipo dos Dias Antes</InputLabel>
                <Select
                  value={tipoDiasAntes}
                  onChange={(e) => setTipoDiasAntes(e.target.value)}
                  label="Tipo dos Dias Antes"
                >
                  <MenuItem value="corrido">Corrido</MenuItem>
                  <MenuItem value="uteis">Úteis</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Competência</InputLabel>
                <Select
                  value={competencia}
                  onChange={(e) => setCompetencia(e.target.value)}
                  label="Competência"
                >
                  <MenuItem value="anterior">Anterior</MenuItem>
                  <MenuItem value="atual">Atual</MenuItem>
                </Select>
              </FormControl>
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
                    <em>Não informado</em>
                  </MenuItem>
                  <MenuItem value="municipal">Municipal</MenuItem>
                  <MenuItem value="estadual">Estadual</MenuItem>
                  <MenuItem value="federal">Federal</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider style={{ margin: "20px 0" }} />
              <Typography variant="subtitle1" gutterBottom>
                Configurações Adicionais
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={prazosFixos}
                    onChange={(e) => setPrazosFixos(e.target.checked)}
                    color="primary"
                  />
                }
                label="Prazos Fixos"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={sabadoUtil}
                    onChange={(e) => setSabadoUtil(e.target.checked)}
                    color="primary"
                  />
                }
                label="Sábado Útil"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={exigirRobo}
                    onChange={(e) => setExigirRobo(e.target.checked)}
                    color="primary"
                  />
                }
                label="Exigir Robô"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={passivelMulta}
                    onChange={(e) => setPassivelMulta(e.target.checked)}
                    color="primary"
                  />
                }
                label="Passível de Multa"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={alertaGuia}
                    onChange={(e) => setAlertaGuia(e.target.checked)}
                    color="primary"
                  />
                }
                label="Alerta Guia"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={checklistObrigatorio}
                    onChange={(e) => setChecklistObrigatorio(e.target.checked)}
                    color="primary"
                  />
                }
                label="Checklist Obrigatório"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificarCliente}
                    onChange={(e) => setNotificarCliente(e.target.checked)}
                    color="primary"
                  />
                }
                label="Notificar Cliente"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={servicoLiberado}
                    onChange={(e) => setServicoLiberado(e.target.checked)}
                    color="primary"
                  />
                }
                label="Serviço Liberado"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={ativa}
                    onChange={(e) => setAtiva(e.target.checked)}
                    color="primary"
                  />
                }
                label="Ativa"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={baixarAutomatico}
                    onChange={(e) => setBaixarAutomatico(e.target.checked)}
                    color="primary"
                  />
                }
                label="Baixar Automático"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 3 - Checklist */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Selecionar Checklist</InputLabel>
                <Select
                  value={checklistId}
                  onChange={(e) => setChecklistId(e.target.value)}
                  label="Selecionar Checklist"
                >
                  <MenuItem value="">
                    <em>Nenhum checklist</em>
                  </MenuItem>
                  {checklists.map((checklist) => (
                    <MenuItem key={checklist.id} value={checklist.id}>
                      {checklist.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {checklists.length === 0 && (
                <Typography variant="caption" color="textSecondary" style={{ marginTop: 8, display: "block" }}>
                  Nenhum checklist cadastrado. Cadastre checklists no módulo de configurações.
                </Typography>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 4 - Notificações */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Selecione os canais de notificação
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificacaoEmail}
                    onChange={(e) => setNotificacaoEmail(e.target.checked)}
                    color="primary"
                  />
                }
                label="E-mail"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificacaoWhatsapp}
                    onChange={(e) => setNotificacaoWhatsapp(e.target.checked)}
                    color="primary"
                  />
                }
                label="WhatsApp"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 5 - Financeiro */}
        <TabPanel value={tabValue} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Valor"
                type="number"
                inputProps={{ min: 0, step: "0.01" }}
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 6 - Clientes */}
        <TabPanel value={tabValue} index={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Clientes e Sócios Vinculados
              </Typography>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Adicionar Cliente</InputLabel>
                <Select
                  value=""
                  onChange={(e) => handleAddCliente(e.target.value)}
                  label="Adicionar Cliente"
                >
                  <MenuItem value="">
                    <em>Selecione um cliente</em>
                  </MenuItem>
                  {clientes
                    .filter(c => !clientesSelecionados.find(cs => cs.id === c.id))
                    .map((cliente) => (
                      <MenuItem key={cliente.id} value={cliente.id}>
                        {cliente.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box className={classes.clientList}>
                {clientesSelecionados.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" align="center" style={{ padding: 16 }}>
                    Nenhum cliente selecionado
                  </Typography>
                ) : (
                  <List>
                    {clientesSelecionados.map((cliente) => (
                      <ListItem key={cliente.id}>
                        <ListItemText
                          primary={cliente.name}
                          secondary={cliente.email || cliente.number}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveCliente(cliente.id)}
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
              <Typography variant="caption" color="textSecondary" style={{ marginTop: 8, display: "block" }}>
                Total: {clientesSelecionados.length} cliente(s) selecionado(s)
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>

      <DialogActions style={{ padding: "16px 24px" }}>
        <Button onClick={onClose} color="default">
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecorrenciaModal;
