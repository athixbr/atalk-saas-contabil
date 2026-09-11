import React, { useState, useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box, Paper, Typography, Button, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, Tooltip, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Select, FormControl, InputLabel,
  Grid,
} from "@material-ui/core";
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, GetApp as GetAppIcon, Refresh as RefreshIcon,
  MonetizationOn as MoneyIcon,
} from "@material-ui/icons";
import MainContainer from "../../../components/MainContainer";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing(2) },
  addButton: { background: "linear-gradient(135deg, #0596cd 0%, #047ba5 100%)", color: "#fff", "&:hover": { background: "linear-gradient(135deg, #047ba5 0%, #035c7d 100%)" } },
  paper: { padding: theme.spacing(2), borderRadius: 16, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  summaryCards: { display: "flex", gap: theme.spacing(2), marginBottom: theme.spacing(2), flexWrap: "wrap" },
  card: { flex: 1, minWidth: 160, padding: theme.spacing(2), borderRadius: 12, backgroundColor: "#f7f9fc", border: "1px solid #e0e0e0" },
  cardValue: { fontSize: 22, fontWeight: 700, color: "#0596cd" },
  toolbar: { display: "flex", gap: theme.spacing(1), marginBottom: theme.spacing(1.5), flexWrap: "wrap", alignItems: "center" },
}));

const STATUS_COLORS = { ativo: "primary", inativo: "default", pendente: "secondary" };
const PERIODICIDADES = ["Mensal", "Trimestral", "Semestral", "Anual", "Avulso"];

const MOCK = [
  { id: 1, cliente: "Empresa Alpha Ltda", documento: "12.345.678/0001-99", honorario: 1850.00, periodicidade: "Mensal", competencia: "2026-06", status: "ativo", vencimento: "2026-06-10" },
  { id: 2, cliente: "João Silva ME", documento: "98.765.432/0001-10", honorario: 620.00, periodicidade: "Mensal", competencia: "2026-06", status: "pendente", vencimento: "2026-06-15" },
  { id: 3, cliente: "Comércio Beta S/A", documento: "11.222.333/0001-44", honorario: 3200.00, periodicidade: "Mensal", competencia: "2026-06", status: "ativo", vencimento: "2026-06-05" },
  { id: 4, cliente: "Maria Souza CPF", documento: "123.456.789-00", honorario: 450.00, periodicidade: "Mensal", competencia: "2026-05", status: "inativo", vencimento: "2026-05-10" },
  { id: 5, cliente: "Gama Serviços Eireli", documento: "55.666.777/0001-88", honorario: 2100.00, periodicidade: "Trimestral", competencia: "2026-06", status: "ativo", vencimento: "2026-06-30" },
];

const emptyForm = { cliente: "", documento: "", honorario: "", periodicidade: "Mensal", competencia: "", vencimento: "", status: "ativo" };

