import React, { useState, useEffect, useCallback, useContext } from "react";
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
  Checkbox,
  Popover,
  List,
  ListItem,
  ListItemText,
  Divider,
  Menu,
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
  Person as PersonIcon,
  ViewColumn as ViewColumnIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  DragIndicator as DragIndicatorIcon,
  ArrowUpward,
  ArrowDownward,
  Clear as ClearIcon,
  Business as BusinessIcon,
} from "@material-ui/icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import MainContainer from "../../components/MainContainer";
import ConfirmationModal from "../../components/ConfirmationModal";
import api from "../../services/api";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    height: "calc(100vh - 100px)",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  addButton: {
    background: "linear-gradient(135deg, #0596cd 0%, #047ba5 100%)",
    color: "#fff",
    "&:hover": {
      background: "linear-gradient(135deg, #047ba5 0%, #035c7d 100%)",
    },
  },
  tablePaper: {
    padding: theme.spacing(2),
    borderRadius: "16px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
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
    marginBottom: theme.spacing(2),
    flexWrap: "wrap",
  },
  filterField: {
    minWidth: 200,
    backgroundColor: "#fff",
    borderRadius: "8px",
    [theme.breakpoints.down('sm')]: {
      minWidth: '100%',
    },
  },
  searchField: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: "8px",
    minWidth: 250,
    [theme.breakpoints.down('sm')]: {
      minWidth: '100%',
    },
  },
  tableHeader: {
    backgroundColor: "#f5f5f5",
    fontWeight: 600,
  },
  tableHeaderCell: {
    padding: "12px 16px",
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
    "&:hover": {
      backgroundColor: "#e0e0e0",
    },
  },
  dragHandle: {
    cursor: "grab",
    color: "#999",
    marginRight: 8,
    "&:active": {
      cursor: "grabbing",
    },
  },
  sortIcon: {
    fontSize: 16,
    marginLeft: 4,
  },
  tableToolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    gap: theme.spacing(1),
    flexWrap: "wrap",
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(1),
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
  loadingRow: {
    textAlign: "center",
    padding: theme.spacing(2),
  },
  empresasCell: {
    maxWidth: 300,
  },
  chip: {
    margin: theme.spacing(0.25),
    fontSize: "0.75rem",
  },
}));

// Definição das colunas disponíveis
const DEFAULT_COLUMNS = [
  { id: 'id', label: 'ID', visible: true, filterable: true, sortable: true, width: 80 },
  { id: 'nome', label: 'Nome', visible: true, filterable: true, sortable: true, width: 250 },
  { id: 'cpf', label: 'CPF', visible: true, filterable: true, sortable: true, width: 150 },
  { id: 'email', label: 'E-mail', visible: true, filterable: true, sortable: true, width: 200 },
  { id: 'celular', label: 'Celular', visible: true, filterable: true, sortable: true, width: 150 },
  { id: 'telefone', label: 'Telefone', visible: false, filterable: true, sortable: true, width: 150 },
  { id: 'estadoCivil', label: 'Estado Civil', visible: false, filterable: true, sortable: true, width: 150 },
  { id: 'profissao', label: 'Profissão', visible: false, filterable: true, sortable: true, width: 180 },
  { id: 'cidade', label: 'Cidade', visible: false, filterable: true, sortable: true, width: 150 },
  { id: 'estado', label: 'UF', visible: false, filterable: true, sortable: true, width: 80 },
  { id: 'empresas', label: 'Empresas Vinculadas', visible: true, filterable: false, sortable: false, width: 300 },
  { id: 'totalEmpresas', label: 'Qtd Empresas', visible: true, filterable: true, sortable: true, width: 120 },
  { id: 'ativo', label: 'Ativo', visible: true, filterable: true, sortable: true, width: 100 },
  { id: 'actions', label: 'Ações', visible: true, filterable: false, sortable: false, width: 150 },
];

