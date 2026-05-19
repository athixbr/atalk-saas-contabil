import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { 
  Paper, Typography, Button, Grid, TextField, FormControl, InputLabel, 
  Select, MenuItem, Box, Divider, CircularProgress, FormControlLabel, 
  Radio, RadioGroup, Checkbox, IconButton, Chip, InputAdornment 
} from "@material-ui/core";
import { 
  ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon, 
  ArrowBack as ArrowLeftIcon, ArrowUpward, ArrowDownward, FilterList, Search 
} from "@material-ui/icons";
import { Autocomplete } from "@material-ui/lab";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";
import api from "../../services/api";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

const useStyles = makeStyles((theme) => ({
  mainPaper: { 
    flex: 1, 
    padding: theme.spacing(3),
    overflowY: "scroll", 
    ...theme.scrollbarStyles,
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },
  section: { 
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(3),
    },
  },
  sectionTitle: { 
    marginBottom: theme.spacing(2), 
    color: theme.palette.primary.main, 
    fontWeight: 600,
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.1rem',
    },
  },
  dualListContainer: { 
    display: "flex", 
    gap: theme.spacing(2), 
    alignItems: "flex-start", 
    minHeight: 500,
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
      minHeight: 'auto',
    },
  },
  listBox: { 
    flex: 1, 
    border: "1px solid " + theme.palette.divider, 
    borderRadius: theme.shape.borderRadius, 
    padding: theme.spacing(1), 
    height: 450, 
    overflowY: "auto", 
    ...theme.scrollbarStyles,
    width: '100%',
    [theme.breakpoints.down('md')]: {
      height: 350,
    },
    [theme.breakpoints.down('sm')]: {
      height: 300,
    },
  },
  listItem: { 
    padding: theme.spacing(1.5), 
    marginBottom: theme.spacing(0.5), 
    borderRadius: theme.shape.borderRadius, 
    cursor: "pointer", 
    border: "1px solid transparent",
    transition: "all 0.2s",
    "&:hover": { 
      backgroundColor: theme.palette.action.hover,
      border: "1px solid " + theme.palette.primary.light
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
    },
  },
  selectedListItem: { 
    backgroundColor: theme.palette.action.selected,
    border: "1px solid " + theme.palette.primary.main
  },
  transferButtons: { 
    display: "flex", 
    flexDirection: "column", 
    gap: theme.spacing(1), 
    marginTop: 60,
    [theme.breakpoints.down('md')]: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 0,
      width: '100%',
    },
  },
  searchField: { 
    marginBottom: theme.spacing(2),
  },
  checkboxList: { 
    maxHeight: 200, 
    overflowY: "auto", 
    border: "1px solid " + theme.palette.divider, 
    borderRadius: 4, 
    padding: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      maxHeight: 150,
    },
  },
  filterBar: {
    padding: theme.spacing(1.5),
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
    },
  },
  orderButton: {
    minWidth: 36,
    padding: 6,
  },
  listColumn: {
    flex: 1,
    width: '100%',
    minWidth: 0,
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
  floatingFooter: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTop: '2px solid ' + theme.palette.divider,
    padding: theme.spacing(2, 3),
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
    zIndex: 1000,
    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1.5, 2),
    },
  },
}));

