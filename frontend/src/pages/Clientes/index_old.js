import React, { useState, useEffect, useCallback, useRef, useContext } from "react";
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
  Checkbox,
  Popover,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Card,
  CardContent,
  TableSortLabel,
} from "@material-ui/core";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  ViewColumn as ViewColumnIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  DragIndicator as DragIndicatorIcon,
} from "@material-ui/icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import ConfirmationModal from "../../components/ConfirmationModal";
import api from "../../services/api";
import { toast } from "react-toastify";

const AVAILABLE_COLUMNS = [
  { id: "tipoCliente", label: "Tipo", enabled: true },
  { id: "documento", label: "CPF/CNPJ", enabled: true },
  { id: "nome", label: "Nome", enabled: true },
  { id: "apelido", label: "Apelido", enabled: false },
  { id: "nomeFantasia", label: "Nome Fantasia", enabled: true },
  { id: "razaoSocial", label: "Razão Social", enabled: false },
  { id: "email", label: "E-mail", enabled: true },
  { id: "telefone", label: "Telefone", enabled: false },
  { id: "celular", label: "Celular", enabled: false },
  { id: "cidade", label: "Cidade/UF", enabled: true },
  { id: "tipoServico", label: "Tipo Serviço", enabled: false },
  { id: "codigoErp", label: "Código ERP", enabled: false },
  { id: "codigoSistema", label: "Código Sistema", enabled: false },
  { id: "honorario", label: "Honorário", enabled: false },
  { id: "produtorRural", label: "Produtor Rural", enabled: false },
  // Parâmetros de Classificação
  { id: "status", label: "Status", enabled: false },
  { id: "statusComplementar", label: "Status Complementar", enabled: false },
  { id: "segmento", label: "Segmento", enabled: false },
  { id: "sedeCliente", label: "Sede", enabled: false },
  { id: "regimeTributarioFederal", label: "Regime Federal", enabled: false },
  { id: "regimeTributarioEstadual", label: "Regime Estadual", enabled: false },
  { id: "regimeTributarioMunicipal", label: "Regime Municipal", enabled: false },
  { id: "modalidadeFechamentoContabil", label: "Modal. Fech. Contábil", enabled: false },
  { id: "modalidadeFechamentoFiscal", label: "Modal. Fech. Fiscal", enabled: false },
  { id: "modalidadeFechamentoDP", label: "Modal. Fech. DP", enabled: false },
  { id: "distribuicaoLucros", label: "Distribuição Lucros", enabled: false },
  { id: "servicosExtraordinarios", label: "Serv. Extraordinários", enabled: false },
  { id: "grupoCliente", label: "Grupo Cliente", enabled: false },
  { id: "localizacaoCliente", label: "Localização", enabled: false },
  { id: "adiantamentoFolha", label: "Adiant. Folha", enabled: false },
  { id: "controles", label: "Controles", enabled: false },
  { id: "tipoClienteParametro", label: "Tipo Cliente", enabled: false },
  { id: "categoriaCliente", label: "Categoria", enabled: false },
  { id: "periodicidadeCliente", label: "Periodicidade", enabled: false },
  { id: "envioCorrespondencia", label: "Envio Corresp.", enabled: false },
  { id: "parcelamentos", label: "Parcelamentos", enabled: false },
  { id: "tags", label: "Tags", enabled: false },
  // Novos Parâmetros 2026
  { id: "statusCliente", label: "Status Cliente", enabled: false },
  { id: "porteFederal", label: "Porte Federal", enabled: false },
  { id: "porteEstadual", label: "Porte Estadual", enabled: false },
  { id: "porteMunicipal", label: "Porte Municipal", enabled: false },
  { id: "tierCliente", label: "Tier", enabled: false },
  { id: "clusterCliente", label: "Cluster", enabled: false },
  { id: "volumeFiscal", label: "Vol. Fiscal", enabled: false },
  { id: "volumeContabil", label: "Vol. Contábil", enabled: false },
  { id: "volumeDP", label: "Vol. DP", enabled: false },
  { id: "volumeBPO", label: "Vol. BPO", enabled: false },
  { id: "modalFechBPO", label: "Modal. Fech. BPO", enabled: false },
  { id: "statusControle", label: "Status Controle", enabled: false },
  { id: "ativo", label: "Ativo", enabled: true },
];

