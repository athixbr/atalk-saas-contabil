import React, { useState, useEffect, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
  Paper,
  TextField,
  Button,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  InputAdornment,
  IconButton,
  Tooltip,
  Popover,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Menu,
  Badge,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  CircularProgress,
  RadioGroup,
  Radio,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import SearchIcon from "@material-ui/icons/Search";
import InfoIcon from "@material-ui/icons/Info";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import SettingsIcon from "@material-ui/icons/Settings";
import ChecklistIcon from "@material-ui/icons/PlaylistAddCheck";
import NotificationsIcon from "@material-ui/icons/Notifications";
import AttachMoneyIcon from "@material-ui/icons/AttachMoney";
import BusinessIcon from "@material-ui/icons/Business";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import FilterListIcon from "@material-ui/icons/FilterList";
import ViewColumnIcon from "@material-ui/icons/ViewColumn";
import StarIcon from "@material-ui/icons/Star";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/Save";
import CloseIcon from "@material-ui/icons/Close";
import DragIndicatorIcon from "@material-ui/icons/DragIndicator";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    width: "100%",
    boxSizing: "border-box",
  },
  paper: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
    width: "100%",
    boxSizing: "border-box",
  },
  accordion: {
    marginBottom: theme.spacing(2),
    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
    "&:before": {
      display: "none",
    },
  },
  accordionSummary: {
    backgroundColor: "#f5f5f5",
    borderRadius: "4px",
    minHeight: "56px",
    "&.Mui-expanded": {
      minHeight: "56px",
    },
  },
  accordionTitle: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    fontWeight: 600,
    width: "100%",
  },
  accordionDetails: {
    padding: theme.spacing(3),
  },
  saveButton: {
    background: "linear-gradient(135deg, #0596cd 0%, #047ba5 100%)",
    color: "#fff",
    padding: "10px 30px",
    "&:hover": {
      background: "linear-gradient(135deg, #047ba5 0%, #035c7d 100%)",
    },
  },
  searchField: {
    marginBottom: theme.spacing(2),
  },
  tableContainer: {
    maxHeight: "400px",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
  },
  helperText: {
    fontSize: "0.75rem",
    color: "#666",
    marginTop: "4px",
  },
  tipoTarefaPanel: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    border: "1px solid #e0e0e0",
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  tipoTarefaGroup: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  tipoTarefaOption: {
    margin: 0,
    padding: theme.spacing(1),
    border: "1px solid #d7dce1",
    borderRadius: 4,
    transition: "border-color 0.15s, background-color 0.15s",
    "&:hover": {
      borderColor: theme.palette.primary.main,
      backgroundColor: "rgba(5, 150, 205, 0.04)",
    },
  },
}));

const CLIENTES_COLUMNS = [
  { id: "select", label: "", visible: true, filterable: false, sortable: false, width: 50 },
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
  { id: "grupoCliente", label: "Grupo Cliente", visible: false, filterable: true, sortable: true, width: 150 },
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
  { id: "tags", label: "Tags", visible: false, filterable: true, sortable: true, width: 150 },
  { id: "segmento", label: "Segmento", visible: false, filterable: true, sortable: true, width: 150 },
];

const meses = [
  { id: 1, nome: "Janeiro" },
  { id: 2, nome: "Fevereiro" },
  { id: 3, nome: "Março" },
  { id: 4, nome: "Abril" },
  { id: 5, nome: "Maio" },
  { id: 6, nome: "Junho" },
  { id: 7, nome: "Julho" },
  { id: 8, nome: "Agosto" },
  { id: 9, nome: "Setembro" },
  { id: 10, nome: "Outubro" },
  { id: 11, nome: "Novembro" },
  { id: 12, nome: "Dezembro" },
];

// Dias reais de cada mês. Fevereiro permite 29 (o backend só gera a tarefa
// nos anos bissextos; em anos comuns esse mês é pulado silenciosamente).
const DIAS_POR_MES = { 1: 31, 2: 29, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31 };
const DIA_ULTIMO = "ultimo";
const DIA_NAO_TEM = "nao_tem";
const DIA_ULTIMO_UTIL = "ultimo_util";
const UTIL_MAX = 20;
// "Nº dia útil": contagem de dias úteis a partir do início do mês (sáb/dom não contam,
// exceto se "Sábado Útil" estiver marcado em Prazos e Configurações)
const diasUteisOptions = Array.from({ length: UTIL_MAX }, (_, i) => `util_${i + 1}`);
const PRAZOS_FIXOS_OPTIONS = [
  { value: "antecipar_dia_anterior", label: "Antecipar para o dia anterior" },
  { value: "postergar_proximo_dia_util", label: "Postergar para o próximo dia útil" },
  { value: "manter_dia_exato", label: "Manter o dia exato" },
];

const getEmpresaSocioNome = (empresa) =>
  empresa?.nomeFantasia || empresa?.apelido || empresa?.razaoSocial || empresa?.nome || "empresa";

const buildClienteSocioRow = (socio, empresa, vinculo = {}) => {
  const empresaNome = getEmpresaSocioNome(empresa);

  return {
    id: `socio-${socio.id}-${vinculo.id || "sem-vinculo"}`,
    socioId: socio.id,
    socioVinculoId: vinculo.id,
    clienteVinculadoId: empresa?.id,
    socioEmpresaNome: empresaNome,
    isSocio: true,
    isSocioRow: true,
    classificacaoCadastro: `Sócio da empresa: ${empresaNome}`,
    tipoCliente: "socio",
    tipo: "SOCIO",
    recorrencia: "nao_recorrente",
    codigoErp: socio.codigoErp || empresa?.codigoErp || "",
    codigoSistema: socio.codigoSistema || "",
    cpf: socio.cpf || "",
    cnpj: "",
    nome: socio.nome || "",
    razaoSocial: socio.nome || "",
    nomeFantasia: empresaNome,
    apelido: socio.nome || "",
    email: socio.email || "",
    telefone: socio.telefone || "",
    celular: socio.celular || "",
    cidade: socio.cidade || "",
    estado: socio.estado || "",
    ativo: socio.ativo !== false,
  };
};

const mergeClientesSocios = (clientesBase, sociosRows) => {
  const byKey = new Map();
  [...clientesBase, ...sociosRows].forEach((item) => {
    byKey.set(String(item.id), item);
  });
  return Array.from(byKey.values());
};

const isSocioSelection = (clienteId) => String(clienteId).startsWith("socio-");

const getTipoClienteLabel = (cliente) => {
  if (cliente.isSocioRow || cliente.tipoCliente === "socio" || cliente.tipo === "SOCIO") return "Sócio";
  if (cliente.tipoCliente === "fisica" || cliente.tipo === "PF") return "PF";
  return "PJ";
};

const renderClienteCellContent = (cliente, col, value) => {
  const cellStyle = {
    width: col.width,
    minWidth: col.width,
    maxWidth: col.width,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: 12,
    padding: "4px 10px",
  };

  if (col.id === "tipoCliente") {
    return (
      <TableCell key={col.id} style={cellStyle}>
        <Chip
          label={value}
          size="small"
          color={value === "PF" ? "primary" : value === "Sócio" ? "default" : "secondary"}
        />
      </TableCell>
    );
  }

  if (col.id === "ativo") {
    return (
      <TableCell key={col.id} style={cellStyle}>
        <Chip label={value} size="small" color={value === "Sim" ? "primary" : "default"} />
      </TableCell>
    );
  }

  if (col.id === "recorrencia") {
    return (
      <TableCell key={col.id} style={cellStyle}>
        <Chip label={value} size="small" color={value === "Recorrente" ? "primary" : "default"} />
      </TableCell>
    );
  }

  if (col.id === "classificacaoCadastro") {
    return (
      <TableCell key={col.id} style={cellStyle}>
        <Chip
          label={value}
          size="small"
          color={value.includes("Sócio") || value.includes("Anexado") ? "secondary" : "default"}
        />
      </TableCell>
    );
  }

  return (
    <TableCell key={col.id} style={cellStyle} title={value !== "-" ? value : undefined}>
      {value}
    </TableCell>
  );
};

const normalizePrazosFixosValue = (value) => {
  if (value === "sim") return "antecipar_dia_anterior";
  if (value === "nao") return "manter_dia_exato";
  return value || "";
};

const isDiaSentinela = (valor) =>
  valor === DIA_ULTIMO ||
  valor === DIA_NAO_TEM ||
  valor === DIA_ULTIMO_UTIL ||
  (typeof valor === "string" && valor.startsWith("util_"));

const getDiaLabel = (valor) => {
  if (valor === DIA_ULTIMO) return "Último dia do mês";
  if (valor === DIA_NAO_TEM) return "Não tem";
  if (valor === DIA_ULTIMO_UTIL) return "Último dia útil";
  if (typeof valor === "string" && valor.startsWith("util_")) return `${valor.slice(5)}º dia útil`;
  return `Todo dia ${String(valor).padStart(2, "0")}`;
};

// Opções completas de um seletor de dia de entrega, na ordem: Não tem, 1º-20º dia útil,
// Último dia útil, Último dia do mês, Todo dia 01..maxDia
const renderDiaMenuItems = (maxDia) => [
  <MenuItem key="nao_tem" value={DIA_NAO_TEM}>Não tem</MenuItem>,
  ...diasUteisOptions.map((v) => (
    <MenuItem key={v} value={v}>{getDiaLabel(v)}</MenuItem>
  )),
  <MenuItem key="ultimo_util" value={DIA_ULTIMO_UTIL}>Último dia útil</MenuItem>,
  <MenuItem key="ultimo" value={DIA_ULTIMO}>Último dia do mês</MenuItem>,
  ...Array.from({ length: maxDia }, (_, i) => i + 1).map((dia) => (
    <MenuItem key={dia} value={dia}>{getDiaLabel(dia)}</MenuItem>
  )),
];

