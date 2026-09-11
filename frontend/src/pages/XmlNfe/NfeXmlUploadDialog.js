import React, { useState, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from "@material-ui/core";
import {
  CloudUpload as UploadIcon,
  CheckCircle as SuccessIcon,
  ErrorOutline as ErrorIcon,
  FileCopy as DuplicateIcon,
  Cancel as CancelIcon,
} from "@material-ui/icons";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  uploadZone: {
    border: `2px dashed ${theme.palette.primary.main}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(4),
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s",
    backgroundColor: theme.palette.background.default,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.primary.dark,
    },
    "&.active": {
      backgroundColor: theme.palette.primary.light,
      borderColor: theme.palette.primary.dark,
    },
  },
  uploadIcon: {
    fontSize: 64,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
  },
  resultsList: {
    maxHeight: 300,
    overflowY: "auto",
    marginTop: theme.spacing(2),
  },
}));

const NfeXmlUploadDialog = ({ open, onClose, onUploaded }) => {
  const classes = useStyles();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState(null);

  const handleUpload = async (files) => {
    setUploading(true);
    setUploadProgress(0);
    setResults(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const { data } = await api.post("/nfe-xml/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        },
      });

      setResults(data);

      if (data.imported.length > 0) {
        toast.success(`${data.imported.length} NF-e importada(s) com sucesso!`);
        onUploaded();
      }
      if (data.errors.length > 0) {
        toast.warn(`${data.errors.length} arquivo(s) com erro. Veja os detalhes.`);
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error(error.response?.data?.message || "Erro ao enviar os arquivos");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    handleUpload(acceptedFiles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ".xml,text/xml,application/xml",
  });

  const handleClose = () => {
    if (uploading) return;
    setResults(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Importar XML de NF-e</DialogTitle>
      <DialogContent>
        <div {...getRootProps()} className={`${classes.uploadZone} ${isDragActive ? "active" : ""}`}>
          <input {...getInputProps()} />
          <UploadIcon className={classes.uploadIcon} />
          <Typography variant="h6">
            {isDragActive ? "Solte os arquivos aqui..." : "Arraste arquivos XML ou clique para selecionar"}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Aceita múltiplos arquivos .xml de NF-e (modelo 55)
          </Typography>
        </div>

        {uploading && (
          <Box mt={2} textAlign="center">
            <CircularProgress variant="determinate" value={uploadProgress} />
            <Typography align="center">{uploadProgress}%</Typography>
          </Box>
        )}

        {results && (
          <List dense className={classes.resultsList}>
            {results.imported.map((nfe) => (
              <ListItem key={`imported-${nfe.id}`}>
                <ListItemIcon>
                  <SuccessIcon style={{ color: "#4caf50" }} />
                </ListItemIcon>
                <ListItemText
                  primary={nfe.xmlOriginalNome}
                  secondary={`Importada — NF ${nfe.numeroNF || "-"}`}
                />
                <Chip size="small" label="Importada" style={{ backgroundColor: "#4caf50", color: "#fff" }} />
              </ListItem>
            ))}
            {results.cancelamentos.map((c, idx) => (
              <ListItem key={`cancel-${idx}`}>
                <ListItemIcon>
                  <CancelIcon style={{ color: "#ff9800" }} />
                </ListItemIcon>
                <ListItemText
                  primary={c.fileName}
                  secondary={`Evento de cancelamento aplicado à chave ${c.chaveAcesso}`}
                />
                <Chip size="small" label="Cancelamento" style={{ backgroundColor: "#ff9800", color: "#fff" }} />
              </ListItem>
            ))}
            {results.duplicates.map((d, idx) => (
              <ListItem key={`dup-${idx}`}>
                <ListItemIcon>
                  <DuplicateIcon color="disabled" />
                </ListItemIcon>
                <ListItemText primary={d.fileName} secondary="Já importado anteriormente (duplicado)" />
                <Chip size="small" label="Duplicado" />
              </ListItem>
            ))}
            {results.errors.map((e, idx) => (
              <ListItem key={`err-${idx}`}>
                <ListItemIcon>
                  <ErrorIcon color="error" />
                </ListItemIcon>
                <ListItemText primary={e.fileName} secondary={e.message} />
                <Chip size="small" label="Erro" style={{ backgroundColor: "#f44336", color: "#fff" }} />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NfeXmlUploadDialog;
