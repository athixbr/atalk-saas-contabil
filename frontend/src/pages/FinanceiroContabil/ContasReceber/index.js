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
  CheckCircle as CheckIcon, AccountBalance as AccountIcon,
} from "@material-ui/icons";
import MainContainer from "../../../components/MainContainer";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing(2) },
  addButton: { background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)", color: "#fff", "&:hover": { background: "linear-gradient(135deg, #1b5e20 0%, #0a3d0a 100%)" } },
  paper: { padding: theme.spacing(2), borderRadius: 16, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  summaryCards: { display: "flex", gap: theme.spacing(2), marginBottom: theme.spacing(2), flexWrap: "wrap" },
  card: { flex: 1, minWidth: 150, padding: theme.spacing(2), borderRadius: 12, backgroundColor: "#f7f9fc", border: "1px solid #e0e0e0" },
  cardValue: { fontSize: 22, fontWeight: 700 },
  toolbar: { display: "flex", gap: theme.spacing(1), marginBottom: theme.spacing(1.5), flexWrap: "wrap", alignItems: "center" },
}));

const STATUS_CHIP = {
  aberto: { label: "Em Aberto", color: "secondary" },
  recebido: { label: "Recebido", color: "primary" },
  vencido: { label: "Vencido", color: "default" },
  parcial: { label: "Parcial", color: "secondary" },
  cancelado: { label: "Cancelado", color: "default" },
};

const MOCK = [
  { id: 1, cliente: "Empresa Alpha Ltda", descricao: "Honorário Junho/2026", valor: 1850.00, vencimento: "2026-06-10", recebimento: "", status: "recebido", forma: "PIX" },
  { id: 2, cliente: "João Silva ME", descricao: "Honorário Junho/2026", valor: 620.00, vencimento: "2026-06-15", recebimento: "", status: "aberto", forma: "" },
  { id: 3, cliente: "Comércio Beta S/A", descricao: "Honorário Junho/2026", valor: 3200.00, vencimento: "2026-06-05", recebimento: "", status: "vencido", forma: "" },
  { id: 4, cliente: "Gama Serviços Eireli", descricao: "Serviço Avulso - Abertura Filial", valor: 1500.00, vencimento: "2026-06-20", recebimento: "", status: "aberto", forma: "" },
  { id: 5, cliente: "Maria Souza CPF", descricao: "Declaração IR 2026", valor: 450.00, vencimento: "2026-05-20", recebimento: "2026-05-18", status: "recebido", forma: "Transferência" },
];

const emptyForm = { cliente: "", descricao: "", valor: "", vencimento: "", recebimento: "", status: "aberto", forma: "" };

