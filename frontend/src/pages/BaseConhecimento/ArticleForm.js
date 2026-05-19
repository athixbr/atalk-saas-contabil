import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Grid,
  IconButton,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
} from "@material-ui/core";
import {
  ArrowBack,
  Save,
  Publish,
  Close,
  CloudUpload,
  Delete,
  Add,
  VideoLibrary,
} from "@material-ui/icons";
import { useHistory, useParams } from "react-router-dom";
import { toast } from "react-toastify";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import {
  createArticle,
  updateArticle,
  getArticle,
  listCategories,
  uploadAttachment,
  deleteAttachment,
  addVideo,
  deleteVideo,
} from "../../services/knowledgeBase";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    borderRadius: "12px",
  },
  formGroup: {
    marginBottom: theme.spacing(3),
  },
  editor: {
    "& .ql-container": {
      minHeight: "400px",
      fontSize: "16px",
    },
    "& .ql-editor": {
      minHeight: "400px",
    },
  },
  tagInput: {
    display: "flex",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  tagsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  uploadArea: {
    border: `2px dashed ${theme.palette.divider}`,
    borderRadius: "8px",
    padding: theme.spacing(3),
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s",
    "&:hover": {
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.action.hover,
    },
  },
  attachmentCard: {
    marginTop: theme.spacing(2),
  },
  videoCard: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    borderRadius: "8px",
  },
}));

