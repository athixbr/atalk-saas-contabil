import React, { useEffect, useMemo, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import {
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
} from "@material-ui/icons";
import { toast } from "react-toastify";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import api from "../../services/api";

const emptyField = {
  nome: "",
  tipo: "text",
  regex: "",
  obrigatorio: true,
  instrucao: "",
  descricao: "",
};

const emptyForm = {
  nome: "",
  tipo: "",
  descricao: "",
  instrucoesIa: "",
  ativo: true,
  campos: [{ ...emptyField }],
  validacoes: {},
  exemplos: {},
};

const fieldTypes = [
  { value: "text", label: "Texto" },
  { value: "number", label: "Numero" },
  { value: "currency", label: "Valor" },
  { value: "date", label: "Data" },
  { value: "cpf", label: "CPF" },
  { value: "cnpj", label: "CNPJ" },
  { value: "barcode", label: "Codigo de barras" },
  { value: "email", label: "E-mail" },
];

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(3),
    width: "100%",
    boxSizing: "border-box",
  },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(3),
    overflowY: "auto",
    width: "100%",
    boxSizing: "border-box",
    ...theme.scrollbarStyles,
  },
  toolbar: {
    display: "flex",
    gap: theme.spacing(2),
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  search: {
    maxWidth: 460,
    flex: 1,
  },
  actionButtons: {
    display: "flex",
    justifyContent: "center",
    gap: theme.spacing(1),
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(5),
    color: theme.palette.text.secondary,
  },
  dialogContent: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    paddingTop: theme.spacing(2),
  },
  rowFields: {
    display: "grid",
    gridTemplateColumns: "1.1fr 150px 1.3fr 120px 48px",
    gap: theme.spacing(1),
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
      gridTemplateColumns: "1fr",
    },
  },
  fieldBlock: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    padding: theme.spacing(2),
  },
  uploadBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    border: `1px dashed ${theme.palette.divider}`,
    borderRadius: 8,
    padding: theme.spacing(2),
  },
  preview: {
    background: theme.palette.background.default,
    borderRadius: 8,
    padding: theme.spacing(2),
    maxHeight: 180,
    overflow: "auto",
    whiteSpace: "pre-wrap",
    fontFamily: "monospace",
    fontSize: 12,
  },
}));

