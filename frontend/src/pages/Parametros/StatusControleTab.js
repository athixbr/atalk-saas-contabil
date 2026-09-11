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
  Tooltip,
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
  actionButtons: {
    display: "flex",
    gap: theme.spacing(1),
  },
  colorBox: {
    width: 40,
    height: 40,
    borderRadius: theme.shape.borderRadius,
    border: `2px solid ${theme.palette.divider}`,
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

const StatusControleTab = ({
  endpoint = "/parametros/statuscontrole",
  title = "Status do Controle",
}) => {
  const classes = useStyles();
  const [searchParam, setSearchParam] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [itemList, setItemList] = useState([]);
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
      const { data } = await api.get(endpoint, {
        params: { searchParam },
      });
      setItemList(data);
    } catch (error) {
      toast.error("Erro ao carregar itens");
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

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ nome: item.nome, cor: item.cor || "#f44336" });
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
        await api.put(`${endpoint}/${editingItem.id}`, formData);
        toast.success(`${title} atualizado(a) com sucesso!`);
      } else {
        await api.post(endpoint, formData);
        toast.success(`${title} criado(a) com sucesso!`);
      }
      await fetchItems();
      handleCloseDialog();
    } catch (error) {
      toast.error("Erro ao salvar");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Tem certeza que deseja excluir este item?")) {
      setLoading(true);
      try {
        await api.delete(`${endpoint}/${itemId}`);
        toast.success("Item excluído com sucesso!");
        await fetchItems();
      } catch (error) {
        toast.error("Erro ao excluir");
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
            {itemList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Nenhum item encontrado
                </TableCell>
              </TableRow>
            ) : (
              itemList.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.nome}</TableCell>
                  <TableCell>
                    <Box
                      className={classes.colorBox}
                      style={{ backgroundColor: item.cor || "#f44336" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.nome}
                      style={{
                        backgroundColor: item.cor || "#f44336",
                        color: "#fff",
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <div className={classes.actionButtons}>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(item)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(item.id)}
                          color="secondary"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? `Editar ${title}` : `Novo ${title}`}
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <TextField
            autoFocus
            label="Nome"
            fullWidth
            variant="outlined"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          />
          <Box className={classes.colorPickerContainer}>
            <Box>
              <strong>Selecione a Cor:</strong>
            </Box>
            <CirclePicker
              color={formData.cor}
              onChangeComplete={handleColorChange}
              colors={[
                "#f44336",
                "#e91e63",
                "#9c27b0",
                "#673ab7",
                "#3f51b5",
                "#2196f3",
                "#03a9f4",
                "#00bcd4",
                "#009688",
                "#4caf50",
                "#8bc34a",
                "#cddc39",
                "#ffeb3b",
                "#ffc107",
                "#ff9800",
                "#ff5722",
                "#795548",
                "#607d8b",
              ]}
              width="100%"
            />
            <Box
              className={classes.colorPreview}
              style={{ backgroundColor: formData.cor }}
            >
              <Chip
                label={formData.nome || "Preview"}
                style={{
                  backgroundColor: formData.cor,
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              />
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

export default StatusControleTab;