const Honorarios = () => {
  const classes = useStyles();
  const [records, setRecords] = useState(MOCK);
  const [search, setSearch] = useState("");
  const [loading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const filtered = useMemo(() =>
    records.filter((r) =>
      r.cliente.toLowerCase().includes(search.toLowerCase()) ||
      r.documento.includes(search)
    ), [records, search]);

  const totalMensal = records.filter((r) => r.status === "ativo" && r.periodicidade === "Mensal").reduce((s, r) => s + r.honorario, 0);
  const totalGeral = records.filter((r) => r.status === "ativo").reduce((s, r) => s + r.honorario, 0);
  const pendentes = records.filter((r) => r.status === "pendente").length;

  const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleOpen = (rec = null) => {
    if (rec) { setForm({ ...rec, honorario: String(rec.honorario) }); setEditingId(rec.id); }
    else { setForm(emptyForm); setEditingId(null); }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.cliente || !form.honorario) { toast.error("Preencha os campos obrigatórios"); return; }
    const val = { ...form, honorario: parseFloat(form.honorario) || 0 };
    if (editingId) {
      setRecords((p) => p.map((r) => r.id === editingId ? { ...val, id: editingId } : r));
      toast.success("Honorário atualizado!");
    } else {
      setRecords((p) => [...p, { ...val, id: Date.now() }]);
      toast.success("Honorário cadastrado!");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    setRecords((p) => p.filter((r) => r.id !== deleteTarget.id));
    toast.success("Honorário excluído!");
    setConfirmOpen(false); setDeleteTarget(null);
  };

  return (
    <MainContainer>
      <Box style={{ height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
        <Box className={classes.header}>
          <Typography variant="h5" style={{ fontWeight: 600 }}>Honorários</Typography>
          <Button variant="contained" className={classes.addButton} startIcon={<AddIcon />} onClick={() => handleOpen()}>
            Novo Honorário
          </Button>
        </Box>

        {/* Cards de resumo */}
        <Box className={classes.summaryCards}>
          {[
            { label: "Receita Mensal (ativos)", value: fmt(totalMensal), color: "#0596cd" },
            { label: "Total Ativo (todas period.)", value: fmt(totalGeral), color: "#2e7d32" },
            { label: "Clientes Ativos", value: records.filter((r) => r.status === "ativo").length, color: "#1565c0" },
            { label: "Pendentes", value: pendentes, color: "#e65100" },
          ].map((c) => (
            <Paper key={c.label} className={classes.card} variant="outlined">
              <Typography variant="caption" color="textSecondary">{c.label}</Typography>
              <Typography className={classes.cardValue} style={{ color: c.color }}>{c.value}</Typography>
            </Paper>
          ))}
        </Box>

        <Paper className={classes.paper} variant="outlined">
          <Box className={classes.toolbar}>
            <TextField
              placeholder="Buscar cliente ou documento..."
              variant="outlined" size="small" style={{ flex: 1, minWidth: 260 }}
              value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon style={{ color: "#aaa" }} /></InputAdornment> }}
            />
            <Tooltip title="Exportar"><Button size="small" variant="outlined" startIcon={<GetAppIcon />}>Exportar</Button></Tooltip>
            <Tooltip title="Atualizar"><Button size="small" variant="outlined" startIcon={<RefreshIcon />} disabled={loading}>Atualizar</Button></Tooltip>
          </Box>

          <TableContainer style={{ flex: 1, overflowY: "auto" }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {["Cliente", "Documento", "Honorário", "Periodicidade", "Competência", "Vencimento", "Status", "Ações"].map((h) => (
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
                      <MoneyIcon style={{ fontSize: 48, opacity: 0.2 }} />
                      <Typography color="textSecondary">Nenhum honorário encontrado</Typography>
                    </Box>
                  </TableCell></TableRow>
                ) : filtered.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell style={{ fontWeight: 500 }}>{r.cliente}</TableCell>
                    <TableCell>{r.documento}</TableCell>
                    <TableCell><strong style={{ color: "#0596cd" }}>{fmt(r.honorario)}</strong></TableCell>
                    <TableCell>{r.periodicidade}</TableCell>
                    <TableCell>{r.competencia}</TableCell>
                    <TableCell>{r.vencimento}</TableCell>
                    <TableCell>
                      <Chip label={r.status} size="small" color={STATUS_COLORS[r.status] || "default"} />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Editar"><IconButton size="small" color="primary" onClick={() => handleOpen(r)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Excluir"><IconButton size="small" color="secondary" onClick={() => { setDeleteTarget(r); setConfirmOpen(true); }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Dialog form */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Editar Honorário" : "Novo Honorário"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: 4 }}>
            <Grid item xs={12}><TextField label="Cliente *" fullWidth variant="outlined" size="small" value={form.cliente} onChange={(e) => setForm((p) => ({ ...p, cliente: e.target.value }))} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="CPF / CNPJ" fullWidth variant="outlined" size="small" value={form.documento} onChange={(e) => setForm((p) => ({ ...p, documento: e.target.value }))} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Honorário (R$) *" fullWidth variant="outlined" size="small" type="number" value={form.honorario} onChange={(e) => setForm((p) => ({ ...p, honorario: e.target.value }))} /></Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel>Periodicidade</InputLabel>
                <Select value={form.periodicidade} onChange={(e) => setForm((p) => ({ ...p, periodicidade: e.target.value }))} label="Periodicidade">
                  {PERIODICIDADES.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}><TextField label="Competência (AAAA-MM)" fullWidth variant="outlined" size="small" value={form.competencia} onChange={(e) => setForm((p) => ({ ...p, competencia: e.target.value }))} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Vencimento" fullWidth variant="outlined" size="small" type="date" InputLabelProps={{ shrink: true }} value={form.vencimento} onChange={(e) => setForm((p) => ({ ...p, vencimento: e.target.value }))} /></Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} label="Status">
                  <MenuItem value="ativo">Ativo</MenuItem>
                  <MenuItem value="inativo">Inativo</MenuItem>
                  <MenuItem value="pendente">Pendente</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} color="primary" variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>

      <ConfirmationModal title="Excluir Honorário" open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete}>
        Tem certeza que deseja excluir o honorário de <strong>{deleteTarget?.cliente}</strong>?
      </ConfirmationModal>
    </MainContainer>
  );
};

export default Honorarios;
