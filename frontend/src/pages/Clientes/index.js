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
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
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
  ArrowUpward,
  ArrowDownward,
  Clear as ClearIcon,
  Save as SaveIcon,
  GetApp as GetAppIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
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
}));

// Definição das colunas disponíveis
const DEFAULT_COLUMNS = [
  { id: 'id', label: 'ID', visible: true, filterable: true, sortable: true, width: 80 },
  { id: 'tipoCliente', label: 'Tipo', visible: true, filterable: true, sortable: true, width: 100 },
  { id: 'codigoErp', label: 'Código ERP', visible: true, filterable: true, sortable: true, width: 120 },
  { id: 'documento', label: 'CPF/CNPJ', visible: true, filterable: true, sortable: true, width: 150 },
  { id: 'nome', label: 'Nome/Razão Social', visible: true, filterable: true, sortable: true, width: 250 },
  { id: 'nomeFantasia', label: 'Nome Fantasia', visible: true, filterable: true, sortable: true, width: 200 },
  { id: 'apelido', label: 'Apelido', visible: false, filterable: true, sortable: true, width: 150 },
  { id: 'email', label: 'E-mail', visible: true, filterable: true, sortable: true, width: 200 },
  { id: 'telefone', label: 'Telefone', visible: false, filterable: true, sortable: true, width: 130 },
  { id: 'celular', label: 'Celular', visible: true, filterable: true, sortable: true, width: 130 },
  { id: 'cidade', label: 'Cidade', visible: true, filterable: true, sortable: true, width: 150 },
  { id: 'estado', label: 'UF', visible: true, filterable: true, sortable: true, width: 80 },
  { id: 'honorario', label: 'Honorário', visible: false, filterable: false, sortable: true, width: 120 },
  { id: 'ativo', label: 'Ativo', visible: true, filterable: true, sortable: true, width: 100 },
  // Parâmetros
  { id: 'statusCliente', label: 'Status Cliente', visible: false, filterable: true, sortable: true, width: 150 },
  { id: 'tierCliente', label: 'Tier', visible: false, filterable: true, sortable: true, width: 120 },
  { id: 'clusterCliente', label: 'Cluster', visible: false, filterable: true, sortable: true, width: 150 },
  { id: 'tipoClienteParametro', label: 'Tipo Cliente (Param)', visible: false, filterable: true, sortable: true, width: 150 },
  { id: 'categoriaCliente', label: 'Categoria', visible: false, filterable: true, sortable: true, width: 150 },
  { id: 'periodicidadeCliente', label: 'Periodicidade', visible: false, filterable: true, sortable: true, width: 150 },
  { id: 'statusComplementar', label: 'Status Complementar', visible: false, filterable: true, sortable: true, width: 170 },
  { id: 'sedeCliente', label: 'Sede/Escritório', visible: false, filterable: true, sortable: true, width: 180 },
  { id: 'localizacaoCliente', label: 'Localização', visible: false, filterable: true, sortable: true, width: 150 },
  { id: 'tags', label: 'Tags', visible: false, filterable: true, sortable: true, width: 150 },
  { id: 'regimeTributarioFederal', label: 'Regime Federal', visible: false, filterable: true, sortable: true, width: 150 },
  { id: 'regimeTributarioEstadual', label: 'Regime Estadual', visible: false, filterable: true, sortable: true, width: 150 },
  { id: 'regimeTributarioMunicipal', label: 'Regime Municipal', visible: false, filterable: true, sortable: true, width: 150 },
  { id: 'porteFederal', label: 'Porte Federal', visible: false, filterable: true, sortable: true, width: 130 },
  { id: 'porteEstadual', label: 'Porte Estadual', visible: false, filterable: true, sortable: true, width: 130 },
  { id: 'porteMunicipal', label: 'Porte Municipal', visible: false, filterable: true, sortable: true, width: 130 },
  { id: 'volumeFiscal', label: 'Vol. Fiscal', visible: false, filterable: true, sortable: true, width: 120 },
  { id: 'volumeContabil', label: 'Vol. Contábil', visible: false, filterable: true, sortable: true, width: 120 },
  { id: 'volumeDP', label: 'Vol. DP', visible: false, filterable: true, sortable: true, width: 100 },
  { id: 'volumeBPO', label: 'Vol. BPO', visible: false, filterable: true, sortable: true, width: 110 },
  { id: 'modalidadeFechamentoContabil', label: 'Modal. Fech. Contábil', visible: false, filterable: true, sortable: true, width: 180 },
  { id: 'modalidadeFechamentoFiscal', label: 'Modal. Fech. Fiscal', visible: false, filterable: true, sortable: true, width: 180 },
  { id: 'modalidadeFechamentoDP', label: 'Modal. Fech. DP', visible: false, filterable: true, sortable: true, width: 180 },
  { id: 'modalFechBPO', label: 'Modal. Fech. BPO', visible: false, filterable: true, sortable: true, width: 180 },
  { id: 'distribuicaoLucros', label: 'Distribuição Lucros', visible: false, filterable: true, sortable: true, width: 170 },
  { id: 'adiantamentoFolha', label: 'Adiant. Folha', visible: false, filterable: true, sortable: true, width: 150 },
  { id: 'grupoCliente', label: 'Grupo Cliente', visible: false, filterable: true, sortable: true, width: 150 },
  { id: 'actions', label: 'Ações', visible: true, filterable: false, sortable: false, width: 150 },
];