const estadosBrasileiros = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  filtersCard: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
  },
  filtersGrid: {
    marginTop: theme.spacing(2),
  },
  tableContainer: {
    maxHeight: "calc(100vh - 350px)",
  },
  tableRow: {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  stickyHeader: {
    position: "sticky",
    top: 0,
    backgroundColor: theme.palette.background.paper,
    zIndex: 10,
  },
  loadingRow: {
    textAlign: "center",
    padding: theme.spacing(2),
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
  columnSelector: {
    padding: theme.spacing(2),
    minWidth: 250,
  },
  statsCard: {
    marginBottom: theme.spacing(2),
  },
  statItem: {
    textAlign: "center",
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(1),
  },
}));

const Clientes = () => {
  const classes = useStyles();
  const history = useHistory();
  const tableRef = useRef(null);
  const { user } = useContext(AuthContext);

  // Estados de dados
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Estados de filtros
  const [searchParam, setSearchParam] = useState("");
  const [tipoClienteFilter, setTipoClienteFilter] = useState("");
  const [tipoServicoFilter, setTipoServicoFilter] = useState("");
  const [ativoFilter, setAtivoFilter] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Estados de ordenação
  const [orderBy, setOrderBy] = useState("id");
  const [order, setOrder] = useState("desc");

  // Estados de UI
  const [columnOrder, setColumnOrder] = useState(AVAILABLE_COLUMNS.map(col => col.id));
  const [visibleColumns, setVisibleColumns] = useState(
    AVAILABLE_COLUMNS.reduce((acc, col) => ({ ...acc, [col.id]: col.enabled }), {})
  );
  const [columnAnchor, setColumnAnchor] = useState(null);
  const [deletingCliente, setDeletingCliente] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    fisica: 0,
    juridica: 0,
    ativos: 0,
  });

  // Carregar preferências do usuário ao montar
  useEffect(() => {
    loadUserPreferences();
  }, [user]);

  useEffect(() => {
    resetAndFetch();
  }, [searchParam, tipoClienteFilter, tipoServicoFilter, ativoFilter, estadoFilter, orderBy, order]);

  const loadUserPreferences = async () => {
    try {
      const savedPrefs = localStorage.getItem(`clientes_table_prefs_${user.id}`);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.columnOrder) setColumnOrder(prefs.columnOrder);
        if (prefs.visibleColumns) setVisibleColumns(prefs.visibleColumns);
        if (prefs.orderBy) setOrderBy(prefs.orderBy);
        if (prefs.order) setOrder(prefs.order);
        
        // Carregar filtros salvos
        if (prefs.filters) {
          if (prefs.filters.tipoCliente) setTipoClienteFilter(prefs.filters.tipoCliente);
          if (prefs.filters.tipoServico) setTipoServicoFilter(prefs.filters.tipoServico);
          if (prefs.filters.ativo !== undefined) setAtivoFilter(prefs.filters.ativo);
          if (prefs.filters.estado) setEstadoFilter(prefs.filters.estado);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar preferências:", err);
    }
  };

  const saveUserPreferences = useCallback(() => {
    try {
      const prefs = {
        columnOrder,
        visibleColumns,
        orderBy,
        order,
        filters: {
          tipoCliente: tipoClienteFilter,
          tipoServico: tipoServicoFilter,
          ativo: ativoFilter,
          estado: estadoFilter,
        },
      };
      localStorage.setItem(`clientes_table_prefs_${user.id}`, JSON.stringify(prefs));
      toast.success("Preferências salvas!");
    } catch (err) {
      console.error("Erro ao salvar preferências:", err);
      toast.error("Erro ao salvar preferências");
    }
  }, [columnOrder, visibleColumns, orderBy, order, tipoClienteFilter, tipoServicoFilter, ativoFilter, estadoFilter, user]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleColumnDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(columnOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setColumnOrder(items);
  };

  const sortData = (data) => {
    if (!orderBy) return data;

    return [...data].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      // Tratamento especial para campos específicos
      if (orderBy === "nome") {
        aValue = a.nome || "";
        bValue = b.nome || "";
      } else if (orderBy === "nomeFantasia") {
        aValue = a.nomeFantasia || a.razaoSocial || "";
        bValue = b.nomeFantasia || b.razaoSocial || "";
      } else if (orderBy === "email") {
        aValue = a.email || "";
        bValue = b.email || "";
      } else if (orderBy === "telefone") {
        aValue = a.telefone || "";
        bValue = b.telefone || "";
      } else if (orderBy === "celular") {
        aValue = a.celular || "";
        bValue = b.celular || "";
      } else if (orderBy === "documento") {
        aValue = a.cpf || a.cnpj || a.cpfCnpj || "";
        bValue = b.cpf || b.cnpj || b.cpfCnpj || "";
      } else if (orderBy === "cidade") {
        aValue = a.cidade || "";
        bValue = b.cidade || "";
      } else if (orderBy === "estado") {
        aValue = a.estado || "";
        bValue = b.estado || "";
      } else if (orderBy === "tipoCliente") {
        aValue = a.tipoCliente || a.tipo || "";
        bValue = b.tipoCliente || b.tipo || "";
      } else if (orderBy === "tipoServico") {
        aValue = a.tipoServico || "";
        bValue = b.tipoServico || "";
      } else if (orderBy === "codigoErp") {
        aValue = a.codigoErp || "";
        bValue = b.codigoErp || "";
      } else if (orderBy === "razaoSocial") {
        aValue = a.razaoSocial || "";
        bValue = b.razaoSocial || "";
      } else if (orderBy === "ativo") {
        aValue = a.ativo ? 1 : 0;
        bValue = b.ativo ? 1 : 0;
      }

      // Tratar valores nulos/undefined
      if (aValue === null || aValue === undefined || aValue === "") return 1;
      if (bValue === null || bValue === undefined || bValue === "") return -1;

      // Ordenação numérica
      if (typeof aValue === "number" && typeof bValue === "number") {
        return order === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Ordenação de data
      if (orderBy === "createdAt" || orderBy === "updatedAt") {
        const dateA = new Date(aValue).getTime();
        const dateB = new Date(bValue).getTime();
        return order === "asc" ? dateA - dateB : dateB - dateA;
      }

      // Ordenação alfabética (case insensitive)
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        bValue = bValue.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        if (order === "asc") {
          return aValue.localeCompare(bValue, "pt-BR");
        } else {
          return bValue.localeCompare(aValue, "pt-BR");
        }
      }

      // Ordenação padrão
      if (order === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  };

  const resetAndFetch = () => {
    setClientes([]);
    setPageNumber(1);
    setHasMore(false);
    fetchClientes(1, true);
  };

  const fetchClientes = async (page = pageNumber, reset = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
      };

      if (searchParam) params.searchParam = searchParam;
      if (tipoClienteFilter) params.tipoCliente = tipoClienteFilter;
      if (tipoServicoFilter) params.tipoServico = tipoServicoFilter;
      if (ativoFilter !== "") params.ativo = ativoFilter;
      if (estadoFilter) params.estado = estadoFilter;

      const { data } = await api.get("/clientes", { params });

      if (reset) {
        setClientes(data.clientes || []);
      } else {
        setClientes((prev) => [...prev, ...(data.clientes || [])]);
      }

      setHasMore(data.hasMore || false);
      setTotalCount(data.count || 0);

      // Calcular estatísticas
      if (reset) {
        const allClientes = data.clientes || [];
        const fisica = allClientes.filter((c) => c.tipo === "PF").length;
        const juridica = allClientes.filter((c) => c.tipo === "PJ").length;
        const ativos = allClientes.filter((c) => c.ativo).length;

        setStats({
          total: data.count || 0,
          fisica,
          juridica,
          ativos,
        });
      }
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = useCallback(() => {
    if (!tableRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
    
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      const nextPage = pageNumber + 1;
      setPageNumber(nextPage);
      fetchClientes(nextPage, false);
    }
  }, [loading, hasMore, pageNumber]);

  useEffect(() => {
    const tableElement = tableRef.current;
    if (tableElement) {
      tableElement.addEventListener("scroll", handleScroll);
      return () => tableElement.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const handleAddCliente = () => {
    history.push("/clientes/cadastro");
  };

  const handleEditCliente = (clienteId) => {
    history.push(`/clientes/cadastro/${clienteId}`);
  };

  const handleDeleteCliente = async (clienteId) => {
    setDeletingCliente(clienteId);
    setConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/clientes/${deletingCliente}`);
      toast.success("Cliente excluído com sucesso!");
      setConfirmModalOpen(false);
      setDeletingCliente(null);
      resetAndFetch();
    } catch (err) {
      console.error("Erro ao excluir cliente:", err);
      toast.error(err.response?.data?.error || "Erro ao excluir cliente");
      setConfirmModalOpen(false);
      setDeletingCliente(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmModalOpen(false);
    setDeletingCliente(null);
  };

  const handleColumnToggle = (columnId) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  const handleOpenColumnSelector = (event) => {
    setColumnAnchor(event.currentTarget);
  };

  const handleCloseColumnSelector = () => {
    setColumnAnchor(null);
  };

  const isColumnVisible = (columnId) => {
    return visibleColumns[columnId] !== false;
  };

  const renderCellValue = (cliente, columnId) => {
    switch (columnId) {
      case "tipoCliente":
        return (
          <Chip
            label={cliente.tipoCliente === "fisica" ? "PF" : "PJ"}
            size="small"
            color={cliente.tipoCliente === "fisica" ? "primary" : "secondary"}
          />
        );
      case "documento":
        // Mostrar CPF ou CNPJ dependendo do tipo
        if (cliente.tipoCliente === "fisica") {
          return cliente.cpf || cliente.cpfCnpj || "-";
        } else {
          return cliente.cnpj || cliente.cpfCnpj || "-";
        }
      case "nome":
        return cliente.nome || "-";
      case "apelido":
        return cliente.apelido || "-";
      case "nomeFantasia":
        // Mostrar nome fantasia se existir, senão razão social
        return cliente.nomeFantasia || cliente.razaoSocial || "-";
      case "razaoSocial":
        return cliente.razaoSocial || "-";
      case "email":
        return cliente.email || "-";
      case "telefone":
        return cliente.telefone || "-";
      case "celular":
        return cliente.celular || "-";
      case "cidade":
        return cliente.cidade && cliente.estado
          ? `${cliente.cidade}/${cliente.estado}`
          : cliente.cidade || cliente.estado || "-";
      case "tipoServico":
        const tipoServicoLabels = {
          interno: "Interno",
          recorrente: "Recorrente",
          esporadico: "Esporádico"
        };
        return tipoServicoLabels[cliente.tipoServico] || cliente.tipoServico || "-";
      case "codigoErp":
        return cliente.codigoErp || "-";
      case "codigoSistema":
        return cliente.codigoSistema || "-";
      case "honorario":
        return cliente.honorario 
          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cliente.honorario)
          : "-";
      case "produtorRural":
        return cliente.produtorRural ? "Sim" : "Não";
      // Parâmetros de Classificação
      case "status":
        return cliente.status?.nome || "-";
      case "statusComplementar":
        return cliente.statusComplementar?.nome || "-";
      case "segmento":
        return cliente.segmento?.nome || "-";
      case "sedeCliente":
        return cliente.sedeCliente?.nome || "-";
      case "regimeTributarioFederal":
        return cliente.regimeTributarioFederal?.nome || "-";
      case "regimeTributarioEstadual":
        return cliente.regimeTributarioEstadual?.nome || "-";
      case "regimeTributarioMunicipal":
        return cliente.regimeTributarioMunicipal?.nome || "-";
      case "modalidadeFechamentoContabil":
        return cliente.modalidadeFechamentoContabil?.nome || "-";
      case "modalidadeFechamentoFiscal":
        return cliente.modalidadeFechamentoFiscal?.nome || "-";
      case "modalidadeFechamentoDP":
        return cliente.modalidadeFechamentoDP?.nome || "-";
      case "distribuicaoLucros":
        return cliente.distribuicaoLucros?.nome || "-";
      case "servicosExtraordinarios":
        return cliente.servicosExtraordinarios?.nome || "-";
      case "grupoCliente":
        return cliente.grupoCliente?.nome || "-";
      case "localizacaoCliente":
        return cliente.localizacaoCliente?.nome || "-";
      case "adiantamentoFolha":
        return cliente.adiantamentoFolha?.nome || "-";
      case "controles":
        return cliente.controles?.nome || "-";
      case "tipoClienteParametro":
        return cliente.tipoClienteParametro?.nome || "-";
      case "categoriaCliente":
        return cliente.categoriaCliente?.nome || "-";
      case "periodicidadeCliente":
        return cliente.periodicidadeCliente?.nome || "-";
      case "envioCorrespondencia":
        return cliente.envioCorrespondencia?.nome || "-";
      case "parcelamentos":
        return cliente.parcelamentos?.nome || "-";
      case "tags":
        return cliente.tags?.nome || "-";
      // Novos Parâmetros 2026
      case "statusCliente":
        return cliente.statusCliente?.nome || "-";
      case "porteFederal":
        return cliente.porteFederal?.nome || "-";
      case "porteEstadual":
        return cliente.porteEstadual?.nome || "-";
      case "porteMunicipal":
        return cliente.porteMunicipal?.nome || "-";
      case "tierCliente":
        return cliente.tierCliente?.nome || "-";
      case "clusterCliente":
        return cliente.clusterCliente?.nome || "-";
      case "volumeFiscal":
        return cliente.volumeFiscal?.nome || "-";
      case "volumeContabil":
        return cliente.volumeContabil?.nome || "-";
      case "volumeDP":
        return cliente.volumeDP?.nome || "-";
      case "volumeBPO":
        return cliente.volumeBPO?.nome || "-";
      case "modalFechBPO":
        return cliente.modalFechBPO?.nome || "-";
      case "statusControle":
        return cliente.statusControle?.nome || "-";
      case "ativo":
        return (
          <Chip
            label={cliente.ativo ? "Ativo" : "Inativo"}
            size="small"
            color={cliente.ativo ? "primary" : "default"}
          />
        );
      default:
        return "-";
    }
  };

  const getTipoLabel = (tipo) => {
    return tipo === "fisica" ? "Pessoa Física" : "Pessoa Jurídica";
  };

  const getTipoColor = (tipo) => {
    return tipo === "fisica" ? "primary" : "secondary";
  };

  const formatDocument = (cliente) => {
    if (cliente.tipoCliente === "fisica") {
      return cliente.cpf || "-";
    }
    return cliente.cnpj || "-";
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Clientes</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddCliente}
          >
            Novo Cliente
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        {/* Card de Estatísticas */}
        <Card className={classes.statsCard}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Box className={classes.statItem}>
                  <Typography variant="h6" color="primary">
                    {stats.total}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total de Clientes
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box className={classes.statItem}>
                  <Typography variant="h6" color="primary">
                    {stats.fisica}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Pessoas Físicas
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box className={classes.statItem}>
                  <Typography variant="h6" color="secondary">
                    {stats.juridica}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Pessoas Jurídicas
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box className={classes.statItem}>
                  <Typography variant="h6" style={{ color: "#4caf50" }}>
                    {stats.ativos}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Clientes Ativos
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Barra de Busca */}
        <TextField
          placeholder="Buscar por nome, email, CPF, CNPJ, razão social..."
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
          style={{ marginBottom: 16 }}
        />

        {/* Botões de Ação */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
            </Button>

            <Button
              variant="outlined"
              startIcon={<ViewColumnIcon />}
              onClick={handleOpenColumnSelector}
            >
              Colunas
            </Button>
            
            <Tooltip title="Salvar configurações de filtros, ordenação e colunas">
              <Button
                variant="contained"
                color="primary"
                onClick={saveUserPreferences}
                size="small"
              >
                Salvar Preferências
              </Button>
            </Tooltip>

            <Popover
              open={Boolean(columnAnchor)}
              anchorEl={columnAnchor}
              onClose={handleCloseColumnSelector}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              <Box className={classes.columnSelector}>
                <Typography variant="subtitle2" gutterBottom>
                  <strong>Personalizar Colunas</strong>
                </Typography>
                <Divider style={{ marginBottom: 8 }} />
                <DragDropContext onDragEnd={handleColumnDragEnd}>
                  <Droppable droppableId="columns">
                    {(provided) => (
                      <List dense {...provided.droppableProps} ref={provided.innerRef}>
                        {columnOrder.map((columnId, index) => {
                          const column = AVAILABLE_COLUMNS.find(c => c.id === columnId);
                          if (!column) return null;
                          return (
                            <Draggable key={column.id} draggableId={column.id} index={index}>
                              {(provided, snapshot) => (
                                <ListItem
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  style={{
                                    ...provided.draggableProps.style,
                                    backgroundColor: snapshot.isDragging ? "#f0f0f0" : "white",
                                  }}
                                  button
                                  onClick={() => handleColumnToggle(column.id)}
                                  dense
                                >
                                  <div {...provided.dragHandleProps}>
                                    <DragIndicatorIcon style={{ marginRight: 8, color: "#999", cursor: "grab" }} />
                                  </div>
                                  <Checkbox
                                    edge="start"
                                    checked={isColumnVisible(column.id)}
                                    tabIndex={-1}
                                    disableRipple
                                  />
                                  <ListItemText primary={column.label} />
                                </ListItem>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </List>
                    )}
                  </Droppable>
                </DragDropContext>
                <Divider style={{ marginTop: 8, marginBottom: 8 }} />
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={saveUserPreferences}
                >
                  Salvar Preferências
                </Button>
              </Box>
            </Popover>
          </Box>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={resetAndFetch}
            disabled={loading}
          >
            Atualizar
          </Button>
        </Box>

        {/* Card de Filtros Avançados */}
        {showFilters && (
          <Card className={classes.filtersCard}>
            <CardContent>
              <Grid container spacing={2} className={classes.filtersGrid}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl variant="outlined" fullWidth size="small">
                    <InputLabel>Tipo de Cliente</InputLabel>
                    <Select
                      value={tipoClienteFilter}
                      onChange={(e) => setTipoClienteFilter(e.target.value)}
                      label="Tipo de Cliente"
                    >
                      <MenuItem value="">
                        <em>Todos</em>
                      </MenuItem>
                      <MenuItem value="fisica">Pessoa Física</MenuItem>
                      <MenuItem value="juridica">Pessoa Jurídica</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl variant="outlined" fullWidth size="small">
                    <InputLabel>Tipo de Serviço</InputLabel>
                    <Select
                      value={tipoServicoFilter}
                      onChange={(e) => setTipoServicoFilter(e.target.value)}
                      label="Tipo de Serviço"
                    >
                      <MenuItem value="">
                        <em>Todos</em>
                      </MenuItem>
                      <MenuItem value="contabil">Contábil</MenuItem>
                      <MenuItem value="fiscal">Fiscal</MenuItem>
                      <MenuItem value="pessoal">Pessoal</MenuItem>
                      <MenuItem value="societario">Societário</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl variant="outlined" fullWidth size="small">
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
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl variant="outlined" fullWidth size="small">
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={estadoFilter}
                      onChange={(e) => setEstadoFilter(e.target.value)}
                      label="Estado"
                    >
                      <MenuItem value="">
                        <em>Todos</em>
                      </MenuItem>
                      {estadosBrasileiros.map((estado) => (
                        <MenuItem key={estado} value={estado}>
                          {estado}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Tabela com Scroll Infinito */}
        <TableContainer
          className={classes.tableContainer}
          ref={tableRef}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columnOrder
                  .filter((colId) => isColumnVisible(colId))
                  .map((colId) => {
                    const column = AVAILABLE_COLUMNS.find(c => c.id === colId);
                    if (!column) return null;
                    return (
                      <TableCell key={column.id} className={classes.stickyHeader}>
                        <TableSortLabel
                          active={orderBy === column.id}
                          direction={orderBy === column.id ? order : "asc"}
                          onClick={() => handleRequestSort(column.id)}
                        >
                          <strong>{column.label}</strong>
                        </TableSortLabel>
                      </TableCell>
                    );
                  })}
                <TableCell align="center" className={classes.stickyHeader}>
                  <strong>Ações</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientes.length === 0 && !loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columnOrder.filter((colId) => isColumnVisible(colId)).length + 1}
                    align="center"
                  >
                    <Box className={classes.emptyState}>
                      <Typography variant="body1" color="textSecondary">
                        Nenhum cliente encontrado
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Ajuste os filtros ou adicione novos clientes
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {sortData(clientes).map((cliente) => (
                    <TableRow key={cliente.id} hover className={classes.tableRow}>
                      {columnOrder
                        .filter((colId) => isColumnVisible(colId))
                        .map((colId) => {
                          const column = AVAILABLE_COLUMNS.find(c => c.id === colId);
                          if (!column) return null;
                          return (
                            <TableCell key={column.id}>
                              {renderCellValue(cliente, column.id)}
                            </TableCell>
                          );
                        })}
                      <TableCell align="center">
                        <Box className={classes.actionButtons}>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditCliente(cliente.id)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => handleDeleteCliente(cliente.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}

                  {loading && (
                    <TableRow className={classes.loadingRow}>
                      <TableCell
                        colSpan={AVAILABLE_COLUMNS.filter((col) => isColumnVisible(col.id)).length + 1}
                        align="center"
                      >
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Info de Total */}
        <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
          <Typography variant="caption" color="textSecondary">
            Mostrando {clientes.length} de {totalCount} clientes
            {hasMore && !loading && " - Role para carregar mais"}
          </Typography>
        </Box>
      </Paper>

      {/* Modal de Confirmação */}
      <ConfirmationModal
        title="Excluir Cliente"
        open={confirmModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      >
        Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
      </ConfirmationModal>
    </MainContainer>
  );
};

export default Clientes;
