import React, { useState, useEffect, useReducer, useContext, useCallback, useRef, useMemo } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Avatar, Badge, Box, Button, Checkbox, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, Drawer, FormControlLabel, IconButton,
  InputAdornment, List, ListItem, ListItemText, Menu, MenuItem, Paper, Switch,
  Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography,
} from "@material-ui/core";
import {
  AccountCircle, Assignment, Clear as ClearIcon, DeleteOutline as DeleteOutlineIcon,
  Description, Edit as EditIcon, ExpandLess, ExpandMore, FilterList as FilterListIcon,
  MoreVert as MoreVertIcon, Refresh as RefreshIcon, Save as SaveIcon, Search as SearchIcon,
  Star, StarBorder, ViewColumn as ViewColumnIcon, GetApp as GetAppIcon,
  PictureAsPdf as PictureAsPdfIcon, TableChart as TableChartIcon,
  DragIndicator as DragIndicatorIcon,
} from "@material-ui/icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import whatsappIcon from "../../assets/nopicture.png";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import UserModal from "../../components/UserModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { socketConnection } from "../../services/socket";
import { getBackendUrl } from "../../config";
import { AuthContext } from "../../context/Auth/AuthContext";

const backendUrl = getBackendUrl();

const DEFAULT_COLUMNS = [
  { id: "id", label: "ID", visible: true, filterable: true, sortable: true, width: 70 },
  { id: "name", label: "Usuário", visible: true, filterable: true, sortable: true, width: 260 },
  { id: "email", label: "E-mail", visible: false, filterable: true, sortable: true, width: 220 },
  { id: "profile", label: "Perfil", visible: true, filterable: true, sortable: true, width: 120 },
  { id: "isActive", label: "Status", visible: true, filterable: true, sortable: true, width: 110 },
  { id: "departamentos", label: "Departamentos", visible: true, filterable: true, sortable: false, width: 240 },
  { id: "online", label: "Presença", visible: true, filterable: true, sortable: true, width: 110 },
  { id: "startWork", label: "Início", visible: false, filterable: true, sortable: true, width: 100 },
  { id: "endWork", label: "Fim", visible: false, filterable: true, sortable: true, width: 100 },
  { id: "workHours", label: "Horário", visible: true, filterable: true, sortable: false, width: 130 },
  { id: "actions", label: "Ações", visible: true, filterable: false, sortable: false, width: 90 },
];

const reducer = (state, action) => {
  if (action.type === "LOAD_USERS") {
    const existingIds = new Set(state.map((u) => u.id));
    return [...state, ...action.payload.filter((u) => !existingIds.has(u.id))];
  }
  if (action.type === "UPDATE_USERS") {
    const idx = state.findIndex((u) => u.id === action.payload.id);
    if (idx === -1) return [action.payload, ...state];
    return [...state.slice(0, idx), action.payload, ...state.slice(idx + 1)];
  }
  if (action.type === "DELETE_USER") return state.filter((u) => u.id !== action.payload);
  if (action.type === "RESET") return [];
  return state;
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
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "auto",
    overflowX: "auto",
    width: "100%",
    boxSizing: "border-box",
    borderRadius: 10,
    ...theme.scrollbarStyles,
  },
  searchField: { minWidth: 240 },
  toolbarButton: { minWidth: 36 },
  tableHead: {
    "& th": {
      backgroundColor: theme.palette.type === "dark" ? theme.palette.grey[800] : theme.palette.grey[100],
      fontWeight: 600,
      fontSize: "0.78rem",
      borderBottom: `2px solid ${theme.palette.divider}`,
      whiteSpace: "nowrap",
      cursor: "default",
    },
  },
  sortableHeader: { cursor: "pointer", userSelect: "none" },
  dragHandle: { display: "inline-flex", alignItems: "center", marginRight: 6, color: theme.palette.text.secondary, cursor: "grab" },
  tableRow: { "&:hover": { backgroundColor: theme.palette.type === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" } },
  userCell: { display: "flex", alignItems: "center", gap: 10, textAlign: "left", minWidth: 220 },
  avatarWrapper: { position: "relative", display: "inline-flex", flexShrink: 0 },
  userAvatar: { width: 36, height: 36 },
  statusDot: { position: "absolute", bottom: 0, right: 0, width: 11, height: 11, borderRadius: "50%", border: `2px solid ${theme.palette.background.paper}` },
  statusOnline: { backgroundColor: "#43a047" },
  statusOffline: { backgroundColor: "#9e9e9e" },
  userName: { fontWeight: 600, fontSize: "0.85rem", lineHeight: 1.3 },
  userEmail: { fontSize: "0.75rem", color: theme.palette.text.secondary, lineHeight: 1.3 },
  departamentosCell: { display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center", maxWidth: 240 },
  deptChip: { fontSize: 11 },
  actionButtons: { display: "flex", alignItems: "center", justifyContent: "center", gap: 2 },
  deleteMenuItem: { color: theme.palette.error.main },
  drawerPaper: { width: 400, maxWidth: "95vw", display: "flex", flexDirection: "column", height: "100%" },
  drawerHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", backgroundColor: "#1976d2", color: "#fff" },
  drawerSearch: { padding: "10px 14px", borderBottom: "1px solid #ebebeb" },
  drawerList: { flex: 1, overflowY: "auto" },
  drawerFooter: { padding: 12, borderTop: "1px solid #e0e0e0", backgroundColor: "#f7f9fc" },
}));

