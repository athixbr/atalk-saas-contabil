import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Button
} from "@material-ui/core";
import { Close, GetApp } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    maxWidth: "90vw",
    maxHeight: "90vh",
    width: "100%",
    height: "100%"
  },
  dialogTitle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2)
  },
  dialogContent: {
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    position: "relative",
    overflow: "auto"
  },
  imagePreview: {
    maxWidth: "100%",
    maxHeight: "calc(90vh - 80px)",
    objectFit: "contain"
  },
  pdfPreview: {
    width: "100%",
    height: "calc(90vh - 80px)",
    border: "none"
  },
  textPreview: {
    width: "100%",
    height: "calc(90vh - 80px)",
    padding: theme.spacing(2),
    backgroundColor: "white",
    overflow: "auto",
    fontFamily: "monospace",
    whiteSpace: "pre-wrap",
    wordWrap: "break-word"
  },
  officePreview: {
    width: "100%",
    height: "calc(90vh - 80px)",
    border: "none"
  },
  noPreview: {
    textAlign: "center",
    padding: theme.spacing(4)
  },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "calc(90vh - 80px)"
  }
}));

const FilePreviewDialog = ({ open, onClose, file }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [textContent, setTextContent] = useState(null);
  const [error, setError] = useState(false);

  const isImage = file?.mimeType?.startsWith("image/");
  const isPdf = file?.mimeType === "application/pdf";
  const isText = file?.mimeType === "text/plain" || file?.mimeType === "text/csv";
  const isWord = 
    file?.mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file?.mimeType === "application/msword";
  const isExcel = 
    file?.mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file?.mimeType === "application/vnd.ms-excel";
  const isOffice = isWord || isExcel;

  const canPreview = isImage || isPdf || isText || isOffice;

  useEffect(() => {
    if (!open || !file) {
      setPreviewUrl(null);
      setTextContent(null);
      setLoading(true);
      setError(false);
      return;
    }

    const loadPreview = async () => {
      setLoading(true);
      setError(false);

      try {
        if (isImage) {
          // Para imagens, fazer requisição com token e criar blob URL
          const { data } = await api.get(`/ged/files/${file.id}/preview`, {
            responseType: "blob"
          });
          const url = window.URL.createObjectURL(new Blob([data], { type: file.mimeType }));
          setPreviewUrl(url);
        } else if (isPdf) {
          // Para PDFs, fazer requisição com token e criar blob URL específico para PDF
          const { data } = await api.get(`/ged/files/${file.id}/preview`, {
            responseType: "blob"
          });
          const url = window.URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
          setPreviewUrl(url);
        } else if (isText) {
          // Para arquivos de texto, baixar o conteúdo
          const { data } = await api.get(`/ged/files/${file.id}/preview`, {
            responseType: "text"
          });
          setTextContent(data);
        } else if (isOffice) {
          // Para arquivos Office, fazer requisição e usar Google Docs Viewer
          const { data } = await api.get(`/ged/files/${file.id}/preview`, {
            responseType: "blob"
          });
          const url = window.URL.createObjectURL(new Blob([data]));
          setPreviewUrl(url);
        }
      } catch (err) {
        console.error("Erro ao carregar preview:", err);
        setError(true);
        toast.error("Erro ao carregar pré-visualização");
      } finally {
        setLoading(false);
      }
    };

    loadPreview();

    // Cleanup: revogar blob URL quando o componente desmontar
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [open, file, isImage, isPdf, isText, isOffice]);

  const handleDownload = async () => {
    try {
      const { data } = await api.get(`/ged/files/${file.id}/download`, {
        responseType: "blob"
      });
      
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao fazer download:", err);
      toast.error("Erro ao fazer download do arquivo");
    }
  };

  if (!file) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      classes={{ paper: classes.dialogPaper }}
    >
      <DialogTitle className={classes.dialogTitle} disableTypography>
        <Box display="flex" alignItems="center" flex={1}>
          <Typography variant="h6" noWrap>
            {file.originalName}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Button
            startIcon={<GetApp />}
            onClick={handleDownload}
            color="primary"
            variant="outlined"
            size="small"
          >
            Download
          </Button>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        {loading && (
          <Box className={classes.loading}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && (
          <Box className={classes.noPreview}>
            <Typography variant="h6" gutterBottom>
              Erro ao carregar pré-visualização
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<GetApp />}
              onClick={handleDownload}
            >
              Fazer Download
            </Button>
          </Box>
        )}

        {!loading && !error && !canPreview && (
          <Box className={classes.noPreview}>
            <Typography variant="h6" gutterBottom>
              Pré-visualização não disponível
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Este tipo de arquivo não suporta visualização.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<GetApp />}
              onClick={handleDownload}
            >
              Fazer Download
            </Button>
          </Box>
        )}

        {!loading && !error && isImage && previewUrl && (
          <img
            src={previewUrl}
            alt={file.originalName}
            className={classes.imagePreview}
          />
        )}

        {!loading && !error && isPdf && previewUrl && (
          <embed
            src={previewUrl}
            type="application/pdf"
            className={classes.pdfPreview}
            title={file.originalName}
          />
        )}

        {!loading && !error && isText && textContent !== null && (
          <Box className={classes.textPreview}>
            {textContent}
          </Box>
        )}

        {!loading && !error && isOffice && previewUrl && (
          <iframe
            src={previewUrl}
            title={file.originalName}
            className={classes.officePreview}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FilePreviewDialog;
