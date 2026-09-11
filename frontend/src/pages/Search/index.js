import React, { useState, useEffect, useCallback, useRef } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Avatar,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Divider,
  Box,
  Tooltip,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import ClearIcon from "@material-ui/icons/Clear";
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import ImageIcon from "@material-ui/icons/Image";
import VideocamIcon from "@material-ui/icons/Videocam";
import AudiotrackIcon from "@material-ui/icons/Audiotrack";
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    height: "calc(100vh - 80px)",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  searchInput: {
    flex: 1,
  },
  tabsBar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  resultsArea: {
    flex: 1,
    overflowY: "auto",
    paddingRight: theme.spacing(1),
    "&::-webkit-scrollbar": { width: 6 },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(0,0,0,0.15)",
      borderRadius: 3,
    },
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: 300,
    color: theme.palette.text.secondary,
    gap: theme.spacing(1),
  },
  resultCard: {
    marginBottom: theme.spacing(1.5),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    transition: "box-shadow 0.2s",
    "&:hover": {
      boxShadow: theme.shadows[3],
    },
  },
  cardContent: {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1.5),
    padding: `${theme.spacing(1.5)}px !important`,
  },
  mediaThumb: {
    width: 72,
    height: 72,
    borderRadius: 6,
    objectFit: "cover",
    flexShrink: 0,
    backgroundColor: theme.palette.grey[200],
  },
  mediaIcon: {
    width: 72,
    height: 72,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.grey[100],
    flexShrink: 0,
    "& svg": {
      fontSize: 32,
      color: theme.palette.text.secondary,
    },
  },
  cardInfo: {
    flex: 1,
    minWidth: 0,
  },
  contactRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: 2,
  },
  contactAvatar: {
    width: 24,
    height: 24,
    fontSize: 12,
  },
  contactName: {
    fontWeight: 600,
    fontSize: 14,
    color: theme.palette.text.primary,
  },
  bodyText: {
    fontSize: 13,
    color: theme.palette.text.secondary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    "-webkit-line-clamp": 2,
    "-webkit-box-orient": "vertical",
    lineHeight: 1.4,
    marginBottom: 4,
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flexWrap: "wrap",
  },
  ticketChip: {
    height: 20,
    fontSize: 11,
  },
  dateText: {
    fontSize: 11,
    color: theme.palette.text.secondary,
  },
  openBtn: {
    marginLeft: "auto",
    padding: 4,
    color: theme.palette.primary.main,
    flexShrink: 0,
  },
  loadMore: {
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(2),
  },
  countText: {
    fontSize: 12,
    color: theme.palette.text.secondary,
    padding: `${theme.spacing(0.5)}px 0`,
  },
}));

const TAB_TYPES = [
  { label: "Todos", value: "all", icon: null },
  { label: "Textos", value: "text", icon: <ChatBubbleOutlineIcon fontSize="small" /> },
  { label: "Imagens", value: "image", icon: <ImageIcon fontSize="small" /> },
  { label: "Vídeos", value: "video", icon: <VideocamIcon fontSize="small" /> },
  { label: "Áudios", value: "audio", icon: <AudiotrackIcon fontSize="small" /> },
  { label: "Documentos", value: "application", icon: <InsertDriveFileIcon fontSize="small" /> },
];

const STATUS_LABELS = {
  open: { label: "Aberto", color: "primary" },
  pending: { label: "Pendente", color: "default" },
  closed: { label: "Fechado", color: "default" },
};

function MediaThumb({ message, classes }) {
  const { mediaType, mediaUrl } = message;

  if (mediaType === "image" && mediaUrl) {
    return (
      <img
        src={mediaUrl}
        alt="imagem"
        className={classes.mediaThumb}
        onError={(e) => { e.target.style.display = "none"; }}
      />
    );
  }

  if (mediaType === "video") {
    return (
      <div className={classes.mediaIcon}>
        <VideocamIcon />
      </div>
    );
  }

  if (mediaType === "audio" || mediaType === "ptt") {
    return (
      <div className={classes.mediaIcon}>
        <AudiotrackIcon />
      </div>
    );
  }

  if (mediaType === "application") {
    return (
      <div className={classes.mediaIcon}>
        <InsertDriveFileIcon />
      </div>
    );
  }

  return (
    <div className={classes.mediaIcon}>
      <ChatBubbleOutlineIcon />
    </div>
  );
}

function getFileNameFromUrl(url) {
  if (!url) return "";
  try {
    const parts = url.split("/");
    return decodeURIComponent(parts[parts.length - 1]);
  } catch {
    return url;
  }
}

function highlightText(text, query) {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} style={{ backgroundColor: "#fff176", borderRadius: 2, padding: "0 1px" }}>
        {part}
      </mark>
    ) : part
  );
}

