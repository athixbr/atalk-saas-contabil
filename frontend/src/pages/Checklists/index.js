import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Box,
} from "@material-ui/core";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from "@material-ui/icons";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { useHistory } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  searchContainer: {
    display: "flex",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    alignItems: "center",
  },
  searchField: {
    flex: 1,
  },
  filterField: {
    minWidth: 200,
  },
  table: {
    minWidth: 650,
  },
  ativoChip: {
    backgroundColor: "#4caf50",
    color: "white",
  },
  inativoChip: {
    backgroundColor: "#f44336",
    color: "white",
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(1),
  },
}));

const Checklists = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);

  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("todos");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);

  useEffect(() => {
    loadChecklists();
  }, [searchParam, filtroAtivo]);

  const loadChecklists = async () => {
    setLoading(true);
    try {
      const params = {
        pageSize: 999999,
      };

      if (searchParam) {
        params.searchParam = searchParam;
      }

      if (filtroAtivo !== "todos") {
        params.ativo = filtroAtivo === "ativos";
      }

      const { data } = await api.get("/checklists", { params });
      setChecklists(data.checklists || []);
    } catch (err) {
      console.error("Erro ao carregar checklists:", err);
      toast.error("Erro ao carregar checklists");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchParam(e.target.value);
  };

  const handleNewChecklist = () => {
    history.push("/checklists/cadastro");
  };

  const handleEdit = (checklistId) => {
    history.push(`/checklists/cadastro/${checklistId}`);
  };

  const handleView = (checklistId) => {
    history.push(`/checklists/${checklistId}`);
  };

  const handleDeleteClick = (checklist) => {
    setSelectedChecklist(checklist);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/checklists/${selectedChecklist.id}`);
      toast.success("Checklist excluído com sucesso");
      loadChecklists();
      setDeleteModalOpen(false);
      setSelectedChecklist(null);
    } catch (err) {
      console.error("Erro ao excluir checklist:", err);
      toast.error("Erro ao excluir checklist");
    }
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title="Excluir Checklist"
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedChecklist(null);
        }}
        onConfirm={handleDelete}
      >
        Tem certeza que deseja excluir o checklist "{selectedChecklist?.titulo}"?
        Todos os itens e arquivos associados serão removidos.
      </ConfirmationModal>

      <MainHeader>
        <Title>Checklists</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNewChecklist}
          >
            Novo Checklist
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <Box className={classes.searchContainer}>
          <TextField
            className={classes.searchField}
            placeholder="Buscar por título ou descrição"
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="disabled" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl className={classes.filterField}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filtroAtivo}
              onChange={(e) => setFiltroAtivo(e.target.value)}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="ativos">Ativos</MenuItem>
              <MenuItem value="inativos">Inativos</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Typography>Carregando...</Typography>
        ) : (
          <Table className={classes.table} size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Título</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Itens</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Criado Por</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {checklists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="textSecondary">
                      Nenhum checklist encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                checklists.map((checklist) => (
                  <TableRow key={checklist.id} hover>
                    <TableCell>{checklist.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{checklist.titulo}</Typography>
                      {checklist.descricao && (
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          style={{
                            display: "block",
                            maxWidth: 300,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {checklist.descricao}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{checklist.tipo || "Padrão"}</TableCell>
                    <TableCell>
                      {checklist.itens?.length || 0} {checklist.itens?.length === 1 ? "item" : "itens"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={checklist.ativo ? "Ativo" : "Inativo"}
                        size="small"
                        className={
                          checklist.ativo
                            ? classes.ativoChip
                            : classes.inativoChip
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {checklist.creator?.name || "-"}
                    </TableCell>
                    <TableCell align="center">
                      <Box className={classes.actionButtons}>
                        <Tooltip title="Visualizar">
                          <IconButton
                            size="small"
                            onClick={() => handleView(checklist.id)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(checklist.id)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(checklist)}
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
        )}
      </Paper>
    </MainContainer>
  );
};

export default Checklists;
