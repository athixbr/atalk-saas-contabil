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
  CheckCircle as CheckIcon, CreditCard as CreditIcon,
} from "@material-ui/icons";
import MainContainer from "../../../components/MainContainer";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing(2) },
  addButton: { background: "linear-gradient(135deg, #c62828 0%, #8e0000 100%)", color: "#fff", "&:hover": { background: "linear-gradient(135deg, #8e0000 0%, #6a0000 100%)" } },
  paper: { padding: theme.spacing(2), borderRadius: 16, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  summaryCards: { display: "flex", gap: theme.spacing(2), marginBottom: theme.spacing(2), flexWrap: "wrap" },
  card: { flex: 1, minWidth: 150, padding: theme.spacing(2), borderRadius: 12, backgroundColor: "#f7f9fc", border: "1px solid #e0e0e0" },
  cardValue: { fontSize: 22, fontWeight: 700 },
  toolbar: { display: "flex", gap: theme.spacing(1), marginBottom: theme.spacing(1.5), flexWrap: "wrap", alignItems: "center" },
}));

const STATUS_CHIP = {
  aberto: { label: "Em Aberto", color: "secondary" },
  pago: { label: "Pago", color: "primary" },
  vencido: { label: "Vencido", color: "default" },
  agendado: { label: "Agendado", color: "secondary" },
  cancelado: { label: "Cancelado", color: "default" },
};

const CATEGORIAS = ["Aluguel", "Folha de Pagamento", "Impostos", "Fornecedor", "Serviços", "Software/TI", "Marketing", "Outros"];

const MOCK = [
  { id: 1, fornecedor: "Locadora Escritórios Ltda", descricao: "Aluguel Junho/2026", categoria: "Aluguel", valor: 4500.00, vencimento: "2026-06-05", pagamento: "2026-06-05", status: "pago", forma: "Transferência" },
  { id: 2, fornecedor: "Receita Federal", descricao: "DAS Simples Nacional Jun/2026", categoria: "Impostos", valor: 1230.00, vencimento: "2026-06-20", pagamento: "", status: "aberto", forma: "" },
  { id: 3, fornecedor: "Folha de Pagamento", descricao: "Salários Junho/2026", categoria: "Folha de Pagamento", valor: 18500.00, vencimento: "2026-06-05", pagamento: "2026-06-05", status: "pago", forma: "PIX" },
  { id: 4, fornecedor: "Google Workspace", descricao: "Licenças - Julho/2026", categoria: "Software/TI", valor: 320.00, vencimento: "2026-07-01", pagamento: "", status: "agendado", forma: "Cartão" },
  { id: 5, fornecedor: "Fornecedor XYZ", descricao: "Material de escritório", categoria: "Outros", valor: 280.00, vencimento: "2026-05-30", pagamento: "", status: "vencido", forma: "" },
];

const emptyForm = { fornecedor: "", descricao: "", categoria: "", valor: "", vencimento: "", pagamento: "", status: "aberto", forma: "" };

