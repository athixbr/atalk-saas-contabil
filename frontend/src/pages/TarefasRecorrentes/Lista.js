import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Button, Tooltip, Chip,
  TextField, InputAdornment, CircularProgress, Typography,
  List, ListItem, ListItemText, Divider, Checkbox, Menu, MenuItem, Drawer,
  Badge
} from '@material-ui/core';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  FilterList as FilterListIcon,
  ViewColumn as ViewColumnIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  GetApp as GetAppIcon,
  PictureAsPdf as PictureAsPdfIcon,
  TableChart as TableChartIcon,
  DragIndicator as DragIndicatorIcon,
  ExpandLess,
  ExpandMore
} from '@material-ui/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import MainHeader from '../../components/MainHeader';
import MainHeaderButtonsWrapper from '../../components/MainHeaderButtonsWrapper';
import Title from '../../components/Title';
import api from '../../services/api';

const useStyles = makeStyles((theme) => ({
  pageBox: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3),
    width: '100%',
    boxSizing: 'border-box',
  },
  mainPaper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3),
    borderRadius: '16px',
    overflow: 'hidden',
    width: '100%',
    boxSizing: 'border-box',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },
  toolbar: {
    display: 'flex',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1.5),
    flexWrap: 'wrap',
    flexShrink: 0,
  },
  searchField: {
    minWidth: 280,
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
  },
  tableHeaderCell: {
    fontWeight: 600,
    padding: '12px 16px',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    [theme.breakpoints.down('sm')]: {
      padding: '8px 12px',
      fontSize: '0.875rem',
    },
  },
  tableRow: {
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#f9f9f9',
    },
  },
  tableCell: {
    whiteSpace: 'nowrap',
    [theme.breakpoints.down('sm')]: {
      padding: '8px 12px',
      fontSize: '0.875rem',
    },
  },
  actionButtons: {
    display: 'flex',
    gap: theme.spacing(1),
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  addButton: {
    background: 'linear-gradient(135deg, #0596cd 0%, #047ba5 100%)',
    color: '#fff',
    '&:hover': {
      background: 'linear-gradient(135deg, #047ba5 0%, #035c7d 100%)',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.875rem',
      padding: '6px 12px',
    },
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
  },
  totalCount: {
    padding: theme.spacing(2),
    borderTop: '1px solid #e0e0e0',
    marginTop: theme.spacing(2),
    flexShrink: 0,
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1.5),
    },
  },
  sortIcon: {
    fontSize: '1rem',
    marginLeft: 4,
    verticalAlign: 'middle',
  },
  dragHandle: {
    display: 'inline-flex',
    alignItems: 'center',
    color: theme.palette.text.secondary,
    cursor: 'grab',
  },
  drawerPaper: {
    width: 400,
    maxWidth: '95vw',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    backgroundColor: '#1976d2',
    color: '#fff',
  },
  drawerSearch: {
    padding: '10px 14px',
    borderBottom: '1px solid #ebebeb',
  },
  drawerList: {
    flex: 1,
    overflowY: 'auto',
  },
  drawerFooter: {
    padding: 12,
    borderTop: '1px solid #e0e0e0',
    backgroundColor: '#f7f9fc',
  },
}));

const MESES_LABEL = {
  1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Abr', 5: 'Mai', 6: 'Jun',
  7: 'Jul', 8: 'Ago', 9: 'Set', 10: 'Out', 11: 'Nov', 12: 'Dez'
};

