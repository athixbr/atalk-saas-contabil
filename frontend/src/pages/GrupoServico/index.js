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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  filterPaper: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
}));

export default function GrupoServico() {
  const classes = useStyles();
  const [grupos, setGrupos] = useState([]);
  const [tiposServico, setTiposServico] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipoServicoId, setTipoServicoId] = useState("");
  const [filterTipoServicoId, setFilterTipoServicoId] = useState("");

  useEffect(() => {
    loadTiposServico();
    loadGrupos();
  }, []);

  useEffect(() => {
    loadGrupos();
  }, [filterTipoServicoId]);

  const loadTiposServico = async () => {
    try {
      const res = await api.get("/tipo-servico");
      setTiposServico(res.data);
    } catch (error) {
      toast.error("Erro ao carregar tipos de serviço");
    }
  };

  const loadGrupos = async () => {
    try {
      const url = filterTipoServicoId
        ? `/grupo-servico?tipoServicoId=${filterTipoServicoId}`
        : "/grupo-servico";
      const res = await api.get(url);
      setGrupos(res.data);
    } catch (error) {
      toast.error("Erro ao carregar grupos de serviço");
    }
  };

  const handleOpenDialog = (grupo = null) => {
    if (grupo) {
      setEditingId(grupo.id);
      setNome(grupo.nome);
      setDescricao(grupo.descricao || "");
      setTipoServicoId(grupo.tipoServicoId);
    } else {
      setEditingId(null);
      setNome("");
      setDescricao("");
      setTipoServicoId("");
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setNome("");
    setDescricao("");
    setTipoServicoId("");
  };

  const handleSubmit = async () => {
    if (!nome || !tipoServicoId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/grupo-servico/${editingId}`, { nome, descricao, tipoServicoId });
        toast.success("Grupo de serviço atualizado com sucesso");
      } else {
        await api.post("/grupo-servico", { nome, descricao, tipoServicoId });
        toast.success("Grupo de serviço criado com sucesso");
      }
      handleCloseDialog();
      loadGrupos();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao salvar grupo de serviço");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente excluir este grupo de serviço?")) {
      return;
    }

    try {
      await api.delete(`/grupo-servico/${id}`);
      toast.success("Grupo de serviço excluído com sucesso");
      loadGrupos();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao excluir grupo de serviço");
    }
  };

  return (
    <Container className={classes.root}>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography variant="h4">Grupos de Serviço</Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Novo Grupo
          </Button>
        </Grid>
      </Grid>

      <Paper className={classes.filterPaper}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Filtrar por Tipo de Serviço</InputLabel>
              <Select
                value={filterTipoServicoId}
                onChange={(e) => setFilterTipoServicoId(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {tiposServico.map((tipo) => (
                  <MenuItem key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper className={classes.paper}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Tipo de Serviço</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell width={120}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grupos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Nenhum grupo de serviço cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                grupos.map((grupo) => (
                  <TableRow key={grupo.id}>
                    <TableCell>{grupo.nome}</TableCell>
                    <TableCell>{grupo.tipoServico?.nome}</TableCell>
                    <TableCell>{grupo.descricao}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenDialog(grupo)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(grupo.id)}>
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
        <DialogTitle>{editingId ? "Editar" : "Novo"} Grupo de Serviço</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: 8 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Tipo de Serviço</InputLabel>
                <Select value={tipoServicoId} onChange={(e) => setTipoServicoId(e.target.value)}>
                  {tiposServico.map((tipo) => (
                    <MenuItem key={tipo.id} value={tipo.id}>
                      {tipo.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
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
