import React, { useState, useEffect, useContext } from "react";
import {
  Paper,
  Typography,
  makeStyles,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Box,
} from "@material-ui/core";
import {
  Search as SearchIcon,
  History as HistoryIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
} from "@material-ui/icons";
import { toast } from "react-toastify";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { format, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import ModalDetalhes from "./components/ModalDetalhes";
import DrawerHistorico from "../CentralVinculos/components/DrawerHistorico";
import ExportButton from "./components/ExportButton";
import GraficosVencimentos from "./components/GraficosVencimentos";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  statsCard: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  statsValue: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: theme.palette.primary.main,
  },
  statsLabel: {
    color: theme.palette.text.secondary,
    fontSize: "0.875rem",
  },
  filterBar: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
  },
  tableContainer: {
    marginTop: theme.spacing(2),
  },
  chipAtivo: {
    backgroundColor: theme.palette.success.main,
    color: "#fff",
  },
  chipInativo: {
    backgroundColor: theme.palette.error.main,
    color: "#fff",
  },
  chipVencendo: {
    backgroundColor: theme.palette.warning.main,
    color: "#fff",
  },
  chipVencido: {
    backgroundColor: "#d32f2f",
    color: "#fff",
  },
  actionButton: {
    margin: theme.spacing(0.5),
  },
}));

