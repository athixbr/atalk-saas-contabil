import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Divider,
  IconButton,
  Box,
  MenuItem,
  Select,
  InputLabel,
  Switch,
  CircularProgress,
  Checkbox,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  AppBar,
  Tooltip,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
} from "@material-ui/icons";
import { DocumentText } from "iconsax-react";
import { useHistory, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import QuadroSocietario from "../../components/QuadroSocietario";
import ClienteCNAE from "../../components/ClienteCNAE";
import ClienteContato from "../../components/ClienteContato";
import ClienteRedeSocial from "../../components/ClienteRedeSocial";
import ResponsavelDepartamento from "../../components/ResponsavelDepartamento";
import AnotacoesEmpresa from "../../components/AnotacoesEmpresa";
import EndpointSelector from "../../components/EndpointSelector";
import api from "../../services/api";

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
    padding: theme.spacing(3),
    overflowY: "scroll",
    width: "100%",
    boxSizing: "border-box",
    ...theme.scrollbarStyles,
  },
  formSection: {
    marginBottom: theme.spacing(3),
  },
  sectionTitle: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    fontWeight: 600,
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "400px",
  },
  inscricaoCard: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    position: "relative",
    backgroundColor: theme.palette.background.default,
  },
  deleteButton: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
  accordion: {
    marginBottom: theme.spacing(2),
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    border: `1px solid ${theme.palette.divider}`,
    '&:before': {
      display: 'none',
    },
    '&.Mui-expanded': {
      margin: `${theme.spacing(2)}px 0`,
    },
  },
  accordionSummary: {
    backgroundColor: theme.palette.background.default,
    '&.Mui-expanded': {
      minHeight: 48,
    },
    '& .MuiAccordionSummary-content': {
      margin: '12px 0',
      '&.Mui-expanded': {
        margin: '12px 0',
      },
    },
  },
  accordionDetails: {
    padding: theme.spacing(3),
    backgroundColor: '#fafafa',
  },
  actionButtons: {
    position: 'sticky',
    bottom: 0,
    backgroundColor: '#fff',
    padding: theme.spacing(3),
    borderRadius: '8px',
    boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
    zIndex: 100,
    marginTop: theme.spacing(3),
    borderTop: `2px solid ${theme.palette.primary.main}`,
  },
  tabsRoot: {
    marginBottom: theme.spacing(3),
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  tabPanel: {
    padding: theme.spacing(3, 0),
  },
  tab: {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    minWidth: 120,
    '&.Mui-selected': {
      color: theme.palette.primary.main,
    },
  },
}));

const estadosBrasileiros = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