const ContasReceber = () => {
  const classes = useStyles();
  const [records, setRecords] = useState(MOCK);
  const [search, setSearch] = useState("");
  const [loading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fmt = (v) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const filtered = useMemo(() =>
    records.filter((r) =>
      r.cliente.toLowerCase().includes(search.toLowerCase()) ||
      r.descricao.toLowerCase().includes(search.toLowerCase())
    ), [records, search]);

  const totalAberto = records.filter((r) => r.status === "aberto").reduce((s, r) => s + r.valor, 0);
  const totalRecebido = records.filter((r) => r.status === "recebido").reduce((s, r) => s + r.valor, 0);
  const totalVencido = records.filter((r) => r.status === "vencido").reduce((s, r) => s + r.valor, 0);

  const handleOpen = (rec = null) => {
    if (rec) { setForm({ ...rec, valor: String(rec.valor) }); setEditingId(rec.id); }
    else { setForm(emptyForm); setEditingId(null); }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.cliente || !form.valor) { toast.error("Preencha os campos obrigatórios"); return; }
    const val = { ...form, valor: parseFloat(form.valor) || 0 };
    if (editingId) {
      setRecords((p) => p.map((r) => r.id === editingId ? { ...val, id: editingId } : r));
      toast.success("Conta atualizada!");
    } else {
      setRecords((p) => [...p, { ...val, id: Date.now() }]);
      toast.success("Conta a receber cadastrada!");
    }
    setDialogOpen(false);
  };

  const handleReceber = (rec) => {
    setRecords((p) => p.map((r) => r.id === rec.id ? { ...r, status: "recebido", recebimento: new Date().toISOString().split("T")[0] } : r));
    toast.success(`Recebimento de ${fmt(rec.valor)} registrado!`);
  };

  const handleDelete = () => {
    setRecords((p) => p.filter((r) => r.id !== deleteTarget.id));
    toast.success("Registro excluído!");
    setConfirmOpen(false); setDeleteTarget(null);
  };

  const rowColor = (status) => {
    if (status === "vencido") return "#fff8f8";
    if (status === "recebido") return "#f8fff8";
    return "transparent";
  };

  return (
    <MainContainer>
      <Box style={{ height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
        <Box className={classes.header}>
          <Typography variant="h5" style={{ fontWeight: 600 }}>Contas a Receber</Typography>
          <Button variant="contained" className={classes.addButton} startIcon={<AddIcon />} onClick={() => handleOpen()}>
            Nova Conta
          </Button>
        </Box>

        <Box className={classes.summaryCards}>
          {[
            { label: "Em Aberto", value: fmt(totalAberto), color: "#e65100" },
            { label: "Recebido (período)", value: fmt(totalRecebido), color: "#2e7d32" },
            { label: "Vencido", value: fmt(totalVencido), color: "#c62828" },
            { label: "Total Geral", value: fmt(totalAberto + totalRecebido + totalVencido), color: "#0596cd" },
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
              placeholder="Buscar cliente ou descrição..." variant="outlined" size="small" style={{ flex: 1, minWidth: 260 }}
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
                  {["Cliente", "Descrição", "Valor", "Vencimento", "Recebimento", "Forma", "Status", "Ações"].map((h) => (
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
                      <AccountIcon style={{ fontSize: 48, opacity: 0.2 }} />
                      <Typography color="textSecondary">Nenhuma conta encontrada</Typography>
                    </Box>
                  </TableCell></TableRow>
                ) : filtered.map((r) => {
                  const s = STATUS_CHIP[r.status] || { label: r.status, color: "default" };
                  return (
                    <TableRow key={r.id} hover style={{ backgroundColor: rowColor(r.status) }}>
                      <TableCell style={{ fontWeight: 500 }}>{r.cliente}</TableCell>
                      <TableCell>{r.descricao}</TableCell>
                      <TableCell><strong style={{ color: r.status === "recebido" ? "#2e7d32" : "#0596cd" }}>{fmt(r.valor)}</strong></TableCell>
                      <TableCell style={{ color: r.status === "vencido" ? "#c62828" : "inherit", fontWeight: r.status === "vencido" ? 700 : 400 }}>{r.vencimento}</TableCell>
                      <TableCell>{r.recebimento || "-"}</TableCell>
                      <TableCell>{r.forma || "-"}</TableCell>
                      <TableCell><Chip label={s.label} size="small" color={s.color} /></TableCell>
                      <TableCell>
                        {["aberto", "vencido"].includes(r.status) && (
                          <Tooltip title="Marcar como Recebido">
                            <IconButton size="small" onClick={() => handleReceber(r)} style={{ color: "#2e7d32" }}>
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Editar"><IconButton size="small" color="primary" onClick={() => handleOpen(r)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Excluir"><IconButton size="small" color="secondary" onClick={() => { setDeleteTarget(r); setConfirmOpen(true); }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Editar Conta a Receber" : "Nova Conta a Receber"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: 4 }}>
            <Grid item xs={12}><TextField label="Cliente *" fullWidth variant="outlined" size="small" value={form.cliente} onChange={(e) => setForm((p) => ({ ...p, cliente: e.target.value }))} /></Grid>
            <Grid item xs={12}><TextField label="Descrição" fullWidth variant="outlined" size="small" value={form.descricao} onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))} /></Grid>
            <Grid item xs={6}><TextField label="Valor (R$) *" fullWidth variant="outlined" size="small" type="number" value={form.valor} onChange={(e) => setForm((p) => ({ ...p, valor: e.target.value }))} /></Grid>
            <Grid item xs={6}><TextField label="Vencimento" fullWidth variant="outlined" size="small" type="date" InputLabelProps={{ shrink: true }} value={form.vencimento} onChange={(e) => setForm((p) => ({ ...p, vencimento: e.target.value }))} /></Grid>
            <Grid item xs={6}><TextField label="Data Recebimento" fullWidth variant="outlined" size="small" type="date" InputLabelProps={{ shrink: true }} value={form.recebimento} onChange={(e) => setForm((p) => ({ ...p, recebimento: e.target.value }))} /></Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel>Forma de Recebimento</InputLabel>
                <Select value={form.forma} onChange={(e) => setForm((p) => ({ ...p, forma: e.target.value }))} label="Forma de Recebimento">
                  {["PIX", "Transferência", "Boleto", "Dinheiro", "Cartão", "Cheque"].map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} label="Status">
                  {Object.entries(STATUS_CHIP).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
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

      <ConfirmationModal title="Excluir Registro" open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete}>
        Tem certeza que deseja excluir esta conta de <strong>{deleteTarget?.cliente}</strong>?
      </ConfirmationModal>
    </MainContainer>
  );
};

export default ContasReceber;
