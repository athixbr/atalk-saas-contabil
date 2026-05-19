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
import LinearProgress from "@material-ui/core/LinearProgress";
import Box from "@material-ui/core/Box";
import { Add, Edit, Delete, Refresh, AttachMoney } from "@material-ui/icons";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
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
  progressContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
}));

const Parcelamentos = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const [parcelamentos, setParcelamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadParcelamentos();
  }, [page]);

  const loadParcelamentos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/parametros/parcelamentos", { params: { page } });
      setParcelamentos(data.records || []);
      setTotalPages(Math.ceil((data.count || 0) / 20));
    } catch (error) {
      console.error("Erro ao carregar parcelamentos:", error);
      toast.error("Erro ao carregar parcelamentos");
      setParcelamentos([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleAddParcelamento = () => {
    history.push("/parcelamentos/novo");
  };

  const handleEditParcelamento = (id) => {
    history.push(`/parcelamentos/editar/${id}`);
  };

  const handleDeleteParcelamento = async (id) => {
    if (window.confirm("Deseja realmente excluir este parcelamento?")) {
      try {
        await api.delete(`/parametros/parcelamentos/${id}`);
        toast.success("Parcelamento excluído com sucesso");
        loadParcelamentos();
      } catch (error) {
        console.error("Erro ao excluir parcelamento:", error);
        toast.error("Erro ao excluir parcelamento");
      }
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const calcularProgresso = (parcelasPagas, totalParcelas) => {
    if (!totalParcelas || totalParcelas === 0) return 0;
    return Math.round((parcelasPagas / totalParcelas) * 100);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'ativo': 'Ativo',
      'concluido': 'Concluído',
      'cancelado': 'Cancelado',
      'suspenso': 'Suspenso'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'ativo': 'primary',
      'concluido': 'default',
      'cancelado': 'secondary',
      'suspenso': 'default'
    };
    return colorMap[status] || 'default';
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Parcelamentos</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            className={classes.addButton}
            startIcon={<Add />}
            onClick={handleAddParcelamento}
          >
            Novo Parcelamento
          </Button>
          <IconButton onClick={loadParcelamentos}>
            <Refresh />
          </IconButton>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      
      <Paper className={classes.mainPaper} variant="outlined">
        <Typography variant="h6" gutterBottom>
          Lista de Parcelamentos
        </Typography>
          
          {loading ? (
            <div className={classes.emptyState}>
              <Typography>Carregando...</Typography>
            </div>
          ) : parcelamentos.length === 0 ? (
            <div className={classes.emptyState}>
              <Typography variant="h6" gutterBottom>
                Nenhum parcelamento encontrado
              </Typography>
              <Typography color="textSecondary">
                Clique em "Novo Parcelamento" para começar
              </Typography>
            </div>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Descrição</TableCell>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Valor Total</TableCell>
                      <TableCell>Parcelas</TableCell>
                      <TableCell>Progresso</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parcelamentos.map((parcelamento) => {
                      const progresso = calcularProgresso(
                        parcelamento.parcelasPagas || 0,
                        parcelamento.totalParcelas || parcelamento.numeroParcelas || 0
                      );
                      
                      return (
                        <TableRow key={parcelamento.id}>
                          <TableCell>{parcelamento.id}</TableCell>
                          <TableCell>{parcelamento.nome || parcelamento.descricao || '-'}</TableCell>
                          <TableCell>{parcelamento.cliente?.nome || '-'}</TableCell>
                          <TableCell>
                            {formatCurrency(parcelamento.valorTotal)}
                          </TableCell>
                          <TableCell>
                            {parcelamento.parcelasPagas || 0} / {parcelamento.totalParcelas || parcelamento.numeroParcelas || 0}
                          </TableCell>
                          <TableCell>
                            <div className={classes.progressContainer}>
                              <LinearProgress
                                variant="determinate"
                                value={progresso}
                                className={classes.progressBar}
                              />
                              <Typography variant="caption">
                                {progresso}%
                              </Typography>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(parcelamento.status)}
                              color={getStatusColor(parcelamento.status)}
                              size="small"
                              className={classes.statusChip}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => handleEditParcelamento(parcelamento.id)}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteParcelamento(parcelamento.id)}
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
    </MainContainer>
  );
};

export default Parcelamentos;
