import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Chip,
  Tooltip,
  InputAdornment,
  CircularProgress,
  Typography,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Divider,
  Slide,
  AppBar,
  Toolbar,
  LinearProgress,
} from "@material-ui/core";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  DragIndicator as DragIndicatorIcon,
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
} from "@material-ui/icons";
import { toast } from "react-toastify";
import api from "../../services/api";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
  searchRow: {
    display: "flex",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    alignItems: "center",
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(0.5),
  },
  ativoChip: {
    backgroundColor: "#4caf50",
    color: "white",
  },
  inativoChip: {
    backgroundColor: "#f44336",
    color: "white",
  },
  appBar: {
    position: "relative",
  },
  dialogTitle: {
    marginLeft: theme.spacing(2),
    flex: 1,
    color: "white",
  },
  formSection: {
    marginBottom: theme.spacing(3),
  },
  itemCard: {
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    transition: "opacity 0.15s, border 0.15s",
  },
  itemCardDragging: {
    opacity: 0.4,
  },
  itemCardDragOver: {
    border: `2px dashed ${theme.palette.primary.main}`,
  },
  itemHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1),
  },
  itemHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
  itemActions: {
    display: "flex",
    gap: theme.spacing(0.5),
  },
  dragHandle: {
    cursor: "grab",
    color: theme.palette.text.secondary,
    "&:active": {
      cursor: "grabbing",
    },
  },
  dialogContent: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
  },
  viewItemNumber: {
    backgroundColor: theme.palette.primary.main,
    color: "white",
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: 13,
    marginRight: theme.spacing(1),
    flexShrink: 0,
  },
  viewItemHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1),
  },
  obrigatorioChip: {
    backgroundColor: "#f44336",
    color: "white",
    height: 20,
    fontSize: "0.65rem",
  },
  fileUploadButton: {
    height: 40,
    textTransform: "none",
    borderStyle: "dashed",
  },
  selectedFileBox: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.5, 1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    minHeight: 40,
  },
  selectedFileName: {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: "0.8rem",
  },
  uploadProgressBox: {
    marginTop: theme.spacing(0.5),
  },
  uploadSuccess: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    color: "#4caf50",
    marginTop: theme.spacing(0.5),
  },
  uploadError: {
    color: "#f44336",
    marginTop: theme.spacing(0.5),
    fontSize: "0.75rem",
  },
}));

const emptyForm = {
  titulo: "",
  descricao: "",
  tipo: "padrao",
  ativo: true,
  itens: [],
};

const emptyItem = () => ({
  titulo: "",
  descricao: "",
  obrigatorio: false,
  tipo: "arquivo",
});

const detectTipoFromFile = (file) => {
  if (!file) return "texto";
  if (file.type.startsWith("image/")) return "imagem";
  if (file.type.startsWith("video/")) return "video";
  return "arquivo";
};

