import React, { useState, useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box, Paper, Typography, Button, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, Tooltip, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Select, FormControl, InputLabel,
  Grid, Divider,
} from "@material-ui/core";
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, GetApp as GetAppIcon, Refresh as RefreshIcon,
  PlayArrow as ConvertIcon, Description as DescriptionIcon,
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
  itemRow: { display: "flex", gap: theme.spacing(1), alignItems: "center", marginBottom: theme.spacing(1) },
  convertBtn: { color: "#2e7d32", borderColor: "#2e7d32", "&:hover": { backgroundColor: "#e8f5e9" } },
}));

const STATUS_CHIP = {
  rascunho: { label: "Rascunho", color: "default" },
  enviado: { label: "Enviado", color: "secondary" },
  aprovado: { label: "Aprovado", color: "primary" },
  convertido: { label: "Convertido em Tarefa", color: "primary" },
  cancelado: { label: "Cancelado", color: "default" },
};

const MOCK = [
  { id: 1, numero: "PED-001", cliente: "Empresa Alpha Ltda", descricao: "Regularização fiscal + DP anual", valor: 2500.00, data: "2026-06-01", status: "aprovado", itens: [{ desc: "Regularização Fiscal", qty: 1, valor: 1800 }, { desc: "DP Anual", qty: 1, valor: 700 }] },
  { id: 2, numero: "PED-002", cliente: "João Silva ME", descricao: "Declaração IR + Certidões (3 órgãos)", valor: 870.00, data: "2026-06-05", status: "enviado", itens: [{ desc: "Declaração IR", qty: 1, valor: 450 }, { desc: "Certidões", qty: 3, valor: 140 }] },
  { id: 3, numero: "PED-003", cliente: "Comércio Beta S/A", descricao: "Abertura de Filial", valor: 1500.00, data: "2026-06-08", status: "convertido", itens: [{ desc: "Abertura Filial", qty: 1, valor: 1500 }] },
  { id: 4, numero: "PED-004", cliente: "Gama Serviços Eireli", descricao: "Planejamento tributário", valor: 3200.00, data: "2026-06-10", status: "rascunho", itens: [{ desc: "Planejamento Tributário", qty: 1, valor: 3200 }] },
];

const emptyItem = { desc: "", qty: 1, valor: "" };
const emptyForm = { cliente: "", descricao: "", data: "", status: "rascunho", itens: [{ ...emptyItem }] };