// Colunas disponíveis na listagem (mesmos campos existentes no formulário de cadastro)
const DEFAULT_COLUMNS = [
  { id: 'codigo', label: 'Código', visible: true, filterable: true, sortable: true },
  { id: 'nomeTarefa', label: 'Nome da Tarefa', visible: true, filterable: true, sortable: true },
  { id: 'tipoTarefa', label: 'Tipo', visible: true, filterable: true, sortable: true },
  { id: 'classificacao', label: 'Classificação', visible: false, filterable: true, sortable: true },
  { id: 'mininome', label: 'Mininome', visible: false, filterable: true, sortable: true },
  { id: 'departamento', label: 'Departamento', visible: true, filterable: true, sortable: true },
  { id: 'usuarioResponsavel', label: 'Responsável', visible: false, filterable: true, sortable: true },
  { id: 'clientes', label: 'Clientes', visible: true, filterable: false, sortable: true },
  { id: 'socios', label: 'Sócios', visible: false, filterable: false, sortable: true },
  { id: 'usuarios', label: 'Usuários Vinculados', visible: false, filterable: false, sortable: true },
  { id: 'esfera', label: 'Esfera', visible: false, filterable: true, sortable: true },
  { id: 'valor', label: 'Valor', visible: false, filterable: false, sortable: true },
  { id: 'competencia', label: 'Competência', visible: false, filterable: true, sortable: true },
  { id: 'entregasMensais', label: 'Dias de Entrega', visible: false, filterable: false, sortable: false },
  { id: 'checklistObrigatorio', label: 'Checklist Obrigatório', visible: false, filterable: true, sortable: true },
  { id: 'sabadoUtil', label: 'Sábado Útil', visible: false, filterable: true, sortable: true },
  { id: 'exigirRobo', label: 'Exigir Robô', visible: false, filterable: true, sortable: true },
  { id: 'passivelMulta', label: 'Passível de Multa', visible: false, filterable: true, sortable: true },
  { id: 'alertaGuia', label: 'Alerta Guia', visible: false, filterable: true, sortable: true },
  { id: 'notificarCliente', label: 'Notificar Cliente', visible: false, filterable: true, sortable: true },
  { id: 'servicoLiberado', label: 'Serviço Liberado', visible: false, filterable: true, sortable: true },
  { id: 'baixarAutomatico', label: 'Baixar Automático', visible: false, filterable: true, sortable: true },
  { id: 'canaisNotificacao', label: 'Canais de Notificação', visible: false, filterable: false, sortable: false },
  { id: 'status', label: 'Status', visible: true, filterable: true, sortable: true },
  { id: 'createdAt', label: 'Criado em', visible: false, filterable: false, sortable: true },
  { id: 'updatedAt', label: 'Atualizado em', visible: false, filterable: false, sortable: true },
  { id: 'acoes', label: 'Ações', visible: true, filterable: false, sortable: false },
];

const formatDate = (value) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('pt-BR');
  } catch {
    return '';
  }
};

const formatMoeda = (value) => {
  if (value === null || value === undefined || value === '') return '';
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const TIPO_TAREFA_LABELS = {
  recorrente: 'Recorrente',
  ordem_servico: 'Ordem de serviço',
  controle_data: 'Controle com data',
  controle_fixo: 'Controle fixo',
  parcelamento: 'Parcelamento',
};

const formatEntregasMensais = (entregasMensais) => {
  if (!entregasMensais) return '';
  return Object.entries(entregasMensais)
    .filter(([, dia]) => dia !== '' && dia !== null && dia !== undefined)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([mes, dia]) => `${MESES_LABEL[mes] || mes}: ${dia === 'ultimo' ? 'último dia' : `dia ${dia}`}`)
    .join(' | ');
};

