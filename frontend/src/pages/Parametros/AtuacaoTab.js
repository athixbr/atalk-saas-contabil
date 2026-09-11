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

const AtuacaoTab = () => {
  const classes = useStyles();
  const [searchParam, setSearchParam] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({ nome: "" });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/parametros/atuacao", {
        params: { searchParam },
      });
      setItems(data);
    } catch (error) {
      toast.error("Erro ao carregar atuação");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(fetchItems, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam]);

  const filteredItems = items.filter((item) =>
    item.nome.toLowerCase().includes(searchParam.toLowerCase())
  );

  const handleOpenDialog = (item = null) => {
    setEditingItem(item);
    setFormData({ nome: item?.nome || "" });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setFormData({ nome: "" });
  };

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      toast.error("O nome é obrigatório!");
      return;
    }

    setLoading(true);
    try {
      if (editingItem) {
        await api.put(`/parametros/atuacao/${editingItem.id}`, formData);
        toast.success("Atuação atualizada com sucesso!");
      } else {
        await api.post("/parametros/atuacao", formData);
        toast.success("Atuação criada com sucesso!");
      }
      await fetchItems();
      handleCloseDialog();
    } catch (error) {
      toast.error("Erro ao salvar atuação");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Tem certeza que deseja excluir?")) {
      setLoading(true);
      try {
        await api.delete(`/parametros/atuacao/${itemId}`);
        toast.success("Atuação excluída com sucesso!");
        await fetchItems();
      } catch (error) {
        toast.error("Erro ao excluir atuação");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box>
      {loading && (
        <Box display="flex" justifyContent="center" mb={2}>
          <CircularProgress size={24} />
        </Box>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          className={classes.searchField}
          placeholder="Buscar..."
          type="search"
          value={searchParam}
          onChange={(e) => setSearchParam(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon style={{ color: "gray" }} />
              </InputAdornment>
            ),
          }}
          variant="outlined"
          size="small"
          style={{ flex: 1, marginRight: 16, marginBottom: 0 }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Nome</strong></TableCell>
              <TableCell align="center"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.nome}</TableCell>
                  <TableCell align="center">
                    <div className={classes.actionButtons}>
                      <IconButton size="small" onClick={() => handleOpenDialog(item)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(item.id)}>
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? "Editar Atuação" : "Nova Atuação"}</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <TextField
            autoFocus
            label="Nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            variant="outlined"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} color="primary" variant="contained" disabled={loading}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AtuacaoTab;
