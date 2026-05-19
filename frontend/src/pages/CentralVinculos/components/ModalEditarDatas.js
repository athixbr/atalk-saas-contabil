import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  CircularProgress,
  IconButton,
  Box,
} from "@material-ui/core";
import { Close as CloseIcon } from "@material-ui/icons";
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
}));

const ModalEditarDatas = ({ open, onClose, vinculo, onSuccess }) => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    if (open && vinculo) {
      setDataInicio(vinculo.dataInicio || "");
      setDataFim(vinculo.dataFim || "");
      setObservacoes("");
    }
  }, [open, vinculo]);

  const handleSalvar = async () => {
    if (!dataInicio || !dataFim) {
      toast.error("Informe as datas de início e fim");
      return;
    }

    if (new Date(dataInicio) > new Date(dataFim)) {
      toast.error("Data de início não pode ser maior que data fim");
      return;
    }

    try {
      setLoading(true);

      await api.put(`/controle-clientes/vinculos/${vinculo.id}/datas`, {
        dataInicio,
        dataFim,
        observacoes,
      });

      toast.success("Datas alteradas com sucesso!");

      if (onSuccess) onSuccess();
      handleClose();
    } catch (err) {
      console.error("Erro ao alterar datas:", err);
      toast.error(err.response?.data?.message || "Erro ao alterar datas");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDataInicio("");
    setDataFim("");
    setObservacoes("");
    onClose();
  };

  if (!vinculo) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Editar Datas do Vínculo
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
            Você está alterando as datas de vigência deste vínculo
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Data Início"
              type="date"
              variant="outlined"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Data Fim"
              type="date"
              variant="outlined"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Motivo da Alteração (opcional)"
              variant="outlined"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Descreva o motivo da alteração das datas..."
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSalvar}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Salvar Alterações"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalEditarDatas;