const Pedidos = () => {
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
      r.numero.includes(search) ||
      r.descricao.toLowerCase().includes(search.toLowerCase())
    ), [records, search]);

  const totalAprovados = records.filter((r) => r.status === "aprovado").reduce((s, r) => s + r.valor, 0);

  const calcTotal = (itens) => itens.reduce((s, i) => s + (parseFloat(i.valor) || 0) * (parseInt(i.qty) || 1), 0);

  const handleOpen = (rec = null) => {
    if (rec) { setForm({ ...rec, itens: rec.itens.map((i) => ({ ...i })) }); setEditingId(rec.id); }
    else { setForm({ ...emptyForm, itens: [{ ...emptyItem }], numero: `PED-${String(records.length + 1).padStart(3, "0")}` }); setEditingId(null); }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.cliente) { toast.error("Informe o cliente"); return; }
    const total = calcTotal(form.itens);
    const rec = { ...form, valor: total, id: editingId || Date.now(), numero: form.numero || `PED-${Date.now()}` };
    if (editingId) {
      setRecords((p) => p.map((r) => r.id === editingId ? rec : r));
      toast.success("Pedido atualizado!");
    } else {
      setRecords((p) => [...p, rec]);
      toast.success("Pedido criado!");
    }
    setDialogOpen(false);
  };

  const handleConvert = (rec) => {
    setRecords((p) => p.map((r) => r.id === rec.id ? { ...r, status: "convertido" } : r));
    toast.success(`Pedido ${rec.numero} convertido em tarefa!`);
  };

  const handleAddItem = () => setForm((p) => ({ ...p, itens: [...p.itens, { ...emptyItem }] }));
  const handleRemoveItem = (idx) => setForm((p) => ({ ...p, itens: p.itens.filter((_, i) => i !== idx) }));
  const handleItemChange = (idx, field, value) =>
    setForm((p) => ({ ...p, itens: p.itens.map((it, i) => i === idx ? { ...it, [field]: value } : it) }));

  const handleDelete = () => {
    setRecords((p) => p.filter((r) => r.id !== deleteTarget.id));
    toast.success("Pedido excluído!");
    setConfirmOpen(false); setDeleteTarget(null);
  };

  return (
    <MainContainer>
      <Box style={{ height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
        <Box className={classes.header}>
          <Typography variant="h5" style={{ fontWeight: 600 }}>Pedidos / Orçamentos</Typography>
          <Button variant="contained" className={classes.addButton} startIcon={<AddIcon />} onClick={() => handleOpen()}>
            Novo Pedido
          </Button>
        </Box>

        <Box className={classes.summaryCards}>
          {[
            { label: "Aprovados (a converter)", value: fmt(totalAprovados), color: "#2e7d32" },
            { label: "Total de Pedidos", value: records.length, color: "#0596cd" },
            { label: "Convertidos em Tarefa", value: records.filter((r) => r.status === "convertido").length, color: "#6a1b9a" },
            { label: "Pendentes / Enviados", value: records.filter((r) => ["rascunho", "enviado"].includes(r.status)).length, color: "#e65100" },
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
              placeholder="Buscar por número, cliente ou descrição..." variant="outlined" size="small" style={{ flex: 1, minWidth: 300 }}
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
                  {["Nº Pedido", "Cliente", "Descrição", "Valor Total", "Data", "Status", "Ações"].map((h) => (
                    <TableCell key={h} style={{ fontWeight: 700, backgroundColor: "#f5f5f5", fontSize: 12 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center">
                    <Box style={{ padding: 32, textAlign: "center" }}>
                      <DescriptionIcon style={{ fontSize: 48, opacity: 0.2 }} />
                      <Typography color="textSecondary">Nenhum pedido encontrado</Typography>
                    </Box>
                  </TableCell></TableRow>
                ) : filtered.map((r) => {
                  const s = STATUS_CHIP[r.status] || { label: r.status, color: "default" };
                  return (
                    <TableRow key={r.id} hover>
                      <TableCell><strong>{r.numero}</strong></TableCell>
                      <TableCell>{r.cliente}</TableCell>
                      <TableCell style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.descricao}</TableCell>
                      <TableCell><strong style={{ color: "#0596cd" }}>{fmt(r.valor)}</strong></TableCell>
                      <TableCell>{r.data}</TableCell>
                      <TableCell><Chip label={s.label} size="small" color={s.color} /></TableCell>
                      <TableCell>
                        {r.status === "aprovado" && (
                          <Tooltip title="Converter em Tarefa">
                            <IconButton size="small" onClick={() => handleConvert(r)} style={{ color: "#2e7d32" }}>
                              <ConvertIcon fontSize="small" />
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

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? "Editar Pedido" : "Novo Pedido / Orçamento"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: 4 }}>
            <Grid item xs={12} sm={8}><TextField label="Cliente *" fullWidth variant="outlined" size="small" value={form.cliente} onChange={(e) => setForm((p) => ({ ...p, cliente: e.target.value }))} /></Grid>
            <Grid item xs={12} sm={4}><TextField label="Data" fullWidth variant="outlined" size="small" type="date" InputLabelProps={{ shrink: true }} value={form.data} onChange={(e) => setForm((p) => ({ ...p, data: e.target.value }))} /></Grid>
            <Grid item xs={12}><TextField label="Descrição" fullWidth variant="outlined" size="small" value={form.descricao} onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))} /></Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} label="Status">
                  {Object.entries(STATUS_CHIP).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}><Divider /><Typography variant="subtitle2" style={{ marginTop: 12, marginBottom: 8, fontWeight: 600 }}>Itens do Pedido</Typography></Grid>

            {form.itens && form.itens.map((item, idx) => (
              <Grid item xs={12} key={idx}>
                <Box className={classes.itemRow}>
                  <TextField label="Descrição do item" variant="outlined" size="small" style={{ flex: 3 }} value={item.desc} onChange={(e) => handleItemChange(idx, "desc", e.target.value)} />
                  <TextField label="Qtd" variant="outlined" size="small" style={{ width: 70 }} type="number" value={item.qty} onChange={(e) => handleItemChange(idx, "qty", e.target.value)} />
                  <TextField label="Valor unit. (R$)" variant="outlined" size="small" style={{ width: 130 }} type="number" value={item.valor} onChange={(e) => handleItemChange(idx, "valor", e.target.value)} />
                  <Typography style={{ minWidth: 90, fontWeight: 600, color: "#0596cd" }}>
                    = {fmt((parseFloat(item.valor) || 0) * (parseInt(item.qty) || 1))}
                  </Typography>
                  <IconButton size="small" color="secondary" onClick={() => handleRemoveItem(idx)} disabled={form.itens.length === 1}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Button size="small" startIcon={<AddIcon />} onClick={handleAddItem} variant="outlined" color="primary">
                Adicionar Item
              </Button>
              <Typography variant="subtitle1" style={{ float: "right", fontWeight: 700, color: "#0596cd" }}>
                Total: {fmt(calcTotal(form.itens || []))}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} color="primary" variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>

      <ConfirmationModal title="Excluir Pedido" open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete}>
        Tem certeza que deseja excluir o pedido <strong>{deleteTarget?.numero}</strong>?
      </ConfirmationModal>
    </MainContainer>
  );
};

export default Pedidos;
