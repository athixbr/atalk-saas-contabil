import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Typography,
  IconButton,
  Box,
  Card,
  CardContent,
  CardActions,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Tooltip,
} from "@material-ui/core";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  ArrowUpward,
  ArrowDownward,
  InsertDriveFile as FileIcon,
} from "@material-ui/icons";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { useHistory, useParams } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/Auth/AuthContext";

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
  itemCard: {
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
  },
  itemHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1),
  },
  itemActions: {
    display: "flex",
    gap: theme.spacing(1),
  },
  addButton: {
    marginTop: theme.spacing(2),
  },
  filePreview: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  fileImage: {
    maxWidth: 200,
    maxHeight: 150,
    borderRadius: theme.shape.borderRadius,
  },
  uploadButton: {
    marginTop: theme.spacing(1),
  },
}));

const Cadastro = () => {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({});

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tipo: "padrao",
    ativo: true,
    itens: [],
  });

  useEffect(() => {
    if (id) {
      loadChecklist();
    }
  }, [id]);

  const loadChecklist = async () => {
    try {
      const { data } = await api.get(`/checklists/${id}`);
      setFormData({
        titulo: data.titulo,
        descricao: data.descricao || "",
        tipo: data.tipo || "padrao",
        ativo: data.ativo,
        itens: data.itens || [],
      });
    } catch (err) {
      console.error("Erro ao carregar checklist:", err);
      toast.error("Erro ao carregar checklist");
      history.push("/checklists");
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItens = [...formData.itens];
    newItens[index] = { ...newItens[index], [field]: value };
    setFormData((prev) => ({ ...prev, itens: newItens }));
  };

  const handleAddItem = () => {
    const newItem = {
      ordem: formData.itens.length + 1,
      titulo: "",
      descricao: "",
      obrigatorio: false,
      tipo: "texto",
    };
    setFormData((prev) => ({ ...prev, itens: [...prev.itens, newItem] }));
  };

  const handleRemoveItem = (index) => {
    const newItens = formData.itens.filter((_, i) => i !== index);
    // Reordenar
    newItens.forEach((item, i) => {
      item.ordem = i + 1;
    });
    setFormData((prev) => ({ ...prev, itens: newItens }));
  };

  const handleMoveItem = (index, direction) => {
    const newItens = [...formData.itens];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newItens.length) return;

    // Trocar posições
    [newItens[index], newItens[newIndex]] = [
      newItens[newIndex],
      newItens[index],
    ];

    // Reordenar
    newItens.forEach((item, i) => {
      item.ordem = i + 1;
    });

    setFormData((prev) => ({ ...prev, itens: newItens }));
  };

  const handleFileUpload = async (index, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const item = formData.itens[index];

    // Se está editando, precisa do itemId
    if (!id || !item.id) {
      toast.warning("Salve o checklist primeiro antes de fazer upload de arquivos");
      return;
    }

    setUploading((prev) => ({ ...prev, [index]: true }));

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const { data } = await api.post(
        `/checklists/${id}/item/${item.id}/upload`,
        formDataUpload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Atualizar item com dados do arquivo
      handleItemChange(index, "arquivoUrl", data.arquivoUrl);
      handleItemChange(index, "arquivoNome", data.arquivoNome);
      handleItemChange(index, "arquivoPath", data.arquivoPath);

      toast.success("Arquivo enviado com sucesso");
    } catch (err) {
      console.error("Erro ao fazer upload:", err);
      toast.error("Erro ao fazer upload do arquivo");
    } finally {
      setUploading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleDeleteFile = async (index) => {
    const item = formData.itens[index];

    if (!item.id) {
      // Item ainda não salvo, apenas limpar
      handleItemChange(index, "arquivoUrl", null);
      handleItemChange(index, "arquivoNome", null);
      handleItemChange(index, "arquivoPath", null);
      return;
    }

    try {
      await api.delete(`/checklists/item/${item.id}/file`);

      handleItemChange(index, "arquivoUrl", null);
      handleItemChange(index, "arquivoNome", null);
      handleItemChange(index, "arquivoPath", null);

      toast.success("Arquivo removido com sucesso");
    } catch (err) {
      console.error("Erro ao remover arquivo:", err);
      toast.error("Erro ao remover arquivo");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titulo.trim()) {
      toast.error("O título é obrigatório");
      return;
    }

    setLoading(true);

    try {
      if (id) {
        await api.put(`/checklists/${id}`, formData);
        toast.success("Checklist atualizado com sucesso");
      } else {
        const { data } = await api.post("/checklists", formData);
        toast.success("Checklist criado com sucesso");
        history.push(`/checklists/cadastro/${data.id}`);
        return;
      }

      history.push("/checklists");
    } catch (err) {
      console.error("Erro ao salvar checklist:", err);
      toast.error(err.response?.data?.error || "Erro ao salvar checklist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{id ? "Editar Checklist" : "Novo Checklist"}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="outlined"
            onClick={() => history.push("/checklists")}
          >
            Voltar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Salvar"}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <form onSubmit={handleSubmit}>
          {/* Informações Básicas */}
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
                  value={formData.titulo}
                  onChange={(e) => handleChange("titulo", e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={formData.tipo}
                    onChange={(e) => handleChange("tipo", e.target.value)}
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
                  rows={3}
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

          {/* Itens do Checklist */}
          <Box className={classes.formSection}>
            <Typography variant="h6" gutterBottom>
              Itens do Checklist
            </Typography>

            {formData.itens.map((item, index) => (
              <Card key={index} className={classes.itemCard}>
                <CardContent>
                  <Box className={classes.itemHeader}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Item #{item.ordem}
                    </Typography>
                    <Box className={classes.itemActions}>
                      <Tooltip title="Mover para cima">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleMoveItem(index, "up")}
                            disabled={index === 0}
                          >
                            <ArrowUpward />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Mover para baixo">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleMoveItem(index, "down")}
                            disabled={index === formData.itens.length - 1}
                          >
                            <ArrowDownward />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Remover item">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Título do Item"
                        fullWidth
                        required
                        value={item.titulo}
                        onChange={(e) =>
                          handleItemChange(index, "titulo", e.target.value)
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Tipo</InputLabel>
                        <Select
                          value={item.tipo}
                          onChange={(e) =>
                            handleItemChange(index, "tipo", e.target.value)
                          }
                        >
                          <MenuItem value="texto">Texto</MenuItem>
                          <MenuItem value="imagem">Imagem</MenuItem>
                          <MenuItem value="video">Vídeo</MenuItem>
                          <MenuItem value="arquivo">Arquivo</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={item.obrigatorio}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "obrigatorio",
                                e.target.checked
                              )
                            }
                            color="primary"
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
                        value={item.descricao}
                        onChange={(e) =>
                          handleItemChange(index, "descricao", e.target.value)
                        }
                      />
                    </Grid>

                    {/* Upload de Arquivo */}
                    {item.tipo !== "texto" && (
                      <Grid item xs={12}>
                        {item.arquivoUrl ? (
                          <Box className={classes.filePreview}>
                            {item.tipo === "imagem" && (
                              <img
                                src={item.arquivoUrl}
                                alt={item.arquivoNome}
                                className={classes.fileImage}
                              />
                            )}
                            {item.tipo === "video" && (
                              <video
                                src={item.arquivoUrl}
                                controls
                                className={classes.fileImage}
                              />
                            )}
                            {item.tipo === "arquivo" && (
                              <Box display="flex" alignItems="center" gap={1}>
                                <FileIcon />
                                <Typography variant="body2">
                                  {item.arquivoNome}
                                </Typography>
                              </Box>
                            )}
                            <Button
                              variant="outlined"
                              color="secondary"
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDeleteFile(index)}
                            >
                              Remover Arquivo
                            </Button>
                          </Box>
                        ) : (
                          <Box>
                            <input
                              accept={
                                item.tipo === "imagem"
                                  ? "image/*"
                                  : item.tipo === "video"
                                  ? "video/*"
                                  : "*"
                              }
                              style={{ display: "none" }}
                              id={`file-upload-${index}`}
                              type="file"
                              onChange={(e) => handleFileUpload(index, e)}
                            />
                            <label htmlFor={`file-upload-${index}`}>
                              <Button
                                variant="outlined"
                                component="span"
                                startIcon={
                                  uploading[index] ? (
                                    <CircularProgress size={20} />
                                  ) : (
                                    <CloudUploadIcon />
                                  )
                                }
                                disabled={uploading[index] || !id}
                                className={classes.uploadButton}
                              >
                                {uploading[index]
                                  ? "Enviando..."
                                  : !id
                                  ? "Salve antes de fazer upload"
                                  : `Upload ${item.tipo}`}
                              </Button>
                            </label>
                          </Box>
                        )}
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
              className={classes.addButton}
            >
              Adicionar Item
            </Button>
          </Box>
        </form>
      </Paper>
    </MainContainer>
  );
};

export default Cadastro;
