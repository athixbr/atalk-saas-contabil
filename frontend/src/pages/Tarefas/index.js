import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory, useLocation } from "react-router-dom";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import Chip from "@material-ui/core/Chip";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import InputAdornment from "@material-ui/core/InputAdornment";
import LinearProgress from "@material-ui/core/LinearProgress";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Pagination from "@material-ui/lab/Pagination";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Doughnut } from "react-chartjs-2";
import 'chart.js/auto';
import { Add, Edit, Delete, PlayArrow, Search, SwapHoriz, WhatsApp, PersonAdd, Edit as EditIcon, Delete as DeleteIcon, CheckCircle, Schedule, Warning, TrendingUp, Assignment, History, Business, People, CalendarToday, ViewColumn, DragIndicator, ArrowUpward, ArrowDownward, FilterList, AttachFile, CloudDownload } from "@material-ui/icons";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Menu from "@material-ui/core/Menu";
import ListItemText from "@material-ui/core/ListItemText";
import Tooltip from "@material-ui/core/Tooltip";
import Popover from "@material-ui/core/Popover";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import api from "../../services/api";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/Auth/AuthContext";
import NewTicketModal from "../../components/NewTicketModal";
import ExecutarControleModal from "../../components/ExecutarControleModal";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(3),
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
  chartPaper: {
    padding: theme.spacing(3),
    borderRadius: "16px",
    height: "100%",
  },
  chartContainer: {
    position: "relative",
    height: "250px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  tablePaper: {
    padding: theme.spacing(3),
    borderRadius: "16px",
    marginTop: theme.spacing(3),
  },
  statusChip: {
    fontWeight: 600,
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
  },
  filterField: {
    minWidth: 200,
    backgroundColor: "#fff",
    borderRadius: "8px",
  },
  searchField: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: "8px",
  },
  pagination: {
    marginTop: theme.spacing(3),
    display: "flex",
    justifyContent: "center",
  },
  // Estilos da tabela avançada
  tableHeader: {
    backgroundColor: "#f5f5f5",
    fontWeight: 600,
  },
  tableHeaderCell: {
    padding: "8px 16px",
    cursor: "pointer",
    userSelect: "none",
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
  filterInput: {
    marginTop: 8,
  },
  columnFilterIcon: {
    fontSize: 18,
    marginLeft: 4,
    color: "#0596cd",
  },
  tableToolbar: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: theme.spacing(2),
    gap: theme.spacing(1),
  },
}));

