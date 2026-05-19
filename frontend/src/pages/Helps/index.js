import React, { useState, useEffect} from "react";
import { 
  makeStyles, 
  Paper, 
  Typography, 
  Modal, 
  IconButton, 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  Chip, 
  Container,
  TextField,
  InputAdornment
} from "@material-ui/core";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import CloseIcon from "@material-ui/icons/Close";
import SearchIcon from "@material-ui/icons/Search";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import useHelps from "../../hooks/useHelps";

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4),
  },
  headerCard: {
    background: "linear-gradient(135deg, #1A4783 0%, #0596cd 100%)",
    color: "#fff",
    padding: theme.spacing(3),
    borderRadius: "20px",
    marginBottom: theme.spacing(3),
    boxShadow: "0 4px 20px rgba(26, 71, 131, 0.3)",
  },
  headerTitle: {
    fontWeight: 700,
    marginBottom: theme.spacing(1),
  },
  headerSubtitle: {
    opacity: 0.9,
  },
  videosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: theme.spacing(3),
    marginTop: theme.spacing(3),
  },
  videoCard: {
    borderRadius: "16px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
      "& $playIcon": {
        opacity: 1,
        transform: "scale(1.1)",
      },
    },
  },
  thumbnailContainer: {
    position: "relative",
    paddingTop: "56.25%", // 16:9 aspect ratio
    overflow: "hidden",
    backgroundColor: "#000",
  },
  thumbnail: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  playIconOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0, 0, 0, 0.3)",
    transition: "background 0.3s",
  },
  playIcon: {
    fontSize: 64,
    color: "#fff",
    opacity: 0.8,
    transition: "all 0.3s",
  },
  cardContent: {
    padding: theme.spacing(2),
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
  },
  videoTitle: {
    fontWeight: 600,
    color: "#1A4783",
    marginBottom: theme.spacing(1),
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    lineHeight: 1.4,
  },
  videoDescription: {
    color: "#666",
    fontSize: "0.875rem",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    lineHeight: 1.5,
  },
  videoModal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
  },
  modalContent: {
    outline: 'none',
    width: '90%',
    maxWidth: 1200,
    position: 'relative',
    backgroundColor: '#000',
    borderRadius: "16px",
    overflow: 'hidden',
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  },
  closeButton: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "#fff",
    zIndex: 1,
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.9)",
    },
  },
  iframeContainer: {
    position: "relative",
    paddingTop: "56.25%",
    width: "100%",
  },
  iframe: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(8, 2),
  },
  emptyIcon: {
    fontSize: 80,
    color: "#ccc",
    marginBottom: theme.spacing(2),
  },
  badge: {
    backgroundColor: "#1A4783",
    color: "#fff",
    fontWeight: 600,
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.75rem",
  },
}));

const Helps = () => {
  const classes = useStyles();
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { list } = useHelps();
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const helps = await list();
      setRecords(helps);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openVideoModal = (video) => {
    setSelectedVideo(video);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  const handleModalClose = React.useCallback((event) => {
    if (event.key === "Escape") {
      closeVideoModal();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleModalClose);
    return () => {
      document.removeEventListener("keydown", handleModalClose);
    };
  }, [handleModalClose]);

  const renderVideoModal = () => {
    return (
      <Modal
        open={Boolean(selectedVideo)}
        onClose={closeVideoModal}
        className={classes.videoModal}
      >
        <div className={classes.modalContent}>
          <IconButton 
            className={classes.closeButton} 
            onClick={closeVideoModal}
            size="small"
          >
            <CloseIcon />
          </IconButton>
          {selectedVideo && (
            <div className={classes.iframeContainer}>
              <iframe
                className={classes.iframe}
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </Modal>
    );
  };

  const renderHelps = () => {
    const filteredRecords = records.filter(record => {
      const searchLower = searchTerm.toLowerCase();
      return (
        record.title.toLowerCase().includes(searchLower) ||
        (record.description && record.description.toLowerCase().includes(searchLower))
      );
    });

    if (!filteredRecords.length) {
      return (
        <Box className={classes.emptyState}>
          <PlayCircleOutlineIcon className={classes.emptyIcon} />
          <Typography variant="h6" color="textSecondary">
            {searchTerm 
              ? `Nenhum vídeo encontrado para "${searchTerm}"`
              : "Nenhum vídeo de ajuda disponível no momento"}
          </Typography>
        </Box>
      );
    }

    return (
      <div className={classes.videosGrid}>
        {filteredRecords.map((record, key) => (
          <Card 
            key={key} 
            className={classes.videoCard} 
            onClick={() => openVideoModal(record.video)}
          >
            <div className={classes.thumbnailContainer}>
              <img
                src={`https://img.youtube.com/vi/${record.video}/maxresdefault.jpg`}
                alt={record.title}
                className={classes.thumbnail}
                onError={(e) => {
                  e.target.src = `https://img.youtube.com/vi/${record.video}/hqdefault.jpg`;
                }}
              />
              <div className={classes.playIconOverlay}>
                <PlayCircleOutlineIcon className={classes.playIcon} />
              </div>
            </div>
            <CardContent className={classes.cardContent}>
              <Typography variant="h6" className={classes.videoTitle}>
                {record.title}
              </Typography>
              {record.description && (
                <Typography variant="body2" className={classes.videoDescription}>
                  {record.description}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("helps.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Chip label={`${records.length} vídeos`} className={classes.badge} />
        </MainHeaderButtonsWrapper>
      </MainHeader>
      
      <Container maxWidth="xl" className={classes.container}>
        <Paper className={classes.headerCard} elevation={0}>
          <Typography variant="h4" className={classes.headerTitle}>
            Central de Ajuda
          </Typography>
          <Typography variant="body1" className={classes.headerSubtitle}>
            Encontre tutoriais em vídeo e aprenda a usar todas as funcionalidades do sistema
          </Typography>
          <TextField
            fullWidth
            placeholder="Pesquisar vídeos de ajuda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            className={classes.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Paper>
        
        {renderHelps()}
      </Container>
      
      {renderVideoModal()}
    </MainContainer>
  );
};

export default Helps;