// Opções de Tipo de Competência: define a unidade usada no deslocamento (dia/semana/mês/ano)
const competenciaTipoOptions = [
  { value: "dia", label: "Dia" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mês" },
  { value: "ano", label: "Ano" },
];

// Placeholder/ajuda exibida no campo de valor, conforme o tipo selecionado:
// 0 = período atual, negativos = períodos anteriores, positivos = períodos seguintes
const competenciaValorInfo = {
  dia: "Ex: -1 = dia anterior, 0 = dia atual, +1 = próximo dia",
  semana: "Ex: -1 = semana anterior, 0 = semana atual, +1 = próxima semana",
  mes: "Ex: -1 = mês anterior, 0 = mês atual, +1 = próximo mês",
  ano: "Ex: -1 = ano anterior, 0 = ano atual, +1 = próximo ano",
};

// Aceita apenas número inteiro de até 4 dígitos, opcionalmente precedido de + ou -
const competenciaValorRegex = /^[-+]?\d{0,4}$/;

const TIPOS_TAREFA = [
  { value: "recorrente", label: "Recorrente" },
  { value: "ordem_servico", label: "Ordem de serviço" },
  { value: "controle_data", label: "Controle com data" },
  { value: "controle_fixo", label: "Controle fixo" },
];

const DEFAULT_FASE_CONFIG = {
  modo: "nao_aplicavel",
  dataBase: "",
  faseVencidaId: "",
  diasVencida: "",
  faseNaoIniciadaId: "",
  diasNaoIniciada: "",
};

const getFaseCor = (fase) => fase?.cor || "#f44336";

const addDaysToDate = (dateValue, daysValue) => {
  if (!dateValue) return "";
  const days = Number.parseInt(daysValue, 10) || 0;
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

// Aplica a máscara 00.00.00 conforme os dígitos são digitados
const formatClassificacao = (raw) => {
  const digits = String(raw || "").replace(/\D/g, "").slice(0, 6);
  if (digits.length > 4) return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 6)}`;
  if (digits.length > 2) return `${digits.slice(0, 2)}.${digits.slice(2, 4)}`;
  return digits;
};

export default function NovoFormularioTarefaRecorrente() {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const tipoInicial = new URLSearchParams(window.location.search).get("tipo");

  // Estados
  const [expanded, setExpanded] = useState("panel1");
  const [searchCliente, setSearchCliente] = useState("");

  // Info Gerais
  const [codigo, setCodigo] = useState("");
  const [classificacao, setClassificacao] = useState("");
  const [mininome, setMininome] = useState("");
  const [nomeTarefa, setNomeTarefa] = useState("");
  const [tipoTarefa, setTipoTarefa] = useState(tipoInicial || "recorrente");
  const [departamentoId, setDepartamentoId] = useState("");

  // Entregas Mensais - dias por mês
  const [entregasMensais, setEntregasMensais] = useState({
    1: "", 2: "", 3: "", 4: "", 5: "", 6: "",
    7: "", 8: "", 9: "", 10: "", 11: "", 12: ""
  });
  const [diaReplicarTodos, setDiaReplicarTodos] = useState("");

  // Prazos e Configurações
  const [diasAntecipacao, setDiasAntecipacao] = useState("");
  const [diasInicio, setDiasInicio] = useState("");
  const [diasConclusao, setDiasConclusao] = useState("");
  const [tipoDiasAntes, setTipoDiasAntes] = useState("");
  const [prazosFixos, setPrazosFixos] = useState("");
  const [sabadoUtil, setSabadoUtil] = useState("");
  const [competenciaTipo, setCompetenciaTipo] = useState("");
  const [competencia, setCompetencia] = useState("");
  const [exigirRobo, setExigirRobo] = useState("");
  const [passivelMulta, setPassivelMulta] = useState("");
  const [alertaGuia, setAlertaGuia] = useState("");
  const [checklistObrigatorio, setChecklistObrigatorio] = useState("");
  const [esfera, setEsfera] = useState("");
  const [notificarCliente, setNotificarCliente] = useState("");
  const [ativa, setAtiva] = useState("sim");
  const [baixarAutomatico, setBaixarAutomatico] = useState("");

  // Checklist
  const [checklistId, setChecklistId] = useState("");

  // Notificações
  const [canaisNotificacao, setCanaisNotificacao] = useState([]);
  const [emailTemplateId, setEmailTemplateId] = useState(null);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [whatsappTemplateId, setWhatsappTemplateId] = useState(null);
  const [whatsappTemplates, setWhatsappTemplates] = useState([]);

  // Financeiro
  const [valor, setValor] = useState("");

  // Clientes
  const [clientesSelecionados, setClientesSelecionados] = useState([]);
  const [sociosSelecionadosPendentes, setSociosSelecionadosPendentes] = useState([]);
  const [clientesControleData, setClientesControleData] = useState({});
  const [faseConfig, setFaseConfig] = useState(DEFAULT_FASE_CONFIG);

  // Usuários
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioResponsavelId, setUsuarioResponsavelId] = useState("");

  // Listas
  const [departamentos, setDepartamentos] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [esferas, setEsferas] = useState([]);
  const [controlesComData, setControlesComData] = useState([]);

  const [expandAll, setExpandAll] = useState(false);

  // Tabela avançada de Clientes
  const [cliColumns, setCliColumns] = useState(CLIENTES_COLUMNS);
  const [cliColFilters, setCliColFilters] = useState({});
  const [cliSort, setCliSort] = useState({ key: null, direction: "asc" });
  const [cliFilterDrawer, setCliFilterDrawer] = useState(false);
  const [cliColMenuAnchor, setCliColMenuAnchor] = useState(null);
  const [cliFilterPopover, setCliFilterPopover] = useState(null);
  const [cliActiveFilterCol, setCliActiveFilterCol] = useState(null);
  const [cliFilterSearch, setCliFilterSearch] = useState("");
  const [cliPanelSearch, setCliPanelSearch] = useState("");
  const [cliExpandedCols, setCliExpandedCols] = useState({});
  const [cliProfiles, setCliProfiles] = useState([]);
  const [cliActiveProfile, setCliActiveProfile] = useState(null);
  const [cliSavedDrawer, setCliSavedDrawer] = useState(false);
  const [cliProfileSearch, setCliProfileSearch] = useState("");
  const [cliQuickSave, setCliQuickSave] = useState("");
  const [cliSavingQuick, setCliSavingQuick] = useState(false);
  const [cliSaveDialogOpen, setCliSaveDialogOpen] = useState(false);
  const [cliProfileName, setCliProfileName] = useState("");
  const [cliSetDefault, setCliSetDefault] = useState(false);
  const [cliLoadingProfiles, setCliLoadingProfiles] = useState(false);
  const isOrdemServico = tipoTarefa === "ordem_servico";
  const isControleFixo = tipoTarefa === "controle_fixo";
  const ocultaEntregasMensais = ["ordem_servico", "controle_data", "controle_fixo"].includes(tipoTarefa);
  const ocultaCompetencia = ["ordem_servico", "controle_data", "controle_fixo"].includes(tipoTarefa);
  const ocultaClientes = isOrdemServico;
  const exibeVencimentoCliente = tipoTarefa === "controle_data";
  const exibeFaseCliente = ["controle_data", "controle_fixo"].includes(tipoTarefa);
  const exibeFaseConfig = ["controle_data", "controle_fixo"].includes(tipoTarefa);
  const faseConfigAtiva = exibeFaseConfig && faseConfig.modo === "automatico";
  const colunasControleCliente = (exibeVencimentoCliente ? 1 : 0) + (exibeFaseCliente ? 1 : 0);

  useEffect(() => {
    loadData();
    if (id) {
      loadTarefaRecorrente();
    }
  }, [id]);

  useEffect(() => {
    if (!sociosSelecionadosPendentes.length || !clientes.length) return;

    const sociosKeys = clientes
      .filter((cliente) => cliente.isSocioRow && sociosSelecionadosPendentes.includes(cliente.socioId))
      .map((cliente) => cliente.id);

    if (!sociosKeys.length) return;

    setClientesSelecionados((prev) => Array.from(new Set([...prev, ...sociosKeys])));
    setSociosSelecionadosPendentes([]);
  }, [clientes, sociosSelecionadosPendentes]);

  useEffect(() => {
    // Carregar usuários do departamento selecionado
    if (departamentoId) {
      loadUsuariosDepartamento(departamentoId);
    } else {
      setUsuarios([]);
    }
  }, [departamentoId]);

  useEffect(() => {
    if (ocultaClientes) {
      setClientesSelecionados([]);
      setClientesControleData({});
      setSociosSelecionadosPendentes([]);
    }
  }, [ocultaClientes]);

  useEffect(() => {
    if (!exibeFaseConfig) {
      setFaseConfig(DEFAULT_FASE_CONFIG);
    }
  }, [exibeFaseConfig]);

  useEffect(() => {
    // Filtrar clientes
    if (searchCliente) {
      const filtered = clientes.filter(
        (c) =>
          c.nome?.toLowerCase().includes(searchCliente.toLowerCase()) ||
          c.cpf?.includes(searchCliente) ||
          c.cnpj?.includes(searchCliente)
      );
      setClientesFiltrados(filtered);
    } else {
      setClientesFiltrados(clientes);
    }
  }, [searchCliente, clientes]);

  const loadData = async () => {
    try {
      const [depsRes, checklistsRes, clientesRes, sociosRes, templatesRes, wpTemplatesRes, esferasRes, controlesComDataRes] = await Promise.all([
        api.get("/departamentos").catch(() => ({ data: { departamentos: [] } })),
        api.get("/checklists?ativo=true").catch(() => ({ data: { checklists: [] } })),
        api.get("/clientes?limit=999999").catch(() => ({ data: { clientes: [] } })),
        api.get("/socios", {
          params: {
            pageNumber: 1,
            limit: 9999,
            ativo: true,
          },
        }).catch(() => ({ data: { socios: [] } })),
        api.get("/email-templates").catch(() => ({ data: { emailTemplates: [] } })),
        api.get("/whatsapp-templates").catch(() => ({ data: { whatsappTemplates: [] } })),
        api.get("/parametros/esfera").catch(() => ({ data: [] })),
        api.get("/parametros/controlecomdata").catch(() => ({ data: [] })),
      ]);

      const clientesRows = clientesRes.data.clientes || clientesRes.data || [];
      const sociosRows = (sociosRes.data.socios || []).flatMap((socio) => {
        const empresas = Array.isArray(socio.clientes) ? socio.clientes : [];
        return empresas.map((empresa) =>
          buildClienteSocioRow(socio, empresa, empresa.ClienteSocio || {})
        );
      });
      const clientesComSocios = mergeClientesSocios(clientesRows, sociosRows);

      setDepartamentos(depsRes.data.departamentos || depsRes.data || []);
      setChecklists(checklistsRes.data.checklists || []);
      setClientes(clientesComSocios);
      setClientesFiltrados(clientesComSocios);
      setEmailTemplates(templatesRes.data.emailTemplates || templatesRes.data || []);
      setWhatsappTemplates(wpTemplatesRes.data.whatsappTemplates || wpTemplatesRes.data || []);
      setEsferas(esferasRes.data || []);
      setControlesComData(controlesComDataRes.data || []);
      // Carregar perfis de visualização em paralelo
      cliLoadProfiles();
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    }
  };

  const loadUsuariosDepartamento = async (deptId) => {
    try {
      const { data } = await api.get(`/departamentos/${deptId}`);
      // A API de departamentos retorna os usuários dentro de data.usuarios
      setUsuarios(data.usuarios || []);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      setUsuarios([]);
    }
  };

  const loadTarefaRecorrente = async () => {
    try {
      const { data } = await api.get(`/tarefas-recorrentes/${id}`);
      
      // Informações Gerais
      setCodigo(String(data.id || data.codigo || ""));
      setClassificacao(formatClassificacao(data.classificacao || ""));
      setMininome(data.mininome || "");
      setNomeTarefa(data.nomeTarefa || data.descricao || "");
      setTipoTarefa(data.tipoTarefa || "recorrente");
      setDepartamentoId(data.departamentoId || "");
      
      // Entregas Mensais - garantir que todos os meses sejam carregados
      if (data.entregasMensais && typeof data.entregasMensais === 'object') {
        setEntregasMensais({
          1: data.entregasMensais[1] || "",
          2: data.entregasMensais[2] || "",
          3: data.entregasMensais[3] || "",
          4: data.entregasMensais[4] || "",
          5: data.entregasMensais[5] || "",
          6: data.entregasMensais[6] || "",
          7: data.entregasMensais[7] || "",
          8: data.entregasMensais[8] || "",
          9: data.entregasMensais[9] || "",
          10: data.entregasMensais[10] || "",
          11: data.entregasMensais[11] || "",
          12: data.entregasMensais[12] || "",
        });
      }

      // Prazos e Configurações - converter boolean em string "sim"/"nao"
      setDiasAntecipacao(data.diasAntecipacao !== null && data.diasAntecipacao !== undefined ? data.diasAntecipacao : "");
      setDiasInicio(data.diasInicio !== null && data.diasInicio !== undefined ? data.diasInicio : "");
      setDiasConclusao(data.diasConclusao !== null && data.diasConclusao !== undefined ? data.diasConclusao : "");
      setTipoDiasAntes(data.tipoDiasAntes || "");
      setPrazosFixos(normalizePrazosFixosValue(data.prazosFixos));
      setSabadoUtil(data.sabadoUtil === true ? "sim" : data.sabadoUtil === false ? "nao" : "");
      // Compatibilidade com registros antigos que salvaram "atual"/"anterior"
      if (data.competencia === "atual") setCompetencia("0");
      else if (data.competencia === "anterior") setCompetencia("-1");
      else setCompetencia(data.competencia || "");
      // Registros antigos não tinham tipo (dia/semana/mês/ano); como a régua antiga era mensal, assume "mês"
      if (data.competenciaTipo) setCompetenciaTipo(data.competenciaTipo);
      else if (data.competencia !== null && data.competencia !== undefined && data.competencia !== "") setCompetenciaTipo("mes");
      else setCompetenciaTipo("");
      setExigirRobo(data.exigirRobo === true ? "sim" : data.exigirRobo === false ? "nao" : "");
      setPassivelMulta(data.passivelMulta === true ? "sim" : data.passivelMulta === false ? "nao" : "");
      setAlertaGuia(data.alertaGuia === true ? "sim" : data.alertaGuia === false ? "nao" : "");
      setChecklistObrigatorio(data.checklistObrigatorio === true ? "sim" : data.checklistObrigatorio === false ? "nao" : "");
      setEsfera(data.esfera || "");
      setNotificarCliente(data.notificarCliente === true ? "sim" : data.notificarCliente === false ? "nao" : "");
      setAtiva(data.ativa === true ? "sim" : data.ativa === false ? "nao" : "");
      setBaixarAutomatico(data.baixarAutomatico === true ? "sim" : data.baixarAutomatico === false ? "nao" : "");
      setFaseConfig({
        ...DEFAULT_FASE_CONFIG,
        ...(data.faseConfig || {}),
      });

      // Checklist
      setChecklistId(data.checklistId || "");
      
      // Notificações
      setCanaisNotificacao(data.canaisNotificacao || []);
      setEmailTemplateId(data.emailTemplate || null);
      setWhatsappTemplateId(data.whatsappTemplate || null);

      // Financeiro
      setValor(data.valor !== null && data.valor !== undefined ? data.valor : "");
      
      // Carregar clientes selecionados (IDs)
      if (data.clientes && Array.isArray(data.clientes)) {
        const clientesIds = data.clientes.map(c => c.id);
        if (Array.isArray(data.socios)) {
          setSociosSelecionadosPendentes(data.socios.map((socio) => socio.id));
        }
        setClientesSelecionados(clientesIds);
        setClientesControleData(data.clientes.reduce((acc, cliente) => {
          const vinculo = cliente.TarefaRecorrenteCliente || cliente.tarefaRecorrenteCliente || {};
          acc[cliente.id] = {
            vencimento: vinculo.vencimento || "",
            controleComDataId: vinculo.controleComDataId || "",
          };
          return acc;
        }, {}));
      }
      
      // Carregar usuário responsável
      if (data.usuarioResponsavel) {
        setUsuarioResponsavelId(data.usuarioResponsavel.id || "");
      } else if (data.usuarioResponsavelId) {
        setUsuarioResponsavelId(data.usuarioResponsavelId);
      }

      // Carregar usuários do departamento
      if (data.departamentoId) {
        loadUsuariosDepartamento(data.departamentoId);
      }

      // Expandir o primeiro accordion ao editar
      setExpanded("panel1");
      
    } catch (error) {
      console.error("Erro ao carregar tarefa recorrente:", error);
      toast.error("Erro ao carregar tarefa recorrente");
    }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleExpandAll = () => {
    setExpandAll(!expandAll);
    if (!expandAll) {
      // Expandir todos - não precisa fazer nada, basta mudar o estado
    } else {
      setExpanded(false);
    }
  };

  const isAccordionExpanded = (panel) => {
    if (expandAll) return true;
    return expanded === panel;
  };

  // ===== TABELA AVANÇADA DE CLIENTES =====
  const cliGetCellValue = (cliente, colId) => {
    switch (colId) {
      case "id": return cliente.id;
      case "tipoCliente": return getTipoClienteLabel(cliente);
      case "recorrencia": return cliente.recorrencia === "nao_recorrente" ? "Não recorrente" : "Recorrente";
      case "classificacaoCadastro": return cliente.classificacaoCadastro || (cliente.isSocio ? "Cliente/Sócio" : "Cliente");
      case "codigoErp": return cliente.codigoErp || "-";
      case "documento": return (cliente.isSocioRow || cliente.tipoCliente === "socio" || cliente.tipo === "SOCIO" || cliente.tipoCliente === "fisica" || cliente.tipo === "PF")
        ? (cliente.cpf || cliente.cpfCnpj || "-")
        : (cliente.cnpj || cliente.cpfCnpj || "-");
      case "nome": return (cliente.isSocioRow || cliente.tipoCliente === "socio" || cliente.tipo === "SOCIO" || cliente.tipoCliente === "fisica" || cliente.tipo === "PF")
        ? (cliente.nome || "-")
        : (cliente.razaoSocial || cliente.nome || "-");
      case "nomeFantasia": return cliente.nomeFantasia || "-";
      case "apelido": return cliente.apelido || "-";
      case "email": return cliente.email || "-";
      case "telefone": return cliente.telefone || "-";
      case "celular": return cliente.celular || "-";
      case "cidade": return cliente.cidade || "-";
      case "estado": return cliente.estado || "-";
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
      case "grupoCliente": return cliente.grupoCliente?.nome || "-";
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
      case "tags": return cliente.tags?.nome || "-";
      case "segmento": return cliente.segmento?.nome || "-";
      default: return "-";
    }
  };

  const cliGetUnique = (colId, search = "") => {
    const vals = clientes
      .map((c) => { const v = cliGetCellValue(c, colId); return v ? String(v).trim() : ""; })
      .filter((v) => v !== "" && v !== "-");
    const unique = [...new Set(vals)];
    const filtered = search ? unique.filter((v) => v.toLowerCase().includes(search.toLowerCase())) : unique;
    return filtered.sort((a, b) => a.localeCompare(b, "pt-BR"));
  };

  const cliToggleFilterValue = (colId, value) => {
    const cur = Array.isArray(cliColFilters[colId]) ? cliColFilters[colId] : [];
    setCliColFilters((prev) => ({
      ...prev,
      [colId]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value],
    }));
  };

  const cliClearFilter = (colId) => setCliColFilters((prev) => ({ ...prev, [colId]: [] }));
  const cliClearAllFilters = () => setCliColFilters({});

  const cliHandleSort = (colId) => {
    setCliSort((prev) => {
      if (prev.key === colId) {
        if (prev.direction === "asc") return { key: colId, direction: "desc" };
        if (prev.direction === "desc") return { key: null, direction: "asc" };
      }
      return { key: colId, direction: "asc" };
    });
  };

  const cliToggleCol = (colId) =>
    setCliColumns((prev) => prev.map((c) => c.id === colId ? { ...c, visible: !c.visible } : c));

  const cliDragEnd = (result) => {
    if (!result.destination) return;
    const visible = cliColumns.filter((c) => c.visible);
    const reordered = Array.from(visible);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    let vi = 0;
    setCliColumns(cliColumns.map((c) => c.visible ? reordered[vi++] : c));
  };

  const cliGetFiltered = () => {
    let result = clientesFiltrados; // já filtrado pela busca de texto
    // filtros de coluna
    Object.entries(cliColFilters).forEach(([colId, vals]) => {
      if (!vals || !Array.isArray(vals) || vals.length === 0) return;
      result = result.filter((c) => {
        if (colId === "classificacaoCadastro" && c.isSocio && vals.includes("Cliente/Sócio")) {
          return true;
        }
        return vals.includes(String(cliGetCellValue(c, colId)).trim());
      });
    });
    // ordenação
    if (cliSort.key) {
      result = [...result].sort((a, b) => {
        const av = cliGetCellValue(a, cliSort.key);
        const bv = cliGetCellValue(b, cliSort.key);
        if (av === "-" || av == null) return 1;
        if (bv === "-" || bv == null) return -1;
        const an = parseFloat(String(av).replace(/[^\d.-]/g, ""));
        const bn = parseFloat(String(bv).replace(/[^\d.-]/g, ""));
        if (!isNaN(an) && !isNaN(bn)) return cliSort.direction === "asc" ? an - bn : bn - an;
        const c = String(av).localeCompare(String(bv), "pt-BR");
        return cliSort.direction === "asc" ? c : -c;
      });
    }
    return result;
  };

  // Perfis de visualização (reutiliza o mesmo endpoint da página de Clientes)
  const cliLoadProfiles = async () => {
    try {
      setCliLoadingProfiles(true);
      const { data } = await api.get("/clientes-view-preferences");
      setCliProfiles(data);
      const def = data.find((p) => p.isDefault);
      if (def) cliApplyProfile(def, false);
    } catch (_) {}
    finally { setCliLoadingProfiles(false); }
  };

  const cliApplyProfile = (profile, showToast = true) => {
    setCliActiveProfile(profile);
    if (profile.columns) {
      // adiciona a coluna "select" sempre visível ao frente
      const merged = CLIENTES_COLUMNS.map((def) => {
        const saved = profile.columns.find((c) => c.id === def.id);
        return saved ? { ...def, visible: saved.visible } : def;
      });
      merged[0] = { ...merged[0], visible: true }; // select sempre visível
      setCliColumns(merged);
    }
    if (profile.filters) setCliColFilters(profile.filters);
    if (profile.sortConfig) setCliSort(profile.sortConfig);
    if (showToast) toast.success(`Perfil "${profile.name}" aplicado!`);
  };

  const cliSaveProfile = async () => {
    if (!cliProfileName.trim()) { toast.error("Digite um nome para o perfil"); return; }
    try {
      const payload = { name: cliProfileName.trim(), columns: cliColumns, filters: cliColFilters, sortConfig: cliSort, isDefault: cliSetDefault };
      if (cliActiveProfile?.id) {
        const { data } = await api.put(`/clientes-view-preferences/${cliActiveProfile.id}`, payload);
        setCliActiveProfile(data);
        toast.success("Perfil atualizado!");
      } else {
        const { data } = await api.post("/clientes-view-preferences", payload);
        setCliActiveProfile(data);
        toast.success("Perfil salvo!");
      }
      await cliLoadProfiles();
      setCliSaveDialogOpen(false);
      setCliProfileName("");
      setCliSetDefault(false);
    } catch (err) { toast.error(err.response?.data?.error || "Erro ao salvar perfil"); }
  };

  const cliSetAsDefault = async (profile) => {
    try {
      await api.patch(`/clientes-view-preferences/${profile.id}/set-default`);
      toast.success(`"${profile.name}" definido como padrão!`);
      await cliLoadProfiles();
    } catch (err) { toast.error(err.response?.data?.error || "Erro"); }
  };

  const cliDeleteProfile = async (profile) => {
    try {
      await api.delete(`/clientes-view-preferences/${profile.id}`);
      toast.success(`Perfil "${profile.name}" excluído!`);
      if (cliActiveProfile?.id === profile.id) {
        setCliActiveProfile(null);
        setCliColumns(CLIENTES_COLUMNS);
        setCliColFilters({});
        setCliSort({ key: null, direction: "asc" });
      }
      await cliLoadProfiles();
    } catch (err) { toast.error(err.response?.data?.error || "Erro"); }
  };

  const cliQuickSaveProfile = async () => {
    const name = cliQuickSave.trim();
    if (!name) { toast.error("Digite um nome"); return; }
    setCliSavingQuick(true);
    try {
      const { data } = await api.post("/clientes-view-preferences", { name, columns: cliColumns, filters: cliColFilters, sortConfig: cliSort, isDefault: false });
      toast.success(`Filtro "${name}" salvo!`);
      setCliQuickSave("");
      setCliActiveProfile(data);
      await cliLoadProfiles();
    } catch (err) { toast.error(err.response?.data?.error || "Erro"); }
    finally { setCliSavingQuick(false); }
  };

  const cliTotalActiveFilters = Object.values(cliColFilters).filter((v) => Array.isArray(v) && v.length > 0).length;
  const cliRows = cliGetFiltered();

  // Funções para contar campos preenchidos em cada seção
  const countInfoGeraisPreenchidos = () => {
    let count = 0;
    if (id || codigo) count++;
    if (classificacao) count++;
    if (mininome) count++;
    if (nomeTarefa) count++;
    if (departamentoId) count++;
    return { preenchidos: count, total: 5 };
  };

  const countEntregasMensaisPreenchidos = () => {
    let count = 0;
    Object.values(entregasMensais).forEach(val => {
      if (val !== "" && val !== null && val !== undefined) count++;
    });
    return { preenchidos: count, total: 12 };
  };

  const countPrazosConfigPreenchidos = () => {
    let count = 0;
    const campos = [
                    ...(isControleFixo ? [] : [diasAntecipacao, diasInicio, tipoDiasAntes, prazosFixos, sabadoUtil]),
                    ...(isOrdemServico ? [diasConclusao] : ocultaCompetencia ? [] : [competenciaTipo, competencia]),
                    exigirRobo, passivelMulta, alertaGuia, checklistObrigatorio,
                    esfera, notificarCliente, ativa, baixarAutomatico];
    campos.forEach(val => {
      if (val !== "" && val !== null && val !== undefined) count++;
    });
    return { preenchidos: count, total: campos.length };
  };

  const countChecklistPreenchidos = () => {
    return { preenchidos: checklistId ? 1 : 0, total: 1 };
  };

  const countNotificacoesPreenchidos = () => {
    return { preenchidos: canaisNotificacao.length, total: 2 };
  };

  const countFinanceiroPreenchidos = () => {
    return { preenchidos: valor !== "" && valor !== null && valor !== undefined ? 1 : 0, total: 1 };
  };

  const countClientesPreenchidos = () => {
    return { preenchidos: clientesSelecionados.length, total: clientes.length };
  };

  const countFaseConfigPreenchidos = () => {
    if (!exibeFaseConfig || faseConfig.modo === "nao_aplicavel") return { preenchidos: 1, total: 1 };
    const campos = [
      faseConfig.dataBase,
      faseConfig.faseVencidaId,
      faseConfig.diasVencida,
      faseConfig.faseNaoIniciadaId,
      faseConfig.diasNaoIniciada,
    ];
    return {
      preenchidos: campos.filter((val) => val !== "" && val !== null && val !== undefined).length,
      total: campos.length,
    };
  };

  const handleClassificacaoChange = (e) => {
    setClassificacao(formatClassificacao(e.target.value));
  };

  const handleDiasAntecipacaoChange = (e) => {
    setDiasAntecipacao(e.target.value.replace(/\D/g, "").slice(0, 4));
  };

  const handleDiasInicioChange = (e) => {
    setDiasInicio(e.target.value.replace(/\D/g, "").slice(0, 4));
  };

  const handleDiasConclusaoChange = (e) => {
    setDiasConclusao(e.target.value.replace(/\D/g, "").slice(0, 4));
  };

  const handleAplicarTodosMeses = (dia) => {
    if (!dia) return;
    const novo = {};
    const ajustados = [];
    for (let m = 1; m <= 12; m++) {
      if (isDiaSentinela(dia)) {
        novo[m] = dia;
        continue;
      }
      const max = DIAS_POR_MES[m];
      if (Number(dia) > max) {
        novo[m] = max;
        ajustados.push(meses.find((x) => x.id === m).nome);
      } else {
        novo[m] = dia;
      }
    }
    setEntregasMensais(novo);
    if (isDiaSentinela(dia)) {
      toast.success(`"${getDiaLabel(dia)}" aplicado a todos os meses`);
    } else if (ajustados.length > 0) {
      toast.warn(`Dia ${dia} não existe em: ${ajustados.join(', ')} — ajustado para o último dia válido desses meses`);
    } else {
      toast.success(`Dia ${dia} aplicado a todos os meses`);
    }
  };

  const handleClienteToggle = (clienteId) => {
    setClientesSelecionados((prev) =>
      prev.includes(clienteId)
        ? prev.filter((id) => id !== clienteId)
        : [...prev, clienteId]
    );
  };

  const handleClienteControleDataChange = (clienteId, field, value) => {
    setClientesControleData((prev) => ({
      ...prev,
      [clienteId]: {
        ...(prev[clienteId] || {}),
        [field]: value,
      },
    }));
  };

  const getFaseById = (faseId) =>
    controlesComData.find((item) => String(item.id) === String(faseId));

  const renderFaseChip = (faseId, fallback = "Selecione") => {
    const fase = getFaseById(faseId);
    if (!fase) return fallback;
    return (
      <Chip
        size="small"
        label={fase.nome}
        style={{
          backgroundColor: getFaseCor(fase),
          color: "#fff",
          fontWeight: 600,
          maxWidth: "100%",
        }}
      />
    );
  };

  const updateFaseConfig = (field, value) => {
    setFaseConfig((prev) => {
      if (field === "modo" && value === "nao_aplicavel") {
        setClientesControleData((current) => {
          const cleared = {};
          Object.entries(current).forEach(([clienteId, data]) => {
            cleared[clienteId] = {
              ...data,
              vencimento: exibeVencimentoCliente ? "" : data.vencimento,
              controleComDataId: "",
            };
          });
          return cleared;
        });
        return DEFAULT_FASE_CONFIG;
      }
      return { ...prev, [field]: value };
    });
  };

  const handleAplicarFaseAutomatica = () => {
    if (!faseConfigAtiva) {
      toast.warn("Habilite a configuração automática de fase");
      return;
    }
    if (!faseConfig.dataBase && exibeVencimentoCliente) {
      toast.warn("Informe a data base para calcular o vencimento");
      return;
    }
    if (!faseConfig.faseNaoIniciadaId && !faseConfig.faseVencidaId) {
      toast.warn("Selecione ao menos uma fase para aplicar");
      return;
    }

    const fasePadraoId = faseConfig.faseNaoIniciadaId || faseConfig.faseVencidaId;
    const vencimentoPadrao = exibeVencimentoCliente
      ? addDaysToDate(faseConfig.dataBase, faseConfig.diasNaoIniciada)
      : "";

    setClientesControleData((prev) => {
      const next = { ...prev };
      clientesSelecionados.forEach((clienteId) => {
        if (isSocioSelection(clienteId)) return;
        next[clienteId] = {
          ...(next[clienteId] || {}),
          controleComDataId: fasePadraoId,
          ...(exibeVencimentoCliente && { vencimento: vencimentoPadrao }),
        };
      });
      return next;
    });

    toast.success("Configuração de fase aplicada aos clientes selecionados");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!classificacao || classificacao.replace(/\D/g, "").length !== 6) {
      toast.error("Classificação é obrigatória no formato 00.00.00");
      return;
    }

    if (!nomeTarefa) {
      toast.error("Nome da tarefa é obrigatório");
      return;
    }

    if (!tipoTarefa) {
      toast.error("Tipo da tarefa é obrigatório");
      return;
    }

    if (!departamentoId) {
      toast.error("Departamento é obrigatório");
      return;
    }

    if (!ocultaCompetencia && competenciaTipo && (competencia === "" || !/^[-+]?\d+$/.test(String(competencia)))) {
      toast.error("Informe um valor numérico válido para a Competência (ex: -1, 0, +1)");
      return;
    }

    if (tipoTarefa === "ordem_servico" && diasConclusao !== "" && !/^\d+$/.test(String(diasConclusao))) {
      toast.error("Informe apenas números em Número de dias para conclusão");
      return;
    }

    const data = {
      classificacao,
      mininome,
      nomeTarefa,
      tipoTarefa,
      departamentoId,
      usuarioResponsavelId: usuarioResponsavelId || null,
      entregasMensais: ocultaEntregasMensais ? {} : entregasMensais,
      diasAntecipacao: isControleFixo ? null : diasAntecipacao !== "" ? diasAntecipacao : null,
      diasInicio: isControleFixo ? null : diasInicio !== "" ? diasInicio : null,
      diasConclusao: tipoTarefa === "ordem_servico" && diasConclusao !== "" ? diasConclusao : null,
      tipoDiasAntes: isControleFixo ? null : tipoDiasAntes || null,
      prazosFixos: isControleFixo ? null : prazosFixos || null,
      sabadoUtil: isControleFixo ? null : sabadoUtil || null,
      faseConfig: exibeFaseConfig ? faseConfig : null,
      competenciaTipo: ocultaCompetencia ? null : competenciaTipo || null,
      competencia: !ocultaCompetencia && competenciaTipo ? competencia : null,
      exigirRobo: exigirRobo || null,
      passivelMulta: passivelMulta || null,
      alertaGuia: alertaGuia || null,
      checklistObrigatorio: checklistObrigatorio || null,
      esfera: esfera || null,
      notificarCliente: notificarCliente || null,
      ativa: ativa || null,
      baixarAutomatico: baixarAutomatico || null,
      checklistId: checklistId || null,
      canaisNotificacao,
      emailTemplateId: emailTemplateId ? emailTemplateId.id : null,
      whatsappTemplateId: whatsappTemplateId ? whatsappTemplateId.id : null,
      valor: valor !== "" ? parseFloat(valor) : null,
      clientesIds: ocultaClientes ? [] : clientesSelecionados.filter((clienteId) => !isSocioSelection(clienteId)).map((clienteId) => ({
        clienteId,
        vencimento: exibeVencimentoCliente ? clientesControleData[clienteId]?.vencimento || null : null,
        controleComDataId: exibeFaseCliente ? clientesControleData[clienteId]?.controleComDataId || null : null,
      })),
      sociosIds: ocultaClientes ? [] : clientesSelecionados
        .filter(isSocioSelection)
        .map((clienteId) => clientes.find((cliente) => cliente.id === clienteId)?.socioId)
        .filter(Boolean),
    };

    console.log("Dados sendo enviados:", data);

    try {
      if (id) {
        await api.put(`/tarefas-recorrentes/${id}`, data);
        toast.success("Tarefa atualizada com sucesso");
      } else {
        await api.post("/tarefas-recorrentes", data);
        toast.success("Tarefa criada com sucesso");
      }
      history.push("/tarefas-recorrentes");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error(error.response?.data?.error || error.response?.data?.message || "Erro ao salvar tarefa");
    }
  };

  const getCanaisNotificacaoText = () => {
    if (canaisNotificacao.length === 0) return "Nenhuma opção selecionada";
    return canaisNotificacao.join(", ");
  };

  return (
    <Box className={classes.root}>
      <Typography variant="h4" gutterBottom>
        {id ? "Editar" : "Nova"} Tarefa
      </Typography>

      <Paper className={classes.paper}>
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            size="small"
            variant="outlined"
            onClick={handleExpandAll}
            startIcon={expandAll ? <ExpandMoreIcon /> : <ExpandMoreIcon style={{ transform: 'rotate(-90deg)' }} />}
          >
            {expandAll ? "Recolher Todos" : "Expandir Todos"}
          </Button>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box className={classes.tipoTarefaPanel}>
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              Tipo da tarefa
            </Typography>
            <RadioGroup
              row
              value={tipoTarefa}
              onChange={(e) => setTipoTarefa(e.target.value)}
              className={classes.tipoTarefaGroup}
            >
              {TIPOS_TAREFA.map((tipo) => (
                <FormControlLabel
                  key={tipo.value}
                  value={tipo.value}
                  control={<Radio color="primary" />}
                  label={tipo.label}
                  className={classes.tipoTarefaOption}
                />
              ))}
            </RadioGroup>
          </Box>

          {/* Accordion 1: Informações Gerais */}
          <Accordion
            expanded={isAccordionExpanded("panel1")}
            onChange={handleAccordionChange("panel1")}
            className={classes.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className={classes.accordionSummary}
            >
              <div className={classes.accordionTitle}>
                <InfoIcon color="primary" />
                <Typography>Informações Gerais</Typography>
                {id && (
                  <Typography variant="caption" style={{ marginLeft: 'auto', color: '#666' }}>
                    {countInfoGeraisPreenchidos().preenchidos}/{countInfoGeraisPreenchidos().total} preenchidos
                  </Typography>
                )}
              </div>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Código"
                    value={id ? codigo || id : "Será gerado ao salvar"}
                    variant="outlined"
                    helperText={id ? "Gerado automaticamente pelo banco de dados" : "Gerado automaticamente pelo banco de dados ao salvar"}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    required
                    label="Classificação"
                    value={classificacao}
                    onChange={handleClassificacaoChange}
                    variant="outlined"
                    helperText="Formato: 00.00.00"
                    placeholder="00.00.00"
                    inputProps={{ maxLength: 8, inputMode: "numeric" }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Mininome"
                    value={mininome}
                    onChange={(e) => setMininome(e.target.value)}
                    variant="outlined"
                    helperText="Nome abreviado"
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    required
                    label="Nome da tarefa"
                    value={nomeTarefa}
                    onChange={(e) => setNomeTarefa(e.target.value)}
                    variant="outlined"
                    helperText="Nome completo da obrigação"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel>Selecione um departamento</InputLabel>
                    <Select
                      value={departamentoId}
                      onChange={(e) => {
                        setDepartamentoId(e.target.value);
                        setUsuarioResponsavelId("");
                        if (e.target.value) {
                          loadUsuariosDepartamento(e.target.value);
                        } else {
                          setUsuarios([]);
                        }
                      }}
                      label="Selecione um departamento"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      {departamentos.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Accordion 2: Entregas Mensais */}
          {!ocultaEntregasMensais && (
          <Accordion
            expanded={isAccordionExpanded("panel2")}
            onChange={handleAccordionChange("panel2")}
            className={classes.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className={classes.accordionSummary}
            >
              <div className={classes.accordionTitle}>
                <CalendarTodayIcon color="primary" />
                <Typography>Entregas Mensais</Typography>
                {id && (
                  <Typography variant="caption" style={{ marginLeft: 'auto', color: '#666' }}>
                    {countEntregasMensaisPreenchidos().preenchidos}/{countEntregasMensaisPreenchidos().total} meses
                  </Typography>
                )}
              </div>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" flexWrap="wrap" style={{ gap: 8 }}>
                    <FormControl variant="outlined" style={{ minWidth: 180 }}>
                      <InputLabel>Dia para todos os meses</InputLabel>
                      <Select
                        value={diaReplicarTodos}
                        onChange={(e) => setDiaReplicarTodos(e.target.value)}
                        label="Dia para todos os meses"
                      >
                        <MenuItem value="">
                          <em>Selecione</em>
                        </MenuItem>
                        {renderDiaMenuItems(31)}
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      disabled={!diaReplicarTodos}
                      onClick={() => handleAplicarTodosMeses(diaReplicarTodos)}
                    >
                      Aplicar a todos os meses
                    </Button>
                    <Typography variant="caption" color="textSecondary">
                      Define o mesmo dia de entrega para os 12 meses de uma vez. Dias que não existem em algum mês
                      (ex.: dia 31 em Fevereiro) são ajustados automaticamente para o último dia válido daquele mês.
                      Use "Não tem" para marcar explicitamente que não há entrega naquele mês, ou as opções de
                      "dia útil" para contar a partir de dias úteis em vez do calendário.
                    </Typography>
                  </Box>
                </Grid>
                {meses.map((mes) => (
                  <Grid item xs={12} sm={6} md={4} key={mes.id}>
                    <Box display="flex" alignItems="center" style={{ gap: 4 }}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>{mes.nome}</InputLabel>
                        <Select
                          value={entregasMensais[mes.id]}
                          onChange={(e) =>
                            setEntregasMensais({
                              ...entregasMensais,
                              [mes.id]: e.target.value,
                            })
                          }
                          label={mes.nome}
                        >
                          <MenuItem value="">
                            <em>Selecione</em>
                          </MenuItem>
                          {renderDiaMenuItems(DIAS_POR_MES[mes.id])}
                        </Select>
                      </FormControl>
                      {entregasMensais[mes.id] !== "" && (
                        <Tooltip
                          title={`Replicar ${getDiaLabel(entregasMensais[mes.id])} para todos os meses`}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleAplicarTodosMeses(entregasMensais[mes.id])}
                          >
                            <FileCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
          )}

          {/* Accordion 3: Prazos e Configurações */}
          <Accordion
            expanded={isAccordionExpanded("panel3")}
            onChange={handleAccordionChange("panel3")}
            className={classes.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className={classes.accordionSummary}
            >
              <div className={classes.accordionTitle}>
                <SettingsIcon color="primary" />
                <Typography>Prazos e Configurações</Typography>
                {id && (
                  <Typography variant="caption" style={{ marginLeft: 'auto', color: '#666' }}>
                    {countPrazosConfigPreenchidos().preenchidos}/{countPrazosConfigPreenchidos().total} configurações
                  </Typography>
                )}
              </div>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <Grid container spacing={2}>
                {isOrdemServico && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Número de dias para conclusão da tarefa"
                      value={diasConclusao}
                      onChange={handleDiasConclusaoChange}
                      variant="outlined"
                      inputProps={{ maxLength: 4, inputMode: "numeric" }}
                    />
                  </Grid>
                )}
                {!isControleFixo && (
                <>
                  {!isOrdemServico && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Número de dias a antecipar - para conclusão da tarefa"
                        value={diasAntecipacao}
                        onChange={handleDiasAntecipacaoChange}
                        variant="outlined"
                        inputProps={{ maxLength: 4, inputMode: "numeric" }}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Número de dias a antecipar - para iniciar a tarefa"
                    value={diasInicio}
                    onChange={handleDiasInicioChange}
                    variant="outlined"
                    inputProps={{ maxLength: 4, inputMode: "numeric" }}
                  />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Tipo dos Dias Antes</InputLabel>
                    <Select
                      value={tipoDiasAntes}
                      onChange={(e) => setTipoDiasAntes(e.target.value)}
                      label="Tipo dos Dias Antes"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      <MenuItem value="corrido">Corrido</MenuItem>
                      <MenuItem value="uteis">Úteis</MenuItem>
                    </Select>
                  </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Prazos Fixos em dias não úteis</InputLabel>
                    <Select
                      value={prazosFixos}
                      onChange={(e) => setPrazosFixos(e.target.value)}
                      label="Prazos Fixos em dias não úteis"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      {PRAZOS_FIXOS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Sábado Útil</InputLabel>
                    <Select
                      value={sabadoUtil}
                      onChange={(e) => setSabadoUtil(e.target.value)}
                      label="Sábado Útil"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      <MenuItem value="sim">Sim</MenuItem>
                      <MenuItem value="nao">Não</MenuItem>
                    </Select>
                  </FormControl>
                  </Grid>
                </>
                )}
                {!isOrdemServico && !ocultaCompetencia ? (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Competência</InputLabel>
                      <Select
                        value={competenciaTipo}
                        onChange={(e) => {
                          setCompetenciaTipo(e.target.value);
                          if (!e.target.value) setCompetencia("");
                        }}
                        label="Competência"
                      >
                        <MenuItem value="">
                          <em>Selecione</em>
                        </MenuItem>
                        {competenciaTipoOptions.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                ) : null}
                {!ocultaCompetencia && competenciaTipo && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label={`Valor da Competência (${competenciaTipoOptions.find((o) => o.value === competenciaTipo)?.label})`}
                      value={competencia}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (competenciaValorRegex.test(raw)) setCompetencia(raw);
                      }}
                      placeholder={competenciaValorInfo[competenciaTipo]}
                      helperText={competenciaValorInfo[competenciaTipo]}
                      inputProps={{ maxLength: 5 }}
                    />
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Exigir Robô</InputLabel>
                    <Select
                      value={exigirRobo}
                      onChange={(e) => setExigirRobo(e.target.value)}
                      label="Exigir Robô"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      <MenuItem value="sim">Sim</MenuItem>
                      <MenuItem value="nao">Não</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Passível de Multa</InputLabel>
                    <Select
                      value={passivelMulta}
                      onChange={(e) => setPassivelMulta(e.target.value)}
                      label="Passível de Multa"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      <MenuItem value="sim">Sim</MenuItem>
                      <MenuItem value="nao">Não</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Alerta Guia</InputLabel>
                    <Select
                      value={alertaGuia}
                      onChange={(e) => setAlertaGuia(e.target.value)}
                      label="Alerta Guia"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      <MenuItem value="sim">Sim</MenuItem>
                      <MenuItem value="nao">Não</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Checklist Obrigatório</InputLabel>
                    <Select
                      value={checklistObrigatorio}
                      onChange={(e) => setChecklistObrigatorio(e.target.value)}
                      label="Checklist Obrigatório"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      <MenuItem value="sim">Sim</MenuItem>
                      <MenuItem value="nao">Não</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Esfera</InputLabel>
                    <Select
                      value={esfera}
                      onChange={(e) => setEsfera(e.target.value)}
                      label="Esfera"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      {esferas.map((item) => (
                        <MenuItem key={item.id} value={item.nome}>
                          {item.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Notificar Cliente</InputLabel>
                    <Select
                      value={notificarCliente}
                      onChange={(e) => setNotificarCliente(e.target.value)}
                      label="Notificar Cliente"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      <MenuItem value="sim">Sim</MenuItem>
                      <MenuItem value="nao">Não</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Ativa</InputLabel>
                    <Select
                      value={ativa}
                      onChange={(e) => setAtiva(e.target.value)}
                      label="Ativa"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      <MenuItem value="sim">Sim</MenuItem>
                      <MenuItem value="nao">Não</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Baixar Automático</InputLabel>
                    <Select
                      value={baixarAutomatico}
                      onChange={(e) => setBaixarAutomatico(e.target.value)}
                      label="Baixar Automático"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      <MenuItem value="sim">Sim</MenuItem>
                      <MenuItem value="nao">Não</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Accordion Fase - visível para controles */}
          {exibeFaseConfig && (
          <Accordion
            expanded={isAccordionExpanded("panelFase")}
            onChange={handleAccordionChange("panelFase")}
            className={classes.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className={classes.accordionSummary}
            >
              <div className={classes.accordionTitle}>
                <SettingsIcon color="primary" />
                <Typography>Fase</Typography>
                {id && (
                  <Typography variant="caption" style={{ marginLeft: 'auto', color: '#666' }}>
                    {countFaseConfigPreenchidos().preenchidos}/{countFaseConfigPreenchidos().total} configurações
                  </Typography>
                )}
              </div>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Configuração automática</InputLabel>
                    <Select
                      value={faseConfig.modo}
                      onChange={(e) => updateFaseConfig("modo", e.target.value)}
                      label="Configuração automática"
                    >
                      <MenuItem value="nao_aplicavel">Não aplicável</MenuItem>
                      <MenuItem value="automatico">Automática com base em datas</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {faseConfigAtiva && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Data base"
                      value={faseConfig.dataBase}
                      onChange={(e) => updateFaseConfig("dataBase", e.target.value)}
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      helperText={exibeVencimentoCliente ? "Usada para preencher o vencimento dos clientes" : "Referência da régua da fase"}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Fase vencida</InputLabel>
                      <Select
                        value={faseConfig.faseVencidaId}
                        onChange={(e) => updateFaseConfig("faseVencidaId", e.target.value)}
                        label="Fase vencida"
                        renderValue={(value) => renderFaseChip(value)}
                      >
                        <MenuItem value="">
                          <em>Selecione</em>
                        </MenuItem>
                        {controlesComData.map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                              <span style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: getFaseCor(item), display: "inline-block" }} />
                              {item.nome}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Dias para fase vencida"
                      type="number"
                      value={faseConfig.diasVencida}
                      onChange={(e) => updateFaseConfig("diasVencida", e.target.value.replace(/\D/g, "").slice(0, 4))}
                      variant="outlined"
                      inputProps={{ min: 0, maxLength: 4 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Fase não iniciada/iniciada e não vencida</InputLabel>
                      <Select
                        value={faseConfig.faseNaoIniciadaId}
                        onChange={(e) => updateFaseConfig("faseNaoIniciadaId", e.target.value)}
                        label="Fase não iniciada/iniciada e não vencida"
                        renderValue={(value) => renderFaseChip(value)}
                      >
                        <MenuItem value="">
                          <em>Selecione</em>
                        </MenuItem>
                        {controlesComData.map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                              <span style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: getFaseCor(item), display: "inline-block" }} />
                              {item.nome}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Dias para fase não vencida"
                      type="number"
                      value={faseConfig.diasNaoIniciada}
                      onChange={(e) => updateFaseConfig("diasNaoIniciada", e.target.value.replace(/\D/g, "").slice(0, 4))}
                      variant="outlined"
                      inputProps={{ min: 0, maxLength: 4 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" flexWrap="wrap" style={{ gap: 8 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleAplicarFaseAutomatica}
                        disabled={clientesSelecionados.filter((clienteId) => !isSocioSelection(clienteId)).length === 0}
                      >
                        Aplicar aos clientes selecionados
                      </Button>
                      <Typography variant="caption" color="textSecondary">
                        A aplicação preenche a fase não vencida como fase inicial e calcula o vencimento pela data base mais os dias informados.
                      </Typography>
                    </Box>
                  </Grid>
                </>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
          )}

          {/* Accordion 4: Checklist - visível apenas quando checklistObrigatorio = "sim" */}
          <Accordion
            expanded={isAccordionExpanded("panel4")}
            onChange={handleAccordionChange("panel4")}
            className={classes.accordion}
            style={{ display: checklistObrigatorio === "sim" ? "block" : "none" }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className={classes.accordionSummary}
            >
              <div className={classes.accordionTitle}>
                <ChecklistIcon color="primary" />
                <Typography>Checklist</Typography>
                {id && checklistId && (
                  <Typography variant="caption" style={{ marginLeft: 'auto', color: '#4caf50' }}>
                    ✓ Checklist configurado
                  </Typography>
                )}
              </div>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Selecione um checklist</InputLabel>
                    <Select
                      value={checklistId}
                      onChange={(e) => setChecklistId(e.target.value)}
                      label="Selecione um checklist"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      {checklists.map((checklist) => (
                        <MenuItem key={checklist.id} value={checklist.id}>
                          {checklist.titulo}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Accordion 5: Notificações */}
          <Accordion
            expanded={isAccordionExpanded("panel5")}
            onChange={handleAccordionChange("panel5")}
            className={classes.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className={classes.accordionSummary}
            >
              <div className={classes.accordionTitle}>
                <NotificationsIcon color="primary" />
                <Typography>Notificações</Typography>
                {id && (
                  <Typography variant="caption" style={{ marginLeft: 'auto', color: '#666' }}>
                    {countNotificacoesPreenchidos().preenchidos} canais
                  </Typography>
                )}
              </div>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Selecione os canais</InputLabel>
                    <Select
                      multiple
                      value={canaisNotificacao}
                      onChange={(e) => setCanaisNotificacao(e.target.value)}
                      label="Selecione os canais"
                      renderValue={(selected) => selected.join(", ")}
                    >
                      <MenuItem value="email">E-mail</MenuItem>
                      <MenuItem value="whatsapp">WhatsApp</MenuItem>
                    </Select>
                  </FormControl>
                  {canaisNotificacao.includes("email") && (
                    <Box mt={2}>
                      <Autocomplete
                        options={emailTemplates}
                        getOptionLabel={(option) => option.title || ""}
                        getOptionSelected={(option, value) => option.id === value.id}
                        value={emailTemplateId}
                        onChange={(e, newValue) => setEmailTemplateId(newValue)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Template de E-mail"
                            variant="outlined"
                            fullWidth
                            helperText="Selecione o template que será enviado por e-mail"
                          />
                        )}
                        renderOption={(option) => (
                          <Box>
                            <Typography variant="body2"><strong>{option.title}</strong></Typography>
                            <Typography variant="caption" color="textSecondary">{option.subject}</Typography>
                          </Box>
                        )}
                        noOptionsText="Nenhum template encontrado"
                      />
                    </Box>
                  )}
                  {canaisNotificacao.includes("whatsapp") && (
                    <Box mt={2}>
                      <Autocomplete
                        options={whatsappTemplates}
                        getOptionLabel={(option) => option.title || ""}
                        getOptionSelected={(option, value) => option.id === value.id}
                        value={whatsappTemplateId}
                        onChange={(e, newValue) => setWhatsappTemplateId(newValue)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Template de WhatsApp"
                            variant="outlined"
                            fullWidth
                            helperText="Selecione o template que será enviado por WhatsApp"
                          />
                        )}
                        renderOption={(option) => (
                          <Box>
                            <Typography variant="body2"><strong>{option.title}</strong></Typography>
                          </Box>
                        )}
                        noOptionsText="Nenhum template encontrado. Cadastre em Config. Cliente → WhatsApp"
                      />
                    </Box>
                  )}
                  <Box mt={2}>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Resumo:</strong>
                    </Typography>
                    <Typography variant="body2">{getCanaisNotificacaoText()}</Typography>
                    {canaisNotificacao.includes("email") && emailTemplateId && (
                      <Typography variant="body2" color="textSecondary">
                        Template e-mail: <strong>{emailTemplateId.title}</strong>
                      </Typography>
                    )}
                    {canaisNotificacao.includes("whatsapp") && whatsappTemplateId && (
                      <Typography variant="body2" color="textSecondary">
                        Template WhatsApp: <strong>{whatsappTemplateId.title}</strong>
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Accordion 6: Financeiro */}
          <Accordion
            expanded={isAccordionExpanded("panel6")}
            onChange={handleAccordionChange("panel6")}
            className={classes.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className={classes.accordionSummary}
            >
              <div className={classes.accordionTitle}>
                <AttachMoneyIcon color="primary" />
                <Typography>Financeiro</Typography>
                {id && valor && (
                  <Typography variant="caption" style={{ marginLeft: 'auto', color: '#4caf50' }}>
                    R$ {parseFloat(valor).toFixed(2)}
                  </Typography>
                )}
              </div>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Valor do Serviço
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Valor"
                    type="number"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    }}
                    inputProps={{ step: "0.01", min: 0 }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Accordion 7: Clientes */}
          {!ocultaClientes && (
          <Accordion
            expanded={isAccordionExpanded("panel7")}
            onChange={handleAccordionChange("panel7")}
            className={classes.accordion}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className={classes.accordionSummary}
            >
              <div className={classes.accordionTitle}>
                <BusinessIcon color="primary" />
                <Typography>Clientes</Typography>
                <Typography variant="caption" style={{ marginLeft: 'auto', color: clientesSelecionados.length > 0 ? '#4caf50' : '#666' }}>
                  {clientesSelecionados.length} selecionados
                </Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails} style={{ padding: 16, display: "block" }}>
              {/* Busca - largura total */}
              <Box style={{ marginBottom: 10 }}>
                <TextField
                  fullWidth
                  placeholder="Buscar por nome, CPF, CNPJ..."
                  value={searchCliente}
                  onChange={(e) => setSearchCliente(e.target.value)}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon style={{ color: searchCliente ? "#1976d2" : "#aaa" }} /></InputAdornment>,
                    endAdornment: searchCliente ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchCliente("")}><ClearIcon fontSize="small" /></IconButton>
                      </InputAdornment>
                    ) : null,
                    style: { borderRadius: 8 },
                  }}
                />
              </Box>

              {/* Chips de filtros ativos */}
              {(cliTotalActiveFilters > 0 || searchCliente) && (
                <Box style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10, alignItems: "center" }}>
                  <Typography variant="caption" color="textSecondary" style={{ fontWeight: 600, fontSize: 11 }}>Filtros ativos:</Typography>
                  {searchCliente && (
                    <Chip
                      label={`Busca: "${searchCliente}"`}
                      size="small"
                      onDelete={() => setSearchCliente("")}
                      style={{ height: 22, fontSize: 11, backgroundColor: "#e3f2fd", color: "#1565c0" }}
                    />
                  )}
                  {Object.entries(cliColFilters).filter(([, v]) => Array.isArray(v) && v.length > 0).map(([colId, vals]) => {
                    const label = cliColumns.find((c) => c.id === colId)?.label || colId;
                    return (
                      <Chip key={colId} size="small"
                        label={`${label}: ${vals.slice(0, 2).join(", ")}${vals.length > 2 ? ` +${vals.length - 2}` : ""}`}
                        onDelete={() => cliClearFilter(colId)}
                        style={{ height: 22, fontSize: 11, backgroundColor: "#e8f4fd", color: "#1565c0" }}
                      />
                    );
                  })}
                  <Chip size="small" label="Limpar tudo" clickable onClick={() => { setSearchCliente(""); cliClearAllFilters(); }}
                    icon={<ClearIcon style={{ fontSize: 12 }} />}
                    style={{ height: 22, fontSize: 11, backgroundColor: "#fff3e0", color: "#bf360c", border: "1px solid #bf360c" }}
                  />
                </Box>
              )}

              {/* Toolbar: contagem + botões */}
              <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Typography variant="caption" color="textSecondary">
                    {cliRows.length} cliente(s) visível(is) • {clientesSelecionados.length} selecionado(s) de {clientes.length} total
                  </Typography>
                  {cliActiveProfile && (
                    <Chip
                      label={cliActiveProfile.name}
                      size="small"
                      icon={<StarIcon style={{ fontSize: 13 }} />}
                      onDelete={() => { setCliActiveProfile(null); setCliColFilters({}); setCliSort({ key: null, direction: "asc" }); }}
                      color="primary"
                      variant="outlined"
                      style={{ height: 20, fontSize: 11 }}
                    />
                  )}
                </Box>
                <Box style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <Badge badgeContent={cliTotalActiveFilters} color="error" max={9}>
                    <Button size="small" startIcon={<FilterListIcon />} variant={cliTotalActiveFilters > 0 ? "contained" : "outlined"} color="primary" onClick={() => setCliFilterDrawer(true)}>
                      Filtros
                    </Button>
                  </Badge>
                  <Button size="small" startIcon={<ViewColumnIcon />} variant="outlined" onClick={(e) => setCliColMenuAnchor(e.currentTarget)}>
                    Colunas
                  </Button>
                  <Badge badgeContent={cliProfiles.length} color="primary" max={99}>
                    <Button size="small" startIcon={cliActiveProfile ? <StarIcon /> : <StarBorderIcon />} variant={cliActiveProfile ? "contained" : "outlined"} color="primary" onClick={() => { setCliProfileSearch(""); setCliSavedDrawer(true); }}>
                      {cliActiveProfile ? cliActiveProfile.name : "Filtros Salvos"}
                    </Button>
                  </Badge>
                </Box>
              </Box>

              {/* Tabela avançada */}
              <Box>
                  <TableContainer style={{ maxHeight: 420, border: "1px solid #e0e0e0", borderRadius: 4 }}>
                    <DragDropContext onDragEnd={cliDragEnd}>
                    <Table stickyHeader size="small">
                      <Droppable droppableId="cli-cols" direction="horizontal">
                        {(provided) => (
                      <TableHead ref={provided.innerRef} {...provided.droppableProps}>
                        <TableRow>
                          {/* Coluna select sempre fixa */}
                          <TableCell padding="checkbox" style={{ width: 50, backgroundColor: '#f5f5f5', position: 'sticky', left: 0, zIndex: 3 }}>
                            <Checkbox
                              indeterminate={clientesSelecionados.length > 0 && clientesSelecionados.length < cliRows.length}
                              checked={cliRows.length > 0 && clientesSelecionados.length === cliRows.length}
                              onChange={(e) => {
                                if (e.target.checked) setClientesSelecionados(cliRows.map(c => c.id));
                                else setClientesSelecionados([]);
                              }}
                            />
                          </TableCell>
                          {cliColumns.filter((c) => c.visible && c.id !== "select").map((col, idx) => (
                            <Draggable key={col.id} draggableId={col.id} index={idx}>
                              {(prov, snap) => (
                                <TableCell
                                  ref={prov.innerRef}
                                  {...prov.draggableProps}
                                  style={{ ...prov.draggableProps.style, backgroundColor: snap.isDragging ? "#e3f2fd" : "#f5f5f5", width: col.width, minWidth: col.width, padding: "8px 10px", cursor: "pointer" }}
                                  onClick={() => col.sortable && cliHandleSort(col.id)}
                                >
                                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                    <span {...prov.dragHandleProps} style={{ cursor: "grab", color: "#bbb", lineHeight: 0 }}>
                                      <DragIndicatorIcon style={{ fontSize: 14 }} />
                                    </span>
                                    <strong style={{ fontSize: 12, flex: 1 }}>{col.label}</strong>
                                    {col.sortable && cliSort.key === col.id && (
                                      cliSort.direction === "asc" ? <ArrowUpwardIcon style={{ fontSize: 14 }} /> : <ArrowDownwardIcon style={{ fontSize: 14 }} />
                                    )}
                                    {col.filterable && (
                                      <Tooltip title="Filtrar coluna">
                                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setCliFilterPopover(e.currentTarget); setCliActiveFilterCol(col.id); setCliFilterSearch(""); }}
                                          style={{ padding: 2, color: (cliColFilters[col.id] || []).length > 0 ? "#1976d2" : "#bbb" }}>
                                          <FilterListIcon style={{ fontSize: 13 }} />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </div>
                                </TableCell>
                              )}
                            </Draggable>
                          ))}
                          {exibeVencimentoCliente && (
                              <TableCell style={{ backgroundColor: "#f5f5f5", width: 150, minWidth: 150, padding: "8px 10px" }}>
                                <strong style={{ fontSize: 12 }}>Vencimento</strong>
                              </TableCell>
                          )}
                          {exibeFaseCliente && (
                              <TableCell style={{ backgroundColor: "#f5f5f5", width: 220, minWidth: 220, padding: "8px 10px" }}>
                                <strong style={{ fontSize: 12 }}>Fase</strong>
                              </TableCell>
                          )}
                          {provided.placeholder}
                        </TableRow>
                      </TableHead>
                        )}
                      </Droppable>
                      <TableBody>
                        {cliRows.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={cliColumns.filter(c => c.visible).length + 1 + colunasControleCliente} align="center" style={{ padding: 24, color: "#999" }}>
                              Nenhum cliente encontrado
                            </TableCell>
                          </TableRow>
                        ) : cliRows.map((cliente) => (
                          <TableRow key={cliente.id} hover selected={clientesSelecionados.includes(cliente.id)}>
                            <TableCell padding="checkbox" style={{ position: "sticky", left: 0, backgroundColor: clientesSelecionados.includes(cliente.id) ? "#e8f5e9" : "#fff", zIndex: 1 }}>
                              <Checkbox
                                checked={clientesSelecionados.includes(cliente.id)}
                                onChange={() => handleClienteToggle(cliente.id)}
                                color="primary"
                              />
                            </TableCell>
                            {cliColumns.filter((c) => c.visible && c.id !== "select").map((col) => {
                              const val = cliGetCellValue(cliente, col.id);
                              return renderClienteCellContent(cliente, col, val);
                            })}
                            {exibeVencimentoCliente && (
                                <TableCell style={{ width: 150, minWidth: 150, padding: "4px 10px" }}>
                                  <TextField
                                    type="date"
                                    size="small"
                                    variant="outlined"
                                    value={clientesControleData[cliente.id]?.vencimento || ""}
                                    onChange={(e) => handleClienteControleDataChange(cliente.id, "vencimento", e.target.value)}
                                    disabled={!clientesSelecionados.includes(cliente.id)}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ style: { fontSize: 12, padding: "8px 10px" } }}
                                  />
                                </TableCell>
                            )}
                            {exibeFaseCliente && (
                                <TableCell style={{ width: 220, minWidth: 220, padding: "4px 10px" }}>
                                  <FormControl variant="outlined" size="small" fullWidth disabled={!clientesSelecionados.includes(cliente.id)}>
                                    <Select
                                      value={clientesControleData[cliente.id]?.controleComDataId || ""}
                                      onChange={(e) => handleClienteControleDataChange(cliente.id, "controleComDataId", e.target.value)}
                                      displayEmpty
                                      style={{ fontSize: 12 }}
                                      renderValue={(value) => value ? renderFaseChip(value) : <em>Selecione</em>}
                                    >
                                      <MenuItem value="">
                                        <em>Selecione</em>
                                      </MenuItem>
                                      {controlesComData.map((item) => (
                                        <MenuItem key={item.id} value={item.id}>
                                          <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                                            <span style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: getFaseCor(item), display: "inline-block" }} />
                                            {item.nome}
                                          </Box>
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </DragDropContext>
                  </TableContainer>
              </Box>
            </AccordionDetails>
          </Accordion>
          )}

          {/* Botões */}
          <Box mt={4} display="flex" justifyContent="space-between">
            <Button variant="outlined" onClick={() => history.push("/tarefas-recorrentes")}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" className={classes.saveButton}>
              {id ? "Atualizar" : "Salvar"} Tarefa
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Menu de colunas */}
      <Menu
        anchorEl={cliColMenuAnchor}
        open={Boolean(cliColMenuAnchor)}
        onClose={() => setCliColMenuAnchor(null)}
        PaperProps={{ style: { maxHeight: 420, minWidth: 200 } }}
      >
        {cliColumns.filter((c) => c.id !== "select").map((col) => (
          <ListItem key={col.id} button onClick={() => cliToggleCol(col.id)} style={{ padding: "4px 12px" }}>
            <Checkbox checked={col.visible} color="primary" size="small" />
            <ListItemText primary={col.label} primaryTypographyProps={{ variant: "body2", style: { fontSize: 13 } }} />
          </ListItem>
        ))}
      </Menu>

      {/* Popover filtro de coluna */}
      <Popover
        open={Boolean(cliFilterPopover)}
        anchorEl={cliFilterPopover}
        onClose={() => { setCliFilterPopover(null); setCliActiveFilterCol(null); setCliFilterSearch(""); }}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{ style: { maxHeight: 400, width: 290, padding: 14 } }}
      >
        {cliActiveFilterCol && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2" style={{ fontWeight: 600 }}>
                {cliColumns.find((c) => c.id === cliActiveFilterCol)?.label}
              </Typography>
              <Button size="small" color="secondary" onClick={() => cliClearFilter(cliActiveFilterCol)} style={{ fontSize: 11 }}>Limpar</Button>
            </Box>
            <Divider style={{ marginBottom: 8 }} />
            <TextField fullWidth size="small" variant="outlined" placeholder="Buscar valor..."
              value={cliFilterSearch} onChange={(e) => setCliFilterSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
              style={{ marginBottom: 8 }}
            />
            <Typography variant="caption" color="textSecondary" style={{ display: "block", marginBottom: 4 }}>
              {(cliColFilters[cliActiveFilterCol] || []).length > 0
                ? `${(cliColFilters[cliActiveFilterCol] || []).length} selecionados`
                : `${cliGetUnique(cliActiveFilterCol, cliFilterSearch).length} opções`}
            </Typography>
            <List dense style={{ maxHeight: 260, overflow: "auto" }}>
              {cliGetUnique(cliActiveFilterCol, cliFilterSearch).map((value, idx) => {
                const isChecked = (cliColFilters[cliActiveFilterCol] || []).includes(value);
                return (
                  <ListItem key={idx} button onClick={() => cliToggleFilterValue(cliActiveFilterCol, value)}
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

      {/* Drawer de filtros */}
      <Drawer anchor="right" open={cliFilterDrawer} onClose={() => setCliFilterDrawer(false)}
        PaperProps={{ style: { width: 380, maxWidth: "95vw", display: "flex", flexDirection: "column", height: "100%" } }}>
        <Box style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", backgroundColor: "#1976d2", color: "#fff", flexShrink: 0 }}>
          <Box>
            <Typography style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>
              <FilterListIcon style={{ fontSize: 18, verticalAlign: "middle", marginRight: 8 }} />
              Filtros de Clientes
            </Typography>
            <Typography style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>
              {cliRows.length} de {clientes.length} clientes visíveis
            </Typography>
          </Box>
          <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {cliTotalActiveFilters > 0 && (
              <Button size="small" onClick={cliClearAllFilters} variant="outlined" style={{ color: "#fff", border: "1px solid rgba(255,255,255,0.5)", fontSize: 11 }}>
                Limpar ({cliTotalActiveFilters})
              </Button>
            )}
            <IconButton size="small" onClick={() => setCliFilterDrawer(false)} style={{ color: "#fff" }}><CloseIcon /></IconButton>
          </Box>
        </Box>
        {/* Busca sticky */}
        <Box style={{ padding: "10px 14px", borderBottom: "1px solid #ebebeb", flexShrink: 0, backgroundColor: "#fff" }}>
          <TextField fullWidth size="small" variant="outlined" placeholder="Buscar coluna ou valor..."
            value={cliPanelSearch}
            onChange={(e) => {
              const q = e.target.value;
              setCliPanelSearch(q);
              if (q) {
                const ne = {};
                cliColumns.filter((c) => c.filterable).forEach((col) => {
                  const vals = cliGetUnique(col.id);
                  if (col.label.toLowerCase().includes(q.toLowerCase()) || vals.some((v) => v.toLowerCase().includes(q.toLowerCase())))
                    ne[col.id] = true;
                });
                setCliExpandedCols(ne);
              }
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon style={{ fontSize: 15, color: "#aaa" }} /></InputAdornment>,
              endAdornment: cliPanelSearch ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setCliPanelSearch("")} style={{ padding: 2 }}><ClearIcon style={{ fontSize: 14 }} /></IconButton>
                </InputAdornment>
              ) : null,
              style: { fontSize: 13, height: 36 },
            }}
            inputProps={{ style: { padding: "6px 8px", fontSize: 13 } }}
          />
        </Box>
        <Box style={{ padding: "10px 14px", borderBottom: "1px solid #ebebeb", flexShrink: 0 }}>
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
              const active = (cliColFilters[colId] || []).includes(value);
              return (
                <Chip
                  key={label}
                  label={label}
                  size="small"
                  clickable
                  onClick={() => cliToggleFilterValue(colId, value)}
                  style={{
                    height: 26,
                    fontSize: 11,
                    backgroundColor: active ? color : "#fff",
                    color: active ? "#fff" : color,
                    border: `1px solid ${color}`,
                    fontWeight: active ? 600 : 400,
                  }}
                />
              );
            })}
          </Box>
        </Box>
        {/* Lista de filtros */}
        <Box style={{ flex: 1, overflowY: "auto" }}>
          {cliColumns.filter((c) => c.filterable).map((col) => {
            const allVals = cliGetUnique(col.id);
            const ql = cliPanelSearch.toLowerCase();
            if (cliPanelSearch && !col.label.toLowerCase().includes(ql) && !allVals.some((v) => v.toLowerCase().includes(ql))) return null;
            const displayVals = cliPanelSearch ? allVals.filter((v) => v.toLowerCase().includes(ql) || col.label.toLowerCase().includes(ql)) : allVals;
            if (displayVals.length === 0) return null;
            const isExpanded = !!cliExpandedCols[col.id];
            const activeF = cliColFilters[col.id] || [];
            const hasActive = activeF.length > 0;
            return (
              <Box key={col.id}>
                <Divider style={{ margin: 0 }} />
                <Box onClick={() => setCliExpandedCols((p) => ({ ...p, [col.id]: !p[col.id] }))}
                  style={{ display: "flex", alignItems: "center", padding: "10px 16px", cursor: "pointer", backgroundColor: hasActive ? "#e8f4fd" : isExpanded ? "#f4f6f8" : "#fff", minHeight: 44 }}>
                  <Box style={{ width: 3, height: 22, borderRadius: 2, backgroundColor: hasActive ? "#1976d2" : "transparent", marginRight: 10, flexShrink: 0 }} />
                  <Box style={{ flex: 1 }}>
                    <Typography style={{ fontSize: 13.5, fontWeight: hasActive ? 700 : 400, color: hasActive ? "#1565c0" : "#2c2c2c" }}>{col.label}</Typography>
                    <Typography variant="caption" style={{ color: "#aaa", fontSize: 10.5 }}>
                      {allVals.length} opções{hasActive && ` • ${activeF.length} selecionado(s)`}
                    </Typography>
                  </Box>
                  {hasActive && (
                    <Box style={{ display: "flex", gap: 3, marginRight: 4 }}>
                      {activeF.slice(0, 2).map((v) => <Chip key={v} label={v} size="small" style={{ height: 20, fontSize: 10, backgroundColor: "#1976d2", color: "#fff", maxWidth: 75 }} />)}
                      {activeF.length > 2 && <Chip label={`+${activeF.length - 2}`} size="small" style={{ height: 20, fontSize: 10 }} />}
                    </Box>
                  )}
                  {hasActive && (
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); cliClearFilter(col.id); }} style={{ padding: 3 }}>
                      <ClearIcon style={{ fontSize: 14, color: "#1976d2" }} />
                    </IconButton>
                  )}
                  {isExpanded ? <ExpandLessIcon style={{ fontSize: 18, color: "#bbb" }} /> : <ExpandMoreIcon style={{ fontSize: 18, color: "#bbb" }} />}
                </Box>
                {isExpanded && (
                  <Box style={{ padding: "10px 16px 14px 30px", backgroundColor: "#f7f9fc", borderTop: "1px solid #eee" }}>
                    <Box style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {displayVals.map((value) => {
                        const sel = activeF.includes(value);
                        return (
                          <Chip key={value} label={value} size="small" clickable onClick={() => cliToggleFilterValue(col.id, value)}
                            style={{ height: 28, fontSize: 12, borderRadius: 14, backgroundColor: sel ? "#1976d2" : "#fff", color: sel ? "#fff" : "#333", border: `1.5px solid ${sel ? "#1565c0" : "#d0d0d0"}`, fontWeight: sel ? 600 : 400 }}
                          />
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
        {/* Rodapé */}
        <Box style={{ padding: "12px 16px", borderTop: "1px solid #e0e0e0", backgroundColor: "#f7f9fc", flexShrink: 0 }}>
          <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="caption" color="textSecondary" style={{ fontSize: 12 }}>
              {cliRows.length === clientes.length
                ? `${clientes.length} clientes`
                : <><strong style={{ color: "#1976d2" }}>{cliRows.length}</strong> de {clientes.length} clientes</>}
            </Typography>
            <Button variant="contained" color="primary" size="small" onClick={() => setCliFilterDrawer(false)} style={{ fontSize: 12 }}>
              Ver resultados
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Drawer de filtros salvos */}
      <Drawer anchor="right" open={cliSavedDrawer} onClose={() => { setCliSavedDrawer(false); setCliProfileSearch(""); }}
        PaperProps={{ style: { width: 380, maxWidth: "95vw", display: "flex", flexDirection: "column", height: "100%" } }}>
        <Box style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", backgroundColor: "#1976d2", color: "#fff", flexShrink: 0 }}>
          <Box>
            <Typography style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>
              <StarIcon style={{ fontSize: 18, verticalAlign: "middle", marginRight: 8 }} />
              Filtros Salvos {cliProfiles.length > 0 && `(${cliProfiles.length})`}
            </Typography>
            {cliActiveProfile && (
              <Typography style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>
                Ativo: <strong style={{ color: "#fff" }}>{cliActiveProfile.name}</strong>
              </Typography>
            )}
          </Box>
          <IconButton size="small" onClick={() => { setCliSavedDrawer(false); setCliProfileSearch(""); }} style={{ color: "#fff" }}><CloseIcon /></IconButton>
        </Box>
        <Box style={{ padding: "10px 14px", borderBottom: "1px solid #ebebeb", flexShrink: 0, backgroundColor: "#fff" }}>
          <TextField fullWidth size="small" variant="outlined" placeholder="Buscar pelo nome..."
            value={cliProfileSearch} onChange={(e) => setCliProfileSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon style={{ fontSize: 15, color: "#aaa" }} /></InputAdornment>,
              endAdornment: cliProfileSearch ? (
                <InputAdornment position="end"><IconButton size="small" onClick={() => setCliProfileSearch("")} style={{ padding: 2 }}><ClearIcon style={{ fontSize: 14 }} /></IconButton></InputAdornment>
              ) : null,
              style: { fontSize: 13, height: 36 },
            }}
            inputProps={{ style: { padding: "6px 8px", fontSize: 13 } }}
          />
        </Box>
        <Box style={{ flex: 1, overflowY: "auto" }}>
          {cliLoadingProfiles ? (
            <Box style={{ padding: 32, textAlign: "center" }}><CircularProgress size={24} /></Box>
          ) : cliProfiles.length === 0 ? (
            <Box style={{ padding: "40px 16px", textAlign: "center" }}>
              <StarBorderIcon style={{ fontSize: 40, color: "#ddd", display: "block", margin: "0 auto 10px" }} />
              <Typography variant="body2" color="textSecondary">Nenhum filtro salvo ainda</Typography>
            </Box>
          ) : (
            cliProfiles.filter((p) => !cliProfileSearch || p.name.toLowerCase().includes(cliProfileSearch.toLowerCase())).map((profile) => {
              const isActive = cliActiveProfile?.id === profile.id;
              return (
                <Box key={profile.id}>
                  <Divider style={{ margin: 0 }} />
                  <Box onClick={() => { cliApplyProfile(profile); setCliSavedDrawer(false); }}
                    style={{ display: "flex", alignItems: "center", padding: "10px 16px", cursor: "pointer", backgroundColor: isActive ? "#e3f2fd" : "#fff", minHeight: 52 }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "#f5f5f5"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isActive ? "#e3f2fd" : "#fff"; }}>
                    <Box style={{ width: 3, height: 28, borderRadius: 2, backgroundColor: isActive ? "#1976d2" : "transparent", marginRight: 10 }} />
                    <Box style={{ flex: 1, overflow: "hidden" }}>
                      <Typography style={{ fontSize: 13.5, fontWeight: isActive ? 700 : 400, color: isActive ? "#1565c0" : "#2c2c2c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {profile.name}
                        {isActive && <span style={{ marginLeft: 8, fontSize: 10, color: "#1976d2", fontWeight: 400 }}>• ativo</span>}
                      </Typography>
                      <Typography variant="caption" style={{ color: "#aaa", fontSize: 10.5 }}>
                        {profile.isDefault && <span style={{ color: "#ffa000", fontWeight: 600 }}>padrão</span>}
                      </Typography>
                    </Box>
                    <Box style={{ display: "flex", gap: 2, marginLeft: 6 }}>
                      <Tooltip title={profile.isDefault ? "Padrão" : "Definir como padrão"}>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); cliSetAsDefault(profile); }} style={{ padding: 4 }}>
                          {profile.isDefault ? <StarIcon style={{ fontSize: 16, color: "#ffc107" }} /> : <StarBorderIcon style={{ fontSize: 16, color: "#bdbdbd" }} />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); cliDeleteProfile(profile); }} style={{ padding: 4 }}>
                          <CloseIcon style={{ fontSize: 15, color: "#e57373" }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
        <Box style={{ padding: "12px 16px", borderTop: "1px solid #e0e0e0", backgroundColor: "#f7f9fc", flexShrink: 0 }}>
          <Typography variant="caption" color="textSecondary" style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 11 }}>SALVAR CONFIGURAÇÃO ATUAL</Typography>
          <Box style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <TextField size="small" variant="outlined" placeholder="Nome do filtro..." value={cliQuickSave} onChange={(e) => setCliQuickSave(e.target.value)} onKeyPress={(e) => e.key === "Enter" && cliQuickSaveProfile()} style={{ flex: 1 }} inputProps={{ style: { padding: "7px 10px", fontSize: 13 } }} />
            <Button size="small" variant="contained" color="primary" onClick={cliQuickSaveProfile} disabled={!cliQuickSave.trim() || cliSavingQuick} style={{ whiteSpace: "nowrap", fontSize: 12 }}>
              {cliSavingQuick ? <CircularProgress size={14} color="inherit" /> : "Salvar"}
            </Button>
          </Box>
          <Typography variant="caption" style={{ color: "#1976d2", cursor: "pointer", marginTop: 8, display: "block", fontSize: 11 }}
            onClick={() => { setCliProfileName(""); setCliSetDefault(false); setCliSaveDialogOpen(true); setCliSavedDrawer(false); }}>
            ⚙ Opções avançadas (definir como padrão)
          </Typography>
        </Box>
      </Drawer>

      {/* Dialog: Salvar filtro avançado */}
      <Dialog open={cliSaveDialogOpen} onClose={() => setCliSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center"><SaveIcon style={{ color: "#1976d2", marginRight: 8 }} />Salvar Filtro de Clientes</Box>
        </DialogTitle>
        <DialogContent style={{ paddingTop: 20 }}>
          <TextField autoFocus fullWidth label="Nome do filtro" variant="outlined" value={cliProfileName} onChange={(e) => setCliProfileName(e.target.value)} onKeyPress={(e) => e.key === "Enter" && cliSaveProfile()} placeholder="Ex: Clientes Ativos SP" style={{ marginBottom: 16 }} />
          <FormControlLabel
            control={<Switch checked={cliSetDefault} onChange={(e) => setCliSetDefault(e.target.checked)} color="primary" />}
            label={<Box><Typography variant="body2">Definir como filtro padrão</Typography><Typography variant="caption" color="textSecondary">Carregado automaticamente ao abrir esta tela</Typography></Box>}
          />
        </DialogContent>
        <DialogActions style={{ borderTop: "1px solid #e0e0e0", padding: "12px 24px" }}>
          <Button onClick={() => setCliSaveDialogOpen(false)}>Cancelar</Button>
          <Button onClick={cliSaveProfile} color="primary" variant="contained" startIcon={<SaveIcon />}>Salvar Filtro</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
