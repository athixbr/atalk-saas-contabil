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
} from "@material-ui/core";
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
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import QuadroSocietario from "../../components/QuadroSocietario";
import ClienteCNAE from "../../components/ClienteCNAE";
import ClienteContato from "../../components/ClienteContato";
import ClienteRedeSocial from "../../components/ClienteRedeSocial";
import ResponsavelDepartamento from "../../components/ResponsavelDepartamento";
import AnotacoesEmpresa from "../../components/AnotacoesEmpresa";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(3),
    overflowY: "scroll",
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
    codigoErp: "",
    codigoSistema: "",
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
    // Parâmetros de Enquadramento
    statusId: "",
    statusComplementarId: "",
    segmentoId: "",
    sedeClienteId: "",
    regimeTributarioFederalId: "",
    regimeTributarioEstadualId: "",
    regimeTributarioMunicipalId: "",
    modalidadeFechamentoContabilId: "",
    modalidadeFechamentoFiscalId: "",
    modalidadeFechamentoDPId: "",
    distribuicaoLucrosId: "",
    servicosExtraordinariosId: "",
    grupoClienteId: "",
    localizacaoClienteId: "",
    adiantamentoFolhaId: "",
    controlesId: "",
    tipoClienteId: "",
    categoriaClienteId: "",
    periodicidadeClienteId: "",
    envioCorrespondenciaId: "",
    parcelamentosId: "",
    tagsId: "",
    // Novos Parâmetros 2026
    statusClienteId: "",
    porteFederalId: "",
    porteEstadualId: "",
    porteMunicipalId: "",
    tierClienteId: "",
    clusterClienteId: "",
    volumeFiscalId: "",
    volumeContabilId: "",
    volumeDPId: "",
    volumeBPOId: "",
    modalFechBPOId: "",
    statusControleId: "",
  });

  // Estados para controle de vigência dos parâmetros
  const [vigenciaHabilitada, setVigenciaHabilitada] = useState(true);
  const [vigenciaTipo, setVigenciaTipo] = useState("todos"); // "todos" ou "individual"
  const [vigenciaGeral, setVigenciaGeral] = useState({
    dataInicial: "",
    dataFinal: "",
  });
  const [vigenciaParametros, setVigenciaParametros] = useState({});

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
    // Validar nome
    if (formData.tipoCliente === "fisica") {
      if (!formData.nome || !formData.nome.trim()) {
        toast.error("Preencha o nome antes de continuar");
        return false;
      }
      if (!formData.cpf || formData.cpf.replace(/\D/g, "").length !== 11) {
        toast.error("Preencha um CPF válido antes de continuar");
        return false;
      }
    } else {
      if (!formData.razaoSocial || !formData.razaoSocial.trim()) {
        toast.error("Preencha a razão social antes de continuar");
        return false;
      }
      if (!formData.cnpj || formData.cnpj.replace(/\D/g, "").length !== 14) {
        toast.error("Preencha um CNPJ válido antes de continuar");
        return false;
      }
    }
    return true;
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

      // Converter array de inscrições estaduais para JSON e sanitizar datas
      const dataToSend = {
        ...formData,
        inscricaoEstadual: formData.inscricoesEstaduais.length > 0 
          ? JSON.stringify(formData.inscricoesEstaduais)
          : null,
        dataAbertura: sanitizeDate(formData.dataAbertura),
        dataInicioContrato: sanitizeDate(formData.dataInicioContrato),
      };

      const { data } = await api.post("/clientes", dataToSend);
      
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
    // Abas que precisam de clienteId: 2 (Sócios), 3 (Responsáveis & Contatos), 4 (Dados Fiscais), 5 (Anotações)
    const abasQueNecessitamId = [2, 3, 4, 5];
    
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
        codigoErp: data.codigoErp || "",
        codigoSistema: data.codigoSistema || "",
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
        // Garantir que os IDs dos parâmetros estejam corretos
        statusId: data.statusId || "",
        statusComplementarId: data.statusComplementarId || "",
        segmentoId: data.segmentoId || "",
        sedeClienteId: data.sedeClienteId || "",
        regimeTributarioFederalId: data.regimeTributarioFederalId || "",
        regimeTributarioEstadualId: data.regimeTributarioEstadualId || "",
        regimeTributarioMunicipalId: data.regimeTributarioMunicipalId || "",
        modalidadeFechamentoContabilId: data.modalidadeFechamentoContabilId || "",
        modalidadeFechamentoFiscalId: data.modalidadeFechamentoFiscalId || "",
        modalidadeFechamentoDPId: data.modalidadeFechamentoDPId || "",
        distribuicaoLucrosId: data.distribuicaoLucrosId || "",
        servicosExtraordinariosId: data.servicosExtraordinariosId || "",
        grupoClienteId: data.grupoClienteId || "",
        localizacaoClienteId: data.localizacaoClienteId || "",
        adiantamentoFolhaId: data.adiantamentoFolhaId || "",
        controlesId: data.controlesId || "",
        tipoClienteId: data.tipoClienteId || "",
        categoriaClienteId: data.categoriaClienteId || "",
        periodicidadeClienteId: data.periodicidadeClienteId || "",
        envioCorrespondenciaId: data.envioCorrespondenciaId || "",
        parcelamentosId: data.parcelamentosId || "",
        tagsId: data.tagsId || "",
        // Novos Parâmetros 2026
        statusClienteId: data.statusClienteId || "",
        porteFederalId: data.porteFederalId || "",
        porteEstadualId: data.porteEstadualId || "",
        porteMunicipalId: data.porteMunicipalId || "",
        tierClienteId: data.tierClienteId || "",
        clusterClienteId: data.clusterClienteId || "",
        volumeFiscalId: data.volumeFiscalId || "",
        volumeContabilId: data.volumeContabilId || "",
        volumeDPId: data.volumeDPId || "",
        volumeBPOId: data.volumeBPOId || "",
        modalFechBPOId: data.modalFechBPOId || "",
        statusControleId: data.statusControleId || "",
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTipoClienteChange = (e) => {
    const tipo = e.target.value;
    setFormData({
      ...formData,
      tipoCliente: tipo,
      cpf: tipo === "fisica" ? formData.cpf : "",
      cnpj: tipo === "juridica" ? formData.cnpj : "",
      razaoSocial: tipo === "juridica" ? formData.razaoSocial : "",
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

  const handleBuscarCnpj = async () => {
    const cnpjLimpo = formData.cnpj.replace(/\D/g, "");
    if (cnpjLimpo.length === 14) {
      setConsultandoCnpj(true);
      try {
        const response = await fetch(
          `https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`
        );
        const data = await response.json();

        if (data.status !== "ERROR") {
          setFormData({
            ...formData,
            razaoSocial: data.nome || "",
            nomeFantasia: data.fantasia || "",
            cep: data.cep
              ? data.cep.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2")
              : "",
            logradouro: data.logradouro || "",
            numero: data.numero || "",
            complemento: data.complemento || "",
            bairro: data.bairro || "",
            cidade: data.municipio || "",
            estado: data.uf || "",
            telefone: data.telefone || "",
            email: data.email || "",
          });
          toast.success("Dados do CNPJ carregados com sucesso!");
        } else {
          toast.error("CNPJ não encontrado ou inválido!");
        }
      } catch (error) {
        toast.error("Erro ao consultar CNPJ!");
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

  const handleAplicarModelo = async () => {
    if (!modeloSelecionado) {
      toast.warning("Selecione um modelo");
      return;
    }

    try {
      const { data } = await api.get(`/modelos-parametros/${modeloSelecionado}`);
      
      // Aplica os parâmetros do modelo no formData
      const camposModelo = [
        'statusClienteId', 'statusComplementarId', 'periodicidadeClienteId',
        'tipoClienteId', 'tierClienteId', 'clusterClienteId',
        'categoriaClienteId', 'sedeClienteId', 'localizacaoClienteId',
        'tagsId', 'adiantamentoFolhaId', 'distribuicaoLucrosId',
        'porteFederalId', 'porteEstadualId', 'porteMunicipalId',
        'regimeTributarioFederalId', 'regimeTributarioEstadualId', 'regimeTributarioMunicipalId',
        'volumeFiscalId', 'volumeContabilId', 'volumeDPId', 'volumeBPOId',
        'modalidadeFechamentoContabilId', 'modalidadeFechamentoFiscalId',
        'modalidadeFechamentoDPId', 'modalFechBPOId'
      ];

      const novosParametros = {};
      camposModelo.forEach(campo => {
        if (data[campo]) {
          novosParametros[campo] = data[campo];
        }
      });

      setFormData(prev => ({ ...prev, ...novosParametros }));
      toast.success(`Modelo "${data.nome}" aplicado com sucesso!`);
      handleCloseModeloDialog();
    } catch (error) {
      console.error("Erro ao aplicar modelo:", error);
      toast.error("Erro ao aplicar modelo");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações
    if (!formData.nome.trim()) {
      toast.error("O nome é obrigatório!");
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
        inscricaoEstadual: formData.inscricoesEstaduais.length > 0 
          ? JSON.stringify(formData.inscricoesEstaduais)
          : null,
        dataAbertura: sanitizeDate(formData.dataAbertura),
        dataInicioContrato: sanitizeDate(formData.dataInicioContrato),
      };
      
      if (id) {
        await api.put(`/clientes/${id}`, dataToSend);
        toast.success("Cliente atualizado com sucesso!");
        setHasUnsavedChanges(false); // Limpar flag de mudanças não salvas
        // Não redireciona, mantém na página de edição
      } else {
        const { data } = await api.post("/clientes", dataToSend);
        toast.success("Cliente criado com sucesso!");
        setHasUnsavedChanges(false);
        // Para novo cliente, redireciona para o modo de edição
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

  // Componente helper para Select com botão de adicionar
  const SelectWithAdd = ({ label, name, value, options, paramType }) => {
    const paramVigencia = vigenciaParametros[name] || { dataInicial: "", dataFinal: "" };
    
    return (
      <Box width="100%">
        <Box display="flex" alignItems="flex-start" width="100%">
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel>{label}</InputLabel>
            <Select
              name={name}
              value={value}
              onChange={handleInputChange}
              label={label}
            >
              <MenuItem value="">
                <em>Nenhum</em>
              </MenuItem>
              {options.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.nome || item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton
            color="primary"
            onClick={() => handleOpenNewParam(paramType)}
            style={{ marginTop: 16, marginLeft: 8 }}
            title={`Criar novo ${label}`}
          >
            <AddIcon />
          </IconButton>
        </Box>
        
        {vigenciaHabilitada && vigenciaTipo === "individual" && (
          <Grid container spacing={2} style={{ marginTop: 4, paddingLeft: 8 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Data Inicial"
                type="date"
                size="small"
                value={paramVigencia.dataInicial}
                onChange={(e) => setVigenciaParametros({
                  ...vigenciaParametros,
                  [name]: { ...paramVigencia, dataInicial: e.target.value }
                })}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Data Final (opcional)"
                type="date"
                size="small"
                value={paramVigencia.dataFinal}
                onChange={(e) => setVigenciaParametros({
                  ...vigenciaParametros,
                  [name]: { ...paramVigencia, dataFinal: e.target.value }
                })}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                helperText="Opcional"
              />
            </Grid>
          </Grid>
        )}
      </Box>
    );
  };

  return (
    <MainContainer>
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
              <Tab label="⚙️ Parâmetros" {...a11yProps(1)} className={classes.tab} />
              <Tooltip 
                title={!id ? "Preencha os dados básicos. Ao clicar aqui, salvaremos automaticamente." : ""}
                placement="top"
              >
                <Tab 
                  label="👤 Sócios" 
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
                  label="👥 Responsáveis & Contatos" 
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
                  label="📊 Dados Fiscais & Comunicação" 
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
                  label="📝 Anotações" 
                  {...a11yProps(5)} 
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
                  <Grid item xs={12}>
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

                    {/* Código ERP */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Código ERP"
                        name="codigoErp"
                        value={formData.codigoErp}
                        onChange={handleInputChange}
                        fullWidth
                        variant="outlined"
                        placeholder="Ex: CLI001"
                      />
                    </Grid>

                    {/* Razão Social (PJ) ou Nome (PF) */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label={formData.tipoCliente === "juridica" ? "Razão Social *" : "Nome *"}
                        name={formData.tipoCliente === "juridica" ? "razaoSocial" : "nome"}
                        value={formData.tipoCliente === "juridica" ? formData.razaoSocial : formData.nome}
                        onChange={handleInputChange}
                        required
                        fullWidth
                        variant="outlined"
                      />
                    </Grid>

                    {/* Nome Fantasia */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Nome Fantasia"
                        name="nomeFantasia"
                        value={formData.nomeFantasia}
                        onChange={handleInputChange}
                        fullWidth
                        variant="outlined"
                      />
                    </Grid>

                    {/* Apelido */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Apelido"
                        name="apelido"
                        value={formData.apelido}
                        onChange={handleInputChange}
                        fullWidth
                        variant="outlined"
                      />
                    </Grid>

                    {/* CNPJ/CPF */}
                    {formData.tipoCliente === "fisica" ? (
                      <>
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
                      </>
                    ) : (
                      <>
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

                    {/* Grupo do Cliente */}
                    <Grid item xs={12} sm={6}>
                      <SelectWithAdd
                        label="Grupo do Cliente"
                        name="grupoClienteId"
                        value={formData.grupoClienteId}
                        options={parametros.grupoCliente}
                        paramType="grupocliente"
                      />
                    </Grid>

                    {/* Segmento */}
                    <Grid item xs={12} sm={6}>
                      <SelectWithAdd
                        label="Segmento"
                        name="segmentoId"
                        value={formData.segmentoId}
                        options={parametros.segmento}
                        paramType="segmento"
                      />
                    </Grid>

                    {/* Divider */}
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
            <Card style={{ marginBottom: 24, padding: 16, backgroundColor: '#f5f5f5' }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="body1" style={{ fontWeight: 500, color: '#1976d2' }}>
                  ✓ Vigência dos Parâmetros Habilitada
                </Typography>
              </Box>

              {/* Vigência sempre habilitada - tipo individual comentado */}
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary" style={{ marginBottom: 8 }}>
                  Vigência Geral (todos os parâmetros)
                </Typography>
                {/* <FormControl component="fieldset">
                  <FormLabel component="legend" style={{ marginBottom: 8 }}>
                    Tipo de Vigência
                  </FormLabel>
                  <RadioGroup
                    row
                    value={vigenciaTipo}
                    onChange={(e) => setVigenciaTipo(e.target.value)}
                  >
                    <FormControlLabel
                      value="todos"
                      control={<Radio color="primary" />}
                      label="Vigência Geral (todos os parâmetros)"
                    />
                    <FormControlLabel
                      value="individual"
                      control={<Radio color="primary" />}
                      label="Vigência Individual (por parâmetro)"
                    />
                  </RadioGroup>
                </FormControl> */}
              </Box>

              {vigenciaTipo === "todos" && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Data Inicial *"
                      type="date"
                      value={vigenciaGeral.dataInicial}
                      onChange={(e) => setVigenciaGeral({ ...vigenciaGeral, dataInicial: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Data Final (opcional)"
                      type="date"
                      value={vigenciaGeral.dataFinal}
                      onChange={(e) => setVigenciaGeral({ ...vigenciaGeral, dataFinal: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                      size="small"
                      helperText="Deixe em branco para vigência indeterminada"
                    />
                  </Grid>
                </Grid>
              )}

              {/* {vigenciaTipo === "individual" && (
                <Typography variant="body2" color="textSecondary">
                  💡 Configure a vigência individualmente para cada parâmetro abaixo
                </Typography>
              )} */}
            </Card>

            {/* Aplicar Modelo de Parâmetros */}
            {modelosDisponiveis.length > 0 && (
              <Card style={{ marginBottom: 24, padding: 16, backgroundColor: '#f9fafb', border: '1px solid #e3e8ef' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" style={{ fontWeight: 600, color: '#333' }}>
                      🎯 Modelo de Parâmetros
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Aplique um modelo pré-configurado para preencher os parâmetros automaticamente
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
            <Accordion defaultExpanded className={classes.accordion}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} className={classes.accordionSummary}>
                <Typography variant="subtitle1" style={{ fontWeight: 600, color: '#1976d2' }}>
                  📊 Classificação
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.accordionDetails}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <SelectWithAdd
                      label="Status do Cliente"
                      name="statusClienteId"
                      value={formData.statusClienteId}
                      options={parametros.statusCliente}
                      paramType="statuscliente"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SelectWithAdd
                      label="Status Complementar"
                      name="statusComplementarId"
                      value={formData.statusComplementarId}
                      options={parametros.statusComplementar}
                      paramType="statuscomplementar"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SelectWithAdd
                      label="Periodicidade do Cliente"
                      name="periodicidadeClienteId"
                      value={formData.periodicidadeClienteId}
                      options={parametros.periodicidadeCliente}
                      paramType="periodicidadecliente"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SelectWithAdd
                      label="Tipo de Pessoa"
                      name="tipoClienteId"
                      value={formData.tipoClienteId}
                      options={parametros.tipoCliente}
                      paramType="tipocliente"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SelectWithAdd
                      label="Tier Cliente"
                      name="tierClienteId"
                      value={formData.tierClienteId}
                      options={parametros.tierCliente}
                      paramType="tiercliente"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SelectWithAdd
                      label="Cluster Cliente"
                      name="clusterClienteId"
                      value={formData.clusterClienteId}
                      options={parametros.clusterCliente}
                      paramType="clustercliente"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SelectWithAdd
                      label="Categoria Cliente"
                      name="categoriaClienteId"
                      value={formData.categoriaClienteId}
                      options={parametros.categoriaCliente}
                      paramType="categoriacliente"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SelectWithAdd
                      label="Escritório Gestor"
                      name="sedeClienteId"
                      value={formData.sedeClienteId}
                      options={parametros.escritorioGestor || parametros.sedeCliente}
                      paramType="escritoriogestor"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SelectWithAdd
                      label="Localização"
                      name="localizacaoClienteId"
                      value={formData.localizacaoClienteId}
                      options={parametros.localizacaoCliente}
                      paramType="localizacaocliente"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SelectWithAdd
                      label="Tag Cliente"
                      name="tagsId"
                      value={formData.tagsId || ""}
                      options={parametros.tags || []}
                      paramType="tags"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SelectWithAdd
                      label="Adiantamento Folha"
                      name="adiantamentoFolhaId"
                      value={formData.adiantamentoFolhaId}
                      options={parametros.adiantamentoFolha}
                      paramType="adiantamentofolha"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SelectWithAdd
                      label="Distribuição Lucro"
                      name="distribuicaoLucrosId"
                      value={formData.distribuicaoLucrosId}
                      options={parametros.distribuicaoLucros}
                      paramType="distribuicaolucros"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Accordion 2: Enquadramento Tributário */}
            <Accordion className={classes.accordion}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} className={classes.accordionSummary}>
                <Typography variant="subtitle1" style={{ fontWeight: 600, color: '#1976d2' }}>
                  📋 Enquadramento Tributário
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.accordionDetails}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <SelectWithAdd
                      label="Porte Federal"
                      name="porteFederalId"
                      value={formData.porteFederalId}
                      options={parametros.porteFederal}
                      paramType="portefederal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SelectWithAdd
                      label="Porte Estadual"
                      name="porteEstadualId"
                      value={formData.porteEstadualId}
                      options={parametros.porteEstadual}
                      paramType="porteestadual"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SelectWithAdd
                      label="Porte Municipal"
                      name="porteMunicipalId"
                      value={formData.porteMunicipalId}
                      options={parametros.porteMunicipal}
                      paramType="portemunicipal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SelectWithAdd
                      label="Regime Tributário Federal"
                      name="regimeTributarioFederalId"
                      value={formData.regimeTributarioFederalId}
                      options={parametros.regimeTributarioFederal}
                      paramType="regimetributariofederal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SelectWithAdd
                      label="Regime Tributário Estadual"
                      name="regimeTributarioEstadualId"
                      value={formData.regimeTributarioEstadualId}
                      options={parametros.regimeTributarioEstadual}
                      paramType="regimetributarioestadual"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SelectWithAdd
                      label="Regime Tributário Municipal"
                      name="regimeTributarioMunicipalId"
                      value={formData.regimeTributarioMunicipalId}
                      options={parametros.regimeTributarioMunicipal}
                      paramType="regimetributariomunicipal"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Accordion 3: Enquadramento Operacional */}
            <Accordion className={classes.accordion}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} className={classes.accordionSummary}>
                <Typography variant="subtitle1" style={{ fontWeight: 600, color: '#1976d2' }}>
                  📈 Enquadramento Operacional
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.accordionDetails}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <SelectWithAdd
                      label="Volume Fiscal"
                      name="volumeFiscalId"
                      value={formData.volumeFiscalId}
                      options={parametros.volumeFiscal}
                      paramType="volumefiscal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SelectWithAdd
                      label="Volume Contábil"
                      name="volumeContabilId"
                      value={formData.volumeContabilId}
                      options={parametros.volumeContabil}
                      paramType="volumecontabil"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SelectWithAdd
                      label="Volume DP"
                      name="volumeDPId"
                      value={formData.volumeDPId}
                      options={parametros.volumeDP}
                      paramType="volumedp"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SelectWithAdd
                      label="Volume BPO"
                      name="volumeBPOId"
                      value={formData.volumeBPOId}
                      options={parametros.volumeBPO}
                      paramType="volumebpo"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SelectWithAdd
                      label="Modal Fecha Contábil"
                      name="modalidadeFechamentoContabilId"
                      value={formData.modalidadeFechamentoContabilId}
                      options={parametros.modalidadeFechamentoContabil}
                      paramType="modalidadefechamentocontabil"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SelectWithAdd
                      label="Modal Fecha Fiscal"
                      name="modalidadeFechamentoFiscalId"
                      value={formData.modalidadeFechamentoFiscalId}
                      options={parametros.modalidadeFechamentoFiscal}
                      paramType="modalidadefechamentofiscal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SelectWithAdd
                      label="Modal Fecha DP"
                      name="modalidadeFechamentoDPId"
                      value={formData.modalidadeFechamentoDPId}
                      options={parametros.modalidadeFechamentoDP}
                      paramType="modalidadefechamentodp"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SelectWithAdd
                      label="Modal Fecha BPO"
                      name="modalFechBPOId"
                      value={formData.modalFechBPOId}
                      options={parametros.modalFechBPO}
                      paramType="modalfechbpo"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
            </TabPanel>

            {/* ========== ABA 3: SÓCIOS ========== */}
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
          {/* ========== SEÇÃO: QUADRO SOCIETÁRIO ========== */}
          <Accordion defaultExpanded className={classes.accordion}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className={classes.accordionSummary}
            >
              <Typography variant="h6">Quadro Societário</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <Box width="100%">
                <QuadroSocietario clienteId={id} />
              </Box>
            </AccordionDetails>
          </Accordion>
            </TabPanel>

            {/* ========== ABA 4: RESPONSÁVEIS & CONTATOS ========== */}
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

          {/* ========== SEÇÃO: CONTATOS NA EMPRESA ========== */}
          <Accordion className={classes.accordion}>
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

            {/* ========== ABA 5: DADOS FISCAIS & COMUNICAÇÃO ========== */}
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
                <ClienteCNAE clienteId={id} />
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* ========== SEÇÃO: REDE SOCIAL ========== */}
          <Accordion className={classes.accordion}>
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

            {/* ========== ABA 6: ANOTAÇÕES ========== */}
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
            Selecione um modelo para preencher automaticamente os parâmetros do cliente.
            Os valores atuais serão substituídos.
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
    </MainContainer>
  );
};

export default ClientesCadastro;
