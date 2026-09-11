import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import toastError from "../../errors/toastError";
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
  Avatar,
} from "@material-ui/core";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  GroupOutlined as GroupOutlinedIcon,
  Star as StarIcon,
} from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import ConfirmationModal from "../../components/ConfirmationModal";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(3),
    width: "100%",
    boxSizing: "border-box",
  },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(3),
    overflowY: "auto",
    overflowX: "hidden",
    width: "100%",
    boxSizing: "border-box",
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
    justifyContent: "center",
    gap: theme.spacing(1),
  },
  deptNameCell: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  deptAvatar: {
    width: theme.spacing(4.5),
    height: theme.spacing(4.5),
    backgroundColor: theme.palette.primary.main,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(6, 2),
    color: theme.palette.text.secondary,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing(1),
    opacity: 0.5,
  },
  coordenadorChip: {
    fontWeight: 700,
    border: `1px solid ${theme.palette.primary.main}`,
  },
  coordenadorIcon: {
    fontSize: "14px !important",
    color: `${theme.palette.warning?.main || "#f5a623"} !important`,
  },
}));

const DepartamentosPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const [searchParam, setSearchParam] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [departamentos, setDepartamentos] = useState([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedDepartamento, setSelectedDepartamento] = useState(null);

  const fetchDepartamentos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/departamentos", {
        params: { searchParam },
      });
      setDepartamentos(data.departamentos || []);
    } catch (error) {
      toastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDepartamentos();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam]);

  const handleAddDepartamento = () => {
    history.push("/departamentos/cadastro");
  };

  const handleEditDepartamento = (deptId) => {
    history.push(`/departamentos/cadastro/${deptId}`);
  };

  const handleOpenDeleteModal = (departamento) => {
    setSelectedDepartamento(departamento);
    setConfirmModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setConfirmModalOpen(false);
    setSelectedDepartamento(null);
  };

  const handleDeleteDepartamento = async () => {
    if (!selectedDepartamento) return;
    setDeleting(true);
    try {
      await api.delete(`/departamentos/${selectedDepartamento.id}`);
      toast.success("Departamento excluído com sucesso!");
      await fetchDepartamentos();
    } catch (error) {
      toastError(error);
    } finally {
      setDeleting(false);
      setSelectedDepartamento(null);
    }
  };

  const getInitials = (nome = "") => {
    return nome
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={classes.mainContainer}>
      <ConfirmationModal
        title={
          selectedDepartamento &&
          `Excluir o departamento "${selectedDepartamento.nome}"?`
        }
        open={confirmModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteDepartamento}
      >
        Essa ação não pode ser desfeita. Os vínculos com os usuários deste
        departamento também serão removidos.
      </ConfirmationModal>

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

        <TableContainer style={{ width: "100%", overflowX: "auto" }}>
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
                  <TableCell colSpan={4} align="center" style={{ padding: 32 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : departamentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Box className={classes.emptyState}>
                      <BusinessIcon className={classes.emptyIcon} />
                      <Typography variant="body1">
                        {searchParam
                          ? "Nenhum departamento encontrado para essa busca"
                          : "Nenhum departamento cadastrado ainda"}
                      </Typography>
                      {!searchParam && (
                        <Button
                          color="primary"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={handleAddDepartamento}
                          style={{ marginTop: 8 }}
                        >
                          Criar o primeiro departamento
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                departamentos.map((dept) => (
                  <TableRow key={dept.id} hover>
                    <TableCell>
                      <Box className={classes.deptNameCell}>
                        <Avatar className={classes.deptAvatar} variant="rounded">
                          {getInitials(dept.nome)}
                        </Avatar>
                        <Typography variant="body1" style={{ fontWeight: 500 }}>
                          {dept.nome}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {dept.usuarios.length === 0 ? (
                        <Typography variant="caption" color="textSecondary">
                          Nenhum usuário vinculado
                        </Typography>
                      ) : (
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                          {(() => {
                            const usuariosOrdenados = [...dept.usuarios].sort(
                              (a, b) => (b.isCoordenador ? 1 : 0) - (a.isCoordenador ? 1 : 0)
                            );
                            const visiveis = usuariosOrdenados.slice(0, 3);
                            const restantes = usuariosOrdenados.slice(3);
                            return (
                              <>
                                {visiveis.map((usuario) => (
                                  <Chip
                                    key={usuario.id}
                                    label={usuario.name}
                                    size="small"
                                    variant="outlined"
                                    icon={usuario.isCoordenador ? (
                                      <StarIcon className={classes.coordenadorIcon} />
                                    ) : undefined}
                                    className={usuario.isCoordenador ? classes.coordenadorChip : undefined}
                                    color={usuario.isCoordenador ? "primary" : "default"}
                                    title={usuario.isCoordenador ? "Coordenador" : "Membro"}
                                  />
                                ))}
                                {restantes.length > 0 && (
                                  <Tooltip
                                    title={restantes
                                      .map((u) => `${u.name}${u.isCoordenador ? " (Coordenador)" : ""}`)
                                      .join(", ")}
                                  >
                                    <Chip
                                      label={`+${restantes.length}`}
                                      size="small"
                                      color="primary"
                                    />
                                  </Tooltip>
                                )}
                              </>
                            );
                          })()}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={<GroupOutlinedIcon />}
                        label={dept.totalUsuarios}
                        size="small"
                        color="primary"
                        variant="outlined"
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
                            disabled={deleting}
                            onClick={() => handleOpenDeleteModal(dept)}
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
    </div>
  );
};

export default DepartamentosPage;