const mergeWithDefaultColumns = (savedColumns) => {
  if (!Array.isArray(savedColumns)) return DEFAULT_COLUMNS;
  const savedIds = new Set(savedColumns.map((c) => c.id));
  const missing = DEFAULT_COLUMNS.filter((c) => !savedIds.has(c.id));
  const merged = savedColumns.map((col) => ({ ...DEFAULT_COLUMNS.find((d) => d.id === col.id), ...col }));
  const actionsIndex = merged.findIndex((c) => c.id === "actions");
  if (actionsIndex === -1) return [...merged, ...missing];
  return [...merged.slice(0, actionsIndex), ...missing, ...merged.slice(actionsIndex)];
};

const Users = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user: loggedInUser } = useContext(AuthContext);
  const { profileImage } = loggedInUser;
  const scrollTimeoutRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [users, dispatch] = useReducer(reducer, []);
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" });
  const [tableColumns, setTableColumns] = useState(DEFAULT_COLUMNS);
  const [columnFilters, setColumnFilters] = useState({});
  const [columnMenuAnchor, setColumnMenuAnchor] = useState(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [panelFilterSearch, setPanelFilterSearch] = useState("");
  const [expandedFilterCols, setExpandedFilterCols] = useState({});
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [actionUser, setActionUser] = useState(null);
  const [viewProfiles, setViewProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [profileName, setProfileName] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [saveProfileDialogOpen, setSaveProfileDialogOpen] = useState(false);

  const loadLocalPreferences = useCallback(() => {
    const saved = localStorage.getItem(`users_table_prefs_${loggedInUser.id}`);
    if (!saved) return;
    const prefs = JSON.parse(saved);
    if (prefs.columns) setTableColumns(mergeWithDefaultColumns(prefs.columns));
    if (prefs.columnFilters) setColumnFilters(prefs.columnFilters);
    if (prefs.sortConfig) setSortConfig(prefs.sortConfig);
  }, [loggedInUser.id]);

  const loadViewProfiles = useCallback(async () => {
    try {
      const { data } = await api.get("/users-view-preferences");
      setViewProfiles(data);
      const defaultProfile = data.find((p) => p.isDefault);
      if (defaultProfile) {
        setActiveProfile(defaultProfile);
        if (defaultProfile.columns) setTableColumns(mergeWithDefaultColumns(defaultProfile.columns));
        if (defaultProfile.filters) setColumnFilters(defaultProfile.filters);
        if (defaultProfile.sortConfig) setSortConfig(defaultProfile.sortConfig);
      } else {
        loadLocalPreferences();
      }
    } catch (_) {
      loadLocalPreferences();
    }
  }, [loadLocalPreferences]);

  useEffect(() => { loadViewProfiles(); }, [loadViewProfiles]);
  useEffect(() => {
    localStorage.setItem(`users_table_prefs_${loggedInUser.id}`, JSON.stringify({ columns: tableColumns, columnFilters, sortConfig }));
  }, [loggedInUser.id, tableColumns, columnFilters, sortConfig]);
  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam, sortConfig.key, sortConfig.direction]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get("/users/", {
          params: { searchParam, pageNumber, orderBy: sortConfig.key || "id", order: sortConfig.direction || "desc" },
        });
        dispatch({ type: "LOAD_USERS", payload: data.users });
        setHasMore(data.hasMore);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchParam, pageNumber, sortConfig.key, sortConfig.direction]);

  useEffect(() => {
    const companyId = loggedInUser.companyId;
    const socket = socketConnection({ companyId, userId: loggedInUser.id });
    socket.on(`company-${companyId}-user`, (data) => {
      if (data.action === "update" || data.action === "create") dispatch({ type: "UPDATE_USERS", payload: data.user });
      if (data.action === "delete") dispatch({ type: "DELETE_USER", payload: +data.userId });
    });
    return () => socket.disconnect();
  }, [loggedInUser]);

  const getCellValue = useCallback((user, columnId) => {
    switch (columnId) {
      case "id": return user.id;
      case "name": return user.name || "-";
      case "email": return user.email || "-";
      case "profile": return user.profile || "-";
      case "isActive": return user.isActive === false ? "Inativo" : "Ativo";
      case "departamentos": return user.departamentos?.map((d) => d.nome).join(", ") || "-";
      case "online": return user.online ? "Online" : "Offline";
      case "startWork": return user.startWork || "--:--";
      case "endWork": return user.endWork || "--:--";
      case "workHours": return `${user.startWork || "--:--"} - ${user.endWork || "--:--"}`;
      default: return "-";
    }
  }, []);

  const filteredUsers = useMemo(() => users.filter((user) => {
    for (const [colId, vals] of Object.entries(columnFilters)) {
      if (!Array.isArray(vals) || vals.length === 0) continue;
      if (!vals.includes(String(getCellValue(user, colId)).trim())) return false;
    }
    return true;
  }), [users, columnFilters, getCellValue]);

  const getUniqueColumnValues = (columnId) => {
    const q = panelFilterSearch.toLowerCase();
    return [...new Set(users.map((u) => String(getCellValue(u, columnId)).trim()).filter((v) => v && v !== "-"))]
      .filter((v) => !q || v.toLowerCase().includes(q))
      .sort((a, b) => a.localeCompare(b, "pt-BR"));
  };

  const handleSort = (column) => {
    if (!column.sortable) return;
    setSortConfig((prev) => prev.key === column.id
      ? { key: column.id, direction: prev.direction === "asc" ? "desc" : "asc" }
      : { key: column.id, direction: "asc" });
  };

  const toggleFilterValue = (columnId, value) => {
    setColumnFilters((prev) => {
      const current = Array.isArray(prev[columnId]) ? prev[columnId] : [];
      return { ...prev, [columnId]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] };
    });
  };

  const handleColumnDragEnd = (result) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    const visibleCols = tableColumns.filter((col) => col.visible);
    const reordered = Array.from(visibleCols);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    let visibleIndex = 0;
    setTableColumns((prev) => prev.map((col) => col.visible ? reordered[visibleIndex++] : col));
  };

  const applyProfile = (profile) => {
    setActiveProfile(profile);
    if (profile.columns) setTableColumns(mergeWithDefaultColumns(profile.columns));
    if (profile.filters) setColumnFilters(profile.filters);
    if (profile.sortConfig) setSortConfig(profile.sortConfig);
    toast.success(`Perfil "${profile.name}" aplicado!`);
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) return toast.error("Digite um nome para o perfil");
    try {
      const payload = { name: profileName.trim(), columns: tableColumns, filters: columnFilters, sortConfig, isDefault: setAsDefault };
      const { data } = activeProfile?.id
        ? await api.put(`/users-view-preferences/${activeProfile.id}`, payload)
        : await api.post("/users-view-preferences", payload);
      setActiveProfile(data);
      toast.success(activeProfile?.id ? "Perfil atualizado!" : "Perfil salvo!");
      setSaveProfileDialogOpen(false);
      setProfileName("");
      setSetAsDefault(false);
      await loadViewProfiles();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erro ao salvar perfil");
    }
  };

  const handleSetAsDefault = async (profile) => {
    try {
      await api.patch(`/users-view-preferences/${profile.id}/set-default`);
      toast.success(`"${profile.name}" definido como padrão!`);
      await loadViewProfiles();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erro ao definir padrão");
    }
  };

  const handleDeleteProfile = async (profile) => {
    try {
      await api.delete(`/users-view-preferences/${profile.id}`);
      if (activeProfile?.id === profile.id) setActiveProfile(null);
      toast.success(`Perfil "${profile.name}" excluído!`);
      await loadViewProfiles();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erro ao excluir perfil");
    }
  };

  const handleResetTablePreferences = () => {
    setTableColumns(DEFAULT_COLUMNS);
    setColumnFilters({});
    setSortConfig({ key: "id", direction: "desc" });
    setActiveProfile(null);
    localStorage.removeItem(`users_table_prefs_${loggedInUser.id}`);
    toast.success("Preferências resetadas!");
  };

  const handleExportExcel = () => {
    try {
      const XLSX = require("xlsx");
      const visibleCols = tableColumns.filter((c) => c.visible && c.id !== "actions");
      const wsData = [
        visibleCols.map((c) => c.label),
        ...filteredUsers.map((row) => visibleCols.map((col) => {
          const value = getCellValue(row, col.id);
          return value === "-" ? "" : value;
        })),
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws["!cols"] = visibleCols.map((c) => ({ wch: Math.min(Math.max(c.label.length + 8, 12), 45) }));
      ws["!views"] = [{ state: "frozen", xSplit: 0, ySplit: 1 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Usuários");
      XLSX.writeFile(wb, `usuarios_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.xlsx`);
      toast.success("Excel exportado com sucesso!");
      setExportMenuAnchor(null);
    } catch (_) {
      toast.error("Erro ao exportar Excel");
    }
  };

  const handleExportPDF = () => {
    try {
      const { jsPDF } = require("jspdf");
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const visibleCols = tableColumns.filter((c) => c.visible && c.id !== "actions");
      const margin = 10;
      const pageWidth = 297;
      const tableWidth = pageWidth - margin * 2;
      const colWidth = tableWidth / Math.max(visibleCols.length, 1);
      let y = 12;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Relatório de Usuários", margin, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")} | Registros: ${filteredUsers.length}`, margin, y);
      y += 7;

      const drawHeader = () => {
        doc.setFillColor(25, 118, 210);
        doc.rect(margin, y, tableWidth, 7, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        visibleCols.forEach((col, index) => doc.text(String(col.label).slice(0, 22), margin + index * colWidth + 2, y + 4.6));
        doc.setTextColor(0, 0, 0);
        y += 7;
      };

      drawHeader();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      filteredUsers.forEach((row) => {
        if (y > 190) {
          doc.addPage();
          y = 12;
          drawHeader();
        }
        visibleCols.forEach((col, index) => {
          const text = String(getCellValue(row, col.id) || "").slice(0, 34);
          doc.text(text === "-" ? "" : text, margin + index * colWidth + 2, y + 4.5);
        });
        y += 6.5;
      });
      doc.save(`usuarios_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`);
      toast.success("PDF exportado com sucesso!");
      setExportMenuAnchor(null);
    } catch (_) {
      toast.error("Erro ao exportar PDF");
    }
  };

  const renderProfileImage = useCallback((user) => {
    if (user.id === loggedInUser.id) {
      return <Avatar src={`${backendUrl}/public/company${user.companyId}/user/${profileImage || whatsappIcon}`} alt={user.name} className={classes.userAvatar} />;
    }
    if (user.id !== loggedInUser.id) {
      return <Avatar src={user.profileImage ? `${backendUrl}/public/company${user.companyId}/user/${user.profileImage}` : whatsappIcon} alt={user.name} className={classes.userAvatar} />;
    }
    return <AccountCircle />;
  }, [loggedInUser.id, profileImage, classes.userAvatar]);

  const renderCellContent = (user, columnId) => {
    if (columnId === "name") {
      return (
        <div className={classes.userCell}>
          <div className={classes.avatarWrapper}>
            {renderProfileImage(user)}
            <Tooltip title={user.online ? "Online" : "Offline"}>
              <span className={`${classes.statusDot} ${user.online ? classes.statusOnline : classes.statusOffline}`} />
            </Tooltip>
          </div>
          <div><div className={classes.userName}>{user.name}</div><div className={classes.userEmail}>{user.email}</div></div>
        </div>
      );
    }
    if (columnId === "profile") return <Chip label={user.profile} size="small" color={user.profile === "admin" ? "primary" : "default"} variant={user.profile === "admin" ? "default" : "outlined"} />;
    if (columnId === "isActive") return <Chip label={user.isActive === false ? "Inativo" : "Ativo"} size="small" color={user.isActive === false ? "default" : "primary"} variant={user.isActive === false ? "outlined" : "default"} />;
    if (columnId === "departamentos") {
      return user.departamentos?.length ? (
        <div className={classes.departamentosCell}>
          {user.departamentos.map((dept) => (
            <Chip key={dept.id} label={dept.nome} size="small" color={dept.DepartamentoUsuario?.isCoordenador ? "primary" : "default"} icon={dept.DepartamentoUsuario?.isCoordenador ? <Star style={{ fontSize: 12 }} /> : undefined} className={classes.deptChip} />
          ))}
        </div>
      ) : <Typography variant="caption" color="textSecondary">-</Typography>;
    }
    if (columnId === "online") return <Chip label={user.online ? "Online" : "Offline"} size="small" color={user.online ? "primary" : "default"} variant="outlined" />;
    if (columnId === "actions") {
      return (
        <div className={classes.actionButtons}>
          <Tooltip title="Editar Usuário"><IconButton size="small" onClick={() => { setSelectedUser(user); setUserModalOpen(true); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Mais ações"><IconButton size="small" onClick={(e) => { setActionAnchorEl(e.currentTarget); setActionUser(user); }}><MoreVertIcon fontSize="small" /></IconButton></Tooltip>
        </div>
      );
    }
    return getCellValue(user, columnId);
  };

  const loadMore = useCallback(() => {
    if (!loading && hasMore) setPageNumber((prev) => prev + 1);
  }, [loading, hasMore]);

  const handleScroll = useCallback((e) => {
    if (!hasMore || loading) return;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (scrollTop + clientHeight >= scrollHeight - 5) loadMore();
    }, 100);
  }, [hasMore, loading, loadMore]);

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      toast.success(i18n.t("users.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingUser(null);
    dispatch({ type: "RESET" });
    setPageNumber(1);
  };

  const visibleColumns = tableColumns.filter((c) => c.visible);
  const totalActiveFilters = Object.values(columnFilters).filter((v) => Array.isArray(v) && v.length > 0).length;

  return (
    <div className={classes.mainContainer}>
      <ConfirmationModal title={deletingUser && `${i18n.t("users.confirmationModal.deleteTitle")} ${deletingUser.name}?`} open={confirmModalOpen} onClose={setConfirmModalOpen} onConfirm={() => handleDeleteUser(deletingUser.id)}>
        {i18n.t("users.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <UserModal open={userModalOpen} onClose={() => { setSelectedUser(null); setUserModalOpen(false); }} aria-labelledby="form-dialog-title" userId={selectedUser && selectedUser.id} />
      <Menu anchorEl={actionAnchorEl} open={Boolean(actionAnchorEl)} onClose={() => { setActionAnchorEl(null); setActionUser(null); }} keepMounted>
        <MenuItem onClick={() => { history.push(`/users/perfil-cargo/${actionUser.id}`); setActionAnchorEl(null); }}><Assignment fontSize="small" color="primary" style={{ marginRight: 12 }} />Perfil de Cargo</MenuItem>
        <MenuItem onClick={() => { history.push(`/users/holerites/${actionUser.id}`); setActionAnchorEl(null); }}><Description fontSize="small" style={{ marginRight: 12 }} />Holerites</MenuItem>
        <Divider />
        <MenuItem className={classes.deleteMenuItem} onClick={() => { setConfirmModalOpen(true); setDeletingUser(actionUser); setActionAnchorEl(null); }}><DeleteOutlineIcon fontSize="small" style={{ marginRight: 12 }} />Deletar Usuário</MenuItem>
      </Menu>

      <MainHeader>
        <Title>{i18n.t("users.title")} ({filteredUsers.length})</Title>
        <MainHeaderButtonsWrapper>
          <TextField className={classes.searchField} placeholder={i18n.t("contacts.searchPlaceholder")} type="search" value={searchParam} onChange={(e) => setSearchParam(e.target.value.toLowerCase())} variant="outlined" size="small" InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon style={{ color: "gray" }} /></InputAdornment> }} />
          <Tooltip title="Filtros"><IconButton className={classes.toolbarButton} onClick={() => setFilterDrawerOpen(true)}><Badge badgeContent={totalActiveFilters} color="primary"><FilterListIcon /></Badge></IconButton></Tooltip>
          <Tooltip title="Colunas"><IconButton className={classes.toolbarButton} onClick={(e) => setColumnMenuAnchor(e.currentTarget)}><ViewColumnIcon /></IconButton></Tooltip>
          <Tooltip title="Salvar perfil"><IconButton className={classes.toolbarButton} onClick={() => { setProfileName(activeProfile?.name || ""); setSetAsDefault(activeProfile?.isDefault || false); setSaveProfileDialogOpen(true); }}><SaveIcon /></IconButton></Tooltip>
          <Tooltip title="Exportar"><IconButton className={classes.toolbarButton} onClick={(e) => setExportMenuAnchor(e.currentTarget)}><GetAppIcon /></IconButton></Tooltip>
          <Tooltip title="Resetar"><IconButton className={classes.toolbarButton} onClick={handleResetTablePreferences}><RefreshIcon /></IconButton></Tooltip>
          <Button variant="contained" color="primary" onClick={() => { setSelectedUser(null); setUserModalOpen(true); }}>{i18n.t("users.buttons.add")}</Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined" onScroll={handleScroll}>
        <DragDropContext onDragEnd={handleColumnDragEnd}>
        <Table size="small" stickyHeader>
          <Droppable droppableId="users-table-columns" direction="horizontal">
            {(provided) => (
              <TableHead ref={provided.innerRef} {...provided.droppableProps} className={classes.tableHead}>
                <TableRow>
                  {visibleColumns.map((column, index) => (
                    <Draggable key={column.id} draggableId={column.id} index={index}>
                      {(dragProvided, snapshot) => (
                        <TableCell
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          key={column.id}
                          align={column.id === "name" ? "left" : "center"}
                          style={{ ...dragProvided.draggableProps.style, minWidth: column.width, backgroundColor: snapshot.isDragging ? "#e3f2fd" : undefined }}
                          className={column.sortable ? classes.sortableHeader : undefined}
                        >
                          <Box display="flex" alignItems="center" justifyContent={column.id === "name" ? "flex-start" : "center"}>
                            <span {...dragProvided.dragHandleProps} className={classes.dragHandle}><DragIndicatorIcon style={{ fontSize: 16 }} /></span>
                            <span onClick={() => handleSort(column)}>{column.label}{column.sortable && sortConfig.key === column.id ? (sortConfig.direction === "asc" ? " ↑" : " ↓") : ""}</span>
                          </Box>
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
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className={classes.tableRow}>
                {visibleColumns.map((column) => <TableCell key={column.id} align={column.id === "name" ? "left" : "center"}>{renderCellContent(user, column.id)}</TableCell>)}
              </TableRow>
            ))}
            {loading && <TableRowSkeleton columns={visibleColumns.length} avatar />}
          </TableBody>
        </Table>
        </DragDropContext>
      </Paper>

      <Menu anchorEl={exportMenuAnchor} open={Boolean(exportMenuAnchor)} onClose={() => setExportMenuAnchor(null)}>
        <MenuItem disabled>Exportar {filteredUsers.length} registros</MenuItem>
        <Divider />
        <MenuItem onClick={handleExportExcel}><TableChartIcon style={{ marginRight: 10, color: "#217346" }} />Excel (.xlsx)</MenuItem>
        <MenuItem onClick={handleExportPDF}><PictureAsPdfIcon style={{ marginRight: 10, color: "#c62828" }} />PDF (.pdf)</MenuItem>
      </Menu>

      <Menu anchorEl={columnMenuAnchor} open={Boolean(columnMenuAnchor)} onClose={() => setColumnMenuAnchor(null)}>
        {tableColumns.filter((c) => c.id !== "actions").map((column) => (
          <MenuItem key={column.id} onClick={() => setTableColumns((prev) => prev.map((c) => c.id === column.id ? { ...c, visible: !c.visible } : c))}>
            <Checkbox checked={column.visible} color="primary" /><ListItemText primary={column.label} />
          </MenuItem>
        ))}
      </Menu>

      <Drawer anchor="right" open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)} classes={{ paper: classes.drawerPaper }}>
        <Box className={classes.drawerHeader}><Typography variant="subtitle1">Filtros de usuários</Typography><IconButton size="small" onClick={() => setFilterDrawerOpen(false)} style={{ color: "#fff" }}><ClearIcon /></IconButton></Box>
        <Box className={classes.drawerSearch}><TextField fullWidth size="small" variant="outlined" placeholder="Buscar filtros" value={panelFilterSearch} onChange={(e) => setPanelFilterSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} /></Box>
        <List className={classes.drawerList}>
          {tableColumns.filter((c) => c.filterable).map((column) => {
            const values = getUniqueColumnValues(column.id);
            const active = columnFilters[column.id] || [];
            if (panelFilterSearch && values.length === 0 && !column.label.toLowerCase().includes(panelFilterSearch.toLowerCase())) return null;
            const expanded = expandedFilterCols[column.id] || active.length > 0 || !!panelFilterSearch;
            return (
              <Box key={column.id}>
                <ListItem button onClick={() => setExpandedFilterCols((prev) => ({ ...prev, [column.id]: !prev[column.id] }))}>
                  <ListItemText primary={column.label} secondary={active.length ? `${active.length} selecionado(s)` : `${values.length} opções`} />{expanded ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                {expanded && values.slice(0, 150).map((value) => (
                  <ListItem dense button key={`${column.id}-${value}`} onClick={() => toggleFilterValue(column.id, value)}>
                    <Checkbox checked={active.includes(value)} color="primary" /><ListItemText primary={value} />
                  </ListItem>
                ))}
                <Divider />
              </Box>
            );
          })}
        </List>
        <Box className={classes.drawerFooter}><Button fullWidth variant="outlined" startIcon={<ClearIcon />} onClick={() => setColumnFilters({})}>Limpar filtros</Button></Box>
      </Drawer>

      <Dialog open={saveProfileDialogOpen} onClose={() => setSaveProfileDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Salvar visualização</DialogTitle>
        <DialogContent>
          <TextField fullWidth autoFocus margin="dense" label="Nome do perfil" value={profileName} onChange={(e) => setProfileName(e.target.value)} variant="outlined" />
          <FormControlLabel control={<Switch checked={setAsDefault} onChange={(e) => setSetAsDefault(e.target.checked)} color="primary" />} label="Definir como padrão" />
          {viewProfiles.length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle2">Perfis salvos</Typography>
              {viewProfiles.map((profile) => (
                <Box key={profile.id} display="flex" alignItems="center" justifyContent="space-between" py={0.5}>
                  <Button size="small" onClick={() => applyProfile(profile)}>{profile.isDefault ? <Star fontSize="small" /> : <StarBorder fontSize="small" />} {profile.name}</Button>
                  <Box><Button size="small" onClick={() => handleSetAsDefault(profile)}>Padrão</Button><Button size="small" color="secondary" onClick={() => handleDeleteProfile(profile)}>Excluir</Button></Box>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setSaveProfileDialogOpen(false)}>Cancelar</Button><Button color="primary" variant="contained" onClick={handleSaveProfile}>Salvar</Button></DialogActions>
      </Dialog>
    </div>
  );
};

export default Users;
