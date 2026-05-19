import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Paper,
  Typography,
  Chip,
  Avatar,
  Divider,
  Box,
  IconButton,
  Button,
  Grid,
  Card,
  CardMedia,
} from "@material-ui/core";
import {
  ArrowBack,
  Edit,
  Visibility,
  Schedule,
  Person,
  Category as CategoryIcon,
  LocalOffer,
  PlayCircleOutline,
  GetApp,
} from "@material-ui/icons";
import { useHistory, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { getArticle, incrementArticleView } from "../../services/knowledgeBase";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4),
  },
  backButton: {
    marginBottom: theme.spacing(2),
  },
  headerCard: {
    padding: theme.spacing(4),
    marginBottom: theme.spacing(3),
    borderRadius: "16px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
  },
  title: {
    fontWeight: 700,
    marginBottom: theme.spacing(2),
  },
  metaInfo: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    alignItems: "center",
    marginTop: theme.spacing(2),
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
  contentPaper: {
    padding: theme.spacing(4),
    borderRadius: "16px",
    marginBottom: theme.spacing(3),
  },
  content: {
    fontSize: "1.1rem",
    lineHeight: 1.8,
    color: theme.palette.text.primary,
    "& img": {
      maxWidth: "100%",
      height: "auto",
      borderRadius: "8px",
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    "& h1, & h2, & h3": {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(2),
    },
    "& p": {
      marginBottom: theme.spacing(2),
    },
    "& ul, & ol": {
      marginBottom: theme.spacing(2),
      paddingLeft: theme.spacing(3),
    },
    "& code": {
      backgroundColor: theme.palette.grey[100],
      padding: "2px 6px",
      borderRadius: "4px",
      fontFamily: "monospace",
    },
    "& pre": {
      backgroundColor: theme.palette.grey[100],
      padding: theme.spacing(2),
      borderRadius: "8px",
      overflow: "auto",
      marginBottom: theme.spacing(2),
    },
  },
  sidebarCard: {
    padding: theme.spacing(2),
    borderRadius: "12px",
    marginBottom: theme.spacing(2),
  },
  categoryCard: {
    padding: theme.spacing(2),
    borderRadius: "12px",
    marginBottom: theme.spacing(2),
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    color: "#fff",
  },
  tagsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  videoCard: {
    marginBottom: theme.spacing(2),
    borderRadius: "12px",
    overflow: "hidden",
  },
  videoThumbnail: {
    position: "relative",
    paddingTop: "56.25%", // 16:9
    cursor: "pointer",
  },
  playIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: 64,
    color: "#fff",
  },
  attachmentItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1.5),
    borderRadius: "8px",
    backgroundColor: theme.palette.background.default,
    marginBottom: theme.spacing(1),
  },
  authorCard: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: "12px",
    backgroundColor: theme.palette.background.default,
    marginBottom: theme.spacing(2),
  },
}));

