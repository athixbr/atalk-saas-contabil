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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Switch,
  FormControlLabel,
  Badge,
  Drawer,
} from "@material-ui/core";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
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
  PictureAsPdf as PictureAsPdfIcon,
  TableChart as TableChartIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon,
} from "@material-ui/icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import ConfirmationModal from "../../components/ConfirmationModal";
import api from "../../services/api";
import { toast } from "react-toastify";

const DRAWER_WIDTH = 400;

const normalizeSearchText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const onlyDigits = (value) => String(value || "").replace(/\D/g, "");

const getTipoClienteLabel = (cliente) => {
  if (cliente.isSocioRow || cliente.tipoCliente === "socio" || cliente.tipo === "SOCIO") return "Sócio";
  if (cliente.tipoCliente === "fisica" || cliente.tipo === "PF") return "PF";
  if (cliente.tipoCliente === "juridica" || cliente.tipo === "PJ") return "PJ";
  return "-";
};

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(3),
    width: "100%",
    boxSizing: "border-box",
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
    "&:hover": { background: "linear-gradient(135deg, #047ba5 0%, #035c7d 100%)" },
  },
  tablePaper: {
    padding: theme.spacing(2),
    borderRadius: "16px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    width: "100%",
    boxSizing: "border-box",
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
    "&:hover": { backgroundColor: "#e0e0e0" },
  },
  dragHandle: {
    cursor: "grab",
    color: "#999",
    marginRight: 8,
    "&:active": { cursor: "grabbing" },
  },
  sortIcon: {
    fontSize: 16,
    marginLeft: 4,
  },
  tableToolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(1.5),
    gap: theme.spacing(1),
    flexWrap: "wrap",
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(1),
    flexWrap: "wrap",
    alignItems: "center",
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
  // Drawer de filtros
  drawerPaper: {
    width: DRAWER_WIDTH,
    maxWidth: "95vw",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    backgroundColor: "#1976d2",
    color: "#fff",
    flexShrink: 0,
  },
  drawerSearch: {
    padding: "10px 14px",
    borderBottom: "1px solid #ebebeb",
    flexShrink: 0,
    position: "sticky",
    top: 0,
    zIndex: 10,
    backgroundColor: "#fff",
  },
  drawerQuickChips: {
    padding: "10px 14px",
    borderBottom: "1px solid #ebebeb",
    flexShrink: 0,
  },
  drawerList: {
    flex: 1,
    overflowY: "auto",
  },
  drawerFooter: {
    padding: "12px 16px",
    borderTop: "1px solid #e0e0e0",
    backgroundColor: "#f7f9fc",
    flexShrink: 0,
  },
}));

// Colunas disponíveis
const DEFAULT_COLUMNS = [
  { id: "id", label: "ID", visible: false, filterable: true, sortable: true, width: 70 },
  { id: "tipoCliente", label: "Tipo", visible: true, filterable: true, sortable: true, width: 90 },
  { id: "recorrencia", label: "Recorrência", visible: true, filterable: true, sortable: true, width: 140 },
  { id: "classificacaoCadastro", label: "Cadastro", visible: true, filterable: true, sortable: true, width: 140 },
  { id: "codigoErp", label: "Código ERP", visible: true, filterable: true, sortable: true, width: 120 },
  { id: "documento", label: "CPF/CNPJ", visible: true, filterable: true, sortable: true, width: 150 },
  { id: "nome", label: "Nome/Razão Social", visible: true, filterable: true, sortable: true, width: 250 },
  { id: "nomeFantasia", label: "Nome Fantasia", visible: true, filterable: true, sortable: true, width: 200 },
  { id: "apelido", label: "Apelido", visible: false, filterable: true, sortable: true, width: 150 },
  { id: "email", label: "E-mail", visible: true, filterable: true, sortable: true, width: 200 },
  { id: "telefone", label: "Telefone", visible: false, filterable: true, sortable: true, width: 130 },
  { id: "celular", label: "Celular", visible: true, filterable: true, sortable: true, width: 130 },
  { id: "cidade", label: "Cidade", visible: true, filterable: true, sortable: true, width: 150 },
  { id: "estado", label: "UF", visible: true, filterable: true, sortable: true, width: 70 },
  { id: "honorario", label: "Honorário", visible: false, filterable: false, sortable: true, width: 120 },
  { id: "ativo", label: "Ativo", visible: true, filterable: true, sortable: true, width: 90 },
  { id: "statusCliente", label: "Status Cliente", visible: false, filterable: true, sortable: true, width: 150 },
  { id: "tierCliente", label: "Tier", visible: false, filterable: true, sortable: true, width: 120 },
  { id: "clusterCliente", label: "Cluster", visible: false, filterable: true, sortable: true, width: 150 },
  { id: "tipoClienteParametro", label: "Tipo Cliente (Param)", visible: false, filterable: true, sortable: true, width: 150 },
  { id: "categoriaCliente", label: "Categoria", visible: false, filterable: true, sortable: true, width: 150 },
  { id: "periodicidadeCliente", label: "Periodicidade", visible: false, filterable: true, sortable: true, width: 150 },
  { id: "statusComplementar", label: "Status Complementar", visible: false, filterable: true, sortable: true, width: 170 },
  { id: "sedeCliente", label: "Sede/Escritório", visible: false, filterable: true, sortable: true, width: 180 },
  { id: "localizacaoCliente", label: "Localização", visible: false, filterable: true, sortable: true, width: 150 },
  { id: "tags", label: "Tags", visible: false, filterable: true, sortable: true, width: 150 },
  { id: "regimeTributarioFederal", label: "Regime Federal", visible: false, filterable: true, sortable: true, width: 150 },
  { id: "regimeTributarioEstadual", label: "Regime Estadual", visible: false, filterable: true, sortable: true, width: 150 },
  { id: "regimeTributarioMunicipal", label: "Regime Municipal", visible: false, filterable: true, sortable: true, width: 150 },
  { id: "porteFederal", label: "Porte Federal", visible: false, filterable: true, sortable: true, width: 130 },
  { id: "porteEstadual", label: "Porte Estadual", visible: false, filterable: true, sortable: true, width: 130 },
  { id: "porteMunicipal", label: "Porte Municipal", visible: false, filterable: true, sortable: true, width: 130 },
  { id: "volumeFiscal", label: "Vol. Fiscal", visible: false, filterable: true, sortable: true, width: 120 },
  { id: "volumeContabil", label: "Vol. Contábil", visible: false, filterable: true, sortable: true, width: 120 },
  { id: "volumeDP", label: "Vol. DP", visible: false, filterable: true, sortable: true, width: 100 },
  { id: "volumeBPO", label: "Vol. BPO", visible: false, filterable: true, sortable: true, width: 110 },
  { id: "modalidadeFechamentoContabil", label: "Modal. Fech. Contábil", visible: false, filterable: true, sortable: true, width: 180 },
  { id: "modalidadeFechamentoFiscal", label: "Modal. Fech. Fiscal", visible: false, filterable: true, sortable: true, width: 180 },
  { id: "modalidadeFechamentoDP", label: "Modal. Fech. DP", visible: false, filterable: true, sortable: true, width: 180 },
  { id: "modalFechBPO", label: "Modal. Fech. BPO", visible: false, filterable: true, sortable: true, width: 180 },
  { id: "distribuicaoLucros", label: "Distribuição Lucros", visible: false, filterable: true, sortable: true, width: 170 },
  { id: "adiantamentoFolha", label: "Adiant. Folha", visible: false, filterable: true, sortable: true, width: 150 },
  { id: "grupoCliente", label: "Grupo Cliente", visible: false, filterable: true, sortable: true, width: 150 },
  { id: "segmento", label: "Segmento", visible: true, filterable: true, sortable: true, width: 150 },
  { id: "servicosExtraordinarios", label: "Serviços Extraordinários", visible: false, filterable: true, sortable: true, width: 180 },
  { id: "envioCorrespondencia", label: "Envio de Correspondência", visible: false, filterable: true, sortable: true, width: 180 },
  { id: "actions", label: "Ações", visible: true, filterable: false, sortable: false, width: 100 },
];

