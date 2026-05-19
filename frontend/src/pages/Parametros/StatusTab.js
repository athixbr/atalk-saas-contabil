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

const StatusTab = () => {
  const classes = useStyles();
  const [searchParam, setSearchParam] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusList, setStatusList] = useState([]);
  const [formData, setFormData] = useState({
    nome: "",
    cor: "#f44336",
  });

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/parametros/status", {
        params: { searchParam },
      });
      setStatusList(data);
    } catch (error) {
      toast.error("Erro ao carregar status");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStatus();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam]);

  const filteredStatus = statusList.filter((status) =>
    status.nome.toLowerCase().includes(searchParam.toLowerCase())
  );

  const handleOpenDialog = (status = null) => {
    if (status) {
      setEditingStatus(status);
      setFormData({ nome: status.nome, cor: status.cor });
    } else {
      setEditingStatus(null);
      setFormData({ nome: "", cor: "#f44336" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStatus(null);
    setFormData({ nome: "", cor: "#f44336" });
  };

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      toast.error("O nome do status é obrigatório!");
      return;
    }

    setLoading(true);
    try {
      if (editingStatus) {
        await api.put(`/parametros/status/${editingStatus.id}`, formData);
        toast.success("Status atualizado com sucesso!");
      } else {
        await api.post("/parametros/status", formData);
        toast.success("Status criado com sucesso!");
      }
      await fetchStatus();
      handleCloseDialog();
    } catch (error) {
      toast.error("Erro ao salvar status");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (statusId) => {
    if (window.confirm("Tem certeza que deseja excluir este status?")) {
      setLoading(true);
      try {
        await api.delete(`/parametros/status/${statusId}`);
        toast.success("Status excluído com sucesso!");
        await fetchStatus();
      } catch (error) {
        toast.error("Erro ao excluir status");
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
          placeholder="Buscar status..."
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
          Novo Status
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
            {filteredStatus.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Nenhum status encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredStatus.map((status) => (
                <TableRow key={status.id} hover>
                  <TableCell>{status.nome}</TableCell>
                  <TableCell>
                    <Box
                      className={classes.colorBox}
                      style={{ backgroundColor: status.cor }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={status.nome}
                      style={{
                        backgroundColor: status.cor,
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
                          onClick={() => handleOpenDialog(status)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleDelete(status.id)}
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
          {editingStatus ? "Editar Status" : "Novo Status"}
        </DialogTitle>
        <DialogContent>
          <Box className={classes.dialogContent}>
            <TextField
              label="Nome do Status"
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

export default StatusTab;