const ArticleForm = () => {
  const classes = useStyles();
  const history = useHistory();
  const { articleId } = useParams();
  const isEditing = Boolean(articleId) && articleId !== "novo";

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    summary: "",
    categoryId: null,
    status: "draft",
    featured: false,
    tags: [],
    videos: [],
  });

  const [newTag, setNewTag] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    loadCategories();
    if (isEditing && articleId !== "novo") {
      loadArticle();
    }
  }, [articleId]);

  const loadCategories = async () => {
    try {
      const response = await listCategories({ pageNumber: 1 });
      console.log("Categorias carregadas:", response.data);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      toast.error("Erro ao carregar categorias");
    }
  };

  const loadArticle = async () => {
    try {
      setLoading(true);
      const response = await getArticle(articleId);
      const article = response.data;

      setFormData({
        title: article.title,
        content: article.content,
        summary: article.summary || "",
        categoryId: article.categoryId || null,
        status: article.status,
        featured: article.featured,
        tags: article.tags?.map((t) => t.name) || [],
        videos: article.videos || [],
      });

      setAttachments(article.attachments || []);
    } catch (error) {
      console.error("Erro ao carregar artigo:", error);
      toast.error("Erro ao carregar artigo");
      history.push("/base-conhecimento");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleAddVideo = () => {
    if (newVideoUrl.trim()) {
      const newVideo = {
        videoUrl: newVideoUrl.trim(),
        videoType: newVideoUrl.includes("youtube") ? "youtube" : "direct",
        title: newVideoTitle.trim(),
        order: formData.videos.length,
      };

      setFormData((prev) => ({
        ...prev,
        videos: [...prev.videos, newVideo],
      }));

      setNewVideoUrl("");
      setNewVideoTitle("");
    }
  };

  const handleRemoveVideo = async (index) => {
    const video = formData.videos[index];
    
    if (video.id) {
      // Vídeo já salvo no banco
      try {
        await deleteVideo(video.id);
        toast.success("Vídeo removido");
      } catch (error) {
        console.error("Erro ao remover vídeo:", error);
        toast.error("Erro ao remover vídeo");
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!isEditing) {
      toast.warning("Salve o artigo primeiro antes de adicionar anexos");
      return;
    }

    try {
      setUploading(true);
      const response = await uploadAttachment(articleId, file);
      setAttachments((prev) => [...prev, response.data]);
      toast.success("Arquivo enviado com sucesso");
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao enviar arquivo");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await deleteAttachment(attachmentId);
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
      toast.success("Anexo removido");
    } catch (error) {
      console.error("Erro ao remover anexo:", error);
      toast.error("Erro ao remover anexo");
    }
  };

  const handleSave = async (publish = false) => {
    if (!formData.title.trim()) {
      toast.error("O título é obrigatório");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("O conteúdo é obrigatório");
      return;
    }

    try {
      setLoading(true);

      const dataToSend = {
        ...formData,
        categoryId: formData.categoryId || null,
        status: publish ? "published" : formData.status,
      };

      if (isEditing) {
        await updateArticle(articleId, dataToSend);
        toast.success("Artigo atualizado com sucesso!");
      } else {
        const response = await createArticle(dataToSend);
        toast.success("Artigo criado com sucesso!");
        history.push(`/base-conhecimento/editar/${response.data.id}`);
        return;
      }

      history.push("/base-conhecimento");
    } catch (error) {
      console.error("Erro ao salvar artigo:", error);
      toast.error("Erro ao salvar artigo");
    } finally {
      setLoading(false);
    }
  };

  /* Removido módulos do Quill
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["link", "image", "video"],
      ["clean"],
    ],
  };
  */

  if (loading && isEditing) {
    return (
      <MainContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <MainHeader>
        <Title>{isEditing ? "Editar Artigo" : "Novo Artigo"}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => history.push("/base-conhecimento")}
          >
            Voltar
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Save />}
            onClick={() => handleSave(false)}
            disabled={loading}
          >
            Salvar Rascunho
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Publish />}
            onClick={() => handleSave(true)}
            disabled={loading}
          >
            Publicar
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Grid container spacing={3}>
        <Grid item xs={12} md={9}>
          <Paper className={classes.paper}>
            {/* Título */}
            <div className={classes.formGroup}>
              <TextField
                fullWidth
                label="Título do Artigo"
                placeholder="Ex: Como cadastrar produto com NCM no Domínio"
                variant="outlined"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
            </div>

            {/* Resumo */}
            <div className={classes.formGroup}>
              <TextField
                fullWidth
                label="Resumo (opcional)"
                placeholder="Breve descrição do artigo"
                variant="outlined"
                multiline
                rows={2}
                value={formData.summary}
                onChange={(e) => handleChange("summary", e.target.value)}
              />
            </div>

            {/* Editor de Conteúdo */}
            <div className={classes.formGroup}>
              <TextField
                fullWidth
                label="Conteúdo"
                placeholder="Escreva o conteúdo do artigo aqui... Use HTML para formatação: <b>negrito</b>, <i>itálico</i>, <h1>título</h1>, etc."
                variant="outlined"
                multiline
                rows={20}
                value={formData.content}
                onChange={(e) => handleChange("content", e.target.value)}
                required
              />
              <Typography variant="caption" color="textSecondary" style={{ marginTop: 8 }}>
                Dica: Você pode usar tags HTML para formatar o texto
              </Typography>
            </div>

            {/* Vídeos */}
            <div className={classes.formGroup}>
              <Typography variant="h6" gutterBottom>
                <VideoLibrary /> Vídeos
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Adicione vídeos do YouTube ou outros links
              </Typography>

              <Box display="flex" gap={2} mt={2}>
                <TextField
                  fullWidth
                  label="URL do Vídeo"
                  placeholder="https://www.youtube.com/watch?v=..."
                  variant="outlined"
                  size="small"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Título (opcional)"
                  variant="outlined"
                  size="small"
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddVideo}
                  startIcon={<Add />}
                >
                  Adicionar
                </Button>
              </Box>

              {formData.videos.length > 0 && (
                <List>
                  {formData.videos.map((video, index) => (
                    <Card key={index} className={classes.videoCard}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <div>
                          <Typography variant="body1">
                            {video.title || "Vídeo sem título"}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {video.videoUrl}
                          </Typography>
                        </div>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveVideo(index)}
                          color="secondary"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Card>
                  ))}
                </List>
              )}
            </div>

            {/* Anexos */}
            {isEditing && (
              <div className={classes.formGroup}>
                <Typography variant="h6" gutterBottom>
                  📎 Anexos
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Imagens, documentos, vídeos (máx 50MB)
                </Typography>

                <input
                  accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                  style={{ display: "none" }}
                  id="file-upload"
                  type="file"
                  onChange={handleFileUpload}
                />
                <label htmlFor="file-upload">
                  <div className={classes.uploadArea}>
                    {uploading ? (
                      <CircularProgress size={32} />
                    ) : (
                      <>
                        <CloudUpload style={{ fontSize: 48, color: "#999", marginBottom: 8 }} />
                        <Typography variant="body1">
                          Clique para selecionar arquivo
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          JPG, PNG, PDF, DOC, XLS (máx 50MB)
                        </Typography>
                      </>
                    )}
                  </div>
                </label>

                {attachments.length > 0 && (
                  <Card className={classes.attachmentCard}>
                    <CardContent>
                      <List>
                        {attachments.map((attachment) => (
                          <ListItem key={attachment.id}>
                            <ListItemText
                              primary={attachment.fileName}
                              secondary={`${attachment.fileType.toUpperCase()} • ${(
                                attachment.fileSize /
                                1024 /
                                1024
                              ).toFixed(2)} MB`}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                onClick={() => handleDeleteAttachment(attachment.id)}
                                color="secondary"
                              >
                                <Delete />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper className={classes.paper}>
            {/* Categoria */}
            <div className={classes.formGroup}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={formData.categoryId || ""}
                  onChange={(e) => handleChange("categoryId", e.target.value ? Number(e.target.value) : null)}
                  label="Categoria"
                >
                  <MenuItem value="">
                    <em>Nenhuma</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            {/* Status */}
            <div className={classes.formGroup}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  label="Status"
                >
                  <MenuItem value="draft">Rascunho</MenuItem>
                  <MenuItem value="published">Publicado</MenuItem>
                  <MenuItem value="archived">Arquivado</MenuItem>
                </Select>
              </FormControl>
            </div>

            {/* Destaque */}
            <div className={classes.formGroup}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.featured}
                    onChange={(e) => handleChange("featured", e.target.checked)}
                    color="primary"
                  />
                }
                label="Artigo em Destaque"
              />
            </div>

            {/* Tags */}
            <div className={classes.formGroup}>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <div className={classes.tagInput}>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  placeholder="Adicionar tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button variant="outlined" onClick={handleAddTag}>
                  <Add />
                </Button>
              </div>

              <div className={classes.tagsContainer}>
                {formData.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </div>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </MainContainer>
  );
};

export default ArticleForm;