const ListaTarefasRecorrentes = () => {
  const classes = useStyles();
  const history = useHistory();
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Estados para ordenação e filtros
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [columnFilters, setColumnFilters] = useState({});
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [panelFilterSearch, setPanelFilterSearch] = useState('');
  const [expandedFilterCols, setExpandedFilterCols] = useState({});

  // Estados para colunas configuráveis
  const [tableColumns, setTableColumns] = useState(DEFAULT_COLUMNS);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const [activePreferenceId, setActivePreferenceId] = useState(null);

  useEffect(() => {
    carregarTarefas();
    carregarPreferencias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    carregarTarefas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, sortConfig.key, sortConfig.direction]);

  const carregarTarefas = async () => {
    try {
      setLoading(true);
      // pageSize alto: tarefas recorrentes são templates cadastrados manualmente
      // (dezenas, não milhares), então não precisa de paginação real de servidor.
      const params = {
        searchParam: debouncedSearchTerm,
        pageSize: 1000,
        orderBy: sortConfig.key || 'createdAt',
        order: sortConfig.direction || 'desc'
      };

      const { data } = await api.get('/tarefas-recorrentes', { params });
      setTarefas(data.tarefas || data || []);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      toast.error('Erro ao carregar tarefas');
      setTarefas([]);
    } finally {
      setLoading(false);
    }
  };

  const carregarPreferencias = async () => {
    try {
      const { data } = await api.get('/tarefas-recorrentes-view-preferences');
      const preferences = Array.isArray(data) ? data : (data ? [data] : []);
      const preference = preferences.find((pref) => pref.isDefault) || preferences[0];
      if (!preference) return;

      setActivePreferenceId(preference.id);
      if (Array.isArray(preference.columns)) {
        const savedIds = new Set(preference.columns.map((col) => col.id));
        const savedColumns = preference.columns
          .filter((saved) => DEFAULT_COLUMNS.some((defCol) => defCol.id === saved.id))
          .map((saved) => ({ ...DEFAULT_COLUMNS.find((defCol) => defCol.id === saved.id), ...saved }));
        const missingColumns = DEFAULT_COLUMNS.filter((defCol) => !savedIds.has(defCol.id));
        const actionsIndex = savedColumns.findIndex((col) => col.id === 'acoes');
        const merged = actionsIndex >= 0
          ? [...savedColumns.slice(0, actionsIndex), ...missingColumns, ...savedColumns.slice(actionsIndex)]
          : [...savedColumns, ...missingColumns];
        setTableColumns(merged);
      }
      if (preference.sortConfig && preference.sortConfig.key) {
        setSortConfig(preference.sortConfig);
      }
      if (preference.filters) {
        setColumnFilters(preference.filters);
      }
    } catch (error) {
      // Sem preferência salva ainda — mantém o padrão, não é um erro do usuário
    }
  };

  const salvarPreferencias = async () => {
    try {
      const payload = {
        name: 'Padrão',
        columns: tableColumns,
        filters: columnFilters,
        sortConfig,
        isDefault: true
      };
      const { data } = activePreferenceId
        ? await api.put(`/tarefas-recorrentes-view-preferences/${activePreferenceId}`, payload)
        : await api.post('/tarefas-recorrentes-view-preferences', payload);
      setActivePreferenceId(data.id);
      toast.success('Preferências de colunas salvas');
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      toast.error(error.response?.data?.error || 'Erro ao salvar preferências');
    }
  };

  const toggleColumnVisibility = (columnId) => {
    setTableColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, visible: !col.visible } : col))
    );
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

  const handleNovaTarefa = () => {
    history.push('/tarefas-recorrentes/novo');
  };

  const handleEditar = (id) => {
    history.push(`/tarefas-recorrentes/editar/${id}`);
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa recorrente?')) {
      try {
        await api.delete(`/tarefas-recorrentes/${id}`);
        toast.success('Tarefa excluída com sucesso');
        carregarTarefas();
      } catch (error) {
        console.error('Erro ao excluir:', error);
        toast.error('Erro ao excluir tarefa');
      }
    }
  };

  // Função para obter valor da célula para ordenação/filtro
  const getCellValue = (tarefa, columnId) => {
    switch (columnId) {
      case 'codigo':
        return tarefa.codigo || '';
      case 'nomeTarefa':
        return tarefa.nomeTarefa || '';
      case 'tipoTarefa':
        return TIPO_TAREFA_LABELS[tarefa.tipoTarefa] || 'Recorrente';
      case 'classificacao':
        return tarefa.classificacao || '';
      case 'mininome':
        return tarefa.mininome || '';
      case 'departamento':
        return tarefa.departamento?.nome || '';
      case 'usuarioResponsavel':
        return tarefa.usuarioResponsavel?.name || '';
      case 'clientes':
        return tarefa.clientes?.length || 0;
      case 'socios':
        return tarefa.socios?.length || 0;
      case 'usuarios':
        return tarefa.usuarios?.length || 0;
      case 'esfera':
        return tarefa.esfera || '';
      case 'valor':
        return tarefa.valor !== null && tarefa.valor !== undefined ? Number(tarefa.valor) : '';
      case 'competencia':
        return tarefa.competenciaTipo
          ? `${tarefa.competenciaTipo}${tarefa.competencia ? ` (${tarefa.competencia})` : ''}`
          : '';
      case 'entregasMensais':
        return formatEntregasMensais(tarefa.entregasMensais);
      case 'checklistObrigatorio':
        return tarefa.checklistObrigatorio ? 'Sim' : 'Não';
      case 'sabadoUtil':
        return tarefa.sabadoUtil ? 'Sim' : 'Não';
      case 'exigirRobo':
        return tarefa.exigirRobo ? 'Sim' : 'Não';
      case 'passivelMulta':
        return tarefa.passivelMulta ? 'Sim' : 'Não';
      case 'alertaGuia':
        return tarefa.alertaGuia ? 'Sim' : 'Não';
      case 'notificarCliente':
        return tarefa.notificarCliente ? 'Sim' : 'Não';
      case 'servicoLiberado':
        return tarefa.servicoLiberado ? 'Sim' : 'Não';
      case 'baixarAutomatico':
        return tarefa.baixarAutomatico ? 'Sim' : 'Não';
      case 'canaisNotificacao':
        return Array.isArray(tarefa.canaisNotificacao) ? tarefa.canaisNotificacao.join(', ') : '';
      case 'status':
        return tarefa.ativa ? 'Ativa' : 'Inativa';
      case 'createdAt':
        return tarefa.createdAt || '';
      case 'updatedAt':
        return tarefa.updatedAt || '';
      default:
        return '';
    }
  };

  // Função para renderizar o conteúdo visual da célula (JSX)
  const renderCellContent = (tarefa, columnId) => {
    switch (columnId) {
      case 'clientes':
        return tarefa.clientes?.length > 0 ? `${tarefa.clientes.length} cliente(s)` : '-';
      case 'socios':
        return tarefa.socios?.length > 0 ? `${tarefa.socios.length} sócio(s)` : '-';
      case 'usuarios':
        return tarefa.usuarios?.length > 0 ? `${tarefa.usuarios.length} usuário(s)` : '-';
      case 'valor':
        return tarefa.valor !== null && tarefa.valor !== undefined && tarefa.valor !== ''
          ? formatMoeda(tarefa.valor)
          : '-';
      case 'entregasMensais': {
        const resumo = formatEntregasMensais(tarefa.entregasMensais);
        if (!resumo) return '-';
        const totalMeses = Object.values(tarefa.entregasMensais || {})
          .filter((dia) => dia !== '' && dia !== null && dia !== undefined).length;
        return (
          <Tooltip title={resumo}>
            <span>{totalMeses} mês(es) configurado(s)</span>
          </Tooltip>
        );
      }
      case 'status':
        return (
          <Chip
            label={tarefa.ativa ? 'Ativa' : 'Inativa'}
            color={tarefa.ativa ? 'primary' : 'default'}
            size="small"
          />
        );
      case 'tipoTarefa':
        return (
          <Chip
            label={TIPO_TAREFA_LABELS[tarefa.tipoTarefa] || 'Recorrente'}
            size="small"
            variant="outlined"
          />
        );
      case 'acoes':
        return (
          <Box className={classes.actionButtons}>
            <Tooltip title="Editar">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleEditar(tarefa.id)}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir">
              <IconButton
                size="small"
                color="secondary"
                onClick={() => handleExcluir(tarefa.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        );
      default: {
        const value = getCellValue(tarefa, columnId);
        if (columnId === 'createdAt' || columnId === 'updatedAt') return formatDate(value) || '-';
        return value !== '' && value !== null && value !== undefined ? value : '-';
      }
    }
  };

  // Função para ordenar tarefas
  const handleSort = (columnId) => {
    setSortConfig(prev => {
      if (prev.key === columnId) {
        // Alternar direção: asc -> desc -> null
        if (prev.direction === 'asc') {
          return { key: columnId, direction: 'desc' };
        } else if (prev.direction === 'desc') {
          return { key: null, direction: 'asc' };
        }
      }
      return { key: columnId, direction: 'asc' };
    });
  };

  // Função para aplicar filtro em coluna
  const handleColumnFilter = (columnId, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnId]: value
    }));
  };

  // Obter valores únicos de uma coluna para filtro
  const getUniqueColumnValues = (columnId) => {
    const values = tarefas.map(tarefa => {
      const value = getCellValue(tarefa, columnId);
      return value !== '' && value !== null && value !== undefined ? String(value) : '';
    }).filter(v => v !== '');

    const uniqueValues = [...new Set(values)];
    const query = panelFilterSearch.toLowerCase();

    return uniqueValues.filter((value) => !query || value.toLowerCase().includes(query)).sort((a, b) => {
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.localeCompare(b, 'pt-BR');
    });
  };

  // Toggle valor no filtro multi-seleção
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

  // Limpar filtro de uma coluna
  // Aplicar ordenação e filtros às tarefas
  const getFilteredAndSortedTarefas = () => {
    let result = [...tarefas];

    // Aplicar filtros de coluna
    Object.keys(columnFilters).forEach(columnId => {
      const filterValues = columnFilters[columnId];
      if (filterValues && Array.isArray(filterValues) && filterValues.length > 0) {
        result = result.filter(tarefa => {
          const cellValue = String(getCellValue(tarefa, columnId));
          return filterValues.includes(cellValue);
        });
      }
    });

    // Aplicar ordenação
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = getCellValue(a, sortConfig.key);
        const bValue = getCellValue(b, sortConfig.key);
        if (aValue === '' || aValue === null || aValue === undefined) return 1;
        if (bValue === '' || bValue === null || bValue === undefined) return -1;

        if (sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
          const aDate = new Date(aValue).getTime();
          const bDate = new Date(bValue).getTime();
          return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
        }

        // Comparação numérica
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // Comparação de string
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();

        if (sortConfig.direction === 'asc') {
          return aStr.localeCompare(bStr, 'pt-BR');
        } else {
          return bStr.localeCompare(aStr, 'pt-BR');
        }
      });
    }

    return result;
  };

  const tarefasOrdenadasFiltradas = getFilteredAndSortedTarefas();
  const visibleColumns = tableColumns.filter((col) => col.visible);
  const totalActiveFilters = Object.values(columnFilters).filter((v) => Array.isArray(v) && v.length > 0).length;
  const filterableColumns = tableColumns.filter((col) => col.filterable);

  const renderExportValue = (tarefa, columnId) => {
    if (columnId === 'clientes') return tarefa.clientes?.length > 0 ? `${tarefa.clientes.length} cliente(s)` : '-';
    if (columnId === 'socios') return tarefa.socios?.length > 0 ? `${tarefa.socios.length} sócio(s)` : '-';
    if (columnId === 'usuarios') return tarefa.usuarios?.length > 0 ? `${tarefa.usuarios.length} usuário(s)` : '-';
    if (columnId === 'valor') return tarefa.valor !== null && tarefa.valor !== undefined && tarefa.valor !== '' ? formatMoeda(tarefa.valor) : '-';
    if (columnId === 'createdAt' || columnId === 'updatedAt') return formatDate(getCellValue(tarefa, columnId)) || '-';
    return getCellValue(tarefa, columnId) || '-';
  };

  const handleExportExcel = () => {
    try {
      const XLSX = require('xlsx');
      const exportColumns = visibleColumns.filter((col) => col.id !== 'acoes');
      const wsData = [
        exportColumns.map((col) => col.label),
        ...tarefasOrdenadasFiltradas.map((tarefa) => exportColumns.map((col) => {
          const value = renderExportValue(tarefa, col.id);
          return value === '-' ? '' : value;
        })),
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = exportColumns.map((col) => ({ wch: Math.min(Math.max(col.label.length + 8, 12), 45) }));
      ws['!views'] = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Tarefas');
      XLSX.writeFile(wb, `tarefas_recorrentes_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`);
      toast.success('Excel exportado com sucesso');
      setExportMenuAnchor(null);
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast.error('Erro ao exportar Excel');
    }
  };

  const handleExportPDF = () => {
    try {
      const { jsPDF } = require('jspdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const exportColumns = visibleColumns.filter((col) => col.id !== 'acoes');
      const margin = 10;
      const pageWidth = 297;
      const tableWidth = pageWidth - margin * 2;
      const colWidth = tableWidth / Math.max(exportColumns.length, 1);
      let y = 12;

      const drawHeader = () => {
        doc.setFillColor(25, 118, 210);
        doc.rect(margin, y, tableWidth, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        exportColumns.forEach((col, index) => {
          doc.text(String(col.label).slice(0, 24), margin + index * colWidth + 2, y + 4.6);
        });
        doc.setTextColor(0, 0, 0);
        y += 7;
      };

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Relatório de Tarefas', margin, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} | Registros: ${tarefasOrdenadasFiltradas.length}`, margin, y);
      y += 7;
      drawHeader();

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      tarefasOrdenadasFiltradas.forEach((tarefa) => {
        if (y > 190) {
          doc.addPage();
          y = 12;
          drawHeader();
        }
        exportColumns.forEach((col, index) => {
          const text = String(renderExportValue(tarefa, col.id) || '').slice(0, 34);
          doc.text(text === '-' ? '' : text, margin + index * colWidth + 2, y + 4.5);
        });
        y += 6.5;
      });

      doc.save(`tarefas_recorrentes_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      toast.success('PDF exportado com sucesso');
      setExportMenuAnchor(null);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  };

  return (
    <>
      <Box className={classes.pageBox}>
        <MainHeader>
          <Title>Tarefas</Title>
          <MainHeaderButtonsWrapper>
            <TextField
              className={classes.searchField}
              placeholder="Pesquisar por código, nome, tipo ou mininome"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="Filtros">
              <IconButton onClick={() => setFilterDrawerOpen(true)}>
                <Badge badgeContent={totalActiveFilters} color="primary">
                  <FilterListIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Mostrar/ocultar colunas">
              <IconButton onClick={(e) => setColumnMenuAnchor(e.currentTarget)}>
                <ViewColumnIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Salvar configuração atual">
              <IconButton color="primary" onClick={salvarPreferencias}>
                <SaveIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exportar dados">
              <IconButton onClick={(e) => setExportMenuAnchor(e.currentTarget)}>
                <GetAppIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Atualizar">
              <IconButton onClick={carregarTarefas}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              color="primary"
              className={classes.addButton}
              startIcon={<AddIcon />}
              onClick={handleNovaTarefa}
            >
              Nova Tarefa
            </Button>
          </MainHeaderButtonsWrapper>
        </MainHeader>

        <Paper className={classes.mainPaper} variant="outlined">
          <Box className={classes.toolbar}>
            {totalActiveFilters > 0 && (
              <Button size="small" variant="outlined" startIcon={<ClearIcon />} onClick={() => setColumnFilters({})}>
                Limpar filtros ({totalActiveFilters})
              </Button>
            )}
          </Box>

          {loading ? (
            <Box className={classes.loadingContainer}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer style={{ flex: 1, overflow: 'auto' }}>
                <DragDropContext onDragEnd={handleColumnDragEnd}>
                <Table stickyHeader size="small">
                  <Droppable droppableId="tarefas-recorrentes-columns" direction="horizontal">
                    {(provided) => (
                      <TableHead ref={provided.innerRef} {...provided.droppableProps} className={classes.tableHeader}>
                        <TableRow>
                          {visibleColumns.map((column, index) => (
                            <Draggable key={column.id} draggableId={column.id} index={index}>
                              {(dragProvided, snapshot) => (
                                <TableCell
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  className={classes.tableHeaderCell}
                                  align={column.id === 'acoes' ? 'center' : 'left'}
                                  style={{
                                    ...dragProvided.draggableProps.style,
                                    cursor: column.sortable ? 'pointer' : 'default',
                                    backgroundColor: snapshot.isDragging ? '#e3f2fd' : undefined,
                                  }}
                                >
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 4,
                                      justifyContent: column.id === 'acoes' ? 'center' : 'flex-start'
                                    }}
                                  >
                                    <span {...dragProvided.dragHandleProps} className={classes.dragHandle}>
                                      <DragIndicatorIcon style={{ fontSize: 16 }} />
                                    </span>
                                    <strong onClick={column.sortable ? () => handleSort(column.id) : undefined}>{column.label}</strong>
                                    {column.sortable && sortConfig.key === column.id && (
                                      sortConfig.direction === 'asc'
                                        ? <ArrowUpwardIcon className={classes.sortIcon} />
                                        : <ArrowDownwardIcon className={classes.sortIcon} />
                                    )}
                                    {column.filterable && columnFilters[column.id]?.length > 0 && (
                                      <Chip size="small" color="primary" label={columnFilters[column.id].length} />
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
                    {tarefasOrdenadasFiltradas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={visibleColumns.length} align="center">
                          <Typography variant="body2" color="textSecondary">
                            {Object.values(columnFilters).some(v => v && v.length > 0)
                              ? "Nenhuma tarefa encontrada com os filtros aplicados"
                              : "Nenhuma tarefa encontrada"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      tarefasOrdenadasFiltradas.map((tarefa) => (
                        <TableRow key={tarefa.id} hover className={classes.tableRow}>
                          {visibleColumns.map((column) => (
                            <TableCell
                              key={column.id}
                              className={classes.tableCell}
                              align={column.id === 'acoes' ? 'center' : 'left'}
                            >
                              {renderCellContent(tarefa, column.id)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                </DragDropContext>
              </TableContainer>

              <Box className={classes.totalCount}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Total:</strong> {tarefasOrdenadasFiltradas.length} tarefa(s)
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      </Box>

      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
      >
        <MenuItem disabled>Exportar {tarefasOrdenadasFiltradas.length} registros</MenuItem>
        <Divider />
        <MenuItem onClick={handleExportExcel}>
          <TableChartIcon style={{ marginRight: 10, color: '#217346' }} />
          Excel (.xlsx)
        </MenuItem>
        <MenuItem onClick={handleExportPDF}>
          <PictureAsPdfIcon style={{ marginRight: 10, color: '#c62828' }} />
          PDF (.pdf)
        </MenuItem>
      </Menu>

      {/* Menu de colunas */}
      <Menu
        anchorEl={columnMenuAnchor}
        open={Boolean(columnMenuAnchor)}
        onClose={() => setColumnMenuAnchor(null)}
        PaperProps={{ style: { maxHeight: 480, minWidth: 240 } }}
      >
        {tableColumns.map((col) => (
          <ListItem
            key={col.id}
            button
            onClick={() => toggleColumnVisibility(col.id)}
            style={{ padding: '4px 12px' }}
          >
            <Checkbox checked={col.visible} color="primary" size="small" />
            <ListItemText primary={col.label} primaryTypographyProps={{ variant: 'body2', style: { fontSize: 13 } }} />
          </ListItem>
        ))}
      </Menu>

      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        classes={{ paper: classes.drawerPaper }}
      >
        <Box className={classes.drawerHeader}>
          <Typography variant="subtitle1">Filtros de recorrência</Typography>
          <IconButton size="small" onClick={() => setFilterDrawerOpen(false)} style={{ color: '#fff' }}>
            <ClearIcon />
          </IconButton>
        </Box>
        <Box className={classes.drawerSearch}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Buscar filtros"
            value={panelFilterSearch}
            onChange={(e) => setPanelFilterSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <List className={classes.drawerList}>
          {filterableColumns.map((column) => {
            const values = getUniqueColumnValues(column.id);
            const active = columnFilters[column.id] || [];
            const labelMatches = column.label.toLowerCase().includes(panelFilterSearch.toLowerCase());
            if (panelFilterSearch && values.length === 0 && !labelMatches) return null;
            const expanded = expandedFilterCols[column.id] || active.length > 0 || !!panelFilterSearch;

            return (
              <Box key={column.id}>
                <ListItem
                  button
                  onClick={() => setExpandedFilterCols((prev) => ({ ...prev, [column.id]: !prev[column.id] }))}
                >
                  <ListItemText
                    primary={column.label}
                    secondary={active.length ? `${active.length} selecionado(s)` : `${values.length} opções`}
                  />
                  {expanded ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                {expanded && values.slice(0, 150).map((value) => {
                  const isSelected = active.includes(value);
                  return (
                    <ListItem dense button key={`${column.id}-${value}`} onClick={() => toggleFilterValue(column.id, value)}>
                      <Checkbox checked={isSelected} color="primary" size="small" />
                      <ListItemText primary={value || '(vazio)'} />
                    </ListItem>
                  );
                })}
                <Divider />
              </Box>
            );
          })}
        </List>
        <Box className={classes.drawerFooter}>
          <Button fullWidth variant="outlined" startIcon={<ClearIcon />} onClick={() => setColumnFilters({})}>
            Limpar filtros
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default ListaTarefasRecorrentes;