const ViewArticle = () => {
  const classes = useStyles();
  const history = useHistory();
  const { articleId } = useParams();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [articleId]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const response = await getArticle(articleId);
      setArticle(response.data);
      
      // Incrementar visualizações
      await incrementArticleView(articleId);
    } catch (error) {
      console.error("Erro ao carregar artigo:", error);
      toast.error("Erro ao carregar artigo");
      history.push("/base-conhecimento");
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const openVideo = (video) => {
    window.open(video.videoUrl, "_blank");
  };

  const downloadFile = (attachment) => {
    const url = `${process.env.REACT_APP_BACKEND_URL}/public/${attachment.filePath}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <MainContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography>Carregando...</Typography>
        </Box>
      </MainContainer>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <MainContainer>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => history.push("/base-conhecimento")}
        className={classes.backButton}
      >
        Voltar
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12} md={9}>
          {/* Cabeçalho do Artigo */}
          <Paper className={classes.headerCard}>
            <Typography variant="h4" className={classes.title}>
              {article.title}
            </Typography>

            {article.summary && (
              <Typography variant="h6" style={{ opacity: 0.9, fontWeight: 400 }}>
                {article.summary}
              </Typography>
            )}

            <div className={classes.metaInfo}>
              <div className={classes.metaItem}>
                <Person fontSize="small" />
                <Typography variant="body2">
                  {article.user?.name}
                </Typography>
              </div>

              <div className={classes.metaItem}>
                <Schedule fontSize="small" />
                <Typography variant="body2">
                  {article.publishedAt
                    ? format(parseISO(article.publishedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                    : format(parseISO(article.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </Typography>
              </div>

              <div className={classes.metaItem}>
                <Visibility fontSize="small" />
                <Typography variant="body2">
                  {article.views} visualizações
                </Typography>
              </div>
            </div>
          </Paper>

          {/* Conteúdo */}
          <Paper className={classes.contentPaper}>
            <div
              className={classes.content}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </Paper>

          {/* Vídeos */}
          {article.videos && article.videos.length > 0 && (
            <Paper className={classes.contentPaper}>
              <Typography variant="h6" gutterBottom style={{ fontWeight: 600 }}>
                📹 Vídeos
              </Typography>
              <Divider style={{ marginBottom: 16 }} />
              
              {article.videos.map((video) => {
                const videoId = getYouTubeVideoId(video.videoUrl);
                return (
                  <Card key={video.id} className={classes.videoCard}>
                    <div
                      className={classes.videoThumbnail}
                      onClick={() => openVideo(video)}
                      style={{
                        backgroundImage: videoId
                          ? `url(https://img.youtube.com/vi/${videoId}/maxresdefault.jpg)`
                          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <PlayCircleOutline className={classes.playIcon} />
                    </div>
                    {video.title && (
                      <Box p={2}>
                        <Typography variant="subtitle1">{video.title}</Typography>
                      </Box>
                    )}
                  </Card>
                );
              })}
            </Paper>
          )}

          {/* Anexos */}
          {article.attachments && article.attachments.length > 0 && (
            <Paper className={classes.contentPaper}>
              <Typography variant="h6" gutterBottom style={{ fontWeight: 600 }}>
                📎 Anexos
              </Typography>
              <Divider style={{ marginBottom: 16 }} />
              
              {article.attachments.map((attachment) => (
                <div key={attachment.id} className={classes.attachmentItem}>
                  <div>
                    <Typography variant="body1">{attachment.fileName}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {attachment.fileType.toUpperCase()} •{" "}
                      {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </div>
                  <IconButton
                    color="primary"
                    onClick={() => downloadFile(attachment)}
                  >
                    <GetApp />
                  </IconButton>
                </div>
              ))}
            </Paper>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          {/* Autor */}
          <div className={classes.authorCard}>
            <Avatar style={{ width: 48, height: 48 }}>
              {article.user?.name?.charAt(0)}
            </Avatar>
            <div>
              <Typography variant="subtitle2" style={{ fontWeight: 600 }}>
                Criado por
              </Typography>
              <Typography variant="body2">{article.user?.name}</Typography>
            </div>
          </div>

          {/* Categoria */}
          {article.category && (
            <Paper className={classes.categoryCard}>
              <Typography variant="subtitle2" style={{ fontWeight: 600, marginBottom: 8 }}>
                <CategoryIcon fontSize="small" /> Categoria
              </Typography>
              <Typography variant="h6">
                {article.category.icon} {article.category.name}
              </Typography>
              {article.category.description && (
                <Typography variant="body2" style={{ marginTop: 8, opacity: 0.9 }}>
                  {article.category.description}
                </Typography>
              )}
            </Paper>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <Paper className={classes.sidebarCard}>
              <Typography variant="subtitle2" style={{ fontWeight: 600, marginBottom: 8 }}>
                <LocalOffer fontSize="small" /> Tags
              </Typography>
              <div className={classes.tagsContainer}>
                {article.tags.map((tag) => (
                  <Chip
                    key={tag.id}
                    label={tag.name}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </div>
            </Paper>
          )}

          {/* Ações */}
          <Paper className={classes.sidebarCard}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<Edit />}
              onClick={() => history.push(`/base-conhecimento/editar/${article.id}`)}
              style={{ marginBottom: 8 }}
            >
              Editar Artigo
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </MainContainer>
  );
};

export default ViewArticle;