const VincularControles = () => {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [tipoVinculo, setTipoVinculo] = useState("controle");
  const [controleConfigId, setControleConfigId] = useState("");
  const [tarefaConfigId, setTarefaConfigId] = useState("");
  const [clienteDates, setClienteDates] = useState({}); // { [clienteId]: dataInicio }
  const [dataInicioPadrao, setDataInicioPadrao] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");
  const [usuariosIds, setUsuariosIds] = useState([]);
  const [observacoes, setObservacoes] = useState("");
  const [gerarTarefas, setGerarTarefas] = useState(true);
  const [clientesDisponiveis, setClientesDisponiveis] = useState([]);
  const [clientesSelecionados, setClientesSelecionados] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState([]);
  const [selectedRight, setSelectedRight] = useState([]);
  const [searchLeft, setSearchLeft] = useState("");
  const [searchRight, setSearchRight] = useState("");
  const [controles, setControles] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  
  // Filtros avançados
  const [filterCodigoErpLeft, setFilterCodigoErpLeft] = useState("");
  const [filterDocumentoLeft, setFilterDocumentoLeft] = useState("");
  const [orderByLeft, setOrderByLeft] = useState("nome"); // nome, codigoErp, documento
  const [orderDirectionLeft, setOrderDirectionLeft] = useState("asc"); // asc, desc
  
  const [filterCodigoErpRight, setFilterCodigoErpRight] = useState("");
  const [filterDocumentoRight, setFilterDocumentoRight] = useState("");
  const [orderByRight, setOrderByRight] = useState("nome");
  const [orderDirectionRight, setOrderDirectionRight] = useState("asc");

  useEffect(() => {
    carregarDados();
    const hoje = new Date().toISOString().split("T")[0];
    setDataInicioPadrao(hoje);
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [controlesRes, tarefasRes, departamentosRes, usuariosRes, clientesRes] = await Promise.all([
        api.get("/controles-config"),
        api.get("/tarefas-config"),
        api.get("/departamentos"),
        api.get("/users"),
        api.get("/clientes", { params: { all: true, limit: 10000 } })
      ]);
      setControles(Array.isArray(controlesRes.data) ? controlesRes.data : (controlesRes.data?.controles || []));
      setTarefas(Array.isArray(tarefasRes.data) ? tarefasRes.data : (tarefasRes.data?.tarefas || tarefasRes.data?.data || []));
      setDepartamentos(Array.isArray(departamentosRes.data) ? departamentosRes.data : (departamentosRes.data?.departamentos || []));
      setUsuarios(Array.isArray(usuariosRes.data) ? usuariosRes.data : (usuariosRes.data?.users || []));
      const clientesArray = Array.isArray(clientesRes.data) ? clientesRes.data : (clientesRes.data?.clientes || clientesRes.data?.users || []);
      setClientesDisponiveis(clientesArray);
      console.log("Total de clientes carregados:", clientesArray.length);
      if (clientesArray.length === 0) {
        toast.info("Nenhum cliente cadastrado no sistema");
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      toast.error(err.response?.data?.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLeft = (cliente) => {
    const currentIndex = selectedLeft.findIndex(c => c.id === cliente.id);
    const newSelected = [...selectedLeft];
    if (currentIndex === -1) {
      newSelected.push(cliente);
    } else {
      newSelected.splice(currentIndex, 1);
    }
    setSelectedLeft(newSelected);
  };

  const handleToggleRight = (cliente) => {
    const currentIndex = selectedRight.findIndex(c => c.id === cliente.id);
    const newSelected = [...selectedRight];
    if (currentIndex === -1) {
      newSelected.push(cliente);
    } else {
      newSelected.splice(currentIndex, 1);
    }
    setSelectedRight(newSelected);
  };

  const handleMoveRight = () => {
    if (selectedLeft.length === 0) {
      toast.warning("Selecione clientes para adicionar");
      return;
    }
    // Adiciona clientes e inicializa datas com a data padrão
    const newClienteDates = { ...clienteDates };
    selectedLeft.forEach(cliente => {
      newClienteDates[cliente.id] = dataInicioPadrao;
    });
    setClienteDates(newClienteDates);
    setClientesSelecionados([...clientesSelecionados, ...selectedLeft]);
    setClientesDisponiveis(clientesDisponiveis.filter(c => !selectedLeft.find(s => s.id === c.id)));
    setSelectedLeft([]);
  };

  const handleMoveLeft = () => {
    if (selectedRight.length === 0) {
      toast.warning("Selecione clientes para remover");
      return;
    }
    // Remove clientes e suas datas
    const newClienteDates = { ...clienteDates };
    selectedRight.forEach(cliente => {
      delete newClienteDates[cliente.id];
    });
    setClienteDates(newClienteDates);
    setClientesDisponiveis([...clientesDisponiveis, ...selectedRight]);
    setClientesSelecionados(clientesSelecionados.filter(c => !selectedRight.find(s => s.id === c.id)));
    setSelectedRight([]);
  };

  const handleClienteDataChange = (clienteId, novaData) => {
    setClienteDates(prev => ({
      ...prev,
      [clienteId]: novaData
    }));
  };

  const handleAplicarDataPadrao = () => {
    if (!dataInicioPadrao) {
      toast.warning("Informe uma data padrão primeiro");
      return;
    }
    const newClienteDates = {};
    clientesSelecionados.forEach(cliente => {
      newClienteDates[cliente.id] = dataInicioPadrao;
    });
    setClienteDates(newClienteDates);
    toast.success("Data padrão aplicada a todos os clientes");
  };

  const filteredLeft = clientesDisponiveis
    .filter(c => {
      // Busca geral
      const matchSearch = searchLeft === "" || 
        c.nome?.toLowerCase().includes(searchLeft.toLowerCase()) ||
        c.cpf?.includes(searchLeft) ||
        c.cnpj?.includes(searchLeft) ||
        c.codigoErp?.toLowerCase().includes(searchLeft.toLowerCase());
      
      // Filtro por código ERP
      const matchCodigoErp = filterCodigoErpLeft === "" ||
        c.codigoErp?.toLowerCase().includes(filterCodigoErpLeft.toLowerCase());
      
      // Filtro por documento (CPF/CNPJ)
      const matchDocumento = filterDocumentoLeft === "" ||
        c.cpf?.includes(filterDocumentoLeft) ||
        c.cnpj?.includes(filterDocumentoLeft);
      
      return matchSearch && matchCodigoErp && matchDocumento;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (orderByLeft) {
        case "nome":
          comparison = (a.nome || "").localeCompare(b.nome || "");
          break;
        case "codigoErp":
          comparison = (a.codigoErp || "").localeCompare(b.codigoErp || "");
          break;
        case "documento":
          const docA = a.cnpj || a.cpf || "";
          const docB = b.cnpj || b.cpf || "";
          comparison = docA.localeCompare(docB);
          break;
        default:
          comparison = 0;
      }
      
      return orderDirectionLeft === "asc" ? comparison : -comparison;
    });

  const filteredRight = clientesSelecionados
    .filter(c => {
      const matchSearch = searchRight === "" || 
        c.nome?.toLowerCase().includes(searchRight.toLowerCase()) ||
        c.cpf?.includes(searchRight) ||
        c.cnpj?.includes(searchRight) ||
        c.codigoErp?.toLowerCase().includes(searchRight.toLowerCase());
      
      const matchCodigoErp = filterCodigoErpRight === "" ||
        c.codigoErp?.toLowerCase().includes(filterCodigoErpRight.toLowerCase());
      
      const matchDocumento = filterDocumentoRight === "" ||
        c.cpf?.includes(filterDocumentoRight) ||
        c.cnpj?.includes(filterDocumentoRight);
      
      return matchSearch && matchCodigoErp && matchDocumento;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (orderByRight) {
        case "nome":
          comparison = (a.nome || "").localeCompare(b.nome || "");
          break;
        case "codigoErp":
          comparison = (a.codigoErp || "").localeCompare(b.codigoErp || "");
          break;
        case "documento":
          const docA = a.cnpj || a.cpf || "";
          const docB = b.cnpj || b.cpf || "";
          comparison = docA.localeCompare(docB);
          break;
        default:
          comparison = 0;
      }
      
      return orderDirectionRight === "asc" ? comparison : -comparison;
    });

  const handleUsuarioToggle = (usuarioId) => {
    const currentIndex = usuariosIds.indexOf(usuarioId);
    const newUsuariosIds = [...usuariosIds];
    if (currentIndex === -1) {
      newUsuariosIds.push(usuarioId);
    } else {
      newUsuariosIds.splice(currentIndex, 1);
    }
    setUsuariosIds(newUsuariosIds);
  };

  const handleVincular = async () => {
    if (tipoVinculo === "controle" && !controleConfigId) { toast.error("Selecione um controle"); return; }
    if (tipoVinculo === "tarefa" && !tarefaConfigId) { toast.error("Selecione uma tarefa"); return; }
    if (clientesSelecionados.length === 0) { toast.error("Adicione pelo menos um cliente"); return; }
    
    // Valida se todos os clientes têm data
    const clientesSemData = clientesSelecionados.filter(c => !clienteDates[c.id]);
    if (clientesSemData.length > 0) {
      toast.error(`${clientesSemData.length} cliente(s) sem data de início definida`);
      return;
    }
    
    if (!departamentoId && usuariosIds.length === 0) { toast.error("Selecione um departamento ou pelo menos um usuário responsável"); return; }
    try {
      setLoading(true);
      const clientes = clientesSelecionados.map((cliente) => ({ 
        clienteId: cliente.id, 
        dataInicio: clienteDates[cliente.id],
        dataFim: null 
      }));
      const payload = {
        controleConfigId: tipoVinculo === "controle" ? parseInt(controleConfigId) : null,
        tarefaConfigId: tipoVinculo === "tarefa" ? parseInt(tarefaConfigId) : null,
        clientes,
        departamentoId: departamentoId ? parseInt(departamentoId) : null,
        usuarioId: null,
        usuariosIds: usuariosIds.length > 0 ? usuariosIds : null,
        observacoes,
        gerarTarefasImediatamente: gerarTarefas && tipoVinculo === "controle"
      };
      const { data } = await api.post("/controle-clientes/vinculos", payload);
      toast.success(data.vinculos.length + " vínculos criados com sucesso! " + (data.tarefasGeradas > 0 ? data.tarefasGeradas + " tarefas geradas." : ""));
      setControleConfigId(""); 
      setTarefaConfigId(""); 
      setClientesSelecionados([]); 
      setClienteDates({});
      setObservacoes(""); 
      setUsuariosIds([]);
      carregarDados();
      setTimeout(() => history.push("/central-vinculos"), 1500);
    } catch (err) {
      console.error("Erro ao vincular:", err);
      toast.error(err.response?.data?.message || "Erro ao criar vínculos");
    } finally {
      setLoading(false);
    }
  };

  const usuariosDoDepartamento = usuarios.filter(u => {
    if (!departamentoId) return false;
    if (!u.departamentos || !Array.isArray(u.departamentos)) return false;
    return u.departamentos.some(d => d.id === parseInt(departamentoId));
  });

  return (
    <MainContainer>
      <MainHeader>
        <Title>Vincular {tipoVinculo === "controle" ? "Controle" : "Tarefa"} aos Clientes</Title>
        <MainHeaderButtonsWrapper>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => history.push("/central-vinculos")}>Voltar</Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        {loading && <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>}
        
        <Box className={classes.section}>
          <Typography variant="h6" className={classes.sectionTitle}>1. Escolha o Tipo de Vínculo</Typography>
          <FormControl component="fieldset">
            <RadioGroup row value={tipoVinculo} onChange={(e) => { setTipoVinculo(e.target.value); setControleConfigId(""); setTarefaConfigId(""); }}>
              <FormControlLabel value="controle" control={<Radio color="primary" />} label="Controle" />
              <FormControlLabel value="tarefa" control={<Radio color="primary" />} label="Tarefa" />
            </RadioGroup>
          </FormControl>
        </Box>
        <Divider />

        <Box className={classes.section}>
          <Typography variant="h6" className={classes.sectionTitle}>2. Selecione {tipoVinculo === "controle" ? "o Controle" : "a Tarefa"}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {tipoVinculo === "controle" ? (
                <Autocomplete options={controles} getOptionLabel={(opt) => opt.codigo && opt.nome ? opt.codigo + " - " + opt.nome : opt.nome || ""} value={controles.find(c => c.id === controleConfigId) || null} onChange={(e, v) => setControleConfigId(v ? v.id : "")} renderInput={(params) => <TextField {...params} label="Controle" variant="outlined" required helperText={controles.length === 0 ? "Nenhum controle cadastrado" : ""} />} noOptionsText="Nenhum controle encontrado" />
              ) : (
                <Autocomplete options={tarefas} getOptionLabel={(opt) => opt.titulo || ""} value={tarefas.find(t => t.id === tarefaConfigId) || null} onChange={(e, v) => setTarefaConfigId(v ? v.id : "")} renderInput={(params) => <TextField {...params} label="Tarefa" variant="outlined" required helperText={tarefas.length === 0 ? "Nenhuma tarefa cadastrada" : ""} />} noOptionsText="Nenhuma tarefa encontrada" />
              )}
            </Grid>
          </Grid>
        </Box>
        <Divider />

        <Box className={classes.section}>
          <Typography variant="h6" className={classes.sectionTitle}>3. Defina os Responsáveis</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Departamento</InputLabel>
                <Select value={departamentoId} onChange={(e) => { setDepartamentoId(e.target.value); setUsuariosIds([]); }} label="Departamento">
                  <MenuItem value=""><em>Selecione um departamento</em></MenuItem>
                  {departamentos.map((d) => <MenuItem key={d.id} value={d.id}>{d.nome}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            {(departamentoId || usuarios.length > 0) && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Usuários Responsáveis (opcional - deixe em branco para notificar todo o departamento)
                </Typography>
                <Box className={classes.checkboxList}>
                  {usuariosDoDepartamento.length > 0 ? (
                    usuariosDoDepartamento.map((u) => (
                      <FormControlLabel
                        key={u.id}
                        control={<Checkbox checked={usuariosIds.includes(u.id)} onChange={() => handleUsuarioToggle(u.id)} color="primary" />}
                        label={u.name}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">Nenhum usuário disponível neste departamento</Typography>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
        <Divider />

        <Box className={classes.section}>
          <Typography variant="h6" className={classes.sectionTitle}>4. Selecione os Clientes</Typography>
          <Box className={classes.dualListContainer}>
            {/* Lista Esquerda - Disponíveis */}
            <Box className={classes.listColumn}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} flexWrap="wrap" gap={1}>
                <Typography variant="subtitle2">
                  Clientes Disponíveis ({filteredLeft.length})
                </Typography>
                <Chip 
                  label={`Total: ${clientesDisponiveis.length}`} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
              
              {/* Barra de Filtros - Esquerda */}
              <Box className={classes.filterBar}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      placeholder="Buscar por nome, CPF, CNPJ ou código ERP..."
                      value={searchLeft}
                      onChange={(e) => setSearchLeft(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      placeholder="Filtrar Código ERP"
                      value={filterCodigoErpLeft}
                      onChange={(e) => setFilterCodigoErpLeft(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      placeholder="Filtrar CPF/CNPJ"
                      value={filterDocumentoLeft}
                      onChange={(e) => setFilterDocumentoLeft(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box display="flex" gap={0.5}>
                      <FormControl size="small" variant="outlined" fullWidth>
                        <Select
                          value={orderByLeft}
                          onChange={(e) => setOrderByLeft(e.target.value)}
                        >
                          <MenuItem value="nome">Nome</MenuItem>
                          <MenuItem value="codigoErp">Código</MenuItem>
                          <MenuItem value="documento">CPF/CNPJ</MenuItem>
                        </Select>
                      </FormControl>
                      <IconButton 
                        size="small" 
                        className={classes.orderButton}
                        onClick={() => setOrderDirectionLeft(orderDirectionLeft === "asc" ? "desc" : "asc")}
                        color="primary"
                      >
                        {orderDirectionLeft === "asc" ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              
              <Box className={classes.listBox}>
                {filteredLeft.map((cliente) => {
                  const isSelected = selectedLeft.find(c => c.id === cliente.id);
                  return (
                    <Box
                      key={cliente.id}
                      className={classes.listItem + (isSelected ? " " + classes.selectedListItem : "")}
                      onClick={() => handleToggleLeft(cliente)}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box flex={1} style={{ overflow: 'hidden' }}>
                          <Typography variant="body2" style={{ fontWeight: 600 }} noWrap>
                            {cliente.nome}
                          </Typography>
                          <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
                            {cliente.codigoErp && (
                              <Chip label={cliente.codigoErp} size="small" variant="outlined" style={{ height: 20, fontSize: 11 }} />
                            )}
                            <Typography variant="caption" color="textSecondary" noWrap>
                              {cliente.cnpj || cliente.cpf || ""}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
                {filteredLeft.length === 0 && (
                  <Typography variant="body2" color="textSecondary" style={{ padding: 16, textAlign: "center" }}>
                    Nenhum cliente disponível
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Botões de Transferência */}
            <Box className={classes.transferButtons}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={handleMoveRight}
                disabled={selectedLeft.length === 0}
                style={{ minWidth: 40 }}
              >
                <ArrowForwardIcon />
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={handleMoveLeft}
                disabled={selectedRight.length === 0}
                style={{ minWidth: 40 }}
              >
                <ArrowLeftIcon />
              </Button>
            </Box>

            {/* Lista Direita - Selecionados */}
            <Box className={classes.listColumn}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} flexWrap="wrap" gap={1}>
                <Typography variant="subtitle2">
                  Clientes Selecionados ({filteredRight.length})
                </Typography>
                <Chip 
                  label={`Total: ${clientesSelecionados.length}`} 
                  size="small" 
                  color="secondary" 
                  variant="outlined"
                />
              </Box>

              {/* Campo Data Padrão e Botão Aplicar */}
              <Box mb={2} p={2} border="1px solid #e0e0e0" borderRadius={2} bgcolor="#f9f9f9">
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Data Padrão"
                      type="date"
                      variant="outlined"
                      value={dataInicioPadrao}
                      onChange={(e) => setDataInicioPadrao(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      onClick={handleAplicarDataPadrao}
                      disabled={clientesSelecionados.length === 0}
                    >
                      Aplicar Data a Todos
                    </Button>
                  </Grid>
                </Grid>
              </Box>
              
              {/* Barra de Filtros - Direita */}
              <Box className={classes.filterBar}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      placeholder="Buscar..."
                      value={searchRight}
                      onChange={(e) => setSearchRight(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      placeholder="Filtrar Código ERP"
                      value={filterCodigoErpRight}
                      onChange={(e) => setFilterCodigoErpRight(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      placeholder="Filtrar CPF/CNPJ"
                      value={filterDocumentoRight}
                      onChange={(e) => setFilterDocumentoRight(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box display="flex" gap={0.5}>
                      <FormControl size="small" variant="outlined" fullWidth>
                        <Select
                          value={orderByRight}
                          onChange={(e) => setOrderByRight(e.target.value)}
                        >
                          <MenuItem value="nome">Nome</MenuItem>
                          <MenuItem value="codigoErp">Código</MenuItem>
                          <MenuItem value="documento">CPF/CNPJ</MenuItem>
                        </Select>
                      </FormControl>
                      <IconButton 
                        size="small" 
                        className={classes.orderButton}
                        onClick={() => setOrderDirectionRight(orderDirectionRight === "asc" ? "desc" : "asc")}
                        color="primary"
                      >
                        {orderDirectionRight === "asc" ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              
              <Box className={classes.listBox}>
                {filteredRight.map((cliente) => {
                  const isSelected = selectedRight.find(c => c.id === cliente.id);
                  return (
                    <Box
                      key={cliente.id}
                      className={classes.listItem + (isSelected ? " " + classes.selectedListItem : "")}
                      style={{ cursor: 'default' }}
                    >
                      <Box>
                        <Box 
                          display="flex" 
                          justifyContent="space-between" 
                          alignItems="center"
                          onClick={() => handleToggleRight(cliente)}
                          style={{ cursor: 'pointer' }}
                        >
                          <Box flex={1} style={{ overflow: 'hidden' }}>
                            <Typography variant="body2" style={{ fontWeight: 600 }} noWrap>
                              {cliente.nome}
                            </Typography>
                            <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
                              {cliente.codigoErp && (
                                <Chip label={cliente.codigoErp} size="small" variant="outlined" style={{ height: 20, fontSize: 11 }} />
                              )}
                              <Typography variant="caption" color="textSecondary" noWrap>
                                {cliente.cnpj || cliente.cpf || ""}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        {/* Campo de Data Individual */}
                        <Box mt={1} onClick={(e) => e.stopPropagation()}>
                          <TextField
                            fullWidth
                            size="small"
                            label="📅 Data Início"
                            type="date"
                            variant="outlined"
                            value={clienteDates[cliente.id] || ""}
                            onChange={(e) => handleClienteDataChange(cliente.id, e.target.value)}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
                {filteredRight.length === 0 && (
                  <Typography variant="body2" color="textSecondary" style={{ padding: 16, textAlign: "center" }}>
                    Nenhum cliente selecionado
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
        <Divider />

        <Box className={classes.section}>
          <Typography variant="h6" className={classes.sectionTitle}>5. Observações e Opções</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={4} label="Observações" variant="outlined" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Adicione observações sobre esta vinculação..." />
            </Grid>
            {tipoVinculo === "controle" && (
              <Grid item xs={12}>
                <FormControlLabel control={<Checkbox checked={gerarTarefas} onChange={(e) => setGerarTarefas(e.target.checked)} color="primary" />} label="Gerar tarefas automaticamente (para controles recorrentes)" />
              </Grid>
            )}
          </Grid>
        </Box>
        <Divider />

        {/* Espaçamento para o footer flutuante */}
        <Box height={80} />
      </Paper>

      {/* Rodapé Flutuante com Botão Salvar */}
      <Box className={classes.floatingFooter}>
        <Button 
          variant="outlined" 
          onClick={() => history.push("/central-vinculos")} 
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleVincular} 
          disabled={loading || clientesSelecionados.length === 0}
          size="large"
        >
          {loading ? "Salvando..." : "Salvar Vínculos"}
        </Button>
      </Box>
    </MainContainer>
  );
};

export default VincularControles;
