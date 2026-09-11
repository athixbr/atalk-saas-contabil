import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Badge, Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, Drawer, FormControlLabel, IconButton, InputAdornment,
  List, ListItem, ListItemText, Menu, MenuItem, Paper, Switch, Table,
  TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography,
} from "@material-ui/core";
import {
  Add, Clear as ClearIcon, Delete, Edit, ExpandLess, ExpandMore,
  FilterList as FilterListIcon, Refresh, Save as SaveIcon, Search as SearchIcon,
  Star, StarBorder, ViewColumn as ViewColumnIcon, GetApp as GetAppIcon,
  PictureAsPdf as PictureAsPdfIcon, TableChart as TableChartIcon,
  DragIndicator as DragIndicatorIcon,
} from "@material-ui/icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/Auth/AuthContext";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import RecorrenciaModal from "./RecorrenciaModal";
import api from "../../services/api";

const DEFAULT_COLUMNS = [
  { id: "codigo", label: "Código", visible: true, filterable: true, sortable: true, width: 110 },
  { id: "nomeTarefa", label: "Nome da Tarefa", visible: true, filterable: true, sortable: true, width: 260 },
  { id: "departamento", label: "Departamento", visible: true, filterable: true, sortable: true, width: 180 },
  { id: "usuarioResponsavel", label: "Responsável", visible: true, filterable: true, sortable: true, width: 180 },
  { id: "esfera", label: "Esfera", visible: true, filterable: true, sortable: true, width: 120 },
  { id: "classificacao", label: "Classificação", visible: false, filterable: true, sortable: true, width: 150 },
  { id: "mininome", label: "Mininome", visible: false, filterable: true, sortable: true, width: 150 },
  { id: "valor", label: "Valor", visible: false, filterable: true, sortable: true, width: 120 },
  { id: "notificarCliente", label: "Notifica Cliente", visible: false, filterable: true, sortable: true, width: 130 },
  { id: "baixarAutomatico", label: "Baixa Auto", visible: false, filterable: true, sortable: true, width: 120 },
  { id: "status", label: "Status", visible: true, filterable: true, sortable: true, width: 110 },
  { id: "actions", label: "Ações", visible: true, filterable: false, sortable: false, width: 90 },
];

