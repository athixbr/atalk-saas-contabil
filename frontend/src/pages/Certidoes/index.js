import React, { useState, useEffect, useContext } from "react";
import {
  makeStyles,
  Paper,
  Tab,
  Tabs,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from "@material-ui/core";
import {
  Search as SearchIcon,
  GetApp as DownloadIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as PendingIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
  CloudUpload as CloudUploadIcon,
  VpnKey as VpnKeyIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ErrorOutline as ErrorOutlineIcon,
  Description as DescriptionIcon,
  PlayArrow as PlayArrowIcon,
} from "@material-ui/icons";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import GerenciarCertidoesModal from "../../components/GerenciarCertidoesModal";
import LogsCertidaoModal from "../../components/LogsCertidaoModal";

// Helper para formatar datas no horário de Brasília (UTC-3)
const formatBrasilia = (dateInput, fmt = "dd/MM/yyyy HH:mm") => {
  if (!dateInput) return "-";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "-";
    const str = d.toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    // toLocaleString retorna "DD/MM/YYYY, HH:MM" - normalizar
    return str.replace(",", "").trim();
  } catch {
    return "-";
  }
};

const formatBrasiliaDate = (dateInput) => {
  if (!dateInput) return "-";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  } catch {
    return "-";
  }
};

// Formata string "YYYY-MM-DD" sem conversão de timezone (input type="date")
const parseDateInput = (dateStr) => {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d); // local date, sem UTC shift
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(3),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  tabsContainer: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(3),
  },
  tab: {
    fontWeight: 600,
    fontSize: "14px",
    textTransform: "none",
    minWidth: 120,
    "&.Mui-selected": {
      color: "#065183",
    },
  },
  searchContainer: {
    display: "flex",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
    alignItems: "center",
  },
  searchField: {
    flex: 1,
    maxWidth: 400,
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      backgroundColor: "#f5f5f5",
      "&:hover": {
        backgroundColor: "#eeeeee",
      },
      "&.Mui-focused": {
        backgroundColor: "#fff",
      },
    },
  },
  filterButton: {
    borderRadius: 12,
    textTransform: "none",
    fontWeight: 600,
    padding: "10px 24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },
  },
  categoryCard: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: 16,
    border: "2px solid #f0f0f0",
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    },
  },
  categoryHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(2),
  },
  categoryTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#333",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "bold",
  },
  federalIcon: {
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
  },
  estadualIcon: {
    backgroundColor: "#f3e5f5",
    color: "#7b1fa2",
  },
  municipalIcon: {
    backgroundColor: "#fff3e0",
    color: "#f57c00",
  },
  certidaoChip: {
    margin: theme.spacing(0.5),
    borderRadius: 8,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
    "&:hover": {
      transform: "scale(1.05)",
      boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
    },
  },
  tableContainer: {
    marginTop: theme.spacing(3),
    borderRadius: 16,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  tableHeader: {
    backgroundColor: "#f8f9fa",
    "& th": {
      fontWeight: 700,
      fontSize: "13px",
      color: "#555",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
  },
  tableRow: {
    transition: "all 0.2s",
    "&:hover": {
      backgroundColor: "#f5f5f5",
    },
  },
  statusChip: {
    fontWeight: 600,
    borderRadius: 8,
    minWidth: 100,
  },
  successChip: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
  },
  errorChip: {
    backgroundColor: "#ffebee",
    color: "#c62828",
  },
  pendingChip: {
    backgroundColor: "#fff3e0",
    color: "#ef6c00",
  },
  actionButton: {
    borderRadius: 8,
    minWidth: 36,
    height: 36,
    padding: 6,
    "&:hover": {
      transform: "scale(1.1)",
    },
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(6),
    color: "#999",
  },
  emptyStateIcon: {
    fontSize: 80,
    color: "#ddd",
    marginBottom: theme.spacing(2),
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(6),
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  statCard: {
    padding: theme.spacing(2),
    borderRadius: 12,
    textAlign: "center",
    border: "2px solid",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
    },
  },
  statValue: {
    fontSize: "32px",
    fontWeight: 700,
    marginBottom: theme.spacing(0.5),
  },
  statLabel: {
    fontSize: "13px",
    fontWeight: 500,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  scheduleCard: {
    borderRadius: 16,
    border: "2px solid #f0f0f0",
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
      borderColor: "#065183",
    },
  },
  scheduleHeader: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  scheduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
  },
  scheduleTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#333",
  },
  scheduleDate: {
    fontSize: "14px",
    color: "#666",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
  clientListContainer: {
    maxHeight: 400,
    overflowY: "auto",
    border: "1px solid #e0e0e0",
    borderRadius: 12,
    padding: theme.spacing(2),
    backgroundColor: "#fafafa",
  },
  selectedClientChip: {
    margin: theme.spacing(0.5),
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
    fontWeight: 600,
  },
  formField: {
    marginBottom: theme.spacing(2),
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
    },
  },
  addScheduleButton: {
    borderRadius: 12,
    textTransform: "none",
    fontWeight: 600,
    padding: "12px 32px",
    fontSize: "16px",
  },
  certificateCard: {
    padding: theme.spacing(4),
    borderRadius: 20,
    border: "2px solid #f0f0f0",
    textAlign: "center",
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
      borderColor: "#065183",
    },
  },
  uploadArea: {
    padding: theme.spacing(6),
    border: "3px dashed #e0e0e0",
    borderRadius: 20,
    cursor: "pointer",
    transition: "all 0.3s ease",
    backgroundColor: "#fafafa",
    "&:hover": {
      borderColor: "#065183",
      backgroundColor: "#f5f5f5",
    },
  },
  certificateIcon: {
    fontSize: 80,
    color: "#065183",
    marginBottom: theme.spacing(2),
  },
  certificateInfo: {
    padding: theme.spacing(3),
    borderRadius: 16,
    backgroundColor: "#f8f9fa",
    marginTop: theme.spacing(3),
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(1.5),
    borderBottom: "1px solid #e0e0e0",
    "&:last-child": {
      borderBottom: "none",
    },
  },
  infoLabel: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#666",
  },
  infoValue: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#333",
  },
  validChip: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    fontWeight: 700,
    padding: "4px 12px",
  },
  expiredChip: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    fontWeight: 700,
    padding: "4px 12px",
  },
  warningChip: {
    backgroundColor: "#fff3e0",
    color: "#ef6c00",
    fontWeight: 700,
    padding: "4px 12px",
  },
  uploadButton: {
    borderRadius: 12,
    textTransform: "none",
    fontWeight: 600,
    padding: "12px 32px",
    fontSize: "16px",
    marginTop: theme.spacing(2),
  },
  certificateDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: theme.spacing(2),
    marginTop: theme.spacing(3),
  },
  detailCard: {
    padding: theme.spacing(2),
    borderRadius: 12,
    border: "1px solid #e0e0e0",
    backgroundColor: "#fff",
  },
  detailTitle: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#999",
    textTransform: "uppercase",
    marginBottom: theme.spacing(1),
  },
  detailValue: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#333",
  },
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`certidoes-tabpanel-${index}`}
      aria-labelledby={`certidoes-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const Certidoes = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [searchParam, setSearchParam] = useState("");
  const [loading, setLoading] = useState(false);
  const [certidoes, setCertidoes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    emitidas: 0,
    pendentes: 0,
    erros: 0,
  });

  // Estados para gerenciamento de clientes
  const [clientes, setClientes] = useState([]);
  const [gerenciarCertidoesModalOpen, setGerenciarCertidoesModalOpen] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [searchCliente, setSearchCliente] = useState("");
  const [consultandoCertidao, setConsultandoCertidao] = useState(false);
  const [clienteConsultando, setClienteConsultando] = useState(null);
  const [selectedCertidaoId, setSelectedCertidaoId] = useState(null);
  const [logsModalOpen, setLogsModalOpen] = useState(false);

  // Estados para agendamentos
  const [agendamentos, setAgendamentos] = useState([]);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedClientes, setSelectedClientes] = useState([]);
  const [selectedCertidoesCategoriasIds, setSelectedCertidoesCategoriasIds] = useState([]);
  const [scheduleData, setScheduleData] = useState({
    data: "",
    hora: "",
    descricao: "",
    intervaloMinutos: 3,
  });
  const [editingSchedule, setEditingSchedule] = useState(null);

  // Estados para certificado digital
  const [certificado, setCertificado] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);
  const [certificatePassword, setCertificatePassword] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Estados para processar agendamento
  const [processandoAgendamento, setProcessandoAgendamento] = useState(false);
  const [agendamentoProcessando, setAgendamentoProcessando] = useState(null);

  // Estado para executar agendamento imediatamente ao criar
  const [executarImediatamente, setExecutarImediatamente] = useState(false);

  // Categorias de certidões
  const categoriasFederais = [
    { id: "ecac-fiscal", label: "E-CAC Situação Fiscal", tipo: "federal" },
    { id: "ecac-cadin", label: "E-CAC CADIN/SISBACEN", tipo: "federal" },
    { id: "ecac-postal", label: "E-CAC Caixa Postal", tipo: "federal" },
    { id: "rfb-pgfn", label: "RFB/PGFN", tipo: "federal" },
    { id: "tst", label: "TST", tipo: "federal" },
    { id: "fgts", label: "FGTS", tipo: "federal" },
    { id: "mte", label: "MTE", tipo: "federal" },
    { id: "simples-optante", label: "Simples Nacional Optante", tipo: "federal" },
    { id: "protesto", label: "Protesto", tipo: "federal" },
  ];

  const categoriasEstaduais = [
    { id: "sefaz-mt", label: "SEFAZ MT", tipo: "estadual" },
    { id: "sefaz-mt-caixa", label: "SEFAZ MT (Caixa de Entrada)", tipo: "estadual" },
    { id: "sefaz-go", label: "SEFAZ GO", tipo: "estadual" },
    { id: "sefaz-go-caixa", label: "SEFAZ GO (Caixa de Entrada)", tipo: "estadual" },
  ];

  const categoriasMunicipais = [
    { id: "prefeitura-campo-verde", label: "Prefeitura Campo Verde", tipo: "municipal" },
    { id: "prefeitura-rondonopolis", label: "Prefeitura Rondonópolis", tipo: "municipal" },
    { id: "prefeitura-cuiaba", label: "Prefeitura Cuiabá", tipo: "municipal" },
    { id: "prefeitura-sao-paulo", label: "Prefeitura São Paulo", tipo: "municipal" },
    { id: "prefeitura-sao-luis", label: "Prefeitura São Luís de Montes Belos", tipo: "municipal" },
    { id: "prefeitura-agua-boa", label: "Prefeitura Água Boa/MT", tipo: "municipal" },
    { id: "prefeitura-primavera-leste", label: "Prefeitura Primavera do Leste/MT", tipo: "municipal" },
    { id: "prefeitura-chapada-guimaraes", label: "Prefeitura Chapada dos Guimarães/MT", tipo: "municipal" },
  ];

  useEffect(() => {
    if (tabValue === 3) {
      loadClientes();
    } else {
      loadCertidoes();
    }
    // eslint-disable-next-line
  }, [tabValue, selectedCategory]);

  const loadCertidoes = async () => {
    setLoading(true);
    try {
      const tipo = tabValue === 0 ? "federal" : tabValue === 1 ? "estadual" : "municipal";
      const { data } = await api.get("/certidoes", {
        params: {
          tipo,
          categoria: selectedCategory,
          searchParam,
        },
      });
      setCertidoes(data.certidoes || []);
      setStats(data.stats || { total: 0, emitidas: 0, pendentes: 0, erros: 0 });
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const loadClientes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/clientes", {
        params: { 
          searchParam: searchCliente,
          includeCertidoes: true,
          limit: 9999 // Buscar todos os clientes
        },
      });
      setClientes(data.clientes || []);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGerenciarCertidoes = (cliente) => {
    setClienteSelecionado(cliente);
    setGerenciarCertidoesModalOpen(true);
  };

  const handleSaveCertidoes = async (clienteId, certidoesSelecionadas) => {
    try {
      await api.patch(`/clientes/${clienteId}/certidoes`, {
        certidoesSelecionadas
      });
      toast.success("Certidões atualizadas com sucesso!");
      loadClientes();
    } catch (err) {
      toastError(err);
    }
  };

  const handleCloseGerenciarCertidoesModal = () => {
    setClienteSelecionado(null);
    setGerenciarCertidoesModalOpen(false);
  };

  // Função para consultar certidões
  const handleConsultarCertidoes = async (cliente) => {
    // Verificar se cliente tem certidões selecionadas
    if (!cliente.certidoesSelecionadas || cliente.certidoesSelecionadas.length === 0) {
      toast.warning("Este cliente não possui certidões selecionadas");
      return;
    }

    const temCampoVerde = cliente.certidoesSelecionadas.some(c => c === "prefeitura-campo-verde");
    const avisoApi = temCampoVerde
      ? "\n\nCertidões via API Coplan (Prefeitura Campo Verde) serão incluídas."
      : "\n\nEsta operação terá custo na API Info Simples.";
    if (window.confirm(`Deseja consultar ${cliente.certidoesSelecionadas.length} certidão(ões) para ${cliente.nome}?${avisoApi}`)) {
      setConsultandoCertidao(true);
      setClienteConsultando(cliente.id);

      let sucessos = 0;
      let erros = 0;

      try {
        // Consultar cada certidão selecionada
        for (const categoria of cliente.certidoesSelecionadas) {
          try {
            const { data } = await api.post("/certidoes/consultar", {
              clienteId: cliente.id,
              categoria
            });

            if (data.sucesso) {
              sucessos++;
            } else {
              erros++;
            }
          } catch (err) {
            console.error(`Erro ao consultar certidão ${categoria}:`, err);
            erros++;
          }
        }

        // Recarregar certidões para atualizar o histórico
        if (tabValue === 0 || tabValue === 1 || tabValue === 2) {
          loadCertidoes();
        }

        // Mostrar resumo
        if (sucessos > 0 && erros === 0) {
          toast.success(`✅ Todas as ${sucessos} certidões foram consultadas com sucesso!`);
        } else if (sucessos > 0 && erros > 0) {
          toast.warning(`⚠️ ${sucessos} certidões consultadas com sucesso, ${erros} com erro`);
        } else {
          toast.error(`❌ Erro ao consultar certidões. Verifique os logs.`);
        }

      } catch (err) {
        toastError(err);
      } finally {
        setConsultandoCertidao(false);
        setClienteConsultando(null);
      }
    }
  };

  // Funções para modal de logs
  const handleOpenLogsModal = (certidaoId) => {
    setSelectedCertidaoId(certidaoId);
    setLogsModalOpen(true);
  };

  const handleCloseLogsModal = () => {
    setLogsModalOpen(false);
    setSelectedCertidaoId(null);
  };

  // Funções de Agendamento
  const loadAgendamentos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/certidoes/agendamentos");
      setAgendamentos(data || []);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenScheduleDialog = () => {
    setEditingSchedule(null);
    setSelectedClientes([]);
    setSelectedCertidoesCategoriasIds(["prefeitura-campo-verde"]);
    setScheduleData({ data: "", hora: "", descricao: "", intervaloMinutos: 3 });
    setExecutarImediatamente(false);
    setScheduleDialogOpen(true);
  };

  const handleCloseScheduleDialog = () => {
    setScheduleDialogOpen(false);
    setEditingSchedule(null);
    setSelectedClientes([]);
    setSelectedCertidoesCategoriasIds([]);
    setScheduleData({ data: "", hora: "", descricao: "", intervaloMinutos: 3 });
    setExecutarImediatamente(false);
  };

  const handleClienteCheckbox = (clienteId) => {
    setSelectedClientes((prev) => {
      if (prev.includes(clienteId)) {
        return prev.filter((id) => id !== clienteId);
      } else {
        return [...prev, clienteId];
      }
    });
  };

  const handleSaveAgendamento = async (executarAgora = false) => {
    if (!scheduleData.data || !scheduleData.hora) {
      toast.error("Preencha data e hora do agendamento");
      return;
    }
    if (selectedClientes.length === 0) {
      toast.error("Selecione pelo menos um cliente");
      return;
    }

    try {
      const payload = {
        data: scheduleData.data,
        hora: scheduleData.hora,
        descricao: scheduleData.descricao,
        clienteIds: selectedClientes,
        certidoesCategoriasIds: selectedCertidoesCategoriasIds,
        intervaloMinutos: scheduleData.intervaloMinutos || 3,
      };

      let agendamentoId;
      if (editingSchedule) {
        await api.put(`/certidoes/agendamentos/${editingSchedule.id}`, payload);
        toast.success("Agendamento atualizado com sucesso!");
        agendamentoId = editingSchedule.id;
      } else {
        const { data: novoAgendamento } = await api.post("/certidoes/agendamentos", payload);
        toast.success("Agendamento criado com sucesso!");
        agendamentoId = novoAgendamento?.id || novoAgendamento?.agendamento?.id;
      }

      handleCloseScheduleDialog();
      loadAgendamentos();

      // Executar imediatamente se solicitado
      if ((executarAgora || executarImediatamente) && agendamentoId) {
        setProcessandoAgendamento(true);
        setAgendamentoProcessando(agendamentoId);
        try {
          const { data: resultado } = await api.post(`/certidoes/agendamentos/${agendamentoId}/processar`);
          toast.success(
            `✅ Executado! ${resultado.sucessos || 0} certidões com sucesso, ${resultado.erros || 0} erros`
          );
          loadAgendamentos();
          if (tabValue < 3) loadCertidoes();
        } catch (execErr) {
          toastError(execErr);
        } finally {
          setProcessandoAgendamento(false);
          setAgendamentoProcessando(null);
        }
      }
    } catch (err) {
      toastError(err);
    }
  };

  const handleEditAgendamento = (agendamento) => {
    setEditingSchedule(agendamento);
    setExecutarImediatamente(false);
    setSelectedCertidoesCategoriasIds(agendamento.certidoesCategoriasIds || ["prefeitura-campo-verde"]);
    let dataFormatada = "";
    if (agendamento.data) {
      dataFormatada = String(agendamento.data).substring(0, 10);
    }
    setScheduleData({
      data: dataFormatada,
      hora: agendamento.hora || "",
      descricao: agendamento.descricao || "",
      intervaloMinutos: agendamento.intervaloMinutos || 3,
    });
    setSelectedClientes(agendamento.clienteIds || []);
    setScheduleDialogOpen(true);
  };

  const handleDeleteAgendamento = async (agendamentoId) => {
    if (window.confirm("Tem certeza que deseja excluir este agendamento?")) {
      try {
        await api.delete(`/certidoes/agendamentos/${agendamentoId}`);
        toast.success("Agendamento excluído com sucesso!");
        loadAgendamentos();
      } catch (err) {
        toastError(err);
      }
    }
  };

  const handleProcessarAgendamento = async (agendamento) => {
    if (window.confirm(`Deseja processar o agendamento agora?\n\nSerão consultadas as certidões de ${agendamento.clienteIds?.length || 0} cliente(s).\nEsta operação terá custo na API Info Simples.`)) {
      setProcessandoAgendamento(true);
      setAgendamentoProcessando(agendamento.id);

      try {
        const { data } = await api.post(`/certidoes/agendamentos/${agendamento.id}/processar`);
        
        toast.success(
          `✅ Agendamento processado!\n${data.processados} agendamento(s), ${data.sucessos} certidões com sucesso, ${data.erros} erros`
        );
        
        loadAgendamentos();
        
        // Recarregar certidões se estiver em uma aba de histórico
        if (tabValue === 0 || tabValue === 1 || tabValue === 2) {
          loadCertidoes();
        }
      } catch (err) {
        toastError(err);
      } finally {
        setProcessandoAgendamento(false);
        setAgendamentoProcessando(null);
      }
    }
  };

  useEffect(() => {
    if (tabValue === 4) {
      loadAgendamentos();
      if (clientes.length === 0) {
        loadClientes();
      }
    }
    // eslint-disable-next-line
  }, [tabValue]);

  // Funções de Certificado Digital
  const loadCertificado = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/certidoes/certificado");
      setCertificado(data || null);
    } catch (err) {
      console.error("Erro ao carregar certificado:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tabValue === 5) {
      loadCertificado();
    }
    // eslint-disable-next-line
  }, [tabValue]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.name.endsWith(".pfx") || file.name.endsWith(".p12")) {
        setCertificateFile(file);
      } else {
        toast.error("Por favor, selecione um arquivo .pfx ou .p12");
      }
    }
  };

  const handleOpenUploadDialog = () => {
    setCertificateFile(null);
    setCertificatePassword("");
    setUploadDialogOpen(true);
  };

  const handleCloseUploadDialog = () => {
    setCertificateFile(null);
    setCertificatePassword("");
    setUploadDialogOpen(false);
  };

  const handleUploadCertificate = async () => {
    if (!certificateFile) {
      toast.error("Selecione um arquivo de certificado");
      return;
    }
    if (!certificatePassword) {
      toast.error("Informe a senha do certificado");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("certificado", certificateFile);
      formData.append("password", certificatePassword);

      await api.post("/certidoes/certificado", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Certificado enviado com sucesso!");
      handleCloseUploadDialog();
      loadCertificado();
    } catch (err) {
      toastError(err);
    }
  };

  const handleDeleteCertificate = async (certificadoId) => {
    if (window.confirm("Tem certeza que deseja excluir este certificado?")) {
      try {
        await api.delete(`/certidoes/certificado/${certificadoId}`);
        toast.success("Certificado excluído com sucesso!");
        loadCertificado();
      } catch (err) {
        toastError(err);
      }
    }
  };

  const getCertificateStatus = () => {
    if (!certificado || !certificado.validade) return null;

    const hoje = new Date();
    const validade = new Date(certificado.validade);
    const diasRestantes = Math.floor((validade - hoje) / (1000 * 60 * 60 * 24));

    if (diasRestantes < 0) {
      return { status: "expired", label: "Expirado", color: "error" };
    } else if (diasRestantes <= 30) {
      return {
        status: "warning",
        label: `Expira em ${diasRestantes} dias`,
        color: "warning",
      };
    } else {
      return {
        status: "valid",
        label: `Válido (${diasRestantes} dias)`,
        color: "success",
      };
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSelectedCategory(null);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const handleDownload = async (certidao) => {
    // Para Campo Verde (Coplan): usar URL direta do DigitalOcean Spaces
    const downloadUrl = certidao?.dadosResposta?.downloadUrl;
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
      toast.success("Certidão aberta para download!");
      return;
    }
    try {
      const response = await api.get(`/certidoes/${certidao.id}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `certidao_${certidao.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Certidão baixada com sucesso!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleVisualize = async (certidao) => {
    // Para Campo Verde (Coplan): abrir URL direta do DigitalOcean Spaces
    const downloadUrl = certidao?.dadosResposta?.downloadUrl;
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
      return;
    }
    try {
      const response = await api.get(`/certidoes/${certidao.id}/visualizar`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      window.open(url, "_blank");
    } catch (err) {
      toastError(err);
    }
  };

  const handleRefresh = () => {
    loadCertidoes();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "emitida":
        return <CheckCircleIcon style={{ color: "#2e7d32" }} />;
      case "erro":
        return <ErrorIcon style={{ color: "#c62828" }} />;
      case "pendente":
        return <PendingIcon style={{ color: "#ef6c00" }} />;
      default:
        return <InfoIcon style={{ color: "#999" }} />;
    }
  };

  const getStatusChipClass = (status) => {
    switch (status) {
      case "emitida":
        return `${classes.statusChip} ${classes.successChip}`;
      case "erro":
        return `${classes.statusChip} ${classes.errorChip}`;
      case "pendente":
        return `${classes.statusChip} ${classes.pendingChip}`;
      default:
        return classes.statusChip;
    }
  };

  const renderCategoryCard = (categorias) => {
    return categorias.map((categoria) => (
      <Chip
        key={categoria.id}
        label={categoria.label}
        onClick={() => handleCategorySelect(categoria.id)}
        className={classes.certidaoChip}
        color={selectedCategory === categoria.id ? "primary" : "default"}
        variant={selectedCategory === categoria.id ? "default" : "outlined"}
      />
    ));
  };

  const renderStats = () => (
    <div className={classes.statsContainer}>
      <Paper className={classes.statCard} style={{ borderColor: "#2196f3" }}>
        <Typography className={classes.statValue} style={{ color: "#2196f3" }}>
          {stats.total}
        </Typography>
        <Typography className={classes.statLabel}>Total</Typography>
      </Paper>
      <Paper className={classes.statCard} style={{ borderColor: "#4caf50" }}>
        <Typography className={classes.statValue} style={{ color: "#4caf50" }}>
          {stats.emitidas}
        </Typography>
        <Typography className={classes.statLabel}>Emitidas</Typography>
      </Paper>
      <Paper className={classes.statCard} style={{ borderColor: "#ff9800" }}>
        <Typography className={classes.statValue} style={{ color: "#ff9800" }}>
          {stats.pendentes}
        </Typography>
        <Typography className={classes.statLabel}>Pendentes</Typography>
      </Paper>
      <Paper className={classes.statCard} style={{ borderColor: "#f44336" }}>
        <Typography className={classes.statValue} style={{ color: "#f44336" }}>
          {stats.erros}
        </Typography>
        <Typography className={classes.statLabel}>Erros</Typography>
      </Paper>
    </div>
  );

  const renderTable = () => {
    if (loading) {
      return (
        <div className={classes.loadingContainer}>
          <CircularProgress />
        </div>
      );
    }

    if (certidoes.length === 0) {
      return (
        <div className={classes.emptyState}>
          <SearchIcon className={classes.emptyStateIcon} />
          <Typography variant="h6" gutterBottom>
            Nenhuma certidão encontrada
          </Typography>
          <Typography variant="body2">
            Selecione uma categoria ou ajuste os filtros de busca
          </Typography>
        </div>
      );
    }

    return (
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table>
          <TableHead className={classes.tableHeader}>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell align="center">Nº Certidão</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Data Consulta</TableCell>
              <TableCell align="center">Data Emissão</TableCell>
              <TableCell align="center">Validade</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {certidoes.map((certidao) => (
              <TableRow key={certidao.id} className={classes.tableRow}>
                <TableCell>
                  <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                    <Avatar style={{ width: 32, height: 32, fontSize: 14 }}>
                      {(certidao.clienteNome || certidao.cliente?.nome)?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" style={{ fontWeight: 600 }}>
                        {certidao.clienteNome || certidao.cliente?.nome || "-"}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {certidao.clienteCnpj || certidao.cliente?.cnpj || certidao.cliente?.cpf || "-"}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{certidao.categoria}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                    {certidao.categoria === "prefeitura-campo-verde"
                      ? (certidao.dadosResposta?.pdfFileName
                          ? certidao.dadosResposta.pdfFileName.replace(/^certidao_/, "").replace(/_[0-9]{8}_[0-9]{6}\.pdf$/, "")
                          : "-")
                      : (certidao.dadosResposta?.certidao_emitida?.certidao_negativa ||
                         certidao.dadosResposta?.certidao_negativa ||
                         certidao.dadosResposta?.certidao ||
                         certidao.dadosResposta?.certidao_codigo ||
                         "-")}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    icon={getStatusIcon(certidao.status)}
                    label={certidao.status.toUpperCase()}
                    size="small"
                    className={getStatusChipClass(certidao.status)}
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {certidao.dadosResposta?.data_hora_consulta ||
                    certidao.dadosResposta?.normalizado_data_hora_consulta ? (
                      <>
                        {certidao.dadosResposta.data_hora_consulta ||
                          certidao.dadosResposta.normalizado_data_hora_consulta}
                      </>
                    ) : (
                      formatBrasilia(certidao.dataConsulta || certidao.updatedAt)
                    )}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {certidao.dadosResposta?.certidao_emitida?.data_emissao ||
                     certidao.dadosResposta?.emissao_data ||
                     certidao.dadosResposta?.data_emissao ? (
                      <span>
                        {certidao.dadosResposta?.certidao_emitida?.data_emissao ||
                         certidao.dadosResposta?.emissao_data ||
                         certidao.dadosResposta?.data_emissao}
                      </span>
                    ) : (
                      formatBrasiliaDate(certidao.dataEmissao)
                    )}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {certidao.dadosResposta?.certidao_emitida?.data_validade ||
                     certidao.dadosResposta?.validade_data ||
                     certidao.dadosResposta?.validade ||
                     certidao.dadosResposta?.data_validade ? (
                      <span style={{ fontWeight: 600, color: '#2e7d32' }}>
                        {certidao.dadosResposta?.certidao_emitida?.data_validade ||
                         certidao.dadosResposta?.validade_data ||
                         certidao.dadosResposta?.validade ||
                         certidao.dadosResposta?.data_validade}
                      </span>
                    ) : (
                      <span style={{ fontWeight: 600, color: '#2e7d32' }}>
                        {formatBrasiliaDate(certidao.validade)}
                      </span>
                    )}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center" style={{ gap: 8 }}>
                    {certidao.status === "emitida" && (
                      <>
                        <Tooltip title="Visualizar PDF">
                          <IconButton
                            size="small"
                            className={classes.actionButton}
                            onClick={() => handleVisualize(certidao)}
                            style={{ color: "#2196f3" }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Baixar PDF">
                          <IconButton
                            size="small"
                            className={classes.actionButton}
                            onClick={() => handleDownload(certidao)}
                            style={{ color: "#4caf50" }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    {certidao.status === "erro" && (
                      <>
                        <Tooltip title="Ver Logs de Erro">
                          <IconButton
                            size="small"
                            className={classes.actionButton}
                            onClick={() => handleOpenLogsModal(certidao.id)}
                            style={{ color: "#f44336" }}
                          >
                            <DescriptionIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={certidao.mensagemErro || "Erro ao emitir certidão"}>
                          <IconButton
                            size="small"
                            className={classes.actionButton}
                            style={{ color: "#ff9800" }}
                          >
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Certidões</Title>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        {/* Tabs */}
        <Paper className={classes.tabsContainer}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Federal" className={classes.tab} />
            <Tab label="Estadual" className={classes.tab} />
            <Tab label="Municipal" className={classes.tab} />
            <Tab label="Clientes" className={classes.tab} icon={<PeopleIcon />} />
            <Tab label="Agendamentos" className={classes.tab} icon={<ScheduleIcon />} />
            <Tab label="Certificado Digital" className={classes.tab} icon={<SecurityIcon />} />
          </Tabs>
        </Paper>

        {tabValue < 3 && (
          <>
            {/* Barra de busca e filtros */}
            <Box className={classes.searchContainer}>
              <TextField
                className={classes.searchField}
                placeholder="Buscar por cliente, CNPJ..."
                value={searchParam}
                onChange={(e) => setSearchParam(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon style={{ color: "#999" }} />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="small"
              />
              <Button
                variant="contained"
                color="primary"
                className={classes.filterButton}
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
              >
                Atualizar
              </Button>
            </Box>

            {/* Estatísticas */}
            {renderStats()}
          </>
        )}

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <Paper className={classes.categoryCard}>
            <Box className={classes.categoryHeader}>
              <Box display="flex" alignItems="center" style={{ gap: 16 }}>
                <Box className={`${classes.categoryIcon} ${classes.federalIcon}`}>
                  F
                </Box>
                <Typography className={classes.categoryTitle}>
                  Certidões Federais
                </Typography>
              </Box>
            </Box>
            <Box display="flex" flexWrap="wrap">
              {renderCategoryCard(categoriasFederais)}
            </Box>
          </Paper>
          {renderTable()}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Paper className={classes.categoryCard}>
            <Box className={classes.categoryHeader}>
              <Box display="flex" alignItems="center" style={{ gap: 16 }}>
                <Box className={`${classes.categoryIcon} ${classes.estadualIcon}`}>
                  E
                </Box>
                <Typography className={classes.categoryTitle}>
                  Certidões Estaduais
                </Typography>
              </Box>
            </Box>
            <Box display="flex" flexWrap="wrap">
              {renderCategoryCard(categoriasEstaduais)}
            </Box>
          </Paper>
          {renderTable()}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Paper className={classes.categoryCard}>
            <Box className={classes.categoryHeader}>
              <Box display="flex" alignItems="center" style={{ gap: 16 }}>
                <Box className={`${classes.categoryIcon} ${classes.municipalIcon}`}>
                  M
                </Box>
                <Typography className={classes.categoryTitle}>
                  Certidões Municipais
                </Typography>
              </Box>
            </Box>
            <Box display="flex" flexWrap="wrap">
              {renderCategoryCard(categoriasMunicipais)}
            </Box>
          </Paper>
          {renderTable()}
        </TabPanel>

        {/* Tab Panel Clientes */}
        <TabPanel value={tabValue} index={3}>
          <Box className={classes.searchContainer}>
            <TextField
              className={classes.searchField}
              placeholder="Buscar cliente por nome, CNPJ ou CPF..."
              value={searchCliente}
              onChange={(e) => setSearchCliente(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon style={{ color: "#999" }} />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              size="small"
            />
            <Button
              variant="contained"
              color="primary"
              className={classes.filterButton}
              startIcon={<RefreshIcon />}
              onClick={loadClientes}
            >
              Atualizar
            </Button>
          </Box>

          {loading ? (
            <div className={classes.loadingContainer}>
              <CircularProgress />
            </div>
          ) : clientes.length === 0 ? (
            <div className={classes.emptyState}>
              <PeopleIcon className={classes.emptyStateIcon} />
              <Typography variant="h6" gutterBottom>
                Nenhum cliente encontrado
              </Typography>
              <Typography variant="body2">
                Os clientes são cadastrados no módulo de Clientes
              </Typography>
            </div>
          ) : (
            <TableContainer component={Paper} className={classes.tableContainer}>
              <Table>
                <TableHead className={classes.tableHeader}>
                  <TableRow>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>CNPJ/CPF</TableCell>
                    <TableCell>Cidade/Estado</TableCell>
                    <TableCell align="center">Certidões</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientes.map((cliente) => (
                    <TableRow key={cliente.id} className={classes.tableRow}>
                      <TableCell>
                        <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                          <Avatar style={{ width: 32, height: 32, fontSize: 14 }}>
                            {cliente.nome?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" style={{ fontWeight: 600 }}>
                              {cliente.nome}
                            </Typography>
                            {cliente.razaoSocial && (
                              <Typography variant="caption" color="textSecondary">
                                {cliente.razaoSocial}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={
                            cliente.tipoCliente === "juridica" ? (
                              <BusinessIcon style={{ fontSize: 16 }} />
                            ) : (
                              <PersonIcon style={{ fontSize: 16 }} />
                            )
                          }
                          label={cliente.tipoCliente === "juridica" ? "PJ" : "PF"}
                          size="small"
                          color={cliente.tipoCliente === "juridica" ? "primary" : "secondary"}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {cliente.tipoCliente === "juridica" ? cliente.cnpj : cliente.cpf}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {cliente.cidade && cliente.estado
                            ? `${cliente.cidade}/${cliente.estado}`
                            : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${cliente.certidoesSelecionadas?.length || 0} certidões`}
                          size="small"
                          color="default"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" style={{ gap: 8 }}>
                          <Tooltip title="Gerenciar Certidões">
                            <IconButton
                              size="small"
                              className={classes.actionButton}
                              onClick={() => handleGerenciarCertidoes(cliente)}
                              style={{ color: "#2196f3" }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Consultar Certidões">
                            <span>
                              <IconButton
                                size="small"
                                className={classes.actionButton}
                                onClick={() => handleConsultarCertidoes(cliente)}
                                disabled={
                                  consultandoCertidao ||
                                  !cliente.certidoesSelecionadas ||
                                  cliente.certidoesSelecionadas.length === 0
                                }
                                style={{ 
                                  color: cliente.certidoesSelecionadas?.length > 0 ? "#4caf50" : "#ccc"
                                }}
                              >
                                {consultandoCertidao && clienteConsultando === cliente.id ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <PlayArrowIcon fontSize="small" />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Tab de Agendamentos */}
        <TabPanel value={tabValue} index={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" style={{ fontWeight: 700 }}>
              Gerenciar Agendamentos de Consultas
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenScheduleDialog}
              className={classes.addScheduleButton}
            >
              Novo Agendamento
            </Button>
          </Box>

          {loading ? (
            <div className={classes.loadingContainer}>
              <CircularProgress />
            </div>
          ) : agendamentos.length === 0 ? (
            <div className={classes.emptyState}>
              <ScheduleIcon className={classes.emptyStateIcon} />
              <Typography variant="h6" gutterBottom>
                Nenhum agendamento criado
              </Typography>
              <Typography variant="body2">
                Crie um agendamento para organizar as consultas de certidões
              </Typography>
            </div>
          ) : (
            <TableContainer component={Paper} className={classes.tableContainer}>
              <Table>
                <TableHead className={classes.tableHeader}>
                  <TableRow>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell>Hora</TableCell>
                    <TableCell>Clientes</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {agendamentos.map((agendamento) => (
                    <TableRow key={agendamento.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <EventIcon style={{ marginRight: 8, color: "#666" }} />
                          {agendamento.descricao || "Consulta de Certidões"}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {agendamento.data
                          ? String(agendamento.data).substring(0, 10).split("-").reverse().join("/")
                          : "-"}
                      </TableCell>
                      <TableCell>{agendamento.hora || "-"}</TableCell>
                      <TableCell>
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                          {agendamento.clienteIds?.slice(0, 3).map((clienteId) => {
                            const cliente = clientes.find((c) => c.id === clienteId);
                            return cliente ? (
                              <Chip
                                key={clienteId}
                                label={cliente.nome}
                                size="small"
                                style={{ fontSize: "0.75rem" }}
                              />
                            ) : null;
                          })}
                          {agendamento.clienteIds?.length > 3 && (
                            <Chip
                              label={`+${agendamento.clienteIds.length - 3}`}
                              size="small"
                              style={{ fontSize: "0.75rem" }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={agendamento.status === "pendente" ? "Pendente" : "Processado"}
                          size="small"
                          color={agendamento.status === "pendente" ? "default" : "primary"}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" style={{ gap: 8 }}>
                          <Tooltip title="Processar Agora">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleProcessarAgendamento(agendamento)}
                                disabled={processandoAgendamento || agendamento.status !== "pendente"}
                                style={{ 
                                  color: agendamento.status === "pendente" ? "#4caf50" : "#ccc"
                                }}
                              >
                                {processandoAgendamento && agendamentoProcessando === agendamento.id ? (
                                  <CircularProgress size={20} style={{ color: "#4caf50" }} />
                                ) : (
                                  <PlayArrowIcon />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleEditAgendamento(agendamento)}
                                disabled={agendamento.status !== "pendente"}
                                style={{ color: agendamento.status === "pendente" ? "#2196f3" : "#ccc" }}
                              >
                                <EditIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteAgendamento(agendamento.id)}
                              style={{ color: "#f44336" }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Tab de Certificado Digital */}
        <TabPanel value={tabValue} index={5}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" style={{ fontWeight: 700 }}>
              Certificado Digital A1 (PFX/P12)
            </Typography>
          </Box>

          {loading ? (
            <div className={classes.loadingContainer}>
              <CircularProgress />
            </div>
          ) : certificado && Array.isArray(certificado) && certificado.length > 0 ? (
            <Grid container spacing={3}>
              {certificado.map((cert, index) => (
                <Grid item xs={12} key={cert.id || index}>
                  <Card className={classes.certificateCard} style={{ marginBottom: 16 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                          <LockIcon className={classes.certificateIcon} />
                          <Box>
                            <Typography variant="h6" style={{ fontWeight: 700 }}>
                              Certificado Digital #{index + 1}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Tipo A1 (PFX/P12)
                            </Typography>
                          </Box>
                        </Box>

                        <Box className={classes.certificateInfo}>
                          <Box className={classes.infoRow}>
                            <Typography className={classes.infoLabel}>Tipo:</Typography>
                            <Typography className={classes.infoValue}>
                              {cert.tipo || "A1 (PFX/P12)"}
                            </Typography>
                          </Box>
                          <Box className={classes.infoRow}>
                            <Typography className={classes.infoLabel}>Emissor:</Typography>
                            <Typography className={classes.infoValue}>
                              {cert.emissor || "N/A"}
                            </Typography>
                          </Box>
                          <Box className={classes.infoRow}>
                            <Typography className={classes.infoLabel}>Titular:</Typography>
                            <Typography className={classes.infoValue}>
                              {cert.titular || cert.cn || "N/A"}
                            </Typography>
                          </Box>
                          <Box className={classes.infoRow}>
                            <Typography className={classes.infoLabel}>CPF/CNPJ:</Typography>
                            <Typography className={classes.infoValue}>
                              {cert.cpfCnpj || "N/A"}
                            </Typography>
                          </Box>
                          <Box className={classes.infoRow}>
                            <Typography className={classes.infoLabel}>Validade:</Typography>
                            <Typography className={classes.infoValue}>
                              {cert.validade
                                ? format(new Date(cert.validade), "dd/MM/yyyy", {
                                    locale: ptBR,
                                  })
                                : "N/A"}
                            </Typography>
                          </Box>
                          <Box className={classes.infoRow}>
                            <Typography className={classes.infoLabel}>Status:</Typography>
                            <Chip
                              icon={
                                (() => {
                                  const now = new Date();
                                  const validade = new Date(cert.validade);
                                  const diffInDays = Math.ceil((validade - now) / (1000 * 60 * 60 * 24));
                                  
                                  if (diffInDays < 0) return <ErrorIcon />;
                                  if (diffInDays <= 30) return <ErrorOutlineIcon />;
                                  return <CheckCircleOutlineIcon />;
                                })()
                              }
                              label={
                                (() => {
                                  const now = new Date();
                                  const validade = new Date(cert.validade);
                                  const diffInDays = Math.ceil((validade - now) / (1000 * 60 * 60 * 24));
                                  
                                  if (diffInDays < 0) return "Expirado";
                                  if (diffInDays <= 30) return `Expira em ${diffInDays} dias`;
                                  return "Válido";
                                })()
                              }
                              size="small"
                              className={
                                (() => {
                                  const now = new Date();
                                  const validade = new Date(cert.validade);
                                  const diffInDays = Math.ceil((validade - now) / (1000 * 60 * 60 * 24));
                                  
                                  if (diffInDays < 0) return classes.expiredChip;
                                  if (diffInDays <= 30) return classes.warningChip;
                                  return classes.validChip;
                                })()
                              }
                            />
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom style={{ fontWeight: 700 }}>
                          Detalhes do Certificado
                        </Typography>

                        <Box className={classes.certificateDetails}>
                          <Box className={classes.detailCard}>
                            <Typography className={classes.detailTitle}>
                              Data de Upload
                            </Typography>
                            <Typography className={classes.detailValue}>
                              {cert.dataUpload
                                ? format(new Date(cert.dataUpload), "dd/MM/yyyy HH:mm", {
                                    locale: ptBR,
                                  })
                                : "N/A"}
                            </Typography>
                          </Box>

                          <Box className={classes.detailCard}>
                            <Typography className={classes.detailTitle}>
                              Validade Inicial
                            </Typography>
                            <Typography className={classes.detailValue}>
                              {cert.dataInicio
                                ? format(new Date(cert.dataInicio), "dd/MM/yyyy", {
                                    locale: ptBR,
                                  })
                                : "N/A"}
                            </Typography>
                          </Box>

                          <Box className={classes.detailCard}>
                            <Typography className={classes.detailTitle}>
                              Validade Final
                            </Typography>
                            <Typography className={classes.detailValue}>
                              {cert.validade
                                ? format(new Date(cert.validade), "dd/MM/yyyy", {
                                    locale: ptBR,
                                  })
                                : "N/A"}
                            </Typography>
                          </Box>

                          <Box className={classes.detailCard}>
                            <Typography className={classes.detailTitle}>
                              Algoritmo
                            </Typography>
                            <Typography className={classes.detailValue}>
                              {cert.algoritmo || "RSA 2048"}
                            </Typography>
                          </Box>

                          <Box className={classes.detailCard}>
                            <Typography className={classes.detailTitle}>
                              Serial Number
                            </Typography>
                            <Typography className={classes.detailValue} style={{ fontSize: 12 }}>
                              {cert.serialNumber || "N/A"}
                            </Typography>
                          </Box>

                          <Box className={classes.detailCard}>
                            <Typography className={classes.detailTitle}>
                              Status
                            </Typography>
                            <Typography className={classes.detailValue}>
                              {cert.ativo ? "Ativo" : "Inativo"}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={12}>
                        <Box display="flex" gap={2} justifyContent="flex-end">
                          <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDeleteCertificate(cert.id)}
                            size="small"
                          >
                            Remover
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              ))}

              <Grid item xs={12}>
                <Card className={classes.certificateCard}>
                  <Box textAlign="center" p={3}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<CloudUploadIcon />}
                      onClick={handleOpenUploadDialog}
                      className={classes.uploadButton}
                      size="large"
                    >
                      Adicionar Novo Certificado
                    </Button>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Card className={classes.certificateCard}>
              <Box
                className={classes.uploadArea}
                onClick={handleOpenUploadDialog}
              >
                <CloudUploadIcon className={classes.certificateIcon} />
                <Typography variant="h6" gutterBottom style={{ fontWeight: 700 }}>
                  Nenhum Certificado Carregado
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Clique aqui ou arraste um arquivo .pfx ou .p12 para fazer upload
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CloudUploadIcon />}
                  onClick={handleOpenUploadDialog}
                  className={classes.uploadButton}
                >
                  Fazer Upload do Certificado
                </Button>
              </Box>

              <Box mt={4} p={3} style={{ backgroundColor: "#fff3e0", borderRadius: 12 }}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <LockIcon style={{ color: "#f57c00" }} />
                  <Typography variant="h6" style={{ fontWeight: 600, color: "#f57c00" }}>
                    Certificado Digital A1 (PFX/P12)
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" paragraph>
                  O Certificado Digital A1 é armazenado no computador no formato PFX ou P12 e possui validade de 1 ano. Ele será usado para:
                </Typography>
                <Typography variant="body2" color="textSecondary" component="div">
                  ✓ Autenticar nas plataformas de consulta (e-CAC, SEFAZ, etc.)
                  <br />
                  ✓ Assinar digitalmente as requisições
                  <br />
                  ✓ Garantir a segurança e autenticidade das consultas
                  <br />
                  ✓ Emitir certidões federais, estaduais e municipais
                </Typography>
              </Box>
            </Card>
          )}
        </TabPanel>
      </Paper>

      {/* Modal de Gerenciar Certidões */}
      <GerenciarCertidoesModal
        open={gerenciarCertidoesModalOpen}
        onClose={handleCloseGerenciarCertidoesModal}
        cliente={clienteSelecionado}
        onSave={handleSaveCertidoes}
      />

      {/* Modal de Logs */}
      <LogsCertidaoModal
        open={logsModalOpen}
        onClose={handleCloseLogsModal}
        certidaoId={selectedCertidaoId}
      />

      {/* Dialog de Agendamento */}
      <Dialog
        open={scheduleDialogOpen}
        onClose={handleCloseScheduleDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingSchedule ? "Editar Agendamento" : "Novo Agendamento"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Data"
                type="date"
                fullWidth
                value={scheduleData.data}
                onChange={(e) =>
                  setScheduleData({ ...scheduleData, data: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                className={classes.formField}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Hora"
                type="time"
                fullWidth
                value={scheduleData.hora}
                onChange={(e) =>
                  setScheduleData({ ...scheduleData, hora: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                className={classes.formField}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descrição"
                fullWidth
                multiline
                rows={2}
                value={scheduleData.descricao}
                onChange={(e) =>
                  setScheduleData({ ...scheduleData, descricao: e.target.value })
                }
                placeholder="Ex: Consulta mensal de certidões - Segunda-feira"
                className={classes.formField}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom style={{ fontWeight: 600 }}>
                Certidões a Consultar ({selectedCertidoesCategoriasIds.length} selecionadas)
              </Typography>
              <Box display="flex" flexWrap="wrap" style={{ gap: 8, marginBottom: 16, padding: 12, border: "1px solid #e0e0e0", borderRadius: 8 }}>
                {[
                  { id: "prefeitura-campo-verde", label: "Prefeitura Campo Verde", color: "#ff9800" },
                  { id: "rfb-pgfn", label: "RFB/PGFN", color: "#1976d2" },
                  { id: "tst", label: "TST", color: "#1976d2" },
                  { id: "fgts", label: "FGTS", color: "#1976d2" },
                  { id: "sefaz-mt", label: "SEFAZ MT", color: "#7b1fa2" },
                  { id: "sefaz-go", label: "SEFAZ GO", color: "#7b1fa2" },
                  { id: "simples-optante", label: "Simples Nacional", color: "#1976d2" },
                ].map((cat) => {
                  const selected = selectedCertidoesCategoriasIds.includes(cat.id);
                  return (
                    <Chip
                      key={cat.id}
                      label={cat.label}
                      clickable
                      onClick={() => setSelectedCertidoesCategoriasIds((prev) =>
                        prev.includes(cat.id) ? prev.filter((c) => c !== cat.id) : [...prev, cat.id]
                      )}
                      color={selected ? "primary" : "default"}
                      variant={selected ? "default" : "outlined"}
                      style={{ borderColor: selected ? undefined : cat.color, color: selected ? undefined : cat.color }}
                    />
                  );
                })}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Intervalo entre empresas (minutos)"
                type="number"
                fullWidth
                value={scheduleData.intervaloMinutos}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(60, parseInt(e.target.value, 10) || 1));
                  setScheduleData({ ...scheduleData, intervaloMinutos: val });
                }}
                InputProps={{ inputProps: { min: 1, max: 60 } }}
                helperText="Pausa entre cada empresa para não sobrecarregar o portal"
                className={classes.formField}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              {selectedClientes.length > 0 && (
                <Box
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    backgroundColor: "#e8f5e9",
                    border: "1px solid #a5d6a7",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="caption" style={{ fontWeight: 700, color: "#2e7d32", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Estimativa de duração
                  </Typography>
                  {(() => {
                    const n = selectedClientes.length;
                    const intervalo = scheduleData.intervaloMinutos || 3;
                    const minutosPorConsulta = 0.5; // ~30s da API Coplan
                    const totalMinutos = n * minutosPorConsulta + (n - 1) * intervalo;
                    const horas = Math.floor(totalMinutos / 60);
                    const minutos = Math.round(totalMinutos % 60);
                    const tempoStr = horas > 0
                      ? `~${horas}h ${minutos > 0 ? `${minutos}min` : ""}`
                      : `~${minutos}min`;
                    return (
                      <>
                        <Typography variant="h6" style={{ fontWeight: 700, color: "#1b5e20" }}>
                          {tempoStr}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {n} empresa{n !== 1 ? "s" : ""} × {intervalo}min de intervalo
                        </Typography>
                      </>
                    );
                  })()}
                </Box>
              )}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom style={{ fontWeight: 600 }}>
                Selecione os Clientes ({selectedClientes.length} selecionados)
              </Typography>
              <Paper className={classes.clientListContainer}>
                {clientes.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" align="center">
                    Nenhum cliente cadastrado
                  </Typography>
                ) : (
                  <List>
                    {clientes.map((cliente) => (
                      <ListItem key={cliente.id} dense button>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedClientes.includes(cliente.id)}
                              onChange={() => handleClienteCheckbox(cliente.id)}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" style={{ fontWeight: 600 }}>
                                {cliente.nome}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {cliente.tipoCliente === "juridica"
                                  ? cliente.cnpj
                                  : cliente.cpf}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseScheduleDialog} color="default">
            Cancelar
          </Button>
          {!editingSchedule && (
            <Button
              onClick={() => handleSaveAgendamento(true)}
              color="secondary"
              variant="contained"
              startIcon={<PlayArrowIcon />}
            >
              Criar e Executar Agora
            </Button>
          )}
          <Button
            onClick={() => handleSaveAgendamento(false)}
            color="primary"
            variant="contained"
            startIcon={<ScheduleIcon />}
          >
            {editingSchedule ? "Atualizar" : "Criar"} Agendamento
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Upload do Certificado */}
      <Dialog
        open={uploadDialogOpen}
        onClose={handleCloseUploadDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <SecurityIcon color="primary" />
            Fazer Upload do Certificado Digital
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box mb={3}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Selecione o arquivo do certificado digital A1 no formato PFX ou P12
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <input
                accept=".pfx,.p12"
                style={{ display: "none" }}
                id="certificate-file-input"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="certificate-file-input">
                <Button
                  variant="outlined"
                  color="primary"
                  component="span"
                  fullWidth
                  startIcon={<DescriptionIcon />}
                  className={classes.uploadButton}
                >
                  {certificateFile
                    ? certificateFile.name
                    : "Selecionar Certificado (.pfx ou .p12)"}
                </Button>
              </label>
              {certificateFile && (
                <Box mt={1} display="flex" alignItems="center" gap={1}>
                  <CheckCircleOutlineIcon style={{ color: "#4caf50", fontSize: 18 }} />
                  <Typography variant="caption" color="textSecondary">
                    Arquivo selecionado: {certificateFile.name} (
                    {(certificateFile.size / 1024).toFixed(2)} KB)
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Senha do Certificado"
                type="password"
                fullWidth
                value={certificatePassword}
                onChange={(e) => setCertificatePassword(e.target.value)}
                placeholder="Digite a senha do certificado"
                className={classes.formField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                }}
                helperText="A senha será armazenada de forma segura e criptografada"
              />
            </Grid>
          </Grid>

          <Box mt={3} p={2} style={{ backgroundColor: "#e8f5e9", borderRadius: 8 }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <InfoIcon style={{ color: "#4caf50", fontSize: 18 }} />
              <Typography variant="subtitle2" style={{ fontWeight: 600, color: "#2e7d32" }}>
                Requisitos do Certificado
              </Typography>
            </Box>
            <Typography variant="caption" color="textSecondary" display="block">
              ✓ Formato: PFX ou P12 (Certificado A1)
              <br />
              ✓ Válido e dentro da data de validade
              <br />
              ✓ Senha deve corresponder ao certificado
              <br />
              ✓ Certificado e-CPF ou e-CNPJ
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog} color="default">
            Cancelar
          </Button>
          <Button
            onClick={handleUploadCertificate}
            color="primary"
            variant="contained"
            startIcon={<CloudUploadIcon />}
            disabled={!certificateFile || !certificatePassword}
          >
            Fazer Upload
          </Button>
        </DialogActions>
      </Dialog>
    </MainContainer>
  );
};

export default Certidoes;
