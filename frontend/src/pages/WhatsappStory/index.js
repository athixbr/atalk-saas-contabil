import React, { useState, useEffect, useContext, useCallback } from "react";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Grid,
  Avatar,
  Typography,
  Badge,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip,
  LinearProgress,
} from "@material-ui/core";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import VisibilityIcon from "@material-ui/icons/Visibility";
import ImageIcon from "@material-ui/icons/Image";
import VideoLabelIcon from "@material-ui/icons/VideoLabel";
import TextFieldsIcon from "@material-ui/icons/TextFields";
import CloseIcon from "@material-ui/icons/Close";
import SendIcon from "@material-ui/icons/Send";
import DeleteIcon from "@material-ui/icons/Delete";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { socketConnection } from "../../services/socket";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  publishBtn: {
    marginBottom: theme.spacing(2),
  },
  contactCard: {
    padding: theme.spacing(2),
    cursor: "pointer",
    borderRadius: 12,
    transition: "box-shadow 0.2s",
    "&:hover": {
      boxShadow: theme.shadows[4],
    },
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  unseenBadge: {
    "& .MuiBadge-badge": {
      backgroundColor: "#25D366",
      color: "#fff",
      fontSize: 10,
    },
  },
  storyAvatar: {
    width: 64,
    height: 64,
    border: (props) =>
      props.hasUnseen
        ? "3px solid #25D366"
        : "3px solid #ccc",
  },
  storyCount: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  storyViewerDialog: {
    "& .MuiDialog-paper": {
      backgroundColor: "#000",
      color: "#fff",
      minWidth: 340,
      maxWidth: 480,
      borderRadius: 16,
    },
  },
  storyContent: {
    minHeight: 300,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(2),
    position: "relative",
  },
  storyImage: {
    maxWidth: "100%",
    maxHeight: 400,
    borderRadius: 8,
    objectFit: "contain",
  },
  storyVideo: {
    maxWidth: "100%",
    maxHeight: 400,
    borderRadius: 8,
  },
  storyTextBox: {
    backgroundColor: (props) => props.backgroundColor || "#1fa855",
    padding: theme.spacing(3),
    borderRadius: 12,
    width: "100%",
    textAlign: "center",
  },
  storyNav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(1, 0),
  },
  publishForm: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    padding: theme.spacing(1, 0),
  },
  colorPreview: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: "1px solid #ccc",
    cursor: "pointer",
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: theme.spacing(1),
  },
  noStoriesBox: {
    textAlign: "center",
    padding: theme.spacing(6),
    color: theme.palette.text.secondary,
  },
}));

const BG_COLORS = [
  "#1fa855", "#0066ff", "#ff6600", "#cc0000",
  "#9900cc", "#ff3399", "#333333", "#006666",
];

