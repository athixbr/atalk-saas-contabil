import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
  Paper,
  Container,
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
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
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
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    maxWidth: "1400px",
    margin: "0 auto",
  },
  paper: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
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
}));

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

export default function NovoFormularioTarefaRecorrente() {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams();

  // Estados
  const [expanded, setExpanded] = useState("panel1");
  const [searchCliente, setSearchCliente] = useState("");

  // Info Gerais
  const [codigo, setCodigo] = useState("");
  const [classificacao, setClassificacao] = useState("");
  const [mininome, setMininome] = useState("");
  const [nomeTarefa, setNomeTarefa] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");

  // Entregas Mensais - dias por mês
  const [entregasMensais, setEntregasMensais] = useState({
    1: "", 2: "", 3: "", 4: "", 5: "", 6: "",
    7: "", 8: "", 9: "", 10: "", 11: "", 12: ""
  });

  // Prazos e Configurações
  const [diasAntecipacao, setDiasAntecipacao] = useState("");
  const [diasInicio, setDiasInicio] = useState("");
  const [tipoDiasAntes, setTipoDiasAntes] = useState("");
  const [prazosFixos, setPrazosFixos] = useState("");
  const [sabadoUtil, setSabadoUtil] = useState("");
  const [competencia, setCompetencia] = useState("");
  const [exigirRobo, setExigirRobo] = useState("");
  const [passivelMulta, setPassivelMulta] = useState("");
  const [alertaGuia, setAlertaGuia] = useState("");
  const [checklistObrigatorio, setChecklistObrigatorio] = useState("");
  const [esfera, setEsfera] = useState("");
  const [notificarCliente, setNotificarCliente] = useState("");
  const [servicoLiberado, setServicoLiberado] = useState("");
  const [ativa, setAtiva] = useState("");
  const [baixarAutomatico, setBaixarAutomatico] = useState("");

  // Checklist
  const [checklistId, setChecklistId] = useState("");

  // Notificações
  const [canaisNotificacao, setCanaisNotificacao] = useState([]);

  // Financeiro
  const [valor, setValor] = useState("");

  // Clientes
  const [clientesSelecionados, setClientesSelecionados] = useState([]);

  // Usuários
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioResponsavelId, setUsuarioResponsavelId] = useState("");

  // Listas
  const [departamentos, setDepartamentos] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);

  // Estados para ordenação e filtros da tabela de clientes
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [columnFilters, setColumnFilters] = useState({});
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [currentFilterColumn, setCurrentFilterColumn] = useState(null);
  const [expandAll, setExpandAll] = useState(false);

  useEffect(() => {
    loadData();
    if (id) {
      loadTarefaRecorrente();
    }
  }, [id]);

  useEffect(() => {
    // Carregar usuários do departamento selecionado
    if (departamentoId) {
      loadUsuariosDepartamento(departamentoId);
    } else {
      setUsuarios([]);
    }
  }, [departamentoId]);

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

  // Função para obter valor da célula para ordenação/filtro
  const getCellValue = (cliente, columnId) => {
    switch (columnId) {
      case 'id':
        return cliente.id || 0;
      case 'nome':
        return cliente.nome || '';
      case 'cpfCnpj':
        return cliente.cpf || cliente.cnpj || '';
      case 'codigoErp':
        return cliente.codigoErp || '';
      case 'cnaes':
        return cliente.cnaes || '';
      default:
        return '';
    }
  };

  // Função para ordenar clientes
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
    const values = clientesFiltrados.map(cliente => {
      const value = getCellValue(cliente, columnId);
      return value ? String(value) : '';
    }).filter(v => v !== '');
    
    const uniqueValues = [...new Set(values)];
    
    // Limitar a 100 valores únicos para performance
    const filtered = uniqueValues.length > 100 
      ? uniqueValues.slice(0, 100)
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

  // Abrir menu de filtro
  const handleOpenFilterMenu = (event, columnId) => {
    setFilterAnchorEl(event.currentTarget);
    setCurrentFilterColumn(columnId);
  };

  // Fechar menu de filtro
  const handleCloseFilterMenu = () => {
    setFilterAnchorEl(null);
    setCurrentFilterColumn(null);
  };

  // Aplicar ordenação e filtros aos clientes
  const getFilteredAndSortedClientes = () => {
    let result = [...clientesFiltrados];

    // Aplicar filtros de coluna
    Object.keys(columnFilters).forEach(columnId => {
      const filterValues = columnFilters[columnId];
      if (filterValues && Array.isArray(filterValues) && filterValues.length > 0) {
        result = result.filter(cliente => {
          const cellValue = String(getCellValue(cliente, columnId));
          return filterValues.includes(cellValue);
        });
      }
    });

    // Aplicar ordenação
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = getCellValue(a, sortConfig.key);
        const bValue = getCellValue(b, sortConfig.key);

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

  const clientesOrdenadosFiltrados = getFilteredAndSortedClientes();

  const loadData = async () => {
    try {
      const [depsRes, checklistsRes, clientesRes] = await Promise.all([
        api.get("/departamentos").catch(() => ({ data: { departamentos: [] } })),
        api.get("/checklists?ativo=true").catch(() => ({ data: { checklists: [] } })),
        api.get("/clientes?limit=999999").catch(() => ({ data: { clientes: [] } })),
      ]);

      setDepartamentos(depsRes.data.departamentos || depsRes.data || []);
      setChecklists(checklistsRes.data.checklists || []);
      setClientes(clientesRes.data.clientes || clientesRes.data || []);
      setClientesFiltrados(clientesRes.data.clientes || clientesRes.data || []);
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
      setCodigo(data.codigo || "");
      setClassificacao(data.classificacao || "");
      setMininome(data.mininome || "");
      setNomeTarefa(data.nomeTarefa || data.descricao || "");
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
      setTipoDiasAntes(data.tipoDiasAntes || "");
      setPrazosFixos(data.prazosFixos || "");
      setSabadoUtil(data.sabadoUtil === true ? "sim" : data.sabadoUtil === false ? "nao" : "");
      setCompetencia(data.competencia || "");
      setExigirRobo(data.exigirRobo === true ? "sim" : data.exigirRobo === false ? "nao" : "");
      setPassivelMulta(data.passivelMulta === true ? "sim" : data.passivelMulta === false ? "nao" : "");
      setAlertaGuia(data.alertaGuia === true ? "sim" : data.alertaGuia === false ? "nao" : "");
      setChecklistObrigatorio(data.checklistObrigatorio === true ? "sim" : data.checklistObrigatorio === false ? "nao" : "");
      setEsfera(data.esfera || "");
      setNotificarCliente(data.notificarCliente === true ? "sim" : data.notificarCliente === false ? "nao" : "");
      setServicoLiberado(data.servicoLiberado === true ? "sim" : data.servicoLiberado === false ? "nao" : "");
      setAtiva(data.ativa === true ? "sim" : data.ativa === false ? "nao" : "");
      setBaixarAutomatico(data.baixarAutomatico === true ? "sim" : data.baixarAutomatico === false ? "nao" : "");

      // Checklist
      setChecklistId(data.checklistId || "");
      
      // Notificações
      setCanaisNotificacao(data.canaisNotificacao || []);
      
      // Financeiro
      setValor(data.valor !== null && data.valor !== undefined ? data.valor : "");
      
      // Carregar clientes selecionados (IDs)
      if (data.clientes && Array.isArray(data.clientes)) {
        setClientesSelecionados(data.clientes.map(c => c.id));
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

  // Funções para contar campos preenchidos em cada seção
  const countInfoGeraisPreenchidos = () => {
    let count = 0;
    if (codigo) count++;
    if (classificacao) count++;
    if (mininome) count++;
    if (nomeTarefa) count++;
    if (departamentoId) count++;
    if (usuarioResponsavelId) count++;
    return { preenchidos: count, total: 6 };
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
    const campos = [diasAntecipacao, diasInicio, tipoDiasAntes, prazosFixos, sabadoUtil, 
                    competencia, exigirRobo, passivelMulta, alertaGuia, checklistObrigatorio, 
                    esfera, notificarCliente, servicoLiberado, ativa, baixarAutomatico];
    campos.forEach(val => {
      if (val !== "" && val !== null && val !== undefined) count++;
    });
    return { preenchidos: count, total: 15 };
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

  const handleClienteToggle = (clienteId) => {
    setClientesSelecionados((prev) =>
      prev.includes(clienteId)
        ? prev.filter((id) => id !== clienteId)
        : [...prev, clienteId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nomeTarefa) {
      toast.error("Nome da tarefa é obrigatório");
      return;
    }

    if (!departamentoId) {
      toast.error("Departamento é obrigatório");
      return;
    }

    const data = {
      codigo,
      classificacao,
      mininome,
      nomeTarefa,
      departamentoId,
      usuarioResponsavelId: usuarioResponsavelId || null,
      entregasMensais,
      diasAntecipacao: diasAntecipacao !== "" ? diasAntecipacao : null,
      diasInicio: diasInicio !== "" ? diasInicio : null,
      tipoDiasAntes: tipoDiasAntes || null,
      prazosFixos: prazosFixos || null,
      sabadoUtil: sabadoUtil || null,
      competencia: competencia || null,
      exigirRobo: exigirRobo || null,
      passivelMulta: passivelMulta || null,
      alertaGuia: alertaGuia || null,
      checklistObrigatorio: checklistObrigatorio || null,
      esfera: esfera || null,
      notificarCliente: notificarCliente || null,
      servicoLiberado: servicoLiberado || null,
      ativa: ativa || null,
      baixarAutomatico: baixarAutomatico || null,
      checklistId: checklistId || null,
      canaisNotificacao,
      valor: valor !== "" ? parseFloat(valor) : null,
      clientesIds: clientesSelecionados,
    };

    console.log("Dados sendo enviados:", data);

    try {
      if (id) {
        await api.put(`/tarefas-recorrentes/${id}`, data);
        toast.success("Tarefa recorrente atualizada com sucesso");
      } else {
        await api.post("/tarefas-recorrentes", data);
        toast.success("Tarefa recorrente criada com sucesso");
      }
      history.push("/tarefas-recorrentes");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error(error.response?.data?.message || "Erro ao salvar tarefa recorrente");
    }
  };

  const getCanaisNotificacaoText = () => {
    if (canaisNotificacao.length === 0) return "Nenhuma opção selecionada";
    return canaisNotificacao.join(", ");
  };

  return (
    <Container className={classes.root}>
      <Typography variant="h4" gutterBottom>
        {id ? "Editar" : "Nova"} Tarefa Recorrente
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
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    variant="outlined"
                    helperText="Apenas números"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Classificação"
                    value={classificacao}
                    onChange={(e) => setClassificacao(e.target.value)}
                    variant="outlined"
                    helperText="Formato: 00.00.00"
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
                    label="Nome da tarefa recorrente"
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
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Usuário Responsável</InputLabel>
                    <Select
                      value={usuarioResponsavelId}
                      onChange={(e) => setUsuarioResponsavelId(e.target.value)}
                      label="Usuário Responsável"
                      disabled={!departamentoId}
                    >
                      <MenuItem value="">
                        <em>Coordenador do departamento</em>
                      </MenuItem>
                      {usuarios.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Accordion 2: Entregas Mensais */}
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
                {meses.map((mes) => (
                  <Grid item xs={12} sm={6} md={4} key={mes.id}>
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
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
                          <MenuItem key={dia} value={dia}>
                            Dia {dia}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>

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
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dias de Antecipação"
                    value={diasAntecipacao}
                    onChange={(e) => setDiasAntecipacao(e.target.value)}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dias de Início"
                    value={diasInicio}
                    onChange={(e) => setDiasInicio(e.target.value)}
                    variant="outlined"
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
                    <InputLabel>Prazos Fixos</InputLabel>
                    <Select
                      value={prazosFixos}
                      onChange={(e) => setPrazosFixos(e.target.value)}
                      label="Prazos Fixos"
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
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Competência</InputLabel>
                    <Select
                      value={competencia}
                      onChange={(e) => setCompetencia(e.target.value)}
                      label="Competência"
                    >
                      <MenuItem value="">
                        <em>Selecione</em>
                      </MenuItem>
                      <MenuItem value="anterior">Anterior</MenuItem>
                      <MenuItem value="atual">Atual</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
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
                      <MenuItem value="Municipal">Municipal</MenuItem>
                      <MenuItem value="Estadual">Estadual</MenuItem>
                      <MenuItem value="Federal">Federal</MenuItem>
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
                    <InputLabel>Serviço Liberado</InputLabel>
                    <Select
                      value={servicoLiberado}
                      onChange={(e) => setServicoLiberado(e.target.value)}
                      label="Serviço Liberado"
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

          {/* Accordion 4: Checklist */}
          <Accordion
            expanded={isAccordionExpanded("panel4")}
            onChange={handleAccordionChange("panel4")}
            className={classes.accordion}
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
                  <Box mt={2}>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Resumo:</strong>
                    </Typography>
                    <Typography variant="body2">{getCanaisNotificacaoText()}</Typography>
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
            <AccordionDetails className={classes.accordionDetails}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="Buscar"
                    value={searchCliente}
                    onChange={(e) => setSearchCliente(e.target.value)}
                    variant="outlined"
                    className={classes.searchField}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TableContainer className={classes.tableContainer}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell padding="checkbox" style={{ width: 50, backgroundColor: '#f5f5f5' }}>
                            <Checkbox
                              indeterminate={clientesSelecionados.length > 0 && clientesSelecionados.length < clientesOrdenadosFiltrados.length}
                              checked={clientesOrdenadosFiltrados.length > 0 && clientesSelecionados.length === clientesOrdenadosFiltrados.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setClientesSelecionados(clientesOrdenadosFiltrados.map(c => c.id));
                                } else {
                                  setClientesSelecionados([]);
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell style={{ backgroundColor: '#f5f5f5', cursor: 'pointer' }} onClick={() => handleSort('id')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <strong>Id</strong>
                              {sortConfig.key === 'id' && (
                                sortConfig.direction === 'asc' 
                                  ? <ArrowUpwardIcon fontSize="small" />
                                  : <ArrowDownwardIcon fontSize="small" />
                              )}
                              <Tooltip title="Filtrar coluna">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenFilterMenu(e, 'id');
                                  }}
                                  style={{
                                    padding: 4,
                                    color: columnFilters['id']?.length > 0 ? '#1976d2' : '#757575'
                                  }}
                                >
                                  <FilterListIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </div>
                          </TableCell>
                          <TableCell style={{ backgroundColor: '#f5f5f5', cursor: 'pointer' }} onClick={() => handleSort('nome')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <strong>Nome</strong>
                              {sortConfig.key === 'nome' && (
                                sortConfig.direction === 'asc' 
                                  ? <ArrowUpwardIcon fontSize="small" />
                                  : <ArrowDownwardIcon fontSize="small" />
                              )}
                              <Tooltip title="Filtrar coluna">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenFilterMenu(e, 'nome');
                                  }}
                                  style={{
                                    padding: 4,
                                    color: columnFilters['nome']?.length > 0 ? '#1976d2' : '#757575'
                                  }}
                                >
                                  <FilterListIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </div>
                          </TableCell>
                          <TableCell style={{ backgroundColor: '#f5f5f5', cursor: 'pointer' }} onClick={() => handleSort('cpfCnpj')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <strong>Cpf/Cnpj</strong>
                              {sortConfig.key === 'cpfCnpj' && (
                                sortConfig.direction === 'asc' 
                                  ? <ArrowUpwardIcon fontSize="small" />
                                  : <ArrowDownwardIcon fontSize="small" />
                              )}
                              <Tooltip title="Filtrar coluna">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenFilterMenu(e, 'cpfCnpj');
                                  }}
                                  style={{
                                    padding: 4,
                                    color: columnFilters['cpfCnpj']?.length > 0 ? '#1976d2' : '#757575'
                                  }}
                                >
                                  <FilterListIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </div>
                          </TableCell>
                          <TableCell style={{ backgroundColor: '#f5f5f5', cursor: 'pointer' }} onClick={() => handleSort('codigoErp')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <strong>Código Erp</strong>
                              {sortConfig.key === 'codigoErp' && (
                                sortConfig.direction === 'asc' 
                                  ? <ArrowUpwardIcon fontSize="small" />
                                  : <ArrowDownwardIcon fontSize="small" />
                              )}
                              <Tooltip title="Filtrar coluna">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenFilterMenu(e, 'codigoErp');
                                  }}
                                  style={{
                                    padding: 4,
                                    color: columnFilters['codigoErp']?.length > 0 ? '#1976d2' : '#757575'
                                  }}
                                >
                                  <FilterListIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </div>
                          </TableCell>
                          <TableCell style={{ backgroundColor: '#f5f5f5', cursor: 'pointer' }} onClick={() => handleSort('cnaes')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <strong>Cnaes</strong>
                              {sortConfig.key === 'cnaes' && (
                                sortConfig.direction === 'asc' 
                                  ? <ArrowUpwardIcon fontSize="small" />
                                  : <ArrowDownwardIcon fontSize="small" />
                              )}
                              <Tooltip title="Filtrar coluna">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenFilterMenu(e, 'cnaes');
                                  }}
                                  style={{
                                    padding: 4,
                                    color: columnFilters['cnaes']?.length > 0 ? '#1976d2' : '#757575'
                                  }}
                                >
                                  <FilterListIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {clientesOrdenadosFiltrados.map((cliente) => (
                          <TableRow key={cliente.id} hover>
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={clientesSelecionados.includes(cliente.id)}
                                onChange={() => handleClienteToggle(cliente.id)}
                              />
                            </TableCell>
                            <TableCell>{cliente.id}</TableCell>
                            <TableCell>{cliente.nome}</TableCell>
                            <TableCell>{cliente.cpf || cliente.cnpj || "-"}</TableCell>
                            <TableCell>{cliente.codigoErp || "-"}</TableCell>
                            <TableCell>{cliente.cnaes || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box mt={2}>
                    <Typography variant="caption" color="textSecondary">
                      {clientesOrdenadosFiltrados.length} cliente(s) • {clientesSelecionados.length} selecionado(s)
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Botões */}
          <Box mt={4} display="flex" justifyContent="space-between">
            <Button variant="outlined" onClick={() => history.push("/tarefas-recorrentes")}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" className={classes.saveButton}>
              {id ? "Atualizar" : "Salvar"} Tarefa Recorrente
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Popover para filtros */}
      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={handleCloseFilterMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {currentFilterColumn && (
          <Box style={{ padding: '16px', minWidth: '250px', maxHeight: '400px', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Typography variant="subtitle2" style={{ fontWeight: 600 }}>
                Filtrar por {currentFilterColumn}
              </Typography>
              {columnFilters[currentFilterColumn]?.length > 0 && (
                <Button
                  size="small"
                  onClick={() => clearColumnFilter(currentFilterColumn)}
                  style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                >
                  Limpar
                </Button>
              )}
            </div>
            <Divider style={{ marginBottom: 8 }} />
            <List dense>
              {getUniqueColumnValues(currentFilterColumn).map((value, index) => {
                const isSelected = columnFilters[currentFilterColumn]?.includes(value);
                return (
                  <ListItem
                    key={index}
                    button
                    onClick={() => toggleFilterValue(currentFilterColumn, value)}
                    style={{
                      backgroundColor: isSelected ? '#e3f2fd' : 'transparent',
                      borderRadius: 4,
                      marginBottom: 4
                    }}
                  >
                    <Checkbox
                      edge="start"
                      checked={isSelected}
                      tabIndex={-1}
                      disableRipple
                      size="small"
                    />
                    <ListItemText
                      primary={value || '(vazio)'}
                      primaryTypographyProps={{
                        style: {
                          fontSize: '0.875rem',
                          fontWeight: isSelected ? 600 : 400
                        }
                      }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}
      </Popover>
    </Container>
  );
}
