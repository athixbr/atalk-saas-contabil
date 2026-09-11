import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@material-ui/core";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
} from "@material-ui/icons";
import { toast } from "react-toastify";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  searchField: { marginBottom: theme.spacing(2) },
  addButton: { marginBottom: theme.spacing(2) },
  actionButtons: { display: "flex", gap: theme.spacing(1), justifyContent: "flex-end" },
  dialogContent: { display: "flex", flexDirection: "column", gap: theme.spacing(2), minWidth: 400, paddingTop: theme.spacing(2) },
}));

const TipoContaTab = () => {
  const classes = useStyles();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ nome: "" });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/parametros/tipoconta", { params: { searchParam } });
      setItems(data);
    } catch (error) {
      toast.error("Erro ao carregar tipos de conta");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [searchParam]);

  const handleOpenDialog = (item = null) => {
    setEditingItem(item);
    setFormData({ nome: item?.nome || "" });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!formData.nome.trim()) return toast.error("O nome é obrigatório");
    try {
      if (editingItem) await api.put(`/parametros/tipoconta/${editingItem.id}`, formData);
      else await api.post("/parametros/tipoconta", formData);
      toast.success("Tipo de conta salvo com sucesso");
      setOpenDialog(false);
      setEditingItem(null);
      setFormData({ nome: "" });
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao salvar tipo de conta");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente excluir este tipo de conta?")) return;
    try {
      await api.delete(`/parametros/tipoconta/${id}`);
      toast.success("Tipo de conta excluído com sucesso");
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao excluir tipo de conta");
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <TextField
          className={classes.searchField}
          placeholder="Buscar tipo de conta..."
          variant="outlined"
          size="small"
          value={searchParam}
          onChange={(e) => setSearchParam(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          style={{ flexGrow: 1, marginRight: 16 }}
        />
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} className={classes.addButton}>Adicionar</Button>
      </Box>
      {loading ? <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box> : (
        <TableContainer><Table><TableHead><TableRow><TableCell>Nome</TableCell><TableCell align="right">Ações</TableCell></TableRow></TableHead><TableBody>
          {items.length === 0 ? <TableRow><TableCell colSpan={2} align="center">Nenhum tipo de conta encontrado</TableCell></TableRow> : items.map((item) => (
            <TableRow key={item.id}><TableCell>{item.nome}</TableCell><TableCell align="right"><div className={classes.actionButtons}><IconButton size="small" onClick={() => handleOpenDialog(item)} color="primary"><EditIcon /></IconButton><IconButton size="small" onClick={() => handleDelete(item.id)} color="secondary"><DeleteIcon /></IconButton></div></TableCell></TableRow>
          ))}
        </TableBody></Table></TableContainer>
      )}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? "Editar Tipo de Conta" : "Novo Tipo de Conta"}</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <TextField label="Nome" variant="outlined" fullWidth value={formData.nome} onChange={(e) => setFormData({ nome: e.target.value })} autoFocus />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenDialog(false)}>Cancelar</Button><Button onClick={handleSave} color="primary" variant="contained">Salvar</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default TipoContaTab;
