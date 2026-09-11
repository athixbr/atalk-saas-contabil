import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box, Paper, Grid, Card, CardContent, Typography, Chip, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tabs, Tab,
} from "@material-ui/core";
import {
  Assignment, HourglassEmpty, PlayArrow, CheckCircle, TrendingUp, Warning,
  EmojiEvents, Edit as EditIcon, Autorenew as RefreshIcon,
} from "@material-ui/icons";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import "chart.js/auto";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLocation } from "react-router-dom";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import TarefasGeradasPanel from "../../components/TarefasGeradasPanel";

const useStyles = makeStyles((theme) => ({
  tabsBar: {
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    marginBottom: theme.spacing(3),
    "& .MuiTab-root": {
      fontFamily: "Inter, sans-serif",
      fontWeight: 600,
      fontSize: "0.85rem",
      textTransform: "none",
      minWidth: 120,
    },
    "& .Mui-selected": { color: "#065183" },
    "& .MuiTabs-indicator": { backgroundColor: "#065183" },
  },
  tabPanel: { padding: theme.spacing(0, 1) },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(3),
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  // Panorama
  panoramaRoot: { padding: theme.spacing(1) },
  filterBar: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    borderRadius: 16,
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  kpiCard: {
    height: "100%",
    background: "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)",
    borderRadius: 16,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    transition: "transform 0.3s, box-shadow 0.3s",
    "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 20px rgba(0,0,0,0.12)" },
  },
  kpiContent: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  kpiIcon: { fontSize: 48, opacity: 0.8 },
  kpiValue: { fontSize: "2.5rem", fontWeight: 700, lineHeight: 1, marginBottom: theme.spacing(0.5) },
  kpiLabel: { fontSize: "0.875rem", color: "#666", fontWeight: 500 },
  chartCard: { padding: theme.spacing(3), borderRadius: 16, height: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
  chartTitle: { fontWeight: 600, marginBottom: theme.spacing(2), display: "flex", alignItems: "center", gap: theme.spacing(1) },
  chartContainer: { position: "relative", height: 300, display: "flex", justifyContent: "center", alignItems: "center" },
  tableCard: { padding: theme.spacing(3), borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
  overdueRow: { backgroundColor: "#ffebee" },
  rankingCard: {
    display: "flex", alignItems: "center", gap: theme.spacing(2),
    padding: theme.spacing(2), marginBottom: theme.spacing(1), borderRadius: 12,
    backgroundColor: "#f8f9fa", transition: "transform 0.2s",
    "&:hover": { transform: "translateX(4px)", backgroundColor: "#e3f2fd" },
  },
  medal: { fontSize: 32 },
}));

const TabPanel = ({ children, value, index }) =>
  value === index ? <Box>{children}</Box> : null;

const TAB_INDEX_BY_QUERY = { panorama: 0, atividades: 1, geradas: 2 };

const Painel = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const initialTab = TAB_INDEX_BY_QUERY[new URLSearchParams(location.search).get("tab")] ?? 0;
  const [activeTab, setActiveTab] = useState(initialTab);

  // ── PANORAMA state ──────────────────────────────────────────────
  const [tasks, setTasks] = useState([]);
  const [loadingPanorama, setLoadingPanorama] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState("30");
  const [kpis, setKpis] = useState({ total: 0, pendente: 0, emAndamento: 0, concluida: 0 });

  // ── ATIVIDADES state ────────────────────────────────────────────
  const [tarefas, setTarefas] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loadingAtividades, setLoadingAtividades] = useState(false);
  const [filtros, setFiltros] = useState({ status: "", clienteId: "", departamentoId: "", userId: "" });
  const [clientes, setClientes] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [dialogStatus, setDialogStatus] = useState(false);
  const [dialogReatribuir, setDialogReatribuir] = useState(false);
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
  const [novoStatus, setNovoStatus] = useState("");
  const [observacao, setObservacao] = useState("");
  const [historico, setHistorico] = useState([]);
  const [novoResponsavel, setNovoResponsavel] = useState({ departamentoId: "", userId: "" });

  // ── PANORAMA functions ──────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 0 && user?.profile === "admin") loadDashboardData();
  }, [filterPeriod, activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoadingPanorama(true);
      const { data } = await api.get("/tasks", { params: { pageNumber: 1, pageSize: 1000 } });
      const allTasks = data.tasks || [];
      const filtered = filterTasksByPeriod(allTasks, filterPeriod);
      setTasks(filtered);
      calculateKPIs(filtered);
    } catch (err) {
      toast.error("Erro ao carregar dados do painel");
    } finally {
      setLoadingPanorama(false);
    }
  };

  const filterTasksByPeriod = (taskList, period) => {
    if (period === "all") return taskList;
    const now = new Date();
    const start = new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);
    return taskList.filter((t) => new Date(t.createdAt) >= start);
  };

  const calculateKPIs = (taskList) => {
    setKpis({
      total: taskList.length,
      pendente: taskList.filter((t) => t.status === "Pendente").length,
      emAndamento: taskList.filter((t) => t.status === "Em Andamento").length,
      concluida: taskList.filter((t) => t.status === "Concluída").length,
    });
  };

  const getStatusChartData = () => ({
    labels: ["Pendente", "Em Andamento", "Concluída", "Cancelada"],
    datasets: [{
      data: [
        tasks.filter((t) => t.status === "Pendente").length,
        tasks.filter((t) => t.status === "Em Andamento").length,
        tasks.filter((t) => t.status === "Concluída").length,
        tasks.filter((t) => t.status === "Cancelada").length,
      ],
      backgroundColor: ["#ff9800", "#2196f3", "#4caf50", "#f44336"],
      borderWidth: 0,
    }],
  });

  const getDepartmentChartData = () => {
    const deptCount = {};
    tasks.forEach((t) => {
      const name = t.departamento?.nome || "Sem Departamento";
      deptCount[name] = (deptCount[name] || 0) + 1;
    });
    return {
      labels: Object.keys(deptCount),
      datasets: [{ label: "Tarefas por Departamento", data: Object.values(deptCount), backgroundColor: "rgba(33,150,243,0.7)", borderColor: "rgba(33,150,243,1)", borderWidth: 2 }],
    };
  };

  const getUserChartData = () => {
    const userCount = {};
    tasks.forEach((t) => { const n = t.user?.name || "Não Atribuído"; userCount[n] = (userCount[n] || 0) + 1; });
    const sorted = Object.entries(userCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
    return {
      labels: sorted.map((u) => u[0]),
      datasets: [{ label: "Tarefas por Usuário", data: sorted.map((u) => u[1]), backgroundColor: "rgba(76,175,80,0.7)", borderColor: "rgba(76,175,80,1)", borderWidth: 2 }],
    };
  };

  const getTimelineChartData = () => {
    const last7Days = [], createdCount = [], completedCount = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(); date.setDate(date.getDate() - i);
      last7Days.push(date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }));
      createdCount.push(tasks.filter((t) => new Date(t.createdAt).toDateString() === date.toDateString()).length);
      completedCount.push(tasks.filter((t) => t.status === "Concluída" && new Date(t.updatedAt).toDateString() === date.toDateString()).length);
    }
    return {
      labels: last7Days,
      datasets: [
        { label: "Criadas", data: createdCount, borderColor: "#2196f3", backgroundColor: "rgba(33,150,243,0.1)", tension: 0.4, fill: true },
        { label: "Concluídas", data: completedCount, borderColor: "#4caf50", backgroundColor: "rgba(76,175,80,0.1)", tension: 0.4, fill: true },
      ],
    };
  };

  const getOverdueTasks = () => {
    const now = new Date();
    return tasks
      .filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "Concluída" && t.status !== "Cancelada")
      .sort((a, b) => {
        const order = { Alta: 1, Média: 2, Baixa: 3 };
        const pa = order[a.prioridade?.nome] || 999, pb = order[b.prioridade?.nome] || 999;
        return pa !== pb ? pa - pb : new Date(a.dueDate) - new Date(b.dueDate);
      })
      .slice(0, 10);
  };

  const getTopUsers = () => {
    const stats = {};
    tasks.forEach((t) => {
      const n = t.user?.name; if (!n) return;
      if (!stats[n]) stats[n] = { name: n, total: 0, completed: 0 };
      stats[n].total += 1;
      if (t.status === "Concluída") stats[n].completed += 1;
    });
    return Object.values(stats)
      .map((u) => ({ ...u, percentage: u.total > 0 ? Math.round((u.completed / u.total) * 100) : 0 }))
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 5);
  };

  const getDaysOverdue = (dueDate) => Math.ceil((new Date() - new Date(dueDate)) / (1000 * 60 * 60 * 24));
  const getMedalIcon = (i) => ["🥇", "🥈", "🥉"][i] || "🏅";
  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } };

  // ── ATIVIDADES functions ────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 1) { carregarAtividades(); carregarStatistics(); }
  }, [filtros, activeTab]);

  const carregarAtividades = async () => {
    try {
      setLoadingAtividades(true);
      const [tarefasRes, clientesRes, deptosRes, usersRes] = await Promise.all([
        api.get("/tarefas-geradas", { params: { ...filtros } }),
        api.get("/contacts"),
        api.get("/departamentos"),
        api.get("/users"),
      ]);
      setTarefas(tarefasRes.data);
      const clientesData = clientesRes.data.contacts || clientesRes.data || [];
      setClientes([...clientesData].sort((a, b) => (a.name || "").localeCompare(b.name || "")));
      setDepartamentos(deptosRes.data.departamentos || deptosRes.data || []);
      setUsuarios(usersRes.data.users || usersRes.data || []);
    } catch { toast.error("Erro ao carregar atividades"); }
    finally { setLoadingAtividades(false); }
  };

  const carregarStatistics = async () => {
    try {
      const { data } = await api.get("/tarefas-geradas/statistics");
      setStatistics(data);
    } catch {}
  };

  const handleOpenStatus = async (tarefa) => {
    setTarefaSelecionada(tarefa); setNovoStatus(tarefa.status); setObservacao(""); setDialogStatus(true);
    try {
      const { data } = await api.get(`/tarefas-geradas/${tarefa.id}/historico`);
      setHistorico(data);
    } catch { setHistorico([]); }
  };

  const handleSalvarStatus = async () => {
    if (!novoStatus) { toast.error("Selecione um status"); return; }
    try {
      await api.put(`/tarefas-geradas/${tarefaSelecionada.id}/status`, { status: novoStatus, observacao: observacao || undefined });
      toast.success("Status atualizado");
      setDialogStatus(false);
      carregarAtividades(); carregarStatistics();
    } catch { toast.error("Erro ao atualizar status"); }
  };

  const handleReatribuir = async () => {
    try {
      await api.put(`/tarefas-geradas/${tarefaSelecionada.id}/reatribuir`, {
        departamentoId: novoResponsavel.departamentoId, novoUserId: novoResponsavel.userId,
        observacao: "Reatribuída manualmente",
      });
      toast.success("Tarefa reatribuída");
      setDialogReatribuir(false); carregarAtividades();
    } catch { toast.error("Erro ao reatribuir"); }
  };

  const getStatusColor = (s) => ({ pendente: "warning", em_andamento: "info", concluida: "success", cancelada: "error" }[s] || "default");
  const getStatusLabel = (s) => ({ pendente: "Pendente", em_andamento: "Em Andamento", concluida: "Concluída", cancelada: "Cancelada" }[s] || s);


  // ── RENDER ───────────────────────────────────────────────────────
  return (
    <MainContainer>
      <MainHeader>
        <Title>Painel</Title>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          className={classes.tabsBar}
        >
          <Tab label="Panorama" />
          <Tab label="Atividades" />
          <Tab label="Tarefas Geradas" />
        </Tabs>

        {/* ══ ABA: PANORAMA ══════════════════════════════════════════ */}
        <TabPanel value={activeTab} index={0}>
          {user?.profile !== "admin" ? (
            <Typography color="error">Acesso restrito a administradores.</Typography>
          ) : (
            <Box className={classes.panoramaRoot}>
              <Paper className={classes.filterBar}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel>Período</InputLabel>
                      <Select value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)} label="Período">
                        <MenuItem value="7">Últimos 7 dias</MenuItem>
                        <MenuItem value="15">Últimos 15 dias</MenuItem>
                        <MenuItem value="30">Últimos 30 dias</MenuItem>
                        <MenuItem value="60">Últimos 60 dias</MenuItem>
                        <MenuItem value="all">Todas</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>

              <Grid container spacing={3} style={{ marginBottom: 24 }}>
                {[
                  { value: kpis.total, label: "Total de Tarefas", color: "#1976d2", Icon: Assignment },
                  { value: kpis.pendente, label: "Pendentes", color: "#ff9800", Icon: HourglassEmpty },
                  { value: kpis.emAndamento, label: "Em Andamento", color: "#2196f3", Icon: PlayArrow },
                  { value: kpis.concluida, label: "Concluídas", color: "#4caf50", Icon: CheckCircle },
                ].map(({ value, label, color, Icon }) => (
                  <Grid item xs={12} sm={6} md={3} key={label}>
                    <Card className={classes.kpiCard}>
                      <CardContent>
                        <div className={classes.kpiContent}>
                          <div>
                            <Typography className={classes.kpiValue} style={{ color }}>{value}</Typography>
                            <Typography className={classes.kpiLabel}>{label}</Typography>
                          </div>
                          <Icon className={classes.kpiIcon} style={{ color }} />
                        </div>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Grid container spacing={3} style={{ marginBottom: 24 }}>
                <Grid item xs={12} md={6}>
                  <Paper className={classes.chartCard}>
                    <Typography variant="h6" className={classes.chartTitle}><TrendingUp /> Status das Tarefas</Typography>
                    <div className={classes.chartContainer}><Doughnut data={getStatusChartData()} options={chartOptions} /></div>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper className={classes.chartCard}>
                    <Typography variant="h6" className={classes.chartTitle}><TrendingUp /> Tarefas por Departamento</Typography>
                    <div className={classes.chartContainer}><Bar data={getDepartmentChartData()} options={chartOptions} /></div>
                  </Paper>
                </Grid>
              </Grid>

              <Grid container spacing={3} style={{ marginBottom: 24 }}>
                <Grid item xs={12} md={6}>
                  <Paper className={classes.chartCard}>
                    <Typography variant="h6" className={classes.chartTitle}><TrendingUp /> Top 10 Usuários</Typography>
                    <div className={classes.chartContainer}><Bar data={getUserChartData()} options={{ ...chartOptions, indexAxis: "y" }} /></div>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper className={classes.chartCard}>
                    <Typography variant="h6" className={classes.chartTitle}><TrendingUp /> Evolução — Últimos 7 Dias</Typography>
                    <div className={classes.chartContainer}><Line data={getTimelineChartData()} options={chartOptions} /></div>
                  </Paper>
                </Grid>
              </Grid>

              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <Paper className={classes.tableCard}>
                    <Typography variant="h6" className={classes.chartTitle}><Warning style={{ color: "#f44336" }} /> Tarefas Atrasadas</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Tarefa</strong></TableCell>
                            <TableCell><strong>Responsável</strong></TableCell>
                            <TableCell><strong>Prioridade</strong></TableCell>
                            <TableCell><strong>Dias Atrasada</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {getOverdueTasks().length === 0 ? (
                            <TableRow><TableCell colSpan={4} align="center"><Typography variant="body2" color="textSecondary">🎉 Nenhuma tarefa atrasada!</Typography></TableCell></TableRow>
                          ) : getOverdueTasks().map((t) => (
                            <TableRow key={t.id} className={classes.overdueRow}>
                              <TableCell>{t.tarefaConfig?.titulo || t.title}</TableCell>
                              <TableCell>{t.user?.name || "-"}</TableCell>
                              <TableCell>{t.prioridade && <Chip label={t.prioridade.nome} size="small" style={{ backgroundColor: t.prioridade.cor || "#757575", color: "#fff" }} />}</TableCell>
                              <TableCell><Chip label={`${getDaysOverdue(t.dueDate)} dias`} size="small" style={{ backgroundColor: "#f44336", color: "#fff" }} /></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Paper className={classes.tableCard}>
                    <Typography variant="h6" className={classes.chartTitle}><EmojiEvents style={{ color: "#ffc107" }} /> Top 5 Produtividade</Typography>
                    {getTopUsers().length === 0 ? (
                      <Box textAlign="center" py={3}><Typography variant="body2" color="textSecondary">Nenhum dado disponível</Typography></Box>
                    ) : getTopUsers().map((u, i) => (
                      <Box key={u.name} className={classes.rankingCard}>
                        <Typography className={classes.medal}>{getMedalIcon(i)}</Typography>
                        <Box flex={1}>
                          <Typography variant="body1" style={{ fontWeight: 600 }}>{u.name}</Typography>
                          <Typography variant="caption" color="textSecondary">{u.completed} concluídas de {u.total} ({u.percentage}%)</Typography>
                        </Box>
                        <Chip label={`${u.percentage}%`} size="small" style={{ backgroundColor: u.percentage >= 70 ? "#4caf50" : "#ff9800", color: "#fff", fontWeight: 600 }} />
                      </Box>
                    ))}
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </TabPanel>

        {/* ══ ABA: ATIVIDADES ════════════════════════════════════════ */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={2} style={{ marginBottom: 24 }}>
            {[
              { label: "Total", value: statistics.total || 0, border: "none" },
              { label: "Pendentes", value: statistics.pendentes || 0, border: "4px solid #ff9800", status: "pendente" },
              { label: "Em Andamento", value: statistics.emAndamento || 0, border: "4px solid #2196f3", status: "em_andamento" },
              { label: "Concluídas", value: statistics.concluidas || 0, border: "4px solid #4caf50", status: "concluida" },
              { label: "Canceladas", value: statistics.canceladas || 0, border: "4px solid #f44336", status: "cancelada" },
            ].map(({ label, value, border, status }) => (
              <Grid item xs={12} sm={6} md={3} lg={2} key={label}>
                <Card style={{ borderLeft: border, cursor: "pointer" }} onClick={() => setFiltros((f) => ({ ...f, status: status || "" }))}>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>{label}</Typography>
                    <Typography variant="h4">{value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Paper style={{ padding: 16, marginBottom: 24 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={filtros.status} onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}>
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="pendente">Pendente</MenuItem>
                    <MenuItem value="em_andamento">Em Andamento</MenuItem>
                    <MenuItem value="concluida">Concluída</MenuItem>
                    <MenuItem value="cancelada">Cancelada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Cliente</InputLabel>
                  <Select value={filtros.clienteId} onChange={(e) => setFiltros({ ...filtros, clienteId: e.target.value })}>
                    <MenuItem value="">Todos</MenuItem>
                    {clientes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Departamento</InputLabel>
                  <Select value={filtros.departamentoId} onChange={(e) => setFiltros({ ...filtros, departamentoId: e.target.value })}>
                    <MenuItem value="">Todos</MenuItem>
                    {departamentos.map((d) => <MenuItem key={d.id} value={d.id}>{d.nome}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button fullWidth variant="outlined" onClick={() => setFiltros({ status: "", clienteId: "", departamentoId: "", userId: "" })}>Limpar Filtros</Button>
              </Grid>
            </Grid>
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nº</TableCell>
                  <TableCell>Título</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Prazo</TableCell>
                  <TableCell>Departamento</TableCell>
                  <TableCell>Responsável</TableCell>
                  <TableCell>Competência</TableCell>
                  <TableCell>Data Entrega</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingAtividades ? (
                  <TableRow><TableCell colSpan={10} align="center">Carregando...</TableCell></TableRow>
                ) : tarefas.length === 0 ? (
                  <TableRow><TableCell colSpan={10} align="center">Nenhuma tarefa encontrada</TableCell></TableRow>
                ) : tarefas.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.id}</TableCell>
                    <TableCell>{t.titulo}</TableCell>
                    <TableCell>{t.cliente?.name || t.cliente?.nome || "-"}</TableCell>
                    <TableCell>{t.dataInicio ? format(parseISO(t.dataInicio), "dd/MM/yyyy", { locale: ptBR }) : "-"}</TableCell>
                    <TableCell>{t.departamento?.nome || "-"}</TableCell>
                    <TableCell>{t.user?.name || "-"}</TableCell>
                    <TableCell>{t.competencia}</TableCell>
                    <TableCell>{t.dataEntrega ? format(parseISO(t.dataEntrega), "dd/MM/yyyy", { locale: ptBR }) : "-"}</TableCell>
                    <TableCell><Chip label={getStatusLabel(t.status)} color={getStatusColor(t.status)} size="small" /></TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary" title="Alterar Status" onClick={() => handleOpenStatus(t)}><EditIcon /></IconButton>
                      <IconButton size="small" title="Reatribuir" onClick={() => { setTarefaSelecionada(t); setNovoResponsavel({ departamentoId: t.departamentoId || "", userId: t.userId || "" }); setDialogReatribuir(true); }}><RefreshIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Dialog Status */}
          <Dialog open={dialogStatus} onClose={() => setDialogStatus(false)} maxWidth="md" fullWidth>
            <DialogTitle>Alterar Status — Tarefa #{tarefaSelecionada?.id}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} style={{ marginTop: 8 }}>
                <Grid item xs={12}><Typography variant="subtitle2" color="textSecondary">Status Atual: {tarefaSelecionada && getStatusLabel(tarefaSelecionada.status)}</Typography></Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Novo Status</InputLabel>
                    <Select value={novoStatus} onChange={(e) => setNovoStatus(e.target.value)}>
                      <MenuItem value="pendente">Pendente</MenuItem>
                      <MenuItem value="em_andamento">Em Andamento</MenuItem>
                      <MenuItem value="concluida">Concluída</MenuItem>
                      <MenuItem value="cancelada">Cancelada</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Observação" value={observacao} onChange={(e) => setObservacao(e.target.value)} /></Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" style={{ marginTop: 16, marginBottom: 8 }}>Histórico</Typography>
                  <TableContainer component={Paper} style={{ maxHeight: 300 }}>
                    <Table size="small">
                      <TableHead><TableRow><TableCell>Data</TableCell><TableCell>Usuário</TableCell><TableCell>Status</TableCell><TableCell>Observação</TableCell></TableRow></TableHead>
                      <TableBody>
                        {historico.length === 0 ? (
                          <TableRow><TableCell colSpan={4} align="center">Nenhuma alteração</TableCell></TableRow>
                        ) : historico.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell>{item.createdAt ? format(parseISO(item.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-"}</TableCell>
                            <TableCell>{item.usuario?.name || item.user?.name || "-"}</TableCell>
                            <TableCell><Chip label={getStatusLabel(item.status)} color={getStatusColor(item.status)} size="small" /></TableCell>
                            <TableCell>{item.observacao || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogStatus(false)}>Cancelar</Button>
              <Button variant="contained" color="primary" onClick={handleSalvarStatus}>Salvar</Button>
            </DialogActions>
          </Dialog>

          {/* Dialog Reatribuir */}
          <Dialog open={dialogReatribuir} onClose={() => setDialogReatribuir(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Reatribuir Tarefa</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} style={{ marginTop: 8 }}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Departamento</InputLabel>
                    <Select value={novoResponsavel.departamentoId} onChange={(e) => setNovoResponsavel({ ...novoResponsavel, departamentoId: e.target.value })}>
                      {departamentos.map((d) => <MenuItem key={d.id} value={d.id}>{d.nome}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Usuário</InputLabel>
                    <Select value={novoResponsavel.userId} onChange={(e) => setNovoResponsavel({ ...novoResponsavel, userId: e.target.value })}>
                      {usuarios
                        .filter((u) => !novoResponsavel.departamentoId || u.departamentos?.some((d) => d.id === novoResponsavel.departamentoId))
                        .map((u) => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogReatribuir(false)}>Cancelar</Button>
              <Button variant="contained" onClick={handleReatribuir}>Reatribuir</Button>
            </DialogActions>
          </Dialog>
        </TabPanel>

        {/* ══ ABA: TAREFAS GERADAS ═══════════════════════════════════ */}
        <TabPanel value={activeTab} index={2}>
          <TarefasGeradasPanel />
        </TabPanel>
      </Paper>
    </MainContainer>
  );
};

export default Painel;
