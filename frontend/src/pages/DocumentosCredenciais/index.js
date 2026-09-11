import React, { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  makeStyles,
  MenuItem,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Visibility as VisibilityIcon,
} from "@material-ui/icons";
import { toast } from "react-toastify";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  mainContainer: { display: "flex", flexDirection: "column", height: "100%", padding: theme.spacing(3), boxSizing: "border-box" },
  paper: { flex: 1, padding: theme.spacing(2), overflow: "auto" },
  actions: { display: "flex", gap: theme.spacing(1) },
  channelRow: { display: "flex", gap: theme.spacing(2), flexWrap: "wrap", marginTop: theme.spacing(1) },
}));

const defaultAccess = { clienteId: "", tipoContaId: "", usuario: "", senha: "", observacoes: "", doisFatoresAtivo: false, ativo: true };
const defaultCertificate = { clienteId: "", password: "", notificarEmail: true, notificarWhatsapp: false, lembretesDias: "45,30,15,5" };
const formatDate = (value) => (value ? new Date(value).toLocaleDateString("pt-BR") : "-");

const DocumentosCredenciais = () => {
  const classes = useStyles();
  const [tab, setTab] = useState(0);
  const [clientes, setClientes] = useState([]);
  const [acessos, setAcessos] = useState([]);
  const [certificados, setCertificados] = useState([]);
  const [tiposConta, setTiposConta] = useState([]);
  const [accessOpen, setAccessOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);
  const [accessForm, setAccessForm] = useState(defaultAccess);
  const [certForm, setCertForm] = useState(defaultCertificate);
  const [editingAccess, setEditingAccess] = useState(null);
  const [editingCert, setEditingCert] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);

  const loadData = async () => {
    try {
      const [{ data: clientesData }, { data: acessosData }, { data: certificadosData }, { data: tiposContaData }] = await Promise.all([
        api.get("/clientes", { params: { limit: 9999 } }),
        api.get("/documentos/acessos"),
        api.get("/certidoes/certificado"),
        api.get("/parametros/tipoconta"),
      ]);
      setClientes(clientesData.clientes || []);
      setAcessos(acessosData || []);
      setCertificados(certificadosData || []);
      setTiposConta(tiposContaData || []);
    } catch (err) {
      toastError(err);
    }
  };

  useEffect(() => { loadData(); }, []);

  const lembretesArray = (value) => String(value || "45,30,15,5").split(",").map((item) => Number(item.trim())).filter(Boolean);

  const saveAccess = async () => {
    try {
      if (editingAccess) await api.put(`/documentos/acessos/${editingAccess.id}`, accessForm);
      else await api.post("/documentos/acessos", accessForm);
      toast.success("Acesso Gov salvo com sucesso.");
      setAccessOpen(false);
      setEditingAccess(null);
      setAccessForm(defaultAccess);
      loadData();
    } catch (err) {
      toastError(err);
    }
  };

  const saveCertificate = async () => {
    try {
      if (editingCert) {
        await api.put(`/certidoes/certificado/${editingCert.id}`, { ...certForm, lembretesDias: lembretesArray(certForm.lembretesDias) });
      } else {
        if (!certificateFile) return toast.error("Selecione o arquivo do certificado.");
        const formData = new FormData();
        formData.append("certificado", certificateFile);
        Object.entries({ ...certForm, lembretesDias: JSON.stringify(lembretesArray(certForm.lembretesDias)) }).forEach(([key, value]) => formData.append(key, value));
        await api.post("/certidoes/certificado", formData);
      }
      toast.success("Certificado salvo com sucesso.");
      setCertOpen(false);
      setEditingCert(null);
      setCertificateFile(null);
      setCertForm(defaultCertificate);
      loadData();
    } catch (err) {
      toastError(err);
    }
  };

  const deleteAccess = async (id) => {
    if (!window.confirm("Excluir este acesso Gov?")) return;
    await api.delete(`/documentos/acessos/${id}`);
    toast.success("Acesso removido.");
    loadData();
  };

  const deleteCertificate = async (id) => {
    if (!window.confirm("Excluir este certificado?")) return;
    await api.delete(`/certidoes/certificado/${id}`);
    toast.success("Certificado removido.");
    loadData();
  };

  const showCertPassword = async (certificado) => {
    const { data } = await api.get(`/certidoes/certificado/${certificado.id}/senha`);
    toast.info(`Senha: ${data.password}`);
  };

  const sendCertificateNotice = async (certificado) => {
    await api.post(`/certidoes/certificado/${certificado.id}/enviar-aviso`, { canais: ["email", "whatsapp"] });
    toast.success("Aviso enviado conforme os canais disponíveis.");
  };

  const openEditAccess = (acesso) => {
    setEditingAccess(acesso);
    setAccessForm({
      clienteId: acesso.clienteId,
      tipoContaId: acesso.tipoContaId || "",
      usuario: acesso.usuario,
      senha: acesso.senha || "",
      observacoes: acesso.observacoes || "",
      doisFatoresAtivo: Boolean(acesso.doisFatoresAtivo),
      ativo: acesso.ativo,
    });
    setAccessOpen(true);
  };

  const openEditCert = (certificado) => {
    setEditingCert(certificado);
    setCertForm({
      clienteId: certificado.clienteId || "",
      password: "",
      notificarEmail: Boolean(certificado.notificarEmail),
      notificarWhatsapp: Boolean(certificado.notificarWhatsapp),
      lembretesDias: (certificado.lembretesDias || [45, 30, 15, 5]).join(","),
    });
    setCertOpen(true);
  };

  return (
    <div className={classes.mainContainer}>
      <MainHeader>
        <Title>Credenciais e Certificados</Title>
        <MainHeaderButtonsWrapper>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => (tab === 0 ? setAccessOpen(true) : setCertOpen(true))}>Novo</Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.paper}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} indicatorColor="primary" textColor="primary">
          <Tab label="Contas" />
          <Tab label="Certificados Digitais" />
        </Tabs>
        {tab === 0 && (
          <TableContainer><Table><TableHead><TableRow><TableCell>Cliente</TableCell><TableCell>Tipo</TableCell><TableCell>Usuário</TableCell><TableCell>Senha</TableCell><TableCell>2FA</TableCell><TableCell>Observações</TableCell><TableCell>Ações</TableCell></TableRow></TableHead><TableBody>
            {acessos.map((acesso) => <TableRow key={acesso.id}><TableCell>{acesso.cliente?.nome || "-"}</TableCell><TableCell>{acesso.tipoConta?.nome || acesso.tipo || "-"}</TableCell><TableCell>{acesso.usuario}</TableCell><TableCell>{acesso.senha}</TableCell><TableCell>{acesso.doisFatoresAtivo ? "Ativo" : "Inativo"}</TableCell><TableCell>{acesso.observacoes || "-"}</TableCell><TableCell className={classes.actions}><Tooltip title="Editar"><IconButton size="small" onClick={() => openEditAccess(acesso)}><EditIcon /></IconButton></Tooltip><Tooltip title="Excluir"><IconButton size="small" onClick={() => deleteAccess(acesso.id)}><DeleteIcon /></IconButton></Tooltip></TableCell></TableRow>)}
          </TableBody></Table></TableContainer>
        )}
        {tab === 1 && (
          <TableContainer><Table><TableHead><TableRow><TableCell>Cliente</TableCell><TableCell>Arquivo</TableCell><TableCell>Titular</TableCell><TableCell>Criação</TableCell><TableCell>Validade</TableCell><TableCell>Lembretes</TableCell><TableCell>Ações</TableCell></TableRow></TableHead><TableBody>
            {certificados.map((certificado) => <TableRow key={certificado.id}><TableCell>{certificado.cliente?.nome || "-"}</TableCell><TableCell>{certificado.nomeArquivo}</TableCell><TableCell>{certificado.titular || "-"}</TableCell><TableCell>{formatDate(certificado.createdAt || certificado.dataUpload)}</TableCell><TableCell>{formatDate(certificado.validade)}</TableCell><TableCell>{(certificado.lembretesDias || []).map((dia) => <Chip key={dia} size="small" label={`${dia}d`} />)}</TableCell><TableCell className={classes.actions}><Tooltip title="Ver senha"><IconButton size="small" onClick={() => showCertPassword(certificado)}><VisibilityIcon /></IconButton></Tooltip><Tooltip title="Editar"><IconButton size="small" onClick={() => openEditCert(certificado)}><EditIcon /></IconButton></Tooltip><Tooltip title="Enviar aviso"><IconButton size="small" onClick={() => sendCertificateNotice(certificado)}><SendIcon /></IconButton></Tooltip><Tooltip title="Excluir"><IconButton size="small" onClick={() => deleteCertificate(certificado.id)}><DeleteIcon /></IconButton></Tooltip></TableCell></TableRow>)}
          </TableBody></Table></TableContainer>
        )}
      </Paper>
      <Dialog open={accessOpen} onClose={() => setAccessOpen(false)} maxWidth="sm" fullWidth><DialogTitle>{editingAccess ? "Editar Conta" : "Nova Conta"}</DialogTitle><DialogContent><Grid container spacing={2}><Grid item xs={12}><TextField select fullWidth label="Cliente" value={accessForm.clienteId} onChange={(e) => setAccessForm({ ...accessForm, clienteId: e.target.value })}>{clientes.map((cliente) => <MenuItem key={cliente.id} value={cliente.id}>{cliente.nome}</MenuItem>)}</TextField></Grid><Grid item xs={12}><TextField select fullWidth label="Tipo de conta" value={accessForm.tipoContaId} onChange={(e) => setAccessForm({ ...accessForm, tipoContaId: e.target.value })}>{tiposConta.map((tipo) => <MenuItem key={tipo.id} value={tipo.id}>{tipo.nome}</MenuItem>)}</TextField></Grid><Grid item xs={12} sm={6}><TextField fullWidth label="Usuário" value={accessForm.usuario} onChange={(e) => setAccessForm({ ...accessForm, usuario: e.target.value })} /></Grid><Grid item xs={12} sm={6}><TextField fullWidth label="Senha" value={accessForm.senha} onChange={(e) => setAccessForm({ ...accessForm, senha: e.target.value })} /></Grid><Grid item xs={12}><FormControlLabel control={<Checkbox checked={accessForm.doisFatoresAtivo} onChange={(e) => setAccessForm({ ...accessForm, doisFatoresAtivo: e.target.checked })} />} label="Autenticação em dois fatores ativa" /></Grid><Grid item xs={12}><TextField fullWidth multiline rows={3} label="Observações" value={accessForm.observacoes || ""} onChange={(e) => setAccessForm({ ...accessForm, observacoes: e.target.value })} /></Grid></Grid></DialogContent><DialogActions><Button onClick={() => setAccessOpen(false)}>Cancelar</Button><Button color="primary" variant="contained" onClick={saveAccess}>Salvar</Button></DialogActions></Dialog>
      <Dialog open={certOpen} onClose={() => setCertOpen(false)} maxWidth="sm" fullWidth><DialogTitle>{editingCert ? "Editar Certificado" : "Novo Certificado"}</DialogTitle><DialogContent><Grid container spacing={2}><Grid item xs={12}><TextField select fullWidth label="Cliente" value={certForm.clienteId} onChange={(e) => setCertForm({ ...certForm, clienteId: e.target.value })}>{clientes.map((cliente) => <MenuItem key={cliente.id} value={cliente.id}>{cliente.nome}</MenuItem>)}</TextField></Grid>{!editingCert && <Grid item xs={12}><input type="file" accept=".pfx,.p12" onChange={(e) => setCertificateFile(e.target.files[0])} /></Grid>}<Grid item xs={12}><TextField fullWidth label="Senha do certificado" value={certForm.password} onChange={(e) => setCertForm({ ...certForm, password: e.target.value })} /></Grid><Grid item xs={12}><Typography variant="subtitle2">Avisar cliente sobre vencimento</Typography><div className={classes.channelRow}><FormControlLabel control={<Checkbox checked={certForm.notificarEmail} onChange={(e) => setCertForm({ ...certForm, notificarEmail: e.target.checked })} />} label="E-mail" /><FormControlLabel control={<Checkbox checked={certForm.notificarWhatsapp} onChange={(e) => setCertForm({ ...certForm, notificarWhatsapp: e.target.checked })} />} label="WhatsApp" /></div></Grid><Grid item xs={12}><TextField fullWidth label="Lembretes em dias antes do vencimento" value={certForm.lembretesDias} onChange={(e) => setCertForm({ ...certForm, lembretesDias: e.target.value })} helperText="Ex.: 45, 30, 15, 5" /></Grid></Grid></DialogContent><DialogActions><Button onClick={() => setCertOpen(false)}>Cancelar</Button><Button color="primary" variant="contained" onClick={saveCertificate}>Salvar</Button></DialogActions></Dialog>
    </div>
  );
};

export default DocumentosCredenciais;
