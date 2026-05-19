import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Typography,
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
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from "@material-ui/core";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
} from "@material-ui/icons";
import { useHistory, useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import api from "../../services/api";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(3),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
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
  addChecklistButton: {
    marginTop: theme.spacing(2),
  },
  infoBox: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.info.light,
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(2),
  },
}));

const TarefasCadastroPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [statusList, setStatusList] = useState([]);
  const [prazosList, setPrazosList] = useState([]);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    temVencimento: false,
    dataVencimento: "",
    diasParaVencimento: "",
    statusId: "",
    diasLembrete: "",
    prazoId: "",
    checklist: [],
  });

  const [newChecklistItem, setNewChecklistItem] = useState("");

  useEffect(() => {
    fetchStatus();
    fetchPrazos();
    if (id) {
      fetchTarefa();
    }
  }, [id]);

  const fetchStatus = async () => {
    try {
      const { data } = await api.get("/parametros/status");
      setStatusList(data || []);
    } catch (error) {
      toast.error("Erro ao carregar status");
      console.error("Erro ao buscar status:", error);
    }
  };

  const fetchPrazos = async () => {
    try {
      const { data } = await api.get("/parametros/prazos");
      setPrazosList(data || []);
    } catch (error) {
      toast.error("Erro ao carregar prazos");
      console.error("Erro ao buscar prazos:", error);
    }
  };

  const fetchTarefa = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/tarefas-config/${id}`);
      setFormData({
        titulo: data.titulo,
        descricao: data.descricao || "",
        temVencimento: data.temVencimento || false,
        dataVencimento: data.dataVencimento || "",
        diasParaVencimento: data.diasParaVencimento || "",
        statusId: data.statusId || "",
        diasLembrete: data.diasLembrete || "",
        prazoId: data.prazoId || "",
        checklist: data.checklist || [],
      });
    } catch (error) {
      toast.error("Erro ao carregar tarefa");
      console.error("Erro ao buscar tarefa:", error);
    } finally {
      setLoading(false);
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

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(formData.checklist);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Atualizar a ordem
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

    if (formData.temVencimento && !formData.diasParaVencimento) {
      toast.warning("Informe os dias para vencimento");
      return;
    }

    if (formData.temVencimento && !formData.statusId) {
      toast.warning("Selecione um status");
      return;
    }

    if (formData.diasLembrete && !formData.prazoId) {
      toast.warning("Selecione um prazo para o lembrete");
      return;
    }

    setLoading(true);
    try {
      if (id) {
        await api.put(`/tarefas-config/${id}`, formData);
        toast.success("Tarefa atualizada com sucesso!");
      } else {
        await api.post("/tarefas-config", formData);
        toast.success("Tarefa criada com sucesso!");
      }
      history.push("/tarefas-config");
    } catch (error) {
      toast.error("Erro ao salvar tarefa");
      console.error("Erro ao salvar tarefa:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    history.push("/tarefas-config");
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{id ? "Editar Tarefa" : "Nova Tarefa"}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleCancel}
          >
            Voltar
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <form onSubmit={handleSubmit}>
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

          {/* Descrição */}
          <div className={classes.formSection}>
            <TextField
              label="Descrição da Tarefa"
              value={formData.descricao}
              onChange={(e) => handleInputChange("descricao", e.target.value)}
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              placeholder="Descreva os detalhes da tarefa..."
            />
          </div>

          <Divider style={{ margin: "24px 0" }} />

          {/* Vencimento */}
          <div className={classes.formSection}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.temVencimento}
                  onChange={(e) =>
                    handleInputChange("temVencimento", e.target.checked)
                  }
                  color="primary"
                />
              }
              label={
                <Typography variant="h6">Tarefa com Vencimento</Typography>
              }
            />

            {formData.temVencimento && (
              <Grid container spacing={2} style={{ marginTop: 16 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Dias para Vencimento"
                    type="number"
                    value={formData.diasParaVencimento}
                    onChange={(e) =>
                      handleInputChange("diasParaVencimento", e.target.value)
                    }
                    fullWidth
                    variant="outlined"
                    placeholder="Ex: 30"
                    InputProps={{
                      inputProps: { min: 1 },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.statusId}
                      onChange={(e) =>
                        handleInputChange("statusId", e.target.value)
                      }
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
              </Grid>
            )}
          </div>

          <Divider style={{ margin: "24px 0" }} />

          {/* Lembrete */}
          <div className={classes.formSection}>
            <Typography variant="h6" gutterBottom>
              Lembrete antes do Vencimento
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Dias para Lembrar"
                  type="number"
                  value={formData.diasLembrete}
                  onChange={(e) =>
                    handleInputChange("diasLembrete", e.target.value)
                  }
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
                    onChange={(e) =>
                      handleInputChange("prazoId", e.target.value)
                    }
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

          <Divider style={{ margin: "24px 0" }} />

          {/* Checklist */}
          <div className={classes.formSection}>
            <Typography variant="h6" gutterBottom>
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
                rows={3}
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
                style={{ minWidth: 140, height: "fit-content" }}
              >
                Adicionar
              </Button>
            </Box>

            <Box className={classes.infoBox}>
              <Typography variant="caption">
                💡 Dica: Pressione <strong>Ctrl + Enter</strong> para adicionar
                rapidamente
              </Typography>
            </Box>

            {formData.checklist.length > 0 && (
              <Card className={classes.checklistCard}>
                <CardContent>
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="checklist">
                      {(provided) => (
                        <List
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {formData.checklist.map((item, index) => (
                            <Draggable
                              key={item.id}
                              draggableId={String(item.id)}
                              index={index}
                            >
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
                                  <Box
                                    {...provided.dragHandleProps}
                                    className={classes.dragHandle}
                                    display="flex"
                                    alignItems="center"
                                    mr={2}
                                  >
                                    <DragIndicatorIcon color="action" />
                                  </Box>
                                  <Box flex={1}>
                                    <TextField
                                      value={item.text}
                                      onChange={(e) =>
                                        handleChecklistTextChange(
                                          item.id,
                                          e.target.value
                                        )
                                      }
                                      fullWidth
                                      multiline
                                      rows={2}
                                      variant="outlined"
                                      placeholder="Texto do item..."
                                      size="small"
                                    />
                                  </Box>
                                  <ListItemSecondaryAction>
                                    <Chip
                                      label={`#${index + 1}`}
                                      size="small"
                                      color="primary"
                                      style={{ marginRight: 8 }}
                                    />
                                    <IconButton
                                      edge="end"
                                      color="secondary"
                                      onClick={() =>
                                        handleDeleteChecklistItem(item.id)
                                      }
                                      size="small"
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </ListItemSecondaryAction>
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

          {/* Botões de Ação */}
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar Tarefa"}
            </Button>
          </Box>
        </form>
      </Paper>
    </MainContainer>
  );
};

export default TarefasCadastroPage;