const Clientes = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const tableContainerRef = React.useRef(null);

  // Dados
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Busca global
  const [searchParam, setSearchParam] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // UI
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [panelFilterSearch, setPanelFilterSearch] = useState("");
  const [expandedFilterCols, setExpandedFilterCols] = useState({});
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);

  // Tabela avançada
  const [tableColumns, setTableColumns] = useState(DEFAULT_COLUMNS);
  const [columnFilters, setColumnFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [columnVisibilityMenuAnchor, setColumnVisibilityMenuAnchor] = useState(null);
  const [filterPopoverAnchor, setFilterPopoverAnchor] = useState(null);
  const [activeFilterColumn, setActiveFilterColumn] = useState(null);
  const [filterSearchText, setFilterSearchText] = useState("");

  // Exclusão
  const [deletingCliente, setDeletingCliente] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Filtros salvos
  const [viewProfiles, setViewProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [saveProfileDialogOpen, setSaveProfileDialogOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [savedFiltersDrawerOpen, setSavedFiltersDrawerOpen] = useState(false);
  const [profileSearchText, setProfileSearchText] = useState("");
  const [deleteProfileDialogOpen, setDeleteProfileDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [quickSaveName, setQuickSaveName] = useState("");
  const [savingQuick, setSavingQuick] = useState(false);

  // ===== PERFIS =====
  useEffect(() => { loadViewProfiles(); }, [user]);

  const loadViewProfiles = async () => {
    try {
      setLoadingProfiles(true);
      const { data } = await api.get("/clientes-view-preferences");
      setViewProfiles(data);
      const defaultProfile = data.find((p) => p.isDefault);
      if (defaultProfile) applyProfile(defaultProfile, false);
      else loadUserPreferencesLocal();
    } catch (err) {
      loadUserPreferencesLocal();
    } finally {
      setLoadingProfiles(false);
    }
  };

  // Preserva a ordem/visibilidade salva pelo usuário, mas garante que colunas
  // novas adicionadas depois (ex.: Segmento) apareçam mesmo em perfis antigos.
  const mergeWithDefaultColumns = (savedColumns) => {
    if (!Array.isArray(savedColumns)) return DEFAULT_COLUMNS;
    const savedIds = new Set(savedColumns.map((c) => c.id));
    const missing = DEFAULT_COLUMNS.filter((c) => !savedIds.has(c.id));
    if (missing.length === 0) return savedColumns;
    const actionsIndex = savedColumns.findIndex((c) => c.id === "actions");
    if (actionsIndex === -1) return [...savedColumns, ...missing];
    return [...savedColumns.slice(0, actionsIndex), ...missing, ...savedColumns.slice(actionsIndex)];
  };

  const loadUserPreferencesLocal = () => {
    try {
      const savedPrefs = localStorage.getItem(`clientes_table_prefs_${user.id}`);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.columns) setTableColumns(mergeWithDefaultColumns(prefs.columns));
        if (prefs.columnFilters) setColumnFilters(prefs.columnFilters);
        if (prefs.sortConfig) setSortConfig(prefs.sortConfig);
      }
    } catch (_) {}
  };

  const applyProfile = (profile, showToast = true) => {
    setActiveProfile(profile);
    if (profile.columns) setTableColumns(mergeWithDefaultColumns(profile.columns));
    if (profile.filters) setColumnFilters(profile.filters);
    if (profile.sortConfig) setSortConfig(profile.sortConfig);
    if (showToast) toast.success(`Perfil "${profile.name}" aplicado!`);
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) { toast.error("Digite um nome para o perfil"); return; }
    try {
      const profileData = { name: profileName.trim(), columns: tableColumns, filters: columnFilters, sortConfig, isDefault: setAsDefault };
      if (activeProfile && activeProfile.id) {
        const { data } = await api.put(`/clientes-view-preferences/${activeProfile.id}`, profileData);
        toast.success("Perfil atualizado!");
        setActiveProfile(data);
      } else {
        const { data } = await api.post("/clientes-view-preferences", profileData);
        toast.success("Perfil salvo!");
        setActiveProfile(data);
      }
      await loadViewProfiles();
      handleCloseSaveDialog();
    } catch (err) { toast.error(err.response?.data?.error || "Erro ao salvar perfil"); }
  };

  const handleSetAsDefault = async (profile) => {
    try {
      await api.patch(`/clientes-view-preferences/${profile.id}/set-default`);
      toast.success(`"${profile.name}" definido como padrão!`);
      await loadViewProfiles();
    } catch (err) { toast.error(err.response?.data?.error || "Erro ao definir como padrão"); }
  };

  const handleDeleteProfile = async () => {
    if (!profileToDelete) return;
    try {
      await api.delete(`/clientes-view-preferences/${profileToDelete.id}`);
      toast.success(`Perfil "${profileToDelete.name}" excluído!`);
      if (activeProfile?.id === profileToDelete.id) {
        setActiveProfile(null);
        setTableColumns(DEFAULT_COLUMNS);
        setColumnFilters({});
        setSortConfig({ key: null, direction: "asc" });
      }
      await loadViewProfiles();
      handleCloseDeleteDialog();
    } catch (err) { toast.error(err.response?.data?.error || "Erro ao excluir perfil"); }
  };

  const handleOpenSaveDialog = (isUpdate = false) => {
    if (isUpdate && activeProfile) { setProfileName(activeProfile.name); setSetAsDefault(activeProfile.isDefault || false); }
    else { setProfileName(""); setSetAsDefault(false); }
    setSaveProfileDialogOpen(true);
    setSavedFiltersDrawerOpen(false);
  };
  const handleCloseSaveDialog = () => { setSaveProfileDialogOpen(false); setProfileName(""); setSetAsDefault(false); };

  const handleQuickSave = async () => {
    const name = quickSaveName.trim();
    if (!name) { toast.error("Digite um nome para o filtro"); return; }
    setSavingQuick(true);
    try {
      const { data } = await api.post("/clientes-view-preferences", { name, columns: tableColumns, filters: columnFilters, sortConfig, isDefault: false });
      toast.success(`Filtro "${name}" salvo!`);
      setQuickSaveName("");
      setActiveProfile(data);
      await loadViewProfiles();
    } catch (err) { toast.error(err.response?.data?.error || "Erro ao salvar filtro"); }
    finally { setSavingQuick(false); }
  };

  const handleOpenDeleteDialog = (profile) => { setProfileToDelete(profile); setDeleteProfileDialogOpen(true); };
  const handleCloseDeleteDialog = () => { setDeleteProfileDialogOpen(false); setProfileToDelete(null); };

  // ===== DADOS =====
  useEffect(() => {
    const timer = setTimeout(() => setSearchParam(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => { resetAndFetch(); }, [searchParam]);

  useEffect(() => {
    const handleScroll = (e) => {
      const t = e.target;
      if (!t || t.scrollTop === undefined) return;
      if (t.scrollHeight - t.scrollTop <= t.clientHeight + 100 && hasMore && !loading && !loadingMore)
        loadMoreClientes();
    };
    const c = tableContainerRef.current;
    if (c) { c.addEventListener("scroll", handleScroll); return () => c.removeEventListener("scroll", handleScroll); }
  }, [hasMore, loading, loadingMore, pageNumber]);

  useEffect(() => { if (clientes.length === 0 && !loading) fetchClientes(1, true); }, []);

  const resetAndFetch = () => { setClientes([]); setPageNumber(1); setHasMore(true); fetchClientes(1, true); };

  const mergeClientesSocios = (clientesBase, sociosRows) => {
    const byKey = new Map();
    [...clientesBase, ...sociosRows].forEach((item) => {
      byKey.set(String(item.id), item);
    });
    return Array.from(byKey.values());
  };

  const hasExactSearchMatch = (cliente, term = searchParam) => {
    const normalizedTerm = normalizeSearchText(term);
    const digitTerm = onlyDigits(term);
    if (!normalizedTerm && !digitTerm) return false;

    const textFields = [
      cliente.nome,
      cliente.razaoSocial,
      cliente.nomeFantasia,
      cliente.apelido,
      cliente.email,
      cliente.codigoErp,
      cliente.codigoSistema,
    ].map(normalizeSearchText);

    const docFields = [cliente.cpf, cliente.cnpj, cliente.cpfCnpj].map(onlyDigits).filter(Boolean);

    return (
      (normalizedTerm && textFields.some((value) => value === normalizedTerm)) ||
      (digitTerm && docFields.some((value) => value === digitTerm))
    );
  };

  const applyExactSearchPreference = (rows) => {
    if (!searchParam || searchParam.trim().length < 3) return rows;
    const exactRows = rows.filter((cliente) => hasExactSearchMatch(cliente));
    return exactRows.length ? exactRows : rows;
  };

  const fetchClientes = async (page = 1, reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const params = { page, limit: 9999 };
      if (searchParam) params.searchParam = searchParam;
      const recorrenciaFilter = Array.isArray(columnFilters.recorrencia) && columnFilters.recorrencia.length === 1
        ? columnFilters.recorrencia[0]
        : "";
      if (recorrenciaFilter) {
        params.recorrencia = recorrenciaFilter === "Recorrente" ? "recorrente" : "nao_recorrente";
      }
      const { data } = await api.get("/clientes", { params });
      let clientesResponse = data.clientes || [];

      const preciseClientes = applyExactSearchPreference(clientesResponse);
      if (reset) setClientes(preciseClientes);
      else setClientes((prev) => mergeClientesSocios(prev, preciseClientes));
      setHasMore(data.hasMore || false);
      setTotalCount(Math.max(data.count || 0, clientesResponse.length));
      setPageNumber(page);
    } catch (err) { toast.error("Erro ao carregar clientes"); }
    finally { setLoading(false); }
  };

  const loadMoreClientes = () => {
    if (!loading && !loadingMore && hasMore) {
      setLoadingMore(true);
      fetchClientes(pageNumber + 1, false).finally(() => setLoadingMore(false));
    }
  };

  const handleAddCliente = () => history.push("/clientes/cadastro");
  const handleEditCliente = (id) => history.push(`/clientes/cadastro/${id}`);
  const handleDeleteCliente = (c) => { setDeletingCliente(c); setConfirmModalOpen(true); };
  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/clientes/${deletingCliente.id}`);
      toast.success("Cliente excluído com sucesso!");
      setConfirmModalOpen(false); setDeletingCliente(null); resetAndFetch();
    } catch (err) { toast.error(err.response?.data?.error || "Erro ao excluir"); setConfirmModalOpen(false); setDeletingCliente(null); }
  };
  const handleCancelDelete = () => { setConfirmModalOpen(false); setDeletingCliente(null); };

  // ===== TABELA =====
  const handleColumnDragEnd = (result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    // Only visible columns are rendered as Draggables, so indices refer to visible-only list
    const visibleCols = tableColumns.filter(col => col.visible);
    const reordered = Array.from(visibleCols);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    // Rebuild full column array: replace visible slots with the reordered visible list
    let vi = 0;
    setTableColumns(tableColumns.map(col => col.visible ? reordered[vi++] : col));
  };

  const toggleColumnVisibility = (columnId) =>
    setTableColumns((prev) => prev.map((c) => c.id === columnId ? { ...c, visible: !c.visible } : c));

  const handleColumnFilter = (columnId, value) =>
    setColumnFilters((prev) => ({ ...prev, [columnId]: value }));

  const handleOpenFilterMenu = (event, columnId) => {
    if (event && event.stopPropagation) event.stopPropagation();
    if (event && event.currentTarget) setFilterPopoverAnchor(event.currentTarget);
    setActiveFilterColumn(columnId);
  };
  const handleCloseFilterMenu = () => { setFilterPopoverAnchor(null); setActiveFilterColumn(null); setFilterSearchText(""); };

  const getUniqueColumnValues = (columnId, searchText = "") => {
    if (columnId === "codigoErp") {
      const codes = clientes
        .map((c) => c.codigoErp)
        .filter((v) => v !== undefined && v !== null && String(v).trim() !== "")
        .map((v) => String(v).trim());
      const values = ["Com Código ERP", "Sem Código ERP", ...new Set(codes)];
      return searchText
        ? values.filter((v) => v.toLowerCase().includes(searchText.toLowerCase()))
        : values;
    }
    const values = clientes.map((c) => { const v = getCellValue(c, columnId); return v ? String(v).trim() : ""; }).filter((v) => v !== "" && v !== "-");
    const unique = [...new Set(values)];
    const filtered = searchText ? unique.filter((v) => v.toLowerCase().includes(searchText.toLowerCase())) : unique;
    return filtered.sort((a, b) => a.localeCompare(b, "pt-BR"));
  };

  const toggleFilterValue = (columnId, value) => {
    const cur = Array.isArray(columnFilters[columnId]) ? columnFilters[columnId] : [];
    handleColumnFilter(columnId, cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]);
  };

  const clearColumnFilter = (columnId) => handleColumnFilter(columnId, []);

  const clearAllColumnFilters = () => setColumnFilters({});

  const toggleExpandedFilter = (columnId) =>
    setExpandedFilterCols((prev) => ({ ...prev, [columnId]: !prev[columnId] }));

  const handleSort = (columnId) => {
    setSortConfig((prev) => {
      if (prev.key === columnId) {
        if (prev.direction === "asc") return { key: columnId, direction: "desc" };
        if (prev.direction === "desc") return { key: null, direction: "asc" };
      }
      return { key: columnId, direction: "asc" };
    });
  };

  const handleResetTablePreferences = () => {
    setTableColumns(DEFAULT_COLUMNS); setColumnFilters({}); setSortConfig({ key: null, direction: "asc" });
    setActiveProfile(null); setPanelFilterSearch(""); setExpandedFilterCols({});
    localStorage.removeItem(`clientes_table_prefs_${user.id}`);
    toast.success("Preferências resetadas!");
  };

  const getCellValue = (cliente, columnId) => {
    switch (columnId) {
      case "id": return cliente.id;
      case "tipoCliente": return getTipoClienteLabel(cliente);
      case "recorrencia": return cliente.recorrencia === "nao_recorrente" ? "Não recorrente" : "Recorrente";
      case "classificacaoCadastro": return cliente.classificacaoCadastro || (cliente.isSocio ? "Cliente/Sócio" : "Cliente");
      case "codigoErp": return cliente.codigoErp || "-";
      case "documento": return (cliente.isSocioRow || cliente.tipoCliente === "socio" || cliente.tipoCliente === "fisica" || cliente.tipo === "PF" || cliente.tipo === "SOCIO") ? (cliente.cpf || cliente.cpfCnpj || "-") : (cliente.cnpj || cliente.cpfCnpj || "-");
      case "nome": return (cliente.isSocioRow || cliente.tipoCliente === "socio" || cliente.tipoCliente === "fisica" || cliente.tipo === "PF" || cliente.tipo === "SOCIO") ? (cliente.nome || "-") : (cliente.razaoSocial || cliente.nome || "-");
      case "nomeFantasia": return cliente.nomeFantasia || "-";
      case "apelido": return cliente.apelido || "-";
      case "email": return cliente.email || "-";
      case "telefone": return cliente.telefone || "-";
      case "celular": return cliente.celular || "-";
      case "cidade": return cliente.cidade || "-";
      case "estado": return cliente.estado || "-";
      case "honorario": return cliente.honorario ? `R$ ${parseFloat(cliente.honorario).toFixed(2)}` : "-";
      case "ativo": return cliente.ativo ? "Sim" : "Não";
      case "statusCliente": return cliente.statusCliente?.nome || "-";
      case "tierCliente": return cliente.tierCliente?.nome || "-";
      case "clusterCliente": return cliente.clusterCliente?.nome || "-";
      case "tipoClienteParametro": return cliente.tipoClienteParametro?.nome || "-";
      case "categoriaCliente": return cliente.categoriaCliente?.nome || "-";
      case "periodicidadeCliente": return cliente.periodicidadeCliente?.nome || "-";
      case "statusComplementar": return cliente.statusComplementar?.nome || "-";
      case "sedeCliente": return cliente.sedeCliente?.nome || cliente.escritorioGestor?.nome || "-";
      case "localizacaoCliente": return cliente.localizacaoCliente?.nome || "-";
      case "tags": return cliente.tags?.nome || "-";
      case "regimeTributarioFederal": return cliente.regimeTributarioFederal?.nome || "-";
      case "regimeTributarioEstadual": return cliente.regimeTributarioEstadual?.nome || "-";
      case "regimeTributarioMunicipal": return cliente.regimeTributarioMunicipal?.nome || "-";
      case "porteFederal": return cliente.porteFederal?.nome || "-";
      case "porteEstadual": return cliente.porteEstadual?.nome || "-";
      case "porteMunicipal": return cliente.porteMunicipal?.nome || "-";
      case "volumeFiscal": return cliente.volumeFiscal?.nome || "-";
      case "volumeContabil": return cliente.volumeContabil?.nome || "-";
      case "volumeDP": return cliente.volumeDP?.nome || "-";
      case "volumeBPO": return cliente.volumeBPO?.nome || "-";
      case "modalidadeFechamentoContabil": return cliente.modalidadeFechamentoContabil?.nome || "-";
      case "modalidadeFechamentoFiscal": return cliente.modalidadeFechamentoFiscal?.nome || "-";
      case "modalidadeFechamentoDP": return cliente.modalidadeFechamentoDP?.nome || "-";
      case "modalFechBPO": return cliente.modalFechBPO?.nome || "-";
      case "distribuicaoLucros": return cliente.distribuicaoLucros?.nome || "-";
      case "adiantamentoFolha": return cliente.adiantamentoFolha?.nome || "-";
      case "grupoCliente": return cliente.grupoCliente?.nome || "-";
      case "segmento": return cliente.segmento?.nome || "-";
      case "servicosExtraordinarios": return cliente.servicosExtraordinarios?.nome || "-";
      case "envioCorrespondencia": return cliente.envioCorrespondencia?.nome || "-";
      default: return "-";
    }
  };

  const renderCellContent = (cliente, columnId) => {
    const value = getCellValue(cliente, columnId);
    switch (columnId) {
      case "tipoCliente":
        return <Chip label={value} size="small" color={value === "PF" ? "primary" : value === "Sócio" ? "default" : "secondary"} />;
      case "ativo":
        return <Chip label={value} size="small" color={value === "Sim" ? "primary" : "default"} />;
      case "recorrencia":
        return <Chip label={value} size="small" color={value === "Recorrente" ? "primary" : "default"} />;
      case "classificacaoCadastro":
        return (
          <Chip
            label={value}
            size="small"
            color={value.includes("Sócio") || value.includes("Anexado") ? "secondary" : "default"}
          />
        );
      case "actions":
        return (
          <Box style={{ display: "flex", gap: 4 }}>
            <Tooltip title={cliente.isSocioRow ? "Abrir empresa do sócio" : "Editar"}>
              <IconButton
                size="small"
                color="primary"
                onClick={() => cliente.isSocioRow && cliente.clienteVinculadoId ? handleEditCliente(cliente.clienteVinculadoId) : handleEditCliente(cliente.id)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {cliente.isSocioRow ? (
              <Tooltip title="Sócio anexado pelo quadro societário">
                <span>
                  <IconButton size="small" disabled>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            ) : (
              <Tooltip title="Excluir">
                <IconButton size="small" color="secondary" onClick={() => handleDeleteCliente(cliente)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      default:
        return <span title={value !== "-" ? value : undefined}>{value}</span>;
    }
  };

  // Filtrar e ordenar
  const filteredClientes = clientes.filter((cliente) => {
    for (const [colId, vals] of Object.entries(columnFilters)) {
      if (!vals || !Array.isArray(vals) || vals.length === 0) continue;
      if (colId === "classificacaoCadastro" && cliente.isSocio && vals.includes("Cliente/Sócio")) {
        continue;
      }
      if (colId === "codigoErp") {
        const hasCodigoErp = Boolean(cliente.codigoErp && String(cliente.codigoErp).trim());
        const codigoErpValue = hasCodigoErp ? String(cliente.codigoErp).trim() : "";
        const matchesPresence =
          (hasCodigoErp && vals.includes("Com Código ERP")) ||
          (!hasCodigoErp && vals.includes("Sem Código ERP"));
        if (!matchesPresence && !vals.includes(codigoErpValue)) return false;
        continue;
      }
      if (!vals.includes(String(getCellValue(cliente, colId)).trim())) return false;
    }
    return true;
  });

  const sortedClientes = React.useMemo(() => {
    if (!sortConfig.key) return filteredClientes;
    return [...filteredClientes].sort((a, b) => {
      const av = getCellValue(a, sortConfig.key), bv = getCellValue(b, sortConfig.key);
      if (av === "-" || av == null || av === "") return 1;
      if (bv === "-" || bv == null || bv === "") return -1;
      const an = parseFloat(String(av).replace(/[^\d.-]/g, "")), bn = parseFloat(String(bv).replace(/[^\d.-]/g, ""));
      if (!isNaN(an) && !isNaN(bn)) return sortConfig.direction === "asc" ? an - bn : bn - an;
      const c = String(av).localeCompare(String(bv), "pt-BR");
      return sortConfig.direction === "asc" ? c : -c;
    });
  }, [filteredClientes, sortConfig]);

  // ===== EXPORTAÇÃO =====
  const getSociosVinculados = (cliente) => {
    if (!Array.isArray(cliente.socios)) return [];
    return cliente.socios.filter((socio) => {
      const vinculo = socio.ClienteSocio || socio.clienteSocio || {};
      return vinculo.ativo !== false && socio.ativo !== false;
    });
  };

  const buildSocioExportCliente = (socio, empresa) => {
    const vinculo = socio.ClienteSocio || socio.clienteSocio || {};
    const empresaNome = empresa.nomeFantasia || empresa.apelido || empresa.razaoSocial || empresa.nome || "";
    return {
      ...socio,
      id: `socio-export-${socio.id}-${empresa.id || vinculo.id || ""}`,
      isSocioRow: true,
      tipoCliente: "socio",
      tipo: "SOCIO",
      cpf: socio.cpf || "",
      cnpj: "",
      nome: `  ${socio.nome || ""}`,
      razaoSocial: `  ${socio.nome || ""}`,
      nomeFantasia: empresaNome,
      apelido: socio.nome || "",
      classificacaoCadastro: `Sócio da empresa: ${empresaNome}`,
      socioEmpresaNome: empresaNome,
      socioVinculoId: vinculo.id,
    };
  };

  const buildExportRows = () => {
    const rows = [];
    sortedClientes.forEach((cliente) => {
      if (cliente.isSocioRow) return;
      rows.push(cliente);
      getSociosVinculados(cliente).forEach((socio) => {
        rows.push(buildSocioExportCliente(socio, cliente));
      });
    });

    const orphanSocios = sortedClientes.filter((cliente) => cliente.isSocioRow);
    orphanSocios.forEach((socioRow) => {
      const alreadyIncluded = rows.some((row) => row.socioId && row.socioId === socioRow.socioId);
      if (!alreadyIncluded) rows.push(socioRow);
    });

    return rows;
  };

  const getVisibleExportColumns = () => tableColumns.filter((c) => c.visible && c.id !== "actions");

  const escapeCsvValue = (value) => {
    const text = value === "-" || value == null ? "" : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };

  const handleExportExcel = () => {
    try {
      const XLSX = require("xlsx");
      const visibleCols = getVisibleExportColumns();
      const exportRows = buildExportRows();
      const wsData = [
        visibleCols.map((c) => c.label),
        ...exportRows.map((cliente) => visibleCols.map((col) => { const v = getCellValue(cliente, col.id); return v === "-" ? "" : v; })),
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws["!cols"] = visibleCols.map((c) => ({ wch: Math.min(Math.max(c.label.length + 5, 12), 45) }));
      ws["!views"] = [{ state: "frozen", xSplit: 0, ySplit: 1 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Clientes");
      XLSX.writeFile(wb, `clientes_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.xlsx`);
      toast.success("Excel exportado com sucesso!");
      setExportMenuAnchor(null);
    } catch (err) { toast.error("Erro ao exportar Excel"); }
  };

  const handleExportPDF = () => {
    try {
      const { jsPDF } = require("jspdf");
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const visibleCols = getVisibleExportColumns();
      const exportRows = buildExportRows();
      const pageWidth = 277, margin = 10, tableWidth = pageWidth - 2 * margin;
      const totalWeight = visibleCols.reduce((s, c) => s + (c.width || 120), 0);
      const colWidths = visibleCols.map((c) => ((c.width || 120) / totalWeight) * tableWidth);
      const date = new Date().toLocaleDateString("pt-BR");
      let y = 10;

      doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(25, 118, 210);
      doc.text("Relatório de Clientes", margin, y); y += 7;
      doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80);
      doc.text(`Gerado em: ${date}  |  Registros: ${exportRows.length} de ${totalCount}`, margin, y); y += 6;
      doc.setTextColor(0, 0, 0);

      const rowH = 6.5, fs = 6.5;
      const drawHeader = (yPos) => {
        doc.setFillColor(25, 118, 210); doc.rect(margin, yPos, tableWidth, rowH + 1, "F");
        doc.setTextColor(255, 255, 255); doc.setFontSize(fs); doc.setFont("helvetica", "bold");
        let x = margin;
        visibleCols.forEach((col, i) => {
          const mc = Math.max(3, Math.floor(colWidths[i] / 1.9));
          doc.text(col.label.length > mc ? col.label.slice(0, mc - 1) + "…" : col.label, x + 1.5, yPos + rowH - 1);
          x += colWidths[i];
        });
        doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "normal");
        return yPos + rowH + 1;
      };

      y = drawHeader(y);
      exportRows.forEach((cliente, ri) => {
        if (y + rowH > 200) { doc.addPage(); y = 10; y = drawHeader(y); }
        if (ri % 2 === 0) { doc.setFillColor(246, 248, 251); doc.rect(margin, y, tableWidth, rowH, "F"); }
        if (cliente.isSocioRow) { doc.setFillColor(235, 247, 250); doc.rect(margin, y, tableWidth, rowH, "F"); }
        doc.setFontSize(fs);
        let x = margin;
        visibleCols.forEach((col, i) => {
          const raw = getCellValue(cliente, col.id), text = raw === "-" ? "" : String(raw);
          const mc = Math.max(2, Math.floor(colWidths[i] / 1.85));
          doc.text(text.length > mc ? text.slice(0, mc - 1) + "…" : text, x + 1.5, y + rowH - 1.5);
          x += colWidths[i];
        });
        doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.1);
        doc.line(margin, y + rowH, margin + tableWidth, y + rowH);
        y += rowH;
      });

      const pc = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pc; i++) {
        doc.setPage(i); doc.setFontSize(7); doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${pc}`, pageWidth - margin - 22, 202);
        doc.text("aTalk CRM", margin, 202);
      }
      doc.save(`clientes_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`);
      toast.success("PDF exportado com sucesso!");
      setExportMenuAnchor(null);
    } catch (err) { toast.error("Erro ao exportar PDF"); }
  };

  const handleExportCSV = () => {
    try {
      const visibleCols = getVisibleExportColumns();
      const exportRows = buildExportRows();
      const csvRows = [
        visibleCols.map((c) => escapeCsvValue(c.label)).join(";"),
        ...exportRows.map((cliente) =>
          visibleCols.map((col) => escapeCsvValue(getCellValue(cliente, col.id))).join(";")
        ),
      ];
      const blob = new Blob([`\uFEFF${csvRows.join("\n")}`], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `clientes_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("CSV exportado com sucesso!");
      setExportMenuAnchor(null);
    } catch (err) { toast.error("Erro ao exportar CSV"); }
  };

  // Contagens
  const totalActiveFilters = Object.values(columnFilters).filter((v) => Array.isArray(v) && v.length > 0).length;
  const hasAnyFilter = !!(searchParam || totalActiveFilters > 0);

  // ===== RENDER DO DRAWER DE FILTROS =====
  const renderFilterDrawer = () => {
    const totalRecords = clientes.length;
    const filterableCols = tableColumns.filter((c) => c.filterable && c.id !== "actions");

    // Separar em úteis (≤100 valores) e avançadas (>100)
    const usefulCols = [], advancedCols = [];
    filterableCols.forEach((col) => {
      const vals = getUniqueColumnValues(col.id);
      if (vals.length === 0) return;
      const hasActive = (columnFilters[col.id] || []).length > 0;
      if (hasActive || vals.length <= 100) usefulCols.push({ col, vals });
      else advancedCols.push({ col, vals });
    });

    // Ordenar: ativos primeiro, depois por nº de opções asc
    usefulCols.sort((a, b) => {
      const aa = (columnFilters[a.col.id] || []).length > 0;
      const ba = (columnFilters[b.col.id] || []).length > 0;
      if (aa !== ba) return aa ? -1 : 1;
      return a.vals.length - b.vals.length;
    });

    const ql = panelFilterSearch.toLowerCase();

    const renderRow = ({ col, vals: allValues }) => {
      if (!panelFilterSearch) {
        // sem busca: exibe todos
      } else {
        const matches = col.label.toLowerCase().includes(ql) || allValues.some((v) => v.toLowerCase().includes(ql));
        if (!matches) return null;
      }

      const displayValues = panelFilterSearch
        ? allValues.filter((v) => v.toLowerCase().includes(ql) || col.label.toLowerCase().includes(ql))
        : allValues;

      const isExpanded = !!expandedFilterCols[col.id];
      const activeFilters = columnFilters[col.id] || [];
      const hasActive = activeFilters.length > 0;

      return (
        <Box key={col.id}>
          <Divider style={{ margin: 0 }} />
          {/* Header da linha */}
          <Box
            onClick={() => toggleExpandedFilter(col.id)}
            style={{
              display: "flex", alignItems: "center",
              padding: "10px 16px",
              cursor: "pointer",
              backgroundColor: hasActive ? "#e8f4fd" : isExpanded ? "#f4f6f8" : "#fff",
              transition: "background 0.1s",
              userSelect: "none",
              minHeight: 44,
            }}
          >
            {/* Barra de status */}
            <Box style={{
              width: 3, height: 22, borderRadius: 2,
              backgroundColor: hasActive ? "#1976d2" : "transparent",
              marginRight: 10, flexShrink: 0,
            }} />

            {/* Nome + contagem */}
            <Box style={{ flex: 1 }}>
              <Typography style={{
                fontSize: 13.5,
                fontWeight: hasActive ? 700 : isExpanded ? 600 : 400,
                color: hasActive ? "#1565c0" : "#2c2c2c",
                lineHeight: 1.3,
              }}>
                {col.label}
              </Typography>
              <Typography variant="caption" style={{ color: "#aaa", fontSize: 10.5 }}>
                {allValues.length} {allValues.length === 1 ? "opção" : "opções"}
                {hasActive && ` • ${activeFilters.length} selecionado${activeFilters.length > 1 ? "s" : ""}`}
              </Typography>
            </Box>

            {/* Chips dos selecionados */}
            {hasActive && (
              <Box style={{ display: "flex", gap: 3, marginRight: 6, maxWidth: 160, overflow: "hidden", flexShrink: 0 }}>
                {activeFilters.slice(0, 2).map((val) => (
                  <Chip key={val} label={val} size="small" style={{ height: 20, fontSize: 10, backgroundColor: "#1976d2", color: "#fff", maxWidth: 75 }} />
                ))}
                {activeFilters.length > 2 && (
                  <Chip label={`+${activeFilters.length - 2}`} size="small" style={{ height: 20, fontSize: 10, backgroundColor: "#bbdefb", color: "#0d47a1" }} />
                )}
              </Box>
            )}

            {/* Limpar */}
            {hasActive && (
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); clearColumnFilter(col.id); }} style={{ padding: 3, marginRight: 2 }}>
                <ClearIcon style={{ fontSize: 14, color: "#1976d2" }} />
              </IconButton>
            )}

            {/* Seta */}
            {isExpanded
              ? <ExpandLessIcon style={{ fontSize: 20, color: "#bbb", flexShrink: 0 }} />
              : <ExpandMoreIcon style={{ fontSize: 20, color: "#bbb", flexShrink: 0 }} />
            }
          </Box>

          {/* Valores expandidos */}
          {isExpanded && (
            <Box style={{ padding: "10px 16px 14px 30px", backgroundColor: "#f7f9fc", borderTop: "1px solid #eeeeee" }}>
              <Box style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {displayValues.map((value) => {
                  const sel = activeFilters.includes(value);
                  return (
                    <Chip
                      key={value}
                      label={value}
                      size="small"
                      onClick={() => toggleFilterValue(col.id, value)}
                      style={{
                        height: 30, fontSize: 12.5, cursor: "pointer", borderRadius: 15,
                        backgroundColor: sel ? "#1976d2" : "#fff",
                        color: sel ? "#fff" : "#333",
                        border: `1.5px solid ${sel ? "#1565c0" : "#d0d0d0"}`,
                        fontWeight: sel ? 600 : 400,
                        boxShadow: sel ? "0 2px 6px rgba(25,118,210,0.25)" : "0 1px 3px rgba(0,0,0,0.07)",
                        transition: "all 0.12s",
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>
      );
    };

    const hasResults = [...usefulCols, ...advancedCols].some(({ col, vals }) => {
      if (!panelFilterSearch) return true;
      return col.label.toLowerCase().includes(ql) || vals.some((v) => v.toLowerCase().includes(ql));
    });

    return (
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{ className: classes.drawerPaper }}
      >
        {/* Cabeçalho */}
        <Box className={classes.drawerHeader}>
          <Box>
            <Typography style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>
              <FilterListIcon style={{ fontSize: 18, verticalAlign: "middle", marginRight: 8 }} />
              Filtros
            </Typography>
            <Typography style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>
              {sortedClientes.length} de {totalCount} clientes visíveis
            </Typography>
          </Box>
          <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {totalActiveFilters > 0 && (
              <Button
                size="small"
                onClick={clearAllColumnFilters}
                style={{ color: "#fff", border: "1px solid rgba(255,255,255,0.5)", fontSize: 11, padding: "3px 10px" }}
                variant="outlined"
              >
                Limpar ({totalActiveFilters})
              </Button>
            )}
            <IconButton size="small" onClick={() => setFilterDrawerOpen(false)} style={{ color: "#fff" }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Chips de acesso rápido */}
        <Box className={classes.drawerQuickChips}>
          <Typography variant="caption" style={{ fontWeight: 600, color: "#888", fontSize: 10, display: "block", marginBottom: 7 }}>
            ACESSO RÁPIDO
          </Typography>
          <Box style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              { label: "Ativos", colId: "ativo", value: "Sim", color: "#2e7d32" },
              { label: "Inativos", colId: "ativo", value: "Não", color: "#c62828" },
              { label: "PF", colId: "tipoCliente", value: "PF", color: "#1565c0" },
              { label: "PJ", colId: "tipoCliente", value: "PJ", color: "#6a1b9a" },
              { label: "Sócio", colId: "tipoCliente", value: "Sócio", color: "#00838f" },
              { label: "Clientes", colId: "classificacaoCadastro", value: "Cliente", color: "#455a64" },
              { label: "Sócios", colId: "classificacaoCadastro", value: "Cliente/Sócio", color: "#00838f" },
            ].map(({ label, colId, value, color }) => {
              const active = (columnFilters[colId] || []).includes(value);
              return (
                <Chip
                  key={label}
                  label={label}
                  size="small"
                  clickable
                  onClick={() => toggleFilterValue(colId, value)}
                  onDelete={active ? () => toggleFilterValue(colId, value) : undefined}
                  style={{
                    height: 26, fontSize: 12, fontWeight: active ? 700 : 500,
                    backgroundColor: active ? color : "transparent",
                    color: active ? "#fff" : color,
                    border: `1.5px solid ${color}`,
                    borderRadius: 13,
                  }}
                />
              );
            })}
          </Box>
        </Box>

        {/* Busca sticky */}
        <Box className={classes.drawerSearch}>
          <Typography variant="caption" style={{ fontWeight: 600, color: "#888", fontSize: 10, display: "block", marginBottom: 6 }}>
            FILTRAR POR COLUNA
          </Typography>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Buscar coluna ou valor..."
            value={panelFilterSearch}
            onChange={(e) => {
              const q = e.target.value;
              setPanelFilterSearch(q);
              if (q) {
                const ne = {};
                tableColumns.filter((c) => c.filterable && c.id !== "actions").forEach((col) => {
                  const vals = getUniqueColumnValues(col.id);
                  if (col.label.toLowerCase().includes(q.toLowerCase()) || vals.some((v) => v.toLowerCase().includes(q.toLowerCase())))
                    ne[col.id] = true;
                });
                setExpandedFilterCols(ne);
              }
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon style={{ fontSize: 15, color: "#aaa" }} /></InputAdornment>,
              endAdornment: panelFilterSearch ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setPanelFilterSearch("")} style={{ padding: 2 }}>
                    <ClearIcon style={{ fontSize: 14 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
              style: { fontSize: 13, height: 36 },
            }}
            inputProps={{ style: { padding: "6px 8px", fontSize: 13 } }}
          />
        </Box>

        {/* Lista accordion */}
        <Box className={classes.drawerList}>
          {!hasResults ? (
            <Box style={{ padding: "32px 16px", textAlign: "center" }}>
              <SearchIcon style={{ fontSize: 36, color: "#ddd", display: "block", margin: "0 auto 10px" }} />
              <Typography variant="body2" color="textSecondary">
                Nenhum resultado para "{panelFilterSearch}"
              </Typography>
            </Box>
          ) : (
            <>
              {usefulCols.map(({ col, vals }) => renderRow({ col, vals }))}

              {advancedCols.length > 0 && !panelFilterSearch && (
                <Box style={{ padding: "8px 16px 6px", backgroundColor: "#f5f5f5" }}>
                  <Typography variant="caption" style={{ color: "#aaa", fontSize: 10, fontWeight: 600, letterSpacing: 0.5 }}>
                    COLUNAS COM MUITOS VALORES
                  </Typography>
                </Box>
              )}
              {advancedCols.map(({ col, vals }) => renderRow({ col, vals }))}
            </>
          )}
        </Box>

        {/* Rodapé */}
        <Box className={classes.drawerFooter}>
          <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="caption" color="textSecondary" style={{ fontSize: 12 }}>
              {sortedClientes.length === totalCount
                ? `${totalCount} clientes`
                : <><strong style={{ color: "#1976d2" }}>{sortedClientes.length}</strong> de {totalCount} clientes</>
              }
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => setFilterDrawerOpen(false)}
              style={{ fontSize: 12, padding: "5px 16px" }}
            >
              Ver resultados
            </Button>
          </Box>
        </Box>
      </Drawer>
    );
  };

  // ===== RENDER DO DRAWER DE FILTROS SALVOS =====
  const renderSavedFiltersDrawer = () => {
    const filtered = profileSearchText.trim()
      ? viewProfiles.filter((p) => p.name.toLowerCase().includes(profileSearchText.toLowerCase()))
      : viewProfiles;

    return (
      <Drawer
        anchor="right"
        open={savedFiltersDrawerOpen}
        onClose={() => { setSavedFiltersDrawerOpen(false); setProfileSearchText(""); }}
        PaperProps={{ className: classes.drawerPaper }}
      >
        {/* Cabeçalho */}
        <Box className={classes.drawerHeader}>
          <Box>
            <Typography style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>
              <StarIcon style={{ fontSize: 18, verticalAlign: "middle", marginRight: 8 }} />
              Filtros Salvos {viewProfiles.length > 0 && `(${viewProfiles.length})`}
            </Typography>
            {activeProfile && (
              <Typography style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                Ativo: <strong style={{ color: "#fff" }}>{activeProfile.name}</strong>
                <span
                  style={{ cursor: "pointer", textDecoration: "underline", marginLeft: 4 }}
                  onClick={() => { setActiveProfile(null); setColumnFilters({}); setSortConfig({ key: null, direction: "asc" }); }}
                >
                  (limpar)
                </span>
              </Typography>
            )}
          </Box>
          <IconButton size="small" onClick={() => { setSavedFiltersDrawerOpen(false); setProfileSearchText(""); }} style={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Busca */}
        <Box className={classes.drawerSearch}>
          <Typography variant="caption" style={{ fontWeight: 600, color: "#888", fontSize: 10, display: "block", marginBottom: 6 }}>
            PESQUISAR FILTROS SALVOS
          </Typography>
          <TextField
            fullWidth size="small" variant="outlined" placeholder="Buscar pelo nome..."
            value={profileSearchText}
            onChange={(e) => setProfileSearchText(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon style={{ fontSize: 15, color: "#aaa" }} /></InputAdornment>,
              endAdornment: profileSearchText ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setProfileSearchText("")} style={{ padding: 2 }}>
                    <ClearIcon style={{ fontSize: 14 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
              style: { fontSize: 13, height: 36 },
            }}
            inputProps={{ style: { padding: "6px 8px", fontSize: 13 } }}
          />
        </Box>

        {/* Lista de filtros */}
        <Box className={classes.drawerList}>
          {loadingProfiles ? (
            <Box style={{ padding: "32px", textAlign: "center" }}><CircularProgress size={24} /></Box>
          ) : viewProfiles.length === 0 ? (
            <Box style={{ padding: "40px 16px", textAlign: "center" }}>
              <StarBorderIcon style={{ fontSize: 40, color: "#ddd", display: "block", margin: "0 auto 10px" }} />
              <Typography variant="body2" color="textSecondary" style={{ marginBottom: 4 }}>Nenhum filtro salvo ainda</Typography>
              <Typography variant="caption" color="textSecondary">Use o formulário abaixo para salvar a configuração atual</Typography>
            </Box>
          ) : filtered.length === 0 ? (
            <Box style={{ padding: "32px 16px", textAlign: "center" }}>
              <SearchIcon style={{ fontSize: 36, color: "#ddd", display: "block", margin: "0 auto 10px" }} />
              <Typography variant="body2" color="textSecondary">
                Nenhum filtro encontrado para "{profileSearchText}"
              </Typography>
            </Box>
          ) : (
            filtered.map((profile) => {
              const isActive = activeProfile?.id === profile.id;
              const filterCount = profile.filters
                ? Object.values(profile.filters).filter((v) => Array.isArray(v) && v.length > 0).length
                : 0;
              return (
                <Box key={profile.id}>
                  <Divider style={{ margin: 0 }} />
                  <Box
                    onClick={() => { applyProfile(profile); setSavedFiltersDrawerOpen(false); setProfileSearchText(""); }}
                    style={{
                      display: "flex", alignItems: "center",
                      padding: "10px 16px",
                      cursor: "pointer",
                      backgroundColor: isActive ? "#e3f2fd" : "#fff",
                      transition: "background 0.1s",
                      minHeight: 52,
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "#f5f5f5"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isActive ? "#e3f2fd" : "#fff"; }}
                  >
                    {/* Barra de status */}
                    <Box style={{
                      width: 3, height: 28, borderRadius: 2,
                      backgroundColor: isActive ? "#1976d2" : "transparent",
                      marginRight: 10, flexShrink: 0,
                    }} />

                    {/* Conteúdo */}
                    <Box style={{ flex: 1, overflow: "hidden" }}>
                      <Typography style={{
                        fontSize: 13.5,
                        fontWeight: isActive ? 700 : 400,
                        color: isActive ? "#1565c0" : "#2c2c2c",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        lineHeight: 1.3,
                      }}>
                        {profile.name}
                        {isActive && <span style={{ marginLeft: 8, fontSize: 10, color: "#1976d2", fontWeight: 400 }}>• ativo</span>}
                      </Typography>
                      <Typography variant="caption" style={{ color: "#aaa", fontSize: 10.5 }}>
                        {filterCount > 0
                          ? `${filterCount} filtro${filterCount > 1 ? "s" : ""} de coluna`
                          : "Sem filtros de coluna"}
                        {profile.isDefault && <span style={{ marginLeft: 6, color: "#ffa000", fontWeight: 600 }}>• padrão</span>}
                      </Typography>
                    </Box>

                    {/* Ações */}
                    <Box style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 6, flexShrink: 0 }}>
                      <Tooltip title={profile.isDefault ? "Padrão" : "Definir como padrão"}>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleSetAsDefault(profile); }} style={{ padding: 4 }}>
                          {profile.isDefault
                            ? <StarIcon style={{ fontSize: 16, color: "#ffc107" }} />
                            : <StarBorderIcon style={{ fontSize: 16, color: "#bdbdbd" }} />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir filtro">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenDeleteDialog(profile); }} style={{ padding: 4 }}>
                          <DeleteIcon style={{ fontSize: 15, color: "#e57373" }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>

        {/* Rodapé: salvar novo filtro */}
        <Box className={classes.drawerFooter}>
          <Typography variant="caption" color="textSecondary" style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 11 }}>
            SALVAR CONFIGURAÇÃO ATUAL
          </Typography>
          <Box style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <TextField
              size="small" variant="outlined" placeholder="Nome do filtro..."
              value={quickSaveName}
              onChange={(e) => setQuickSaveName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleQuickSave()}
              style={{ flex: 1 }}
              inputProps={{ style: { padding: "7px 10px", fontSize: 13 } }}
            />
            <Button
              size="small" variant="contained" color="primary"
              onClick={handleQuickSave}
              disabled={!quickSaveName.trim() || savingQuick}
              style={{ whiteSpace: "nowrap", minWidth: 66, fontSize: 12, padding: "6px 14px" }}
            >
              {savingQuick ? <CircularProgress size={14} color="inherit" /> : "Salvar"}
            </Button>
          </Box>
          <Typography
            variant="caption"
            style={{ color: "#1976d2", cursor: "pointer", marginTop: 8, display: "block", fontSize: 11 }}
            onClick={() => handleOpenSaveDialog(false)}
          >
            ⚙ Opções avançadas (definir como padrão, etc.)
          </Typography>
        </Box>
      </Drawer>
    );
  };

  return (
    <div className={classes.mainContainer}>
        {/* Cabeçalho */}
        <Box className={classes.header}>
          <Typography variant="h5" style={{ fontWeight: 600 }}>
            Clientes ({totalCount})
          </Typography>
          <Button variant="contained" className={classes.addButton} startIcon={<AddIcon />} onClick={handleAddCliente}>
            Novo Cliente
          </Button>
        </Box>

        <Paper className={classes.tablePaper} variant="outlined">
          {/* Barra de busca global — sempre visível */}
          <Box style={{ marginBottom: 10 }}>
            <TextField
              fullWidth
              placeholder="Buscar por nome, razão social, CPF, CNPJ, código ERP, e-mail..."
              variant="outlined"
              size="small"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon style={{ color: searchInput ? "#1976d2" : "#aaa" }} />
                  </InputAdornment>
                ),
                endAdornment: searchInput ? (
                  <InputAdornment position="end">
                    <Tooltip title="Limpar busca">
                      <IconButton size="small" onClick={() => { setSearchInput(""); setSearchParam(""); }}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ) : null,
                style: { borderRadius: 8 },
              }}
            />
          </Box>

          {/* Chips de filtros ativos */}
          {(totalActiveFilters > 0 || searchParam) && (
            <Box style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10, alignItems: "center" }}>
              <Typography variant="caption" color="textSecondary" style={{ fontWeight: 600, fontSize: 11 }}>
                Filtros ativos:
              </Typography>
              {searchParam && (
                <Chip
                  label={`Busca: "${searchParam}"`}
                  size="small"
                  onDelete={() => { setSearchInput(""); setSearchParam(""); }}
                  style={{ height: 22, fontSize: 11, backgroundColor: "#e3f2fd", color: "#1565c0" }}
                />
              )}
              {Object.entries(columnFilters)
                .filter(([, v]) => Array.isArray(v) && v.length > 0)
                .map(([colId, vals]) => {
                  const colLabel = tableColumns.find((c) => c.id === colId)?.label || colId;
                  return (
                    <Chip
                      key={colId}
                      label={`${colLabel}: ${vals.slice(0, 2).join(", ")}${vals.length > 2 ? ` +${vals.length - 2}` : ""}`}
                      size="small"
                      onDelete={() => clearColumnFilter(colId)}
                      onClick={() => { setFilterDrawerOpen(true); setExpandedFilterCols((p) => ({ ...p, [colId]: true })); }}
                      style={{ height: 22, fontSize: 11, backgroundColor: "#e8f4fd", color: "#1565c0", cursor: "pointer" }}
                    />
                  );
                })}
              <Chip
                label="Limpar tudo"
                size="small"
                clickable
                onClick={() => { setSearchInput(""); setSearchParam(""); setColumnFilters({}); }}
                icon={<ClearIcon style={{ fontSize: 12 }} />}
                style={{ height: 22, fontSize: 11, backgroundColor: "#fff3e0", color: "#bf360c", border: "1px solid #bf360c" }}
              />
            </Box>
          )}

          {/* Toolbar */}
          <Box className={classes.tableToolbar}>
            <Box style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <Typography variant="caption" color="textSecondary">
                {loading && clientes.length === 0 ? "Buscando..." : `${sortedClientes.length} de ${totalCount} clientes`}
              </Typography>
              {activeProfile && (
                <Chip
                  label={activeProfile.name}
                  size="small"
                  icon={<StarIcon style={{ fontSize: 13 }} />}
                  onDelete={() => { setActiveProfile(null); setColumnFilters({}); setSortConfig({ key: null, direction: "asc" }); }}
                  color="primary"
                  variant="outlined"
                  style={{ height: 20, fontSize: 11 }}
                />
              )}
            </Box>

            <Box className={classes.actionButtons}>
              {/* Filtros */}
              <Badge badgeContent={totalActiveFilters} color="error" max={9}>
                <Button
                  size="small"
                  startIcon={<FilterListIcon />}
                  onClick={() => setFilterDrawerOpen(true)}
                  variant={totalActiveFilters > 0 ? "contained" : "outlined"}
                  color="primary"
                >
                  Filtros
                </Button>
              </Badge>

              {/* Colunas */}
              <Tooltip title="Mostrar/ocultar colunas">
                <Button size="small" startIcon={<ViewColumnIcon />} onClick={(e) => setColumnVisibilityMenuAnchor(e.currentTarget)} variant="outlined">
                  Colunas
                </Button>
              </Tooltip>

              {/* Filtros Salvos */}
              <Badge badgeContent={viewProfiles.length} color="primary" max={99}>
                <Button
                  size="small"
                  startIcon={activeProfile ? <StarIcon /> : <StarBorderIcon />}
                  onClick={() => { setProfileSearchText(""); setSavedFiltersDrawerOpen(true); }}
                  variant={activeProfile ? "contained" : "outlined"}
                  color="primary"
                  style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {activeProfile ? activeProfile.name : "Filtros Salvos"}
                </Button>
              </Badge>

              {/* Salvar */}
              <Tooltip title="Salvar configurações atuais">
                <Button size="small" startIcon={<SaveIcon />} onClick={() => handleOpenSaveDialog(false)} variant="outlined" color="primary">
                  Salvar
                </Button>
              </Tooltip>

              {/* Exportar */}
              <Tooltip title="Exportar dados">
                <Button size="small" startIcon={<GetAppIcon />} onClick={(e) => setExportMenuAnchor(e.currentTarget)} variant="outlined">
                  Exportar
                </Button>
              </Tooltip>

              {/* Atualizar */}
              <Tooltip title="Recarregar dados">
                <Button size="small" startIcon={<RefreshIcon />} onClick={resetAndFetch} variant="outlined" disabled={loading}>
                  Atualizar
                </Button>
              </Tooltip>

              {/* Resetar */}
              <Tooltip title="Resetar para o padrão">
                <Button size="small" onClick={handleResetTablePreferences} variant="outlined" color="secondary">
                  Resetar
                </Button>
              </Tooltip>
            </Box>
          </Box>

          {/* Menu de exportação */}
          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={() => setExportMenuAnchor(null)}
            getContentAnchorEl={null}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{ style: { minWidth: 210 } }}
          >
            <Box style={{ padding: "8px 14px 6px" }}>
              <Typography variant="caption" color="textSecondary" style={{ fontWeight: 600, fontSize: 11 }}>
                Exportar {sortedClientes.length} registros
              </Typography>
              <Typography variant="caption" color="textSecondary" style={{ display: "block", fontSize: 10 }}>
                Colunas visíveis + filtros ativos
              </Typography>
            </Box>
            <Divider />
            {[
              { label: "Excel (.xlsx)", desc: "Planilha com larguras automáticas", icon: <TableChartIcon style={{ fontSize: 20, color: "#217346" }} />, color: "#217346", fn: handleExportExcel },
              { label: "CSV (.csv)", desc: "Texto separado por ponto e vírgula", icon: <GetAppIcon style={{ fontSize: 20, color: "#455a64" }} />, color: "#455a64", fn: handleExportCSV },
              { label: "PDF (.pdf)", desc: "Paisagem, cabeçalho e paginação", icon: <PictureAsPdfIcon style={{ fontSize: 20, color: "#c62828" }} />, color: "#c62828", fn: handleExportPDF },
            ].map(({ label, desc, icon, color, fn }) => (
              <Box
                key={label}
                style={{ padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
                onClick={fn}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                {icon}
                <Box>
                  <Typography variant="body2" style={{ fontWeight: 600, color }}>{label}</Typography>
                  <Typography variant="caption" color="textSecondary" style={{ fontSize: 10 }}>{desc}</Typography>
                </Box>
              </Box>
            ))}
          </Menu>

          {/* Menu de colunas */}
          <Menu
            anchorEl={columnVisibilityMenuAnchor}
            open={Boolean(columnVisibilityMenuAnchor)}
            onClose={() => setColumnVisibilityMenuAnchor(null)}
            PaperProps={{ style: { maxHeight: 480, minWidth: 220 } }}
          >
            {tableColumns.map((col) => (
              <ListItem key={col.id} button onClick={() => toggleColumnVisibility(col.id)} style={{ padding: "4px 12px" }}>
                <Checkbox checked={col.visible} color="primary" size="small" />
                <ListItemText primary={col.label} primaryTypographyProps={{ variant: "body2", style: { fontSize: 13 } }} />
              </ListItem>
            ))}
          </Menu>

          {/* (Filtros Salvos agora é um Drawer — veja renderSavedFiltersDrawer abaixo) */}

          {/* Popover para filtro de coluna pelo ícone no cabeçalho da tabela */}
          <Popover
            open={Boolean(filterPopoverAnchor)}
            anchorEl={filterPopoverAnchor}
            onClose={handleCloseFilterMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            PaperProps={{ style: { maxHeight: 420, width: 310, padding: 16 } }}
          >
            {activeFilterColumn && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Typography variant="subtitle2" style={{ fontWeight: 600 }}>
                    Filtrar: {tableColumns.find((c) => c.id === activeFilterColumn)?.label}
                  </Typography>
                  <Button size="small" onClick={() => clearColumnFilter(activeFilterColumn)} color="secondary" style={{ minWidth: "auto", padding: "2px 8px", fontSize: 11 }}>
                    Limpar
                  </Button>
                </Box>
                <Divider style={{ marginBottom: 10 }} />
                <TextField
                  fullWidth size="small" variant="outlined" placeholder="Buscar valor..."
                  value={filterSearchText} onChange={(e) => setFilterSearchText(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                  style={{ marginBottom: 10 }}
                />
                <Typography variant="caption" color="textSecondary" style={{ display: "block", marginBottom: 6 }}>
                  {(columnFilters[activeFilterColumn] || []).length > 0
                    ? `${(columnFilters[activeFilterColumn] || []).length} selecionados`
                    : `${getUniqueColumnValues(activeFilterColumn, filterSearchText).length} opções`}
                </Typography>
                <List dense style={{ maxHeight: 280, overflow: "auto" }}>
                  {getUniqueColumnValues(activeFilterColumn, filterSearchText).map((value, idx) => {
                    const isChecked = (columnFilters[activeFilterColumn] || []).includes(value);
                    return (
                      <ListItem key={idx} button onClick={() => toggleFilterValue(activeFilterColumn, value)}
                        style={{ padding: "3px 6px", borderRadius: 4, marginBottom: 2, backgroundColor: isChecked ? "#e3f2fd" : "transparent" }}>
                        <Checkbox edge="start" checked={isChecked} tabIndex={-1} disableRipple color="primary" size="small" style={{ padding: "2px 6px" }} />
                        <ListItemText primary={value} primaryTypographyProps={{ variant: "body2", style: { fontWeight: isChecked ? 600 : 400, fontSize: 13 } }} />
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            )}
          </Popover>

          {/* ===== TABELA ===== */}
          <TableContainer ref={tableContainerRef} style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
            <DragDropContext onDragEnd={handleColumnDragEnd}>
              <Table stickyHeader size="small">
                <Droppable droppableId="table-columns" direction="horizontal">
                  {(provided) => (
                    <TableHead ref={provided.innerRef} {...provided.droppableProps} className={classes.tableHeader}>
                      <TableRow>
                        {tableColumns.filter((col) => col.visible).map((column, index) => (
                          <Draggable key={column.id} draggableId={column.id} index={index}>
                            {(provided, snapshot) => (
                              <TableCell
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={classes.tableHeaderCell}
                                style={{
                                  ...provided.draggableProps.style,
                                  backgroundColor: snapshot.isDragging ? "#e3f2fd" : "#f5f5f5",
                                  width: column.width, minWidth: column.width, padding: "10px 12px",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center" }}>
                                  <span {...provided.dragHandleProps} className={classes.dragHandle}>
                                    <DragIndicatorIcon style={{ fontSize: 16 }} />
                                  </span>
                                  <div style={{ flex: 1, cursor: column.sortable ? "pointer" : "default" }} onClick={() => column.sortable && handleSort(column.id)}>
                                    <strong style={{ fontSize: 12 }}>{column.label}</strong>
                                    {column.sortable && sortConfig.key === column.id &&
                                      (sortConfig.direction === "asc"
                                        ? <ArrowUpward className={classes.sortIcon} />
                                        : <ArrowDownward className={classes.sortIcon} />)}
                                  </div>
                                  {column.filterable && (
                                    <Tooltip title="Mais filtros para esta coluna">
                                      <IconButton size="small" onClick={(e) => handleOpenFilterMenu(e, column.id)}
                                        style={{ padding: 3, color: (columnFilters[column.id] || []).length > 0 ? "#1976d2" : "#bbb" }}>
                                        <FilterListIcon style={{ fontSize: 14 }} />
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
                      <TableCell colSpan={tableColumns.filter((c) => c.visible).length} align="center">
                        <Box className={classes.loadingRow}><CircularProgress size={24} /><Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>Carregando clientes...</Typography></Box>
                      </TableCell>
                    </TableRow>
                  ) : sortedClientes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={tableColumns.filter((c) => c.visible).length} align="center">
                        <Box className={classes.emptyState}>
                          <BusinessIcon style={{ fontSize: 48, opacity: 0.3, marginBottom: 16 }} />
                          <Typography variant="body1" color="textSecondary">Nenhum cliente encontrado</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {totalActiveFilters > 0 ? "Ajuste os filtros ou clique em 'Limpar tudo'" : "Clique em 'Novo Cliente' para começar"}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedClientes.map((cliente) => (
                      <TableRow key={cliente.id} hover>
                        {tableColumns.filter((col) => col.visible).map((column) => (
                          <TableCell
                            key={`${cliente.id}-${column.id}`}
                            style={{ width: column.width, minWidth: column.width, maxWidth: column.width, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: "6px 12px", fontSize: 13 }}
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

          {loadingMore && (
            <Box className={classes.loadingRow}><CircularProgress size={22} /><Typography variant="body2" color="textSecondary" style={{ marginTop: 6 }}>Carregando mais...</Typography></Box>
          )}
          {!hasMore && clientes.length > 0 && (
            <Box style={{ textAlign: "center", padding: "8px 16px" }}>
              <Typography variant="caption" color="textSecondary">Todos os {totalCount} clientes carregados</Typography>
            </Box>
          )}
        </Paper>

      {/* Drawer de Filtros — painel lateral direito */}
      {renderFilterDrawer()}

      {/* Drawer de Filtros Salvos — painel lateral direito */}
      {renderSavedFiltersDrawer()}

      {/* Modal confirmação exclusão */}
      <ConfirmationModal title="Excluir Cliente" open={confirmModalOpen} onClose={handleCancelDelete} onConfirm={handleConfirmDelete}>
        Tem certeza que deseja excluir o cliente <strong>{deletingCliente?.nome || deletingCliente?.razaoSocial}</strong>? Esta ação não pode ser desfeita.
      </ConfirmationModal>

      {/* Dialog: Salvar Filtro */}
      <Dialog open={saveProfileDialogOpen} onClose={handleCloseSaveDialog} maxWidth="sm" fullWidth>
        <DialogTitle style={{ borderBottom: "1px solid #e0e0e0", paddingBottom: 12 }}>
          <Box display="flex" alignItems="center"><SaveIcon style={{ color: "#1976d2", marginRight: 8 }} />
            {activeProfile && profileName === activeProfile.name ? `Atualizar "${activeProfile.name}"` : "Salvar Filtro"}
          </Box>
        </DialogTitle>
        <DialogContent style={{ paddingTop: 20 }}>
          <TextField
            autoFocus fullWidth label="Nome do filtro" variant="outlined"
            value={profileName} onChange={(e) => setProfileName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSaveProfile()}
            placeholder="Ex: Clientes Ativos SP, Clientes PJ..." helperText="Escolha um nome descritivo"
            style={{ marginBottom: 18 }}
          />
          <Box style={{ backgroundColor: "#f8f9fa", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
            <Typography variant="caption" color="textSecondary" style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>O que será salvo:</Typography>
            <Box style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {searchParam && <Typography variant="caption">• Busca: <strong>"{searchParam}"</strong></Typography>}
              {Object.entries(columnFilters).filter(([, v]) => Array.isArray(v) && v.length > 0).map(([col, vals]) => (
                <Typography key={col} variant="caption">
                  • <strong>{tableColumns.find((c) => c.id === col)?.label || col}</strong>: {vals.slice(0, 3).join(", ")}{vals.length > 3 ? ` +${vals.length - 3}` : ""}
                </Typography>
              ))}
              {sortConfig.key && <Typography variant="caption">• Ordenação: <strong>{tableColumns.find((c) => c.id === sortConfig.key)?.label} {sortConfig.direction === "asc" ? "↑" : "↓"}</strong></Typography>}
              <Typography variant="caption">• {tableColumns.filter((c) => c.visible).length} colunas visíveis</Typography>
            </Box>
          </Box>
          <FormControlLabel
            control={<Switch checked={setAsDefault} onChange={(e) => setSetAsDefault(e.target.checked)} color="primary" />}
            label={<Box><Typography variant="body2">Definir como filtro padrão</Typography><Typography variant="caption" color="textSecondary">Carregado automaticamente ao abrir esta tela</Typography></Box>}
          />
        </DialogContent>
        <DialogActions style={{ borderTop: "1px solid #e0e0e0", padding: "12px 24px" }}>
          <Button onClick={handleCloseSaveDialog}>Cancelar</Button>
          <Button onClick={handleSaveProfile} color="primary" variant="contained" startIcon={<SaveIcon />}>Salvar Filtro</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Confirmar exclusão de filtro */}
      <Dialog open={deleteProfileDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Excluir Filtro Salvo</DialogTitle>
        <DialogContent>
          <DialogContentText>Tem certeza que deseja excluir o filtro <strong>"{profileToDelete?.name}"</strong>? Esta ação não pode ser desfeita.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleDeleteProfile} color="secondary" variant="contained">Excluir</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Clientes;