const StoryViewerDialog = ({ open, onClose, contactGroup, onMarkSeen, onDelete }) => {
  const classes = useStyles({ backgroundColor: null });
  const [currentIdx, setCurrentIdx] = useState(0);

  const stories = contactGroup?.stories || [];
  const current = stories[currentIdx];

  useEffect(() => {
    if (open) setCurrentIdx(0);
  }, [open, contactGroup]);

  useEffect(() => {
    if (current && !current.seenAt) {
      onMarkSeen(current.id);
    }
  }, [current, onMarkSeen]);

  const handlePrev = () => setCurrentIdx((i) => Math.max(0, i - 1));
  const handleNext = () => {
    if (currentIdx < stories.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      onClose();
    }
  };

  const timeLeft = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return "Expirado";
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours}h restantes`;
    return `${mins}min restantes`;
  };

  if (!current) return null;

  const bgColor = current.backgroundColor || "#1fa855";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={classes.storyViewerDialog}
      maxWidth="xs"
      fullWidth
    >
      {/* Progress bars */}
      <div style={{ padding: "8px 16px 0", display: "flex", gap: 4 }}>
        {stories.map((_, idx) => (
          <LinearProgress
            key={idx}
            className={classes.progressBar}
            variant="determinate"
            value={idx < currentIdx ? 100 : idx === currentIdx ? 50 : 0}
            style={{ flex: 1, backgroundColor: "#444" }}
          />
        ))}
      </div>

      <DialogTitle style={{ color: "#fff", paddingBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar src={contactGroup?.senderProfilePic} style={{ width: 36, height: 36 }}>
            {(contactGroup?.senderName || contactGroup?.senderJid || "?")[0].toUpperCase()}
          </Avatar>
          <div>
            <Typography variant="subtitle2" style={{ color: "#fff", lineHeight: 1.2 }}>
              {contactGroup?.senderName || contactGroup?.senderJid}
            </Typography>
            <Typography variant="caption" style={{ color: "#aaa" }}>
              {timeLeft(current.expiresAt)}
            </Typography>
          </div>
          <IconButton size="small" onClick={onClose} style={{ marginLeft: "auto", color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent style={{ padding: 0 }}>
        <div className={classes.storyContent}>
          {current.mediaType === "text" && (
            <div className={classes.storyTextBox} style={{ backgroundColor: bgColor }}>
              <Typography variant="h6" style={{ color: "#fff", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {current.textContent}
              </Typography>
            </div>
          )}
          {current.mediaType === "image" && (
            <div style={{ textAlign: "center" }}>
              <img src={current.mediaUrl} alt="story" className={classes.storyImage} />
              {current.caption && (
                <Typography variant="body2" style={{ color: "#eee", marginTop: 8 }}>
                  {current.caption}
                </Typography>
              )}
            </div>
          )}
          {current.mediaType === "video" && (
            <div style={{ textAlign: "center" }}>
              <video src={current.mediaUrl} controls className={classes.storyVideo} />
              {current.caption && (
                <Typography variant="body2" style={{ color: "#eee", marginTop: 8 }}>
                  {current.caption}
                </Typography>
              )}
            </div>
          )}
        </div>
      </DialogContent>

      <DialogActions style={{ justifyContent: "space-between", padding: "8px 16px" }}>
        <Button
          size="small"
          onClick={handlePrev}
          disabled={currentIdx === 0}
          style={{ color: "#fff" }}
        >
          Anterior
        </Button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Typography variant="caption" style={{ color: "#aaa" }}>
            {currentIdx + 1} / {stories.length}
          </Typography>
          {onDelete && (
            <Tooltip title="Excluir story">
              <IconButton
                size="small"
                onClick={() => onDelete(current.id)}
                style={{ color: "#ff4444" }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </div>
        <Button size="small" onClick={handleNext} style={{ color: "#25D366" }}>
          {currentIdx < stories.length - 1 ? "Próximo" : "Fechar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const PublishStoryDialog = ({ open, onClose, connections, onPublished }) => {
  const classes = useStyles({});
  const [mediaType, setMediaType] = useState("text");
  const [whatsappId, setWhatsappId] = useState("");
  const [textContent, setTextContent] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#1fa855");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!whatsappId) {
      toast.warning("Selecione uma conexão WhatsApp");
      return;
    }
    if (mediaType === "text" && !textContent.trim()) {
      toast.warning("Digite o texto do story");
      return;
    }
    if ((mediaType === "image" || mediaType === "video") && !file) {
      toast.warning("Selecione um arquivo de mídia");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("whatsappId", whatsappId);
      formData.append("mediaType", mediaType);
      if (mediaType === "text") {
        formData.append("textContent", textContent);
        formData.append("backgroundColor", backgroundColor);
      } else {
        formData.append("caption", caption);
        if (file) formData.append("media", file);
      }

      await api.post("/whatsapp-stories/publish", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Story publicado com sucesso!");
      onPublished();
      onClose();
      setTextContent("");
      setCaption("");
      setFile(null);
      setWhatsappId("");
      setMediaType("text");
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Publicar Story</DialogTitle>
      <DialogContent>
        <div className={classes.publishForm}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel>Conexão WhatsApp</InputLabel>
            <Select
              value={whatsappId}
              onChange={(e) => setWhatsappId(e.target.value)}
              label="Conexão WhatsApp"
            >
              {connections.map((conn) => (
                <MenuItem key={conn.id} value={conn.id}>
                  {conn.name} {conn.status !== "CONNECTED" ? `(${conn.status})` : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel>Tipo de Story</InputLabel>
            <Select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
              label="Tipo de Story"
            >
              <MenuItem value="text">
                <TextFieldsIcon style={{ marginRight: 8, fontSize: 18 }} /> Texto
              </MenuItem>
              <MenuItem value="image">
                <ImageIcon style={{ marginRight: 8, fontSize: 18 }} /> Imagem
              </MenuItem>
              <MenuItem value="video">
                <VideoLabelIcon style={{ marginRight: 8, fontSize: 18 }} /> Vídeo
              </MenuItem>
            </Select>
          </FormControl>

          {mediaType === "text" && (
            <>
              <TextField
                label="Texto do story"
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                inputProps={{ maxLength: 700 }}
                helperText={`${textContent.length}/700`}
              />
              <div>
                <Typography variant="caption" color="textSecondary">
                  Cor de fundo
                </Typography>
                <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                  {BG_COLORS.map((color) => (
                    <Tooltip key={color} title={color}>
                      <div
                        className={classes.colorPreview}
                        style={{
                          backgroundColor: color,
                          boxShadow: backgroundColor === color ? `0 0 0 3px ${color}55, 0 0 0 5px #fff` : "none",
                        }}
                        onClick={() => setBackgroundColor(color)}
                      />
                    </Tooltip>
                  ))}
                </div>
                <div
                  style={{
                    marginTop: 12,
                    backgroundColor,
                    borderRadius: 8,
                    padding: "16px 24px",
                    textAlign: "center",
                    minHeight: 60,
                    color: "#fff",
                  }}
                >
                  <Typography variant="body1" style={{ wordBreak: "break-word" }}>
                    {textContent || "Prévia do story"}
                  </Typography>
                </div>
              </div>
            </>
          )}

          {(mediaType === "image" || mediaType === "video") && (
            <>
              <Button
                variant="outlined"
                component="label"
                startIcon={mediaType === "image" ? <ImageIcon /> : <VideoLabelIcon />}
              >
                {file ? file.name : `Selecionar ${mediaType === "image" ? "imagem" : "vídeo"}`}
                <input
                  type="file"
                  hidden
                  accept={mediaType === "image" ? "image/*" : "video/*"}
                  onChange={(e) => setFile(e.target.files[0] || null)}
                />
              </Button>
              <TextField
                label="Legenda (opcional)"
                fullWidth
                variant="outlined"
                size="small"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                inputProps={{ maxLength: 300 }}
              />
            </>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
        >
          Publicar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const WhatsappStory = () => {
  const classes = useStyles({});
  const { user } = useContext(AuthContext);
  const [contactGroups, setContactGroups] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [filter, setFilter] = useState("received");

  const loadStories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/whatsapp-stories", {
        params: { direction: filter, onlyActive: "true" },
      });
      setContactGroups(data);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const loadConnections = useCallback(async () => {
    try {
      const { data } = await api.get("/whatsapp");
      setConnections(
        (data?.whatsapps || []).filter(
          (w) => w.provider === "baileys2026" || w.provider === "whatsapp2026"
        )
      );
    } catch (err) {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    loadStories();
    loadConnections();
  }, [loadStories, loadConnections]);

  // Escuta stories em tempo real via socket
  useEffect(() => {
    const socket = socketConnection({ companyId: user.companyId, userId: user.id });
    socket.on(`company-${user.companyId}-story`, (data) => {
      if (data.action === "new") {
        loadStories();
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [user.companyId, user.id, loadStories]);

  const handleMarkSeen = useCallback(async (storyId) => {
    try {
      await api.put(`/whatsapp-stories/${storyId}/seen`);
      setContactGroups((prev) =>
        prev.map((g) => ({
          ...g,
          stories: g.stories.map((s) =>
            s.id === storyId ? { ...s, seenAt: new Date().toISOString() } : s
          ),
          hasUnseen: g.stories.some((s) => s.id !== storyId && !s.seenAt),
        }))
      );
    } catch (err) {
      // silently ignore
    }
  }, []);

  const handleOpenViewer = (group) => {
    setSelectedGroup(group);
    setViewerOpen(true);
  };

  const handleDeleteStory = useCallback(async (storyId) => {
    try {
      await api.delete(`/whatsapp-stories/${storyId}`);
      toast.success("Story excluído com sucesso!");
      setContactGroups((prev) => {
        const updated = prev
          .map((g) => ({
            ...g,
            stories: g.stories.filter((s) => s.id !== storyId),
          }))
          .filter((g) => g.stories.length > 0);
        return updated;
      });
      setSelectedGroup((prev) => {
        if (!prev) return prev;
        const stories = prev.stories.filter((s) => s.id !== storyId);
        if (stories.length === 0) {
          setViewerOpen(false);
          return null;
        }
        return { ...prev, stories };
      });
    } catch (err) {
      toastError(err);
    }
  }, []);

  return (
    <MainContainer>
      <MainHeader>
        <Title>Stories WhatsApp</Title>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => setPublishOpen(true)}
          className={classes.publishBtn}
        >
          Publicar Story
        </Button>
      </MainHeader>

      <Paper className={classes.root} elevation={0}>
        {/* Filtros */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <Chip
            label="Recebidos (contatos)"
            clickable
            color={filter === "received" ? "primary" : "default"}
            onClick={() => setFilter("received")}
            icon={<VisibilityIcon />}
          />
          <Chip
            label="Publicados por mim"
            clickable
            color={filter === "sent" ? "primary" : "default"}
            onClick={() => setFilter("sent")}
            icon={<SendIcon />}
          />
          <Chip
            label="Todos"
            clickable
            color={filter === "all" ? "primary" : "default"}
            onClick={() => setFilter("all")}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 32 }}>
            <CircularProgress />
          </div>
        ) : contactGroups.length === 0 ? (
          <div className={classes.noStoriesBox}>
            <Typography variant="h6">Nenhum story encontrado</Typography>
            <Typography variant="body2">
              {filter === "received"
                ? "Stories de contatos aparecerão aqui automaticamente quando recebidos."
                : "Publique um story usando o botão acima."}
            </Typography>
          </div>
        ) : (
          <Grid container spacing={2}>
            {contactGroups.map((group) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={group.senderJid}>
                <Paper
                  className={classes.contactCard}
                  onClick={() => handleOpenViewer(group)}
                  elevation={1}
                >
                  <Badge
                    badgeContent={group.storiesCount}
                    color="primary"
                    className={classes.unseenBadge}
                  >
                    <Avatar
                      src={group.senderProfilePic}
                      className={classes.storyAvatar}
                      style={{
                        border: group.hasUnseen
                          ? "3px solid #25D366"
                          : "3px solid #ccc",
                      }}
                    >
                      {(group.senderName || group.senderJid || "?")[0].toUpperCase()}
                    </Avatar>
                  </Badge>
                  <Typography
                    variant="caption"
                    align="center"
                    style={{
                      fontWeight: group.hasUnseen ? 700 : 400,
                      maxWidth: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {group.senderName ||
                      group.senderJid.replace("@s.whatsapp.net", "").replace("@c.us", "")}
                  </Typography>
                  {group.hasUnseen && (
                    <Chip label="Novo" size="small" style={{ backgroundColor: "#25D366", color: "#fff" }} />
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Visualizador de story */}
      <StoryViewerDialog
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        contactGroup={selectedGroup}
        onMarkSeen={handleMarkSeen}
        onDelete={handleDeleteStory}
      />

      {/* Dialog publicar story */}
      <PublishStoryDialog
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        connections={connections}
        onPublished={loadStories}
      />
    </MainContainer>
  );
};

export default WhatsappStory;
