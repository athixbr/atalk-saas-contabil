import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
  Paper,
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
  FormControlLabel,
  Checkbox,
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
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import InfoIcon from "@material-ui/icons/Info";
import AttachMoneyIcon from "@material-ui/icons/AttachMoney";
import PeopleIcon from "@material-ui/icons/People";
import api from "../../services/api";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
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
  backButton: {
    marginRight: theme.spacing(2),
  },
  tableContainer: {
    marginTop: theme.spacing(2),
    border: "1px solid #e0e0e0",
  },
}));

const FormularioParcelamento = () => {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams();
  const isEdit = !!id;

  // Estados para os acordeões
  const [expanded, setExpanded] = useState("informacoes");

  // Estados dos campos
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [numeroParcelas, setNumeroParcelas] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [periodicidade, setPeriodicidade] = useState("mensal");
  const [diaVencimento, setDiaVencimento] = useState("");
  const [gerarTarefas, setGerarTarefas] = useState(false);
  const [tarefaConfigId, setTarefaConfigId] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");
  const [responsavelId, setResponsavelId] = useState("");
  const [status, setStatus] = useState("ativo");
  const [observacoes, setObservacoes] = useState("");
  const [ativo, setAtivo] = useState(true);

  // Estados de dados carregados
  const [clientes, setClientes] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [tarefasConfig, setTarefasConfig] = useState([]);
  const [parcelas, setParcelas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    if (isEdit) {
      loadParcelamento();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const [clientesRes, departamentosRes, usuariosRes, tarefasRes] = await Promise.all([
        api.get("/clientes"),
        api.get("/departamentos"),
        api.get("/users"),
        api.get("/tarefas-config"),
      ]);

      setClientes(clientesRes.data || []);
      setDepartamentos(departamentosRes.data || []);
      setUsuarios(usuariosRes.data.users || usuariosRes.data || []);
      setTarefasConfig(tarefasRes.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados do formulário");
    }
  };

  const loadParcelamento = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/parametros/parcelamentos/${id}`);
      
      setNome(data.nome || "");
      setDescricao(data.descricao || "");
      setClienteId(data.clienteId || "");
      setValorTotal(data.valorTotal || "");
      setNumeroParcelas(data.numeroParcelas || "");
      setDataInicio(data.dataInicio ? data.dataInicio.split('T')[0] : "");
      setPeriodicidade(data.periodicidade || "mensal");
      setDiaVencimento(data.diaVencimento || "");
      setGerarTarefas(data.gerarTarefas || false);
      setTarefaConfigId(data.tarefaConfigId || "");
      setDepartamentoId(data.departamentoId || "");
      setResponsavelId(data.responsavelId || "");
      setStatus(data.status || "ativo");
      setObservacoes(data.observacoes || "");
      setAtivo(data.ativo !== false);
      setParcelas(data.parcelas || []);
    } catch (error) {
      console.error("Erro ao carregar parcelamento:", error);
      toast.error("Erro ao carregar parcelamento");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações básicas
    if (!nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    if (!valorTotal || parseFloat(valorTotal) <= 0) {
      toast.error("Valor total deve ser maior que zero");
      return;
    }

    if (!numeroParcelas || parseInt(numeroParcelas) <= 0) {
      toast.error("Número de parcelas deve ser maior que zero");
      return;
    }

    const parcelamentoData = {
      nome: nome.trim(),
      descricao: descricao.trim(),
      clienteId: clienteId || null,
      valorTotal: parseFloat(valorTotal),
      numeroParcelas: parseInt(numeroParcelas),
      dataInicio: dataInicio || null,
      periodicidade,
      diaVencimento: diaVencimento ? parseInt(diaVencimento) : null,
      gerarTarefas,
      tarefaConfigId: tarefaConfigId || null,
      departamentoId: departamentoId || null,
      responsavelId: responsavelId || null,
      status,
      observacoes: observacoes.trim(),
      ativo,
    };

    try {
      setLoading(true);
      if (isEdit) {
        await api.put(`/parametros/parcelamentos/${id}`, parcelamentoData);
        toast.success("Parcelamento atualizado com sucesso");
      } else {
        await api.post("/parametros/parcelamentos", parcelamentoData);
        toast.success("Parcelamento criado com sucesso");
      }
      history.push("/parcelamentos");
    } catch (error) {
      console.error("Erro ao salvar parcelamento:", error);
      toast.error(error.response?.data?.error || "Erro ao salvar parcelamento");
    } finally {
      setLoading(false);
    }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusParcelaLabel = (status) => {
    const statusMap = {
      'pendente': 'Pendente',
      'pago': 'Pago',
      'atrasado': 'Atrasado',
      'cancelado': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  const getStatusParcelaColor = (status) => {
    const colorMap = {
      'pendente': 'default',
      'pago': 'primary',
      'atrasado': 'secondary',
      'cancelado': 'default'
    };
    return colorMap[status] || 'default';
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{isEdit ? "Editar Parcelamento" : "Novo Parcelamento"}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="outlined"
            className={classes.backButton}
            startIcon={<ArrowBackIcon />}
            onClick={() => history.push("/parcelamentos")}
          >
            Voltar
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.paper} variant="outlined">
        <form onSubmit={handleSubmit}>
          {/* Informações Gerais */}
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
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nome do Parcelamento *"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    variant="outlined"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Cliente</InputLabel>
                    <Select
                      value={clienteId}
                      onChange={(e) => setClienteId(e.target.value)}
                      label="Cliente"
                    >
                      <MenuItem value="">
                        <em>Nenhum</em>
                      </MenuItem>
                      {clientes.map((cliente) => (
                        <MenuItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descrição"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    variant="outlined"
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Departamento</InputLabel>
                    <Select
                      value={departamentoId}
                      onChange={(e) => setDepartamentoId(e.target.value)}
                      label="Departamento"
                    >
                      <MenuItem value="">
                        <em>Nenhum</em>
                      </MenuItem>
                      {departamentos.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Responsável</InputLabel>
                    <Select
                      value={responsavelId}
                      onChange={(e) => setResponsavelId(e.target.value)}
                      label="Responsável"
                    >
                      <MenuItem value="">
                        <em>Nenhum</em>
                      </MenuItem>
                      {usuarios.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="ativo">Ativo</MenuItem>
                      <MenuItem value="concluido">Concluído</MenuItem>
                      <MenuItem value="cancelado">Cancelado</MenuItem>
                      <MenuItem value="suspenso">Suspenso</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={ativo}
                        onChange={(e) => setAtivo(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Parcelamento Ativo"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Configurações Financeiras */}
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
                <Typography>Configurações Financeiras e Parcelas</Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Valor Total *"
                    value={valorTotal}
                    onChange={(e) => setValorTotal(e.target.value)}
                    variant="outlined"
                    type="number"
                    inputProps={{ step: "0.01", min: "0" }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Número de Parcelas *"
                    value={numeroParcelas}
                    onChange={(e) => setNumeroParcelas(e.target.value)}
                    variant="outlined"
                    type="number"
                    inputProps={{ min: "1" }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Dia de Vencimento"
                    value={diaVencimento}
                    onChange={(e) => setDiaVencimento(e.target.value)}
                    variant="outlined"
                    type="number"
                    inputProps={{ min: "1", max: "31" }}
                    helperText="Dia do mês para vencimento (1-31)"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Data de Início"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    variant="outlined"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Periodicidade</InputLabel>
                    <Select
                      value={periodicidade}
                      onChange={(e) => setPeriodicidade(e.target.value)}
                      label="Periodicidade"
                    >
                      <MenuItem value="mensal">Mensal</MenuItem>
                      <MenuItem value="quinzenal">Quinzenal</MenuItem>
                      <MenuItem value="semanal">Semanal</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Integração com Tarefas */}
          <Accordion
            expanded={expanded === "tarefas"}
            onChange={handleAccordionChange("tarefas")}
            className={classes.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className={classes.accordionSummary}
            >
              <div className={classes.accordionTitle}>
                <PeopleIcon color="primary" />
                <Typography>Integração com Tarefas</Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={gerarTarefas}
                        onChange={(e) => setGerarTarefas(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Gerar tarefas automaticamente para cada parcela"
                  />
                </Grid>
                {gerarTarefas && (
                  <Grid item xs={12}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Configuração de Tarefa</InputLabel>
                      <Select
                        value={tarefaConfigId}
                        onChange={(e) => setTarefaConfigId(e.target.value)}
                        label="Configuração de Tarefa"
                      >
                        <MenuItem value="">
                          <em>Nenhuma</em>
                        </MenuItem>
                        {tarefasConfig.map((config) => (
                          <MenuItem key={config.id} value={config.id}>
                            {config.nomeTarefa || config.nome}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observações"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    variant="outlined"
                    multiline
                    rows={4}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Parcelas (apenas em modo de edição) */}
          {isEdit && parcelas.length > 0 && (
            <Accordion
              expanded={expanded === "parcelas"}
              onChange={handleAccordionChange("parcelas")}
              className={classes.accordion}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                className={classes.accordionSummary}
              >
                <div className={classes.accordionTitle}>
                  <AttachMoneyIcon color="primary" />
                  <Typography>Parcelas Geradas ({parcelas.length})</Typography>
                </div>
              </AccordionSummary>
              <AccordionDetails className={classes.accordionDetails}>
                <TableContainer className={classes.tableContainer}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nº</TableCell>
                        <TableCell>Valor</TableCell>
                        <TableCell>Vencimento</TableCell>
                        <TableCell>Data Pagamento</TableCell>
                        <TableCell>Valor Pago</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {parcelas.map((parcela) => (
                        <TableRow key={parcela.id}>
                          <TableCell>{parcela.numeroParcela}</TableCell>
                          <TableCell>{formatCurrency(parcela.valor)}</TableCell>
                          <TableCell>{formatDate(parcela.dataVencimento)}</TableCell>
                          <TableCell>{formatDate(parcela.dataPagamento)}</TableCell>
                          <TableCell>
                            {parcela.valorPago ? formatCurrency(parcela.valorPago) : '-'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusParcelaLabel(parcela.status)}
                              color={getStatusParcelaColor(parcela.status)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Botões de Ação */}
          <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={() => history.push("/parcelamentos")}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              className={classes.saveButton}
              disabled={loading}
            >
              {loading ? "Salvando..." : isEdit ? "Atualizar" : "Salvar"}
            </Button>
          </Box>
        </form>
      </Paper>
    </MainContainer>
  );
};

export default FormularioParcelamento;
