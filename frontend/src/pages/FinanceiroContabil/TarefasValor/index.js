import React, { useState, useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box, Paper, Typography, Button, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Tooltip, CircularProgress, Grid, Select, FormControl, InputLabel, MenuItem,
} from "@material-ui/core";
import {
  Search as SearchIcon, GetApp as GetAppIcon, Refresh as RefreshIcon,
  AssignmentTurnedIn as TaskIcon,
} from "@material-ui/icons";
import MainContainer from "../../../components/MainContainer";

const useStyles = makeStyles((theme) => ({
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing(2) },
  paper: { padding: theme.spacing(2), borderRadius: 16, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  summaryCards: { display: "flex", gap: theme.spacing(2), marginBottom: theme.spacing(2), flexWrap: "wrap" },
  card: { flex: 1, minWidth: 150, padding: theme.spacing(2), borderRadius: 12, backgroundColor: "#f7f9fc", border: "1px solid #e0e0e0" },
  cardValue: { fontSize: 22, fontWeight: 700 },
  toolbar: { display: "flex", gap: theme.spacing(1), marginBottom: theme.spacing(1.5), flexWrap: "wrap", alignItems: "center" },
  totalRow: { backgroundColor: "#f0f7ff", fontWeight: 700 },
}));

const STATUS_CHIP = {
  pendente: { label: "Pendente", color: "secondary" },
  "em andamento": { label: "Em Andamento", color: "primary" },
  concluida: { label: "Concluída", color: "primary" },
  cancelada: { label: "Cancelada", color: "default" },
};

const MOCK = [
  { id: 1, tarefa: "Apuração Fiscal - Junho", cliente: "Empresa Alpha Ltda", tipo: "Fiscal", valorUnit: 380.00, quantidade: 1, status: "concluida", responsavel: "Ana Lima", competencia: "2026-06" },
  { id: 2, tarefa: "Folha de Pagamento - Junho", cliente: "Empresa Alpha Ltda", tipo: "DP", valorUnit: 320.00, quantidade: 1, status: "concluida", responsavel: "Carlos Melo", competencia: "2026-06" },
  { id: 3, tarefa: "Contabilidade Mensal - Junho", cliente: "Comércio Beta S/A", tipo: "Contábil", valorUnit: 550.00, quantidade: 1, status: "em andamento", responsavel: "Pedro Costa", competencia: "2026-06" },
  { id: 4, tarefa: "Apuração Fiscal - Junho", cliente: "Comércio Beta S/A", tipo: "Fiscal", valorUnit: 420.00, quantidade: 1, status: "em andamento", responsavel: "Ana Lima", competencia: "2026-06" },
  { id: 5, tarefa: "Entrega SPED Fiscal", cliente: "Gama Serviços Eireli", tipo: "Fiscal", valorUnit: 280.00, quantidade: 1, status: "pendente", responsavel: "Ana Lima", competencia: "2026-06" },
  { id: 6, tarefa: "Folha de Pagamento - Junho", cliente: "Gama Serviços Eireli", tipo: "DP", valorUnit: 290.00, quantidade: 1, status: "pendente", responsavel: "Carlos Melo", competencia: "2026-06" },
  { id: 7, tarefa: "Declaração IR PF", cliente: "Maria Souza CPF", tipo: "IRPF", valorUnit: 450.00, quantidade: 1, status: "concluida", responsavel: "Pedro Costa", competencia: "2026-06" },
  { id: 8, tarefa: "Certidão Negativa FGTS", cliente: "João Silva ME", tipo: "Certidão", valorUnit: 80.00, quantidade: 3, status: "concluida", responsavel: "Ana Lima", competencia: "2026-06" },
];

