import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  InputAdornment,
  CircularProgress,
} from "@material-ui/core";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@material-ui/icons";
import { toast } from "react-toastify";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  searchField: {
    marginBottom: theme.spacing(2),
  },
  addButton: {
    marginBottom: theme.spacing(2),
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(1),
  },
  dialogContent: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    minWidth: 400,
    paddingTop: theme.spacing(2),
  },
}));

const CargoSocioTab = () => {
  const classes = useStyles();
  const [cargoSocios, setCargoSocios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ nome: "" });

  useEffect(() => {
    fetchCargoSocios();
  }, [searchParam]);

  const fetchCargoSocios = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/parametros/cargosocio", {
        params: { searchParam },
      });
      setCargoSocios(data);
    } catch (error) {
      toast.error("Erro ao carregar cargos de sócios");
      console.error("Erro ao buscar cargos de sócios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ nome: item.nome });
    } else {
      setEditingItem(null);
      setFormData({ nome: "" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setFormData({ nome: "" });
  };

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      toast.error("O nome é obrigatório");
      return;
    }

    try {
      if (editingItem) {
        await api.put(`/parametros/cargosocio/${editingItem.id}`, formData);
        toast.success("Cargo de sócio atualizado com sucesso");
      } else {
        await api.post("/parametros/cargosocio", formData);
        toast.success("Cargo de sócio criado com sucesso");
      }
      handleCloseDialog();
      fetchCargoSocios();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erro ao salvar cargo de sócio"
      );
      console.error("Erro ao salvar:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja realmente excluir este cargo de sócio?")) {
      try {
        await api.delete(`/parametros/cargosocio/${id}`);
        toast.success("Cargo de sócio excluído com sucesso");
        fetchCargoSocios();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Erro ao excluir cargo de sócio"
        );
        console.error("Erro ao excluir:", error);
      }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <TextField
          className={classes.searchField}
          placeholder="Buscar cargo de sócio..."
          variant="outlined"
          size="small"
          value={searchParam}
          onChange={(e) => setSearchParam(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          style={{ flexGrow: 1, marginRight: 16 }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          className={classes.addButton}
        >
          Adicionar
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cargoSocios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    Nenhum cargo de sócio encontrado
                  </TableCell>
                </TableRow>
              ) : (
                cargoSocios.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.nome}</TableCell>
                    <TableCell align="right">
                      <div className={classes.actionButtons}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(item)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(item.id)}
                          color="secondary"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? "Editar Cargo de Sócio" : "Novo Cargo de Sócio"}
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <TextField
            label="Nome"
            variant="outlined"
            fullWidth
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CargoSocioTab;