// Componente TabPanel para conteúdo das abas
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`cliente-tabpanel-${index}`}
      aria-labelledby={`cliente-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `cliente-tab-${index}`,
    'aria-controls': `cliente-tabpanel-${index}`,
  };
}

const ClientesCadastro = () => {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams();

  // Estado para controle das abas
  const [tabValue, setTabValue] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [loading, setLoading] = useState(true); // Inicia como true para evitar flash de conteúdo
  const [consultandoCep, setConsultandoCep] = useState(false);
  const [consultandoCnpj, setConsultandoCnpj] = useState(false);
  const [cnaesEncontrados, setCnaesEncontrados] = useState([]);
  const [cnaeRefreshKey, setCnaeRefreshKey] = useState(0);
  const [codigoErpAnterior, setCodigoErpAnterior] = useState("");

  // Modal de criação rápida de parâmetros
  const [openNewParamModal, setOpenNewParamModal] = useState(false);
  const [newParamType, setNewParamType] = useState("");
  const [newParamName, setNewParamName] = useState("");
  const [creatingParam, setCreatingParam] = useState(false);

  // Estados para listas de parâmetros
  const [parametros, setParametros] = useState({
    status: [],
    statusComplementar: [],
    segmento: [],
    atuacao: [],
    sedeCliente: [], // Mantido para compatibilidade
    escritorioGestor: [], // Novo endpoint correto
    regimeTributarioFederal: [],
    regimeTributarioEstadual: [],
    regimeTributarioMunicipal: [],
    modalidadeFechamentoContabil: [],
    modalidadeFechamentoFiscal: [],
    modalidadeFechamentoDP: [],
    distribuicaoLucros: [],
    servicosExtraordinarios: [],
    grupoCliente: [],
    localizacaoCliente: [],
    adiantamentoFolha: [],
    controles: [],
    tipoCliente: [],
    categoriaCliente: [],
    periodicidadeCliente: [],
    envioCorrespondencia: [],
    parcelamentos: [],
    tags: [],
    tipoDocumento: [],
    // Novos Parâmetros 2026
    statusCliente: [],
    porteFederal: [],
    porteEstadual: [],
    porteMunicipal: [],
    tierCliente: [],
    clusterCliente: [],
    volumeFiscal: [],
    volumeContabil: [],
    volumeDP: [],
    volumeBPO: [],
    modalFechBPO: [],
    statusControle: [],
  });

  const [formData, setFormData] = useState({
    informaCodigoErp: "nao",
    codigoErp: "",
    codigoSistema: "",
    recorrencia: "recorrente",
    nome: "",
    razaoSocial: "",
    nomeFantasia: "",
    apelido: "",
    tipoCliente: "fisica",
    cpf: "",
    cnpj: "",
    inscricaoEstadual: "",
    dataAbertura: "",
    mesAniversario: "",
    demaisIdentificadores: [],
    honorario: "",
    produtorRural: false,
    temInscricaoEstadual: false,
    inscricoesEstaduais: [],
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    telefone: "",
    celular: "",
    email: "",
    site: "",
    observacoes: "",
    ativo: true,
    // Parâmetros que não fazem parte da vigência (ficam no cliente)
    segmentoId: "",
    grupoClienteId: "",
    atuacaoId: "",
    atuacaoIds: [],
    // Os demais parâmetros de Classificação / Enquadramento pertencem à vigência selecionada, não ao
    // cliente - ver estado `vigencias` e `vigenciaExpandidaId`.
  });

  // Estados para controle de vigência dos parâmetros
  const [vigencias, setVigencias] = useState([]);
  const [vigenciaExpandidaId, setVigenciaExpandidaId] = useState(null);
  // Vigências encerradas cujo modo de edição foi liberado explicitamente pelo usuário
  const [vigenciasEmEdicao, setVigenciasEmEdicao] = useState([]);

  // Estados para endpoints de parâmetros do cliente, agora vinculados por vigência
  const [endpointsPorVigencia, setEndpointsPorVigencia] = useState({});
  const [salvandoEndpointsVigenciaIds, setSalvandoEndpointsVigenciaIds] = useState([]);

  // Estados para modelos de parâmetros
  const [modelosDisponiveis, setModelosDisponiveis] = useState([]);
  const [openModeloDialog, setOpenModeloDialog] = useState(false);
  const [modeloSelecionado, setModeloSelecionado] = useState("");

  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);
        await Promise.all([loadParametros(), loadModelos()]);
        if (id) {
          await loadCliente();
          await loadVigencias();
        } else {
          await loadProximoCodigoSistema();
        }
      } catch (error) {
        console.error("Erro ao inicializar página:", error);
        toast.error("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [id]);

  // Aviso ao sair da página com dados não salvos
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "Você tem alterações não salvas. Deseja realmente sair?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Marcar como tendo mudanças não salvas ao alterar formData (exceto no carregamento inicial)
  useEffect(() => {
    if (!loading && id) {
      // Só marca como não salvo se já carregou um cliente para edição
      setHasUnsavedChanges(true);
    } else if (!loading && !id && (formData.razaoSocial || formData.nome || formData.cnpj || formData.cpf)) {
      // Para novos clientes, marca como não salvo se tiver dados preenchidos
      setHasUnsavedChanges(true);
    }
  }, [formData]);

  // Função para validar dados básicos obrigatórios
  const validateBasicData = () => {
    const nomeEfetivo =
      formData.tipoCliente === "juridica" ? formData.razaoSocial : formData.nome;

    if (!nomeEfetivo || !nomeEfetivo.trim()) {
      toast.error("Preencha o nome antes de continuar");
      return false;
    }
    if (!formData.nomeFantasia || !formData.nomeFantasia.trim()) {
      toast.error("Preencha o nome fantasia antes de continuar");
      return false;
    }
    if (!formData.apelido || !formData.apelido.trim()) {
      toast.error("Preencha o apelido antes de continuar");
      return false;
    }
    if (formData.tipoCliente === "juridica" && (!formData.razaoSocial || !formData.razaoSocial.trim())) {
      toast.error("Preencha a razão social antes de continuar");
      return false;
    }

    if (formData.tipoCliente === "fisica") {
      if (!formData.cpf || formData.cpf.replace(/\D/g, "").length !== 11) {
        toast.error("Preencha um CPF válido antes de continuar");
        return false;
      }
    } else {
      if (!formData.cnpj || formData.cnpj.replace(/\D/g, "").length !== 14) {
        toast.error("Preencha um CNPJ válido antes de continuar");
        return false;
      }
    }
    return true;
  };

  const syncDemaisIdentificadores = async (clienteId, identificadores = []) => {
    if (!clienteId) return;

    const identificadoresValidos = (identificadores || []).filter(
      (identificador) => identificador.tipoDocumentoId && String(identificador.valor || "").trim()
    );

    const { data: existentes } = await api.get(`/clientes/${clienteId}/demais-identificadores`);
    const idsMantidos = identificadoresValidos
      .map((identificador) => identificador.id)
      .filter(Boolean)
      .map(String);

    await Promise.all(
      (existentes || [])
        .filter((identificador) => !idsMantidos.includes(String(identificador.id)))
        .map((identificador) =>
          api.delete(`/clientes/${clienteId}/demais-identificadores/${identificador.id}`)
        )
    );

    await Promise.all(
      identificadoresValidos.map((identificador) => {
        const payload = {
          tipoDocumentoId: identificador.tipoDocumentoId,
          valor: String(identificador.valor || "").trim(),
        };

        if (identificador.id) {
          return api.put(
            `/clientes/${clienteId}/demais-identificadores/${identificador.id}`,
            payload
          );
        }

        return api.post(`/clientes/${clienteId}/demais-identificadores`, payload);
      })
    );

    const { data: atualizados } = await api.get(`/clientes/${clienteId}/demais-identificadores`);
    return atualizados || [];
  };

  // Função para auto-salvar o cliente
  const autoSaveCliente = async () => {
    try {
      setLoading(true);
      toast.info("Salvando dados básicos...");

      // Helper para sanitizar datas
      const sanitizeDate = (dateValue) => {
        if (!dateValue || dateValue === "" || dateValue === "Invalid date") {
          return null;
        }
        return dateValue;
      };

      // O "nome" do cliente é sempre derivado do campo efetivamente exibido
      // (Razão Social para pessoa jurídica, Nome para pessoa física).
      const nomeEfetivo =
        formData.tipoCliente === "juridica" ? formData.razaoSocial : formData.nome;

      // Converter array de inscrições estaduais para JSON e sanitizar datas
      const dataToSend = {
        ...formData,
        nome: (nomeEfetivo || "").trim(),
        inscricaoEstadual: formData.inscricoesEstaduais.length > 0
          ? JSON.stringify(formData.inscricoesEstaduais)
          : null,
        dataAbertura: sanitizeDate(formData.dataAbertura),
        dataInicioContrato: sanitizeDate(formData.dataInicioContrato),
      };

      const { data } = await api.post("/clientes", dataToSend);
      await syncDemaisIdentificadores(data.id, formData.demaisIdentificadores);
      
      setHasUnsavedChanges(false);
      toast.success("Cliente salvo com sucesso!");
      
      // Retornar o ID para que o componente possa atualizar a URL
      return data.id;
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao salvar cliente");
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com mudança de aba com auto-save
  const handleTabChange = async (event, newValue) => {
    // Abas que precisam de clienteId: 2 (Responsáveis), 3 (Contatos), 4 (CNAE), 5 (Comunicação), 6 (Anotações)
    const abasQueNecessitamId = [2, 3, 4, 5, 6];
    
    // Se está tentando ir para uma aba que precisa de ID e não tem ID ainda
    if (abasQueNecessitamId.includes(newValue) && !id) {
      // Validar dados básicos
      if (!validateBasicData()) {
        setTabValue(0); // Volta para a primeira aba
        return;
      }

      // Auto-salvar
      try {
        const novoId = await autoSaveCliente();
        // Redirecionar para a página de edição com o novo ID
        // Usar replace para não criar entrada duplicada no histórico
        history.replace(`/clientes/cadastro/${novoId}`);
        // A página será recarregada com o ID, então não precisa mudar a tab aqui
        return;
      } catch (error) {
        // Se falhar, não muda de aba
        return;
      }
    }

    // Se tem ID ou está indo para abas que não precisam de ID, navega normalmente
    setTabValue(newValue);
  };

  const loadParametros = async () => {
    try {
      const responses = await Promise.allSettled([
        api.get("/parametros/status"),
        api.get("/parametros/statuscomplementar"),
        api.get("/parametros/segmento"),
        api.get("/parametros/atuacao"),
        api.get("/parametros/escritoriogestor"),
        api.get("/parametros/regimetributariofederal"),
        api.get("/parametros/regimetributarioestadual"),
        api.get("/parametros/regimetributariomunicipal"),
        api.get("/parametros/modalidadefechamentocontabil"),
        api.get("/parametros/modalidadefechamentofiscal"),
        api.get("/parametros/modalidadefechamentodp"),
        api.get("/parametros/distribuicaolucros"),
        api.get("/parametros/servicosextraordinarios"),
        api.get("/parametros/grupocliente"),
        api.get("/parametros/localizacaocliente"),
        api.get("/parametros/adiantamentofolha"),
        api.get("/parametros/controles"),
        api.get("/parametros/tipocliente"),
        api.get("/parametros/categoriacliente"),
        api.get("/parametros/periodicidadecliente"),
        api.get("/parametros/enviocorrespondencia"),
        api.get("/parametros/parcelamentos"),
        api.get("/parametros/tags"),
        api.get("/parametros/tipodocumento"),
        // Novos Parâmetros 2026
        api.get("/parametros/statuscliente"),
        api.get("/parametros/portefederal"),
        api.get("/parametros/porteestadual"),
        api.get("/parametros/portemunicipal"),
        api.get("/parametros/tiercliente"),
        api.get("/parametros/clustercliente"),
        api.get("/parametros/volumefiscal"),
        api.get("/parametros/volumecontabil"),
        api.get("/parametros/volumedp"),
        api.get("/parametros/volumebpo"),
        api.get("/parametros/modalfechbpo"),
        api.get("/parametros/statuscontrole"),
      ]);

      // Extrair dados das respostas, tratando erros
      const [
        statusRes,
        statusComplementarRes,
        segmentoRes,
        atuacaoRes,
        sedeClienteRes,
        regimeFederalRes,
        regimeEstadualRes,
        regimeMunicipalRes,
        modalidadeContabilRes,
        modalidadeFiscalRes,
        modalidadeDPRes,
        distribuicaoRes,
        servicosExtraRes,
        grupoClienteRes,
        localizacaoRes,
        adiantamentoRes,
        controlesRes,
        tipoClienteRes,
        categoriaRes,
        periodicidadeRes,
        envioRes,
        parcelamentosRes,
        tagsRes,
        tipoDocumentoRes,
        // Novos Parâmetros 2026
        statusClienteRes,
        porteFederalRes,
        porteEstadualRes,
        porteMunicipalRes,
        tierClienteRes,
        clusterClienteRes,
        volumeFiscalRes,
        volumeContabilRes,
        volumeDPRes,
        volumeBPORes,
        modalFechBPORes,
        statusControleRes,
      ] = responses.map(response => 
        response.status === 'fulfilled' ? response.value : { data: [] }
      );

      setParametros({
        status: statusRes.data.status || statusRes.data || [],
        statusComplementar: statusComplementarRes.data.parametros || statusComplementarRes.data || [],
        segmento: segmentoRes.data.parametros || segmentoRes.data || [],
        atuacao: atuacaoRes.data.parametros || atuacaoRes.data || [],
        sedeCliente: sedeClienteRes.data.parametros || sedeClienteRes.data || [], // Mantido para compatibilidade
        escritorioGestor: sedeClienteRes.data.parametros || sedeClienteRes.data || [], // Novo
        regimeTributarioFederal: regimeFederalRes.data.parametros || regimeFederalRes.data || [],
        regimeTributarioEstadual: regimeEstadualRes.data.parametros || regimeEstadualRes.data || [],
        regimeTributarioMunicipal: regimeMunicipalRes.data.parametros || regimeMunicipalRes.data || [],
        modalidadeFechamentoContabil: modalidadeContabilRes.data.parametros || modalidadeContabilRes.data || [],
        modalidadeFechamentoFiscal: modalidadeFiscalRes.data.parametros || modalidadeFiscalRes.data || [],
        modalidadeFechamentoDP: modalidadeDPRes.data.parametros || modalidadeDPRes.data || [],
        distribuicaoLucros: distribuicaoRes.data.parametros || distribuicaoRes.data || [],
        servicosExtraordinarios: servicosExtraRes.data.parametros || servicosExtraRes.data || [],
        grupoCliente: grupoClienteRes.data.parametros || grupoClienteRes.data || [],
        localizacaoCliente: localizacaoRes.data.parametros || localizacaoRes.data || [],
        adiantamentoFolha: adiantamentoRes.data.parametros || adiantamentoRes.data || [],
        controles: controlesRes.data.parametros || controlesRes.data || [],
        tipoCliente: tipoClienteRes.data.parametros || tipoClienteRes.data || [],
        categoriaCliente: categoriaRes.data.parametros || categoriaRes.data || [],
        periodicidadeCliente: periodicidadeRes.data.parametros || periodicidadeRes.data || [],
        envioCorrespondencia: envioRes.data.parametros || envioRes.data || [],
        parcelamentos: parcelamentosRes.data.parametros || parcelamentosRes.data || [],
        tipoDocumento: Array.isArray(tipoDocumentoRes.data) ? tipoDocumentoRes.data : [],
        tags: Array.isArray(tagsRes.data) ? tagsRes.data : [],
        // Novos Parâmetros 2026 - retornam array direto
        statusCliente: Array.isArray(statusClienteRes.data) ? statusClienteRes.data : [],
        porteFederal: Array.isArray(porteFederalRes.data) ? porteFederalRes.data : [],
        porteEstadual: Array.isArray(porteEstadualRes.data) ? porteEstadualRes.data : [],
        porteMunicipal: Array.isArray(porteMunicipalRes.data) ? porteMunicipalRes.data : [],
        tierCliente: Array.isArray(tierClienteRes.data) ? tierClienteRes.data : [],
        clusterCliente: Array.isArray(clusterClienteRes.data) ? clusterClienteRes.data : [],
        volumeFiscal: Array.isArray(volumeFiscalRes.data) ? volumeFiscalRes.data : [],
        volumeContabil: Array.isArray(volumeContabilRes.data) ? volumeContabilRes.data : [],
        volumeDP: Array.isArray(volumeDPRes.data) ? volumeDPRes.data : [],
        volumeBPO: Array.isArray(volumeBPORes.data) ? volumeBPORes.data : [],
        modalFechBPO: Array.isArray(modalFechBPORes.data) ? modalFechBPORes.data : [],
        statusControle: Array.isArray(statusControleRes.data) ? statusControleRes.data : [],
      });

      console.log("Parâmetros carregados:", {
        statusCliente: statusClienteRes.data,
        porteFederal: porteFederalRes.data,
        clusterCliente: clusterClienteRes.data,
        grupoCliente: grupoClienteRes.data,
        // tags: tagsRes.data, // Temporariamente comentado até reiniciar backend
      });
    } catch (error) {
      console.error("Erro ao carregar parâmetros:", error);
      toast.error("Erro ao carregar parâmetros");
    }
  };

  const loadCliente = async () => {
    try {
      const { data } = await api.get(`/clientes/${id}`);
      
      console.log("Dados do cliente carregados:", data);
      setCodigoErpAnterior(data.codigoErp || "");
      
      // Parse inscricaoEstadual se for JSON (múltiplas inscrições)
      let inscricoesEstaduais = [];
      let temInscricaoEstadual = false;
      
      if (data.inscricaoEstadual) {
        try {
          inscricoesEstaduais = JSON.parse(data.inscricaoEstadual);
          temInscricaoEstadual = inscricoesEstaduais.length > 0;
        } catch {
          // Se não for JSON, é uma string simples (backward compatibility)
          inscricoesEstaduais = [];
          temInscricaoEstadual = false;
        }
      }
      
      setFormData({
        ...data,
        informaCodigoErp: data.codigoErp ? "sim" : "nao",
        codigoErp: data.codigoErp || "",
        codigoSistema: data.codigoSistema || String(data.id || ""),
        recorrencia: data.recorrencia || "recorrente",
        razaoSocial: data.razaoSocial || "",
        nomeFantasia: data.nomeFantasia || "",
        apelido: data.apelido || "",
        dataAbertura: data.dataAbertura || "",
        mesAniversario: data.mesAniversario || "",
        demaisIdentificadores: data.demaisIdentificadores || [],
        honorario: data.honorario || "",
        produtorRural: data.produtorRural || false,
        temInscricaoEstadual,
        inscricoesEstaduais,
        // Parâmetros que não fazem parte da vigência
        segmentoId: data.segmentoId || "",
        grupoClienteId: data.grupoClienteId || "",
        atuacaoId: data.atuacaoId || "",
        atuacaoIds: data.atuacaoIds || (data.atuacaoId ? [data.atuacaoId] : []),
      });
      
      // Após carregar os dados, não marcar como tendo mudanças não salvas
      setHasUnsavedChanges(false);
      
      console.log("Cliente carregado com sucesso");
    } catch (error) {
      toast.error("Erro ao carregar cliente");
      console.error("Erro ao carregar cliente:", error);
      throw error; // Re-throw para que o useEffect capture
    }
  };

  const loadProximoCodigoSistema = async () => {
    try {
      const { data } = await api.get("/clientes/proximo-codigo-sistema");
      setFormData(prev => ({
        ...prev,
        codigoSistema: data.codigoSistema || "",
      }));
    } catch (error) {
      console.error("Erro ao carregar próximo código do sistema:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "codigoErp") {
      const somenteNumeros = value.replace(/\D/g, "").slice(0, 7);
      setFormData({ ...formData, codigoErp: somenteNumeros });
    } else if (name === "informaCodigoErp") {
      const codigoRestaurado = formData.codigoErp || codigoErpAnterior;
      if (value === "nao" && formData.codigoErp) {
        setCodigoErpAnterior(formData.codigoErp);
      }
      setFormData({
        ...formData,
        informaCodigoErp: value,
        codigoErp: value === "sim" ? codigoRestaurado : "",
      });
    } else if (name === "razaoSocial") {
      // Para pessoa jurídica o campo exibido como "Razão Social" também
      // representa o "nome" do cliente no restante do sistema (listagens,
      // PDFs, cron jobs), então mantemos os dois em sincronia.
      setFormData({ ...formData, razaoSocial: value, nome: value });
    } else if (name === "dataAbertura") {
      // O input de data usa sempre o formato ISO "yyyy-mm-dd" internamente
      // (o dd/mm/yyyy é só a exibição do navegador). Assim que o mês da
      // data de abertura fica completo, sincroniza automaticamente o
      // Mês de Aniversário com esse mesmo mês.
      const mes = /^\d{4}-\d{2}-\d{2}$/.test(value) ? String(Number(value.slice(5, 7))) : "";
      setFormData({
        ...formData,
        dataAbertura: value,
        mesAniversario: mes || formData.mesAniversario,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleTipoClienteChange = (e) => {
    const tipo = e.target.value;
    const razaoSocial = tipo === "juridica" ? formData.razaoSocial : "";
    setFormData({
      ...formData,
      tipoCliente: tipo,
      cpf: tipo === "fisica" ? formData.cpf : "",
      cnpj: tipo === "juridica" ? formData.cnpj : "",
      razaoSocial,
      nome: tipo === "juridica" ? razaoSocial : formData.nome,
      inscricaoEstadual: "",
      produtorRural: false,
      temInscricaoEstadual: false,
      inscricoesEstaduais: [],
    });
  };

  const handleProdutorRuralChange = (e) => {
    setFormData({ 
      ...formData, 
      produtorRural: e.target.checked,
      inscricoesEstaduais: e.target.checked ? formData.inscricoesEstaduais : [],
    });
  };

  const handleInscricaoEstadualCheckboxChange = (e) => {
    setFormData({ 
      ...formData, 
      temInscricaoEstadual: e.target.checked,
      inscricoesEstaduais: e.target.checked ? formData.inscricoesEstaduais : [],
    });
  };

  const handleAddInscricaoEstadual = () => {
    setFormData({
      ...formData,
      inscricoesEstaduais: [
        ...formData.inscricoesEstaduais,
        { id: Date.now(), uf: "", numero: "" },
      ],
    });
  };

  const handleInscricaoChange = (id, field, value) => {
    const updated = formData.inscricoesEstaduais.map((insc) =>
      insc.id === id ? { ...insc, [field]: value } : insc
    );
    setFormData({ ...formData, inscricoesEstaduais: updated });
  };

  const handleDeleteInscricao = (id) => {
    setFormData({
      ...formData,
      inscricoesEstaduais: formData.inscricoesEstaduais.filter(
        (insc) => insc.id !== id
      ),
    });
  };

  const handleBuscarCep = async () => {
    const cepLimpo = formData.cep.replace(/\D/g, "");
    if (cepLimpo.length === 8) {
      setConsultandoCep(true);
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cepLimpo}/json/`
        );
        const data = await response.json();
        if (!data.erro) {
          setFormData({
            ...formData,
            logradouro: data.logradouro || "",
            bairro: data.bairro || "",
            cidade: data.localidade || "",
            estado: data.uf || "",
          });
        } else {
          toast.error("CEP não encontrado!");
        }
      } catch (error) {
        toast.error("Erro ao buscar CEP!");
      } finally {
        setConsultandoCep(false);
      }
    }
  };

  // Formata um código CNAE numérico (ex: "6201500") no padrão XXXX-X/XX,
  // igual ao formato usado na base própria de CNAEs.
  const formatarCodigoCnae = (valor) => {
    const digitos = String(valor || "").replace(/\D/g, "").padStart(7, "0");
    if (digitos.length !== 7) return String(valor || "");
    return `${digitos.slice(0, 4)}-${digitos.slice(4, 5)}/${digitos.slice(5)}`;
  };

  // Consulta o CNPJ na BrasilAPI (gratuita, sem limite agressivo de requisições).
  // Se indisponível, cai para a ReceitaWS como alternativa.
  const buscarCnpjBrasilApi = async (cnpjLimpo) => {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
    if (!response.ok) {
      if (response.status === 404) throw new Error("CNPJ_NOT_FOUND");
      throw new Error("BRASILAPI_FAILED");
    }
    const data = await response.json();

    const cnaes = [];
    if (data.cnae_fiscal) {
      cnaes.push({
        cnae: formatarCodigoCnae(data.cnae_fiscal),
        descricao: data.cnae_fiscal_descricao || "",
        principal: true,
      });
    }
    (data.cnaes_secundarios || []).forEach((item) => {
      cnaes.push({
        cnae: formatarCodigoCnae(item.codigo),
        descricao: item.descricao || "",
        principal: false,
      });
    });

    return {
      razaoSocial: data.razao_social || "",
      nomeFantasia: data.nome_fantasia || "",
      cep: data.cep ? data.cep.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2") : "",
      logradouro: data.logradouro || "",
      numero: data.numero || "",
      complemento: data.complemento || "",
      bairro: data.bairro || "",
      cidade: data.municipio || "",
      estado: data.uf || "",
      telefone: data.ddd_telefone_1 || "",
      email: data.email || "",
      cnaes,
    };
  };

  const buscarCnpjReceitaWs = async (cnpjLimpo) => {
    const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`);
    const data = await response.json();
    if (data.status === "ERROR") throw new Error("CNPJ_NOT_FOUND");

    const cnaes = [];
    (data.atividade_principal || []).forEach((item) => {
      cnaes.push({
        cnae: formatarCodigoCnae(item.code),
        descricao: item.text || "",
        principal: true,
      });
    });
    (data.atividades_secundarias || []).forEach((item) => {
      cnaes.push({
        cnae: formatarCodigoCnae(item.code),
        descricao: item.text || "",
        principal: false,
      });
    });

    return {
      razaoSocial: data.nome || "",
      nomeFantasia: data.fantasia || "",
      cep: data.cep ? data.cep.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2") : "",
      logradouro: data.logradouro || "",
      numero: data.numero || "",
      complemento: data.complemento || "",
      bairro: data.bairro || "",
      cidade: data.municipio || "",
      estado: data.uf || "",
      telefone: data.telefone || "",
      email: data.email || "",
      cnaes,
    };
  };

  // Envia os CNAEs encontrados na consulta de CNPJ para a aba CNAE do cliente.
  // Usado tanto na edição (cliente já salvo) quanto logo após criar um cliente novo.
  const importarCnaesEncontrados = async (clienteId, cnaes) => {
    if (!clienteId || !cnaes || cnaes.length === 0) return;
    try {
      const { data } = await api.post(`/clientes/${clienteId}/cnaes/bulk`, { cnaes });
      if (data.length > 0) {
        toast.success(`${data.length} CNAE(s) importado(s) da Receita Federal!`);
        setCnaeRefreshKey((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Erro ao importar CNAEs:", err);
      toast.error("Erro ao importar CNAEs encontrados no CNPJ");
    }
  };

  const handleBuscarCnpj = async () => {
    const cnpjLimpo = formData.cnpj.replace(/\D/g, "");
    if (cnpjLimpo.length === 14) {
      setConsultandoCnpj(true);
      try {
        let dados;
        try {
          dados = await buscarCnpjBrasilApi(cnpjLimpo);
        } catch (brasilApiError) {
          if (brasilApiError.message === "CNPJ_NOT_FOUND") throw brasilApiError;
          dados = await buscarCnpjReceitaWs(cnpjLimpo);
        }

        const { cnaes, ...dadosCliente } = dados;

        setFormData((prev) => ({
          ...prev,
          ...dadosCliente,
          // A busca de CNPJ preenche a Razão Social, mas o campo interno
          // "nome" (usado como nome do cliente em todo o sistema e checado
          // na validação obrigatória) só era sincronizado quando o usuário
          // digitava manualmente no campo. Sincroniza aqui também para que
          // "Salvar" não acuse "nome obrigatório" com o campo já preenchido.
          nome: prev.tipoCliente === "juridica" ? dadosCliente.razaoSocial : prev.nome,
        }));

        if (id) {
          // Cliente já existe: importa os CNAEs imediatamente na aba CNAE.
          await importarCnaesEncontrados(id, cnaes);
        } else {
          // Cliente novo: fica pendente até o cliente ser criado no "Salvar".
          setCnaesEncontrados(cnaes);
        }

        toast.success("Dados do CNPJ carregados com sucesso!");
      } catch (error) {
        if (error.message === "CNPJ_NOT_FOUND") {
          toast.error("CNPJ não encontrado ou inválido!");
        } else {
          toast.error("Erro ao consultar CNPJ! Tente novamente em instantes.");
        }
      } finally {
        setConsultandoCnpj(false);
      }
    }
  };

  const formatCPF = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const formatCNPJ = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const formatCEP = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{3})\d+?$/, "$1");
  };

  const formatTelefone = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const formatCelular = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const handleCpfChange = (e) => {
    const formatted = formatCPF(e.target.value);
    setFormData({ ...formData, cpf: formatted });
  };

  const handleCnpjChange = (e) => {
    const formatted = formatCNPJ(e.target.value);
    setFormData({ ...formData, cnpj: formatted });
  };

  const handleCepChange = (e) => {
    const formatted = formatCEP(e.target.value);
    setFormData({ ...formData, cep: formatted });
  };

  const handleCepBlur = () => {
    const cepLimpo = formData.cep.replace(/\D/g, "");
    if (cepLimpo.length === 8) {
      handleBuscarCep();
    }
  };

  const handleTelefoneChange = (e) => {
    const formatted = formatTelefone(e.target.value);
    setFormData({ ...formData, telefone: formatted });
  };

  const handleCelularChange = (e) => {
    const formatted = formatCelular(e.target.value);
    setFormData({ ...formData, celular: formatted });
  };

  // Funções para criação rápida de parâmetros
  const handleOpenNewParam = (paramType) => {
    setNewParamType(paramType);
    setNewParamName("");
    setOpenNewParamModal(true);
  };

  const handleCloseNewParam = () => {
    setOpenNewParamModal(false);
    setNewParamType("");
    setNewParamName("");
  };

  const handleCreateNewParam = async () => {
    if (!newParamName.trim()) {
      toast.error("Digite um nome para o parâmetro");
      return;
    }

    setCreatingParam(true);
    try {
      console.log("Criando parâmetro:", newParamType, newParamName);
      
      const response = await api.post(`/parametros/${newParamType}`, {
        nome: newParamName.trim(),
      });

      console.log("Parâmetro criado:", response.data);

      // Atualizar lista de parâmetros
      await loadParametros();

      // Mapeamento correto do tipo de parâmetro para o nome do campo
      const fieldNameMap = {
        statuscliente: "statusClienteId",
        portefederal: "porteFederalId",
        porteestadual: "porteEstadualId",
        portemunicipal: "porteMunicipalId",
        tiercliente: "tierClienteId",
        clustercliente: "clusterClienteId",
        volumefiscal: "volumeFiscalId",
        volumecontabil: "volumeContabilId",
        volumedp: "volumeDPId",
        volumebpo: "volumeBPOId",
        modalfechbpo: "modalFechBPOId",
        statuscontrole: "statusControleId",
        atuacao: "atuacaoId",
      };

      // Selecionar o novo parâmetro criado
      const fieldName = fieldNameMap[newParamType] || `${newParamType}Id`;
      const newParamId = response.data.id;
      
      console.log("Selecionando campo:", fieldName, "com valor:", newParamId);
      
      setFormData(prevData => ({ ...prevData, [fieldName]: newParamId }));

      toast.success("Parâmetro criado com sucesso!");
      handleCloseNewParam();
    } catch (error) {
      console.error("Erro ao criar parâmetro:", error);
      toast.error("Erro ao criar parâmetro");
    } finally {
      setCreatingParam(false);
    }
  };

  // Funções para gerenciamento de vigências (integradas com API)
  const loadVigencias = async () => {
    if (!id) return;
    try {
      const { data } = await api.get(`/clientes/${id}/vigencias`);
      const list = (data || []).map(v => ({
        ...v,
        dataFinal: v.dataFinal || "",
        observacao: v.observacao || "",
      }));
      setVigencias(list);
    } catch (error) {
      console.error("Erro ao carregar vigências:", error);
    }
  };

  const handleAddVigencia = async () => {
    const hasActive = vigencias.some(v => !v.dataFinal);
    const newDataInicial = new Date().toISOString().split("T")[0];

    if (!id) {
      // Sem cliente salvo ainda: apenas local
      if (hasActive) {
        toast.warning("Já existe uma vigência ativa. Encerre-a antes de adicionar outra sem data final.");
      }
      const newVig = { id: Date.now(), dataInicial: newDataInicial, dataFinal: "", observacao: "", _local: true };
      setVigencias(prev => [...prev, newVig]);
      setVigenciaExpandidaId(newVig.id);
      if (!hasActive) toast.info("Vigência adicionada. Sem data final ela será a vigência padrão do sistema.");
      return;
    }

    try {
      const { data } = await api.post(`/clientes/${id}/vigencias`, {
        dataInicial: newDataInicial,
        dataFinal: null,
      });
      const newVig = { ...data, dataFinal: "", observacao: "" };
      setVigencias(prev => [...prev, newVig]);
      setVigenciaExpandidaId(data.id);
      toast.info("Vigência adicionada. Sem data final ela será a vigência padrão do sistema.");
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao adicionar vigência");
    }
  };

  const handleRemoveVigencia = async (vigId) => {
    const vig = vigencias.find(v => v.id === vigId);
    if (vig?._local || !id) {
      setVigencias(prev => prev.filter(v => v.id !== vigId));
      return;
    }
    try {
      await api.delete(`/clientes/${id}/vigencias/${vigId}`);
      setVigencias(prev => prev.filter(v => v.id !== vigId));
      toast.success("Vigência removida.");
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao remover vigência");
    }
  };

  const handleVigenciaChange = async (vigId, field, value) => {
    if (field === "dataFinal" && value === "") {
      const hasOtherActive = vigencias.some(v => v.id !== vigId && !v.dataFinal);
      if (hasOtherActive) {
        toast.error("Já existe uma vigência ativa (sem data final). Encerre a outra vigência antes de ativar esta.");
        return;
      }
      toast.info("Sem data final, esta vigência será o padrão do sistema.");
    }

    // Atualiza localmente primeiro (UX responsivo)
    setVigencias(prev =>
      prev.map(v => (v.id === vigId ? { ...v, [field]: value } : v))
    );

    // Persiste na API se cliente já salvo
    const vig = vigencias.find(v => v.id === vigId);
    if (!vig?._local && id) {
      try {
        const updated = { ...vig, [field]: value };
        await api.put(`/clientes/${id}/vigencias/${vigId}`, {
          dataInicial: updated.dataInicial,
          dataFinal: updated.dataFinal || null,
          observacao: updated.observacao || null,
          [field]: value,
        });
      } catch (error) {
        toast.error(error.response?.data?.error || "Erro ao atualizar vigência");
        // Reverte em caso de erro
        await loadVigencias();
      }
    }
  };

  // Inputs de Data Inicial/Final e Observação disparam onChange a cada tecla
  // (ex.: ao editar um dia dentro de uma data já preenchida, o navegador gera
  // um valor completo intermediário a cada dígito). Por isso, para esses três
  // campos, o onChange só atualiza o estado local (UX responsivo) e a
  // persistência/validação no backend fica para o blur (handleVigenciaBlur) —
  // evita enviar datas incompletas que disparavam falsos erros de sobreposição.
  const handleVigenciaFieldChange = (vigId, field, value) => {
    setVigencias(prev =>
      prev.map(v => (v.id === vigId ? { ...v, [field]: value } : v))
    );
  };

  const handleVigenciaBlur = async (vigId, field) => {
    const vig = vigencias.find(v => v.id === vigId);
    if (!vig) return;

    if (field === "dataFinal" && vig.dataFinal === "") {
      const hasOtherActive = vigencias.some(v => v.id !== vigId && !v.dataFinal);
      if (hasOtherActive) {
        toast.error("Já existe uma vigência ativa (sem data final). Encerre a outra vigência antes de ativar esta.");
        return;
      }
      toast.info("Sem data final, esta vigência será o padrão do sistema.");
    }

    if (vig._local || !id) return;

    try {
      await api.put(`/clientes/${id}/vigencias/${vigId}`, {
        dataInicial: vig.dataInicial,
        dataFinal: vig.dataFinal || null,
        observacao: vig.observacao || null,
      });
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao atualizar vigência");
      // Reverte em caso de erro
      await loadVigencias();
    }
  };

  const loadEndpointsVigencia = async (vigId) => {
    if (!id || !vigId) return;
    try {
      const { data } = await api.get(`/clientes/${id}/vigencias/${vigId}/parametros-endpoints`);
      setEndpointsPorVigencia(prev => ({ ...prev, [vigId]: data || [] }));
    } catch (error) {
      console.error("Erro ao carregar endpoints da vigência:", error);
    }
  };

  const handleEndpointsChange = async (vigId, novoEndpoints) => {
    setEndpointsPorVigencia(prev => ({ ...prev, [vigId]: novoEndpoints }));

    const vig = vigencias.find(v => v.id === vigId);
    if (!id || vig?._local) return;

    setSalvandoEndpointsVigenciaIds(prev => [...prev, vigId]);
    try {
      await api.put(`/clientes/${id}/vigencias/${vigId}/parametros-endpoints`, { endpoints: novoEndpoints });
    } catch (error) {
      console.error("Erro ao salvar endpoints:", error);
    } finally {
      setSalvandoEndpointsVigenciaIds(prev => prev.filter(v => v !== vigId));
    }
  };

  const loadModelos = async () => {
    try {
      const { data } = await api.get("/modelos-parametros");
      setModelosDisponiveis(data);
    } catch (error) {
      console.error("Erro ao carregar modelos:", error);
      // Não mostra erro para o usuário, apenas log
    }
  };

  const handleOpenModeloDialog = () => {
    setModeloSelecionado("");
    setOpenModeloDialog(true);
  };

  const handleCloseModeloDialog = () => {
    setOpenModeloDialog(false);
    setModeloSelecionado("");
  };

  const CAMPOS_PARAMETROS_VIGENCIA = [
    'statusClienteId', 'statusComplementarId', 'periodicidadeClienteId',
    'tipoClienteId', 'tierClienteId', 'clusterClienteId',
    'categoriaClienteId', 'sedeClienteId', 'localizacaoClienteId',
    'segmentoId', 'atuacaoId', 'atuacaoIds',
    'tagsId', 'adiantamentoFolhaId', 'distribuicaoLucrosId',
    'porteFederalId', 'porteEstadualId', 'porteMunicipalId',
    'regimeTributarioFederalId', 'regimeTributarioEstadualId', 'regimeTributarioMunicipalId',
    'volumeFiscalId', 'volumeContabilId', 'volumeDPId', 'volumeBPOId',
    'modalidadeFechamentoContabilId', 'modalidadeFechamentoFiscalId',
    'modalidadeFechamentoDPId', 'modalFechBPOId'
  ];
  const CAMPOS_PARAMETROS_CLIENTE = ['grupoClienteId'];

  const handleAplicarModelo = async () => {
    if (!modeloSelecionado) {
      toast.warning("Selecione um modelo");
      return;
    }

    const vigenciaAlvo = vigencias.find(v => v.id === vigenciaExpandidaId);
    if (!vigenciaAlvo) {
      toast.warning("Selecione uma vigência (clique nela na lista acima) antes de aplicar um modelo");
      return;
    }
    const podeEditarAlvo = !vigenciaAlvo.dataFinal || vigenciasEmEdicao.includes(vigenciaAlvo.id);
    if (!podeEditarAlvo) {
      toast.warning("Esta vigência está encerrada. Clique em \"Editar parâmetros e tarefas\" antes de aplicar um modelo.");
      return;
    }

    try {
      const [{ data }, endpointsRes] = await Promise.allSettled([
        api.get(`/modelos-parametros/${modeloSelecionado}`),
        api.get(`/modelos-parametros/${modeloSelecionado}/endpoints`),
      ]).then(results => results.map(r => r.status === "fulfilled" ? r.value : { data: null }));

      if (data) {
        const novosParametros = {};
        CAMPOS_PARAMETROS_VIGENCIA.forEach(campo => {
          if (data[campo]) {
            novosParametros[campo] = data[campo];
          }
        });
        const novosParametrosCliente = {};
        CAMPOS_PARAMETROS_CLIENTE.forEach(campo => {
          if (data[campo]) {
            novosParametrosCliente[campo] = data[campo];
          }
        });

        // Persiste os parâmetros do modelo direto na vigência selecionada
        await api.put(`/clientes/${id}/vigencias/${vigenciaAlvo.id}`, {
          dataInicial: vigenciaAlvo.dataInicial,
          dataFinal: vigenciaAlvo.dataFinal || null,
          observacao: vigenciaAlvo.observacao || null,
          ...novosParametros,
        });

        setVigencias(prev =>
          prev.map(v => (v.id === vigenciaAlvo.id ? { ...v, ...novosParametros } : v))
        );

        if (Object.keys(novosParametrosCliente).length > 0) {
          const clienteAtualizado = { ...formData, ...novosParametrosCliente };
          await api.put(`/clientes/${id}`, clienteAtualizado);
          setFormData(clienteAtualizado);
        }
      }

      // Aplica e persiste os endpoints do modelo na vigência selecionada
      if (endpointsRes && endpointsRes.data && endpointsRes.data.length > 0) {
        await handleEndpointsChange(vigenciaAlvo.id, endpointsRes.data);
      }

      toast.success(`Modelo "${data?.nome || ''}" aplicado com sucesso!`);
      handleCloseModeloDialog();
    } catch (error) {
      console.error("Erro ao aplicar modelo:", error);
      toast.error(error.response?.data?.error || "Erro ao aplicar modelo");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // O "nome" do cliente é sempre derivado do campo efetivamente exibido
    // (Razão Social para pessoa jurídica, Nome para pessoa física), em vez
    // de depender de formData.nome já estar sincronizado, evitando o erro
    // de "nome obrigatório" com o campo visivelmente preenchido.
    const nomeEfetivo =
      formData.tipoCliente === "juridica" ? formData.razaoSocial : formData.nome;

    // Validações
    if (!nomeEfetivo || !nomeEfetivo.trim()) {
      toast.error("O nome é obrigatório!");
      return;
    }

    if (!formData.nomeFantasia || !formData.nomeFantasia.trim()) {
      toast.error("O nome fantasia é obrigatório!");
      return;
    }

    if (!formData.apelido || !formData.apelido.trim()) {
      toast.error("O apelido é obrigatório!");
      return;
    }

    if (!nomeEfetivo || !nomeEfetivo.trim()) {
      toast.error(
        formData.tipoCliente === "juridica"
          ? "A razão social é obrigatória!"
          : "O nome é obrigatório!"
      );
      return;
    }

    if (formData.informaCodigoErp === "sim" && !/^\d{7}$/.test(formData.codigoErp || "")) {
      toast.error("O Código ERP deve conter exatamente 7 dígitos numéricos!");
      return;
    }

    if (formData.tipoCliente === "fisica") {
      if (!formData.cpf || formData.cpf.replace(/\D/g, "").length !== 11) {
        toast.error("CPF inválido!");
        return;
      }
    }

    if (formData.tipoCliente === "juridica") {
      if (!formData.cnpj || formData.cnpj.replace(/\D/g, "").length !== 14) {
        toast.error("CNPJ inválido!");
        return;
      }
      if (!formData.razaoSocial.trim()) {
        toast.error("A razão social é obrigatória para pessoa jurídica!");
        return;
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("E-mail inválido!");
      return;
    }

    setLoading(true);
    try {
      // Helper para sanitizar datas
      const sanitizeDate = (dateValue) => {
        if (!dateValue || dateValue === "" || dateValue === "Invalid date") {
          return null;
        }
        return dateValue;
      };

      // Converter array de inscrições estaduais para JSON e sanitizar datas
      const dataToSend = {
        ...formData,
        codigoErp: formData.informaCodigoErp === "sim" ? formData.codigoErp : null,
        nome: nomeEfetivo.trim(),
        inscricaoEstadual: formData.inscricoesEstaduais.length > 0
          ? JSON.stringify(formData.inscricoesEstaduais)
          : null,
        dataAbertura: sanitizeDate(formData.dataAbertura),
        dataInicioContrato: sanitizeDate(formData.dataInicioContrato),
      };

      if (id) {
        await api.put(`/clientes/${id}`, dataToSend);
        const demaisIdentificadores = await syncDemaisIdentificadores(id, formData.demaisIdentificadores);
        setFormData((prev) => ({ ...prev, demaisIdentificadores }));
        toast.success("Cliente atualizado com sucesso!");
        setHasUnsavedChanges(false);
      } else {
        const { data } = await api.post("/clientes", dataToSend);
        await syncDemaisIdentificadores(data.id, formData.demaisIdentificadores);
        toast.success("Cliente criado com sucesso!");
        setHasUnsavedChanges(false);
        if (cnaesEncontrados.length > 0) {
          await importarCnaesEncontrados(data.id, cnaesEncontrados);
          setCnaesEncontrados([]);
        }
        history.replace(`/clientes/cadastro/${data.id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao salvar cliente");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("Você tem alterações não salvas. Deseja realmente sair?")) {
        setHasUnsavedChanges(false);
        history.push("/clientes");
      }
    } else {
      history.push("/clientes");
    }
  };

  // Componente helper para Select com busca e botão de adicionar
  const SelectWithAdd = ({ label, name, value, options, paramType, onChange, disabled, multiple = false }) => {
    const selectedOption = multiple
      ? options.filter(o => (value || []).map(String).includes(String(o.id)))
      : options.find(o => String(o.id) === String(value)) || null;

    return (
      <Box width="100%" display="flex" alignItems="flex-start">
        <Autocomplete
          fullWidth
          disabled={!!disabled}
          options={options}
          getOptionLabel={(option) => option.nome || option.name || ""}
          multiple={multiple}
          value={selectedOption}
          onChange={(event, newValue) => {
            const newId = multiple ? (newValue || []).map(item => item.id) : (newValue ? newValue.id : "");
            if (onChange) {
              onChange(newId);
            } else {
              handleInputChange({ target: { name, value: newId } });
            }
          }}
          noOptionsText="Nenhuma opção encontrada"
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              variant="outlined"
              margin="normal"
            />
          )}
        />
        {!disabled && (
          <Tooltip title={`Criar novo: ${label}`}>
            <IconButton
              color="primary"
              onClick={() => handleOpenNewParam(paramType)}
              style={{ marginTop: 16, marginLeft: 8 }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );
  };

  return (
    <div className={classes.mainContainer}>
      <MainHeader>
        <Title>{id ? "Editar Cliente" : "Novo Cliente"}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleCancel}
          >
            Voltar
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      {loading ? (
        <Paper className={classes.mainPaper} variant="outlined">
          <Box className={classes.loadingContainer}>
            <CircularProgress />
          </Box>
        </Paper>
      ) : (
        <Paper className={classes.mainPaper} variant="outlined">
          {/* Sistema de Abas */}
          <Paper className={classes.tabsRoot}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="📋 Informações Básicas" {...a11yProps(0)} className={classes.tab} />
              <Tab label="⚙️ Enquadramento" {...a11yProps(1)} className={classes.tab} />
              <Tooltip
                title={!id ? "Preencha os dados básicos. Ao clicar aqui, salvaremos automaticamente." : ""}
                placement="top"
              >
                <Tab
                  label="👥 Responsáveis"
                  {...a11yProps(2)}
                  className={classes.tab}
                  style={{ opacity: !id ? 0.6 : 1 }}
                />
              </Tooltip>
              <Tooltip
                title={!id ? "Preencha os dados básicos. Ao clicar aqui, salvaremos automaticamente." : ""}
                placement="top"
              >
                <Tab
                  label="📇 Contatos"
                  {...a11yProps(3)}
                  className={classes.tab}
                  style={{ opacity: !id ? 0.6 : 1 }}
                />
              </Tooltip>
              <Tooltip
                title={!id ? "Preencha os dados básicos. Ao clicar aqui, salvaremos automaticamente." : ""}
                placement="top"
              >
                <Tab
                  label="📊 CNAE"
                  {...a11yProps(4)}
                  className={classes.tab}
                  style={{ opacity: !id ? 0.6 : 1 }}
                />
              </Tooltip>
              <Tooltip
                title={!id ? "Preencha os dados básicos. Ao clicar aqui, salvaremos automaticamente." : ""}
                placement="top"
              >
                <Tab
                  label="💬 Comunicação"
                  {...a11yProps(5)}
                  className={classes.tab}
                  style={{ opacity: !id ? 0.6 : 1 }}
                />
              </Tooltip>
              <Tooltip
                title={!id ? "Preencha os dados básicos. Ao clicar aqui, salvaremos automaticamente." : ""}
                placement="top"
              >
                <Tab
                  label="📝 Anotações"
                  {...a11yProps(6)}
                  className={classes.tab}
                  style={{ opacity: !id ? 0.6 : 1 }}
                />
              </Tooltip>
            </Tabs>
          </Paper>

          <form onSubmit={handleSubmit}>
            
            {/* ========== ABA 1: INFORMAÇÕES BÁSICAS ========== */}
            <TabPanel value={tabValue} index={0} className={classes.tabPanel}>
              {/* ========== SEÇÃO: DADOS GERAIS ========== */}
              <Accordion defaultExpanded className={classes.accordion}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                className={classes.accordionSummary}
              >
                <Typography variant="h6">Dados Gerais</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.accordionDetails}>
                <Grid container spacing={2}>
                  {/* Tipo de Cliente */}
                  <Grid item xs={12} sm={6}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend">Tipo de Cliente</FormLabel>
                      <RadioGroup
                        row
                        name="tipoCliente"
                        value={formData.tipoCliente}
                        onChange={handleTipoClienteChange}
                        >
                          <FormControlLabel
                            value="fisica"
                            control={<Radio color="primary" />}
                            label="Pessoa Física"
                          />
                          <FormControlLabel
                            value="juridica"
                            control={<Radio color="primary" />}
                            label="Pessoa Jurídica"
                          />
                        </RadioGroup>
                      </FormControl>
                    </Grid>

                    {/* Recorrência */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>Recorrência</InputLabel>
                        <Select
                          name="recorrencia"
                          value={formData.recorrencia}
                          onChange={handleInputChange}
                          label="Recorrência"
                        >
                          <MenuItem value="recorrente">Recorrente</MenuItem>
                          <MenuItem value="nao_recorrente">Não recorrente</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* CNPJ/CPF */}
                    {formData.tipoCliente === "fisica" ? (
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="CPF *"
                          name="cpf"
                          value={formData.cpf}
                          onChange={handleCpfChange}
                          required
                          fullWidth
                          variant="outlined"
                          placeholder="000.000.000-00"
                          inputProps={{ maxLength: 14 }}
                        />
                      </Grid>
                    ) : (
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="CNPJ *"
                          name="cnpj"
                          value={formData.cnpj}
                          onChange={handleCnpjChange}
                          required
                          fullWidth
                          variant="outlined"
                          placeholder="00.000.000/0000-00"
                          inputProps={{ maxLength: 18 }}
                          InputProps={{
                            endAdornment: (
                              <IconButton
                                size="small"
                                onClick={handleBuscarCnpj}
                                disabled={
                                  consultandoCnpj ||
                                  formData.cnpj.replace(/\D/g, "").length !== 14
                                }
                                title="Consultar CNPJ"
                              >
                                {consultandoCnpj ? <CircularProgress size={20} /> : <SearchIcon />}
                              </IconButton>
                            ),
                          }}
                        />
                      </Grid>
                    )}

                    {formData.tipoCliente === "juridica" ? (
                      <>
                        {/* Razão Social (na posição do Nome Fantasia, logo após o CNPJ) */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Razão Social *"
                            name="razaoSocial"
                            value={formData.razaoSocial}
                            onChange={handleInputChange}
                            required
                            fullWidth
                            variant="outlined"
                          />
                        </Grid>

                        {/* Nome Fantasia */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Nome Fantasia *"
                            name="nomeFantasia"
                            value={formData.nomeFantasia}
                            onChange={handleInputChange}
                            required
                            fullWidth
                            variant="outlined"
                          />
                        </Grid>

                        {/* Apelido */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Apelido *"
                            name="apelido"
                            value={formData.apelido}
                            onChange={handleInputChange}
                            required
                            fullWidth
                            variant="outlined"
                          />
                        </Grid>

                        {/* Código ERP */}
                        <Grid item xs={12} sm={6}>
                          <FormControl component="fieldset">
                            <FormLabel component="legend">Possui Código ERP?</FormLabel>
                            <RadioGroup
                              row
                              name="informaCodigoErp"
                              value={formData.informaCodigoErp}
                              onChange={handleInputChange}
                            >
                              <FormControlLabel value="nao" control={<Radio color="primary" />} label="Não" />
                              <FormControlLabel value="sim" control={<Radio color="primary" />} label="Sim" />
                            </RadioGroup>
                          </FormControl>
                        </Grid>

                        {/* Código IP */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Código IP"
                            name="codigoSistema"
                            value={formData.codigoSistema || "Será gerado ao salvar"}
                            fullWidth
                            variant="outlined"
                            InputProps={{ readOnly: true }}
                          />
                        </Grid>

                        {formData.informaCodigoErp === "sim" && (
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Código ERP"
                              name="codigoErp"
                              value={formData.codigoErp}
                              onChange={handleInputChange}
                              fullWidth
                              variant="outlined"
                              placeholder="Ex: 0001234"
                              inputProps={{ maxLength: 7, inputMode: "numeric", pattern: "\\d{7}" }}
                              helperText="Informe 7 dígitos numéricos."
                            />
                          </Grid>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Nome */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Nome *"
                            name="nome"
                            value={formData.nome}
                            onChange={handleInputChange}
                            required
                            fullWidth
                            variant="outlined"
                          />
                        </Grid>

                        {/* Nome Fantasia */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Nome Fantasia *"
                            name="nomeFantasia"
                            value={formData.nomeFantasia}
                            onChange={handleInputChange}
                            required
                            fullWidth
                            variant="outlined"
                          />
                        </Grid>

                        {/* Apelido */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Apelido *"
                            name="apelido"
                            value={formData.apelido}
                            onChange={handleInputChange}
                            required
                            fullWidth
                            variant="outlined"
                          />
                        </Grid>

                        {/* Código ERP */}
                        <Grid item xs={12} sm={6}>
                          <FormControl component="fieldset">
                            <FormLabel component="legend">Possui Código ERP?</FormLabel>
                            <RadioGroup
                              row
                              name="informaCodigoErp"
                              value={formData.informaCodigoErp}
                              onChange={handleInputChange}
                            >
                              <FormControlLabel value="nao" control={<Radio color="primary" />} label="Não" />
                              <FormControlLabel value="sim" control={<Radio color="primary" />} label="Sim" />
                            </RadioGroup>
                          </FormControl>
                        </Grid>

                        {/* Código IP */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Código IP"
                            name="codigoSistema"
                            value={formData.codigoSistema || "Será gerado ao salvar"}
                            fullWidth
                            variant="outlined"
                            InputProps={{ readOnly: true }}
                          />
                        </Grid>

                        {formData.informaCodigoErp === "sim" && (
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Código ERP"
                              name="codigoErp"
                              value={formData.codigoErp}
                              onChange={handleInputChange}
                              fullWidth
                              variant="outlined"
                              placeholder="Ex: 0001234"
                              inputProps={{ maxLength: 7, inputMode: "numeric", pattern: "\\d{7}" }}
                              helperText="Informe 7 dígitos numéricos."
                            />
                          </Grid>
                        )}
                      </>
                    )}

                    {/* Data de Abertura */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Data de Abertura"
                        name="dataAbertura"
                        type="date"
                        value={formData.dataAbertura}
                        onChange={handleInputChange}
                        fullWidth
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: "1900-01-01", max: "2099-12-31" }}
                      />
                    </Grid>

                    {/* Mês de Aniversário */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>Mês de Aniversário</InputLabel>
                        <Select
                          name="mesAniversario"
                          value={formData.mesAniversario}
                          onChange={handleInputChange}
                          label="Mês de Aniversário"
                        >
                          <MenuItem value="">
                            <em>Selecione</em>
                          </MenuItem>
                          <MenuItem value="1">Janeiro</MenuItem>
                          <MenuItem value="2">Fevereiro</MenuItem>
                          <MenuItem value="3">Março</MenuItem>
                          <MenuItem value="4">Abril</MenuItem>
                          <MenuItem value="5">Maio</MenuItem>
                          <MenuItem value="6">Junho</MenuItem>
                          <MenuItem value="7">Julho</MenuItem>
                          <MenuItem value="8">Agosto</MenuItem>
                          <MenuItem value="9">Setembro</MenuItem>
                          <MenuItem value="10">Outubro</MenuItem>
                          <MenuItem value="11">Novembro</MenuItem>
                          <MenuItem value="12">Dezembro</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Endereço - CEP */}
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="CEP"
                        name="cep"
                        value={formData.cep}
                        onChange={handleCepChange}
                        onBlur={handleCepBlur}
                        fullWidth
                        variant="outlined"
                        placeholder="00000-000"
                        inputProps={{ maxLength: 9 }}
                        InputProps={{
                          endAdornment: consultandoCep && (
                            <CircularProgress size={20} />
                          ),
                        }}
                      />
                    </Grid>

                    {/* Logradouro */}
                    <Grid item xs={12} sm={8}>
                      <TextField
                        label="Logradouro"
                        name="logradouro"
                        value={formData.logradouro}
                        onChange={handleInputChange}
                        fullWidth
                        variant="outlined"
                      />
                    </Grid>

                    {/* Número */}
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Número"
                        name="numero"
                        value={formData.numero}
                        onChange={handleInputChange}
                        fullWidth
                        variant="outlined"
                      />
                    </Grid>

                    {/* Complemento */}
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Complemento"
                        name="complemento"
                        value={formData.complemento}
                        onChange={handleInputChange}
                        fullWidth
                        variant="outlined"
                      />
                    </Grid>

                    {/* Bairro */}
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Bairro"
                        name="bairro"
                        value={formData.bairro}
                        onChange={handleInputChange}
                        fullWidth
                        variant="outlined"
                      />
                    </Grid>

                    {/* Cidade */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Cidade"
                        name="cidade"
                        value={formData.cidade}
                        onChange={handleInputChange}
                        fullWidth
                        variant="outlined"
                      />
                    </Grid>

                    {/* UF */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>UF</InputLabel>
                        <Select
                          name="estado"
                          value={formData.estado}
                          onChange={handleInputChange}
                          label="UF"
                        >
                          <MenuItem value="">
                            <em>Selecione</em>
                          </MenuItem>
                          {estadosBrasileiros.map((uf) => (
                            <MenuItem key={uf} value={uf}>
                              {uf}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Divider */}
                    <Grid item xs={12}>
                      <Divider style={{ margin: "16px 0" }} />
                      {id ? (
                        <QuadroSocietario clienteId={id} onVinculoChange={loadCliente} />
                      ) : (
                        <Box className={classes.emptyState}>
                          <Typography variant="body2" color="textSecondary">
                            Salve o cliente para adicionar sócios.
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12}>
                      <Divider style={{ margin: "16px 0" }} />
                      <Typography variant="subtitle1" style={{ fontWeight: 600, marginTop: 16 }}>
                        Demais Identificadores
                      </Typography>
                    </Grid>

                    {/* Lista de Identificadores */}
                    {formData.demaisIdentificadores && formData.demaisIdentificadores.map((identificador, index) => (
                      <React.Fragment key={index}>
                        <Grid item xs={12} sm={5}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel>Tipo de Documento</InputLabel>
                            <Select
                              value={identificador.tipoDocumentoId}
                              onChange={(e) => {
                                const newIdentificadores = [...formData.demaisIdentificadores];
                                newIdentificadores[index].tipoDocumentoId = e.target.value;
                                setFormData({ ...formData, demaisIdentificadores: newIdentificadores });
                              }}
                              label="Tipo de Documento"
                            >
                              <MenuItem value="">
                                <em>Selecione</em>
                              </MenuItem>
                              {parametros.tipoDocumento.map((tipo) => (
                                <MenuItem key={tipo.id} value={tipo.id}>
                                  {tipo.nome}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={5}>
                          <TextField
                            label="Número do Documento"
                            value={identificador.valor}
                            onChange={(e) => {
                              const newIdentificadores = [...formData.demaisIdentificadores];
                              newIdentificadores[index].valor = e.target.value.replace(/\D/g, '');
                              setFormData({ ...formData, demaisIdentificadores: newIdentificadores });
                            }}
                            fullWidth
                            variant="outlined"
                            placeholder="Apenas números"
                          />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <IconButton
                            color="secondary"
                            onClick={() => {
                              const newIdentificadores = formData.demaisIdentificadores.filter((_, i) => i !== index);
                              setFormData({ ...formData, demaisIdentificadores: newIdentificadores });
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </React.Fragment>
                    ))}

                    {/* Botão Adicionar Identificador */}
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          const newIdentificadores = [...(formData.demaisIdentificadores || []), { tipoDocumentoId: '', valor: '' }];
                          setFormData({ ...formData, demaisIdentificadores: newIdentificadores });
                        }}
                      >
                        Adicionar Identificador
                      </Button>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

            <Divider style={{ margin: "24px 0" }} />

            {/* Inscrições Estaduais - para Produtor Rural (PF) ou PJ com Inscrição Estadual */}
            {(formData.produtorRural || formData.temInscricaoEstadual) && (
              <>
                <Typography variant="h6" className={classes.sectionTitle}>
                  Inscrições Estaduais
                </Typography>

                {formData.inscricoesEstaduais.map((inscricao) => (
                  <Card key={inscricao.id} className={classes.inscricaoCard}>
                    <IconButton
                      className={classes.deleteButton}
                      size="small"
                      onClick={() => handleDeleteInscricao(inscricao.id)}
                    >
                      <DeleteIcon />
                    </IconButton>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <FormControl variant="outlined" fullWidth>
                          <InputLabel>UF</InputLabel>
                          <Select
                            value={inscricao.uf}
                            onChange={(e) =>
                              handleInscricaoChange(inscricao.id, "uf", e.target.value)
                            }
                            label="UF"
                          >
                            <MenuItem value="">
                              <em>Selecione</em>
                            </MenuItem>
                            {estadosBrasileiros.map((uf) => (
                              <MenuItem key={uf} value={uf}>
                                {uf}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <TextField
                          label="Número da Inscrição Estadual"
                          value={inscricao.numero}
                          onChange={(e) =>
                            handleInscricaoChange(inscricao.id, "numero", e.target.value)
                          }
                          fullWidth
                          variant="outlined"
                          placeholder="000.000.000.000"
                        />
                      </Grid>
                    </Grid>
                  </Card>
                ))}

                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddInscricaoEstadual}
                  style={{ marginBottom: 24 }}
                >
                  Adicionar Inscrição Estadual
                </Button>

                <Divider style={{ margin: "24px 0" }} />
              </>
            )}
            </TabPanel>

            {/* ========== ABA 2: PARÂMETROS ========== */}
            <TabPanel value={tabValue} index={1} className={classes.tabPanel}>
            {/* Parâmetros Organizados por Categorias */}
            <Typography variant="h6" className={classes.sectionTitle} style={{ marginBottom: 16 }}>
              Parâmetros do Cliente
            </Typography>

            {/* Controle de Vigência */}
            <Card style={{ marginBottom: 24, padding: 16, backgroundColor: '#f5f5f5', border: '1px solid #e0e0e0' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="body1" style={{ fontWeight: 600, color: '#1976d2' }}>
                  Vigência dos Parâmetros
                </Typography>
                <Tooltip title={!id ? "Salve os dados básicos do cliente antes de criar uma vigência" : ""}>
                  <span>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={handleAddVigencia}
                      disabled={!id}
                    >
                      Adicionar Vigência
                    </Button>
                  </span>
                </Tooltip>
              </Box>

              {vigencias.length === 0 && (
                <Typography variant="body2" color="textSecondary" style={{ marginBottom: 8 }}>
                  {!id
                    ? "Salve os dados básicos do cliente (aba Informações Básicas) para poder cadastrar vigências e seus parâmetros."
                    : 'Nenhuma vigência cadastrada. Clique em "Adicionar Vigência" para definir um período de validade dos parâmetros.'}
                </Typography>
              )}

              {/* Lista de Vigências */}
              <List disablePadding>
                {vigencias.map((vig, idx) => {
                  const isAtiva = !vig.dataFinal;
                  const isExpandida = vigenciaExpandidaId === vig.id;
                  const podeEditar = isAtiva || vigenciasEmEdicao.includes(vig.id);
                  return (
                    <React.Fragment key={vig.id}>
                      {/* Cabeçalho da Vigência */}
                      <ListItem
                        button
                        onClick={() => {
                          const novoId = isExpandida ? null : vig.id;
                          setVigenciaExpandidaId(novoId);
                          if (novoId && !vig._local && endpointsPorVigencia[novoId] === undefined) {
                            loadEndpointsVigencia(novoId);
                          }
                        }}
                        style={{
                          borderRadius: 8,
                          marginBottom: 4,
                          border: isAtiva ? '2px solid #1976d2' : '1px solid #ccc',
                          backgroundColor: isAtiva ? '#e3f2fd' : '#fff',
                          padding: '8px 12px',
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip
                                label={isAtiva ? "Ativa (Padrão)" : "Encerrada"}
                                size="small"
                                style={{
                                  backgroundColor: isAtiva ? '#1976d2' : '#9e9e9e',
                                  color: '#fff',
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                  marginRight: 8,
                                }}
                              />
                              <Typography variant="body2" style={{ fontWeight: 600 }}>
                                {vig.dataInicial
                                  ? new Date(vig.dataInicial + 'T00:00:00').toLocaleDateString('pt-BR')
                                  : '—'}
                                {' '}→{' '}
                                {vig.dataFinal
                                  ? new Date(vig.dataFinal + 'T00:00:00').toLocaleDateString('pt-BR')
                                  : 'Em aberto'}
                              </Typography>
                              {vig.observacao && (
                                <Typography variant="caption" color="textSecondary" style={{ marginLeft: 8, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                                  {vig.observacao}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Remover vigência">
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); handleRemoveVigencia(vig.id); }}
                              style={{ color: '#f44336' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>

                      {/* Detalhe expandido */}
                      {isExpandida && (
                        <Card style={{ margin: '0 0 8px 16px', padding: 16, border: '1px solid #90caf9', backgroundColor: '#fafeff' }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                fullWidth
                                label="Data Inicial *"
                                type="date"
                                value={vig.dataInicial}
                                onChange={(e) => handleVigenciaFieldChange(vig.id, "dataInicial", e.target.value)}
                                onBlur={() => handleVigenciaBlur(vig.id, "dataInicial")}
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                                size="small"
                                disabled={!podeEditar}
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                fullWidth
                                label="Data Final"
                                type="date"
                                value={vig.dataFinal}
                                onChange={(e) => handleVigenciaFieldChange(vig.id, "dataFinal", e.target.value)}
                                onBlur={() => handleVigenciaBlur(vig.id, "dataFinal")}
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                                size="small"
                                disabled={!podeEditar}
                                helperText={isAtiva ? "Sem data final = vigência ativa (padrão)" : ""}
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Chip
                                label={isAtiva ? "Ativa (Padrão)" : "Encerrada"}
                                style={{
                                  backgroundColor: isAtiva ? '#1976d2' : '#9e9e9e',
                                  color: '#fff',
                                  fontWeight: 600,
                                  marginTop: 8,
                                }}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Observação"
                                multiline
                                rows={3}
                                value={vig.observacao || ""}
                                onChange={(e) => handleVigenciaFieldChange(vig.id, "observacao", e.target.value)}
                                onBlur={() => handleVigenciaBlur(vig.id, "observacao")}
                                variant="outlined"
                                size="small"
                                disabled={!podeEditar}
                                placeholder="Adicione uma observação sobre esta vigência (motivo da criação, mudanças, etc.)"
                              />
                            </Grid>
                          </Grid>

                          {!isAtiva && (
                            <Box display="flex" alignItems="center" justifyContent="space-between" style={{ margin: '16px 0 8px' }}>
                              <Typography variant="caption" color="textSecondary">
                                {podeEditar
                                  ? "Edição liberada — alterações nos parâmetros e tarefas desta vigência encerrada serão salvas normalmente."
                                  : "Vigência encerrada — os parâmetros abaixo são somente leitura (histórico do período)."}
                              </Typography>
                              <Button
                                size="small"
                                color={podeEditar ? "default" : "primary"}
                                onClick={() =>
                                  setVigenciasEmEdicao(prev =>
                                    podeEditar ? prev.filter(vId => vId !== vig.id) : [...prev, vig.id]
                                  )
                                }
                              >
                                {podeEditar ? "Concluir edição" : "Editar parâmetros e tarefas"}
                              </Button>
                            </Box>
                          )}

                          {/* Aplicar Modelo de Parâmetros - vigência ativa ou em edição */}
                          {podeEditar && modelosDisponiveis.length > 0 && (
                            <Card style={{ margin: '16px 0', padding: 16, backgroundColor: '#f9fafb', border: '1px solid #e3e8ef' }}>
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="subtitle1" style={{ fontWeight: 600, color: '#333' }}>
                                    🎯 Modelo de Parâmetros
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    Aplique um modelo pré-configurado para preencher os parâmetros desta vigência automaticamente
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleOpenModeloDialog}
                                    startIcon={<DocumentText />}
                                  >
                                    Aplicar Modelo
                                  </Button>
                                </Grid>
                              </Grid>
                            </Card>
                          )}

                          {/* Accordion 1: Classificação */}
                          <Accordion className={classes.accordion} style={{ marginTop: 16 }} defaultExpanded>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} className={classes.accordionSummary}>
                              <Typography variant="subtitle1" style={{ fontWeight: 600, color: '#1976d2' }}>
                                📊 Classificação
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails className={classes.accordionDetails}>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Periodicidade do Cliente"
                                    name="periodicidadeClienteId"
                                    value={vig.periodicidadeClienteId}
                                    options={parametros.periodicidadeCliente}
                                    paramType="periodicidadecliente"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "periodicidadeClienteId", v)}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Tier Cliente"
                                    name="tierClienteId"
                                    value={vig.tierClienteId}
                                    options={parametros.tierCliente}
                                    paramType="tiercliente"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "tierClienteId", v)}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Cluster Cliente"
                                    name="clusterClienteId"
                                    value={vig.clusterClienteId}
                                    options={parametros.clusterCliente}
                                    paramType="clustercliente"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "clusterClienteId", v)}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Categoria Cliente"
                                    name="categoriaClienteId"
                                    value={vig.categoriaClienteId}
                                    options={parametros.categoriaCliente}
                                    paramType="categoriacliente"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "categoriaClienteId", v)}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Escritório Gestor"
                                    name="sedeClienteId"
                                    value={vig.sedeClienteId}
                                    options={parametros.escritorioGestor || parametros.sedeCliente}
                                    paramType="escritoriogestor"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "sedeClienteId", v)}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Localização"
                                    name="localizacaoClienteId"
                                    value={vig.localizacaoClienteId}
                                    options={parametros.localizacaoCliente}
                                    paramType="localizacaocliente"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "localizacaoClienteId", v)}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Tag Cliente"
                                    name="tagsId"
                                    value={vig.tagsId || ""}
                                    options={parametros.tags || []}
                                    paramType="tags"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "tagsId", v)}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Adiantamento Folha"
                                    name="adiantamentoFolhaId"
                                    value={vig.adiantamentoFolhaId}
                                    options={parametros.adiantamentoFolha}
                                    paramType="adiantamentofolha"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "adiantamentoFolhaId", v)}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Distribuição Lucro"
                                    name="distribuicaoLucrosId"
                                    value={vig.distribuicaoLucrosId}
                                    options={parametros.distribuicaoLucros}
                                    paramType="distribuicaolucros"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "distribuicaoLucrosId", v)}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Volume Fiscal"
                                    name="volumeFiscalId"
                                    value={vig.volumeFiscalId}
                                    options={parametros.volumeFiscal}
                                    paramType="volumefiscal"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "volumeFiscalId", v)}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Volume Contábil"
                                    name="volumeContabilId"
                                    value={vig.volumeContabilId}
                                    options={parametros.volumeContabil}
                                    paramType="volumecontabil"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "volumeContabilId", v)}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Volume DP"
                                    name="volumeDPId"
                                    value={vig.volumeDPId}
                                    options={parametros.volumeDP}
                                    paramType="volumedp"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "volumeDPId", v)}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Volume BPO"
                                    name="volumeBPOId"
                                    value={vig.volumeBPOId}
                                    options={parametros.volumeBPO}
                                    paramType="volumebpo"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "volumeBPOId", v)}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Modal Fecha Contábil"
                                    name="modalidadeFechamentoContabilId"
                                    value={vig.modalidadeFechamentoContabilId}
                                    options={parametros.modalidadeFechamentoContabil}
                                    paramType="modalidadefechamentocontabil"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "modalidadeFechamentoContabilId", v)}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Modal Fecha Fiscal"
                                    name="modalidadeFechamentoFiscalId"
                                    value={vig.modalidadeFechamentoFiscalId}
                                    options={parametros.modalidadeFechamentoFiscal}
                                    paramType="modalidadefechamentofiscal"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "modalidadeFechamentoFiscalId", v)}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Modal Fecha DP"
                                    name="modalidadeFechamentoDPId"
                                    value={vig.modalidadeFechamentoDPId}
                                    options={parametros.modalidadeFechamentoDP}
                                    paramType="modalidadefechamentodp"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "modalidadeFechamentoDPId", v)}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Modal Fecha BPO"
                                    name="modalFechBPOId"
                                    value={vig.modalFechBPOId}
                                    options={parametros.modalFechBPO}
                                    paramType="modalfechbpo"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "modalFechBPOId", v)}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Grupo do Cliente"
                                    name="grupoClienteId"
                                    value={formData.grupoClienteId}
                                    options={parametros.grupoCliente}
                                    paramType="grupocliente"
                                    disabled={!podeEditar}
                                    onChange={(v) => setFormData((prev) => ({ ...prev, grupoClienteId: v }))}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Segmento"
                                    name="segmentoId"
                                    value={vig.segmentoId}
                                    options={parametros.segmento}
                                    paramType="segmento"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "segmentoId", v)}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Atuação"
                                    name="atuacaoIds"
                                    value={vig.atuacaoIds || (vig.atuacaoId ? [vig.atuacaoId] : [])}
                                    options={parametros.atuacao}
                                    paramType="atuacao"
                                    disabled={!podeEditar}
                                    multiple
                                    onChange={(v) => handleVigenciaChange(vig.id, "atuacaoIds", v)}
                                  />
                                </Grid>
                              </Grid>
                            </AccordionDetails>
                          </Accordion>

                          {/* Accordion 2: Enquadramento */}
                          <Accordion className={classes.accordion} defaultExpanded>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} className={classes.accordionSummary}>
                              <Typography variant="subtitle1" style={{ fontWeight: 600, color: '#1976d2' }}>
                                📈 Enquadramento
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails className={classes.accordionDetails}>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Status do Cliente"
                                    name="statusClienteId"
                                    value={vig.statusClienteId}
                                    options={parametros.statusCliente}
                                    paramType="statuscliente"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "statusClienteId", v)}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Status Complementar"
                                    name="statusComplementarId"
                                    value={vig.statusComplementarId}
                                    options={parametros.statusComplementar}
                                    paramType="statuscomplementar"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "statusComplementarId", v)}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Tipo de Pessoa"
                                    name="tipoClienteId"
                                    value={vig.tipoClienteId}
                                    options={parametros.tipoCliente}
                                    paramType="tipocliente"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "tipoClienteId", v)}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Porte Federal"
                                    name="porteFederalId"
                                    value={vig.porteFederalId}
                                    options={parametros.porteFederal}
                                    paramType="portefederal"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "porteFederalId", v)}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Porte Estadual"
                                    name="porteEstadualId"
                                    value={vig.porteEstadualId}
                                    options={parametros.porteEstadual}
                                    paramType="porteestadual"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "porteEstadualId", v)}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Porte Municipal"
                                    name="porteMunicipalId"
                                    value={vig.porteMunicipalId}
                                    options={parametros.porteMunicipal}
                                    paramType="portemunicipal"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "porteMunicipalId", v)}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Regime Tributário Federal"
                                    name="regimeTributarioFederalId"
                                    value={vig.regimeTributarioFederalId}
                                    options={parametros.regimeTributarioFederal}
                                    paramType="regimetributariofederal"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "regimeTributarioFederalId", v)}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Regime Tributário Estadual"
                                    name="regimeTributarioEstadualId"
                                    value={vig.regimeTributarioEstadualId}
                                    options={parametros.regimeTributarioEstadual}
                                    paramType="regimetributarioestadual"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "regimeTributarioEstadualId", v)}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <SelectWithAdd
                                    label="Regime Tributário Municipal"
                                    name="regimeTributarioMunicipalId"
                                    value={vig.regimeTributarioMunicipalId}
                                    options={parametros.regimeTributarioMunicipal}
                                    paramType="regimetributariomunicipal"
                                    disabled={!podeEditar}
                                    onChange={(v) => handleVigenciaChange(vig.id, "regimeTributarioMunicipalId", v)}
                                  />
                                </Grid>
                              </Grid>
                            </AccordionDetails>
                          </Accordion>

                          {/* Tarefas & Controles Vinculados a esta vigência */}
                          <Card style={{ marginTop: 16, padding: 20, border: '1px solid #e3e8ef', backgroundColor: '#fafafa' }}>
                            {vig._local ? (
                              <Typography variant="caption" color="textSecondary">
                                Salve o cliente e a vigência antes de vincular tarefas e controles.
                              </Typography>
                            ) : (
                              <>
                                <EndpointSelector
                                  selectedEndpoints={endpointsPorVigencia[vig.id] || []}
                                  onChange={(novo) => handleEndpointsChange(vig.id, novo)}
                                  readOnly={!podeEditar}
                                />
                                {salvandoEndpointsVigenciaIds.includes(vig.id) && (
                                  <Box display="flex" alignItems="center" mt={1}>
                                    <CircularProgress size={14} style={{ marginRight: 8 }} />
                                    <Typography variant="caption" color="textSecondary">Salvando...</Typography>
                                  </Box>
                                )}
                              </>
                            )}
                          </Card>
                        </Card>
                      )}
                    </React.Fragment>
                  );
                })}
              </List>

              <Typography variant="caption" color="textSecondary" style={{ display: 'block', marginTop: 8 }}>
                * Clique em uma vigência para ver os detalhes, os parâmetros de enquadramento e as tarefas & controles vinculados daquele período. Vigências sem data final são ativas (padrão do sistema) e ficam sempre editáveis; vigências encerradas ficam somente leitura por padrão, mas podem ser liberadas para edição pelo botão "Editar parâmetros e tarefas". Apenas uma vigência ativa é permitida, e os períodos (datas inicial/final) de vigências não podem se sobrepor — exceto ao iniciar uma vigência hoje.
              </Typography>
            </Card>
            </TabPanel>

            {/* ========== ABA 3: RESPONSÁVEIS ========== */}
            <TabPanel value={tabValue} index={2} className={classes.tabPanel}>
              {!id && (
                <Box 
                  mb={3} 
                  p={2} 
                  style={{ 
                    backgroundColor: '#e3f2fd', 
                    borderRadius: '8px',
                    border: '1px solid #2196f3'
                  }}
                >
                  <Typography variant="body1" style={{ color: '#1976d2', fontWeight: 500 }}>
                    ℹ️ Os dados do cliente serão salvos automaticamente ao navegar para esta aba
                  </Typography>
                </Box>
              )}
          {/* ========== SEÇÃO: RESPONSÁVEIS PELO DEPARTAMENTO ========== */}
          <Accordion defaultExpanded className={classes.accordion}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className={classes.accordionSummary}
            >
              <Typography variant="h6">Responsáveis pelo Departamento</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <Box width="100%">
                <ResponsavelDepartamento clienteId={id} />
              </Box>
            </AccordionDetails>
          </Accordion>
            </TabPanel>

            {/* ========== ABA 4: CONTATOS ========== */}
            <TabPanel value={tabValue} index={3} className={classes.tabPanel}>
              {!id && (
                <Box
                  mb={3}
                  p={2}
                  style={{
                    backgroundColor: '#e3f2fd',
                    borderRadius: '8px',
                    border: '1px solid #2196f3'
                  }}
                >
                  <Typography variant="body1" style={{ color: '#1976d2', fontWeight: 500 }}>
                    ℹ️ Os dados do cliente serão salvos automaticamente ao navegar para esta aba
                  </Typography>
                </Box>
              )}
          {/* ========== SEÇÃO: CONTATOS NA EMPRESA ========== */}
          <Accordion defaultExpanded className={classes.accordion}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className={classes.accordionSummary}
            >
              <Typography variant="h6">Contatos na Empresa</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <Box width="100%">
                <ClienteContato clienteId={id} />
              </Box>
            </AccordionDetails>
          </Accordion>
            </TabPanel>

            {/* ========== ABA 5: DADOS FISCAIS ========== */}
            <TabPanel value={tabValue} index={4} className={classes.tabPanel}>
              {!id && (
                <Box
                  mb={3}
                  p={2}
                  style={{
                    backgroundColor: '#e3f2fd',
                    borderRadius: '8px',
                    border: '1px solid #2196f3'
                  }}
                >
                  <Typography variant="body1" style={{ color: '#1976d2', fontWeight: 500 }}>
                    ℹ️ Os dados do cliente serão salvos automaticamente ao navegar para esta aba
                  </Typography>
                </Box>
              )}
          {/* ========== SEÇÃO: CNAE ========== */}
          <Accordion defaultExpanded className={classes.accordion}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className={classes.accordionSummary}
            >
              <Typography variant="h6">CNAE</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <Box width="100%">
                <ClienteCNAE key={cnaeRefreshKey} clienteId={id} />
              </Box>
            </AccordionDetails>
          </Accordion>
            </TabPanel>

            {/* ========== ABA 6: COMUNICAÇÃO ========== */}
            <TabPanel value={tabValue} index={5} className={classes.tabPanel}>
              {!id && (
                <Box
                  mb={3}
                  p={2}
                  style={{
                    backgroundColor: '#e3f2fd',
                    borderRadius: '8px',
                    border: '1px solid #2196f3'
                  }}
                >
                  <Typography variant="body1" style={{ color: '#1976d2', fontWeight: 500 }}>
                    ℹ️ Os dados do cliente serão salvos automaticamente ao navegar para esta aba
                  </Typography>
                </Box>
              )}
          {/* ========== SEÇÃO: REDE SOCIAL ========== */}
          <Accordion defaultExpanded className={classes.accordion}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className={classes.accordionSummary}
            >
              <Typography variant="h6">Rede Social</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <Box width="100%">
                <ClienteRedeSocial clienteId={id} />
              </Box>
            </AccordionDetails>
          </Accordion>
            </TabPanel>

            {/* ========== ABA 7: ANOTAÇÕES ========== */}
            <TabPanel value={tabValue} index={6} className={classes.tabPanel}>
              {!id && (
                <Box 
                  mb={3} 
                  p={2} 
                  style={{ 
                    backgroundColor: '#e3f2fd', 
                    borderRadius: '8px',
                    border: '1px solid #2196f3'
                  }}
                >
                  <Typography variant="body1" style={{ color: '#1976d2', fontWeight: 500 }}>
                    ℹ️ Os dados do cliente serão salvos automaticamente ao navegar para esta aba
                  </Typography>
                </Box>
              )}
          {/* ========== SEÇÃO: ANOTAÇÕES DA EMPRESA ========== */}
          <Accordion defaultExpanded className={classes.accordion}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className={classes.accordionSummary}
            >
              <Typography variant="h6">Anotações da Empresa</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <Box width="100%">
                <AnotacoesEmpresa clienteId={id} />
              </Box>
            </AccordionDetails>
          </Accordion>
            </TabPanel>

          </form>

          {/* Botões de Ação - Flutuante entre as abas */}
          <Divider style={{ margin: "24px 0" }} />
          <Box 
            className={classes.actionButtons}
            display="flex" 
            justifyContent="space-between" 
            alignItems="center"
          >
            <Button 
              variant="outlined" 
              startIcon={<ArrowBackIcon />}
              onClick={handleCancel} 
              disabled={loading}
              size="large"
            >
              Voltar
            </Button>
            <Box display="flex" gap={2}>
              <Button 
                variant="outlined" 
                onClick={handleCancel} 
                disabled={loading}
                size="large"
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={loading}
                onClick={handleSubmit}
                size="large"
                style={{
                  minWidth: '180px',
                  background: loading ? undefined : 'linear-gradient(135deg, #0596cd 0%, #047ba5 100%)',
                }}
              >
                {loading ? "Salvando..." : "Salvar Cliente"}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Modal de Criação Rápida de Parâmetros */}
      <Dialog
        open={openNewParamModal}
        onClose={handleCloseNewParam}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Criar Novo Parâmetro
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Parâmetro"
            type="text"
            fullWidth
            variant="outlined"
            value={newParamName}
            onChange={(e) => setNewParamName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleCreateNewParam();
              }
            }}
            disabled={creatingParam}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewParam} color="default" disabled={creatingParam}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateNewParam}
            color="primary"
            variant="contained"
            disabled={creatingParam || !newParamName.trim()}
            startIcon={creatingParam ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {creatingParam ? "Criando..." : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para Aplicar Modelo de Parâmetros */}
      <Dialog
        open={openModeloDialog}
        onClose={handleCloseModeloDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Aplicar Modelo de Parâmetros</DialogTitle>
        <DialogContent>
          <Typography color="textSecondary" gutterBottom>
            Selecione um modelo para preencher automaticamente os parâmetros da vigência ativa selecionada.
            Os valores atuais dessa vigência serão substituídos.
          </Typography>
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel>Modelo</InputLabel>
            <Select
              value={modeloSelecionado}
              onChange={(e) => setModeloSelecionado(e.target.value)}
              label="Modelo"
            >
              <MenuItem value="">
                <em>Selecione um modelo</em>
              </MenuItem>
              {modelosDisponiveis.map((modelo) => (
                <MenuItem key={modelo.id} value={modelo.id}>
                  {modelo.nome}
                  {modelo.descricao && (
                    <Typography variant="caption" style={{ marginLeft: 8, color: '#666' }}>
                      - {modelo.descricao}
                    </Typography>
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModeloDialog} color="default">
            Cancelar
          </Button>
          <Button
            onClick={handleAplicarModelo}
            color="primary"
            variant="contained"
            disabled={!modeloSelecionado}
          >
            Aplicar Modelo
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ClientesCadastro;
