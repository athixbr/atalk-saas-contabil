import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import { toast } from "react-toastify";
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
  InputAdornment,
  Box,
  Tooltip,
  Chip,
  CircularProgress,
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
  table: {
    minWidth: 650,
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(1),
  },
}));

const DepartamentosPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const [searchParam, setSearchParam] = useState("");
  const [loading, setLoading] = useState(false);
  const [departamentos, setDepartamentos] = useState([]);

  const fetchDepartamentos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/departamentos", {
        params: { searchParam },
      });
      setDepartamentos(data.departamentos || []);
    } catch (error) {
      toast.error("Erro ao carregar departamentos");
      console.error("Erro ao buscar departamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDepartamentos();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchParam]);

  const filteredDepartamentos = departamentos;

  const handleAddDepartamento = () => {
    history.push("/departamentos/cadastro");
  };

  const handleEditDepartamento = (deptId) => {
    history.push(`/departamentos/cadastro/${deptId}`);
  };

  const handleDeleteDepartamento = async (deptId) => {
    if (window.confirm("Tem certeza que deseja excluir este departamento?")) {
      setLoading(true);
      try {
        await api.delete(`/departamentos/${deptId}`);
        toast.success("Departamento excluído com sucesso!");
        await fetchDepartamentos();
      } catch (error) {
        toast.error("Erro ao excluir departamento");
        console.error("Erro ao excluir departamento:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Departamentos</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddDepartamento}
          >
            Novo Departamento
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <TextField
          className={classes.searchField}
          placeholder="Buscar departamentos..."
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

        <TableContainer>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell><strong>Nome do Departamento</strong></TableCell>
                <TableCell><strong>Usuários</strong></TableCell>
                <TableCell align="center"><strong>Quantidade</strong></TableCell>
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
              ) : filteredDepartamentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="textSecondary">
                      Nenhum departamento encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDepartamentos.map((dept) => (
                  <TableRow key={dept.id} hover>
                    <TableCell>
                      <Typography variant="body1" style={{ fontWeight: 500 }}>
                        {dept.nome}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {dept.usuarios.slice(0, 3).map((usuario) => (
                          <Chip
                            key={usuario.id}
                            label={usuario.name}
                            size="small"
                            variant="outlined"
                            color={usuario.isCoordenador ? "primary" : "default"}
                          />
                        ))}
                        {dept.usuarios.length > 3 && (
                          <Chip
                            label={`+${dept.usuarios.length - 3}`}
                            size="small"
                            color="primary"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={dept.totalUsuarios}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box className={classes.actionButtons}>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditDepartamento(dept.id)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleDeleteDepartamento(dept.id)}
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
      </Paper>
    </MainContainer>
  );
};

export default DepartamentosPage;
