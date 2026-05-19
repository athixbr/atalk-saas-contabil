import React, { useState, useEffect } from "react";
import {
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Checkbox,
  FormControlLabel,
  IconButton,
  Tooltip,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  TablePagination
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayArrowIcon
} from "@material-ui/icons";
import { toast } from "react-toastify";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import api from "../../services/api";
import { format } from "date-fns";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(3),
    borderRadius: '16px',
    overflowY: 'scroll',
    ...theme.scrollbarStyles,
  },
}));

const mesesNomes = {
  1: "Janeiro",
  2: "Fevereiro",
  3: "Março",
  4: "Abril",
  5: "Maio",
  6: "Junho",
  7: "Julho",
  8: "Agosto",
  9: "Setembro",
  10: "Outubro",
  11: "Novembro",
  12: "Dezembro"
};

const GerenciamentoTarefasGeradas = () => {
  const classes = useStyles();
  const [recorrentes, setRecorrentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  
  // Modal de geração
  const [modalGerarAberto, setModalGerarAberto] = useState(false);
  const [recorrenteParaGerar, setRecorrenteParaGerar] = useState(null);
  const [mesesSelecionados, setMesesSelecionados] = useState([]);
  const [clientesSelecionados, setClientesSelecionados] = useState([]);
  const [clientesDisponiveis, setClientesDisponiveis] = useState([]);
  const [gerando, setGerando] = useState(false);
  
  // Modal de visualização de tarefas
  const [modalTarefasAberto, setModalTarefasAberto] = useState(false);
  const [tarefasGeradas, setTarefasGeradas] = useState([]);
  const [recorrenteVisualizada, setRecorrenteVisualizada] = useState(null);
  const [pagina, setPagina] = useState(0);
  const [porPagina, setPorPagina] = useState(10);
  const [totalTarefas, setTotalTarefas] = useState(0);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroMes, setFiltroMes] = useState("");

  useEffect(() => {
    carregarRecorrentes();
  }, []);

  const carregarRecorrentes = async () => {
    setLoading(true);
    console.log("🔄 Iniciando carregamento de tarefas recorrentes...");
    try {
      console.log("📡 Fazendo requisição para /tarefas-recorrentes/com-geradas");
      const { data } = await api.get('/tarefas-recorrentes/com-geradas');
      console.log("✅ Resposta recebida:", data);
      setRecorrentes(data);
    } catch (error) {
      console.error("❌ Erro ao carregar tarefas recorrentes:", error);
      console.error("❌ Status do erro:", error.response?.status);
      console.error("❌ Dados do erro:", error.response?.data);
      toast.error("Erro ao carregar tarefas recorrentes");
    } finally {
      setLoading(false);
    }
  };

  const abrirModalGerar = async (recorrente) => {
    if (!recorrente?.id) {
      toast.error("ID da tarefa recorrente inválido");
      return;
    }

    setRecorrenteParaGerar(recorrente);
    setMesesSelecionados([]);
    setClientesSelecionados([]);
    
    // Carregar clientes vinculados
    try {
      const { data } = await api.get(`/tarefas-recorrentes/${recorrente.id}`);
      setClientesDisponiveis(data.clientes || []);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      toast.error("Erro ao carregar clientes vinculados");
    }
    
    setModalGerarAberto(true);
  };

  const fecharModalGerar = () => {
    setModalGerarAberto(false);
    setRecorrenteParaGerar(null);
    setMesesSelecionados([]);
    setClientesSelecionados([]);
    setClientesDisponiveis([]);
  };

  const toggleMes = (mes) => {
    setMesesSelecionados(prev => 
      prev.includes(mes) 
        ? prev.filter(m => m !== mes)
        : [...prev, mes]
    );
  };

  const selecionarTodosMeses = () => {
    if (mesesSelecionados.length === 12) {
      setMesesSelecionados([]);
    } else {
      setMesesSelecionados([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    }
  };

  const toggleCliente = (clienteId) => {
    setClientesSelecionados(prev =>
      prev.includes(clienteId)
        ? prev.filter(id => id !== clienteId)
        : [...prev, clienteId]
    );
  };

  const selecionarTodosClientes = () => {
    if (clientesSelecionados.length === clientesDisponiveis.length) {
      setClientesSelecionados([]);
    } else {
      setClientesSelecionados(clientesDisponiveis.map(c => c.id));
    }
  };

  const gerarLote = async () => {
    if (mesesSelecionados.length === 0) {
      toast.warning("Selecione pelo menos um mês");
      return;
    }

    setGerando(true);
    try {
      const payload = {
        tarefaRecorrenteId: recorrenteParaGerar.id,
        ano: anoSelecionado,
        meses: mesesSelecionados,
        clienteIds: clientesSelecionados.length > 0 ? clientesSelecionados : undefined
      };

      const { data } = await api.post("/tarefas-geradas/gerar-lote", payload);
      
      toast.success(
        `${data.tarefasGeradas} tarefas geradas! ` +
        (data.tarefasPuladas > 0 ? `${data.tarefasPuladas} já existiam.` : "")
      );

      if (data.erros && data.erros.length > 0) {
        console.warn("Erros durante geração:", data.erros);
        toast.warning(`${data.erros.length} erros encontrados. Verifique o console.`);
      }

      fecharModalGerar();
      carregarRecorrentes();
    } catch (error) {
      console.error("Erro ao gerar lote:", error);
      toast.error("Erro ao gerar lote de tarefas");
    } finally {
      setGerando(false);
    }
  };

  const abrirModalTarefas = async (recorrente) => {
    if (!recorrente?.id) {
      toast.error("ID da tarefa recorrente inválido");
      return;
    }

    setRecorrenteVisualizada(recorrente);
    setPagina(0);
    setFiltroStatus("");
    setFiltroCliente("");
    setFiltroMes("");
    setModalTarefasAberto(true);
    await carregarTarefasGeradas(recorrente.id, 0);
  };

  const fecharModalTarefas = () => {
    setModalTarefasAberto(false);
    setRecorrenteVisualizada(null);
    setTarefasGeradas([]);
  };

  const carregarTarefasGeradas = async (recorrenteId, paginaAtual = pagina) => {
    try {
      const params = new URLSearchParams({
        tarefaRecorrenteId: recorrenteId,
        page: paginaAtual + 1,
        limit: porPagina
      });

      if (filtroStatus) params.append("status", filtroStatus);
      if (filtroCliente) params.append("clienteId", filtroCliente);
      if (filtroMes) params.append("mes", filtroMes);

      const { data } = await api.get(`/tarefas-geradas?${params.toString()}`);
      setTarefasGeradas(data.tarefas || []);
      setTotalTarefas(data.total || 0);
    } catch (error) {
      console.error("Erro ao carregar tarefas geradas:", error);
      toast.error("Erro ao carregar tarefas");
    }
  };

  const excluirTarefaAvulsa = async (tarefaId) => {
    if (!window.confirm("Deseja realmente excluir esta tarefa?")) {
      return;
    }

    try {
      await api.delete(`/tarefas-geradas/${tarefaId}`);
      toast.success("Tarefa excluída com sucesso");
      await carregarTarefasGeradas(recorrenteVisualizada.id);
      await carregarRecorrentes(); // Atualizar estatísticas
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
      toast.error("Erro ao excluir tarefa");
    }
  };

  const excluirLote = async () => {
    if (!window.confirm(
      `Deseja excluir TODAS as tarefas desta recorrente para ${anoSelecionado}?\n\n` +
      `Total: ${recorrenteVisualizada.estatisticas?.totalGeradas || 0} tarefas`
    )) {
      return;
    }

    try {
      await api.post("/tarefas-geradas/excluir-lote", {
        tarefaRecorrenteId: recorrenteVisualizada.id,
        ano: anoSelecionado
      });

      toast.success("Lote excluído com sucesso");
      fecharModalTarefas();
      carregarRecorrentes();
    } catch (error) {
      console.error("Erro ao excluir lote:", error);
      toast.error("Erro ao excluir lote");
    }
  };

  const handleMudarPagina = (event, novaPagina) => {
    setPagina(novaPagina);
    carregarTarefasGeradas(recorrenteVisualizada.id, novaPagina);
  };

  const handleMudarPorPagina = (event) => {
    setPorPagina(parseInt(event.target.value, 10));
    setPagina(0);
    carregarTarefasGeradas(recorrenteVisualizada.id, 0);
  };

  useEffect(() => {
    if (recorrenteVisualizada) {
      carregarTarefasGeradas(recorrenteVisualizada.id);
    }
  }, [filtroStatus, filtroCliente, filtroMes]);

  const getStatusColor = (status) => {
    const colors = {
      "pendente": "warning",
      "em_andamento": "info",
      "concluida": "success",
      "cancelada": "error"
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      "pendente": "Pendente",
      "em_andamento": "Em Andamento",
      "concluida": "Concluída",
      "cancelada": "Cancelada"
    };
    return labels[status] || status;
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Gerenciamento de Tarefas Geradas</Title>
        <MainHeaderButtonsWrapper>
          <FormControl variant="outlined" size="small" style={{ minWidth: 120 }}>
            <InputLabel>Ano</InputLabel>
            <Select
              value={anoSelecionado}
              label="Ano"
              onChange={(e) => setAnoSelecionado(e.target.value)}
            >
              {[2024, 2025, 2026, 2027, 2028].map(ano => (
                <MenuItem key={ano} value={ano}>{ano}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        {loading ? (
          <Box style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome da Tarefa</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="center">Total Geradas</TableCell>
                <TableCell align="center">Pendentes</TableCell>
                <TableCell align="center">Concluídas</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recorrentes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="textSecondary">
                      Nenhuma tarefa recorrente encontrada
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                recorrentes.map((recorrente) => (
                  <TableRow key={recorrente.id}>
                    <TableCell>{recorrente.nomeTarefa || recorrente.nome}</TableCell>
                    <TableCell>{recorrente.mininome || recorrente.descricao}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={recorrente.estatisticas?.totalGeradas || 0}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={recorrente.estatisticas?.pendentes || 0}
                        color="warning"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={recorrente.estatisticas?.concluidas || 0}
                        color="success"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Gerar Lote">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => abrirModalGerar(recorrente)}
                        >
                          <PlayArrowIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ver Tarefas">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => abrirModalTarefas(recorrente)}
                          disabled={!recorrente.estatisticas?.totalGeradas}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      </Paper>

      {/* Modal de Geração de Lote */}
      <Dialog 
        open={modalGerarAberto} 
        onClose={fecharModalGerar}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Gerar Lote de Tarefas - {recorrenteParaGerar?.nomeTarefa || recorrenteParaGerar?.nome}
        </DialogTitle>
        <DialogContent>
          <Box style={{ marginTop: 16 }}>
            <Typography variant="h6" gutterBottom>
              Ano: {anoSelecionado}
            </Typography>

            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  Meses ({mesesSelecionados.length} selecionados)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Button
                    size="small"
                    onClick={selecionarTodosMeses}
                    style={{ marginBottom: 16 }}
                  >
                    {mesesSelecionados.length === 12 ? "Desmarcar Todos" : "Selecionar Todos"}
                  </Button>
                  <Grid container spacing={1}>
                    {Object.entries(mesesNomes).map(([num, nome]) => (
                      <Grid item xs={6} sm={4} md={3} key={num}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={mesesSelecionados.includes(parseInt(num))}
                              onChange={() => toggleMes(parseInt(num))}
                            />
                          }
                          label={nome}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded style={{ marginTop: 16 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  Clientes ({clientesSelecionados.length} selecionados)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  {clientesDisponiveis.length === 0 ? (
                    <Alert severity="info">
                      Nenhum cliente vinculado. As tarefas serão geradas para todos os clientes disponíveis.
                    </Alert>
                  ) : (
                    <>
                      <Button
                        size="small"
                        onClick={selecionarTodosClientes}
                        style={{ marginBottom: 16 }}
                      >
                        {clientesSelecionados.length === clientesDisponiveis.length 
                          ? "Desmarcar Todos" 
                          : "Selecionar Todos"}
                      </Button>
                      <Box style={{ maxHeight: 300, overflowY: "auto" }}>
                        {clientesDisponiveis.map((cliente) => (
                          <FormControlLabel
                            key={cliente.id}
                            control={
                              <Checkbox
                                checked={clientesSelecionados.includes(cliente.id)}
                                onChange={() => toggleCliente(cliente.id)}
                              />
                            }
                            label={cliente.nome || cliente.nomeFantasia}
                            style={{ display: "block" }}
                          />
                        ))}
                      </Box>
                    </>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>

            {mesesSelecionados.length > 0 && (
              <Alert severity="info" style={{ marginTop: 16 }}>
                <Typography variant="body2">
                  Serão geradas tarefas para <strong>{mesesSelecionados.length}</strong> mês(es)
                  {clientesSelecionados.length > 0 && (
                    <> e <strong>{clientesSelecionados.length}</strong> cliente(s)</>
                  )}
                  .
                </Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharModalGerar}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={gerarLote}
            disabled={gerando || mesesSelecionados.length === 0}
            startIcon={gerando ? <CircularProgress size={20} /> : <PlayArrowIcon />}
          >
            {gerando ? "Gerando..." : "Gerar Lote"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Visualização de Tarefas Geradas */}
      <Dialog
        open={modalTarefasAberto}
        onClose={fecharModalTarefas}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">
              Tarefas Geradas - {recorrenteVisualizada?.nomeTarefa || recorrenteVisualizada?.nome}
            </Typography>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={excluirLote}
              disabled={!recorrenteVisualizada?.estatisticas?.totalGeradas}
            >
              Excluir Lote Completo
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginBottom: 24 }}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filtroStatus}
                  label="Status"
                  onChange={(e) => setFiltroStatus(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="pendente">Pendente</MenuItem>
                  <MenuItem value="em_andamento">Em Andamento</MenuItem>
                  <MenuItem value="concluida">Concluída</MenuItem>
                  <MenuItem value="cancelada">Cancelada</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Mês</InputLabel>
                <Select
                  value={filtroMes}
                  label="Mês"
                  onChange={(e) => setFiltroMes(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {Object.entries(mesesNomes).map(([num, nome]) => (
                    <MenuItem key={num} value={num}>{nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Competência</TableCell>
                  <TableCell>Data Entrega</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tarefasGeradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="textSecondary">
                        Nenhuma tarefa encontrada
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  tarefasGeradas.map((tarefa) => (
                    <TableRow key={tarefa.id}>
                      <TableCell>{tarefa.cliente?.nome || tarefa.cliente?.nomeFantasia}</TableCell>
                      <TableCell>{tarefa.competencia}</TableCell>
                      <TableCell>
                        {tarefa.dataEntrega ? format(new Date(tarefa.dataEntrega), "dd/MM/yyyy") : "-"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(tarefa.status)}
                          color={getStatusColor(tarefa.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => excluirTarefaAvulsa(tarefa.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalTarefas}
            page={pagina}
            onPageChange={handleMudarPagina}
            rowsPerPage={porPagina}
            onRowsPerPageChange={handleMudarPorPagina}
            labelRowsPerPage="Por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharModalTarefas}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </MainContainer>
  );
};

export default GerenciamentoTarefasGeradas;