const useStyles = makeStyles((theme) => ({
  mainPaper: { flex: 1, padding: theme.spacing(1), overflowY: "auto", borderRadius: 10, ...theme.scrollbarStyles },
  searchField: { minWidth: 260 },
  toolbarButton: { minWidth: 36 },
  tableHead: {
    "& th": {
      backgroundColor: theme.palette.type === "dark" ? theme.palette.grey[800] : theme.palette.grey[100],
      fontWeight: 600,
      fontSize: "0.78rem",
      borderBottom: `2px solid ${theme.palette.divider}`,
      whiteSpace: "nowrap",
    },
  },
  sortableHeader: { cursor: "pointer", userSelect: "none" },
  dragHandle: { display: "inline-flex", alignItems: "center", marginRight: 6, color: theme.palette.text.secondary, cursor: "grab" },
  tableRow: { "&:hover": { backgroundColor: theme.palette.type === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" } },
  taskName: { fontWeight: 600, fontSize: "0.85rem" },
  actionButtons: { display: "flex", justifyContent: "center", gap: 2 },
  drawerPaper: { width: 400, maxWidth: "95vw", display: "flex", flexDirection: "column", height: "100%" },
  drawerHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", backgroundColor: "#1976d2", color: "#fff" },
  drawerSearch: { padding: "10px 14px", borderBottom: "1px solid #ebebeb" },
  drawerList: { flex: 1, overflowY: "auto" },
  drawerFooter: { padding: 12, borderTop: "1px solid #e0e0e0", backgroundColor: "#f7f9fc" },
  emptyState: { textAlign: "center", padding: theme.spacing(5), color: theme.palette.text.secondary },
}));

const mergeWithDefaultColumns = (savedColumns) => {
  if (!Array.isArray(savedColumns)) return DEFAULT_COLUMNS;
  const savedIds = new Set(savedColumns.map((c) => c.id));
  const missing = DEFAULT_COLUMNS.filter((c) => !savedIds.has(c.id));
  const merged = savedColumns
    .filter((col) => DEFAULT_COLUMNS.some((d) => d.id === col.id))
    .map((col) => ({ ...DEFAULT_COLUMNS.find((d) => d.id === col.id), ...col }));
  const actionsIndex = merged.findIndex((c) => c.id === "actions");
  if (actionsIndex === -1) return [...merged, ...missing];
  return [...merged.slice(0, actionsIndex), ...missing, ...merged.slice(actionsIndex)];
};

const Recorrencia = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [recorrencias, setRecorrencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecorrenciaId, setSelectedRecorrenciaId] = useState(null);
  const [searchParam, setSearchParam] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [tableColumns, setTableColumns] = useState(DEFAULT_COLUMNS);
  const [columnFilters, setColumnFilters] = useState({});
  const [columnMenuAnchor, setColumnMenuAnchor] = useState(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [panelFilterSearch, setPanelFilterSearch] = useState("");
  const [expandedFilterCols, setExpandedFilterCols] = useState({});
  const [viewProfiles, setViewProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [profileName, setProfileName] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [saveProfileDialogOpen, setSaveProfileDialogOpen] = useState(false);

  const loadLocalPreferences = useCallback(() => {
    try {
      const saved = localStorage.getItem(`tarefas_recorrentes_table_prefs_${user.id}`);
      if (!saved) return;
      const prefs = JSON.parse(saved);
      if (prefs.columns) setTableColumns(mergeWithDefaultColumns(prefs.columns));
      if (prefs.columnFilters) setColumnFilters(prefs.columnFilters);
      if (prefs.sortConfig) setSortConfig(prefs.sortConfig);
    } catch (_) {}
  }, [user.id]);

  const applyProfile = useCallback((profile, showToast = true) => {
    setActiveProfile(profile);
    if (profile.columns) setTableColumns(mergeWithDefaultColumns(profile.columns));
    if (profile.filters) setColumnFilters(profile.filters);
    if (profile.sortConfig) setSortConfig(profile.sortConfig);
    if (showToast) toast.success(`Perfil "${profile.name}" aplicado!`);
  }, []);

  const loadViewProfiles = useCallback(async () => {
    try {
      const { data } = await api.get("/tarefas-recorrentes-view-preferences");
      setViewProfiles(Array.isArray(data) ? data : []);
      const defaultProfile = Array.isArray(data) ? data.find((p) => p.isDefault) : null;
      if (defaultProfile) applyProfile(defaultProfile, false);
      else loadLocalPreferences();
    } catch (_) {
      loadLocalPreferences();
    }
  }, [applyProfile, loadLocalPreferences]);

  const loadRecorrencias = useCallback(async (page = 1, reset = false) => {
    setLoading(true);
    try {
      const { data } = await api.get("/tarefas-recorrentes", {
        params: {
          searchParam,
          pageNumber: page,
          pageSize: 20,
          orderBy: sortConfig.key || "createdAt",
          order: sortConfig.direction || "desc",
        },
      });
      const rows = data.tarefas || data.records || [];
      setRecorrencias((prev) => reset ? rows : [...prev, ...rows.filter((row) => !prev.some((item) => item.id === row.id))]);
      setHasMore(Boolean(data.hasMore));
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao carregar tarefas recorrentes");
      setRecorrencias([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [searchParam, sortConfig.key, sortConfig.direction]);

  useEffect(() => { loadViewProfiles(); }, [loadViewProfiles]);
  useEffect(() => {
    localStorage.setItem(`tarefas_recorrentes_table_prefs_${user.id}`, JSON.stringify({ columns: tableColumns, columnFilters, sortConfig }));
  }, [user.id, tableColumns, columnFilters, sortConfig]);
  useEffect(() => {
    const timer = setTimeout(() => setSearchParam(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);
  useEffect(() => {
    setPageNumber(1);
    loadRecorrencias(1, true);
  }, [loadRecorrencias]);

  const getCellValue = useCallback((recorrencia, columnId) => {
    switch (columnId) {
      case "codigo": return recorrencia.codigo || "-";
      case "nomeTarefa": return recorrencia.nomeTarefa || recorrencia.nome || "-";
      case "departamento": return recorrencia.departamento?.nome || recorrencia.departamento?.name || "-";
      case "usuarioResponsavel": return recorrencia.usuarioResponsavel?.name || "-";
      case "esfera": return recorrencia.esfera || "-";
      case "classificacao": return recorrencia.classificacao || "-";
      case "mininome": return recorrencia.mininome || "-";
      case "valor": return recorrencia.valor ? Number(recorrencia.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "-";
      case "notificarCliente": return recorrencia.notificarCliente ? "Sim" : "Não";
      case "baixarAutomatico": return recorrencia.baixarAutomatico ? "Sim" : "Não";
      case "status": return recorrencia.ativa ? "Ativa" : "Inativa";
      default: return "-";
    }
  }, []);

  const filteredRecorrencias = useMemo(() => recorrencias.filter((recorrencia) => {
    for (const [colId, vals] of Object.entries(columnFilters)) {
      if (!Array.isArray(vals) || vals.length === 0) continue;
      if (!vals.includes(String(getCellValue(recorrencia, colId)).trim())) return false;
    }
    return true;
  }), [recorrencias, columnFilters, getCellValue]);

  const getUniqueColumnValues = (columnId) => {
    const q = panelFilterSearch.toLowerCase();
    return [...new Set(recorrencias.map((item) => String(getCellValue(item, columnId)).trim()).filter((v) => v && v !== "-"))]
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

  const handleSaveProfile = async () => {
    if (!profileName.trim()) return toast.error("Digite um nome para o perfil");
    try {
      const payload = { name: profileName.trim(), columns: tableColumns, filters: columnFilters, sortConfig, isDefault: setAsDefault };
      const { data } = activeProfile?.id
        ? await api.put(`/tarefas-recorrentes-view-preferences/${activeProfile.id}`, payload)
        : await api.post("/tarefas-recorrentes-view-preferences", payload);
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
      await api.patch(`/tarefas-recorrentes-view-preferences/${profile.id}/set-default`);
      toast.success(`"${profile.name}" definido como padrão!`);
      await loadViewProfiles();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erro ao definir padrão");
    }
  };

  const handleDeleteProfile = async (profile) => {
    try {
      await api.delete(`/tarefas-recorrentes-view-preferences/${profile.id}`);
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
    setSortConfig({ key: "createdAt", direction: "desc" });
    setActiveProfile(null);
    localStorage.removeItem(`tarefas_recorrentes_table_prefs_${user.id}`);
    toast.success("Preferências resetadas!");
  };

  const handleExportExcel = () => {
    try {
      const XLSX = require("xlsx");
      const visibleCols = tableColumns.filter((c) => c.visible && c.id !== "actions");
      const wsData = [
        visibleCols.map((c) => c.label),
        ...filteredRecorrencias.map((row) => visibleCols.map((col) => {
          const value = getCellValue(row, col.id);
          return value === "-" ? "" : value;
        })),
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws["!cols"] = visibleCols.map((c) => ({ wch: Math.min(Math.max(c.label.length + 8, 12), 45) }));
      ws["!views"] = [{ state: "frozen", xSplit: 0, ySplit: 1 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Tarefas Recorrentes");
      XLSX.writeFile(wb, `tarefas_recorrentes_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.xlsx`);
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
      doc.text("Relatório de Tarefas Recorrentes", margin, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")} | Registros: ${filteredRecorrencias.length}`, margin, y);
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
      filteredRecorrencias.forEach((row) => {
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
      doc.save(`tarefas_recorrentes_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`);
      toast.success("PDF exportado com sucesso!");
      setExportMenuAnchor(null);
    } catch (_) {
      toast.error("Erro ao exportar PDF");
    }
  };

  const handleDeleteRecorrencia = async (id) => {
    if (!window.confirm("Deseja realmente excluir esta tarefa recorrente?")) return;
    try {
      await api.delete(`/tarefas-recorrentes/${id}`);
      toast.success("Tarefa recorrente excluída com sucesso");
      loadRecorrencias(1, true);
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao excluir tarefa recorrente");
    }
  };

  const renderCellContent = (recorrencia, columnId) => {
    if (columnId === "nomeTarefa") return <Typography className={classes.taskName}>{getCellValue(recorrencia, columnId)}</Typography>;
    if (columnId === "esfera") return getCellValue(recorrencia, columnId) !== "-" ? <Chip label={getCellValue(recorrencia, columnId)} size="small" variant="outlined" /> : "-";
    if (columnId === "status") return <Chip label={getCellValue(recorrencia, columnId)} color={recorrencia.ativa ? "primary" : "default"} size="small" variant={recorrencia.ativa ? "default" : "outlined"} />;
    if (columnId === "actions") {
      return (
        <div className={classes.actionButtons}>
          <Tooltip title="Editar"><IconButton size="small" onClick={() => { setSelectedRecorrenciaId(recorrencia.id); setModalOpen(true); }}><Edit fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Excluir"><IconButton size="small" onClick={() => handleDeleteRecorrencia(recorrencia.id)}><Delete fontSize="small" /></IconButton></Tooltip>
        </div>
      );
    }
    return getCellValue(recorrencia, columnId);
  };

  const visibleColumns = tableColumns.filter((c) => c.visible);
  const totalActiveFilters = Object.values(columnFilters).filter((v) => Array.isArray(v) && v.length > 0).length;

  return (
    <MainContainer>
      <MainHeader>
        <Title>Tarefas Recorrentes ({filteredRecorrencias.length})</Title>
        <MainHeaderButtonsWrapper>
          <TextField className={classes.searchField} placeholder="Buscar tarefas recorrentes" type="search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} variant="outlined" size="small" InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon style={{ color: "gray" }} /></InputAdornment> }} />
          <Tooltip title="Filtros"><IconButton className={classes.toolbarButton} onClick={() => setFilterDrawerOpen(true)}><Badge badgeContent={totalActiveFilters} color="primary"><FilterListIcon /></Badge></IconButton></Tooltip>
          <Tooltip title="Colunas"><IconButton className={classes.toolbarButton} onClick={(e) => setColumnMenuAnchor(e.currentTarget)}><ViewColumnIcon /></IconButton></Tooltip>
          <Tooltip title="Salvar perfil"><IconButton className={classes.toolbarButton} onClick={() => { setProfileName(activeProfile?.name || ""); setSetAsDefault(activeProfile?.isDefault || false); setSaveProfileDialogOpen(true); }}><SaveIcon /></IconButton></Tooltip>
          <Tooltip title="Exportar"><IconButton className={classes.toolbarButton} onClick={(e) => setExportMenuAnchor(e.currentTarget)}><GetAppIcon /></IconButton></Tooltip>
          <Tooltip title="Resetar"><IconButton className={classes.toolbarButton} onClick={handleResetTablePreferences}><Refresh /></IconButton></Tooltip>
          <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => { setSelectedRecorrenciaId(null); setModalOpen(true); }}>Nova Tarefa Recorrente</Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <DragDropContext onDragEnd={handleColumnDragEnd}>
        <Table size="small" stickyHeader>
          <Droppable droppableId="recorrencia-table-columns" direction="horizontal">
            {(provided) => (
              <TableHead ref={provided.innerRef} {...provided.droppableProps} className={classes.tableHead}>
                <TableRow>
                  {visibleColumns.map((column, index) => (
                    <Draggable key={column.id} draggableId={column.id} index={index}>
                      {(dragProvided, snapshot) => (
                        <TableCell
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          align={column.id === "nomeTarefa" ? "left" : "center"}
                          style={{ ...dragProvided.draggableProps.style, minWidth: column.width, backgroundColor: snapshot.isDragging ? "#e3f2fd" : undefined }}
                          className={column.sortable ? classes.sortableHeader : undefined}
                        >
                          <Box display="flex" alignItems="center" justifyContent={column.id === "nomeTarefa" ? "flex-start" : "center"}>
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
            {filteredRecorrencias.map((recorrencia) => (
              <TableRow key={recorrencia.id} className={classes.tableRow}>
                {visibleColumns.map((column) => <TableCell key={column.id} align={column.id === "nomeTarefa" ? "left" : "center"}>{renderCellContent(recorrencia, column.id)}</TableCell>)}
              </TableRow>
            ))}
            {loading && <TableRowSkeleton columns={visibleColumns.length} />}
          </TableBody>
        </Table>
        </DragDropContext>
        {!loading && filteredRecorrencias.length === 0 && (
          <Box className={classes.emptyState}>
            <Typography variant="h6" gutterBottom>Nenhuma tarefa recorrente encontrada</Typography>
            <Typography color="textSecondary">{totalActiveFilters > 0 ? "Ajuste os filtros ou limpe a seleção atual" : "Clique em Nova Tarefa Recorrente para começar"}</Typography>
          </Box>
        )}
        {hasMore && (
          <Box display="flex" justifyContent="center" p={2}>
            <Button variant="outlined" onClick={() => { const next = pageNumber + 1; setPageNumber(next); loadRecorrencias(next); }} disabled={loading}>Carregar mais</Button>
          </Box>
        )}
      </Paper>

      <Menu anchorEl={exportMenuAnchor} open={Boolean(exportMenuAnchor)} onClose={() => setExportMenuAnchor(null)}>
        <MenuItem disabled>Exportar {filteredRecorrencias.length} registros</MenuItem>
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
        <Box className={classes.drawerHeader}><Typography variant="subtitle1">Filtros de tarefas recorrentes</Typography><IconButton size="small" onClick={() => setFilterDrawerOpen(false)} style={{ color: "#fff" }}><ClearIcon /></IconButton></Box>
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

      <RecorrenciaModal open={modalOpen} onClose={() => { setModalOpen(false); setSelectedRecorrenciaId(null); }} recorrenciaId={selectedRecorrenciaId} onSave={() => loadRecorrencias(1, true)} />
    </MainContainer>
  );
};

export default Recorrencia;