const ChecklistsTab = () => {
  const classes = useStyles();
  const fileInputRefs = useRef({});

  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchParam, setSearchParam] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingChecklist, setDeletingChecklist] = useState(null);

  // File upload state: { [itemIndex]: File }
  const [itemFiles, setItemFiles] = useState({});
  // Upload progress: { [itemIndex]: { progress: 0-100, uploading, done, error } }
  const [uploadState, setUploadState] = useState({});

  // Drag and drop state
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  useEffect(() => {
    loadChecklists();
  }, []);

  useEffect(() => {
    const t = setTimeout(loadChecklists, 400);
    return () => clearTimeout(t);
  }, [searchParam]);

  const loadChecklists = async () => {
    setLoading(true);
    try {
      const params = { pageSize: 999999 };
      if (searchParam) params.searchParam = searchParam;
      const { data } = await api.get("/checklists", { params });
      setChecklists(data.checklists || []);
    } catch {
      toast.error("Erro ao carregar checklists");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setItemFiles({});
    setUploadState({});
    setDialogOpen(true);
  };

  const openEdit = async (id) => {
    try {
      const { data } = await api.get(`/checklists/${id}`);
      setFormData({
        titulo: data.titulo || "",
        descricao: data.descricao || "",
        tipo: data.tipo || "padrao",
        ativo: data.ativo !== false,
        itens: data.itens || [],
      });
      setEditingId(id);
      setItemFiles({});
      setUploadState({});
      setDialogOpen(true);
    } catch {
      toast.error("Erro ao carregar checklist");
    }
  };

  const openView = async (id) => {
    try {
      const { data } = await api.get(`/checklists/${id}`);
      setViewItem(data);
      setViewDialogOpen(true);
    } catch {
      toast.error("Erro ao carregar checklist");
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
    setItemFiles({});
    setUploadState({});
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const itens = [...prev.itens];
      itens[index] = { ...itens[index], [field]: value };
      return { ...prev, itens };
    });
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      itens: [
        ...prev.itens,
        { ...emptyItem(), ordem: prev.itens.length + 1 },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => {
      const itens = prev.itens.filter((_, i) => i !== index).map((item, i) => ({
        ...item,
        ordem: i + 1,
      }));
      return { ...prev, itens };
    });
    // Remove file for this index and shift remaining
    setItemFiles((prev) => {
      const next = {};
      Object.entries(prev).forEach(([k, v]) => {
        const ki = parseInt(k);
        if (ki < index) next[ki] = v;
        else if (ki > index) next[ki - 1] = v;
      });
      return next;
    });
    setUploadState((prev) => {
      const next = {};
      Object.entries(prev).forEach(([k, v]) => {
        const ki = parseInt(k);
        if (ki < index) next[ki] = v;
        else if (ki > index) next[ki - 1] = v;
      });
      return next;
    });
  };

  const handleFileSelect = (index, file) => {
    setItemFiles((prev) => ({ ...prev, [index]: file }));
    setUploadState((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleRemoveFile = (index) => {
    setItemFiles((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    setUploadState((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) setDragOverIndex(index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    const from = dragIndex;
    const to = dropIndex;

    setFormData((prev) => {
      const itens = [...prev.itens];
      const [removed] = itens.splice(from, 1);
      itens.splice(to, 0, removed);
      itens.forEach((item, i) => { item.ordem = i + 1; });
      return { ...prev, itens };
    });

    // Reorder itemFiles
    setItemFiles((prev) => {
      const total = Math.max(from, to) + 1;
      const arr = Array.from({ length: total }, (_, i) => prev[i] ?? null);
      const [removed] = arr.splice(from, 1);
      arr.splice(to, 0, removed);
      const next = {};
      arr.forEach((file, i) => { if (file != null) next[i] = file; });
      return next;
    });

    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleSave = async () => {
    if (!formData.titulo.trim()) {
      toast.error("O título é obrigatório");
      return;
    }

    setSaving(true);
    try {
      // Auto-detect tipo dos itens baseado no arquivo selecionado
      const itensWithTipo = formData.itens.map((item, index) => {
        const file = itemFiles[index];
        const tipo = file ? detectTipoFromFile(file) : (item.tipo || "texto");
        return { ...item, tipo };
      });

      let savedChecklist;
      if (editingId) {
        const { data } = await api.put(`/checklists/${editingId}`, { ...formData, itens: itensWithTipo });
        savedChecklist = data;
      } else {
        const { data } = await api.post("/checklists", { ...formData, itens: itensWithTipo });
        savedChecklist = data;
      }

      // Upload arquivos pendentes
      const pendingUploads = Object.entries(itemFiles).filter(([, f]) => f != null);

      if (pendingUploads.length > 0) {
        const savedItens = savedChecklist.itens || [];

        for (const [indexStr, file] of pendingUploads) {
          const idx = parseInt(indexStr);
          const savedItem = savedItens[idx];
          if (!savedItem) continue;

          setUploadState((prev) => ({
            ...prev,
            [idx]: { progress: 0, uploading: true, done: false, error: null },
          }));

          const fd = new FormData();
          fd.append("file", file);

          try {
            await api.post(
              `/checklists/${savedChecklist.id}/item/${savedItem.id}/upload`,
              fd,
              {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (evt) => {
                  const pct = evt.total
                    ? Math.round((evt.loaded * 100) / evt.total)
                    : 0;
                  setUploadState((prev) => ({
                    ...prev,
                    [idx]: { progress: pct, uploading: true, done: false, error: null },
                  }));
                },
              }
            );
            setUploadState((prev) => ({
              ...prev,
              [idx]: { progress: 100, uploading: false, done: true, error: null },
            }));
          } catch {
            setUploadState((prev) => ({
              ...prev,
              [idx]: { progress: 0, uploading: false, done: false, error: "Erro ao enviar" },
            }));
            toast.error(`Erro ao enviar arquivo do item ${idx + 1}`);
          }
        }
      }

      toast.success(editingId ? "Checklist atualizado com sucesso" : "Checklist criado com sucesso");
      closeDialog();
      loadChecklists();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erro ao salvar checklist");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (checklist) => {
    setDeletingChecklist(checklist);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/checklists/${deletingChecklist.id}`);
      toast.success("Checklist excluído com sucesso");
      setDeleteDialogOpen(false);
      setDeletingChecklist(null);
      loadChecklists();
    } catch {
      toast.error("Erro ao excluir checklist");
    }
  };

  const isUploading = Object.values(uploadState).some((s) => s?.uploading);

  const getSaveLabel = () => {
    if (!saving) return "Salvar";
    if (isUploading) return "Enviando arquivos...";
    return "Salvando...";
  };

  return (
    <Box>
      {/* Barra de busca + botão novo */}
      <Box className={classes.searchRow}>
        <TextField
          placeholder="Buscar por título..."
          value={searchParam}
          onChange={(e) => setSearchParam(e.target.value)}
          variant="outlined"
          size="small"
          style={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={openCreate}
        >
          Novo Checklist
        </Button>
      </Box>

      {/* Tabela */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Título</strong></TableCell>
                <TableCell><strong>Itens</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {checklists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="textSecondary">
                      Nenhum checklist encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                checklists.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>
                      <Typography variant="body2">{c.titulo}</Typography>
                      {c.descricao && (
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          style={{
                            display: "block",
                            maxWidth: 300,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {c.descricao}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {c.itens?.length || 0}{" "}
                      {c.itens?.length === 1 ? "item" : "itens"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={c.ativo ? "Ativo" : "Inativo"}
                        size="small"
                        className={c.ativo ? classes.ativoChip : classes.inativoChip}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box className={classes.actionButtons}>
                        <Tooltip title="Visualizar">
                          <IconButton size="small" onClick={() => openView(c.id)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton size="small" color="primary" onClick={() => openEdit(c.id)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton size="small" color="secondary" onClick={() => confirmDelete(c)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog criar/editar (fullscreen) */}
      <Dialog
        fullScreen
        open={dialogOpen}
        onClose={closeDialog}
        TransitionComponent={Transition}
      >
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={closeDialog} disabled={saving}>
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.dialogTitle}>
              {editingId ? "Editar Checklist" : "Novo Checklist"}
            </Typography>
            <Button
              color="inherit"
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {getSaveLabel()}
            </Button>
          </Toolbar>
        </AppBar>

        <Box className={classes.dialogContent}>
          {/* Informações básicas */}
          <Box className={classes.formSection}>
            <Typography variant="h6" gutterBottom>
              Informações Básicas
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  label="Título"
                  fullWidth
                  required
                  variant="outlined"
                  value={formData.titulo}
                  onChange={(e) => handleChange("titulo", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={formData.tipo}
                    onChange={(e) => handleChange("tipo", e.target.value)}
                    label="Tipo"
                  >
                    <MenuItem value="padrao">Padrão</MenuItem>
                    <MenuItem value="com_imagem">Com Imagem</MenuItem>
                    <MenuItem value="com_video">Com Vídeo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Descrição"
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                  value={formData.descricao}
                  onChange={(e) => handleChange("descricao", e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.ativo}
                      onChange={(e) => handleChange("ativo", e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Checklist Ativo"
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Itens */}
          <Box className={classes.formSection} style={{ marginTop: 24 }}>
            <Typography variant="h6" gutterBottom>
              Itens do Checklist
            </Typography>
            <Typography variant="caption" color="textSecondary" style={{ display: "block", marginBottom: 12 }}>
              Arraste pelo ícone <DragIndicatorIcon style={{ fontSize: 14, verticalAlign: "middle" }} /> para reordenar os itens.
            </Typography>

            {formData.itens.map((item, index) => (
              <Card
                key={index}
                className={[
                  classes.itemCard,
                  dragIndex === index ? classes.itemCardDragging : "",
                  dragOverIndex === index && dragIndex !== index ? classes.itemCardDragOver : "",
                ].join(" ")}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                <CardContent>
                  <Box className={classes.itemHeader}>
                    <Box className={classes.itemHeaderLeft}>
                      <Tooltip title="Arraste para reordenar">
                        <DragIndicatorIcon className={classes.dragHandle} fontSize="small" />
                      </Tooltip>
                      <Typography variant="subtitle2" color="textSecondary">
                        Item #{item.ordem || index + 1}
                      </Typography>
                    </Box>
                    <Box className={classes.itemActions}>
                      <Tooltip title="Remover item">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleRemoveItem(index)}
                          disabled={saving}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <TextField
                        label="Título do Item"
                        fullWidth
                        required
                        variant="outlined"
                        size="small"
                        value={item.titulo}
                        onChange={(e) => handleItemChange(index, "titulo", e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={item.obrigatorio}
                            onChange={(e) =>
                              handleItemChange(index, "obrigatorio", e.target.checked)
                            }
                            color="primary"
                            size="small"
                          />
                        }
                        label="Obrigatório"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Descrição/Instrução"
                        fullWidth
                        multiline
                        rows={2}
                        variant="outlined"
                        size="small"
                        value={item.descricao}
                        onChange={(e) => handleItemChange(index, "descricao", e.target.value)}
                      />
                    </Grid>

                    {/* Upload de arquivo */}
                    <Grid item xs={12}>
                      <input
                        ref={(el) => (fileInputRefs.current[index] = el)}
                        type="file"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleFileSelect(index, file);
                          e.target.value = "";
                        }}
                      />

                      {/* Arquivo pendente (recém selecionado) */}
                      {itemFiles[index] ? (
                        <Box className={classes.selectedFileBox}>
                          <InsertDriveFileIcon fontSize="small" color="action" />
                          <Typography className={classes.selectedFileName}>
                            {itemFiles[index].name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" style={{ whiteSpace: "nowrap" }}>
                            {(itemFiles[index].size / 1024 / 1024).toFixed(1)} MB
                          </Typography>
                          <Tooltip title="Remover arquivo">
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveFile(index)}
                              disabled={uploadState[index]?.uploading}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : item.arquivoNome ? (
                        /* Arquivo já existente no item */
                        <Box className={classes.selectedFileBox}>
                          <InsertDriveFileIcon fontSize="small" color="primary" />
                          <Typography className={classes.selectedFileName}>
                            {item.arquivoNome}
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => fileInputRefs.current[index]?.click()}
                            disabled={saving}
                          >
                            Trocar
                          </Button>
                        </Box>
                      ) : (
                        /* Botão para selecionar arquivo */
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<CloudUploadIcon />}
                          onClick={() => fileInputRefs.current[index]?.click()}
                          className={classes.fileUploadButton}
                          disabled={saving}
                        >
                          Selecionar arquivo (qualquer tipo)
                        </Button>
                      )}

                      {/* Barra de progresso de envio */}
                      {uploadState[index]?.uploading && (
                        <Box className={classes.uploadProgressBox}>
                          <LinearProgress
                            variant="determinate"
                            value={uploadState[index].progress}
                            style={{ height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="caption" color="textSecondary">
                            Enviando... {uploadState[index].progress}%
                          </Typography>
                        </Box>
                      )}

                      {/* Sucesso */}
                      {uploadState[index]?.done && (
                        <Box className={classes.uploadSuccess}>
                          <CheckCircleIcon style={{ fontSize: 14 }} />
                          <Typography variant="caption">Arquivo enviado com sucesso</Typography>
                        </Box>
                      )}

                      {/* Erro */}
                      {uploadState[index]?.error && (
                        <Typography className={classes.uploadError}>
                          {uploadState[index].error}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
              style={{ marginTop: 8 }}
              disabled={saving}
            >
              Adicionar Item
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Dialog de visualização */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <span>{viewItem?.titulo}</span>
            <IconButton size="small" onClick={() => setViewDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {viewItem && (
            <Box>
              <Box display="flex" gap={8} mb={2} flexWrap="wrap" style={{ gap: 8 }}>
                <Chip
                  label={viewItem.ativo ? "Ativo" : "Inativo"}
                  size="small"
                  className={viewItem.ativo ? classes.ativoChip : classes.inativoChip}
                />
                <Chip
                  label={`${viewItem.itens?.length || 0} ${viewItem.itens?.length === 1 ? "item" : "itens"}`}
                  size="small"
                />
              </Box>

              {viewItem.descricao && (
                <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                  {viewItem.descricao}
                </Typography>
              )}

              <Divider style={{ marginBottom: 16 }} />

              <Typography variant="subtitle1" gutterBottom>
                <strong>Itens</strong>
              </Typography>

              {!viewItem.itens || viewItem.itens.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  Nenhum item cadastrado
                </Typography>
              ) : (
                viewItem.itens.map((it) => (
                  <Card key={it.id} variant="outlined" style={{ marginBottom: 8 }}>
                    <CardContent style={{ paddingBottom: 12 }}>
                      <Box className={classes.viewItemHeader}>
                        <Box className={classes.viewItemNumber}>{it.ordem}</Box>
                        <Typography variant="subtitle2">{it.titulo}</Typography>
                        {it.obrigatorio && (
                          <Chip
                            label="Obrigatório"
                            size="small"
                            className={classes.obrigatorioChip}
                            style={{ marginLeft: 8 }}
                          />
                        )}
                        {it.arquivoNome && (
                          <Chip
                            icon={<InsertDriveFileIcon style={{ fontSize: 12 }} />}
                            label={it.arquivoNome}
                            size="small"
                            style={{ marginLeft: 8, maxWidth: 200 }}
                          />
                        )}
                      </Box>
                      {it.descricao && (
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          style={{ marginLeft: 36 }}
                        >
                          {it.descricao}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Fechar</Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => {
              setViewDialogOpen(false);
              openEdit(viewItem.id);
            }}
          >
            Editar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Excluir Checklist</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o checklist{" "}
            <strong>"{deletingChecklist?.titulo}"</strong>? Todos os itens serão
            removidos.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="secondary" onClick={handleDelete}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChecklistsTab;
