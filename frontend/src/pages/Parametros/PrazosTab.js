import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import { toast } from "react-toastify";
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
} from "@material-ui/core";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@material-ui/icons";
import { CircularProgress } from "@material-ui/core";
import { CirclePicker } from "react-color";

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

const PrazosTab = () => {
  const classes = useStyles();
  const [searchParam, setSearchParam] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPrazo, setEditingPrazo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    cor: "#2196f3",
  });

  const [prazosList, setPrazosList] = useState([]);

  const fetchPrazos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/parametros/prazos", {
        params: { searchParam },
      });
      setPrazosList(data);
    } catch (error) {
      toast.error("Erro ao carregar prazos");
      console.error("Erro ao buscar prazos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPrazos();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchParam]);

  const filteredPrazos = prazosList.filter((prazo) =>
    prazo.nome.toLowerCase().includes(searchParam.toLowerCase())
  );

  const handleOpenDialog = (prazo = null) => {
    if (prazo) {
      setEditingPrazo(prazo);
      setFormData({ nome: prazo.nome, cor: prazo.cor });
    } else {
      setEditingPrazo(null);
      setFormData({ nome: "", cor: "#2196f3" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPrazo(null);
    setFormData({ nome: "", cor: "#2196f3" });
  };

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      toast.warning("O nome do prazo é obrigatório!");
      return;
    }

    setLoading(true);
    try {
      if (editingPrazo) {
        // Editar
        await api.put(`/parametros/prazos/${editingPrazo.id}`, formData);
        toast.success("Prazo atualizado com sucesso!");
      } else {
        // Adicionar
        await api.post("/parametros/prazos", formData);
        toast.success("Prazo criado com sucesso!");
      }
      await fetchPrazos();
      handleCloseDialog();
    } catch (error) {
      toast.error("Erro ao salvar prazo");
      console.error("Erro ao salvar prazo:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (prazoId) => {
    if (window.confirm("Tem certeza que deseja excluir este prazo?")) {
      setLoading(true);
      try {
        await api.delete(`/parametros/prazos/${prazoId}`);
        toast.success("Prazo excluído com sucesso!");
        await fetchPrazos();
      } catch (error) {
        toast.error("Erro ao excluir prazo");
        console.error("Erro ao excluir prazo:", error);
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          className={classes.searchField}
          placeholder="Buscar prazos..."
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
          Novo Prazo
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredPrazos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Nenhum prazo encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredPrazos.map((prazo) => (
                <TableRow key={prazo.id} hover>
                  <TableCell>{prazo.nome}</TableCell>
                  <TableCell>
                    <Box
                      className={classes.colorBox}
                      style={{ backgroundColor: prazo.cor }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={prazo.nome}
                      style={{
                        backgroundColor: prazo.cor,
                        color: "#fff",
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box className={classes.actionButtons}>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(prazo)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleDelete(prazo.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPrazo ? "Editar Prazo" : "Novo Prazo"}
        </DialogTitle>
        <DialogContent>
          <Box className={classes.dialogContent}>
            <TextField
              label="Nome do Prazo"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              variant="outlined"
              fullWidth
              required
              autoFocus
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
          </Box>
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

export default PrazosTab;