const Tarefas = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const history = useHistory();
  const location = useLocation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusTask, setStatusTask] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferTask, setTransferTask] = useState(null);
  const [newUserId, setNewUserId] = useState("");
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [statusList, setStatusList] = useState([]); // Status dinâmicos do /parametros/status
  const [prazosList, setPrazosList] = useState([]); // Prazos dinâmicos do /parametros/prazos
  const [tarefasConfig, setTarefasConfig] = useState([]);
  const [selectedTarefaConfig, setSelectedTarefaConfig] = useState(null);
  const [isCoordenador, setIsCoordenador] = useState(false);
  const [equipeUsers, setEquipeUsers] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [filtroGrafico, setFiltroGrafico] = useState("status"); // "status", "departamento", "usuario"
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [contactTicket, setContactTicket] = useState({});
  const [executionTime, setExecutionTime] = useState(0); // Tempo em minutos
  const [isExecuting, setIsExecuting] = useState(false);
  const [statusObservacao, setStatusObservacao] = useState(""); // Observação ao mudar status
  const [taskHistory, setTaskHistory] = useState([]); // Histórico da tarefa
  const [loadingHistory, setLoadingHistory] = useState(false); // Carregando histórico
  const [editingHistoryId, setEditingHistoryId] = useState(null); // ID do histórico sendo editado
  const [editingNotes, setEditingNotes] = useState(""); // Texto da observação sendo editada
  const [historyModalOpen, setHistoryModalOpen] = useState(false); // Modal de histórico separada
  const [historyModalTask, setHistoryModalTask] = useState(null); // Tarefa para exibir histórico
  const [uploadModalOpen, setUploadModalOpen] = useState(false); // Modal de upload de arquivos
  const [uploadTask, setUploadTask] = useState(null); // Tarefa para upload
  const [selectedFiles, setSelectedFiles] = useState([]); // Arquivos selecionados
  const [uploadedFiles, setUploadedFiles] = useState([]); // Arquivos já enviados
  const [loadingUpload, setLoadingUpload] = useState(false); // Carregando upload
  const [executarControleModalOpen, setExecutarControleModalOpen] = useState(false); // Modal de execução de controle
  const [controleTask, setControleTask] = useState(null); // Tarefa de controle selecionada
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "Pendente",
    userId: user?.id || "",
    tarefaConfigId: null,
    prioridadeId: null,
    clienteId: null,
    departamentoId: null,
    dataHoraCriacao: new Date().toISOString().slice(0, 16),
    valor: "",
  });
  
  const isAdmin = user?.profile === "admin";
  
  // Filtros
  const [filterScope, setFilterScope] = useState(isAdmin ? "all" : "mine"); // Admin vê todas por padrão
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [filterStatus, setFilterStatus] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState("");
  const [filterPrioridade, setFilterPrioridade] = useState([]);
  const [filterDepartamento, setFilterDepartamento] = useState([]);
  const [filterCliente, setFilterCliente] = useState([]);
  const [filterPrazo, setFilterPrazo] = useState([]);
  const [filterTipo, setFilterTipo] = useState("todas"); // 'todas' | 'tarefa' | 'controle'
  const [searchParam, setSearchParam] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showConcluidas, setShowConcluidas] = useState(false);
  
  // Paginação
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // ========== ESTADOS DA TABELA AVANÇADA ==========
  const [columnFilters, setColumnFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [columnVisibilityMenuAnchor, setColumnVisibilityMenuAnchor] = useState(null);
  const [filterPopoverAnchor, setFilterPopoverAnchor] = useState(null);
  const [activeFilterColumn, setActiveFilterColumn] = useState(null);
  const [filterSearchText, setFilterSearchText] = useState("");
  
  // Definição das colunas com configurações
  const [tableColumns, setTableColumns] = useState([
    { id: 'id', label: 'ID', visible: true, filterable: true, sortable: true, width: 80 },
    { id: 'tipo', label: 'Tipo', visible: true, filterable: true, sortable: true, width: 110 },
    { id: 'user', label: 'Responsável', visible: true, filterable: true, sortable: true, width: 150 },
    { id: 'title', label: 'Título', visible: true, filterable: true, sortable: true, width: 200 },
    { id: 'codigoErp', label: 'Cód. Cliente', visible: true, filterable: true, sortable: true, width: 110 },
    { id: 'cliente', label: 'Cliente', visible: true, filterable: true, sortable: true, width: 180 },
    { id: 'prioridade', label: 'Prioridade', visible: true, filterable: true, sortable: true, width: 130 },
    { id: 'prazo', label: 'Prazo', visible: true, filterable: true, sortable: true, width: 130 },
    { id: 'progresso', label: 'Progresso', visible: true, filterable: false, sortable: true, width: 140 },
    { id: 'valor', label: 'Valor', visible: true, filterable: false, sortable: true, width: 120 },
    { id: 'contato', label: 'Contato', visible: true, filterable: true, sortable: true, width: 150 },
    { id: 'status', label: 'Status', visible: true, filterable: true, sortable: true, width: 130 },
    { id: 'creator', label: 'Criado Por', visible: true, filterable: true, sortable: true, width: 150 },
    { id: 'departamento', label: 'Departamento', visible: true, filterable: true, sortable: true, width: 150 },
    { id: 'dueDate', label: 'Data de Conclusão', visible: true, filterable: false, sortable: true, width: 180 },
    { id: 'actions', label: 'Ações', visible: true, filterable: false, sortable: false, width: 280 }
  ]);

  // Efeito para abrir tarefa específica da URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const taskId = queryParams.get("taskId");
    
    if (taskId) {
      // Aguarda carregar as tarefas e então abre a modal
      const timer = setTimeout(() => {
        openTaskFromNotification(taskId);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [location.search, tasks]);

  useEffect(() => {
    loadTasks();
    loadContacts();
    loadClientes();
    loadDepartamentos();
    loadPrioridades();
    loadStatusList();
    loadPrazosList();
    loadTarefasConfig();
    if (isAdmin) {
      loadUsers();
    } else {
      checkCoordenadorAndLoadEquipe();
    }
  }, []);

  useEffect(() => {
    setPage(1);
    setTasks([]);
    setHasMore(true);
    loadTasks(false);
  }, [filterScope, selectedUserId, filterStatus, filterPeriod, filterPrioridade, filterDepartamento, filterCliente, filterPrazo, filterTipo, searchParam, startDate, endDate, showConcluidas]);

  // Scroll infinito - detecta quando usuário chega perto do fim da página
  useEffect(() => {
    const handleScroll = () => {
      // Verifica se chegou perto do fim da página (200px antes do final)
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 200) {
        loadMoreTasks();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, tasks]);

  const loadContacts = async () => {
    try {
      const { data } = await api.get("/contacts");
      setContacts(data.contacts || []);
    } catch (err) {
      // Erro ao carregar contatos
    }
  };

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/users");
      console.log("Usuários carregados:", data);
      setUsers(data.users || data || []);
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
      toast.error("Erro ao carregar lista de usuários");
    }
  };

  const checkCoordenadorAndLoadEquipe = async () => {
    try {
      // Buscar dados completos do usuário logado incluindo departamentos
      const { data } = await api.get(`/users/${user.id}`);
      
      // Verificar se é coordenador de algum departamento
      const coordenadorDepts = data.departamentos?.filter(d => d.UserDepartamento?.coordenador) || [];
      
      if (coordenadorDepts.length > 0) {
        setIsCoordenador(true);
        
        // Buscar usuários dos departamentos que coordena
        const departamentoIds = coordenadorDepts.map(d => d.id);
        const allUsers = await api.get("/users");
        
        // Filtrar usuários que pertencem aos departamentos coordenados
        const equipe = allUsers.data.users.filter(u => 
          u.departamentos?.some(d => departamentoIds.includes(d.id))
        );
        
        setEquipeUsers(equipe);
      } else {
        // Usuário comum: carregar usuários do mesmo departamento para transferência
        const userDepartamentoIds = data.departamentos?.map(d => d.id) || [];
        
        if (userDepartamentoIds.length > 0) {
          const allUsers = await api.get("/users");
          
          // Filtrar usuários que pertencem aos mesmos departamentos
          const colegas = allUsers.data.users.filter(u => 
            u.departamentos?.some(d => userDepartamentoIds.includes(d.id))
          );
          
          setEquipeUsers(colegas);
        }
      }
    } catch (err) {
      console.error("Erro ao verificar coordenador:", err);
    }
  };

  const loadClientes = async () => {
    try {
      const { data } = await api.get("/clientes", {
        params: { limit: 999999 }
      });
      setClientes(data.clientes || []);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
    }
  };

  const loadDepartamentos = async () => {
    try {
      const { data } = await api.get("/departamentos");
      setDepartamentos(data.departamentos || []);
    } catch (err) {
      console.error("Erro ao carregar departamentos:", err);
    }
  };

  const loadPrioridades = async () => {
    try {
      const { data } = await api.get("/parametros/prioridades");
      setPrioridades(data.prioridades || data || []);
    } catch (err) {
      console.error("Erro ao carregar prioridades:", err);
    }
  };

  const loadStatusList = async () => {
    try {
      const { data } = await api.get("/parametros/status");
      setStatusList(data.status || data || []);
    } catch (err) {
      console.error("Erro ao carregar status:", err);
      // Fallback para valores padrão
      setStatusList([
        { id: 1, nome: "Pendente", cor: "#ff9800" },
        { id: 2, nome: "Em Andamento", cor: "#2196f3" },
        { id: 3, nome: "Concluída", cor: "#4caf50" },
        { id: 4, nome: "Cancelada", cor: "#f44336" }
      ]);
    }
  };

  const loadPrazosList = async () => {
    try {
      const { data } = await api.get("/parametros/prazos");
      setPrazosList(data.prazos || data || []);
    } catch (err) {
      console.error("Erro ao carregar prazos:", err);
    }
  };

  const loadTarefasConfig = async () => {
    try {
      const { data } = await api.get("/tarefas-config", {
        params: { limit: 999999, ativo: "true" }
      });
      setTarefasConfig(data.tarefas || []);
    } catch (err) {
      console.error("Erro ao carregar configurações de tarefas:", err);
    }
  };

  const handleDeleteHistory = async (historyId) => {
    try {
      await api.delete(`/tasks/history/${historyId}`);
      toast.success("Registro removido com sucesso");
      // Recarrega o histórico
      if (statusTask) {
        loadTaskHistory(statusTask.id);
      }
    } catch (err) {
      console.error("Erro ao excluir histórico:", err);
      toast.error("Erro ao excluir registro");
    }
  };

  const handleEditHistory = (history) => {
    setEditingHistoryId(history.id);
    setEditingNotes(history.notes || "");
  };

  const handleSaveEditHistory = async (historyId) => {
    try {
      await api.put(`/tasks/history/${historyId}`, {
        notes: editingNotes
      });
      toast.success("Observação atualizada com sucesso");
      setEditingHistoryId(null);
      setEditingNotes("");
      // Recarrega o histórico
      if (statusTask) {
        loadTaskHistory(statusTask.id);
      }
    } catch (err) {
      console.error("Erro ao editar histórico:", err);
      toast.error("Erro ao atualizar observação");
    }
  };

  const handleCancelEditHistory = () => {
    setEditingHistoryId(null);
    setEditingNotes("");
  };

  const loadTaskHistory = async (taskId) => {
    try {
      setLoadingHistory(true);
      console.log('Carregando histórico para tarefa:', taskId);
      const { data } = await api.get(`/tasks/${taskId}/history`);
      console.log('Histórico recebido:', data);
      setTaskHistory(data);
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
      toast.error("Erro ao carregar histórico da tarefa");
      setTaskHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Funções de Upload de Arquivos
  const handleOpenUploadModal = async (task) => {
    setUploadTask(task);
    setUploadModalOpen(true);
    setSelectedFiles([]);
    // Carregar arquivos já enviados
    try {
      const { data } = await api.get(`/tasks/${task.id}/files`);
      setUploadedFiles(data || []);
    } catch (err) {
      console.error("Erro ao carregar arquivos:", err);
      setUploadedFiles([]);
    }
  };

  const handleCloseUploadModal = () => {
    setUploadModalOpen(false);
    setUploadTask(null);
    setSelectedFiles([]);
    setUploadedFiles([]);
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.warn("Selecione pelo menos um arquivo");
      return;
    }

    try {
      setLoadingUpload(true);
      const formData = new FormData();
      
      selectedFiles.forEach(file => {
        formData.append("files", file);
      });
      
      formData.append("typeArch", "tasks");
      formData.append("fileId", uploadTask.id.toString());

      await api.post(`/tasks/${uploadTask.id}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      toast.success("Arquivo(s) enviado(s) com sucesso!");
      setSelectedFiles([]);
      
      // Recarregar lista de arquivos
      const { data } = await api.get(`/tasks/${uploadTask.id}/files`);
      setUploadedFiles(data || []);
      
      // Recarregar tarefas
      loadTasks();
    } catch (err) {
      console.error("Erro ao enviar arquivos:", err);
      toast.error("Erro ao enviar arquivo(s)");
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleDeleteFile = async (fileName) => {
    if (!window.confirm("Deseja realmente excluir este arquivo?")) {
      return;
    }

    try {
      await api.delete(`/tasks/${uploadTask.id}/files/${fileName}`);
      toast.success("Arquivo excluído com sucesso!");
      
      // Recarregar lista de arquivos
      const { data } = await api.get(`/tasks/${uploadTask.id}/files`);
      setUploadedFiles(data || []);
      
      // Recarregar tarefas
      loadTasks();
    } catch (err) {
      console.error("Erro ao excluir arquivo:", err);
      toast.error("Erro ao excluir arquivo");
    }
  };

  const handleDownloadFile = (file) => {
    const baseURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";
    const fileUrl = `${baseURL}/${file.path.replace(/\\/g, '/')}`;
    window.open(fileUrl, '_blank');
  };

  const loadTasks = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const currentPage = isLoadMore ? page + 1 : page;
      
      const params = {
        pageNumber: currentPage,
      };
      
      // Filtro de escopo
      if (!isAdmin || filterScope === "mine") {
        params.userId = user.id;
      } else if (filterScope === "user" && selectedUserId.length > 0) {
        params.userId = selectedUserId.join(',');
      }
      
      // Outros filtros
      if (filterStatus.length > 0) params.status = filterStatus.join(',');
      if (!showConcluidas) params.excludeStatus = 'Concluída'; // Exclui tarefas concluídas se checkbox desmarcado
      if (filterPrioridade.length > 0) params.prioridadeId = filterPrioridade.join(',');
      if (filterDepartamento.length > 0) params.departamentoId = filterDepartamento.join(',');
      if (filterCliente.length > 0) params.clienteId = filterCliente.join(',');
      if (filterPrazo.length > 0) params.prazoId = filterPrazo.join(',');
      if (filterTipo) params.tipo = filterTipo; // Novo filtro de tipo
      if (searchParam) params.searchParam = searchParam;
      
      // Filtro de período
      if (filterPeriod) {
        params.period = filterPeriod;
        if (filterPeriod === 'custom' && startDate && endDate) {
          params.startDate = startDate;
          params.endDate = endDate;
        }
      }
      
      console.log('📊 Carregando tarefas com filtros:', params);
      const { data } = await api.get("/tasks", { params });
      console.log('✅ Tarefas recebidas:', data.tasks?.length, 'Total:', data.count);
      
      if (isLoadMore) {
        // Append para scroll infinito
        const newTasks = [...tasks, ...(data.tasks || [])];
        setTasks(newTasks);
        setPage(currentPage);
        // Verifica se tem mais itens para carregar
        setHasMore(newTasks.length < (data.count || 0));
      } else {
        // Replace para filtros ou primeira carga
        const newTasks = data.tasks || [];
        setTasks(newTasks);
        setPage(1);
        // Verifica se tem mais itens para carregar
        setHasMore(newTasks.length < (data.count || 0));
      }
      
      setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / 12));
    } catch (err) {
      toast.error("Erro ao carregar tarefas");
      if (!isLoadMore) {
        setTasks([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // ========== FUNÇÕES DA TABELA AVANÇADA ==========
  
  // Carregar preferências da tabela do localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem(`tarefas_table_prefs_${user?.id}`);
    if (savedPreferences) {
      try {
        const prefs = JSON.parse(savedPreferences);
        if (prefs.columns) setTableColumns(prefs.columns);
        if (prefs.columnFilters) setColumnFilters(prefs.columnFilters);
        if (prefs.sortConfig) setSortConfig(prefs.sortConfig);
      } catch (err) {
        console.error("Erro ao carregar preferências da tabela:", err);
      }
    }
  }, [user?.id]);

  // Salvar preferências quando mudar
  useEffect(() => {
    if (user?.id) {
      const prefs = {
        columns: tableColumns,
        columnFilters,
        sortConfig,
      };
      localStorage.setItem(`tarefas_table_prefs_${user.id}`, JSON.stringify(prefs));
    }
  }, [tableColumns, columnFilters, sortConfig, user?.id]);

  // Drag and Drop de colunas
  const handleColumnDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(tableColumns);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    
    setTableColumns(items);
  };

  // Alternar visibilidade de coluna
  const toggleColumnVisibility = (columnId) => {
    setTableColumns(prev => 
      prev.map(col => 
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  // Filtrar coluna (aceita string ou array)
  const handleColumnFilter = (columnId, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnId]: value
    }));
  };

  // Abrir menu de filtro
  const handleOpenFilterMenu = (event, columnId) => {
    event.stopPropagation();
    setFilterPopoverAnchor(event.currentTarget);
    setActiveFilterColumn(columnId);
  };

  // Fechar menu de filtro
  const handleCloseFilterMenu = () => {
    setFilterPopoverAnchor(null);
    setActiveFilterColumn(null);
    setFilterSearchText("");
  };

  // Obter valores únicos de uma coluna
  const getUniqueColumnValues = (columnId, searchText = '') => {
    const values = tasks.map(task => {
      const value = getCellValue(task, columnId);
      return value ? String(value).trim() : '';
    }).filter(v => v !== '');
    
    const uniqueValues = [...new Set(values)];
    
    // Filtrar por texto de busca se fornecido
    const filtered = searchText.trim() !== '' 
      ? uniqueValues.filter(v => v.toLowerCase().includes(searchText.toLowerCase()))
      : uniqueValues;
    
    return filtered.sort((a, b) => {
      // Se for número, comparar numericamente
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      // Caso contrário, comparar alfabeticamente
      return a.localeCompare(b, 'pt-BR');
    });
  };

  // Toggle valor no filtro multi-seleção
  const toggleFilterValue = (columnId, value) => {
    const currentFilters = columnFilters[columnId] || [];
    const isArray = Array.isArray(currentFilters);
    const filterArray = isArray ? currentFilters : [];
    
    if (filterArray.includes(value)) {
      // Remover valor
      const newFilters = filterArray.filter(v => v !== value);
      handleColumnFilter(columnId, newFilters.length > 0 ? newFilters : []);
    } else {
      // Adicionar valor
      handleColumnFilter(columnId, [...filterArray, value]);
    }
  };

  // Limpar filtro de uma coluna
  const clearColumnFilter = (columnId) => {
    handleColumnFilter(columnId, []);
  };

  // Ordenar coluna
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

  // Resetar preferências da tabela
  const handleResetTablePreferences = () => {
    localStorage.removeItem(`tarefas_table_prefs_${user?.id}`);
    setColumnFilters({});
    setSortConfig({ key: null, direction: 'asc' });
    setTableColumns([
      { id: 'id', label: 'ID', visible: true, filterable: true, sortable: true, width: 80 },
      { id: 'user', label: 'Responsável', visible: true, filterable: true, sortable: true, width: 150 },
      { id: 'title', label: 'Título', visible: true, filterable: true, sortable: true, width: 200 },
      { id: 'codigoErp', label: 'Cód. Cliente', visible: true, filterable: true, sortable: true, width: 110 },
      { id: 'cliente', label: 'Cliente', visible: true, filterable: true, sortable: true, width: 180 },
      { id: 'prioridade', label: 'Prioridade', visible: true, filterable: true, sortable: true, width: 130 },
      { id: 'prazo', label: 'Prazo', visible: true, filterable: true, sortable: true, width: 130 },
      { id: 'progresso', label: 'Progresso', visible: true, filterable: false, sortable: true, width: 140 },
      { id: 'contato', label: 'Contato', visible: true, filterable: true, sortable: true, width: 150 },
      { id: 'status', label: 'Status', visible: true, filterable: true, sortable: true, width: 130 },
      { id: 'creator', label: 'Criado Por', visible: true, filterable: true, sortable: true, width: 150 },
      { id: 'departamento', label: 'Departamento', visible: true, filterable: true, sortable: true, width: 150 },
      { id: 'dueDate', label: 'Data de Conclusão', visible: true, filterable: false, sortable: true, width: 180 },
      { id: 'actions', label: 'Ações', visible: true, filterable: false, sortable: false, width: 280 }
    ]);
    toast.success("Preferências da tabela resetadas!");
  };

  // Obter valor da célula para ordenação/filtro
  const getCellValue = (task, columnId) => {
    switch (columnId) {
      case 'id':
        return task.id || 0;
      case 'user':
        return task.user?.name || '';
      case 'title':
        return task.tarefaConfig?.titulo || task.title || '';
      case 'codigoErp':
        return task.cliente?.codigoErp || '';
      case 'cliente':
        return task.cliente?.nomeFantasia || task.cliente?.razaoSocial || '';
      case 'prioridade':
        return task.prioridade?.nome || '';
      case 'prazo':
        return task.tarefaConfig?.prazo?.nome || '';
      case 'progresso':
        return getChecklistProgress(task);
      case 'contato':
        return task.contact?.name || '';
      case 'status':
        return task.status || '';
      case 'creator':
        return task.creator?.name || '';
      case 'departamento':
        return task.departamento?.nome || '';
      case 'dueDate':
        return task.dueDate || '';
      default:
        return '';
    }
  };

  // Aplicar filtros e ordenação
  const getFilteredAndSortedTasks = () => {
    let filtered = [...tasks];

    // Aplicar filtros por coluna
    Object.entries(columnFilters).forEach(([columnId, filterValue]) => {
      if (filterValue) {
        // Se for array (multi-seleção)
        if (Array.isArray(filterValue) && filterValue.length > 0) {
          filtered = filtered.filter(task => {
            const cellValue = String(getCellValue(task, columnId));
            return filterValue.some(fv => cellValue === fv);
          });
        }
        // Se for string (busca livre)
        else if (typeof filterValue === 'string' && filterValue.trim() !== '') {
          filtered = filtered.filter(task => {
            const cellValue = getCellValue(task, columnId);
            return String(cellValue).toLowerCase().includes(filterValue.toLowerCase());
          });
        }
      }
    });

    // Aplicar ordenação
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = getCellValue(a, sortConfig.key);
        const bValue = getCellValue(b, sortConfig.key);
        
        if (aValue === bValue) return 0;
        
        const comparison = aValue > bValue ? 1 : -1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  };

  const filteredTasks = getFilteredAndSortedTasks();

  // Renderizar conteúdo da célula
  const renderCellContent = (task, columnId) => {
    switch (columnId) {
      case 'id':
        return (
          <Chip
            label={`#${task.id}`}
            size="small"
            variant="outlined"
            style={{
              backgroundColor: "#e3f2fd",
              color: "#1976d2",
              fontWeight: 600,
              border: "1px solid #2196f3"
            }}
          />
        );
      
      case 'tipo':
        return task.origem === 'controle' ? (
          <Chip
            label="Controle"
            size="small"
            icon={<Assignment />}
            style={{
              backgroundColor: "#e1f5fe",
              color: "#0277bd",
              fontWeight: 600,
              border: "1px solid #039be5"
            }}
          />
        ) : (
          <Chip
            label="Tarefa"
            size="small"
            icon={<Assignment />}
            style={{
              backgroundColor: "#fff3e0",
              color: "#e65100",
              fontWeight: 600,
              border: "1px solid #ff9800"
            }}
          />
        );
      
      case 'user':
        return task.user?.name === user?.name ? "Você" : task.user?.name || "-";
      
      case 'title':
        return task.tarefaConfig?.titulo || task.title;
      
      case 'codigoErp':
        return task.cliente?.codigoErp ? (
          <Chip
            label={task.cliente.codigoErp}
            size="small"
            variant="outlined"
            style={{
              backgroundColor: "#e8f5e9",
              color: "#2e7d32",
              fontWeight: 600,
              border: "1px solid #4caf50"
            }}
          />
        ) : "-";
      
      case 'cliente':
        return task.cliente?.nomeFantasia || task.cliente?.razaoSocial || "-";
      
      case 'prioridade':
        return task.prioridade ? (
          <Chip
            label={task.prioridade.nome}
            size="small"
            style={{
              backgroundColor: task.prioridade.cor || "#757575",
              color: "#fff",
            }}
          />
        ) : "-";
      
      case 'prazo':
        const prazo = task.tarefaConfig?.prazo;
        return prazo ? (
          <Chip
            label={prazo.nome}
            size="small"
            style={{
              backgroundColor: prazo.cor || "#757575",
              color: "#fff",
            }}
          />
        ) : "-";
      
      case 'progresso':
        return task.checklistProgresso && task.checklistProgresso.length > 0 ? (
          <div>
            <LinearProgress 
              variant="determinate" 
              value={getChecklistProgress(task)} 
              style={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="textSecondary">
              {getChecklistProgress(task)}% ({task.checklistProgresso.filter(i => i.concluido || i.naoAplicavel).length}/{task.checklistProgresso.length})
            </Typography>
          </div>
        ) : "-";
      
      case 'valor':
        return task.valor ? (
          <Typography variant="body2" style={{ fontWeight: 600, color: '#2e7d32' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(task.valor)}
          </Typography>
        ) : "-";
      
      case 'contato':
        return task.contact?.name || "-";
      
      case 'status':
        return (
          <Chip
            label={task.status}
            className={classes.statusChip}
            style={{
              backgroundColor: getStatusColor(task.status),
              color: "#fff",
            }}
            size="small"
          />
        );
      
      case 'creator':
        return task.creator?.name || "-";
      
      case 'departamento':
        return task.departamento?.nome || "-";
      
      case 'dueDate':
        return task.dueDate ? new Date(task.dueDate).toLocaleString("pt-BR") : "-";
      
      case 'actions':
        // Se for controle, mostrar botão de Executar Controle
        if (task.origem === 'controle') {
          return (
            <>
              <Tooltip title="Executar Controle">
                <IconButton 
                  size="small" 
                  style={{ color: "#4caf50" }}
                  onClick={() => handleOpenExecutarControleModal(task)}
                >
                  <PlayArrow fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Ver Histórico">
                <IconButton 
                  size="small" 
                  style={{ color: "#2196f3" }}
                  onClick={() => handleOpenHistoryModal(task)}
                >
                  <History fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          );
        }
        
        // Se for tarefa normal, mostrar botões padrões
        return (
          <>
            <Tooltip title="Executar Tarefa">
              <IconButton 
                size="small" 
                style={{ color: "#4caf50" }}
                onClick={() => handleOpenViewModal(task)}
              >
                <PlayArrow fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar">
              <IconButton 
                size="small" 
                color="primary"
                onClick={() => handleOpenEditModal(task)}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Alterar Status">
              <IconButton 
                size="small" 
                style={{ color: "#ff9800" }}
                onClick={() => handleOpenStatusModal(task)}
              >
                <SwapHoriz fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Ver Histórico">
              <IconButton 
                size="small" 
                style={{ color: "#2196f3" }}
                onClick={() => handleOpenHistoryModal(task)}
              >
                <History fontSize="small" />
              </IconButton>
            </Tooltip>
            {task.tarefaConfig?.aceitaArquivos && (
              <Tooltip title="Enviar Arquivos">
                <IconButton 
                  size="small" 
                  style={{ color: "#00bcd4" }}
                  onClick={() => handleOpenUploadModal(task)}
                >
                  <AttachFile fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Transferir Tarefa">
              <IconButton 
                size="small" 
                style={{ color: "#9c27b0" }}
                onClick={() => handleOpenTransferModal(task)}
              >
                <PersonAdd fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir">
              <IconButton 
                size="small" 
                color="secondary"
                onClick={() => handleDeleteTask(task.id)}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        );
      
      default:
        return "-";
    }
  };

  // ========== FIM FUNÇÕES DA TABELA AVANÇADA ==========

  // ========== FUNÇÕES DE FILTRO POR CLIQUE NOS CARDS ==========
  
  const handleCardClick = (filterType, value = null) => {
    // Limpar filtros anteriores
    setFilterStatus([]);
    setShowConcluidas(false);
    setFilterPrioridade([]);
    setFilterDepartamento([]);
    setFilterCliente([]);
    setFilterPrazo([]);
    setFilterPeriod("");
    
    // Aplicar o novo filtro
    switch (filterType) {
      case 'total':
        // Mostra todas as tarefas (limpa filtros)
        setShowConcluidas(true); // Inclui concluídas
        break;
      case 'status':
        if (value === 'Concluída') {
          setShowConcluidas(true); // Ativa checkbox para mostrar concluídas
        }
        setFilterStatus([value]);
        break;
      case 'atrasadas':
        setFilterPeriod('overdue');
        break;
      case 'prioridade':
        setFilterPrioridade([value]);
        break;
      case 'departamento':
        setFilterDepartamento([value]);
        break;
      case 'prazo':
        setFilterPrazo([value]);
        break;
      default:
        break;
    }
    
    // Scroll suave para a tabela
    setTimeout(() => {
      const tableElement = document.querySelector('.MuiPaper-root.MuiPaper-elevation3');
      if (tableElement) {
        tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // ========== FIM FUNÇÕES DE FILTRO POR CLIQUE ==========

  const loadMoreTasks = () => {
    // Só carrega mais se não estiver já carregando, se tiver mais itens, e se tiver tarefas carregadas
    if (!loadingMore && !loading && hasMore && tasks.length > 0) {
      loadTasks(true);
    }
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTask(null);
    setSelectedTarefaConfig(null);
    setTaskForm({
      title: "",
      description: "",
      dueDate: "",
      status: "Pendente",
      userId: user?.id || "",
      tarefaConfigId: null,
      prioridadeId: null,
      clienteId: null,
      departamentoId: null,
      dataHoraCriacao: new Date().toISOString().slice(0, 16),
      valor: "",
    });
  };

  const handleOpenEditModal = (task) => {
    setSelectedTask(task);
    
    // Buscar a tarefa config se existir
    const tarefaConfig = tarefasConfig.find(tc => tc.id === task.tarefaConfigId);
    setSelectedTarefaConfig(tarefaConfig || null);
    
    setTaskForm({
      title: task.title,
      description: task.description || "",
      dueDate: task.dueDate || "",
      status: task.status,
      userId: task.userId || user?.id || "",
      tarefaConfigId: task.tarefaConfigId || null,
      prioridadeId: task.prioridadeId || null,
      clienteId: task.clienteId || null,
      departamentoId: task.departamentoId || null,
      dataHoraCriacao: task.dataHoraCriacao ? new Date(task.dataHoraCriacao).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      valor: task.valor || "",
    });
    setModalOpen(true);
  };

  const handleOpenViewModal = async (task) => {
    try {
      // Busca dados completos da tarefa da API para garantir que tem checklist atualizado
      const { data } = await api.get(`/tasks/${task.id}`);
      
      // Automação: Se tarefa está Pendente, muda para Em Andamento ao iniciar execução
      if (data.status === "Pendente") {
        await api.put(`/tasks/${data.id}`, { 
          status: "Em Andamento",
          observacao: "Tarefa iniciada automaticamente"
        });
        data.status = "Em Andamento";
        toast.info("📋 Tarefa iniciada! Status alterado para 'Em Andamento'");
        loadTasks(); // Atualiza lista
      }
      
      setSelectedTask(data);
      setExecutionTime(0);
      setIsExecuting(false);
      setViewModalOpen(true);
    } catch (err) {
      console.error("Erro ao carregar tarefa:", err);
      toast.error("Erro ao carregar detalhes da tarefa");
      // Se der erro, usa os dados que vieram da listagem
      setSelectedTask(task);
      setExecutionTime(0);
      setIsExecuting(false);
      setViewModalOpen(true);
    }
  };

  const openTaskFromNotification = async (taskId) => {
    try {
      // Primeiro tenta encontrar a tarefa nas já carregadas
      let task = tasks.find(t => t.id === parseInt(taskId));
      
      // Se não encontrou, busca da API
      if (!task) {
        const { data } = await api.get(`/tasks/${taskId}`);
        task = data;
      }
      
      if (task) {
        setSelectedTask(task);
        setViewModalOpen(true);
        // Limpa o parâmetro da URL
        history.replace('/tarefas');
      } else {
        toast.warn("Tarefa não encontrada");
      }
    } catch (err) {
      console.error("Erro ao abrir tarefa:", err);
      toast.error("Erro ao carregar detalhes da tarefa");
    }
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedTask(null);
    setExecutionTime(0);
    setIsExecuting(false);
  };

  const handleOpenStatusModal = (task) => {
    setStatusTask(task);
    setNewStatus(task.status);
    setStatusModalOpen(true);
    loadTaskHistory(task.id); // Carregar histórico ao abrir modal
  };

  const handleCloseStatusModal = () => {
    setStatusModalOpen(false);
    setStatusTask(null);
    setNewStatus("");
    setStatusObservacao("");
    setTaskHistory([]); // Limpar histórico ao fechar
  };

  const handleOpenHistoryModal = (task) => {
    setHistoryModalTask(task);
    setHistoryModalOpen(true);
    loadTaskHistory(task.id);
  };

  const handleCloseHistoryModal = () => {
    setHistoryModalOpen(false);
    setHistoryModalTask(null);
    setTaskHistory([]);
  };

  const handleOpenExecutarControleModal = (task) => {
    setControleTask(task);
    setExecutarControleModalOpen(true);
  };

  const handleCloseExecutarControleModal = () => {
    setExecutarControleModalOpen(false);
    setControleTask(null);
  };

  const handleUpdateControle = (updatedTask) => {
    // Atualizar a tarefa na lista
    setTasks((prevTasks) => 
      prevTasks.map((task) => 
        task.id === updatedTask.id ? updatedTask : task
      )
    );
    // Recarregar a lista
    loadTasks();
  };

  const handleChangeStatus = async () => {
    try {
      // Verifica se mudou o status OU se tem observação
      const statusChanged = newStatus !== statusTask.status;
      const hasObservacao = statusObservacao && statusObservacao.trim() !== "";
      
      if (!statusChanged && !hasObservacao) {
        toast.warn("Selecione um novo status ou adicione uma observação");
        return;
      }

      // Se não mudou o status, mantém o status atual da tarefa
      const statusToSend = newStatus || statusTask.status;

      await api.put(`/tasks/${statusTask.id}`, { 
        status: statusToSend,
        observacao: statusObservacao 
      });
      
      if (statusChanged && hasObservacao) {
        toast.success("Status atualizado e observação adicionada com sucesso!");
      } else if (statusChanged) {
        toast.success("Status atualizado com sucesso!");
      } else {
        toast.success("Observação adicionada com sucesso!");
      }
      
      loadTasks();
      setStatusObservacao(""); // Limpa observação após salvar
      loadTaskHistory(statusTask.id); // Recarrega histórico
      
      // Fecha o modal após salvar
      handleCloseStatusModal();
    } catch (err) {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleOpenWhatsApp = (contact) => {
    if (contact) {
      setContactTicket(contact);
      setNewTicketModalOpen(true);
    }
  };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket) {
      // Usa UUID para navegação, não o ID
      history.push(`/tickets/${ticket.uuid || ticket.id}`);
    }
  };

  const handleOpenTransferModal = (task) => {
    setTransferTask(task);
    setNewUserId("");
    setTransferModalOpen(true);
    if (isAdmin) {
      loadUsers();
    }
    // Coordenador e usuário comum já tem equipeUsers ou podem transferir para qualquer um
  };

  const handleCloseTransferModal = () => {
    setTransferModalOpen(false);
    setTransferTask(null);
    setNewUserId("");
  };

  const handleTransferTask = async () => {
    try {
      await api.put(`/tasks/${transferTask.id}`, { userId: newUserId });
      toast.success("Tarefa transferida com sucesso!");
      loadTasks();
      handleCloseTransferModal();
    } catch (err) {
      toast.error("Erro ao transferir tarefa");
    }
  };

  const handleSaveTask = async () => {
    try {
      // Validações
      if (!taskForm.tarefaConfigId) {
        toast.error("Selecione uma tarefa");
        return;
      }

      if (selectedTask) {
        // Editando tarefa existente
        await api.put(`/tasks/${selectedTask.id}`, taskForm);
        toast.success("Tarefa atualizada com sucesso!");
      } else {
        // Criando nova tarefa
        await api.post("/tasks", taskForm);
        toast.success("Tarefa criada com sucesso!");
      }
      loadTasks();
      handleCloseModal();
    } catch (err) {
      toast.error("Erro ao salvar tarefa");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Deseja realmente excluir esta tarefa?")) {
      return;
    }
    
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success("Tarefa deletada com sucesso!");
      loadTasks();
    } catch (err) {
      console.error("Erro ao deletar tarefa:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Erro ao deletar tarefa";
      toast.error(errorMessage);
      // Recarrega a lista mesmo com erro para refletir mudanças
      loadTasks();
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success("Status atualizado!");
      loadTasks();
    } catch (err) {
      toast.error("Erro ao atualizar status");
    }
  };

  const getChecklistProgress = (task) => {
    if (!task.checklistProgresso || task.checklistProgresso.length === 0) {
      return 0;
    }
    // Considera concluídos E não aplicáveis como completos
    const concluidos = task.checklistProgresso.filter(item => item.concluido || item.naoAplicavel).length;
    return Math.round((concluidos / task.checklistProgresso.length) * 100);
  };

  const handleChecklistChange = async (task, index) => {
    try {
      const novoChecklist = [...task.checklistProgresso];
      novoChecklist[index].concluido = !novoChecklist[index].concluido;
      
      await api.put(`/tasks/${task.id}/checklist`, {
        checklistProgresso: novoChecklist
      });
      
      toast.success("Checklist atualizado!");
      loadTasks();
      
      // Atualizar tarefa selecionada para refletir mudança imediatamente
      const { data } = await api.get(`/tasks/${task.id}`);
      setSelectedTask(data);
    } catch (err) {
      toast.error("Erro ao atualizar checklist");
    }
  };



  const handleCompleteTaskWithoutChecklist = async () => {
    if (!executionTime || executionTime <= 0) {
      toast.warn("Informe o tempo gasto na execução da tarefa");
      return;
    }

    try {
      setIsExecuting(true);
      await api.put(`/tasks/${selectedTask.id}`, { 
        status: "Concluída",
        tempoExecucao: executionTime 
      });
      
      toast.success(`✅ Tarefa concluída com sucesso! Tempo: ${executionTime} minutos`);
      loadTasks();
      handleCloseViewModal();
    } catch (err) {
      toast.error("Erro ao concluir tarefa");
      setIsExecuting(false);
    }
  };

  const getStatusColor = (status) => {
    const statusItem = statusList.find(s => s.nome === status);
    if (statusItem) {
      return statusItem.cor;
    }
    // Fallback para cores padrão
    const colors = {
      "Pendente": "#ff9800",
      "Em Andamento": "#2196f3",
      "Concluída": "#4caf50",
      "Cancelada": "#f44336",
    };
    return colors[status] || "#757575";
  };

  const getChartData = () => {
    if (filtroGrafico === "status") {
      // Usa statusList dos parâmetros para garantir todas as cores corretas
      const statusCount = {};
      
      // Inicializa com todos os status dos parâmetros
      statusList.forEach(status => {
        statusCount[status.nome] = 0;
      });
      
      // Conta as tarefas por status
      tasks.forEach(task => {
        if (statusCount.hasOwnProperty(task.status)) {
          statusCount[task.status]++;
        } else {
          statusCount[task.status] = 1;
        }
      });

      // Filtra apenas status com tarefas (opcional: remova o filter para mostrar todos)
      const labels = Object.keys(statusCount).filter(key => statusCount[key] > 0);
      const data = labels.map(label => statusCount[label]);
      const colors = labels.map(label => {
        const status = statusList.find(s => s.nome === label);
        return status ? status.cor : '#757575';
      });

      return {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: "#fff",
          },
        ],
      };
    } else if (filtroGrafico === "departamento") {
      const deptCount = tasks.reduce((acc, task) => {
        const deptNome = task.departamento?.nome || "Sem Departamento";
        acc[deptNome] = (acc[deptNome] || 0) + 1;
        return acc;
      }, {});

      return {
        labels: Object.keys(deptCount),
        datasets: [
          {
            data: Object.values(deptCount),
            backgroundColor: [
              "#0596cd", "#047ba5", "#2196f3", "#4caf50", 
              "#ff9800", "#f44336", "#9c27b0", "#757575"
            ],
            borderWidth: 2,
            borderColor: "#fff",
          },
        ],
      };
    } else if (filtroGrafico === "usuario") {
      const userCount = tasks.reduce((acc, task) => {
        const userName = task.user?.name || "Não Atribuído";
        acc[userName] = (acc[userName] || 0) + 1;
        return acc;
      }, {});

      return {
        labels: Object.keys(userCount),
        datasets: [
          {
            data: Object.values(userCount),
            backgroundColor: [
              "#2196f3", "#4caf50", "#ff9800", "#f44336", 
              "#9c27b0", "#0596cd", "#047ba5", "#757575"
            ],
            borderWidth: 2,
            borderColor: "#fff",
          },
        ],
      };
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
    },
    onClick: (event, elements, chart) => {
      if (elements.length > 0) {
        const elementIndex = elements[0].index;
        const label = chart.data.labels[elementIndex];
        
        // Determinar tipo de filtro baseado no label
        const statusNames = statusList.map(s => s.nome);
        const prioridadeNames = prioridades.map(p => p.nome);
        const departamentoNames = departamentos.map(d => d.nome);
        const prazoNames = prazosList.map(p => p.nome);
        
        if (statusNames.includes(label)) {
          handleCardClick('status', label);
        } else if (prioridadeNames.includes(label)) {
          const prioridade = prioridades.find(p => p.nome === label);
          if (prioridade) handleCardClick('prioridade', prioridade.id);
        } else if (departamentoNames.includes(label)) {
          const departamento = departamentos.find(d => d.nome === label);
          if (departamento) handleCardClick('departamento', departamento.id);
        } else if (prazoNames.includes(label)) {
          const prazo = prazosList.find(p => p.nome === label);
          if (prazo) handleCardClick('prazo', prazo.id);
        }
      }
    }
  };

  return (
    <div className={classes.root}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        initialContact={contactTicket}
        onClose={(ticket) => {
          handleCloseOrOpenTicket(ticket);
        }}
      />
      
      <div className={classes.header}>
        <Typography variant="h4" gutterBottom>
          Gerenciamento de Tarefas
        </Typography>
        <Button
          variant="contained"
          className={classes.addButton}
          startIcon={<Add />}
          onClick={handleOpenModal}
        >
          Nova Tarefa
        </Button>
      </div>

      {/* Filtros Avançados - MOVIDO PARA CIMA */}
      <Paper className={classes.filtersContainer} elevation={2} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
            🔍 Filtros Avançados
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={showConcluidas}
                onChange={(e) => setShowConcluidas(e.target.checked)}
                color="primary"
              />
            }
            label="Mostrar tarefas concluídas"
          />
        </div>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              className={classes.searchField}
              placeholder="Pesquisar por título, descrição..."
              variant="outlined"
              size="small"
              fullWidth
              value={searchParam}
              onChange={(e) => setSearchParam(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Autocomplete
              multiple
              size="small"
              options={clientes.sort((a, b) => {
                const nomeA = (a.nomeFantasia || a.razaoSocial || a.nome || '').toLowerCase();
                const nomeB = (b.nomeFantasia || b.razaoSocial || b.nome || '').toLowerCase();
                return nomeA.localeCompare(nomeB, 'pt-BR');
              })}
              getOptionLabel={(option) => {
                if (!option) return '';
                const codigo = option.codigoErp ? `[${option.codigoErp}] ` : '';
                const nome = option.nomeFantasia || option.razaoSocial || option.nome || '';
                return `${codigo}${nome}`;
              }}
              value={clientes.filter(c => filterCliente.includes(c.id))}
              onChange={(event, newValue) => {
                setFilterCliente(newValue.map(v => v.id));
                setPage(1);
              }}
              filterOptions={(options, state) => {
                if (!state.inputValue) return options;
                const input = state.inputValue.toLowerCase().trim();
                const inputDigits = input.replace(/\D/g, '');
                
                return options.filter(option => {
                  if (!option) return false;
                  
                  // Busca por código ERP
                  const codigoErp = (option.codigoErp || '').toString().toLowerCase();
                  if (codigoErp && codigoErp.includes(input)) return true;
                  
                  // Busca por nome fantasia
                  const nomeFantasia = (option.nomeFantasia || '').toLowerCase();
                  if (nomeFantasia && nomeFantasia.includes(input)) return true;
                  
                  // Busca por razão social
                  const razaoSocial = (option.razaoSocial || '').toLowerCase();
                  if (razaoSocial && razaoSocial.includes(input)) return true;
                  
                  // Busca por nome (caso exista)
                  const nome = (option.nome || '').toLowerCase();
                  if (nome && nome.includes(input)) return true;
                  
                  // Busca por CNPJ (apenas números)
                  const cnpj = (option.cnpj || '').replace(/\D/g, '');
                  if (cnpj && inputDigits && cnpj.includes(inputDigits)) return true;
                  
                  // Busca por CPF (apenas números)
                  const cpf = (option.cpf || '').replace(/\D/g, '');
                  if (cpf && inputDigits && cpf.includes(inputDigits)) return true;
                  
                  return false;
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Cliente"
                  placeholder="Código, Nome, CNPJ/CPF..."
                  className={classes.filterField}
                />
              )}
              renderOption={(option) => (
                <div style={{ width: '100%', padding: '4px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      {option.codigoErp && (
                        <span style={{ 
                          fontWeight: 600, 
                          color: '#1976d2',
                          marginRight: 8,
                          fontSize: '0.85rem'
                        }}>
                          [{option.codigoErp}]
                        </span>
                      )}
                      <span style={{ fontWeight: 500 }}>
                        {option.nomeFantasia || option.razaoSocial || option.nome}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666', marginTop: 2 }}>
                    {option.razaoSocial && option.nomeFantasia && option.razaoSocial !== option.nomeFantasia && (
                      <div>{option.razaoSocial}</div>
                    )}
                    {(option.cnpj || option.cpf) && (
                      <div style={{ marginTop: 2 }}>
                        <span style={{ fontWeight: 500 }}>
                          {option.cnpj ? 'CNPJ: ' : 'CPF: '}
                        </span>
                        {option.cnpj || option.cpf}
                      </div>
                    )}
                  </div>
                </div>
              )}
              noOptionsText="Nenhum cliente encontrado"
              loadingText="Carregando..."
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            {isAdmin && (
              <FormControl variant="outlined" size="small" className={classes.filterField} fullWidth>
                <InputLabel>Visualizar</InputLabel>
                <Select
                  value={filterScope}
                  onChange={(e) => {
                    setFilterScope(e.target.value);
                    setPage(1);
                  }}
                  label="Visualizar"
                >
                  <MenuItem value="mine">Minhas Tarefas</MenuItem>
                  <MenuItem value="all">Todas da Equipe</MenuItem>
                  <MenuItem value="user">De um Usuário</MenuItem>
                </Select>
              </FormControl>
            )}
          </Grid>

          {isAdmin && filterScope === "user" && (
            <Grid item xs={12} sm={6} md={2}>
              <Autocomplete
                multiple
                size="small"
                options={users}
                getOptionLabel={(option) => option.name || ''}
                value={users.filter(u => selectedUserId.includes(u.id))}
                onChange={(event, newValue) => {
                  setSelectedUserId(newValue.map(v => v.id));
                  setPage(1);
                }}
                filterOptions={(options, state) => {
                  if (!state.inputValue) return options;
                  const input = state.inputValue.toLowerCase().trim();
                  return options.filter(option => 
                    (option.name || '').toLowerCase().includes(input) ||
                    (option.email || '').toLowerCase().includes(input)
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Usuário"
                    placeholder="Digite para buscar..."
                    className={classes.filterField}
                  />
                )}
              />
            </Grid>
          )}

          <Grid item xs={12} sm={6} md={2}>
            <Autocomplete
              multiple
              size="small"
              options={statusList}
              getOptionLabel={(option) => option.nome || ''}
              value={statusList.filter(s => filterStatus.includes(s.nome))}
              onChange={(event, newValue) => {
                setFilterStatus(newValue.map(v => v.nome));
                setPage(1);
              }}
              filterOptions={(options, state) => {
                if (!state.inputValue) return options;
                const input = state.inputValue.toLowerCase().trim();
                return options.filter(option => 
                  (option.nome || '').toLowerCase().includes(input)
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Status"
                  placeholder="Digite para buscar..."
                  className={classes.filterField}
                />
              )}
              renderOption={(option) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    backgroundColor: option.cor || '#757575',
                    marginRight: 8 
                  }}></span>
                  {option.nome}
                </div>
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Autocomplete
              multiple
              size="small"
              options={prioridades}
              getOptionLabel={(option) => option.nome || ''}
              value={prioridades.filter(p => filterPrioridade.includes(p.id))}
              onChange={(event, newValue) => {
                setFilterPrioridade(newValue.map(v => v.id));
                setPage(1);
              }}
              filterOptions={(options, state) => {
                if (!state.inputValue) return options;
                const input = state.inputValue.toLowerCase().trim();
                return options.filter(option => 
                  (option.nome || '').toLowerCase().includes(input)
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Prioridade"
                  placeholder="Digite para buscar..."
                  className={classes.filterField}
                />
              )}
              renderOption={(option) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {option.cor && (
                    <span style={{ 
                      display: 'inline-block', 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      backgroundColor: option.cor,
                      marginRight: 8 
                    }}></span>
                  )}
                  {option.nome}
                </div>
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Autocomplete
              multiple
              size="small"
              options={departamentos}
              getOptionLabel={(option) => option.nome || ''}
              value={departamentos.filter(d => filterDepartamento.includes(d.id))}
              onChange={(event, newValue) => {
                setFilterDepartamento(newValue.map(v => v.id));
                setPage(1);
              }}
              filterOptions={(options, state) => {
                if (!state.inputValue) return options;
                const input = state.inputValue.toLowerCase().trim();
                return options.filter(option => 
                  (option.nome || '').toLowerCase().includes(input) ||
                  (option.descricao || '').toLowerCase().includes(input)
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Departamento"
                  placeholder="Digite para buscar..."
                  className={classes.filterField}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Autocomplete
              multiple
              size="small"
              options={prazosList}
              getOptionLabel={(option) => option.nome || ''}
              value={prazosList.filter(p => filterPrazo.includes(p.id))}
              onChange={(event, newValue) => {
                setFilterPrazo(newValue.map(v => v.id));
                setPage(1);
              }}
              filterOptions={(options, state) => {
                if (!state.inputValue) return options;
                const input = state.inputValue.toLowerCase().trim();
                return options.filter(option => 
                  (option.nome || '').toLowerCase().includes(input)
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Prazo"
                  placeholder="Digite para buscar..."
                  className={classes.filterField}
                />
              )}
              renderOption={(option) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {option.cor && (
                    <span style={{ 
                      display: 'inline-block', 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      backgroundColor: option.cor,
                      marginRight: 8 
                    }}></span>
                  )}
                  {option.nome}
                </div>
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl variant="outlined" size="small" className={classes.filterField} fullWidth>
              <InputLabel>Período</InputLabel>
              <Select
                value={filterPeriod}
                onChange={(e) => {
                  setFilterPeriod(e.target.value);
                  setPage(1);
                }}
                label="Período"
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="today">Hoje</MenuItem>
                <MenuItem value="week">Próximos 7 dias</MenuItem>
                <MenuItem value="month">Próximos 30 dias</MenuItem>
                <MenuItem value="overdue">Atrasadas</MenuItem>
                <MenuItem value="custom">Personalizado</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl variant="outlined" size="small" className={classes.filterField} fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={filterTipo}
                onChange={(e) => {
                  setFilterTipo(e.target.value);
                  setPage(1);
                }}
                label="Tipo"
              >
                <MenuItem value="todas">Todas</MenuItem>
                <MenuItem value="tarefa">Tarefas</MenuItem>
                <MenuItem value="controle">Controles</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {filterPeriod === 'custom' && (
            <>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Data Inicial"
                  type="date"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Data Final"
                  type="date"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <Button
              size="small"
              onClick={() => {
                setFilterScope("mine");
                setSelectedUserId([]);
                setFilterStatus([]);
                setFilterPeriod("");
                setFilterPrioridade([]);
                setFilterDepartamento([]);
                setFilterCliente([]);
                setFilterPrazo([]);
                setFilterTipo("todas");
                setSearchParam("");
                setStartDate("");
                setEndDate("");
                setPage(1);
              }}
            >
              Limpar Filtros
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Cards de Estatísticas - Layout Profissional */}
      <Grid container spacing={2} style={{ marginBottom: 24 }}>
        
        {/* Card Total */}
        <Grid item xs={6} sm={4} md={3} lg={2.4}>
          <Paper 
            elevation={2} 
            onClick={() => handleCardClick('total')}
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              color: '#fff', 
              padding: '20px 16px', 
              borderRadius: '12px',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <Assignment style={{ fontSize: 36, opacity: 0.8, marginBottom: 8 }} />
              <Typography variant="body2" style={{ opacity: 0.95, fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Total
              </Typography>
              <Typography variant="h4" style={{ fontWeight: 700, marginTop: 8 }}>
                {totalCount}
              </Typography>
            </div>
          </Paper>
        </Grid>

        {/* Card Pendentes */}
        <Grid item xs={6} sm={4} md={3} lg={2.4}>
          <Paper 
            elevation={2} 
            onClick={() => handleCardClick('status', 'Pendente')}
            style={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
              color: '#fff', 
              padding: '20px 16px', 
              borderRadius: '12px',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <Schedule style={{ fontSize: 36, opacity: 0.8, marginBottom: 8 }} />
              <Typography variant="body2" style={{ opacity: 0.95, fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Pendentes
              </Typography>
              <Typography variant="h4" style={{ fontWeight: 700, marginTop: 8 }}>
                {tasks.filter(t => t.status === "Pendente").length}
              </Typography>
            </div>
          </Paper>
        </Grid>

        {/* Card Andamento */}
        <Grid item xs={6} sm={4} md={3} lg={2.4}>
          <Paper 
            elevation={2} 
            onClick={() => handleCardClick('status', 'Em Andamento')}
            style={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
              color: '#fff', 
              padding: '20px 16px', 
              borderRadius: '12px',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <TrendingUp style={{ fontSize: 36, opacity: 0.8, marginBottom: 8 }} />
              <Typography variant="body2" style={{ opacity: 0.95, fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Andamento
              </Typography>
              <Typography variant="h4" style={{ fontWeight: 700, marginTop: 8 }}>
                {tasks.filter(t => t.status === "Em Andamento").length}
              </Typography>
            </div>
          </Paper>
        </Grid>

        {/* Card Concluídas */}
        <Grid item xs={6} sm={4} md={3} lg={2.4}>
          <Paper 
            elevation={2} 
            onClick={() => handleCardClick('status', 'Concluída')}
            style={{ 
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
              color: '#fff', 
              padding: '20px 16px', 
              borderRadius: '12px',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <CheckCircle style={{ fontSize: 36, opacity: 0.8, marginBottom: 8 }} />
              <Typography variant="body2" style={{ opacity: 0.95, fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Concluídas
              </Typography>
              <Typography variant="h4" style={{ fontWeight: 700, marginTop: 8 }}>
                {tasks.filter(t => t.status === "Concluída").length}
              </Typography>
            </div>
          </Paper>
        </Grid>

        {/* Card Atrasadas */}
        <Grid item xs={6} sm={4} md={3} lg={2.4}>
          <Paper 
            elevation={2} 
            onClick={() => handleCardClick('atrasadas')}
            style={{ 
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 
              color: '#fff', 
              padding: '20px 16px', 
              borderRadius: '12px',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <Warning style={{ fontSize: 36, opacity: 0.8, marginBottom: 8 }} />
              <Typography variant="body2" style={{ opacity: 0.95, fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Atrasadas
              </Typography>
              <Typography variant="h4" style={{ fontWeight: 700, marginTop: 8 }}>
                {tasks.filter(t => {
                  if (!t.dueDate) return false;
                  return new Date(t.dueDate) < new Date() && t.status !== "Concluída";
                }).length}
              </Typography>
            </div>
          </Paper>
        </Grid>

        {/* Card Clientes */}
        <Grid item xs={6} sm={4} md={3} lg={2.4}>
          <Paper elevation={2} style={{ 
            background: '#fff', 
            color: '#333', 
            padding: '20px 16px', 
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}>
            <div style={{ textAlign: 'center' }}>
              <Business style={{ fontSize: 36, opacity: 0.5, marginBottom: 8, color: '#667eea' }} />
              <Typography variant="body2" style={{ fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.5, color: '#666' }}>
                Clientes
              </Typography>
              <Typography variant="h4" style={{ fontWeight: 700, marginTop: 8, color: '#333' }}>
                {new Set(tasks.filter(t => t.clienteId).map(t => t.clienteId)).size}
              </Typography>
            </div>
          </Paper>
        </Grid>

        {/* Card Departamentos */}
        <Grid item xs={6} sm={4} md={3} lg={2.4}>
          <Paper elevation={2} style={{ 
            background: '#fff', 
            color: '#333', 
            padding: '20px 16px', 
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}>
            <div style={{ textAlign: 'center' }}>
              <Business style={{ fontSize: 36, opacity: 0.5, marginBottom: 8, color: '#f093fb' }} />
              <Typography variant="body2" style={{ fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.5, color: '#666' }}>
                Departamentos
              </Typography>
              <Typography variant="h4" style={{ fontWeight: 700, marginTop: 8, color: '#333' }}>
                {new Set(tasks.filter(t => t.departamentoId).map(t => t.departamentoId)).size}
              </Typography>
            </div>
          </Paper>
        </Grid>

        {/* Card Usuários */}
        <Grid item xs={6} sm={4} md={3} lg={2.4}>
          <Paper elevation={2} style={{ 
            background: '#fff', 
            color: '#333', 
            padding: '20px 16px', 
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}>
            <div style={{ textAlign: 'center' }}>
              <People style={{ fontSize: 36, opacity: 0.5, marginBottom: 8, color: '#4facfe' }} />
              <Typography variant="body2" style={{ fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.5, color: '#666' }}>
                Usuários
              </Typography>
              <Typography variant="h4" style={{ fontWeight: 700, marginTop: 8, color: '#333' }}>
                {new Set(tasks.filter(t => t.userId).map(t => t.userId)).size}
              </Typography>
            </div>
          </Paper>
        </Grid>

        {/* Card Com Prazo */}
        <Grid item xs={6} sm={4} md={3} lg={2.4}>
          <Paper elevation={2} style={{ 
            background: '#fff', 
            color: '#333', 
            padding: '20px 16px', 
            borderRadius: '12px',
            border: '1px solid #e0e0e0',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}>
            <div style={{ textAlign: 'center' }}>
              <CalendarToday style={{ fontSize: 36, opacity: 0.5, marginBottom: 8, color: '#43e97b' }} />
              <Typography variant="body2" style={{ fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.5, color: '#666' }}>
                Com Prazo
              </Typography>
              <Typography variant="h4" style={{ fontWeight: 700, marginTop: 8, color: '#333' }}>
                {tasks.filter(t => t.dueDate).length}
              </Typography>
            </div>
          </Paper>
        </Grid>

      </Grid>

      {/* Gráficos Analíticos */}
      <Grid container spacing={2} style={{ marginBottom: 24 }}>
        
        {/* Gráfico por Status */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} style={{ padding: 20, borderRadius: 12, cursor: 'pointer' }} title="Clique em um status para filtrar">
            <Typography variant="h6" gutterBottom style={{ fontWeight: 600, color: '#333' }}>
              📊 Por Status
            </Typography>
            <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {tasks.length > 0 ? (
                <Doughnut data={getChartData()} options={chartOptions} />
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Nenhuma tarefa cadastrada
                </Typography>
              )}
            </div>
          </Paper>
        </Grid>

        {/* Gráfico por Prioridade */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} style={{ padding: 20, borderRadius: 12, cursor: 'pointer' }} title="Clique em uma prioridade para filtrar">
            <Typography variant="h6" gutterBottom style={{ fontWeight: 600, color: '#333' }}>
              🎯 Por Prioridade
            </Typography>
            <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {tasks.length > 0 ? (
                <Doughnut 
                  data={{
                    labels: prioridades.map(p => p.nome),
                    datasets: [{
                      data: prioridades.map(p => 
                        tasks.filter(t => t.prioridadeId === p.id).length
                      ),
                      backgroundColor: [
                        '#f44336', '#ff9800', '#4caf50', '#2196f3',
                      ],
                    }]
                  }}
                  options={chartOptions}
                />
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Nenhuma tarefa cadastrada
                </Typography>
              )}
            </div>
          </Paper>
        </Grid>

        {/* Gráfico por Departamento */}
        {(isAdmin || isCoordenador) && (
          <Grid item xs={12} md={4}>
            <Paper elevation={2} style={{ padding: 20, borderRadius: 12, cursor: 'pointer' }} title="Clique em um departamento para filtrar">
              <Typography variant="h6" gutterBottom style={{ fontWeight: 600, color: '#333' }}>
                🏢 Por Departamento
              </Typography>
              <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {tasks.length > 0 ? (
                  <Doughnut 
                    data={{
                      labels: departamentos.map(d => d.nome),
                      datasets: [{
                        data: departamentos.map(d => 
                          tasks.filter(t => t.departamentoId === d.id).length
                        ),
                        backgroundColor: [
                          '#3f51b5', '#e91e63', '#009688', '#ff9800', 
                          '#9c27b0', '#4caf50', '#00bcd4', '#ff5722'
                        ],
                        borderWidth: 2,
                        borderColor: "#fff",
                      }]
                    }}
                    options={chartOptions}
                  />
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Nenhuma tarefa cadastrada
                  </Typography>
                )}
              </div>
            </Paper>
          </Grid>
        )}

        {/* Gráfico por Usuário */}
        {(isAdmin || isCoordenador) && (
          <Grid item xs={12} md={4}>
            <Paper elevation={2} style={{ padding: 20, borderRadius: 12 }}>
              <Typography variant="h6" gutterBottom style={{ fontWeight: 600, color: '#333' }}>
                👥 Por Usuário
              </Typography>
              <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {tasks.length > 0 ? (
                  <Doughnut 
                    data={{
                      labels: users.slice(0, 8).map(u => u.name),
                      datasets: [{
                        data: users.slice(0, 8).map(u => 
                          tasks.filter(t => t.userId === u.id).length
                        ),
                        backgroundColor: [
                          '#2196f3', '#4caf50', '#ff9800', '#f44336', 
                          '#9c27b0', '#0596cd', '#047ba5', '#757575'
                        ],
                        borderWidth: 2,
                        borderColor: "#fff",
                      }]
                    }}
                    options={chartOptions}
                  />
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Nenhuma tarefa cadastrada
                  </Typography>
                )}
              </div>
            </Paper>
          </Grid>
        )}

        {/* Gráfico por Prazo */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} style={{ padding: 20, borderRadius: 12, cursor: 'pointer' }} title="Clique em um prazo para filtrar">
            <Typography variant="h6" gutterBottom style={{ fontWeight: 600, color: '#333' }}>
              ⏱️ Por Prazo
            </Typography>
            <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {tasks.length > 0 && prazosList.length > 0 ? (
                <Doughnut 
                  data={{
                    labels: prazosList.map(p => p.nome),
                    datasets: [{
                      data: prazosList.map(p => 
                        tasks.filter(t => {
                          const prazoId = t.tarefaConfig?.prazoId || t.prazoId;
                          return prazoId === p.id;
                        }).length
                      ),
                      backgroundColor: [
                        '#00bcd4', '#03a9f4', '#2196f3', '#3f51b5',
                        '#673ab7', '#9c27b0', '#e91e63', '#f44336'
                      ],
                      borderWidth: 2,
                      borderColor: "#fff",
                    }]
                  }}
                  options={chartOptions}
                />
              ) : (
                <Typography variant="body2" color="textSecondary">
                  {prazosList.length === 0 ? "Nenhum prazo cadastrado" : "Nenhuma tarefa cadastrada"}
                </Typography>
              )}
            </div>
          </Paper>
        </Grid>

      </Grid>

      <Paper className={classes.tablePaper} elevation={3}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Typography variant="h6">
            Lista de Tarefas ({filteredTasks.length})
          </Typography>
          
          <div className={classes.tableToolbar}>
            <Tooltip title="Mostrar/Ocultar Colunas">
              <Button
                size="small"
                startIcon={<ViewColumn />}
                onClick={(e) => setColumnVisibilityMenuAnchor(e.currentTarget)}
                variant="outlined"
              >
                Colunas
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
          </div>
        </div>

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

        {/* Menu de filtro profissional */}
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
                        <Search fontSize="small" />
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

        <TableContainer>
          <DragDropContext onDragEnd={handleColumnDragEnd}>
            <Table>
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
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {/* Cabeçalho com drag handle e ordenação */}
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <span 
                                    {...provided.dragHandleProps}
                                    className={classes.dragHandle}
                                  >
                                    <DragIndicator fontSize="small" />
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

                                  {/* Ícone de filtro */}
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
                                        <FilterList fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </div>
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
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={tableColumns.filter(c => c.visible).length} align="center">
                      <Typography variant="body2" color="textSecondary">
                        {Object.values(columnFilters).some(v => v) 
                          ? "Nenhuma tarefa encontrada com os filtros aplicados."
                          : "Nenhuma tarefa encontrada. Clique em 'Nova Tarefa' para começar."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => (
                    <TableRow key={task.id} hover>
                      {tableColumns.filter(col => col.visible).map((column) => (
                        <TableCell 
                          key={`${task.id}-${column.id}`}
                          style={{ 
                            width: column.width,
                            minWidth: column.width
                          }}
                        >
                          {renderCellContent(task, column.id)}
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
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Typography variant="body2" color="textSecondary">
              Carregando mais tarefas...
            </Typography>
          </div>
        )}
        
        {!hasMore && tasks.length > 0 && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Typography variant="body2" color="textSecondary">
              Todas as tarefas foram carregadas
            </Typography>
          </div>
        )}
        
        {loadingMore && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Typography variant="body2" color="textSecondary">
              Carregando mais tarefas...
            </Typography>
          </div>
        )}
        
        {!hasMore && tasks.length > 0 && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Typography variant="body2" color="textSecondary">
              Todas as tarefas foram carregadas
            </Typography>
          </div>
        )}
      </Paper>

      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>{selectedTask ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
        <DialogContent>
          {/* Seleção de Tarefa */}
          <Autocomplete
            options={tarefasConfig}
            getOptionLabel={(option) => option.titulo || ""}
            value={selectedTarefaConfig}
            autoHighlight
            openOnFocus
            clearOnEscape
            onChange={(event, newValue) => {
              setSelectedTarefaConfig(newValue);
              const newDueDate = newValue?.temVencimento && newValue?.diasParaVencimento 
                ? new Date(new Date(taskForm.dataHoraCriacao).getTime() + (newValue.diasParaVencimento * 24 * 60 * 60 * 1000)).toISOString().slice(0, 16)
                : "";
              setTaskForm({ 
                ...taskForm, 
                tarefaConfigId: newValue?.id || null,
                title: newValue?.titulo || "",
                description: newValue?.descricao || "",
                departamentoId: newValue?.departamentoId || null,
                dueDate: newDueDate,
                valor: newValue?.valorReferencial || "",
                clienteId: newValue?.tarefaInterna ? null : taskForm.clienteId
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tarefa *"
                variant="outlined"
                margin="dense"
                fullWidth
                placeholder="Clique para selecionar uma tarefa..."
                style={{ marginBottom: 16, marginTop: 8 }}
              />
            )}
            noOptionsText="Nenhuma tarefa encontrada"
            loadingText="Carregando tarefas..."
          />

          {selectedTarefaConfig && (
            <Paper style={{ padding: 16, marginBottom: 16, backgroundColor: '#f5f5f5' }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Detalhes da Tarefa
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Descrição:</strong> {selectedTarefaConfig.descricao || "Sem descrição"}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Tem Vencimento:</strong> {selectedTarefaConfig.temVencimento ? "Sim" : "Não"}
              </Typography>
              {selectedTarefaConfig.temVencimento && (
                <>
                  <Typography variant="body2" gutterBottom>
                    <strong>Dias para Vencimento:</strong> {selectedTarefaConfig.diasParaVencimento || 0} dias
                  </Typography>
                  {selectedTarefaConfig.diasLembrete && (
                    <Typography variant="body2" gutterBottom>
                      <strong>Lembrete antes do vencimento:</strong> {selectedTarefaConfig.diasLembrete} dias
                    </Typography>
                  )}
                </>
              )}
              {selectedTarefaConfig.checklist && selectedTarefaConfig.checklist.length > 0 && (
                <>
                  <Typography variant="subtitle2" style={{ marginTop: 8 }} gutterBottom>
                    Checklist:
                  </Typography>
                  {selectedTarefaConfig.checklist.map((item, index) => (
                    <Typography key={index} variant="body2" style={{ paddingLeft: 16 }}>
                      • {typeof item === 'string' ? item : (item.text || item.texto || '')}
                    </Typography>
                  ))}
                </>
              )}
            </Paper>
          )}

          {/* Campo Descrição - Editável */}
          <TextField
            label="Descrição"
            variant="outlined"
            margin="dense"
            fullWidth
            multiline
            rows={3}
            value={taskForm.description || ""}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            placeholder="Descreva detalhes ou observações sobre esta tarefa..."
            style={{ marginBottom: 16 }}
          />

          {/* Campo Valor - Editável (oculto se tarefa for interna) */}
          {!selectedTarefaConfig?.tarefaInterna && (
            <TextField
              label="Valor (R$)"
              variant="outlined"
              margin="dense"
              fullWidth
              type="number"
              inputProps={{ step: "0.01", min: "0" }}
              value={taskForm.valor || ""}
              onChange={(e) => setTaskForm({ ...taskForm, valor: e.target.value })}
              placeholder="0,00"
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Cliente - Oculto se tarefa for interna */}
          {!selectedTarefaConfig?.tarefaInterna && (
            <Autocomplete
              options={clientes}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                const codigo = option.codigoErp || option.id;
                const nome = option.nomeFantasia || option.razaoSocial || option.nome || '';
                const doc = option.cnpj || option.cpf || '';
                return `[${codigo}] ${nome}${doc ? ' - ' + doc : ''}`;
              }}
              filterOptions={(options, state) => {
                if (!state.inputValue) return options;
                
                const input = state.inputValue.toLowerCase().trim();
                const inputDigits = input.replace(/\D/g, '');
                
                return options.filter(option => {
                  const codigo = (option.codigoErp || '').toString().toLowerCase();
                  const nome = (option.nomeFantasia || option.razaoSocial || option.nome || '').toLowerCase();
                  const cnpj = (option.cnpj || '').replace(/\D/g, '');
                  const cpf = (option.cpf || '').replace(/\D/g, '');
                  
                  // Busca por nome
                  if (nome.includes(input)) return true;
                  
                  // Busca por código ERP
                  if (codigo.includes(input)) return true;
                  
                  // Busca por CNPJ/CPF (somente números)
                  if (inputDigits && (cnpj.includes(inputDigits) || cpf.includes(inputDigits))) return true;
                  
                  return false;
                });
              }}
              value={clientes.find(c => c.id === taskForm.clienteId) || null}
              onChange={(event, newValue) => {
                setTaskForm({ ...taskForm, clienteId: newValue?.id || null });
              }}
              autoHighlight
              openOnFocus
              clearOnBlur
              selectOnFocus
              handleHomeEndKeys
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cliente"
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  placeholder="Digite código, nome ou CNPJ/CPF..."
                  style={{ marginBottom: 16 }}
                />
              )}
            />
          )}
          
          <FormControl fullWidth variant="outlined" style={{ marginBottom: 16 }}>
            <InputLabel>Prioridade</InputLabel>
            <Select
              value={taskForm.prioridadeId || ""}
              onChange={(e) => setTaskForm({ ...taskForm, prioridadeId: e.target.value || null })}
              label="Prioridade"
            >
              <MenuItem value="">
                <em>Nenhuma</em>
              </MenuItem>
              {prioridades.map((prioridade) => (
                <MenuItem key={prioridade.id} value={prioridade.id}>
                  <span style={{ 
                    display: 'inline-block', 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    backgroundColor: prioridade.cor || '#757575',
                    marginRight: 8 
                  }}></span>
                  {prioridade.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {(isAdmin || isCoordenador) && (
            <FormControl fullWidth variant="outlined" style={{ marginBottom: 16 }}>
              <InputLabel>Atribuir para Usuário</InputLabel>
              <Select
                value={taskForm.userId || ""}
                onChange={(e) => setTaskForm({ ...taskForm, userId: e.target.value || null })}
                label="Atribuir para Usuário"
              >
                <MenuItem value="">
                  <em>Não atribuído</em>
                </MenuItem>
                {(isAdmin ? users : equipeUsers).map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.name} {isCoordenador && !isAdmin && u.id === user.id ? "(Você)" : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            margin="dense"
            label="Data/Hora de Criação *"
            type="datetime-local"
            fullWidth
            variant="outlined"
            value={taskForm.dataHoraCriacao}
            InputProps={{
              readOnly: true,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            style={{ marginBottom: 16 }}
            helperText="Data de criação é automática e não pode ser alterada"
          />

          {selectedTarefaConfig?.temVencimento && (
            <TextField
              margin="dense"
              label="Data/Hora de Vencimento"
              type="datetime-local"
              fullWidth
              variant="outlined"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              InputLabelProps={{
                shrink: true,
              }}
              style={{ marginBottom: 16 }}
              helperText={`Calculado automaticamente: ${selectedTarefaConfig.diasParaVencimento} dias após a criação`}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={handleSaveTask}
            color="primary"
            variant="contained"
            disabled={
              !taskForm.dataHoraCriacao || 
              !taskForm.tarefaConfigId
            }
          >
            {selectedTask ? "Atualizar" : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Execução de Tarefa */}
      <Dialog open={viewModalOpen} onClose={handleCloseViewModal} maxWidth="md" fullWidth>
        <DialogTitle style={{ 
          background: "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)", 
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <PlayArrow />
          Executar Tarefa
        </DialogTitle>
        <DialogContent dividers style={{ padding: "24px" }}>
          {selectedTask && (
            <>
              {/* Informações da Tarefa */}
              <Paper style={{ padding: 20, marginBottom: 20, backgroundColor: '#f5f5f5' }}>
                <Typography variant="h6" gutterBottom style={{ color: "#1976d2", fontWeight: 600 }}>
                  {selectedTask.title}
                </Typography>
                
                <Grid container spacing={2} style={{ marginTop: 8 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">
                      RESPONSÁVEL
                    </Typography>
                    <Typography variant="body1" style={{ fontWeight: 500 }}>
                      {selectedTask.user?.name === user?.name ? "Você" : selectedTask.user?.name || "-"}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">
                      STATUS
                    </Typography>
                    <div style={{ marginTop: 4 }}>
                      <Chip
                        label={selectedTask.status}
                        style={{
                          backgroundColor: getStatusColor(selectedTask.status),
                          color: "#fff",
                          fontWeight: 600,
                        }}
                        size="small"
                      />
                    </div>
                  </Grid>

                  {selectedTask.cliente && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">
                        CLIENTE
                      </Typography>
                      <Typography variant="body1">
                        {selectedTask.cliente.nomeFantasia || selectedTask.cliente.razaoSocial}
                      </Typography>
                    </Grid>
                  )}

                  {selectedTask.prioridade && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">
                        PRIORIDADE
                      </Typography>
                      <div style={{ marginTop: 4 }}>
                        <Chip
                          label={selectedTask.prioridade.nome}
                          size="small"
                          style={{
                            backgroundColor: selectedTask.prioridade.cor || "#757575",
                            color: "#fff",
                          }}
                        />
                      </div>
                    </Grid>
                  )}

                  {selectedTask.dueDate && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">
                        PRAZO DE CONCLUSÃO
                      </Typography>
                      <Typography variant="body1" style={{ 
                        color: new Date(selectedTask.dueDate) < new Date() && selectedTask.status !== "Concluída" ? "#f44336" : "inherit",
                        fontWeight: new Date(selectedTask.dueDate) < new Date() && selectedTask.status !== "Concluída" ? 600 : 400
                      }}>
                        {new Date(selectedTask.dueDate).toLocaleString("pt-BR")}
                        {new Date(selectedTask.dueDate) < new Date() && selectedTask.status !== "Concluída" && " ⚠️ Atrasada"}
                      </Typography>
                    </Grid>
                  )}

                  {selectedTask.contact && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">
                        CONTATO
                      </Typography>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Typography variant="body1">
                          {selectedTask.contact.name}
                        </Typography>
                        <IconButton
                          size="small"
                          style={{ color: "#25D366" }}
                          onClick={() => handleOpenWhatsApp(selectedTask.contact)}
                          title="Abrir Ticket WhatsApp"
                        >
                          <WhatsApp fontSize="small" />
                        </IconButton>
                      </div>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">
                      CRIADO EM
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(selectedTask.createdAt).toLocaleString("pt-BR")} por {selectedTask.creator?.name || "-"}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Descrição */}
              {selectedTask.description && (
                <Paper style={{ padding: 16, marginBottom: 20, backgroundColor: '#fff3e0' }}>
                  <Typography variant="subtitle2" gutterBottom style={{ fontWeight: 600 }}>
                    📋 Descrição da Tarefa
                  </Typography>
                  <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedTask.description}
                  </Typography>
                </Paper>
              )}

              {/* Checklist - SE EXISTIR */}
              {selectedTask.checklistProgresso && selectedTask.checklistProgresso.length > 0 ? (
                <Paper style={{ padding: 20, backgroundColor: '#e8f5e9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Typography variant="h6" style={{ fontWeight: 600 }}>
                      ✓ Checklist de Execução
                    </Typography>
                    <Chip 
                      label={`${selectedTask.checklistProgresso.filter(i => i.concluido || i.naoAplicavel).length}/${selectedTask.checklistProgresso.length} concluídos`}
                      style={{ 
                        backgroundColor: getChecklistProgress(selectedTask) === 100 ? "#4caf50" : "#ff9800",
                        color: "#fff",
                        fontWeight: 600
                      }}
                    />
                  </div>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={getChecklistProgress(selectedTask)} 
                    style={{ 
                      height: 12, 
                      borderRadius: 6, 
                      marginBottom: 20,
                      backgroundColor: '#c8e6c9'
                    }}
                  />
                  
                  {selectedTask.checklistProgresso.map((item, index) => (
                    <Paper 
                      key={index} 
                      elevation={1}
                      style={{ 
                        padding: 12,
                        marginBottom: 8,
                        backgroundColor: item.concluido ? '#c8e6c9' : item.naoAplicavel ? '#e0e0e0' : '#fff',
                        transition: 'all 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <FormControlLabel
                        style={{ flex: 1 }}
                        control={
                          <Checkbox
                            checked={item.concluido}
                            onChange={() => handleChecklistChange(selectedTask, index)}
                            color="primary"
                            disabled={selectedTask.status === "Concluída" || item.naoAplicavel}
                          />
                        }
                        label={
                          <Typography 
                            variant="body1"
                            style={{ 
                              textDecoration: item.concluido || item.naoAplicavel ? 'line-through' : 'none',
                              color: item.naoAplicavel ? '#999' : item.concluido ? '#666' : '#000',
                              fontWeight: item.concluido ? 400 : 500
                            }}
                          >
                            {item.texto}
                            {item.naoAplicavel && <Chip label="Não Aplicável" size="small" style={{ marginLeft: 8, backgroundColor: '#757575', color: '#fff' }} />}
                          </Typography>
                        }
                      />
                      {!item.concluido && !item.naoAplicavel && selectedTask.status !== "Concluída" && (
                        <Button
                          size="small"
                          variant="outlined"
                          style={{ marginLeft: 8, minWidth: 140 }}
                          onClick={async () => {
                            try {
                              const novoChecklist = [...selectedTask.checklistProgresso];
                              novoChecklist[index].naoAplicavel = true;
                              
                              await api.put(`/tasks/${selectedTask.id}/checklist`, {
                                checklistProgresso: novoChecklist
                              });
                              
                              toast.info("Item marcado como não aplicável");
                              const { data } = await api.get(`/tasks/${selectedTask.id}`);
                              setSelectedTask(data);
                              loadTasks();
                            } catch (err) {
                              toast.error("Erro ao atualizar checklist");
                            }
                          }}
                        >
                          Não Aplicável
                        </Button>
                      )}
                      {item.naoAplicavel && selectedTask.status !== "Concluída" && (
                        <Button
                          size="small"
                          variant="text"
                          style={{ marginLeft: 8 }}
                          onClick={async () => {
                            try {
                              const novoChecklist = [...selectedTask.checklistProgresso];
                              novoChecklist[index].naoAplicavel = false;
                              
                              await api.put(`/tasks/${selectedTask.id}/checklist`, {
                                checklistProgresso: novoChecklist
                              });
                              
                              toast.info("Marcação removida");
                              const { data } = await api.get(`/tasks/${selectedTask.id}`);
                              setSelectedTask(data);
                              loadTasks();
                            } catch (err) {
                              toast.error("Erro ao atualizar checklist");
                            }
                          }}
                        >
                          Desfazer
                        </Button>
                      )}
                    </Paper>
                  ))}

                  {getChecklistProgress(selectedTask) === 100 && selectedTask.status !== "Concluída" && (
                    <Paper style={{ padding: 16, marginTop: 16, backgroundColor: '#4caf50', color: '#fff' }}>
                      <Typography variant="body1" style={{ fontWeight: 600, textAlign: 'center' }}>
                        🎉 Parabéns! Todas as etapas foram concluídas ou marcadas como não aplicáveis!
                      </Typography>
                      <Typography variant="body2" style={{ textAlign: 'center', marginTop: 8 }}>
                        A tarefa foi marcada como "Concluída" automaticamente.
                      </Typography>
                    </Paper>
                  )}
                </Paper>
              ) : (
                /* Tarefa SEM Checklist - Campo de Tempo */
                selectedTask.status !== "Concluída" && (
                  <Paper style={{ padding: 20, backgroundColor: '#fff3e0' }}>
                    <Typography variant="h6" gutterBottom style={{ fontWeight: 600 }}>
                      ⏱️ Registro de Execução
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      Esta tarefa não possui checklist. Informe o tempo gasto para executá-la e clique em "Concluir Tarefa".
                    </Typography>
                    <TextField
                      label="Tempo de Execução (minutos)"
                      type="number"
                      fullWidth
                      variant="outlined"
                      value={executionTime}
                      onChange={(e) => setExecutionTime(parseInt(e.target.value) || 0)}
                      InputProps={{
                        inputProps: { min: 1 }
                      }}
                      helperText="Informe quantos minutos você levou para executar esta tarefa"
                    />
                    <Button
                      variant="contained"
                      fullWidth
                      style={{ 
                        marginTop: 16,
                        background: "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
                        color: "#fff",
                        fontWeight: 600,
                        padding: "12px"
                      }}
                      onClick={handleCompleteTaskWithoutChecklist}
                      disabled={isExecuting || !executionTime || executionTime <= 0}
                    >
                      ✓ Concluir Tarefa
                    </Button>
                  </Paper>
                )
              )}

              {/* Mensagem se já estiver concluída */}
              {selectedTask.status === "Concluída" && (
                <Paper style={{ padding: 16, marginTop: 16, backgroundColor: '#e8f5e9', border: '2px solid #4caf50' }}>
                  <Typography variant="h6" style={{ color: '#2e7d32', fontWeight: 600, textAlign: 'center' }}>
                    ✅ Esta tarefa já foi concluída!
                  </Typography>
                </Paper>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions style={{ padding: "16px 24px" }}>
          <Button onClick={handleCloseViewModal} color="primary" variant="outlined">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Alteração de Status */}
      <Dialog open={statusModalOpen} onClose={handleCloseStatusModal} maxWidth="sm" fullWidth>
        <DialogTitle>Alterar Status da Tarefa</DialogTitle>
        <DialogContent>
          {statusTask && (
            <>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Tarefa: <strong>{statusTask.title}</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom style={{ marginBottom: 16 }}>
                Status atual: <Chip label={statusTask.status} size="small" style={{ backgroundColor: getStatusColor(statusTask.status), color: "#fff" }} />
              </Typography>
              
              <FormControl fullWidth variant="outlined" style={{ marginBottom: 16 }}>
                <InputLabel>Novo Status</InputLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  label="Novo Status"
                >
                  {statusList.map((status) => (
                    <MenuItem key={status.id} value={status.nome}>
                      <span style={{ 
                        display: 'inline-block', 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        backgroundColor: status.cor || '#757575',
                        marginRight: 8 
                      }}></span>
                      {status.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                label="Observação (Opcional)"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                value={statusObservacao}
                onChange={(e) => setStatusObservacao(e.target.value)}
                placeholder="Descreva o que foi feito ou o motivo da mudança de status..."
                helperText="Esta observação será registrada no histórico da tarefa"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusModal} color="default">
            Fechar
          </Button>
          <Button
            onClick={handleChangeStatus}
            color="primary"
            variant="contained"
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Histórico de Alterações */}
      <Dialog open={historyModalOpen} onClose={handleCloseHistoryModal} maxWidth="md" fullWidth>
        <DialogTitle style={{ background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <History />
            Histórico de Alterações
          </div>
        </DialogTitle>
        <DialogContent style={{ padding: 0 }}>
          {historyModalTask && (
            <>
              <div style={{ padding: 16, backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="body2" color="textSecondary">
                  Tarefa: <strong>{historyModalTask.title}</strong>
                </Typography>
              </div>
              
              {loadingHistory ? (
                <div style={{ padding: 32, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Carregando histórico...</Typography>
                </div>
              ) : taskHistory.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Nenhum histórico encontrado</Typography>
                </div>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow style={{ backgroundColor: '#fafafa' }}>
                        <TableCell><strong>Data/Hora</strong></TableCell>
                        <TableCell><strong>Usuário</strong></TableCell>
                        <TableCell><strong>Status Atual</strong></TableCell>
                        <TableCell><strong>Descrição</strong></TableCell>
                        {user && <TableCell align="center"><strong>Ações</strong></TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {taskHistory.map((history, index) => {
                        let previousValue, newValue;
                        try {
                          previousValue = history.previousValue ? JSON.parse(history.previousValue) : null;
                          newValue = history.newValue ? JSON.parse(history.newValue) : null;
                        } catch (e) {
                          previousValue = null;
                          newValue = null;
                        }

                        const getActionLabel = (actionType) => {
                          switch (actionType) {
                            case 'created': return 'Criada';
                            case 'status_changed': return 'Status alterado';
                            case 'transferred': return 'Transferida';
                            case 'deleted': return 'Excluída';
                            case 'updated': return 'Atualizada';
                            default: return 'Ação';
                          }
                        };

                        return (
                          <TableRow key={history.id} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa' }}>
                            <TableCell>
                              {new Date(history.createdAt).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                            <TableCell>{history.performer?.name || 'Sistema'}</TableCell>
                            <TableCell>
                              {newValue && newValue.status ? (
                                <Chip 
                                  label={newValue.status} 
                                  size="small" 
                                  style={{ 
                                    backgroundColor: getStatusColor(newValue.status), 
                                    color: '#fff'
                                  }} 
                                />
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>
                              {editingHistoryId === history.id ? (
                                <TextField
                                  fullWidth
                                  multiline
                                  rows={2}
                                  variant="outlined"
                                  size="small"
                                  value={editingNotes}
                                  onChange={(e) => setEditingNotes(e.target.value)}
                                  placeholder="Edite a descrição..."
                                />
                              ) : (
                                <div>
                                  <Typography variant="body2" style={{ fontWeight: 500 }}>
                                    {getActionLabel(history.actionType)}
                                  </Typography>
                                  {history.actionType === 'status_changed' && previousValue && newValue && (
                                    <Typography variant="caption" color="textSecondary">
                                      De: {previousValue.status} → Para: {newValue.status}
                                    </Typography>
                                  )}
                                  {history.actionType === 'transferred' && (
                                    <Typography variant="caption" color="textSecondary">
                                      De: {history.fromUser?.name || 'N/A'} → Para: {history.toUser?.name || 'N/A'}
                                    </Typography>
                                  )}
                                  {history.notes && (
                                    <Typography variant="body2" style={{ marginTop: 4, fontStyle: 'italic', color: '#666' }}>
                                      💬 {history.notes}
                                    </Typography>
                                  )}
                                </div>
                              )}
                            </TableCell>
                            {user && (
                              <TableCell align="center">
                                {editingHistoryId === history.id ? (
                                  <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                                    <IconButton 
                                      size="small" 
                                      onClick={handleCancelEditHistory}
                                      title="Cancelar"
                                    >
                                      <Delete fontSize="small" />
                                    </IconButton>
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => handleSaveEditHistory(history.id)}
                                      title="Salvar"
                                    >
                                      <CheckCircle fontSize="small" />
                                    </IconButton>
                                  </div>
                                ) : history.performedBy === user.id ? (
                                  <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleEditHistory(history)}
                                      title="Editar descrição"
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton 
                                      size="small" 
                                      color="secondary"
                                      onClick={() => {
                                        if (window.confirm("Deseja realmente excluir este registro?")) {
                                          handleDeleteHistory(history.id);
                                        }
                                      }}
                                      title="Excluir registro"
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </div>
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistoryModal} color="primary" variant="outlined">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Transferência de Tarefa */}
      <Dialog open={transferModalOpen} onClose={handleCloseTransferModal} maxWidth="xs" fullWidth>
        <DialogTitle>Transferir Tarefa</DialogTitle>
        <DialogContent>
          {transferTask && (
            <>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Tarefa: <strong>{transferTask.title}</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom style={{ marginBottom: 16 }}>
                Responsável atual: <strong>{transferTask.user?.name}</strong>
              </Typography>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Transferir para</InputLabel>
                <Select
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  label="Transferir para"
                >
                  {/* Admin vê todos, Coordenador vê sua equipe, Usuário vê usuários do seu departamento */}
                  {(isAdmin ? users : isCoordenador ? equipeUsers : users)
                    .filter((u) => u.id !== transferTask.userId)
                    .map((u) => (
                      <MenuItem key={u.id} value={u.id}>
                        {u.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              {((isAdmin ? users : isCoordenador ? equipeUsers : users).filter((u) => u.id !== transferTask.userId).length === 0) && (
                <Typography variant="caption" color="error" style={{ marginTop: 8, display: 'block' }}>
                  Não há outros usuários disponíveis para transferência
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransferModal} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={handleTransferTask}
            color="primary"
            variant="contained"
            disabled={!newUserId}
          >
            Transferir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Upload de Arquivos */}
      <Dialog open={uploadModalOpen} onClose={handleCloseUploadModal} maxWidth="md" fullWidth>
        <DialogTitle style={{ background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AttachFile />
            Gerenciar Arquivos da Tarefa
          </div>
        </DialogTitle>
        <DialogContent style={{ paddingTop: 16 }}>
          {uploadTask && (
            <>
              <div style={{ marginBottom: 16 }}>
                <Typography variant="body2" color="textSecondary">
                  Tarefa: <strong>{uploadTask.title}</strong>
                </Typography>
              </div>

              {/* Upload de novos arquivos */}
              <Paper elevation={2} style={{ padding: 16, marginBottom: 16, backgroundColor: '#f5f5f5' }}>
                <Typography variant="h6" gutterBottom style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CloudDownload />
                  Enviar Novos Arquivos
                </Typography>
                <input
                  accept="*"
                  style={{ display: 'none' }}
                  id="upload-file-input"
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                />
                <label htmlFor="upload-file-input">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    style={{ marginBottom: 8 }}
                  >
                    Selecionar Arquivo(s)
                  </Button>
                </label>
                {selectedFiles.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <Typography variant="body2" gutterBottom>
                      Arquivos selecionados:
                    </Typography>
                    {selectedFiles.map((file, index) => (
                      <Chip
                        key={index}
                        label={`${file.name} (${(file.size / 1024).toFixed(2)} KB)`}
                        size="small"
                        style={{ marginRight: 4, marginBottom: 4 }}
                        onDelete={() => {
                          const newFiles = selectedFiles.filter((_, i) => i !== index);
                          setSelectedFiles(newFiles);
                        }}
                      />
                    ))}
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleUploadFiles}
                      disabled={loadingUpload}
                      style={{ marginTop: 8 }}
                    >
                      {loadingUpload ? "Enviando..." : "Enviar Arquivo(s)"}
                    </Button>
                  </div>
                )}
              </Paper>

              {/* Lista de arquivos já enviados */}
              <Paper elevation={2} style={{ padding: 16 }}>
                <Typography variant="h6" gutterBottom>
                  Arquivos Enviados ({uploadedFiles.length})
                </Typography>
                {uploadedFiles.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" style={{ textAlign: 'center', padding: 16 }}>
                    Nenhum arquivo enviado ainda
                  </Typography>
                ) : (
                  <List>
                    {uploadedFiles.map((file, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText
                            primary={file.originalName}
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="textSecondary">
                                  Tamanho: {(file.size / 1024).toFixed(2)} KB | 
                                  Enviado em: {new Date(file.uploadedAt).toLocaleString('pt-BR')}
                                </Typography>
                              </>
                            }
                          />
                          <Tooltip title="Baixar arquivo">
                            <IconButton
                              edge="end"
                              onClick={() => handleDownloadFile(file)}
                              style={{ marginRight: 8 }}
                            >
                              <CloudDownload />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir arquivo">
                            <IconButton
                              edge="end"
                              onClick={() => handleDeleteFile(file.fileName)}
                              color="secondary"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </ListItem>
                        {index < uploadedFiles.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Paper>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadModal} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Executar Controle */}
      <ExecutarControleModal
        open={executarControleModalOpen}
        onClose={handleCloseExecutarControleModal}
        tarefa={controleTask}
        onUpdate={handleUpdateControle}
      />
    </div>
  );
};

export default Tarefas;
