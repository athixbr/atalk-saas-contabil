import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Box,
  Card,
  CardContent,
  MenuItem,
  CircularProgress,
} from "@material-ui/core";
import {
  ArrowBack as ArrowBackIcon,
  CloudUpload as UploadIcon,
  GetApp as DownloadIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
} from "@material-ui/icons";
import { useHistory, useParams } from "react-router-dom";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import ConfirmationModal from "../../components/ConfirmationModal";
import api from "../../services/api";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(3),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  uploadSection: {
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.spacing(1),
  },
  uploadButton: {
    marginTop: theme.spacing(2),
  },
  holeriteCard: {
    marginBottom: theme.spacing(2),
    "&:hover": {
      boxShadow: theme.shadows[4],
    },
  },
  pdfIcon: {
    fontSize: 48,
    color: theme.palette.error.main,
    marginRight: theme.spacing(2),
  },
  monthLabel: {
    fontWeight: 600,
    fontSize: "1.1rem",
  },
  fileInput: {
    display: "none",
  },
  uploadInfo: {
    marginTop: theme.spacing(1),
    color: theme.palette.text.secondary,
    fontSize: "0.875rem",
  },
}));

const MESES = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

const HoleritesPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const { userId } = useParams();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [holerites, setHolerites] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [mesReferencia, setMesReferencia] = useState("");
  const [anoReferencia, setAnoReferencia] = useState(new Date().getFullYear());
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchUserData();
    fetchHolerites();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const { data } = await api.get(`/users/${userId}`);
      setUserData(data);
    } catch (error) {
      toast.error("Erro ao carregar dados do usuário");
      console.error(error);
    }
  };

  const fetchHolerites = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/holerites/${userId}`);
      setHolerites(data);
    } catch (error) {
      toast.error("Erro ao carregar holerites");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (file.type !== "application/pdf") {
      toast.error("Apenas arquivos PDF são permitidos");
      return;
    }

    // Validar tamanho (20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB em bytes
    if (file.size > maxSize) {
      toast.error("O arquivo deve ter no máximo 20MB");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.warning("Selecione um arquivo PDF");
      return;
    }

    if (!mesReferencia || !anoReferencia) {
      toast.warning("Selecione o mês e ano de referência");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("mesReferencia", mesReferencia);
    formData.append("anoReferencia", anoReferencia);
    formData.append("typeArch", "holerites");

    setUploading(true);
    try {
      await api.post(`/holerites/${userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      toast.success("Holerite enviado com sucesso!");
      
      // Limpar formulário
      setSelectedFile(null);
      setMesReferencia("");
      setAnoReferencia(new Date().getFullYear());
      
      // Recarregar lista
      fetchHolerites();
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Erro ao enviar holerite";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (holeriteId, mesRef, anoRef) => {
    try {
      const response = await api.get(`/holerites/download/${holeriteId}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      
      const mesNome = MESES.find(m => m.value === mesRef)?.label || mesRef;
      link.setAttribute("download", `Holerite_${mesNome}_${anoRef}.pdf`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Download iniciado!");
    } catch (error) {
      toast.error("Erro ao fazer download do holerite");
      console.error(error);
    }
  };

  const handleDeleteConfirm = (holeriteId) => {
    setDeletingId(holeriteId);
    setConfirmModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/holerites/${deletingId}`);
      toast.success("Holerite excluído com sucesso!");
      fetchHolerites();
    } catch (error) {
      toast.error("Erro ao excluir holerite");
      console.error(error);
    } finally {
      setConfirmModalOpen(false);
      setDeletingId(null);
    }
  };

  const getMesNome = (mes) => {
    return MESES.find(m => m.value === mes)?.label || mes;
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  if (!userData) {
    return null;
  }

  return (
    <MainContainer>
      <MainHeader>
        <Title>Holerites - {userData.name}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => history.push("/users")}
          >
            Voltar
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        {/* SEÇÃO DE UPLOAD */}
        <Box className={classes.uploadSection}>
          <Typography variant="h6" gutterBottom>
            Enviar Novo Holerite
          </Typography>

          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={3}>
              <TextField
                select
                label="Mês de Referência"
                value={mesReferencia}
                onChange={(e) => setMesReferencia(e.target.value)}
                fullWidth
                variant="outlined"
                required
              >
                {MESES.map((mes) => (
                  <MenuItem key={mes.value} value={mes.value}>
                    {mes.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Ano de Referência"
                type="number"
                value={anoReferencia}
                onChange={(e) => setAnoReferencia(parseInt(e.target.value))}
                fullWidth
                variant="outlined"
                required
                inputProps={{ min: 2000, max: 2100 }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <input
                accept="application/pdf"
                className={classes.fileInput}
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  startIcon={<PdfIcon />}
                >
                  {selectedFile ? selectedFile.name : "Selecionar PDF"}
                </Button>
              </label>
              {selectedFile && (
                <Typography className={classes.uploadInfo}>
                  Tamanho: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
                onClick={handleUpload}
                disabled={uploading || !selectedFile || !mesReferencia || !anoReferencia}
              >
                {uploading ? "Enviando..." : "Enviar"}
              </Button>
            </Grid>
          </Grid>

          <Typography className={classes.uploadInfo} style={{ marginTop: 16 }}>
            * Apenas arquivos PDF com até 20MB são permitidos
          </Typography>
        </Box>

        {/* LISTA DE HOLERITES */}
        <Typography variant="h6" gutterBottom>
          Holerites Enviados ({holerites.length})
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : holerites.length === 0 ? (
          <Box p={4} textAlign="center">
            <Typography color="textSecondary">
              Nenhum holerite enviado ainda
            </Typography>
          </Box>
        ) : (
          holerites.map((holerite) => (
            <Card key={holerite.id} className={classes.holeriteCard}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" flex={1}>
                    <PdfIcon className={classes.pdfIcon} />
                    <Box>
                      <Typography className={classes.monthLabel}>
                        {getMesNome(holerite.mesReferencia)} / {holerite.anoReferencia}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Enviado em: {formatDate(holerite.createdAt)}
                      </Typography>
                      {holerite.uploadedByUser && (
                        <Typography variant="caption" color="textSecondary">
                          Por: {holerite.uploadedByUser.name}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box>
                    <IconButton
                      color="primary"
                      onClick={() => handleDownload(holerite.id, holerite.mesReferencia, holerite.anoReferencia)}
                      title="Baixar PDF"
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => handleDeleteConfirm(holerite.id)}
                      title="Excluir"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Paper>

      <ConfirmationModal
        title="Excluir Holerite"
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDelete}
      >
        Tem certeza que deseja excluir este holerite? Esta ação não pode ser desfeita.
      </ConfirmationModal>
    </MainContainer>
  );
};

export default HoleritesPage;
