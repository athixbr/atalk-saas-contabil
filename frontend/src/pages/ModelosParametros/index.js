import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@material-ui/core";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(3),
    width: "100%",
    boxSizing: "border-box",
  },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(3),
    overflowY: "scroll",
    width: "100%",
    boxSizing: "border-box",
    ...theme.scrollbarStyles,
  },
  tableContainer: {
    marginTop: theme.spacing(2),
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
}));

const ModelosParametros = () => {
  const classes = useStyles();
  const history = useHistory();
  const [modelos, setModelos] =  useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modeloToDelete, setModeloToDelete] = useState(null);

  useEffect(() => {
    loadModelos();
  }, []);

  const loadModelos = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/modelos-parametros");
      setModelos(data);
    } catch (error) {
      console.error("Erro ao carregar modelos:", error);
      toast.error("Erro ao carregar modelos de parâmetros");
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    history.push("/modelos-parametros/cadastro");
  };

  const handleEdit = (id) => {
    history.push(`/modelos-parametros/cadastro/${id}`);
  };

  const handleOpenDeleteDialog = (modelo) => {
    setModeloToDelete(modelo);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setModeloToDelete(null);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/modelos-parametros/${modeloToDelete.id}`);
      toast.success("Modelo deletado com sucesso");
      loadModelos();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Erro ao deletar modelo:", error);
      toast.error("Erro ao deletar modelo");
    }
  };

  return (
    <div className={classes.mainContainer}>
      <MainHeader>
        <Title>Modelos de Parâmetros</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNew}
          >
            Novo Modelo
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <Typography variant="subtitle1" gutterBottom>
          Gerencie modelos de parâmetros para agilizar o cadastro de clientes similares
        </Typography>

        {loading ? (
          <Box className={classes.emptyState}>
            <Typography>Carregando...</Typography>
          </Box>
        ) : modelos.length === 0 ? (
          <Box className={classes.emptyState}>
            <Typography variant="h6" gutterBottom>
              Nenhum modelo cadastrado
            </Typography>
            <Typography color="textSecondary">
              Crie seu primeiro modelo de parâmetros para facilitar o cadastro de clientes
            </Typography>
          </Box>
        ) : (
          <TableContainer className={classes.tableContainer}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome do Modelo</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {modelos.map((modelo) => (
                  <TableRow key={modelo.id}>
                    <TableCell>
                      <Typography variant="body1" style={{ fontWeight: 500 }}>
                        {modelo.nome}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {modelo.descricao || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(modelo.id)}
                        title="Editar"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => handleOpenDeleteDialog(modelo)}
                        title="Deletar"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o modelo "{modeloToDelete?.nome}"?
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="secondary" variant="contained">
            Deletar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ModelosParametros;
