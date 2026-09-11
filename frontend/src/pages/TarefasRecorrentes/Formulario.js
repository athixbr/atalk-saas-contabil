import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
  Paper,
  Container,
  TextField,
  Button,
  Grid,
  Typography,
  Tabs,
  Tab,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
    borderRadius: "16px",
  },
  button: {
    marginTop: theme.spacing(2),
  },
  tabContent: {
    paddingTop: theme.spacing(3),
  },
  addButton: {
    marginTop: theme.spacing(2),
    background: "linear-gradient(135deg, #0596cd 0%, #047ba5 100%)",
    color: "#fff",
    "&:hover": {
      background: "linear-gradient(135deg, #047ba5 0%, #035c7d 100%)",
    },
  },
  saveButton: {
    background: "linear-gradient(135deg, #0596cd 0%, #047ba5 100%)",
    color: "#fff",
    "&:hover": {
      background: "linear-gradient(135deg, #047ba5 0%, #035c7d 100%)",
    },
  },
}));

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

export default function FormularioTarefaRecorrente() {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams();
  const [currentTab, setCurrentTab] = useState(0);

  // Info Gerais
  const [codigo, setCodigo] = useState("");
  const [classificacao, setClassificacao] = useState("");
  const [mininome, setMininome] = useState("");
  const [tipoServicoId, setTipoServicoId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [ativo, setAtivo] = useState(true);

  // Entregas Mensais
  const [entregasMensais, setEntregasMensais] = useState([]);

  // Prazos
  const [tipoCalculo, setTipoCalculo] = useState("DIAS_UTEIS");
  const [diasAntecedencia, setDiasAntecedencia] = useState(5);
  const [diasInicio, setDiasInicio] = useState(0);
  const [ajustarFimSemana, setAjustarFimSemana] = useState(true);
  const [anteciparAtraso, setAnteciparAtraso] = useState("ANTECIPAR");
  const [prazosFixos, setPrazosFixos] = useState(false);
  const [sabadoUtil, setSabadoUtil] = useState(false);
  const [competencia, setCompetencia] = useState("atual");
  const [exigirRobo, setExigirRobo] = useState(false);
  const [passivelMulta, setPassivelMulta] = useState(false);
  const [alertaGuia, setAlertaGuia] = useState(false);
  const [esfera, setEsfera] = useState("");
  const [servicoLiberado, setServicoLiberado] = useState(true);
  const [baixarAutomatico, setBaixarAutomatico] = useState(false);

  // Checklist
  const [checklistId, setChecklistId] = useState("");
  const [checklistObrigatorio, setChecklistObrigatorio] = useState(false);
  const [itensChecklist, setItensChecklist] = useState([]);

  // Documentos
  const [documentos, setDocumentos] = useState([]);

  // Notificações
  const [notificarResponsavel, setNotificarResponsavel] = useState(true);
  const [notificarCliente, setNotificarCliente] = useState(false);
  const [diasAntesNotificar, setDiasAntesNotificar] = useState(3);
  const [enviarEmail, setEnviarEmail] = useState(true);
  const [enviarWhatsapp, setEnviarWhatsapp] = useState(false);

  // Financeiro
  const [gerarCobranca, setGerarCobranca] = useState(false);
  const [valorServico, setValorServico] = useState("");
  const [diasVencimento, setDiasVencimento] = useState(10);

  // Responsáveis
  const [departamentoId, setDepartamentoId] = useState("");
  const [usuariosResponsaveis, setUsuariosResponsaveis] = useState([]);

  // Clientes
  const [clientesSelecionados, setClientesSelecionados] = useState([]);
  const [considerarFiliais, setConsiderarFiliais] = useState(true);

  // Listas para select
  const [tiposServico, setTiposServico] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [esferas, setEsferas] = useState([]);

  useEffect(() => {
    loadData();
    if (id) {
      loadTarefaRecorrente();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const [tiposRes, depsRes, usersRes, clientesRes, checklistsRes, esferasRes] = await Promise.all([
        api.get("/tipo-servico").catch(() => ({ data: [] })),
        api.get("/departamentos").catch(() => ({ data: { departamentos: [] } })),
        api.get("/users").catch(() => ({ data: { users: [] } })),
        api.get("/contacts").catch(() => ({ data: { contacts: [] } })),
        api.get("/checklists?ativo=true").catch(() => ({ data: { checklists: [] } })),
        api.get("/parametros/esfera").catch(() => ({ data: [] })),
      ]);
      setTiposServico(tiposRes.data);
      setDepartamentos(depsRes.data.departamentos || depsRes.data);
      setUsuarios(usersRes.data.users || usersRes.data);
      setClientes(clientesRes.data.contacts || clientesRes.data);
      setChecklists(checklistsRes.data.checklists || []);
      setEsferas(esferasRes.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    }
  };

  const loadTarefaRecorrente = async () => {
    try {
      const res = await api.get(`/tarefas-recorrentes/${id}`);
      const tarefa = res.data;
      
      // Info Gerais
      setCodigo(tarefa.codigo || "");
      setClassificacao(tarefa.classificacao || "");
      setMininome(tarefa.mininome || "");
      setTipoServicoId(tarefa.tipoServicoId);
      setDescricao(tarefa.descricao);
      setObservacoes(tarefa.observacoes || "");
      setAtivo(tarefa.ativo);

      // Entregas Mensais
      if (tarefa.entregasMensais) {
        setEntregasMensais(tarefa.entregasMensais);
      }

      // Prazos
      if (tarefa.prazos) {
        setTipoCalculo(tarefa.prazos.tipoCalculo);
        setDiasAntecedencia(tarefa.prazos.diasAntecedencia);
        setDiasInicio(tarefa.prazos.diasInicio || 0);
        setAjustarFimSemana(tarefa.prazos.ajustarFimSemana);
        setAnteciparAtraso(tarefa.prazos.anteciparAtraso);
        setPrazosFixos(tarefa.prazos.prazosFixos || false);
        setSabadoUtil(tarefa.prazos.sabadoUtil || false);
        setCompetencia(tarefa.prazos.competencia || "atual");
        setExigirRobo(tarefa.prazos.exigirRobo || false);
        setPassivelMulta(tarefa.prazos.passivelMulta || false);
        setAlertaGuia(tarefa.prazos.alertaGuia || false);
        setEsfera(tarefa.prazos.esfera || "");
        setServicoLiberado(tarefa.prazos.servicoLiberado !== false);
        setBaixarAutomatico(tarefa.prazos.baixarAutomatico || false);
      }

      // Checklist
      if (tarefa.checklist) {
        setChecklistId(tarefa.checklist.checklistId || "");
        setChecklistObrigatorio(tarefa.checklist.obrigatorio || false);
        if (tarefa.checklist.itens) {
          setItensChecklist(tarefa.checklist.itens);
        }
      }

      // Documentos
      if (tarefa.documentos) {
        setDocumentos(tarefa.documentos);
      }

      // Notificações
      if (tarefa.notificacoes) {
        setNotificarResponsavel(tarefa.notificacoes.notificarResponsavel);
        setNotificarCliente(tarefa.notificacoes.notificarCliente || false);
        setDiasAntesNotificar(tarefa.notificacoes.diasAntesNotificar);
        setEnviarEmail(tarefa.notificacoes.enviarEmail);
        setEnviarWhatsapp(tarefa.notificacoes.enviarWhatsapp);
      }

      // Financeiro
      if (tarefa.financeiro) {
        setGerarCobranca(tarefa.financeiro.gerarCobranca);
        setValorServico(tarefa.financeiro.valorServico);
        setDiasVencimento(tarefa.financeiro.diasVencimento);
      }

      // Responsáveis
      if (tarefa.usuarios && tarefa.usuarios.length > 0) {
        setDepartamentoId(tarefa.usuarios[0].departamentoId);
        setUsuariosResponsaveis(tarefa.usuarios.map(u => u.userId));
      }

      // Clientes
      if (tarefa.clientes) {
        setClientesSelecionados(tarefa.clientes.map(c => c.clienteId));
        if (tarefa.clientes[0]) {
          setConsiderarFiliais(tarefa.clientes[0].considerarFiliais);
        }
      }
    } catch (error) {
      toast.error("Erro ao carregar tarefa recorrente");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tipoServicoId || !descricao) {
      toast.error("Preencha os campos obrigatórios (Tipo de Serviço e Descrição)");
      return;
    }

    if (entregasMensais.length === 0) {
      toast.error("Adicione pelo menos uma data de entrega mensal");
      return;
    }

    if (clientesSelecionados.length === 0) {
      toast.error("Selecione pelo menos um cliente");
      return;
    }

    const data = {
      codigo,
      classificacao,
      mininome,
      tipoServicoId,
      descricao,
      observacoes,
      ativo,
      entregasMensais: entregasMensais.map(e => ({
        dia: e.dia,
        tipoEntrega: e.tipoEntrega,
      })),
      prazos: {
        tipoCalculo,
        diasAntecedencia,
        diasInicio,
        ajustarFimSemana,
        anteciparAtraso,
        prazosFixos,
        sabadoUtil,
        competencia,
        exigirRobo,
        passivelMulta,
        alertaGuia,
        esfera,
        servicoLiberado,
        baixarAutomatico,
      },
      checklist: {
        checklistId,
        obrigatorio: checklistObrigatorio,
        itens: itensChecklist,
      },
      documentos: documentos.map(d => ({
        tipoDocumento: d.tipoDocumento,
        obrigatorio: d.obrigatorio,
        observacoes: d.observacoes,
      })),
      notificacoes: {
        notificarResponsavel,
        notificarCliente,
        diasAntesNotificar,
        enviarEmail,
        enviarWhatsapp,
      },
      financeiro: {
        gerarCobranca,
        valorServico: gerarCobranca ? valorServico : null,
        diasVencimento: gerarCobranca ? diasVencimento : null,
      },
      usuarios: usuariosResponsaveis.map(userId => ({
        userId,
        departamentoId,
      })),
      clientes: clientesSelecionados.map(clienteId => ({
        clienteId,
        considerarFiliais,
      })),
    };

    try {
      if (id) {
        await api.put(`/tarefas-recorrentes/${id}`, data);
        toast.success("Tarefa recorrente atualizada com sucesso");
      } else {
        await api.post("/tarefas-recorrentes", data);
        toast.success("Tarefa recorrente criada com sucesso");
      }
      history.push("/tarefas-recorrentes");
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao salvar tarefa recorrente");
    }
  };

  const addEntregaMensal = () => {
    setEntregasMensais([...entregasMensais, { dia: 1, tipoEntrega: "DIA_FIXO" }]);
  };

  const removeEntregaMensal = (index) => {
    setEntregasMensais(entregasMensais.filter((_, i) => i !== index));
  };

  const addItemChecklist = () => {
    setItensChecklist([...itensChecklist, { descricao: "", obrigatorio: false }]);
  };

  const removeItemChecklist = (index) => {
    setItensChecklist(itensChecklist.filter((_, i) => i !== index));
  };

  const addDocumento = () => {
    setDocumentos([...documentos, { tipoDocumento: "", obrigatorio: false, observacoes: "" }]);
  };

  const removeDocumento = (index) => {
    setDocumentos(documentos.filter((_, i) => i !== index));
  };

  return (
    <Container className={classes.root}>
      <Typography variant="h4" gutterBottom>
        {id ? "Editar" : "Nova"} Tarefa Recorrente
      </Typography>

      <Paper className={classes.paper}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
          <Tab label="Info Gerais" />
          <Tab label="Entregas Mensais" />
          <Tab label="Prazos" />
          <Tab label="Checklist" />
          <Tab label="Documentos" />
          <Tab label="Notificações" />
          <Tab label="Financeiro" />
          <Tab label="Responsáveis" />
          <Tab label="Clientes" />
        </Tabs>

        <form onSubmit={handleSubmit}>
          {/* Tab 0: Info Gerais */}
          <TabPanel value={currentTab} index={0}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Código"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Classificação"
                  value={classificacao}
                  onChange={(e) => setClassificacao(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mininome"
                  value={mininome}
                  onChange={(e) => setMininome(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Serviço</InputLabel>
                  <Select
                    value={tipoServicoId}
                    onChange={(e) => setTipoServicoId(e.target.value)}
                  >
                    {tiposServico.map((tipo) => (
                      <MenuItem key={tipo.id} value={tipo.id}>
                        {tipo.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Nome da Tarefa Recorrente"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Departamento</InputLabel>
                  <Select value={departamentoId} onChange={(e) => setDepartamentoId(e.target.value)}>
                    <MenuItem value="">
                      <em>Selecione um departamento</em>
                    </MenuItem>
                    {departamentos.map((dep) => (
                      <MenuItem key={dep.id} value={dep.id}>
                        {dep.nome || dep.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Usuários Responsáveis</InputLabel>
                  <Select
                    multiple
                    value={usuariosResponsaveis}
                    onChange={(e) => setUsuariosResponsaveis(e.target.value)}
                    renderValue={(selected) => (
                      <div>
                        {selected.map((userId) => {
                          const user = usuarios.find((u) => u.id === userId);
                          return user ? <Chip key={userId} label={user.name} style={{ margin: 2 }} /> : null;
                        })}
                      </div>
                    )}
                  >
                    {usuarios.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Observações"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 1: Entregas Mensais */}
          <TabPanel value={currentTab} index={1}>
            <Typography variant="h6" gutterBottom>
              Datas de Entrega Mensal
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Dia</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell width={50}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entregasMensais.map((entrega, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          type="number"
                          value={entrega.dia}
                          onChange={(e) => {
                            const newEntregas = [...entregasMensais];
                            newEntregas[index].dia = parseInt(e.target.value);
                            setEntregasMensais(newEntregas);
                          }}
                          inputProps={{ min: 1, max: 31 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={entrega.tipoEntrega}
                          onChange={(e) => {
                            const newEntregas = [...entregasMensais];
                            newEntregas[index].tipoEntrega = e.target.value;
                            setEntregasMensais(newEntregas);
                          }}
                        >
                          <MenuItem value="DIA_FIXO">Dia Fixo</MenuItem>
                          <MenuItem value="DIA_UTIL">Dia Útil</MenuItem>
                          <MenuItem value="ULTIMO_DIA_MES">Último Dia do Mês</MenuItem>
                          <MenuItem value="ULTIMO_DIA_UTIL">Último Dia Útil</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => removeEntregaMensal(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addEntregaMensal}
              className={classes.addButton}
            >
              Adicionar Data
            </Button>
          </TabPanel>

          {/* Tab 2: Prazos */}
          <TabPanel value={currentTab} index={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Dias de Antecipação"
                  value={diasAntecedencia}
                  onChange={(e) => setDiasAntecedencia(parseInt(e.target.value))}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Dias de Início"
                  value={diasInicio}
                  onChange={(e) => setDiasInicio(parseInt(e.target.value))}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo dos Dias Antes</InputLabel>
                  <Select value={tipoCalculo} onChange={(e) => setTipoCalculo(e.target.value)}>
                    <MenuItem value="DIAS_CORRIDOS">Corrido</MenuItem>
                    <MenuItem value="DIAS_UTEIS">Úteis</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Competência</InputLabel>
                  <Select value={competencia} onChange={(e) => setCompetencia(e.target.value)}>
                    <MenuItem value="anterior">Anterior</MenuItem>
                    <MenuItem value="atual">Atual</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Esfera</InputLabel>
                  <Select value={esfera} onChange={(e) => setEsfera(e.target.value)}>
                    <MenuItem value="">
                      <em>Não informado</em>
                    </MenuItem>
                    {esferas.map((item) => (
                      <MenuItem key={item.id} value={item.nome}>
                        {item.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom style={{ marginTop: 16 }}>
                  Configurações Adicionais
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={prazosFixos}
                      onChange={(e) => setPrazosFixos(e.target.checked)}
                    />
                  }
                  label="Prazos Fixos"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={sabadoUtil}
                      onChange={(e) => setSabadoUtil(e.target.checked)}
                    />
                  }
                  label="Sábado Útil"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exigirRobo}
                      onChange={(e) => setExigirRobo(e.target.checked)}
                    />
                  }
                  label="Exigir Robô"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={passivelMulta}
                      onChange={(e) => setPassivelMulta(e.target.checked)}
                    />
                  }
                  label="Passível de Multa"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={alertaGuia}
                      onChange={(e) => setAlertaGuia(e.target.checked)}
                    />
                  }
                  label="Alerta Guia"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={checklistObrigatorio}
                      onChange={(e) => setChecklistObrigatorio(e.target.checked)}
                    />
                  }
                  label="Checklist Obrigatório"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notificarCliente}
                      onChange={(e) => setNotificarCliente(e.target.checked)}
                    />
                  }
                  label="Notificar Cliente"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={servicoLiberado}
                      onChange={(e) => setServicoLiberado(e.target.checked)}
                    />
                  }
                  label="Serviço Liberado"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={ativo}
                      onChange={(e) => setAtivo(e.target.checked)}
                    />
                  }
                  label="Ativa"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={baixarAutomatico}
                      onChange={(e) => setBaixarAutomatico(e.target.checked)}
                    />
                  }
                  label="Baixar Automático"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={ajustarFimSemana}
                      onChange={(e) => setAjustarFimSemana(e.target.checked)}
                    />
                  }
                  label="Ajustar para Fim de Semana"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Se cair em Fim de Semana</InputLabel>
                  <Select value={anteciparAtraso} onChange={(e) => setAnteciparAtraso(e.target.value)}>
                    <MenuItem value="ANTECIPAR">Antecipar</MenuItem>
                    <MenuItem value="ATRASAR">Atrasar</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 3: Checklist */}
          <TabPanel value={currentTab} index={3}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Selecionar Checklist Cadastrado</InputLabel>
                  <Select value={checklistId} onChange={(e) => setChecklistId(e.target.value)}>
                    <MenuItem value="">
                      <em>Nenhum checklist</em>
                    </MenuItem>
                    {checklists.map((checklist) => (
                      <MenuItem key={checklist.id} value={checklist.id}>
                        {checklist.nome || checklist.name}
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
            
            <Typography variant="h6" gutterBottom style={{ marginTop: 24 }}>
              Ou crie itens personalizados
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Descrição</TableCell>
                    <TableCell width={150}>Obrigatório</TableCell>
                    <TableCell width={50}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {itensChecklist.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={item.descricao}
                          onChange={(e) => {
                            const newItens = [...itensChecklist];
                            newItens[index].descricao = e.target.value;
                            setItensChecklist(newItens);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={item.obrigatorio}
                          onChange={(e) => {
                            const newItens = [...itensChecklist];
                            newItens[index].obrigatorio = e.target.checked;
                            setItensChecklist(newItens);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => removeItemChecklist(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addItemChecklist}
              className={classes.addButton}
            >
              Adicionar Item
            </Button>
          </TabPanel>

          {/* Tab 4: Documentos */}
          <TabPanel value={currentTab} index={4}>
            <Typography variant="h6" gutterBottom>
              Documentos Necessários
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tipo de Documento</TableCell>
                    <TableCell>Observações</TableCell>
                    <TableCell width={150}>Obrigatório</TableCell>
                    <TableCell width={50}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documentos.map((doc, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={doc.tipoDocumento}
                          onChange={(e) => {
                            const newDocs = [...documentos];
                            newDocs[index].tipoDocumento = e.target.value;
                            setDocumentos(newDocs);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={doc.observacoes}
                          onChange={(e) => {
                            const newDocs = [...documentos];
                            newDocs[index].observacoes = e.target.value;
                            setDocumentos(newDocs);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={doc.obrigatorio}
                          onChange={(e) => {
                            const newDocs = [...documentos];
                            newDocs[index].obrigatorio = e.target.checked;
                            setDocumentos(newDocs);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => removeDocumento(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addDocumento}
              className={classes.addButton}
            >
              Adicionar Documento
            </Button>
          </TabPanel>

          {/* Tab 5: Notificações */}
          <TabPanel value={currentTab} index={5}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Selecione os canais de notificação
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={enviarEmail}
                      onChange={(e) => setEnviarEmail(e.target.checked)}
                    />
                  }
                  label="E-mail"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={enviarWhatsapp}
                      onChange={(e) => setEnviarWhatsapp(e.target.checked)}
                    />
                  }
                  label="WhatsApp"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Dias Antes de Notificar"
                  value={diasAntesNotificar}
                  onChange={(e) => setDiasAntesNotificar(parseInt(e.target.value))}
                  inputProps={{ min: 0 }}
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 6: Financeiro */}
          <TabPanel value={currentTab} index={6}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox checked={gerarCobranca} onChange={(e) => setGerarCobranca(e.target.checked)} />
                  }
                  label="Gerar Cobrança Automática"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Valor do Serviço"
                  value={valorServico}
                  onChange={(e) => setValorServico(e.target.value)}
                  disabled={!gerarCobranca}
                  inputProps={{ step: "0.01", min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Dias para Vencimento"
                  value={diasVencimento}
                  onChange={(e) => setDiasVencimento(parseInt(e.target.value))}
                  disabled={!gerarCobranca}
                  inputProps={{ min: 0 }}
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 7: Responsáveis */}
          <TabPanel value={currentTab} index={7}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Departamento</InputLabel>
                  <Select value={departamentoId} onChange={(e) => setDepartamentoId(e.target.value)}>
                    {departamentos.map((dep) => (
                      <MenuItem key={dep.id} value={dep.id}>
                        {dep.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Usuários Responsáveis</InputLabel>
                  <Select
                    multiple
                    value={usuariosResponsaveis}
                    onChange={(e) => setUsuariosResponsaveis(e.target.value)}
                    renderValue={(selected) => (
                      <div>
                        {selected.map((userId) => {
                          const user = usuarios.find((u) => u.id === userId);
                          return user ? <Chip key={userId} label={user.name} style={{ margin: 2 }} /> : null;
                        })}
                      </div>
                    )}
                  >
                    {usuarios.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 8: Clientes */}
          <TabPanel value={currentTab} index={8}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Clientes</InputLabel>
                  <Select
                    multiple
                    value={clientesSelecionados}
                    onChange={(e) => setClientesSelecionados(e.target.value)}
                    renderValue={(selected) => (
                      <div>
                        {selected.map((clienteId) => {
                          const cliente = clientes.find((c) => c.id === clienteId);
                          return cliente ? (
                            <Chip key={clienteId} label={cliente.name} style={{ margin: 2 }} />
                          ) : null;
                        })}
                      </div>
                    )}
                  >
                    {clientes.map((cliente) => (
                      <MenuItem key={cliente.id} value={cliente.id}>
                        {cliente.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={considerarFiliais}
                      onChange={(e) => setConsiderarFiliais(e.target.checked)}
                    />
                  }
                  label="Considerar apenas Matriz (não gerar para filiais)"
                />
              </Grid>
            </Grid>
          </TabPanel>

          <Box mt={3} display="flex" justifyContent="space-between">
            <Button variant="outlined" onClick={() => history.push("/tarefas-recorrentes")}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" color="primary" className={classes.saveButton}>
              {id ? "Atualizar" : "Criar"} Tarefa Recorrente
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}
