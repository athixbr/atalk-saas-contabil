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

const PrioridadeTab = () => {
  const classes = useStyles();
  const [searchParam, setSearchParam] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPrioridade, setEditingPrioridade] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    cor: "#f44336",
  });

  const [prioridadeList, setPrioridadeList] = useState([]);

  const fetchPrioridades = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/parametros/prioridades", {
        params: { searchParam },
      });
      setPrioridadeList(data);
    } catch (error) {
      toast.error("Erro ao carregar prioridades");
      console.error("Erro ao buscar prioridades:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPrioridades();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchParam]);

  const filteredPrioridade = prioridadeList.filter((prioridade) =>
    prioridade.nome.toLowerCase().includes(searchParam.toLowerCase())
  );

  const handleOpenDialog = (prioridade = null) => {
    if (prioridade) {
      setEditingPrioridade(prioridade);
      setFormData({ nome: prioridade.nome, cor: prioridade.cor });
    } else {
      setEditingPrioridade(null);
      setFormData({ nome: "", cor: "#f44336" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPrioridade(null);
    setFormData({ nome: "", cor: "#f44336" });
  };

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      toast.warning("O nome da prioridade é obrigatório!");
      return;
    }

    setLoading(true);
    try {
      if (editingPrioridade) {
        // Editar
        await api.put(`/parametros/prioridades/${editingPrioridade.id}`, formData);
        toast.success("Prioridade atualizada com sucesso!");
      } else {
        // Adicionar
        await api.post("/parametros/prioridades", formData);
        toast.success("Prioridade criada com sucesso!");
      }
      await fetchPrioridades();
      handleCloseDialog();
    } catch (error) {
      toast.error("Erro ao salvar prioridade");
      console.error("Erro ao salvar prioridade:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (prioridadeId) => {
    if (window.confirm("Tem certeza que deseja excluir esta prioridade?")) {
      setLoading(true);
      try {
        await api.delete(`/parametros/prioridades/${prioridadeId}`);
        toast.success("Prioridade excluída com sucesso!");
        await fetchPrioridades();
      } catch (error) {
        toast.error("Erro ao excluir prioridade");
        console.error("Erro ao excluir prioridade:", error);
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
          placeholder="Buscar prioridade..."
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
          Nova Prioridade
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
            ) : filteredPrioridade.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Nenhuma prioridade encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredPrioridade.map((prioridade) => (
                <TableRow key={prioridade.id} hover>
                  <TableCell>{prioridade.nome}</TableCell>
                  <TableCell>
                    <Box
                      className={classes.colorBox}
                      style={{ backgroundColor: prioridade.cor }}
                      title={prioridade.cor}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={prioridade.nome}
                      style={{
                        backgroundColor: prioridade.cor,
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
                          onClick={() => handleOpenDialog(prioridade)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleDelete(prioridade.id)}
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
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingPrioridade ? "Editar Prioridade" : "Nova Prioridade"}
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <TextField
            label="Nome da Prioridade"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            fullWidth
            variant="outlined"
            required
            placeholder="Ex: Alta, Baixa, Urgente..."
          />

          <Box className={classes.colorPickerContainer}>
            <Box>
              <strong>Cor da Prioridade:</strong>
            </Box>
            <CirclePicker
              color={formData.cor}
              onChangeComplete={handleColorChange}
              width="100%"
              colors={[
                "#F44336",
                "#E91E63",
                "#9C27B0",
                "#673AB7",
                "#3F51B5",
                "#2196F3",
                "#03A9F4",
                "#00BCD4",
                "#009688",
                "#4CAF50",
                "#8BC34A",
                "#CDDC39",
                "#FFEB3B",
                "#FFC107",
                "#FF9800",
                "#FF5722",
                "#795548",
                "#607D8B",
              ]}
            />
            <Box
              className={classes.colorPreview}
              style={{ backgroundColor: formData.cor }}
            >
              <Chip
                label={formData.nome || "Visualização"}
                style={{
                  backgroundColor: formData.cor,
                  color: "#fff",
                  fontWeight: 600,
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

export default PrioridadeTab;
