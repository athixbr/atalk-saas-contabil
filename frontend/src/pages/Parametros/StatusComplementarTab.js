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
  Chip,
  InputAdornment,
  CircularProgress,
} from "@material-ui/core";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@material-ui/icons";
import { CirclePicker } from "react-color";
import { toast } from "react-toastify";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  searchField: {
    marginBottom: theme.spacing(2),
  },
  addButton: {
    marginBottom: theme.spacing(2),
  },
  colorBox: {
    width: 40,
    height: 40,
    borderRadius: theme.shape.borderRadius,
    border: `2px solid ${theme.palette.divider}`,
    cursor: "pointer",
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(1),
  },
  dialogContent: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3),
    minWidth: 400,
    paddingTop: theme.spacing(2),
  },
  colorPickerContainer: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  colorPreview: {
    width: "100%",
    height: 60,
    borderRadius: theme.shape.borderRadius,
    border: `2px solid ${theme.palette.divider}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const StatusComplementarTab = () => {
  const classes = useStyles();
  const [searchParam, setSearchParam] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    nome: "",
    cor: "#f44336",
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/parametros/statuscomplementar", {
        params: { searchParam },
      });
      setItems(data);
    } catch (error) {
      toast.error("Erro ao carregar Status Complementar_LOWER");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchItems();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam]);

  const filteredItems = items.filter((item) =>
    item.nome.toLowerCase().includes(searchParam.toLowerCase())
  );

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ nome: item.nome, cor: item.cor });
    } else {
      setEditingItem(null);
      setFormData({ nome: "", cor: "#f44336" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setFormData({ nome: "", cor: "#f44336" });
  };

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      toast.error("O nome é obrigatório!");
      return;
    }

    setLoading(true);
    try {
      if (editingItem) {
        await api.put(`/parametros/statuscomplementar/${editingItem.id}`, formData);
        toast.success("Status Complementar atualizado com sucesso!");
      } else {
        await api.post("/parametros/statuscomplementar", formData);
        toast.success("Status Complementar criado com sucesso!");
      }
      await fetchItems();
      handleCloseDialog();
    } catch (error) {
      toast.error("Erro ao salvar Status Complementar_LOWER");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Tem certeza que deseja excluir?")) {
      setLoading(true);
      try {
        await api.delete(`/parametros/statuscomplementar/${itemId}`);
        toast.success("Status Complementar excluído com sucesso!");
        await fetchItems();
      } catch (error) {
        toast.error("Erro ao excluir Status Complementar_LOWER");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleColorChange = (color) => {
    setFormData({ ...formData, cor: color.hex });
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
              <TableCell><strong>Cor</strong></TableCell>
              <TableCell><strong>Visualização</strong></TableCell>
              <TableCell align="center"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.nome}</TableCell>
                  <TableCell>
                    <Box
                      className={classes.colorBox}
                      style={{ backgroundColor: item.cor }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.nome}
                      style={{
                        backgroundColor: item.cor,
                        color: "#fff",
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <div className={classes.actionButtons}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(item)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(item.id)}
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

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingItem ? "Editar Status Complementar" : "Novo Status Complementar"}
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <TextField
            label="Nome"
            fullWidth
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            variant="outlined"
            autoFocus
          />
          
          <Box className={classes.colorPickerContainer}>
            <label style={{ fontWeight: 500, marginBottom: 8 }}>Cor:</label>
            <CirclePicker
              color={formData.cor}
              onChangeComplete={handleColorChange}
              width="100%"
            />
            <Box
              className={classes.colorPreview}
              style={{ backgroundColor: formData.cor }}
            >
              <span style={{ color: "#fff", fontWeight: 600 }}>
                {formData.nome || "Preview"}
              </span>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="default">
            Cancelar
          </Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StatusComplementarTab;