export default function Search() {
  const classes = useStyles();
  const history = useHistory();

  const [searchInput, setSearchInput] = useState("");
  const [searchParam, setSearchParam] = useState("");
  const [mediaType, setMediaType] = useState("all");
  const [messages, setMessages] = useState([]);
  const [count, setCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const debounceRef = useRef(null);

  const fetchResults = useCallback(async (param, type, page) => {
    if (!param && type === "all") {
      setMessages([]);
      setCount(0);
      setHasMore(false);
      setSearched(false);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get("/message-search", {
        params: { searchParam: param, mediaType: type, pageNumber: page },
      });
      if (page === 1) {
        setMessages(data.messages);
      } else {
        setMessages((prev) => [...prev, ...data.messages]);
      }
      setCount(data.count);
      setHasMore(data.hasMore);
      setSearched(true);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce text search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPageNumber(1);
      setSearchParam(searchInput);
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  // Fetch when param or type changes
  useEffect(() => {
    setPageNumber(1);
    fetchResults(searchParam, mediaType, 1);
  }, [searchParam, mediaType, fetchResults]);

  // Fetch when page changes (load more)
  useEffect(() => {
    if (pageNumber > 1) {
      fetchResults(searchParam, mediaType, pageNumber);
    }
  }, [pageNumber, fetchResults, searchParam, mediaType]);

  const handleTabChange = (_, newValue) => {
    setMediaType(newValue);
  };

  const handleOpenTicket = (ticketId) => {
    history.push(`/tickets/${ticketId}`);
  };

  const handleOpenMedia = (url) => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const formatDate = (dateStr) => {
    try {
      return format(parseISO(dateStr), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return "";
    }
  };

  const getBodyDisplay = (msg) => {
    if (msg.mediaType === "image" || msg.mediaType === "video" || msg.mediaType === "audio" || msg.mediaType === "ptt") {
      return msg.body || getFileNameFromUrl(msg.mediaUrl) || "Arquivo de mídia";
    }
    if (msg.mediaType === "application") {
      return getFileNameFromUrl(msg.mediaUrl) || msg.body || "Documento";
    }
    return msg.body || "";
  };

  return (
    <MainContainer>
      <Paper className={classes.root} elevation={0}>
        <MainHeader>
          <Title>Busca Global</Title>
        </MainHeader>

        {/* Barra de busca */}
        <div className={classes.searchBar}>
          <TextField
            className={classes.searchInput}
            variant="outlined"
            size="small"
            placeholder="Buscar em conversas, arquivos, documentos..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchInput ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchInput("")}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </div>

        {/* Abas de tipo */}
        <Tabs
          value={mediaType}
          onChange={handleTabChange}
          className={classes.tabsBar}
          variant="scrollable"
          scrollButtons="auto"
          indicatorColor="primary"
          textColor="primary"
        >
          {TAB_TYPES.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              icon={tab.icon}
              style={{ minWidth: 90, fontSize: 13 }}
            />
          ))}
        </Tabs>

        {/* Contagem */}
        {searched && !loading && (
          <Typography className={classes.countText}>
            {count === 0
              ? "Nenhum resultado encontrado"
              : `${count} resultado${count !== 1 ? "s" : ""} encontrado${count !== 1 ? "s" : ""}`}
          </Typography>
        )}

        {/* Resultados */}
        <div className={classes.resultsArea}>
          {!searched && !loading && (
            <div className={classes.emptyState}>
              <SearchIcon style={{ fontSize: 64, opacity: 0.2 }} />
              <Typography variant="body2">
                Digite algo para buscar em todas as conversas e arquivos
              </Typography>
            </div>
          )}

          {loading && pageNumber === 1 && (
            <div className={classes.emptyState}>
              <CircularProgress size={40} />
            </div>
          )}

          {messages.map((msg) => {
            const statusInfo = STATUS_LABELS[msg.ticketStatus] || { label: msg.ticketStatus, color: "default" };
            const bodyDisplay = getBodyDisplay(msg);

            return (
              <Card key={msg.id} className={classes.resultCard} elevation={0}>
                <CardContent className={classes.cardContent}>
                  {/* Thumb/ícone */}
                  <div
                    style={{ cursor: msg.mediaUrl ? "pointer" : "default" }}
                    onClick={() => msg.mediaUrl && handleOpenMedia(msg.mediaUrl)}
                  >
                    <MediaThumb message={msg} classes={classes} />
                  </div>

                  {/* Informações */}
                  <div className={classes.cardInfo}>
                    <div className={classes.contactRow}>
                      <Avatar
                        src={msg.contactProfilePicUrl || undefined}
                        className={classes.contactAvatar}
                      >
                        {msg.contactName?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Typography className={classes.contactName} noWrap>
                        {msg.contactName}
                      </Typography>
                      {msg.contactNumber && (
                        <Typography
                          style={{ fontSize: 12, color: "rgba(0,0,0,0.45)" }}
                          noWrap
                        >
                          {msg.contactNumber}
                        </Typography>
                      )}
                    </div>

                    <Typography className={classes.bodyText}>
                      {highlightText(bodyDisplay, searchParam)}
                    </Typography>

                    <div className={classes.metaRow}>
                      <Chip
                        label={`#${msg.ticketId}`}
                        size="small"
                        className={classes.ticketChip}
                        color="primary"
                        variant="outlined"
                        onClick={() => handleOpenTicket(msg.ticketId)}
                      />
                      <Chip
                        label={statusInfo.label}
                        size="small"
                        className={classes.ticketChip}
                        color={statusInfo.color}
                      />
                      {msg.queueName && (
                        <Chip
                          label={msg.queueName}
                          size="small"
                          className={classes.ticketChip}
                        />
                      )}
                      <Typography className={classes.dateText}>
                        {formatDate(msg.createdAt)}
                      </Typography>
                    </div>
                  </div>

                  {/* Botão abrir ticket */}
                  <Tooltip title="Abrir ticket">
                    <IconButton
                      className={classes.openBtn}
                      size="small"
                      onClick={() => handleOpenTicket(msg.ticketId)}
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardContent>
              </Card>
            );
          })}

          {/* Load more */}
          {hasMore && !loading && (
            <div className={classes.loadMore}>
              <Chip
                label="Carregar mais"
                clickable
                color="primary"
                variant="outlined"
                onClick={() => setPageNumber((prev) => prev + 1)}
              />
            </div>
          )}

          {loading && pageNumber > 1 && (
            <div className={classes.loadMore}>
              <CircularProgress size={24} />
            </div>
          )}
        </div>
      </Paper>
    </MainContainer>
  );
}