const ContasPagar = () => {
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
      r.fornecedor.toLowerCase().includes(search.toLowerCase()) ||
      r.descricao.toLowerCase().includes(search.toLowerCase()) ||
      r.categoria.toLowerCase().includes(search.toLowerCase())
    ), [records, search]);

  const totalAberto = records.filter((r) => ["aberto", "agendado"].includes(r.status)).reduce((s, r) => s + r.valor, 0);
  const totalPago = records.filter((r) => r.status === "pago").reduce((s, r) => s + r.valor, 0);
  const totalVencido = records.filter((r) => r.status === "vencido").reduce((s, r) => s + r.valor, 0);

  const handleOpen = (rec = null) => {
    if (rec) { setForm({ ...rec, valor: String(rec.valor) }); setEditingId(rec.id); }
    else { setForm(emptyForm); setEditingId(null); }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.fornecedor || !form.valor) { toast.error("Preencha os campos obrigatórios"); return; }
    const val = { ...form, valor: parseFloat(form.valor) || 0 };
    if (editingId) {
      setRecords((p) => p.map((r) => r.id === editingId ? { ...val, id: editingId } : r));
      toast.success("Conta atualizada!");
    } else {
      setRecords((p) => [...p, { ...val, id: Date.now() }]);
      toast.success("Conta a pagar cadastrada!");
    }
    setDialogOpen(false);
  };

  const handlePagar = (rec) => {
    setRecords((p) => p.map((r) => r.id === rec.id ? { ...r, status: "pago", pagamento: new Date().toISOString().split("T")[0] } : r));
    toast.success(`Pagamento de ${fmt(rec.valor)} registrado!`);
  };

  const handleDelete = () => {
    setRecords((p) => p.filter((r) => r.id !== deleteTarget.id));
    toast.success("Registro excluído!");
    setConfirmOpen(false); setDeleteTarget(null);
  };

  const rowColor = (status) => {
    if (status === "vencido") return "#fff8f8";
    if (status === "pago") return "#f8fff8";
    if (status === "agendado") return "#f3f8ff";
    return "transparent";
  };

  return (
    <MainContainer>
      <Box style={{ height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
        <Box className={classes.header}>
          <Typography variant="h5" style={{ fontWeight: 600 }}>Contas a Pagar</Typography>
          <Button variant="contained" className={classes.addButton} startIcon={<AddIcon />} onClick={() => handleOpen()}>
            Nova Conta
          </Button>
        </Box>

        <Box className={classes.summaryCards}>
          {[
            { label: "Em Aberto / Agendado", value: fmt(totalAberto), color: "#e65100" },
            { label: "Pago (período)", value: fmt(totalPago), color: "#2e7d32" },
            { label: "Vencido (em atraso)", value: fmt(totalVencido), color: "#c62828" },
            { label: "Total Comprometido", value: fmt(totalAberto + totalVencido), color: "#6a1b9a" },
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
              placeholder="Buscar fornecedor, descrição ou categoria..." variant="outlined" size="small" style={{ flex: 1, minWidth: 300 }}
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
                  {["Fornecedor", "Descrição", "Categoria", "Valor", "Vencimento", "Pagamento", "Forma", "Status", "Ações"].map((h) => (
                    <TableCell key={h} style={{ fontWeight: 700, backgroundColor: "#f5f5f5", fontSize: 12 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={9} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={9} align="center">
                    <Box style={{ padding: 32, textAlign: "center" }}>
                      <CreditIcon style={{ fontSize: 48, opacity: 0.2 }} />
                      <Typography color="textSecondary">Nenhuma conta encontrada</Typography>
                    </Box>
                  </TableCell></TableRow>
                ) : filtered.map((r) => {
                  const s = STATUS_CHIP[r.status] || { label: r.status, color: "default" };
                  return (
                    <TableRow key={r.id} hover style={{ backgroundColor: rowColor(r.status) }}>
                      <TableCell style={{ fontWeight: 500 }}>{r.fornecedor}</TableCell>
                      <TableCell>{r.descricao}</TableCell>
                      <TableCell><Chip label={r.categoria || "-"} size="small" variant="outlined" /></TableCell>
                      <TableCell><strong style={{ color: r.status === "pago" ? "#2e7d32" : "#c62828" }}>{fmt(r.valor)}</strong></TableCell>
                      <TableCell style={{ color: r.status === "vencido" ? "#c62828" : "inherit", fontWeight: r.status === "vencido" ? 700 : 400 }}>{r.vencimento}</TableCell>
                      <TableCell>{r.pagamento || "-"}</TableCell>
                      <TableCell>{r.forma || "-"}</TableCell>
                      <TableCell><Chip label={s.label} size="small" color={s.color} /></TableCell>
                      <TableCell>
                        {["aberto", "vencido", "agendado"].includes(r.status) && (
                          <Tooltip title="Registrar Pagamento">
                            <IconButton size="small" onClick={() => handlePagar(r)} style={{ color: "#2e7d32" }}>
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
        <DialogTitle>{editingId ? "Editar Conta a Pagar" : "Nova Conta a Pagar"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: 4 }}>
            <Grid item xs={12}><TextField label="Fornecedor / Credor *" fullWidth variant="outlined" size="small" value={form.fornecedor} onChange={(e) => setForm((p) => ({ ...p, fornecedor: e.target.value }))} /></Grid>
            <Grid item xs={12}><TextField label="Descrição" fullWidth variant="outlined" size="small" value={form.descricao} onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))} /></Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel>Categoria</InputLabel>
                <Select value={form.categoria} onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value }))} label="Categoria">
                  {CATEGORIAS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}><TextField label="Valor (R$) *" fullWidth variant="outlined" size="small" type="number" value={form.valor} onChange={(e) => setForm((p) => ({ ...p, valor: e.target.value }))} /></Grid>
            <Grid item xs={6}><TextField label="Vencimento" fullWidth variant="outlined" size="small" type="date" InputLabelProps={{ shrink: true }} value={form.vencimento} onChange={(e) => setForm((p) => ({ ...p, vencimento: e.target.value }))} /></Grid>
            <Grid item xs={6}><TextField label="Data Pagamento" fullWidth variant="outlined" size="small" type="date" InputLabelProps={{ shrink: true }} value={form.pagamento} onChange={(e) => setForm((p) => ({ ...p, pagamento: e.target.value }))} /></Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel>Forma de Pagamento</InputLabel>
                <Select value={form.forma} onChange={(e) => setForm((p) => ({ ...p, forma: e.target.value }))} label="Forma de Pagamento">
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
        Tem certeza que deseja excluir esta conta de <strong>{deleteTarget?.fornecedor}</strong>?
      </ConfirmationModal>
    </MainContainer>
  );
};

export default ContasPagar;