const estadosBrasileiros = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const Clientes = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const tableContainerRef = React.useRef(null);

  // Estados de dados
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Estados de filtros globais
  const [searchParam, setSearchParam] = useState("");
  const [searchInput, setSearchInput] = useState(""); // Input controlado separado
  const [tipoClienteFilter, setTipoClienteFilter] = useState("");
  const [ativoFilter, setAtivoFilter] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
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
  const [deletingCliente, setDeletingCliente] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Estados de gerenciamento de preferências/perfis
  const [viewProfiles, setViewProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [saveProfileDialogOpen, setSaveProfileDialogOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [deleteProfileDialogOpen, setDeleteProfileDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);

  // Carregar preferências do usuário ao montar
  useEffect(() => {
    loadViewProfiles();
  }, [user]);

  // Carregar perfis de visualização da API
  const loadViewProfiles = async () => {
    try {
      setLoadingProfiles(true);
      const { data } = await api.get("/clientes-view-preferences");
      setViewProfiles(data);
      
      // Buscar perfil padrão
      const defaultProfile = data.find(p => p.isDefault);
      if (defaultProfile) {
        applyProfile(defaultProfile, false);
      } else {
        // Carregar preferências do localStorage como fallback
        loadUserPreferencesLocal();
      }
    } catch (err) {
      console.error("Erro ao carregar perfis:", err);
      // Fallback para localStorage
      loadUserPreferencesLocal();
    } finally {
      setLoadingProfiles(false);
    }
  };

  const loadUserPreferencesLocal = () => {
    try {
      const savedPrefs = localStorage.getItem(`clientes_table_prefs_${user.id}`);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.columns) setTableColumns(prefs.columns);
        if (prefs.columnFilters) setColumnFilters(prefs.columnFilters);
        if (prefs.sortConfig) setSortConfig(prefs.sortConfig);
        if (prefs.showFilters !== undefined) setShowFilters(prefs.showFilters);
      }
    } catch (err) {
      console.error("Erro ao carregar preferências locais:", err);
    }
  };

  // Aplicar um perfil de visualização
  const applyProfile = (profile, showToast = true) => {
    try {
      setActiveProfile(profile);
      if (profile.columns) setTableColumns(profile.columns);
      if (profile.filters) setColumnFilters(profile.filters);
      if (profile.sortConfig) setSortConfig(profile.sortConfig);
      
      if (showToast) {
        toast.success(`Perfil "${profile.name}" aplicado!`);
      }
    } catch (err) {
      console.error("Erro ao aplicar perfil:", err);
      toast.error("Erro ao aplicar perfil");
    }
  };

  // Salvar novo perfil ou atualizar existente
  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      toast.error("Digite um nome para o perfil");
      return;
    }

    try {
      const profileData = {
        name: profileName.trim(),
        columns: tableColumns,
        filters: columnFilters,
        sortConfig: sortConfig,
        isDefault: setAsDefault,
      };

      if (activeProfile && activeProfile.id) {
        // Atualizar existente
        const { data } = await api.put(`/clientes-view-preferences/${activeProfile.id}`, profileData);
        toast.success("Perfil atualizado com sucesso!");
        setActiveProfile(data);
      } else {
        // Criar novo
        const { data } = await api.post("/clientes-view-preferences", profileData);
        toast.success("Perfil salvo com sucesso!");
        setActiveProfile(data);
      }

      await loadViewProfiles();
      handleCloseSaveDialog();
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Erro ao salvar perfil";
      toast.error(errorMsg);
      console.error(err);
    }
  };

  // Definir um perfil como padrão
  const handleSetAsDefault = async (profile) => {
    try {
      await api.patch(`/clientes-view-preferences/${profile.id}/set-default`);
      toast.success(`"${profile.name}" definido como padrão!`);
      await loadViewProfiles();
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Erro ao definir como padrão";
      toast.error(errorMsg);
    }
  };

  // Deletar perfil
  const handleDeleteProfile = async () => {
    if (!profileToDelete) return;

    try {
      await api.delete(`/clientes-view-preferences/${profileToDelete.id}`);
      toast.success(`Perfil "${profileToDelete.name}" excluído!`);
      
      if (activeProfile?.id === profileToDelete.id) {
        setActiveProfile(null);
        setTableColumns(DEFAULT_COLUMNS);
        setColumnFilters({});
        setSortConfig({ key: 'id', direction: 'desc' });
      }
      
      await loadViewProfiles();
      handleCloseDeleteDialog();
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Erro ao excluir perfil";
      toast.error(errorMsg);
    }
  };

  const handleOpenSaveDialog = (isUpdate = false) => {
    if (isUpdate && activeProfile) {
      setProfileName(activeProfile.name);
      setSetAsDefault(activeProfile.isDefault || false);
    } else {
      setProfileName("");
      setSetAsDefault(false);
    }
    setSaveProfileDialogOpen(true);
    setProfileMenuAnchor(null);
  };

  const handleCloseSaveDialog = () => {
    setSaveProfileDialogOpen(false);
    setProfileName("");
    setSetAsDefault(false);
  };

  const handleOpenDeleteDialog = (profile) => {
    setProfileToDelete(profile);
    setDeleteProfileDialogOpen(true);
    setProfileMenuAnchor(null);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteProfileDialogOpen(false);
    setProfileToDelete(null);
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParam(searchInput);
    }, 500); // Aguarda 500ms após o usuário parar de digitar

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    resetAndFetch();
  }, [searchParam, tipoClienteFilter, ativoFilter, estadoFilter]);

  // Scroll infinito - carregar automaticamente ao rolar
  useEffect(() => {
    const handleScroll = (e) => {
      const target = e.target;
      if (!target || target.scrollTop === undefined) return;
      
      const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
      
      if (bottom && hasMore && !loading && !loadingMore) {
        loadMoreClientes();
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
    if (clientes.length === 0 && !loading) {
      fetchClientes(1, true);
    }
  }, []);

  const loadUserPreferences = () => {
    try {
      const savedPrefs = localStorage.getItem(`clientes_table_prefs_${user.id}`);
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
      localStorage.setItem(`clientes_table_prefs_${user.id}`, JSON.stringify(prefs));
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
    localStorage.removeItem(`clientes_table_prefs_${user.id}`);
    toast.success("Preferências resetadas!");
  };

  const resetAndFetch = () => {
    setClientes([]);
    setPageNumber(1);
    setHasMore(true);
    fetchClientes(1, true);
  };

  const fetchClientes = async (page = 1, reset = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const params = {
        page,
        limit: 100,
      };

      if (searchParam) params.searchParam = searchParam;
      if (tipoClienteFilter) params.tipoCliente = tipoClienteFilter;
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
      setPageNumber(page);
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreClientes = () => {
    if (!loading && !loadingMore && hasMore) {
      setLoadingMore(true);
      fetchClientes(pageNumber + 1, false).finally(() => setLoadingMore(false));
    }
  };

  const handleAddCliente = () => {
    history.push("/clientes/cadastro");
  };

  const handleEditCliente = (clienteId) => {
    history.push(`/clientes/cadastro/${clienteId}`);
  };

  const handleDeleteCliente = (cliente) => {
    setDeletingCliente(cliente);
    setConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/clientes/${deletingCliente.id}`);
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
    const values = clientes.map(cliente => {
      const value = getCellValue(cliente, columnId);
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

  // Obter valor da célula
  const getCellValue = (cliente, columnId) => {
    switch (columnId) {
      case 'id':
        return cliente.id;
      case 'tipoCliente':
        return cliente.tipoCliente === 'fisica' || cliente.tipo === 'PF' ? 'PF' : 'PJ';
      case 'codigoErp':
        return cliente.codigoErp || '-';
      case 'documento':
        if (cliente.tipoCliente === 'fisica' || cliente.tipo === 'PF') {
          return cliente.cpf || cliente.cpfCnpj || '-';
        } else {
          return cliente.cnpj || cliente.cpfCnpj || '-';
        }
      case 'nome':
        if (cliente.tipoCliente === 'fisica' || cliente.tipo === 'PF') {
          return cliente.nome || '-';
        } else {
          return cliente.razaoSocial || cliente.nome || '-';
        }
      case 'nomeFantasia':
        return cliente.nomeFantasia || '-';
      case 'apelido':
        return cliente.apelido || '-';
      case 'email':
        return cliente.email || '-';
      case 'telefone':
        return cliente.telefone || '-';
      case 'celular':
        return cliente.celular || '-';
      case 'cidade':
        return cliente.cidade || '-';
      case 'estado':
        return cliente.estado || '-';
      case 'honorario':
        return cliente.honorario ? `R$ ${parseFloat(cliente.honorario).toFixed(2)}` : '-';
      case 'ativo':
        return cliente.ativo ? 'Sim' : 'Não';
      case 'statusCliente':
        return cliente.statusCliente?.nome || '-';
      case 'tierCliente':
        return cliente.tierCliente?.nome || '-';
      case 'clusterCliente':
        return cliente.clusterCliente?.nome || '-';
      case 'tipoClienteParametro':
        return cliente.tipoClienteParametro?.nome || '-';
      case 'categoriaCliente':
        return cliente.categoriaCliente?.nome || '-';
      case 'periodicidadeCliente':
        return cliente.periodicidadeCliente?.nome || '-';
      case 'statusComplementar':
        return cliente.statusComplementar?.nome || '-';
      case 'sedeCliente':
        return cliente.sedeCliente?.nome || cliente.escritorioGestor?.nome || '-';
      case 'localizacaoCliente':
        return cliente.localizacaoCliente?.nome || '-';
      case 'tags':
        return cliente.tags?.nome || '-';
      case 'regimeTributarioFederal':
        return cliente.regimeTributarioFederal?.nome || '-';
      case 'regimeTributarioEstadual':
        return cliente.regimeTributarioEstadual?.nome || '-';
      case 'regimeTributarioMunicipal':
        return cliente.regimeTributarioMunicipal?.nome || '-';
      case 'porteFederal':
        return cliente.porteFederal?.nome || '-';
      case 'porteEstadual':
        return cliente.porteEstadual?.nome || '-';
      case 'porteMunicipal':
        return cliente.porteMunicipal?.nome || '-';
      case 'volumeFiscal':
        return cliente.volumeFiscal?.nome || '-';
      case 'volumeContabil':
        return cliente.volumeContabil?.nome || '-';
      case 'volumeDP':
        return cliente.volumeDP?.nome || '-';
      case 'volumeBPO':
        return cliente.volumeBPO?.nome || '-';
      case 'modalidadeFechamentoContabil':
        return cliente.modalidadeFechamentoContabil?.nome || '-';
      case 'modalidadeFechamentoFiscal':
        return cliente.modalidadeFechamentoFiscal?.nome || '-';
      case 'modalidadeFechamentoDP':
        return cliente.modalidadeFechamentoDP?.nome || '-';
      case 'modalFechBPO':
        return cliente.modalFechBPO?.nome || '-';
      case 'distribuicaoLucros':
        return cliente.distribuicaoLucros?.nome || '-';
      case 'adiantamentoFolha':
        return cliente.adiantamentoFolha?.nome || '-';
      case 'grupoCliente':
        return cliente.grupoCliente?.nome || '-';
      default:
        return '-';
    }
  };

  // Renderizar conteúdo da célula
  const renderCellContent = (cliente, columnId) => {
    const value = getCellValue(cliente, columnId);
    
    switch (columnId) {
      case 'tipoCliente':
        return (
          <Chip
            label={value}
            size="small"
            color={value === 'PF' ? "primary" : "secondary"}
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
                onClick={() => handleEditCliente(cliente.id)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir">
              <IconButton
                size="small"
                color="secondary"
                onClick={() => handleDeleteCliente(cliente)}
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

  // Filtrar clientes
  const filteredClientes = clientes.filter(cliente => {
    // Aplicar filtros por coluna
    for (const [columnId, filterValues] of Object.entries(columnFilters)) {
      if (!filterValues || !Array.isArray(filterValues) || filterValues.length === 0) continue;
      
      const cellValue = getCellValue(cliente, columnId);
      if (!filterValues.includes(String(cellValue).trim())) {
        return false;
      }
    }
    
    return true;
  });

  // Ordenar clientes
  const sortedClientes = React.useMemo(() => {
    if (!sortConfig.key) return filteredClientes;

    return [...filteredClientes].sort((a, b) => {
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
  }, [filteredClientes, sortConfig]);

  return (
    <MainContainer>
      <Box className={classes.mainContainer}>
        <Box className={classes.header}>
          <Typography variant="h5" style={{ fontWeight: 600 }}>
            Clientes ({totalCount})
          </Typography>
          <Button
            variant="contained"
            className={classes.addButton}
            startIcon={<AddIcon />}
            onClick={handleAddCliente}
          >
            Novo Cliente
          </Button>
        </Box>

        <Paper className={classes.tablePaper} variant="outlined">
        {/* Filtros Globais */}
        {showFilters && (
          <Box className={classes.filtersContainer}>
            <Box className={classes.filterRow}>
              <TextField
                className={classes.searchField}
                placeholder="Buscar por nome, documento, código..."
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
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={tipoClienteFilter}
                  onChange={(e) => setTipoClienteFilter(e.target.value)}
                  label="Tipo"
                >
                  <MenuItem value=""><em>Todos</em></MenuItem>
                  <MenuItem value="fisica">Pessoa Física</MenuItem>
                  <MenuItem value="juridica">Pessoa Jurídica</MenuItem>
                </Select>
              </FormControl>

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
              {loading && clientes.length === 0 ? "Buscando clientes..." : `Exibindo ${sortedClientes.length} de ${totalCount} clientes`}
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
                {loading && sortedClientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={tableColumns.filter(c => c.visible).length} align="center">
                      <Box className={classes.loadingRow}>
                        <CircularProgress size={24} />
                        <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
                          Carregando clientes...
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : sortedClientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={tableColumns.filter(c => c.visible).length} align="center">
                      <Box className={classes.emptyState}>
                        <BusinessIcon style={{ fontSize: 48, opacity: 0.3, marginBottom: 16 }} />
                        <Typography variant="body1" color="textSecondary">
                          Nenhum cliente encontrado
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {Object.values(columnFilters).some(v => v?.length > 0)
                            ? "Ajuste os filtros ou adicione novos clientes"
                            : "Clique em 'Novo Cliente' para começar"}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedClientes.map((cliente) => (
                    <TableRow key={cliente.id} hover>
                      {tableColumns.filter(col => col.visible).map((column) => (
                        <TableCell 
                          key={`${cliente.id}-${column.id}`}
                          style={{ 
                            width: column.width,
                            minWidth: column.width,
                            maxWidth: column.width,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {renderCellContent(cliente, column.id)}
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
              Carregando mais clientes...
            </Typography>
          </Box>
        )}

        {/* Mensagem de fim de lista */}
        {!hasMore && clientes.length > 0 && (
          <Box style={{ textAlign: "center", padding: 16 }}>
            <Typography variant="caption" color="textSecondary">
              Todos os clientes foram carregados
            </Typography>
          </Box>
        )}
        </Paper>
      </Box>

      {/* Modal de Confirmação */}
      <ConfirmationModal
        title="Excluir Cliente"
        open={confirmModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      >
        Tem certeza que deseja excluir o cliente <strong>{deletingCliente?.nome || deletingCliente?.razaoSocial}</strong>? Esta ação não pode ser desfeita.
      </ConfirmationModal>
    </MainContainer>
  );
};

export default Clientes;