const ControlesVinculados = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  // Estados
  const [vinculos, setVinculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [count, setCount] = useState(0);

  // Estados de filtros
  const [searchParam, setSearchParam] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("true");
  const [controleConfigId, setControleConfigId] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");
  const [filtroVencimento, setFiltroVencimento] = useState(""); // todos, vencendo, vencido

  // Dados auxiliares
  const [controles, setControles] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);

  // Modais
  const [openDetalhesModal, setOpenDetalhesModal] = useState(false);
  const [openHistoricoDrawer, setOpenHistoricoDrawer] = useState(false);
  const [vinculoSelecionado, setVinculoSelecionado] = useState(null);
  const [mostrarGraficos, setMostrarGraficos] = useState(false);

  // Carregar vínculos
  useEffect(() => {
    carregarVinculos();
  }, [pageNumber, pageSize, searchParam, filtroAtivo, controleConfigId, departamentoId]);

  // Carregar dados auxiliares
  useEffect(() => {
    carregarControles();
    carregarDepartamentos();
  }, []);

  const carregarVinculos = async () => {
    try {
      setLoading(true);
      const params = {
        pageNumber,
        pageSize,
      };

      if (searchParam) params.searchParam = searchParam;
      if (filtroAtivo !== "") params.ativo = filtroAtivo;
      if (controleConfigId) params.controleConfigId = controleConfigId;
      if (departamentoId) params.departamentoId = departamentoId;

      // Filtro de vencimento
      const hoje = new Date();
      const data30Dias = new Date();
      data30Dias.setDate(data30Dias.getDate() + 30);

      if (filtroVencimento === "vencendo") {
        params.dataFimMin = hoje.toISOString().split("T")[0];
        params.dataFimMax = data30Dias.toISOString().split("T")[0];
      } else if (filtroVencimento === "vencido") {
        params.dataFimMax = hoje.toISOString().split("T")[0];
      }

      const { data } = await api.get("/controle-clientes/vinculos", { params });

      setVinculos(data.vinculos);
      setCount(data.count);
    } catch (err) {
      console.error("Erro ao carregar vínculos:", err);
      toast.error("Erro ao carregar vínculos");
    } finally {
      setLoading(false);
    }
  };

  const carregarControles = async () => {
    try {
      const { data } = await api.get("/controles-config");
      setControles(data.controles || []);
    } catch (err) {
      console.error("Erro ao carregar controles:", err);
    }
  };

  const carregarDepartamentos = async () => {
    try {
      const { data } = await api.get("/departamentos");
      setDepartamentos(data.departamentos || []);
    } catch (err) {
      console.error("Erro ao carregar departamentos:", err);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPageNumber(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPageNumber(1);
  };

  const handleVerDetalhes = (vinculo) => {
    setVinculoSelecionado(vinculo);
    setOpenDetalhesModal(true);
  };

  const handleVerHistorico = (vinculo) => {
    setVinculoSelecionado(vinculo);
    setOpenHistoricoDrawer(true);
  };

  const formatarData = (data) => {
    if (!data) return "-";
    try {
      return format(parseISO(data), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  const calcularDiasRestantes = (dataFim) => {
    if (!dataFim) return null;
    try {
      const hoje = new Date();
      const fim = parseISO(dataFim);
      return differenceInDays(fim, hoje);
    } catch {
      return null;
    }
  };

  const getStatusChip = (vinculo) => {
    if (!vinculo.ativo) {
      return <Chip size="small" label="Inativo" className={classes.chipInativo} />;
    }

    const diasRestantes = calcularDiasRestantes(vinculo.dataFim);

    if (diasRestantes === null) {
      return <Chip size="small" label="Ativo" className={classes.chipAtivo} />;
    }

    if (diasRestantes < 0) {
      return (
        <Chip
          size="small"
          icon={<CancelIcon />}
          label={`Vencido há ${Math.abs(diasRestantes)} dias`}
          className={classes.chipVencido}
        />
      );
    }

    if (diasRestantes <= 30) {
      return (
        <Chip
          size="small"
          icon={<WarningIcon />}
          label={`Vence em ${diasRestantes} dias`}
          className={classes.chipVencendo}
        />
      );
    }

    return (
      <Chip
        size="small"
        icon={<CheckCircleIcon />}
        label="Ativo"
        className={classes.chipAtivo}
      />
    );
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Controles Vinculados - Meus Controles</Title>
        <MainHeaderButtonsWrapper>
          <ExportButton vinculos={vinculos} loading={loading} />
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setMostrarGraficos(!mostrarGraficos)}
          >
            {mostrarGraficos ? "Ocultar Gráficos" : "Exibir Gráficos"}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        {/* Cards de resumo */}
        <Grid container spacing={3} style={{ marginBottom: 24 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card className={classes.statsCard}>
              <CardContent>
                <Typography className={classes.statsValue}>
                  {vinculos.filter((v) => v.ativo).length}
                </Typography>
                <Typography className={classes.statsLabel}>Controles Ativos</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card className={classes.statsCard}>
              <CardContent>
                <Typography className={classes.statsValue} style={{ color: "#ff9800" }}>
                  {vinculos.filter((v) => {
                    const dias = calcularDiasRestantes(v.dataFim);
                    return v.ativo && dias !== null && dias >= 0 && dias <= 30;
                  }).length}
                </Typography>
                <Typography className={classes.statsLabel}>Vencendo em 30 dias</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card className={classes.statsCard}>
              <CardContent>
                <Typography className={classes.statsValue} style={{ color: "#f44336" }}>
                  {vinculos.filter((v) => {
                    const dias = calcularDiasRestantes(v.dataFim);
                    return v.ativo && dias !== null && dias < 0;
                  }).length}
                </Typography>
                <Typography className={classes.statsLabel}>Vencidos</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filtros */}
        <Paper className={classes.filterBar}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Buscar cliente"
                variant="outlined"
                size="small"
                value={searchParam}
                onChange={(e) => setSearchParam(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filtroAtivo}
                  onChange={(e) => setFiltroAtivo(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="true">Ativos</MenuItem>
                  <MenuItem value="false">Inativos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Vencimento</InputLabel>
                <Select
                  value={filtroVencimento}
                  onChange={(e) => setFiltroVencimento(e.target.value)}
                  label="Vencimento"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="vencendo">Vencendo (30 dias)</MenuItem>
                  <MenuItem value="vencido">Vencidos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Controle</InputLabel>
                <Select
                  value={controleConfigId}
                  onChange={(e) => setControleConfigId(e.target.value)}
                  label="Controle"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {controles.map((controle) => (
                    <MenuItem key={controle.id} value={controle.id}>
                      {controle.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchParam("");
                  setFiltroAtivo("true");
                  setControleConfigId("");
                  setDepartamentoId("");
                  setFiltroVencimento("");
                }}
              >
                Limpar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabela */}
        <TableContainer className={classes.tableContainer}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Controle</TableCell>
                <TableCell>Data Início</TableCell>
                <TableCell>Data Fim</TableCell>
                <TableCell>Departamento</TableCell>
                <TableCell>Responsável</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vinculos.map((vinculo) => (
                <TableRow key={vinculo.id}>
                  <TableCell>{vinculo.cliente?.nome || "-"}</TableCell>
                  <TableCell>{vinculo.controleConfig?.nome || "-"}</TableCell>
                  <TableCell>{formatarData(vinculo.dataInicio)}</TableCell>
                  <TableCell>{formatarData(vinculo.dataFim)}</TableCell>
                  <TableCell>{vinculo.departamento?.nome || "-"}</TableCell>
                  <TableCell>{vinculo.usuario?.name || "-"}</TableCell>
                  <TableCell>{getStatusChip(vinculo)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver Detalhes">
                      <IconButton
                        size="small"
                        className={classes.actionButton}
                        color="primary"
                        onClick={() => handleVerDetalhes(vinculo)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Histórico">
                      <IconButton
                        size="small"
                        className={classes.actionButton}
                        onClick={() => handleVerHistorico(vinculo)}
                      >
                        <HistoryIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {vinculos.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="textSecondary">
                      Nenhum controle vinculado encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginação */}
        <TablePagination
          rowsPerPageOptions={[10, 20, 50, 100]}
          component="div"
          count={count}
          rowsPerPage={pageSize}
          page={pageNumber - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
          }
        />
      </Paper>

      {/* Gráficos */}
      {mostrarGraficos && <GraficosVencimentos vinculos={vinculos} />}

      {/* Modais e Drawers */}
      <ModalDetalhes
        open={openDetalhesModal}
        onClose={() => {
          setOpenDetalhesModal(false);
          setVinculoSelecionado(null);
        }}
        vinculoId={vinculoSelecionado?.id}
      />

      <DrawerHistorico
        open={openHistoricoDrawer}
        onClose={() => {
          setOpenHistoricoDrawer(false);
          setVinculoSelecionado(null);
        }}
        vinculoId={vinculoSelecionado?.id}
        clienteNome={vinculoSelecionado?.cliente?.nome}
      />
    </MainContainer>
  );
};

export default ControlesVinculados;