const TarefasValor = () => {
  const classes = useStyles();
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading] = useState(false);

  const fmt = (v) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const filtered = useMemo(() =>
    MOCK.filter((r) => {
      const matchSearch =
        r.tarefa.toLowerCase().includes(search.toLowerCase()) ||
        r.cliente.toLowerCase().includes(search.toLowerCase());
      const matchTipo = !filterTipo || r.tipo === filterTipo;
      const matchStatus = !filterStatus || r.status === filterStatus;
      return matchSearch && matchTipo && matchStatus;
    }), [search, filterTipo, filterStatus]);

  const totalQtd = filtered.reduce((s, r) => s + r.quantidade, 0);
  const totalValor = filtered.reduce((s, r) => s + r.valorUnit * r.quantidade, 0);
  const totalConcluido = filtered.filter((r) => r.status === "concluida").reduce((s, r) => s + r.valorUnit * r.quantidade, 0);
  const totalPendente = filtered.filter((r) => r.status !== "concluida" && r.status !== "cancelada").reduce((s, r) => s + r.valorUnit * r.quantidade, 0);

  const tipos = [...new Set(MOCK.map((r) => r.tipo))].sort();

  // Agrupamento por cliente
  const porCliente = useMemo(() => {
    const map = {};
    filtered.forEach((r) => {
      if (!map[r.cliente]) map[r.cliente] = { cliente: r.cliente, qtd: 0, total: 0, tarefas: [] };
      map[r.cliente].qtd += r.quantidade;
      map[r.cliente].total += r.valorUnit * r.quantidade;
      map[r.cliente].tarefas.push(r);
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filtered]);

  return (
    <MainContainer>
      <Box style={{ height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
        <Box className={classes.header}>
          <Typography variant="h5" style={{ fontWeight: 600 }}>Tarefas com Valor</Typography>
          <Box style={{ display: "flex", gap: 8 }}>
            <Tooltip title="Exportar"><Button size="small" variant="outlined" startIcon={<GetAppIcon />}>Exportar</Button></Tooltip>
            <Tooltip title="Atualizar"><Button size="small" variant="outlined" startIcon={<RefreshIcon />} disabled={loading}>Atualizar</Button></Tooltip>
          </Box>
        </Box>

        {/* Totalizadores */}
        <Box className={classes.summaryCards}>
          {[
            { label: "Total de Tarefas", value: totalQtd, color: "#0596cd" },
            { label: "Valor Total (período)", value: fmt(totalValor), color: "#6a1b9a" },
            { label: "Valor Concluído", value: fmt(totalConcluido), color: "#2e7d32" },
            { label: "Valor em Aberto", value: fmt(totalPendente), color: "#e65100" },
          ].map((c) => (
            <Paper key={c.label} className={classes.card} variant="outlined">
              <Typography variant="caption" color="textSecondary">{c.label}</Typography>
              <Typography className={classes.cardValue} style={{ color: c.color }}>{c.value}</Typography>
            </Paper>
          ))}
        </Box>

        <Grid container spacing={2} style={{ marginBottom: 12 }}>
          <Grid item xs={12} sm={5}>
            <TextField
              placeholder="Buscar tarefa ou cliente..." variant="outlined" size="small" fullWidth
              value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon style={{ color: "#aaa" }} /></InputAdornment> }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel>Tipo</InputLabel>
              <Select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} label="Tipo">
                <MenuItem value="">Todos</MenuItem>
                {tipos.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
                <MenuItem value="">Todos</MenuItem>
                {Object.entries(STATUS_CHIP).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Grid container spacing={2} style={{ flex: 1, overflow: "hidden" }}>
          {/* Tabela principal */}
          <Grid item xs={12} md={8} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Paper className={classes.paper} variant="outlined">
              <Typography variant="subtitle2" style={{ fontWeight: 700, marginBottom: 8, color: "#555" }}>
                Detalhamento ({filtered.length} tarefas)
              </Typography>
              <TableContainer style={{ flex: 1, overflowY: "auto" }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      {["Tarefa", "Cliente", "Tipo", "Qtd", "Valor Unit.", "Total", "Status", "Responsável"].map((h) => (
                        <TableCell key={h} style={{ fontWeight: 700, backgroundColor: "#f5f5f5", fontSize: 12 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={8} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                    ) : filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={8} align="center">
                        <Box style={{ padding: 32, textAlign: "center" }}>
                          <TaskIcon style={{ fontSize: 48, opacity: 0.2 }} />
                          <Typography color="textSecondary">Nenhuma tarefa encontrada</Typography>
                        </Box>
                      </TableCell></TableRow>
                    ) : (
                      <>
                        {filtered.map((r) => {
                          const s = STATUS_CHIP[r.status] || { label: r.status, color: "default" };
                          return (
                            <TableRow key={r.id} hover>
                              <TableCell style={{ fontWeight: 500 }}>{r.tarefa}</TableCell>
                              <TableCell style={{ fontSize: 12, color: "#666" }}>{r.cliente}</TableCell>
                              <TableCell><Chip label={r.tipo} size="small" variant="outlined" /></TableCell>
                              <TableCell align="center">{r.quantidade}</TableCell>
                              <TableCell>{fmt(r.valorUnit)}</TableCell>
                              <TableCell><strong style={{ color: "#0596cd" }}>{fmt(r.valorUnit * r.quantidade)}</strong></TableCell>
                              <TableCell><Chip label={s.label} size="small" color={s.color} /></TableCell>
                              <TableCell style={{ fontSize: 12 }}>{r.responsavel}</TableCell>
                            </TableRow>
                          );
                        })}
                        <TableRow className={classes.totalRow}>
                          <TableCell colSpan={3}><strong>TOTAL</strong></TableCell>
                          <TableCell align="center"><strong>{totalQtd}</strong></TableCell>
                          <TableCell>-</TableCell>
                          <TableCell><strong style={{ color: "#6a1b9a" }}>{fmt(totalValor)}</strong></TableCell>
                          <TableCell colSpan={2} />
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Resumo por cliente */}
          <Grid item xs={12} md={4} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Paper className={classes.paper} variant="outlined">
              <Typography variant="subtitle2" style={{ fontWeight: 700, marginBottom: 8, color: "#555" }}>
                Resumo por Cliente
              </Typography>
              <TableContainer style={{ flex: 1, overflowY: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ fontWeight: 700, backgroundColor: "#f5f5f5", fontSize: 12 }}>Cliente</TableCell>
                      <TableCell style={{ fontWeight: 700, backgroundColor: "#f5f5f5", fontSize: 12 }} align="center">Qtd</TableCell>
                      <TableCell style={{ fontWeight: 700, backgroundColor: "#f5f5f5", fontSize: 12 }} align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {porCliente.map((c) => (
                      <TableRow key={c.cliente} hover>
                        <TableCell style={{ fontSize: 12, fontWeight: 500 }}>{c.cliente}</TableCell>
                        <TableCell align="center" style={{ fontSize: 12 }}>{c.qtd}</TableCell>
                        <TableCell align="right"><strong style={{ color: "#0596cd", fontSize: 12 }}>{fmt(c.total)}</strong></TableCell>
                      </TableRow>
                    ))}
                    <TableRow className={classes.totalRow}>
                      <TableCell><strong>TOTAL</strong></TableCell>
                      <TableCell align="center"><strong>{totalQtd}</strong></TableCell>
                      <TableCell align="right"><strong style={{ color: "#6a1b9a" }}>{fmt(totalValor)}</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </MainContainer>
  );
};

export default TarefasValor;