const normalizeTipo = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const ModelosLeitura = () => {
  const classes = useStyles();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [analysisInfo, setAnalysisInfo] = useState(null);

  const filteredTemplates = useMemo(() => templates, [templates]);

  useEffect(() => {
    loadTemplates();
  }, [searchParam]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/templates-leitura", {
        params: { searchParam },
      });
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Erro ao carregar modelos de leitura");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setAnalysisInfo(null);
    setOpenDialog(true);
  };

  const openEdit = (template) => {
    setEditing(template);
    setForm({
      ...emptyForm,
      ...template,
      campos: Array.isArray(template.campos) && template.campos.length
        ? template.campos
        : [{ ...emptyField }],
      validacoes: template.validacoes || {},
      exemplos: template.exemplos || {},
    });
    setAnalysisInfo(null);
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setEditing(null);
    setForm(emptyForm);
    setAnalysisInfo(null);
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      tipo: field === "nome" && !editing && !prev.tipo ? normalizeTipo(value) : prev.tipo,
    }));
  };

  const updateCampo = (index, field, value) => {
    setForm((prev) => {
      const campos = [...prev.campos];
      campos[index] = { ...campos[index], [field]: value };
      return { ...prev, campos };
    });
  };

  const addCampo = () => {
    setForm((prev) => ({ ...prev, campos: [...prev.campos, { ...emptyField }] }));
  };

  const removeCampo = (index) => {
    setForm((prev) => ({
      ...prev,
      campos: prev.campos.length === 1
        ? [{ ...emptyField }]
        : prev.campos.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const validateForm = () => {
    if (!form.nome.trim()) {
      toast.error("Informe o titulo do modelo");
      return false;
    }

    if (!form.tipo.trim()) {
      toast.error("Informe o tipo interno do modelo");
      return false;
    }

    const invalidField = form.campos.find((campo) => !campo.nome.trim() || !campo.regex.trim());
    if (invalidField) {
      toast.error("Todos os campos precisam de nome e regra de captura");
      return false;
    }

    return true;
  };

  const saveTemplate = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        ...form,
        tipo: normalizeTipo(form.tipo),
        campos: form.campos.map((campo) => ({
          ...campo,
          nome: normalizeTipo(campo.nome),
        })),
      };

      if (editing) {
        await api.put(`/templates-leitura/${editing.id}`, payload);
        toast.success("Modelo atualizado com sucesso");
      } else {
        await api.post("/templates-leitura", payload);
        toast.success("Modelo criado com sucesso");
      }

      closeDialog();
      loadTemplates();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao salvar modelo");
    } finally {
      setSaving(false);
    }
  };

  const deleteTemplate = async (template) => {
    if (!window.confirm(`Deseja excluir o modelo "${template.nome}"?`)) return;

    try {
      await api.delete(`/templates-leitura/${template.id}`);
      toast.success("Modelo removido com sucesso");
      loadTemplates();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao remover modelo");
    }
  };

  const uploadEspelho = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const data = new FormData();
    data.append("file", file);

    setUploading(true);
    try {
      if (editing) {
        const response = await api.post(`/templates-leitura/${editing.id}/espelho`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Documento espelho lido com sucesso");
        setForm((prev) => ({ ...prev, ...response.data.template }));
        setAnalysisInfo(response.data.extraction || null);
        loadTemplates();
      } else {
        const response = await api.post("/templates-leitura/analisar-arquivo", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const suggestion = response.data.suggestion || {};
        toast.success("Arquivo lido e cadastro pre-preenchido");
        setForm((prev) => ({
          ...prev,
          ...suggestion,
          campos: Array.isArray(suggestion.campos) && suggestion.campos.length
            ? suggestion.campos
            : prev.campos,
          ativo: true,
        }));
        setAnalysisInfo(response.data.extraction || null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao ler documento espelho");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={classes.mainContainer}>
      <MainHeader>
        <Title>Modelos de Leitura</Title>
        <MainHeaderButtonsWrapper>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={openCreate}>
            Novo Modelo
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <div className={classes.toolbar}>
          <TextField
            className={classes.search}
            variant="outlined"
            size="small"
            placeholder="Buscar por titulo, tipo ou descricao..."
            value={searchParam}
            onChange={(event) => setSearchParam(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </div>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : filteredTemplates.length === 0 ? (
          <Box className={classes.emptyState}>
            <Typography variant="h6">Nenhum modelo cadastrado</Typography>
            <Typography>Crie modelos para identificar e extrair dados de guias, comprovantes e documentos fiscais.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Titulo</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Campos</TableCell>
                  <TableCell>Espelho</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Acoes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <Typography variant="body1" style={{ fontWeight: 500 }}>
                        {template.nome}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {template.descricao || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>{template.tipo}</TableCell>
                    <TableCell>{Array.isArray(template.campos) ? template.campos.length : 0}</TableCell>
                    <TableCell>{template.arquivoEspelhoNome || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={template.ativo ? "primary" : "default"}
                        label={template.ativo ? "Ativo" : "Inativo"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <div className={classes.actionButtons}>
                        <IconButton size="small" color="primary" onClick={() => openEdit(template)} title="Editar">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="secondary" onClick={() => deleteTemplate(template)} title="Excluir">
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={openDialog} onClose={closeDialog} maxWidth="lg" fullWidth>
        <DialogTitle>{editing ? "Editar Modelo de Leitura" : "Novo Modelo de Leitura"}</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Box display="grid" gridTemplateColumns="1fr 260px" gridGap={16}>
            <TextField
              label="Titulo"
              variant="outlined"
              size="small"
              value={form.nome}
              onChange={(event) => updateForm("nome", event.target.value)}
            />
            <TextField
              label="Tipo interno"
              variant="outlined"
              size="small"
              value={form.tipo}
              onChange={(event) => updateForm("tipo", event.target.value)}
            />
          </Box>

          <TextField
            label="Descricao"
            variant="outlined"
            size="small"
            multiline
            minRows={2}
            value={form.descricao || ""}
            onChange={(event) => updateForm("descricao", event.target.value)}
          />

          <TextField
            label="Instrucoes para IA"
            variant="outlined"
            size="small"
            multiline
            minRows={2}
            value={form.instrucoesIa || ""}
            onChange={(event) => updateForm("instrucoesIa", event.target.value)}
          />

          <div className={classes.uploadBox}>
            <Box>
              <Typography variant="subtitle1">Arquivo para identificar e preencher</Typography>
              <Typography variant="body2" color="textSecondary">
                {form.arquivoEspelhoNome ||
                  "Envie PDF, JPG, JPEG, PNG, TIFF ou BMP para o sistema sugerir o cadastro."}
              </Typography>
              {analysisInfo?.confidence !== undefined && (
                <Typography variant="caption" color="textSecondary">
                  Confianca da leitura: {Math.round(Number(analysisInfo.confidence || 0) * 100)}%
                </Typography>
              )}
            </Box>
            <label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.tif,.tiff,.bmp,application/pdf,image/*"
                hidden
                onChange={uploadEspelho}
              />
              <Button
                component="span"
                variant="outlined"
                color="primary"
                startIcon={uploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                disabled={uploading}
              >
                {uploading ? "Lendo..." : "Enviar Arquivo"}
              </Button>
            </label>
          </div>

          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={Boolean(form.ativo)}
                onChange={(event) => updateForm("ativo", event.target.checked)}
              />
            }
            label="Modelo ativo"
          />

          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Campos para capturar</Typography>
            <Button color="primary" startIcon={<AddIcon />} onClick={addCampo}>
              Adicionar Campo
            </Button>
          </Box>

          {form.campos.map((campo, index) => (
            <div className={classes.fieldBlock} key={`${index}-${campo.nome}`}>
              <div className={classes.rowFields}>
                <TextField
                  label="Nome do campo"
                  variant="outlined"
                  size="small"
                  value={campo.nome}
                  onChange={(event) => updateCampo(index, "nome", event.target.value)}
                />
                <FormControl variant="outlined" size="small">
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={campo.tipo}
                    onChange={(event) => updateCampo(index, "tipo", event.target.value)}
                    label="Tipo"
                  >
                    {fieldTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Regra de captura"
                  variant="outlined"
                  size="small"
                  value={campo.regex}
                  onChange={(event) => updateCampo(index, "regex", event.target.value)}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      checked={Boolean(campo.obrigatorio)}
                      onChange={(event) => updateCampo(index, "obrigatorio", event.target.checked)}
                    />
                  }
                  label="Obrigatorio"
                />
                <IconButton size="small" color="secondary" onClick={() => removeCampo(index)} title="Remover campo">
                  <DeleteIcon />
                </IconButton>
              </div>
              <Box mt={1}>
                <TextField
                  fullWidth
                  label="Instrucao do campo"
                  variant="outlined"
                  size="small"
                  value={campo.instrucao || campo.descricao || ""}
                  onChange={(event) => updateCampo(index, "instrucao", event.target.value)}
                />
              </Box>
            </div>
          ))}

          {form.textoEspelho && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Previa do texto lido
              </Typography>
              <div className={classes.preview}>{String(form.textoEspelho).substring(0, 2000)}</div>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancelar</Button>
          <Button onClick={saveTemplate} color="primary" variant="contained" disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ModelosLeitura;
