import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import Chip from "@material-ui/core/Chip";
import Pagination from "@material-ui/lab/Pagination";
import { Add, Edit, Delete, Refresh } from "@material-ui/icons";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/Auth/AuthContext";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import RecorrenciaModal from "./RecorrenciaModal";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(3),
  },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
  },
  addButton: {
    background: "linear-gradient(135deg, #0596cd 0%, #047ba5 100%)",
    color: "#fff",
    "&:hover": {
      background: "linear-gradient(135deg, #047ba5 0%, #035c7d 100%)",
    },
  },
  tablePaper: {
    padding: theme.spacing(3),
    borderRadius: "16px",
    marginTop: theme.spacing(2),
  },
  statusChip: {
    fontWeight: 600,
  },
  pagination: {
    marginTop: theme.spacing(3),
    display: "flex",
    justifyContent: "center",
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(5),
    color: theme.palette.text.secondary,
  },
}));

const Recorrencia = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [recorrencias, setRecorrencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecorrenciaId, setSelectedRecorrenciaId] = useState(null);

  useEffect(() => {
    loadRecorrencias();
  }, [page]);

  const loadRecorrencias = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/recorrencias", { params: { page, pageSize: 20 } });
      setRecorrencias(data.records || data.recorrencias || []);
      setTotalPages(Math.ceil((data.count || data.total || 0) / 20));
    } catch (error) {
      console.error("Erro ao carregar recorrências:", error);
      // Se a API não existir ainda, não mostrar erro
      if (error.response?.status !== 404) {
        toast.error("Erro ao carregar recorrências");
      }
      setRecorrencias([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecorrencia = () => {
    setSelectedRecorrenciaId(null);
    setModalOpen(true);
  };

  const handleEditRecorrencia = (id) => {
    setSelectedRecorrenciaId(id);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRecorrenciaId(null);
  };

  const handleSaveRecorrencia = () => {
    loadRecorrencias();
  };

  const handleDeleteRecorrencia = async (id) => {
    if (window.confirm("Deseja realmente excluir esta tarefa recorrente?")) {
      try {
        await api.delete(`/recorrencias/${id}`);
        toast.success("Tarefa recorrente excluída com sucesso");
        loadRecorrencias();
      } catch (error) {
        console.error("Erro ao excluir recorrência:", error);
        toast.error(error.response?.data?.message || "Erro ao excluir tarefa recorrente");
      }
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Tarefas Recorrentes</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            className={classes.addButton}
            startIcon={<Add />}
            onClick={handleAddRecorrencia}
          >
            Nova Tarefa Recorrente
          </Button>
          <IconButton onClick={loadRecorrencias}>
            <Refresh />
          </IconButton>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      
      <Paper className={classes.mainPaper} variant="outlined">
        <Paper className={classes.tablePaper}>
          <Typography variant="h6" gutterBottom>
            Lista de Tarefas Recorrentes
          </Typography>
          
          {loading ? (
            <div className={classes.emptyState}>
              <Typography>Carregando...</Typography>
            </div>
          ) : recorrencias.length === 0 ? (
            <div className={classes.emptyState}>
              <Typography variant="h6" gutterBottom>
                Nenhuma tarefa recorrente encontrada
              </Typography>
              <Typography color="textSecondary">
                Clique em "Nova Tarefa Recorrente" para começar
              </Typography>
            </div>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Código</TableCell>
                      <TableCell>Nome da Tarefa</TableCell>
                      <TableCell>Departamento</TableCell>
                      <TableCell>Esfera</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recorrencias.map((recorrencia) => (
                      <TableRow key={recorrencia.id}>
                        <TableCell>{recorrencia.codigo || "-"}</TableCell>
                        <TableCell>{recorrencia.nomeTarefa || recorrencia.nome}</TableCell>
                        <TableCell>{recorrencia.departamento?.name || "-"}</TableCell>
                        <TableCell>
                          {recorrencia.esfera ? (
                            <Chip
                              label={recorrencia.esfera}
                              size="small"
                              variant="outlined"
                            />
                          ) : "-"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={recorrencia.ativa ? "Ativa" : "Inativa"}
                            color={recorrencia.ativa ? "primary" : "default"}
                            size="small"
                            className={classes.statusChip}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleEditRecorrencia(recorrencia.id)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteRecorrencia(recorrencia.id)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {totalPages > 1 && (
                <div className={classes.pagination}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </div>
              )}
            </>
          )}
        </Paper>
      </Paper>

      <RecorrenciaModal
        open={modalOpen}
        onClose={handleCloseModal}
        recorrenciaId={selectedRecorrenciaId}
        onSave={handleSaveRecorrencia}
      />
    </MainContainer>
  );
};

export default Recorrencia;
