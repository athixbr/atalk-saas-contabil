import React, { useState, useEffect } from "react";
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
  TablePagination,
} from "@material-ui/core";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import api from "../../services/api";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(3),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  searchField: {
    marginBottom: theme.spacing(3),
  },
  filtersContainer: {
    display: "flex",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  filterField: {
    minWidth: 200,
  },
  table: {
    minWidth: 650,
  },
  statusChip: {
    fontWeight: 600,
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(1),
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 300,
  },
}));

const TarefasConfigPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const [searchParam, setSearchParam] = useState("");
  const [departamentoFilter, setDepartamentoFilter] = useState("");
  const [ativoFilter, setAtivoFilter] = useState("");
  const [tarefas, setTarefas] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchDepartamentos();
  }, []);

  useEffect(() => {
    fetchTarefas();
  }, [page, rowsPerPage, searchParam, departamentoFilter, ativoFilter]);

  const fetchDepartamentos = async () => {
    try {
      const { data } = await api.get("/departamentos");
      setDepartamentos(data.departamentos || []);
    } catch (err) {
      console.error("Erro ao buscar departamentos:", err);
    }
  };

  const fetchTarefas = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      };

      if (searchParam) {
        params.searchParam = searchParam;
      }

      if (departamentoFilter) {
        params.departamentoId = departamentoFilter;
      }

      if (ativoFilter !== "") {
        params.ativo = ativoFilter;
      }

      const { data } = await api.get("/tarefas-config", { params });
      setTarefas(data.tarefas || []);
      setCount(data.count || 0);
    } catch (err) {
      console.error("Erro ao buscar tarefas:", err);
      toast.error("Erro ao carregar tarefas");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddTarefa = () => {
    history.push("/tarefas-config/cadastro");
  };

  const handleEditTarefa = (tarefaId) => {
    history.push(`/tarefas-config/cadastro/${tarefaId}`);
  };

  const handleViewTarefa = (tarefaId) => {
    history.push(`/tarefas-config/visualizar/${tarefaId}`);
  };

  const handleDeleteTarefa = async (tarefaId) => {
    if (window.confirm("Tem certeza que deseja excluir esta tarefa?")) {
      try {
        await api.delete(`/tarefas-config/${tarefaId}`);
        toast.success("Tarefa excluída com sucesso!");
        fetchTarefas();
      } catch (err) {
        console.error("Erro ao excluir tarefa:", err);
        toast.error("Erro ao excluir tarefa");
      }
    }
  };

  const formatVencimento = (tarefa) => {
    if (!tarefa.temVencimento) return "Sem vencimento";
    return `Com vencimento (${tarefa.diasParaVencimento} dias)`;
  };

  const formatLembrete = (tarefa) => {
    if (!tarefa.temVencimento || !tarefa.diasLembrete) return "-";
    return `${tarefa.diasLembrete} dias antes`;
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Configuração de Tarefas</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddTarefa}
          >
            Nova Tarefa
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <TextField
          className={classes.searchField}
          placeholder="Buscar tarefas..."
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
          fullWidth
        />

        <Box className={classes.filtersContainer}>
          <FormControl variant="outlined" className={classes.filterField}>
            <InputLabel>Departamento</InputLabel>
            <Select
              value={departamentoFilter}
              onChange={(e) => setDepartamentoFilter(e.target.value)}
              label="Departamento"
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {departamentos.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl variant="outlined" className={classes.filterField}>
            <InputLabel>Status</InputLabel>
            <Select
              value={ativoFilter}
              onChange={(e) => setAtivoFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              <MenuItem value="true">Ativo</MenuItem>
              <MenuItem value="false">Inativo</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box className={classes.loadingContainer}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Nome da Tarefa</strong></TableCell>
                    <TableCell><strong>Departamento</strong></TableCell>
                    <TableCell><strong>Vencimento</strong></TableCell>
                    <TableCell><strong>Lembrete</strong></TableCell>
                    <TableCell align="center"><strong>Aceita Arquivos</strong></TableCell>
                    <TableCell align="center"><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tarefas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="textSecondary">
                          Nenhuma tarefa encontrada
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    tarefas.map((tarefa) => (
                      <TableRow key={tarefa.id} hover>
                        <TableCell>{tarefa.titulo}</TableCell>
                        <TableCell>
                          <Chip 
                            label={tarefa.departamento?.nome || "N/A"} 
                            size="small" 
                            color="primary" 
                          />
                        </TableCell>
                        <TableCell>{formatVencimento(tarefa)}</TableCell>
                        <TableCell>{formatLembrete(tarefa)}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={tarefa.aceitaArquivos ? "Sim" : "Não"}
                            size="small"
                            color={tarefa.aceitaArquivos ? "primary" : "default"}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={tarefa.ativo ? "Ativo" : "Inativo"}
                            size="small"
                            className={classes.statusChip}
                            color={tarefa.ativo ? "primary" : "default"}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box className={classes.actionButtons}>
                            <Tooltip title="Visualizar">
                              <IconButton
                                size="small"
                                onClick={() => handleViewTarefa(tarefa.id)}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditTarefa(tarefa.id)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir">
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => handleDeleteTarefa(tarefa.id)}
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

            <TablePagination
              component="div"
              count={count}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Linhas por página:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count}`
              }
            />
          </>
        )}
      </Paper>
    </MainContainer>
  );
};

export default TarefasConfigPage;
