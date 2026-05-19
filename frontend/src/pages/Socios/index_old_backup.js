import React, { useState, useEffect, useReducer, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
  TextField,
  Button,
  Chip,
} from "@material-ui/core";
import {
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ConfirmationModal from "../../components/ConfirmationModal";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  searchField: {
    marginBottom: theme.spacing(2),
  },
  tableRow: {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  cpfCell: {
    fontFamily: "monospace",
  },
  empresasCell: {
    maxWidth: 300,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  chip: {
    margin: theme.spacing(0.5),
    fontSize: "0.75rem",
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_SOCIOS") {
    const socios = action.payload;
    const newSocios = [];

    socios.forEach((socio) => {
      const socioIndex = state.findIndex((s) => s.id === socio.id);
      if (socioIndex !== -1) {
        state[socioIndex] = socio;
      } else {
        newSocios.push(socio);
      }
    });

    return [...state, ...newSocios];
  }

  if (action.type === "UPDATE_SOCIO") {
    const socio = action.payload;
    const socioIndex = state.findIndex((s) => s.id === socio.id);

    if (socioIndex !== -1) {
      state[socioIndex] = socio;
      return [...state];
    } else {
      return [socio, ...state];
    }
  }

  if (action.type === "DELETE_SOCIO") {
    const socioId = action.payload;
    const socioIndex = state.findIndex((s) => s.id === socioId);
    if (socioIndex !== -1) {
      state.splice(socioIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Socios = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [socios, dispatch] = useReducer(reducer, []);
  const [deletingSocio, setDeletingSocio] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchSocios();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  const fetchSocios = async () => {
    try {
      const { data } = await api.get("/socios", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_SOCIOS", payload: data.socios });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toast.error("Erro ao carregar sócios");
      console.error(err);
    }
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditSocio = (socioId) => {
    history.push(`/socios/cadastro/${socioId}`);
  };

  const handleDeleteSocio = async (socioId) => {
    try {
      await api.delete(`/socios/${socioId}`);
      toast.success("Sócio excluído com sucesso");
      dispatch({ type: "DELETE_SOCIO", payload: socioId });
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Erro ao excluir sócio";
      toast.error(errorMsg);
    }
    setDeletingSocio(null);
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const formatCPF = (cpf) => {
    if (!cpf) return "";
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatTelefone = (tel) => {
    if (!tel) return "";
    const cleaned = tel.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return tel;
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title="Excluir Sócio"
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteSocio(deletingSocio)}
      >
        Tem certeza que deseja excluir este sócio? Esta ação não pode ser desfeita.
      </ConfirmationModal>

      <MainHeader>
        <Title>Sócios</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => history.push("/socios/cadastro")}
          >
            Novo Sócio
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined" onScroll={handleScroll}>
        <TextField
          className={classes.searchField}
          placeholder="Buscar por nome, CPF, email..."
          type="search"
          value={searchParam}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon style={{ color: "gray" }} />
              </InputAdornment>
            ),
          }}
          fullWidth
        />

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>CPF</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Empresas</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {socios.map((socio) => (
                <TableRow
                  key={socio.id}
                  className={classes.tableRow}
                  onClick={() => handleEditSocio(socio.id)}
                >
                  <TableCell>{socio.nome}</TableCell>
                  <TableCell className={classes.cpfCell}>
                    {formatCPF(socio.cpf)}
                  </TableCell>
                  <TableCell>{formatTelefone(socio.celular || socio.telefone)}</TableCell>
                  <TableCell>{socio.email}</TableCell>
                  <TableCell className={classes.empresasCell}>
                    {socio.clientes && socio.clientes.length > 0 ? (
                      socio.clientes.map((cliente) => (
                        <Chip
                          key={cliente.id}
                          label={`${cliente.nome} (${cliente.ClienteSocio?.percentual || 0}%)`}
                          size="small"
                          className={classes.chip}
                        />
                      ))
                    ) : (
                      <span style={{ color: "#999" }}>Sem vínculos</span>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSocio(socio.id);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingSocio(socio.id);
                        setConfirmModalOpen(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={6} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Socios;
