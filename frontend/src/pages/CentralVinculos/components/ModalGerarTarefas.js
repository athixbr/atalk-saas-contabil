import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Typography,
  CircularProgress,
  IconButton,
  Box,
  Chip,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import { Close as CloseIcon, CheckCircle as CheckCircleIcon } from "@material-ui/icons";
import { toast } from "react-toastify";
import api from "../../../services/api";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    padding: theme.spacing(3),
  },
  infoBox: {
    backgroundColor: theme.palette.action.hover,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
  },
  successBox: {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
}));

const ModalGerarTarefas = ({ open, onClose, vinculo, onSuccess }) => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const handleGerar = async () => {
    if (!vinculo) return;

    try {
      setLoading(true);

      const { data } = await api.post(
        `/controle-clientes/vinculos/${vinculo.id}/gerar-tarefas`,
        { forcarRegeneracao: true }
      );

      setResultado(data);
      toast.success("Tarefas geradas com sucesso!");

      if (onSuccess) onSuccess();
      
      // Fechar após 2 segundos
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error("Erro ao gerar tarefas:", err);
      toast.error(err.response?.data?.message || "Erro ao gerar tarefas");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResultado(null);
    onClose();
  };

  if (!vinculo) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Gerar Tarefas do Controle
        <IconButton
          aria-label="close"
          onClick={handleClose}
          style={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className={classes.dialogContent}>
        <Box className={classes.infoBox}>
          <Typography variant="subtitle2" gutterBottom>
            <strong>Cliente:</strong> {vinculo.cliente?.nome}
          </Typography>
          <Typography variant="subtitle2" gutterBottom>
            <strong>Controle:</strong> {vinculo.controleConfig?.codigo} - {vinculo.controleConfig?.nome}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Você está gerando tarefas vinculadas a este controle
          </Typography>
        </Box>

        {!resultado ? (
          <Box textAlign="center" py={3}>
            <Typography variant="body1" gutterBottom>
              Deseja gerar tarefas automaticamente para este controle?
            </Typography>
            <Typography variant="body2" color="textSecondary">
              As tarefas serão criadas com base na configuração do controle.
            </Typography>
          </Box>
        ) : (
          <Box className={classes.successBox}>
            <CheckCircleIcon />
            <Box>
              <Typography variant="subtitle1">
                <strong>{resultado.tarefasGeradas} tarefa(s) gerada(s) com sucesso!</strong>
              </Typography>
              <Typography variant="body2">
                As tarefas foram criadas e atribuídas aos responsáveis.
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {resultado ? "Fechar" : "Cancelar"}
        </Button>
        {!resultado && (
          <Button
            onClick={handleGerar}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Gerar Tarefas"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ModalGerarTarefas;
