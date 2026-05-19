import React, { useState, useEffect } from "react";
import {
  Paper,
  Container,
  TextField,
  Button,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
  },
  headerButton: {
    marginLeft: theme.spacing(2),
  },
}));

export default function TipoServico() {
  const classes = useStyles();
  const [tipos, setTipos] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  useEffect(() => {
    loadTipos();
  }, []);

  const loadTipos = async () => {
    try {
      const res = await api.get("/tipo-servico");
      setTipos(res.data);
    } catch (error) {
      toast.error("Erro ao carregar tipos de serviço");
    }
  };

  const handleOpenDialog = (tipo = null) => {
    if (tipo) {
      setEditingId(tipo.id);
      setNome(tipo.nome);
      setDescricao(tipo.descricao || "");
    } else {
      setEditingId(null);
      setNome("");
      setDescricao("");
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setNome("");
    setDescricao("");
  };

  const handleSubmit = async () => {
    if (!nome) {
      toast.error("Preencha o nome do tipo de serviço");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/tipo-servico/${editingId}`, { nome, descricao });
        toast.success("Tipo de serviço atualizado com sucesso");
      } else {
        await api.post("/tipo-servico", { nome, descricao });
        toast.success("Tipo de serviço criado com sucesso");
      }
      handleCloseDialog();
      loadTipos();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao salvar tipo de serviço");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente excluir este tipo de serviço?")) {
      return;
    }

    try {
      await api.delete(`/tipo-servico/${id}`);
      toast.success("Tipo de serviço excluído com sucesso");
      loadTipos();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao excluir tipo de serviço");
    }
  };

  return (
    <Container className={classes.root}>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography variant="h4">Tipos de Serviço</Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Novo Tipo
          </Button>
        </Grid>
      </Grid>

      <Paper className={classes.paper}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell width={120}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tipos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Nenhum tipo de serviço cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                tipos.map((tipo) => (
                  <TableRow key={tipo.id}>
                    <TableCell>{tipo.nome}</TableCell>
                    <TableCell>{tipo.descricao}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenDialog(tipo)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(tipo.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Editar" : "Novo"} Tipo de Serviço</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: 8 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Descrição"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {editingId ? "Atualizar" : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
