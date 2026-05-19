import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Divider,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  IconButton,
  Card,
  CardContent,
  List,
  ListItem,
  Chip,
  Typography,
} from "@material-ui/core";
import {
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
  Close as CloseIcon,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "react-toastify";
import api from "../../services/api";
import { getImageUrl } from "../../helpers/imageHelper";

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    padding: theme.spacing(3),
  },
  formSection: {
    marginBottom: theme.spacing(3),
  },
  checklistCard: {
    marginTop: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
  },
  checklistItem: {
    backgroundColor: "#fff",
    marginBottom: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    "&:hover": {
      boxShadow: theme.shadows[2],
    },
  },
  dragHandle: {
    cursor: "grab",
    "&:active": {
      cursor: "grabbing",
    },
  },
  infoBox: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.info.light,
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(2),
  },
  imagePreview: {
    maxWidth: "100%",
    maxHeight: 200,
    marginTop: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
}));

const TarefaConfigModal = ({ open, onClose, onSave }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [statusList, setStatusList] = useState([]);
  const [prazosList, setPrazosList] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    departamentoId: "",
    temVencimento: true,
    dataVencimento: "",
    diasParaVencimento: "",
    statusId: "",
    diasLembrete: "",
    prazoId: "",
    checklist: [],
    aceitaArquivos: true,
    ativo: true,
    sabadoUtil: false,
    diasNaoUteis: "",
    tarefaInterna: false,
    valorReferencial: "",
  });

  useEffect(() => {
    if (open) {
      fetchStatus();
      fetchPrazos();
      fetchDepartamentos();
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setFormData({
      titulo: "",
      descricao: "",
      departamentoId: "",
      temVencimento: true,
      dataVencimento: "",
      diasParaVencimento: "",
      statusId: "",
      diasLembrete: "",
      prazoId: "",
      checklist: [],
      aceitaArquivos: true,
      ativo: true,
      sabadoUtil: false,
      diasNaoUteis: "",
      tarefaInterna: false,
      valorReferencial: "",
    });
    setNewChecklistItem("");
  };

  const fetchStatus = async () => {
    try {
      const { data } = await api.get("/parametros/status");
      setStatusList(data || []);
    } catch (error) {
      console.error("Erro ao buscar status:", error);
    }
  };

  const fetchPrazos = async () => {
    try {
      const { data } = await api.get("/parametros/prazos");
      setPrazosList(data || []);
    } catch (error) {
      console.error("Erro ao buscar prazos:", error);
    }
  };

  const fetchDepartamentos = async () => {
    try {
      const { data } = await api.get("/departamentos");
      setDepartamentos(data.departamentos || []);
    } catch (error) {
      console.error("Erro ao buscar departamentos:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) {
      toast.warning("Digite o texto do item do checklist");
      return;
    }

    const newItem = {
      id: Date.now(),
      text: newChecklistItem,
      order: formData.checklist.length,
      image: null,
    };

    setFormData({
      ...formData,
      checklist: [...formData.checklist, newItem],
    });
    setNewChecklistItem("");
  };

  const handleDeleteChecklistItem = (itemId) => {
    setFormData({
      ...formData,
      checklist: formData.checklist.filter((item) => item.id !== itemId),
    });
  };

  const handleChecklistTextChange = (itemId, newText) => {
    setFormData({
      ...formData,
      checklist: formData.checklist.map((item) =>
        item.id === itemId ? { ...item, text: newText } : item
      ),
    });
  };

  const handleImageUpload = (itemId, event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.warning("Imagem muito grande. Tamanho máximo: 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          checklist: formData.checklist.map((item) =>
            item.id === itemId ? { ...item, image: reader.result } : item
          ),
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (itemId) => {
    setFormData({
      ...formData,
      checklist: formData.checklist.map((item) =>
        item.id === itemId ? { ...item, image: null } : item
      ),
    });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(formData.checklist);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setFormData({ ...formData, checklist: reorderedItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titulo.trim()) {
      toast.warning("O título da tarefa é obrigatório");
      return;
    }

    if (!formData.departamentoId) {
      toast.warning("Selecione um departamento");
      return;
    }

    if (formData.temVencimento) {
      if (!formData.diasParaVencimento) {
        toast.warning("Informe os dias para vencimento");
        return;
      }

      if (!formData.statusId) {
        toast.warning("Selecione um status");
        return;
      }

      if (formData.diasLembrete && !formData.prazoId) {
        toast.warning("Selecione um prazo para o lembrete");
        return;
      }
    }

    setLoading(true);
    try {
      const { data } = await api.post("/tarefas-config", formData);
      toast.success("Configuração de tarefa criada com sucesso!");
      
      // Chamar callback com a tarefa criada
      if (onSave) {
        onSave(data);
      }
      
      resetForm();
      onClose();
    } catch (error) {
      toast.error("Erro ao criar configuração de tarefa");
      console.error("Erro ao salvar tarefa:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle disableTypography className={classes.dialogTitle}>
        <Typography variant="h6">Nova Configuração de Tarefa</Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className={classes.dialogContent} dividers>
        <form onSubmit={handleSubmit} id="tarefaConfigForm">
          {/* Título */}
          <div className={classes.formSection}>
            <TextField
              label="Título da Tarefa"
              value={formData.titulo}
              onChange={(e) => handleInputChange("titulo", e.target.value)}
              required
              fullWidth
              variant="outlined"
              placeholder="Ex: Entregar declaração de imposto de renda"
            />
          </div>

          {/* Departamento */}
          <div className={classes.formSection}>
            <FormControl fullWidth variant="outlined" required>
              <InputLabel>Departamento</InputLabel>
              <Select
                value={formData.departamentoId}
                onChange={(e) => handleInputChange("departamentoId", e.target.value)}
                label="Departamento"
              >
                <MenuItem value="">
                  <em>Selecione um departamento</em>
                </MenuItem>
                {departamentos.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Tarefa Interna e Valor Referencial */}
          <div className={classes.formSection}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.tarefaInterna}
                      onChange={(e) => handleInputChange("tarefaInterna", e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Tarefa Interna"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Valor Referencial (R$)"
                  type="number"
                  value={formData.valorReferencial}
                  onChange={(e) => handleInputChange("valorReferencial", e.target.value)}
                  fullWidth
                  variant="outlined"
                  placeholder="0,00"
                  InputProps={{
                    inputProps: { min: 0, step: "0.01" },
                  }}
                  helperText="Valor de referência para esta tarefa"
                />
              </Grid>
            </Grid>
          </div>

          <Divider style={{ margin: "24px 0" }} />

          {/* Toggle Tem Vencimento */}
          <div className={classes.formSection}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.temVencimento}
                  onChange={(e) => {
                    const temVencimento = e.target.checked;
                    setFormData({
                      ...formData,
                      temVencimento: temVencimento,
                      diasParaVencimento: temVencimento ? formData.diasParaVencimento : "",
                      statusId: temVencimento ? formData.statusId : "",
                      diasLembrete: temVencimento ? formData.diasLembrete : "",
                      prazoId: temVencimento ? formData.prazoId : "",
                      sabadoUtil: temVencimento ? formData.sabadoUtil : false,
                      diasNaoUteis: temVencimento ? formData.diasNaoUteis : "",
                    });
                  }}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" style={{ fontWeight: 500 }}>
                    Esta tarefa possui vencimento
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {formData.temVencimento
                      ? "Configurações de prazo e lembretes serão aplicadas"
                      : "Tarefa sem prazo definido"}
                  </Typography>
                </Box>
              }
            />
          </div>

          {/* Configurações de Vencimento */}
          {formData.temVencimento && (
            <>
              <div className={classes.formSection}>
                <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 500 }}>
                  Configurações de Vencimento
                </Typography>

                <Grid container spacing={2} style={{ marginTop: 8 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Dias para Vencimento"
                      type="number"
                      value={formData.diasParaVencimento}
                      onChange={(e) => handleInputChange("diasParaVencimento", e.target.value)}
                      fullWidth
                      variant="outlined"
                      placeholder="Ex: 30"
                      required
                      InputProps={{
                        inputProps: { min: 1 },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined" required>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.statusId}
                        onChange={(e) => handleInputChange("statusId", e.target.value)}
                        label="Status"
                      >
                        <MenuItem value="">
                          <em>Selecione um status</em>
                        </MenuItem>
                        {statusList.map((status) => (
                          <MenuItem key={status.id} value={status.id}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box
                                style={{
                                  width: 16,
                                  height: 16,
                                  backgroundColor: status.cor,
                                  borderRadius: "50%",
                                }}
                              />
                              {status.nome}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.sabadoUtil}
                          onChange={(e) => handleInputChange("sabadoUtil", e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Sábado é dia útil?"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Dias Não Úteis</InputLabel>
                      <Select
                        value={formData.diasNaoUteis || ""}
                        onChange={(e) => handleInputChange("diasNaoUteis", e.target.value)}
                        label="Dias Não Úteis"
                      >
                        <MenuItem value="">
                          <em>Selecione uma opção</em>
                        </MenuItem>
                        <MenuItem value="Antecipar">Antecipar</MenuItem>
                        <MenuItem value="Postergar">Postergar</MenuItem>
                        <MenuItem value="Manter">Manter</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </div>

              <Divider style={{ margin: "24px 0" }} />

              {/* Lembrete */}
              <div className={classes.formSection}>
                <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 500 }}>
                  Lembrete antes do Vencimento
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Dias para Lembrar"
                      type="number"
                      value={formData.diasLembrete}
                      onChange={(e) => handleInputChange("diasLembrete", e.target.value)}
                      fullWidth
                      variant="outlined"
                      placeholder="Ex: 7"
                      InputProps={{
                        inputProps: { min: 1 },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Prazo</InputLabel>
                      <Select
                        value={formData.prazoId}
                        onChange={(e) => handleInputChange("prazoId", e.target.value)}
                        label="Prazo"
                      >
                        <MenuItem value="">
                          <em>Selecione um prazo</em>
                        </MenuItem>
                        {prazosList.map((prazo) => (
                          <MenuItem key={prazo.id} value={prazo.id}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box
                                style={{
                                  width: 16,
                                  height: 16,
                                  backgroundColor: prazo.cor,
                                  borderRadius: "50%",
                                }}
                              />
                              {prazo.nome}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </div>
            </>
          )}

          <Divider style={{ margin: "24px 0" }} />

          {/* Checklist */}
          <div className={classes.formSection}>
            <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 500 }}>
              Checklist da Tarefa
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Adicione itens e arraste para reordenar
            </Typography>

            <Box display="flex" gap={2} alignItems="flex-start" mt={2}>
              <TextField
                label="Novo item do checklist"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                placeholder="Digite o texto do item..."
                onKeyPress={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    handleAddChecklistItem();
                  }
                }}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddChecklistItem}
                style={{ minWidth: 120 }}
              >
                Adicionar
              </Button>
            </Box>

            {formData.checklist.length > 0 && (
              <Card className={classes.checklistCard}>
                <CardContent>
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="checklist">
                      {(provided) => (
                        <List {...provided.droppableProps} ref={provided.innerRef}>
                          {formData.checklist.map((item, index) => (
                            <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                              {(provided, snapshot) => (
                                <ListItem
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={classes.checklistItem}
                                  style={{
                                    ...provided.draggableProps.style,
                                    opacity: snapshot.isDragging ? 0.8 : 1,
                                  }}
                                >
                                  <Box display="flex" alignItems="flex-start" width="100%" gap={2}>
                                    <Chip label={`#${index + 1}`} size="small" color="primary" />

                                    <Box
                                      {...provided.dragHandleProps}
                                      className={classes.dragHandle}
                                      display="flex"
                                      alignItems="center"
                                    >
                                      <DragIndicatorIcon color="action" />
                                    </Box>

                                    <Box flex={1}>
                                      <TextField
                                        value={item.text}
                                        onChange={(e) =>
                                          handleChecklistTextChange(item.id, e.target.value)
                                        }
                                        fullWidth
                                        multiline
                                        rows={2}
                                        variant="outlined"
                                        placeholder="Texto do item..."
                                        size="small"
                                      />

                                      <Box mt={1} display="flex" gap={1} alignItems="center">
                                        <input
                                          accept="image/*"
                                          style={{ display: "none" }}
                                          id={`upload-image-${item.id}`}
                                          type="file"
                                          onChange={(e) => handleImageUpload(item.id, e)}
                                        />
                                        <label htmlFor={`upload-image-${item.id}`}>
                                          <Button
                                            variant="outlined"
                                            size="small"
                                            component="span"
                                            startIcon={<CloudUploadIcon />}
                                          >
                                            {item.image ? "Trocar" : "Anexar"}
                                          </Button>
                                        </label>

                                        {item.image && (
                                          <Chip
                                            icon={<ImageIcon />}
                                            label="Imagem"
                                            size="small"
                                            color="secondary"
                                            onDelete={() => handleRemoveImage(item.id)}
                                          />
                                        )}
                                      </Box>

                                      {item.image && (
                                        <Box mt={1}>
                                          <img
                                            src={getImageUrl(item.image)}
                                            alt={`Preview ${index + 1}`}
                                            className={classes.imagePreview}
                                          />
                                        </Box>
                                      )}
                                    </Box>

                                    <IconButton
                                      color="secondary"
                                      onClick={() => handleDeleteChecklistItem(item.id)}
                                      size="small"
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Box>
                                </ListItem>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </List>
                      )}
                    </Droppable>
                  </DragDropContext>
                </CardContent>
              </Card>
            )}
          </div>

          <Divider style={{ margin: "24px 0" }} />

          {/* Aceita Arquivos e Ativo */}
          <div className={classes.formSection}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.aceitaArquivos}
                      onChange={(e) => handleInputChange("aceitaArquivos", e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Aceita Arquivos"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.ativo}
                      onChange={(e) => handleInputChange("ativo", e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Tarefa Ativa"
                />
              </Grid>
            </Grid>
          </div>
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          form="tarefaConfigForm"
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TarefaConfigModal;
