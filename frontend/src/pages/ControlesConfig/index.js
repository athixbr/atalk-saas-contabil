import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  InputAdornment,
  Box,
  Tooltip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import api from "../../services/api";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(3),
    borderRadius: "16px",
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  searchField: {
    marginBottom: theme.spacing(2),
    backgroundColor: "#fff",
    borderRadius: "8px",
  },
  filtersContainer: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: "16px",
    backgroundColor: "#f5f5f5",
  },
  filterRow: {
    display: "flex",
    gap: theme.spacing(2),
    flexWrap: "wrap",
    alignItems: "center",
  },
  filterField: {
    minWidth: 200,
    backgroundColor: "#fff",
    borderRadius: "8px",
  },
  table: {
    minWidth: 650,
  },
  tableHeader: {
    backgroundColor: "#f5f5f5",
  },
  tableHeaderCell: {
    fontWeight: 600,
    padding: "12px 16px",
  },
  tableRow: {
    transition: "all 0.2s",
    "&:hover": {
      backgroundColor: "#f9f9f9",
    },
  },
  statusChip: {
    fontWeight: 600,
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(1),
    justifyContent: "center",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 300,
  },
  addButton: {
    background: "linear-gradient(135deg, #0596cd 0%, #047ba5 100%)",
    color: "#fff",
    "&:hover": {
      background: "linear-gradient(135deg, #047ba5 0%, #035c7d 100%)",
    },
  },
  clearButton: {
    borderColor: "#999",
    color: "#666",
  },
  totalCount: {
    padding: theme.spacing(2),
    borderTop: "1px solid #e0e0e0",
    marginTop: theme.spacing(2),
  },
}));

const ControlesConfigPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  
  const [searchParam, setSearchParam] = useState("");
  const [departamentoFilter, setDepartamentoFilter] = useState("");
  const [ativoFilter, setAtivoFilter] = useState("");
  const [tipoControleFilter, setTipoControleFilter] = useState("");
  const [recorrenteFilter, setRecorrenteFilter] = useState("");
  
  const [controles, setControles] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartamentos();
    fetchControles();
  }, []);

  useEffect(() => {
    fetchControles();
  }, [searchParam, departamentoFilter, ativoFilter, tipoControleFilter, recorrenteFilter]);

  const fetchDepartamentos = async () => {
    try {
      const { data } = await api.get("/departamentos");
      setDepartamentos(data.departamentos || []);
    } catch (err) {
      console.error("Erro ao buscar departamentos:", err);
    }
  };

  const fetchControles = async () => {
    setLoading(true);
    try {
      const params = {
        companyId: user.companyId,
      };

      const { data } = await api.get("/controles-config", { params });
      
      let filteredControles = data.controles || [];

      // Filtros do frontend
      if (searchParam) {
        filteredControles = filteredControles.filter(
          (controle) =>
            controle.codigo.toLowerCase().includes(searchParam.toLowerCase()) ||
            controle.nome.toLowerCase().includes(searchParam.toLowerCase())
        );
      }

      if (departamentoFilter) {
        filteredControles = filteredControles.filter(
          (controle) => controle.departamentoId === parseInt(departamentoFilter)
        );
      }

      if (ativoFilter !== "") {
        filteredControles = filteredControles.filter(
          (controle) => controle.ativo === (ativoFilter === "true")
        );
      }

      if (tipoControleFilter) {
        filteredControles = filteredControles.filter(
          (controle) => controle.tipoControle === tipoControleFilter
        );
      }

      if (recorrenteFilter !== "") {
        filteredControles = filteredControles.filter(
          (controle) => controle.recorrente === (recorrenteFilter === "true")
        );
      }

      setControles(filteredControles);
    } catch (err) {
      console.error("Erro ao buscar controles:", err);
      toast.error("Erro ao carregar controles");
    } finally {
      setLoading(false);
    }
  };

  const handleAddControle = () => {
    history.push("/controles-config/cadastro");
  };

  const handleEditControle = (controleId) => {
    history.push(`/controles-config/cadastro/${controleId}`);
  };

  const handleDeleteControle = async (controleId) => {
    if (window.confirm("Tem certeza que deseja excluir este controle?")) {
      try {
        await api.delete(`/controles-config/${controleId}`);
        toast.success("Controle excluído com sucesso!");
        fetchControles();
      } catch (err) {
        console.error("Erro ao excluir controle:", err);
        toast.error("Erro ao excluir controle");
      }
    }
  };

  const handleClearFilters = () => {
    setSearchParam("");
    setDepartamentoFilter("");
    setAtivoFilter("");
    setTipoControleFilter("");
    setRecorrenteFilter("");
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Configuração de Controles</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            className={classes.addButton}
            startIcon={<AddIcon />}
            onClick={handleAddControle}
          >
            Novo Controle
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <TextField
          className={classes.searchField}
          fullWidth
          placeholder="Buscar por código ou nome..."
          value={searchParam}
          onChange={(e) => setSearchParam(e.target.value)}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Box className={classes.filtersContainer}>
          <Box className={classes.filterRow}>
            <FormControl variant="outlined" className={classes.filterField} size="small">
              <InputLabel>Departamento</InputLabel>
              <Select
                value={departamentoFilter}
                onChange={(e) => setDepartamentoFilter(e.target.value)}
                label="Departamento"
              >
                <MenuItem value="">Todos</MenuItem>
                {departamentos.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl variant="outlined" className={classes.filterField} size="small">
              <InputLabel>Tipo de Controle</InputLabel>
              <Select
                value={tipoControleFilter}
                onChange={(e) => setTipoControleFilter(e.target.value)}
                label="Tipo de Controle"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="interno">Interno</MenuItem>
                <MenuItem value="cliente">Cliente</MenuItem>
              </Select>
            </FormControl>

            <FormControl variant="outlined" className={classes.filterField} size="small">
              <InputLabel>Recorrente</InputLabel>
              <Select
                value={recorrenteFilter}
                onChange={(e) => setRecorrenteFilter(e.target.value)}
                label="Recorrente"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Sim</MenuItem>
                <MenuItem value="false">Não</MenuItem>
              </Select>
            </FormControl>

            <FormControl variant="outlined" className={classes.filterField} size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={ativoFilter}
                onChange={(e) => setAtivoFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Ativo</MenuItem>
                <MenuItem value="false">Inativo</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              className={classes.clearButton}
              onClick={handleClearFilters}
              size="small"
            >
              Limpar Filtros
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box className={classes.loadingContainer}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table className={classes.table}>
                <TableHead className={classes.tableHeader}>
                  <TableRow>
                    <TableCell className={classes.tableHeaderCell}>Código</TableCell>
                    <TableCell className={classes.tableHeaderCell}>Nome</TableCell>
                    <TableCell className={classes.tableHeaderCell}>Departamento</TableCell>
                    <TableCell className={classes.tableHeaderCell}>Tipo</TableCell>
                    <TableCell className={classes.tableHeaderCell}>Recorrente</TableCell>
                    <TableCell className={classes.tableHeaderCell}>Clientes</TableCell>
                    <TableCell className={classes.tableHeaderCell}>Status</TableCell>
                    <TableCell className={classes.tableHeaderCell} align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {controles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography variant="body2" color="textSecondary">
                          Nenhum controle encontrado
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    controles.map((controle) => (
                      <TableRow key={controle.id} hover className={classes.tableRow}>
                        <TableCell>{controle.codigo}</TableCell>
                        <TableCell>{controle.nome}</TableCell>
                        <TableCell>
                          {controle.departamento?.nome || "-"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={controle.tipoControle === "interno" ? "Interno" : "Cliente"}
                            color={controle.tipoControle === "interno" ? "default" : "primary"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={controle.recorrente ? "Sim" : "Não"}
                            color={controle.recorrente ? "secondary" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {controle.tipoControle === "cliente" && controle.controleClientes?.length > 0
                            ? `${controle.controleClientes.length} cliente(s)`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={controle.ativo ? "Ativo" : "Inativo"}
                            color={controle.ativo ? "primary" : "default"}
                            size="small"
                            className={classes.statusChip}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box className={classes.actionButtons}>
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditControle(controle.id)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir">
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => handleDeleteControle(controle.id)}
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

            <Box className={classes.totalCount}>
              <Typography variant="body2" color="textSecondary">
                <strong>Total:</strong> {controles.length} controle(s)
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </MainContainer>
  );
};

export default ControlesConfigPage;
