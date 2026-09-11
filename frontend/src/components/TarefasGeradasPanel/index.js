import React, { useState, useEffect } from "react";
import {
  Box, Paper, Grid, Chip, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Checkbox, FormControlLabel,
  Tooltip, CircularProgress, Accordion, AccordionSummary, AccordionDetails,
  TablePagination, Typography,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import {
  Delete as DeleteIcon, ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon, PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
} from "@material-ui/icons";
import { format } from "date-fns";
import { toast } from "react-toastify";
import api from "../../services/api";

const mesesNomes = {
  1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril", 5: "Maio", 6: "Junho",
  7: "Julho", 8: "Agosto", 9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro",
};

const getStatusColor = (s) => ({
  pendente: "warning", em_andamento: "info", concluida: "success",
  cancelada: "error", pausada: "default"
}[s] || "default");

const getStatusLabel = (s) => ({
  pendente: "Pendente", em_andamento: "Em Andamento", concluida: "Concluída",
  cancelada: "Cancelada", pausada: "Pausada"
}[s] || s);

// Painel de gestão de "Tarefas Geradas": lista as tarefas recorrentes com
// estatísticas de geração, permite gerar lote, e visualizar/gerenciar
// (pausar/despausar/excluir, individual ou em lote/bloco) as tarefas
// individuais já geradas para cada uma. Usado dentro da aba "Tarefas
// Geradas" de /gestao-tarefas/painel — única fonte de verdade desta feature
// (a antiga página standalone /tarefas-geradas foi unificada aqui).
const TarefasGeradasPanel = () => {
  const [recorrentes, setRecorrentes] = useState([]);
  const [loadingGeradas, setLoadingGeradas] = useState(false);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [modalGerarAberto, setModalGerarAberto] = useState(false);
  const [recorrenteParaGerar, setRecorrenteParaGerar] = useState(null);
  const [mesesSelecionados, setMesesSelecionados] = useState([]);
  const [clientesSelecionados, setClientesSelecionados] = useState([]);
  const [clientesDisponiveis, setClientesDisponiveis] = useState([]);
  const [gerando, setGerando] = useState(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarRecorrentes = async () => {
    setLoadingGeradas(true);
    try {
      const { data } = await api.get("/tarefas-recorrentes/com-geradas");
      setRecorrentes(data);
    } catch {
      toast.error("Erro ao carregar tarefas recorrentes");
    } finally {
      setLoadingGeradas(false);
    }
  };

  const abrirModalGerar = async (recorrente) => {
    if (!recorrente?.id) { toast.error("ID inválido"); return; }
    setRecorrenteParaGerar(recorrente); setMesesSelecionados([]); setClientesSelecionados([]);
    try {
      const { data } = await api.get(`/tarefas-recorrentes/${recorrente.id}`);
      setClientesDisponiveis(data.clientes || []);
    } catch { toast.error("Erro ao carregar clientes vinculados"); }
    setModalGerarAberto(true);
  };

  const fecharModalGerar = () => { setModalGerarAberto(false); setRecorrenteParaGerar(null); setMesesSelecionados([]); setClientesSelecionados([]); setClientesDisponiveis([]); };

  const gerarLote = async () => {
    if (mesesSelecionados.length === 0) { toast.warning("Selecione pelo menos um mês"); return; }
    setGerando(true);
    try {
      const { data } = await api.post("/tarefas-geradas/gerar-lote", {
        tarefaRecorrenteId: recorrenteParaGerar.id, ano: anoSelecionado,
        meses: mesesSelecionados, clienteIds: clientesSelecionados.length > 0 ? clientesSelecionados : undefined,
      });
      toast.success(`${data.tarefasGeradas} tarefas geradas!${data.tarefasPuladas > 0 ? ` ${data.tarefasPuladas} já existiam.` : ""}`);
      fecharModalGerar(); carregarRecorrentes();
    } catch { toast.error("Erro ao gerar lote"); }
    finally { setGerando(false); }
  };

  const abrirModalTarefas = async (recorrente) => {
    if (!recorrente?.id) { toast.error("ID inválido"); return; }
    setRecorrenteVisualizada(recorrente); setPagina(0); setFiltroStatus(""); setFiltroCliente(""); setFiltroMes("");
    setModalTarefasAberto(true);
    await carregarTarefasGeradas(recorrente.id, 0);
  };

  const fecharModalTarefas = () => { setModalTarefasAberto(false); setRecorrenteVisualizada(null); setTarefasGeradas([]); };

  const carregarTarefasGeradas = async (recorrenteId, paginaAtual = pagina) => {
    try {
      const params = new URLSearchParams({ tarefaRecorrenteId: recorrenteId, page: paginaAtual + 1, limit: porPagina });
      if (filtroStatus) params.append("status", filtroStatus);
      if (filtroCliente) params.append("clienteId", filtroCliente);
      if (filtroMes) params.append("mes", filtroMes);
      const { data } = await api.get(`/tarefas-geradas?${params.toString()}`);
      setTarefasGeradas(data.tarefas || []); setTotalTarefas(data.total || 0);
    } catch { toast.error("Erro ao carregar tarefas"); }
  };

  const excluirTarefaAvulsa = async (tarefaId) => {
    if (!window.confirm("Deseja excluir esta tarefa?")) return;
    try {
      await api.delete(`/tarefas-geradas/${tarefaId}`);
      toast.success("Tarefa excluída");
      await carregarTarefasGeradas(recorrenteVisualizada.id); await carregarRecorrentes();
    } catch { toast.error("Erro ao excluir"); }
  };

  const excluirLote = async () => {
    if (!window.confirm(`Excluir TODAS as tarefas desta recorrente para ${anoSelecionado}?`)) return;
    try {
      await api.post("/tarefas-geradas/excluir-lote", { tarefaRecorrenteId: recorrenteVisualizada.id, ano: anoSelecionado });
      toast.success("Lote excluído"); fecharModalTarefas(); carregarRecorrentes();
    } catch { toast.error("Erro ao excluir lote"); }
  };

  const togglePausarTarefa = async (tarefa) => {
    const novoStatus = tarefa.status === "pausada" ? "pendente" : "pausada";
    try {
      await api.put(`/tarefas-geradas/${tarefa.id}/status`, { status: novoStatus });
      toast.success(novoStatus === "pausada" ? "Tarefa pausada" : "Tarefa reativada");
      await carregarTarefasGeradas(recorrenteVisualizada.id); await carregarRecorrentes();
    } catch { toast.error("Erro ao alterar status da tarefa"); }
  };

  const pausarLote = async () => {
    if (!window.confirm(`Pausar TODAS as tarefas desta recorrente para ${anoSelecionado}?`)) return;
    try {
      await api.post("/tarefas-geradas/pausar-lote", { tarefaRecorrenteId: recorrenteVisualizada.id, ano: anoSelecionado, novoStatus: "pausada" });
      toast.success("Lote pausado");
      await carregarTarefasGeradas(recorrenteVisualizada.id); carregarRecorrentes();
    } catch { toast.error("Erro ao pausar lote"); }
  };

  useEffect(() => {
    if (recorrenteVisualizada) carregarTarefasGeradas(recorrenteVisualizada.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroStatus, filtroCliente, filtroMes]);

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" style={{ marginBottom: 16 }}>
        <FormControl variant="outlined" size="small" style={{ minWidth: 120 }}>
          <InputLabel>Ano</InputLabel>
          <Select value={anoSelecionado} label="Ano" onChange={(e) => setAnoSelecionado(e.target.value)}>
            {[2024, 2025, 2026, 2027, 2028].map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {loadingGeradas ? (
        <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
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
                <TableRow><TableCell colSpan={6} align="center"><Typography color="textSecondary">Nenhuma tarefa recorrente encontrada</Typography></TableCell></TableRow>
              ) : recorrentes.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.nomeTarefa || r.nome}</TableCell>
                  <TableCell>{r.mininome || r.descricao}</TableCell>
                  <TableCell align="center"><Chip label={r.estatisticas?.totalGeradas || 0} color="primary" size="small" /></TableCell>
                  <TableCell align="center"><Chip label={r.estatisticas?.pendentes || 0} color="warning" size="small" /></TableCell>
                  <TableCell align="center"><Chip label={r.estatisticas?.concluidas || 0} color="success" size="small" /></TableCell>
                  <TableCell align="center">
                    <Tooltip title="Gerar Lote"><IconButton size="small" color="primary" onClick={() => abrirModalGerar(r)}><PlayArrowIcon /></IconButton></Tooltip>
                    <Tooltip title="Ver Tarefas"><IconButton size="small" onClick={() => abrirModalTarefas(r)} disabled={!r.estatisticas?.totalGeradas}><VisibilityIcon /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal Gerar Lote */}
      <Dialog open={modalGerarAberto} onClose={fecharModalGerar} maxWidth="md" fullWidth>
        <DialogTitle>Gerar Lote — {recorrenteParaGerar?.nomeTarefa || recorrenteParaGerar?.nome}</DialogTitle>
        <DialogContent>
          <Box style={{ marginTop: 16 }}>
            <Typography variant="h6" gutterBottom>Ano: {anoSelecionado}</Typography>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Meses ({mesesSelecionados.length} selecionados)</Typography></AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Button size="small" onClick={() => setMesesSelecionados(mesesSelecionados.length === 12 ? [] : [1,2,3,4,5,6,7,8,9,10,11,12])} style={{ marginBottom: 16 }}>
                    {mesesSelecionados.length === 12 ? "Desmarcar Todos" : "Selecionar Todos"}
                  </Button>
                  <Grid container spacing={1}>
                    {Object.entries(mesesNomes).map(([num, nome]) => (
                      <Grid item xs={6} sm={4} md={3} key={num}>
                        <FormControlLabel
                          control={<Checkbox checked={mesesSelecionados.includes(parseInt(num))} onChange={() => setMesesSelecionados((p) => p.includes(parseInt(num)) ? p.filter((m) => m !== parseInt(num)) : [...p, parseInt(num)])} />}
                          label={nome}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </AccordionDetails>
            </Accordion>
            <Accordion defaultExpanded style={{ marginTop: 16 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Clientes ({clientesSelecionados.length} selecionados)</Typography></AccordionSummary>
              <AccordionDetails>
                {clientesDisponiveis.length === 0 ? (
                  <Alert severity="info">Nenhum cliente vinculado. As tarefas serão geradas para todos os clientes disponíveis.</Alert>
                ) : (
                  <>
                    <Button size="small" onClick={() => setClientesSelecionados(clientesSelecionados.length === clientesDisponiveis.length ? [] : clientesDisponiveis.map((c) => c.id))} style={{ marginBottom: 16 }}>
                      {clientesSelecionados.length === clientesDisponiveis.length ? "Desmarcar Todos" : "Selecionar Todos"}
                    </Button>
                    <Box style={{ maxHeight: 300, overflowY: "auto" }}>
                      {clientesDisponiveis.map((c) => (
                        <FormControlLabel key={c.id} style={{ display: "block" }}
                          control={<Checkbox checked={clientesSelecionados.includes(c.id)} onChange={() => setClientesSelecionados((p) => p.includes(c.id) ? p.filter((id) => id !== c.id) : [...p, c.id])} />}
                          label={c.nome || c.nomeFantasia}
                        />
                      ))}
                    </Box>
                  </>
                )}
              </AccordionDetails>
            </Accordion>
            {mesesSelecionados.length > 0 && (
              <Alert severity="info" style={{ marginTop: 16 }}>
                Serão geradas tarefas para <strong>{mesesSelecionados.length}</strong> mês(es){clientesSelecionados.length > 0 && <> e <strong>{clientesSelecionados.length}</strong> cliente(s)</>}.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharModalGerar}>Cancelar</Button>
          <Button variant="contained" onClick={gerarLote} disabled={gerando || mesesSelecionados.length === 0} startIcon={gerando ? <CircularProgress size={20} /> : <PlayArrowIcon />}>
            {gerando ? "Gerando..." : "Gerar Lote"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Ver Tarefas */}
      <Dialog open={modalTarefasAberto} onClose={fecharModalTarefas} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Tarefas Geradas — {recorrenteVisualizada?.nomeTarefa || recorrenteVisualizada?.nome}</Typography>
            <Box display="flex" style={{ gap: 8 }}>
              <Button variant="outlined" size="small" startIcon={<PauseIcon />} onClick={pausarLote} disabled={!recorrenteVisualizada?.estatisticas?.totalGeradas}>
                Pausar Lote Completo
              </Button>
              <Button variant="outlined" color="secondary" size="small" startIcon={<DeleteIcon />} onClick={excluirLote} disabled={!recorrenteVisualizada?.estatisticas?.totalGeradas}>
                Excluir Lote Completo
              </Button>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginBottom: 24 }}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={filtroStatus} label="Status" onChange={(e) => setFiltroStatus(e.target.value)}>
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="pendente">Pendente</MenuItem>
                  <MenuItem value="em_andamento">Em Andamento</MenuItem>
                  <MenuItem value="concluida">Concluída</MenuItem>
                  <MenuItem value="pausada">Pausada</MenuItem>
                  <MenuItem value="cancelada">Cancelada</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Mês</InputLabel>
                <Select value={filtroMes} label="Mês" onChange={(e) => setFiltroMes(e.target.value)}>
                  <MenuItem value="">Todos</MenuItem>
                  {Object.entries(mesesNomes).map(([num, nome]) => <MenuItem key={num} value={num}>{nome}</MenuItem>)}
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
                  <TableRow><TableCell colSpan={5} align="center"><Typography color="textSecondary">Nenhuma tarefa encontrada</Typography></TableCell></TableRow>
                ) : tarefasGeradas.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.cliente?.nome || t.cliente?.nomeFantasia}</TableCell>
                    <TableCell>{t.competencia}</TableCell>
                    <TableCell>{t.dataEntrega ? format(new Date(t.dataEntrega), "dd/MM/yyyy") : "-"}</TableCell>
                    <TableCell><Chip label={getStatusLabel(t.status)} color={getStatusColor(t.status)} size="small" /></TableCell>
                    <TableCell align="center">
                      <Tooltip title={t.status === "pausada" ? "Reativar" : "Pausar"}>
                        <IconButton size="small" onClick={() => togglePausarTarefa(t)}>
                          {t.status === "pausada" ? <PlayArrowIcon fontSize="small" /> : <PauseIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir"><IconButton size="small" color="secondary" onClick={() => excluirTarefaAvulsa(t.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div" count={totalTarefas} page={pagina}
            onPageChange={(_, p) => { setPagina(p); carregarTarefasGeradas(recorrenteVisualizada.id, p); }}
            rowsPerPage={porPagina}
            onRowsPerPageChange={(e) => { setPorPagina(parseInt(e.target.value, 10)); setPagina(0); carregarTarefasGeradas(recorrenteVisualizada.id, 0); }}
            labelRowsPerPage="Por página:" labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </DialogContent>
        <DialogActions><Button onClick={fecharModalTarefas}>Fechar</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default TarefasGeradasPanel;