const estadosBrasileiros = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const Socios = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const tableContainerRef = React.useRef(null);

  // Estados de dados
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Estados de filtros globais
  const [searchParam, setSearchParam] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [ativoFilter, setAtivoFilter] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  // Estados da tabela avançada
  const [tableColumns, setTableColumns] = useState(DEFAULT_COLUMNS);
  const [columnFilters, setColumnFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [columnVisibilityMenuAnchor, setColumnVisibilityMenuAnchor] = useState(null);
  const [filterPopoverAnchor, setFilterPopoverAnchor] = useState(null);
  const [activeFilterColumn, setActiveFilterColumn] = useState(null);
  const [filterSearchText, setFilterSearchText] = useState("");

  // Estados de UI
  const [deletingSocio, setDeletingSocio] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Carregar preferências do usuário
  useEffect(() => {
    loadUserPreferences();
  }, [user]);

  // Debounce para o campo de pesquisa
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParam(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    resetAndFetch();
  }, [searchParam, estadoFilter, ativoFilter]);

  // Scroll infinito
  useEffect(() => {
    const handleScroll = (e) => {
      const target = e.target;
      if (!target || target.scrollTop === undefined) return;
      
      const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
      
      if (bottom && hasMore && !loading && !loadingMore) {
        loadMoreSocios();
      }
    };

    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [hasMore, loading, loadingMore, pageNumber]);

  // Carregar primeira página automaticamente
  useEffect(() => {
    if (socios.length === 0 && !loading) {
      fetchSocios(1, true);
    }
  }, []);

  const loadUserPreferences = () => {
    try {
      const savedPrefs = localStorage.getItem(`socios_table_prefs_${user.id}`);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.columns) setTableColumns(prefs.columns);
        if (prefs.columnFilters) setColumnFilters(prefs.columnFilters);
        if (prefs.sortConfig) setSortConfig(prefs.sortConfig);
        if (prefs.showFilters !== undefined) setShowFilters(prefs.showFilters);
      }
    } catch (err) {
      console.error("Erro ao carregar preferências:", err);
    }
  };

  const saveUserPreferences = useCallback(() => {
    try {
      const prefs = {
        columns: tableColumns,
        columnFilters,
        sortConfig,
        showFilters,
      };
      localStorage.setItem(`socios_table_prefs_${user.id}`, JSON.stringify(prefs));
      toast.success("Preferências salvas!");
    } catch (err) {
      console.error("Erro ao salvar preferências:", err);
      toast.error("Erro ao salvar preferências");
    }
  }, [tableColumns, columnFilters, sortConfig, showFilters, user]);

  const handleResetTablePreferences = () => {
    setTableColumns(DEFAULT_COLUMNS);
    setColumnFilters({});
    setSortConfig({ key: 'id', direction: 'desc' });
    setShowFilters(true);
    localStorage.removeItem(`socios_table_prefs_${user.id}`);
    toast.success("Preferências resetadas!");
  };

  const resetAndFetch = () => {
    setSocios([]);
    setPageNumber(1);
    setHasMore(true);
    fetchSocios(1, true);
  };

  const fetchSocios = async (page = 1, reset = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const params = {
        pageNumber: page,
        limit: 100,
      };

      if (searchParam) params.searchParam = searchParam;
      if (estadoFilter) params.estado = estadoFilter;
      if (ativoFilter !== "") params.ativo = ativoFilter;

      const { data } = await api.get("/socios", { params });

      if (reset) {
        setSocios(data.socios || []);
      } else {
        setSocios((prev) => [...prev, ...(data.socios || [])]);
      }

      setHasMore(data.hasMore || false);
      setTotalCount(data.count || data.socios?.length || 0);
      setPageNumber(page);
    } catch (err) {
      console.error("Erro ao buscar sócios:", err);
      toast.error("Erro ao carregar sócios");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreSocios = () => {
    if (!loading && !loadingMore && hasMore) {
      setLoadingMore(true);
      fetchSocios(pageNumber + 1, false).finally(() => setLoadingMore(false));
    }
  };

  const handleAddSocio = () => {
    history.push("/socios/cadastro");
  };

  const handleEditSocio = (socioId) => {
    history.push(`/socios/cadastro/${socioId}`);
  };

  const handleDeleteSocio = (socio) => {
    setDeletingSocio(socio);
    setConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/socios/${deletingSocio.id}`);
      toast.success("Sócio excluído com sucesso!");
      setConfirmModalOpen(false);
      setDeletingSocio(null);
      resetAndFetch();
    } catch (err) {
      console.error("Erro ao excluir sócio:", err);
      toast.error(err.response?.data?.error || "Erro ao excluir sócio");
      setConfirmModalOpen(false);
      setDeletingSocio(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmModalOpen(false);
    setDeletingSocio(null);
  };

  // ========== FUNÇÕES DA TABELA AVANÇADA ==========

  const handleColumnDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(tableColumns);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    
    setTableColumns(items);
  };

  const toggleColumnVisibility = (columnId) => {
    setTableColumns(prev => 
      prev.map(col => 
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const handleColumnFilter = (columnId, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnId]: value
    }));
  };

  const handleOpenFilterMenu = (event, columnId) => {
    event.stopPropagation();
    setFilterPopoverAnchor(event.currentTarget);
    setActiveFilterColumn(columnId);
  };

  const handleCloseFilterMenu = () => {
    setFilterPopoverAnchor(null);
    setActiveFilterColumn(null);
    setFilterSearchText("");
  };

  const getUniqueColumnValues = (columnId, searchText = '') => {
    const values = socios.map(socio => {
      const value = getCellValue(socio, columnId);
      return value ? String(value).trim() : '';
    }).filter(v => v !== '' && v !== '-');
    
    const uniqueValues = [...new Set(values)];
    
    const filtered = searchText.trim() !== '' 
      ? uniqueValues.filter(v => v.toLowerCase().includes(searchText.toLowerCase()))
      : uniqueValues;
    
    return filtered.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  };

  const toggleFilterValue = (columnId, value) => {
    const currentFilters = columnFilters[columnId] || [];
    const isArray = Array.isArray(currentFilters);
    const filterArray = isArray ? currentFilters : [];
    
    if (filterArray.includes(value)) {
      const newFilters = filterArray.filter(v => v !== value);
      handleColumnFilter(columnId, newFilters.length > 0 ? newFilters : []);
    } else {
      handleColumnFilter(columnId, [...filterArray, value]);
    }
  };

  const clearColumnFilter = (columnId) => {
    handleColumnFilter(columnId, []);
  };

  const handleSort = (columnId) => {
    setSortConfig(prev => {
      if (prev.key === columnId) {
        if (prev.direction === 'asc') {
          return { key: columnId, direction: 'desc' };
        } else if (prev.direction === 'desc') {
          return { key: null, direction: 'asc' };
        }
      }
      return { key: columnId, direction: 'asc' };
    });
  };

  const formatCPF = (cpf) => {
    if (!cpf) return "-";
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatTelefone = (tel) => {
    if (!tel) return "-";
    const cleaned = tel.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return tel;
  };

  const formatEstadoCivil = (estado) => {
    const estados = {
      solteiro: "Solteiro(a)",
      casado: "Casado(a)",
      divorciado: "Divorciado(a)",
      viuvo: "Viúvo(a)",
      uniao_estavel: "União Estável"
    };
    return estados[estado] || estado || "-";
  };

  // Obter valor da célula
  const getCellValue = (socio, columnId) => {
    switch (columnId) {
      case 'id':
        return socio.id;
      case 'nome':
        return socio.nome || '-';
      case 'cpf':
        return formatCPF(socio.cpf);
      case 'email':
        return socio.email || '-';
      case 'celular':
        return formatTelefone(socio.celular);
      case 'telefone':
        return formatTelefone(socio.telefone);
      case 'estadoCivil':
        return formatEstadoCivil(socio.estadoCivil);
      case 'profissao':
        return socio.profissao || '-';
      case 'cidade':
        return socio.cidade || '-';
      case 'estado':
        return socio.estado || '-';
      case 'totalEmpresas':
        return socio.clientes?.length || 0;
      case 'ativo':
        return socio.ativo ? 'Sim' : 'Não';
      default:
        return '-';
    }
  };

  // Renderizar conteúdo da célula
  const renderCellContent = (socio, columnId) => {
    const value = getCellValue(socio, columnId);
    
    switch (columnId) {
      case 'empresas':
        return (
          <Box className={classes.empresasCell}>
            {socio.clientes && socio.clientes.length > 0 ? (
              <Box display="flex" flexWrap="wrap" gap={0.5}>
                {socio.clientes.map((cliente) => (
                  <Tooltip 
                    key={cliente.id}
                    title={`${cliente.nomeFantasia || cliente.razaoSocial || cliente.nome} - ${cliente.ClienteSocio?.percentual || 0}%`}
                  >
                    <Chip
                      icon={<BusinessIcon style={{ fontSize: 14 }} />}
                      label={`${cliente.nomeFantasia || cliente.razaoSocial || cliente.nome} (${cliente.ClienteSocio?.percentual || 0}%)`}
                      size="small"
                      className={classes.chip}
                      onClick={(e) => {
                        e.stopPropagation();
                        history.push(`/clientes/cadastro/${cliente.id}`);
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                  </Tooltip>
                ))}
              </Box>
            ) : (
              <span style={{ color: "#999", fontSize: "0.875rem" }}>Sem vínculos</span>
            )}
          </Box>
        );
      case 'totalEmpresas':
        return (
          <Chip
            label={value}
            size="small"
            color={value > 0 ? "primary" : "default"}
          />
        );
      case 'ativo':
        return (
          <Chip
            label={value}
            size="small"
            color={value === 'Sim' ? "primary" : "default"}
          />
        );
      case 'actions':
        return (
          <Box className={classes.actionButtons}>
            <Tooltip title="Editar">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditSocio(socio.id);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir">
              <IconButton
                size="small"
                color="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSocio(socio);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      default:
        return <span title={value}>{value}</span>;
    }
  };

  // Filtrar sócios
  const filteredSocios = socios.filter(socio => {
    // Aplicar filtros por coluna
    for (const [columnId, filterValues] of Object.entries(columnFilters)) {
      if (!filterValues || !Array.isArray(filterValues) || filterValues.length === 0) continue;
      
      const cellValue = getCellValue(socio, columnId);
      if (!filterValues.includes(String(cellValue).trim())) {
        return false;
      }
    }
    
    return true;
  });

  // Ordenar sócios
  const sortedSocios = React.useMemo(() => {
    if (!sortConfig.key) return filteredSocios;

    return [...filteredSocios].sort((a, b) => {
      const aValue = getCellValue(a, sortConfig.key);
      const bValue = getCellValue(b, sortConfig.key);

      // Tratar valores nulos/undefined
      if (aValue === '-' || aValue === null || aValue === undefined || aValue === '') return 1;
      if (bValue === '-' || bValue === null || bValue === undefined || bValue === '') return -1;

      // Ordenação numérica
      const aNum = parseFloat(String(aValue).replace(/[^\d.-]/g, ''));
      const bNum = parseFloat(String(bValue).replace(/[^\d.-]/g, ''));
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // Ordenação alfabética
      const comparison = String(aValue).localeCompare(String(bValue), 'pt-BR');
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredSocios, sortConfig]);

  return (
    <MainContainer>
      <Box className={classes.mainContainer}>
        <Box className={classes.header}>
          <Typography variant="h5" style={{ fontWeight: 600 }}>
            Sócios ({totalCount})
          </Typography>
          <Button
            variant="contained"
            className={classes.addButton}
            startIcon={<AddIcon />}
            onClick={handleAddSocio}
          >
            Novo Sócio
          </Button>
        </Box>

        <Paper className={classes.tablePaper} variant="outlined">
          {/* Filtros Globais */}
          {showFilters && (
            <Box className={classes.filtersContainer}>
              <Box className={classes.filterRow}>
                <TextField
                  className={classes.searchField}
                  placeholder="Buscar por nome, CPF, email..."
                  variant="outlined"
                  size="small"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchInput && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSearchInput("");
                            setSearchParam("");
                          }}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControl className={classes.filterField} variant="outlined" size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={ativoFilter}
                    onChange={(e) => setAtivoFilter(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value=""><em>Todos</em></MenuItem>
                    <MenuItem value="true">Ativo</MenuItem>
                    <MenuItem value="false">Inativo</MenuItem>
                  </Select>
                </FormControl>

                <FormControl className={classes.filterField} variant="outlined" size="small">
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={estadoFilter}
                    onChange={(e) => setEstadoFilter(e.target.value)}
                    label="Estado"
                  >
                    <MenuItem value=""><em>Todos</em></MenuItem>
                    {estadosBrasileiros.map((estado) => (
                      <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          )}

          {/* Toolbar da Tabela */}
          <Box className={classes.tableToolbar}>
            <Box>
              <Typography variant="caption" color="textSecondary">
                {loading && socios.length === 0 ? "Buscando sócios..." : `Exibindo ${sortedSocios.length} de ${totalCount} sócios`}
                {searchParam && ` (filtrado por: "${searchParam}")`}
              </Typography>
            </Box>

            <Box className={classes.actionButtons}>
              <Tooltip title={showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}>
                <Button
                  size="small"
                  startIcon={<FilterListIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  variant={showFilters ? "contained" : "outlined"}
                  color="primary"
                >
                  Filtros
                </Button>
              </Tooltip>

              <Tooltip title="Gerenciar Colunas">
                <Button
                  size="small"
                  startIcon={<ViewColumnIcon />}
                  onClick={(e) => setColumnVisibilityMenuAnchor(e.currentTarget)}
                  variant="outlined"
                >
                  Colunas
                </Button>
              </Tooltip>

              <Tooltip title="Atualizar">
                <Button
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={resetAndFetch}
                  variant="outlined"
                  disabled={loading}
                >
                  Atualizar
                </Button>
              </Tooltip>

              <Tooltip title="Salvar Preferências">
                <Button
                  size="small"
                  onClick={saveUserPreferences}
                  variant="outlined"
                  color="primary"
                >
                  Salvar
                </Button>
              </Tooltip>

              <Tooltip title="Resetar Preferências">
                <Button
                  size="small"
                  onClick={handleResetTablePreferences}
                  variant="outlined"
                  color="secondary"
                >
                  Resetar
                </Button>
              </Tooltip>
            </Box>
          </Box>

          {/* Menu de visibilidade de colunas */}
          <Menu
            anchorEl={columnVisibilityMenuAnchor}
            open={Boolean(columnVisibilityMenuAnchor)}
            onClose={() => setColumnVisibilityMenuAnchor(null)}
          >
            {tableColumns.map((column) => (
              <MenuItem key={column.id} onClick={() => toggleColumnVisibility(column.id)}>
                <Checkbox
                  checked={column.visible}
                  color="primary"
                />
                <ListItemText primary={column.label} />
              </MenuItem>
            ))}
          </Menu>

          {/* Menu de filtro */}
          <Popover
            open={Boolean(filterPopoverAnchor)}
            anchorEl={filterPopoverAnchor}
            onClose={handleCloseFilterMenu}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            PaperProps={{
              style: {
                maxHeight: 400,
                width: 300,
                padding: 16,
              }
            }}
          >
            {activeFilterColumn && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle2" style={{ fontWeight: 600 }}>
                    Filtrar {tableColumns.find(c => c.id === activeFilterColumn)?.label}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => clearColumnFilter(activeFilterColumn)}
                    color="secondary"
                    style={{ minWidth: 'auto', padding: '4px 8px' }}
                  >
                    Limpar
                  </Button>
                </Box>
                
                <Divider style={{ marginBottom: 12 }} />
                
                <Box mb={2}>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    placeholder="Buscar..."
                    value={filterSearchText}
                    onChange={(e) => setFilterSearchText(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    style={{ marginBottom: 12 }}
                  />
                  <Typography variant="caption" color="textSecondary" gutterBottom>
                    {(() => {
                      const selectedCount = (columnFilters[activeFilterColumn] || []).length;
                      const filteredValues = getUniqueColumnValues(activeFilterColumn, filterSearchText);
                      const totalCount = getUniqueColumnValues(activeFilterColumn).length;
                      return selectedCount > 0 
                        ? `${selectedCount} selecionados | ${filteredValues.length} de ${totalCount} exibidos`
                        : `${filteredValues.length} de ${totalCount} opções disponíveis`;
                    })()}
                  </Typography>
                </Box>

                <List dense style={{ maxHeight: 300, overflow: 'auto' }}>
                  {getUniqueColumnValues(activeFilterColumn, filterSearchText).map((value, index) => {
                    const isChecked = (columnFilters[activeFilterColumn] || []).includes(value);
                    return (
                      <ListItem
                        key={index}
                        button
                        onClick={() => toggleFilterValue(activeFilterColumn, value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          marginBottom: 4,
                          backgroundColor: isChecked ? '#e3f2fd' : 'transparent',
                        }}
                      >
                        <Checkbox
                          edge="start"
                          checked={isChecked}
                          tabIndex={-1}
                          disableRipple
                          color="primary"
                          size="small"
                        />
                        <ListItemText 
                          primary={value} 
                          primaryTypographyProps={{ 
                            variant: 'body2',
                            style: { fontWeight: isChecked ? 600 : 400 }
                          }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            )}
          </Popover>

          {/* Tabela com Drag and Drop */}
          <TableContainer 
            ref={tableContainerRef}
            style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}
          >
            <DragDropContext onDragEnd={handleColumnDragEnd}>
              <Table stickyHeader>
                <Droppable droppableId="table-columns" direction="horizontal">
                  {(provided) => (
                    <TableHead 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={classes.tableHeader}
                    >
                      <TableRow>
                        {tableColumns.filter(col => col.visible).map((column, index) => (
                          <Draggable 
                            key={column.id} 
                            draggableId={column.id} 
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <TableCell
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={classes.tableHeaderCell}
                                style={{
                                  ...provided.draggableProps.style,
                                  backgroundColor: snapshot.isDragging ? '#e3f2fd' : '#f5f5f5',
                                  width: column.width,
                                  minWidth: column.width,
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <span 
                                    {...provided.dragHandleProps}
                                    className={classes.dragHandle}
                                  >
                                    <DragIndicatorIcon fontSize="small" />
                                  </span>
                                  
                                  <div 
                                    style={{ flex: 1, cursor: column.sortable ? 'pointer' : 'default' }}
                                    onClick={() => column.sortable && handleSort(column.id)}
                                  >
                                    <strong>{column.label}</strong>
                                    {column.sortable && sortConfig.key === column.id && (
                                      sortConfig.direction === 'asc' 
                                        ? <ArrowUpward className={classes.sortIcon} />
                                        : <ArrowDownward className={classes.sortIcon} />
                                    )}
                                  </div>

                                  {column.filterable && (
                                    <Tooltip title="Filtrar coluna">
                                      <IconButton
                                        size="small"
                                        onClick={(e) => handleOpenFilterMenu(e, column.id)}
                                        style={{
                                          padding: 4,
                                          color: columnFilters[column.id]?.length > 0 ? '#1976d2' : '#757575'
                                        }}
                                      >
                                        <FilterListIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </div>
                              </TableCell>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </TableRow>
                    </TableHead>
                  )}
                </Droppable>

                <TableBody>
                  {loading && sortedSocios.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={tableColumns.filter(c => c.visible).length} align="center">
                        <Box className={classes.loadingRow}>
                          <CircularProgress size={24} />
                          <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
                            Carregando sócios...
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : sortedSocios.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={tableColumns.filter(c => c.visible).length} align="center">
                        <Box className={classes.emptyState}>
                          <PersonIcon style={{ fontSize: 48, opacity: 0.3, marginBottom: 16 }} />
                          <Typography variant="body1" color="textSecondary">
                            Nenhum sócio encontrado
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {Object.values(columnFilters).some(v => v?.length > 0)
                              ? "Ajuste os filtros ou adicione novos sócios"
                              : "Clique em 'Novo Sócio' para começar"}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedSocios.map((socio) => (
                      <TableRow 
                        key={socio.id} 
                        hover
                        onClick={() => handleEditSocio(socio.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        {tableColumns.filter(col => col.visible).map((column) => (
                          <TableCell 
                            key={`${socio.id}-${column.id}`}
                            style={{ 
                              width: column.width,
                              minWidth: column.width,
                              maxWidth: column.id === 'empresas' ? column.width : undefined,
                              overflow: column.id === 'empresas' ? 'visible' : 'hidden',
                              textOverflow: column.id === 'empresas' ? 'clip' : 'ellipsis',
                              whiteSpace: column.id === 'empresas' ? 'normal' : 'nowrap',
                            }}
                          >
                            {renderCellContent(socio, column.id)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </DragDropContext>
          </TableContainer>

          {/* Indicador de carregamento ao fazer scroll */}
          {loadingMore && (
            <Box className={classes.loadingRow}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
                Carregando mais sócios...
              </Typography>
            </Box>
          )}

          {/* Mensagem de fim de lista */}
          {!hasMore && socios.length > 0 && (
            <Box style={{ textAlign: "center", padding: 16 }}>
              <Typography variant="caption" color="textSecondary">
                Todos os sócios foram carregados
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Modal de Confirmação */}
      <ConfirmationModal
        title="Excluir Sócio"
        open={confirmModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      >
        Tem certeza que deseja excluir o sócio <strong>{deletingSocio?.nome}</strong>? Esta ação não pode ser desfeita.
      </ConfirmationModal>
    </MainContainer>
  );
};

export default Socios;
