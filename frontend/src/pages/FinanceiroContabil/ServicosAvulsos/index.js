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
  Assignment as AssignmentIcon,
} from "@material-ui/icons";
import MainContainer from "../../../components/MainContainer";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing(2) },
  addButton: { background: "linear-gradient(135deg, #0596cd 0%, #047ba5 100%)", color: "#fff", "&:hover": { background: "linear-gradient(135deg, #047ba5 0%, #035c7d 100%)" } },
  paper: { padding: theme.spacing(2), borderRadius: 16, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  summaryCards: { display: "flex", gap: theme.spacing(2), marginBottom: theme.spacing(2), flexWrap: "wrap" },
  card: { flex: 1, minWidth: 150, padding: theme.spacing(2), borderRadius: 12, backgroundColor: "#f7f9fc", border: "1px solid #e0e0e0" },
  cardValue: { fontSize: 22, fontWeight: 700 },
  toolbar: { display: "flex", gap: theme.spacing(1), marginBottom: theme.spacing(1.5), flexWrap: "wrap", alignItems: "center" },
}));

const STATUS_COLORS = { aprovado: "primary", pendente: "secondary", cancelado: "default", executado: "primary" };

const MOCK = [
  { id: 1, cliente: "Empresa Alpha Ltda", servico: "Abertura de Empresa", valor: 800.00, data: "2026-06-01", status: "executado", responsavel: "Ana Lima", obs: "" },
  { id: 2, cliente: "João Silva ME", servico: "Alteração Contratual", valor: 350.00, data: "2026-06-05", status: "aprovado", responsavel: "Carlos Melo", obs: "Alteração de sócio" },
  { id: 3, cliente: "Comércio Beta S/A", servico: "Encerramento", valor: 1200.00, data: "2026-06-10", status: "pendente", responsavel: "Ana Lima", obs: "" },
  { id: 4, cliente: "Gama Serviços Eireli", servico: "Declaração IR PF", valor: 450.00, data: "2026-06-12", status: "executado", responsavel: "Pedro Costa", obs: "" },
  { id: 5, cliente: "Maria Souza CPF", servico: "Certidão Negativa", valor: 120.00, data: "2026-06-14", status: "aprovado", responsavel: "Pedro Costa", obs: "" },
];

const emptyForm = { cliente: "", servico: "", valor: "", data: "", status: "pendente", responsavel: "", obs: "" };

const ServicosAvulsos = () => {
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
      r.servico.toLowerCase().includes(search.toLowerCase())
    ), [records, search]);

  const fmt = (v) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const totalMes = records.filter((r) => r.status !== "cancelado").reduce((s, r) => s + r.valor, 0);
  const executados = records.filter((r) => r.status === "executado").length;

  const handleOpen = (rec = null) => {
    if (rec) { setForm({ ...rec, valor: String(rec.valor) }); setEditingId(rec.id); }
    else { setForm(emptyForm); setEditingId(null); }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.cliente || !form.servico || !form.valor) { toast.error("Preencha os campos obrigatórios"); return; }
    const val = { ...form, valor: parseFloat(form.valor) || 0 };
    if (editingId) {
      setRecords((p) => p.map((r) => r.id === editingId ? { ...val, id: editingId } : r));
      toast.success("Serviço atualizado!");
    } else {
      setRecords((p) => [...p, { ...val, id: Date.now() }]);
      toast.success("Serviço cadastrado!");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    setRecords((p) => p.filter((r) => r.id !== deleteTarget.id));
    toast.success("Serviço excluído!");
    setConfirmOpen(false); setDeleteTarget(null);
  };

  return (
    <MainContainer>
      <Box style={{ height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
        <Box className={classes.header}>
          <Typography variant="h5" style={{ fontWeight: 600 }}>Serviços Avulsos</Typography>
          <Button variant="contained" className={classes.addButton} startIcon={<AddIcon />} onClick={() => handleOpen()}>
            Novo Serviço
          </Button>
        </Box>

        <Box className={classes.summaryCards}>
          {[
            { label: "Total do Período", value: fmt(totalMes), color: "#0596cd" },
            { label: "Executados", value: executados, color: "#2e7d32" },
            { label: "Pendentes/Aprovados", value: records.filter((r) => ["pendente", "aprovado"].includes(r.status)).length, color: "#e65100" },
            { label: "Cancelados", value: records.filter((r) => r.status === "cancelado").length, color: "#9e9e9e" },
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
              placeholder="Buscar cliente ou serviço..." variant="outlined" size="small" style={{ flex: 1, minWidth: 260 }}
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
                  {["Cliente", "Serviço", "Valor", "Data", "Responsável", "Status", "Observação", "Ações"].map((h) => (
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
                      <AssignmentIcon style={{ fontSize: 48, opacity: 0.2 }} />
                      <Typography color="textSecondary">Nenhum serviço encontrado</Typography>
                    </Box>
                  </TableCell></TableRow>
                ) : filtered.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell style={{ fontWeight: 500 }}>{r.cliente}</TableCell>
                    <TableCell>{r.servico}</TableCell>
                    <TableCell><strong style={{ color: "#0596cd" }}>{fmt(r.valor)}</strong></TableCell>
                    <TableCell>{r.data}</TableCell>
                    <TableCell>{r.responsavel}</TableCell>
                    <TableCell><Chip label={r.status} size="small" color={STATUS_COLORS[r.status] || "default"} /></TableCell>
                    <TableCell style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.obs || "-"}</TableCell>
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Editar Serviço Avulso" : "Novo Serviço Avulso"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: 4 }}>
            <Grid item xs={12}><TextField label="Cliente *" fullWidth variant="outlined" size="small" value={form.cliente} onChange={(e) => setForm((p) => ({ ...p, cliente: e.target.value }))} /></Grid>
            <Grid item xs={12}><TextField label="Serviço *" fullWidth variant="outlined" size="small" value={form.servico} onChange={(e) => setForm((p) => ({ ...p, servico: e.target.value }))} /></Grid>
            <Grid item xs={6}><TextField label="Valor (R$) *" fullWidth variant="outlined" size="small" type="number" value={form.valor} onChange={(e) => setForm((p) => ({ ...p, valor: e.target.value }))} /></Grid>
            <Grid item xs={6}><TextField label="Data" fullWidth variant="outlined" size="small" type="date" InputLabelProps={{ shrink: true }} value={form.data} onChange={(e) => setForm((p) => ({ ...p, data: e.target.value }))} /></Grid>
            <Grid item xs={6}><TextField label="Responsável" fullWidth variant="outlined" size="small" value={form.responsavel} onChange={(e) => setForm((p) => ({ ...p, responsavel: e.target.value }))} /></Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} label="Status">
                  {["pendente", "aprovado", "executado", "cancelado"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}><TextField label="Observação" fullWidth variant="outlined" size="small" multiline rows={2} value={form.obs} onChange={(e) => setForm((p) => ({ ...p, obs: e.target.value }))} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} color="primary" variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>

      <ConfirmationModal title="Excluir Serviço" open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete}>
        Tem certeza que deseja excluir o serviço <strong>{deleteTarget?.servico}</strong> de <strong>{deleteTarget?.cliente}</strong>?
      </ConfirmationModal>
    </MainContainer>
  );
};

export default ServicosAvulsos;
