import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Divider,
  Box,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Card,
} from "@material-ui/core";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
} from "@material-ui/icons";
import { useHistory, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import EndpointSelector from "../../components/EndpointSelector";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(3),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  form: {
    width: "100%",
  },
  sectionTitle: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    fontWeight: 600,
  },
  accordion: {
    marginBottom: theme.spacing(2),
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    border: `1px solid ${theme.palette.divider}`,
    '&:before': {
      display: 'none',
    },
  },
  accordionSummary: {
    backgroundColor: theme.palette.background.default,
  },
  accordionDetails: {
    padding: theme.spacing(3),
    backgroundColor: '#fafafa',
  },
}));

const ModelosParametrosCadastro = () => {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [endpointsModelo, setEndpointsModelo] = useState([]);
  
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    // Classificação
    statusClienteId: "",
    statusComplementarId: "",
    periodicidadeClienteId: "",
    tipoClienteId: "",
    tierClienteId: "",
    clusterClienteId: "",
    categoriaClienteId: "",
    sedeClienteId: "",
    localizacaoClienteId: "",
    tagsId: "",
    adiantamentoFolhaId: "",
    distribuicaoLucrosId: "",
    grupoClienteId: "",
    segmentoId: "",
    atuacaoId: "",
    // Enquadramento
    porteFederalId: "",
    porteEstadualId: "",
    porteMunicipalId: "",
    regimeTributarioFederalId: "",
    regimeTributarioEstadualId: "",
    regimeTributarioMunicipalId: "",
    // Classificação operacional
    volumeFiscalId: "",
    volumeContabilId: "",
    volumeDPId: "",
    volumeBPOId: "",
    modalidadeFechamentoContabilId: "",
    modalidadeFechamentoFiscalId: "",
    modalidadeFechamentoDPId: "",
    modalFechBPOId: "",
  });

  const [parametros, setParametros] = useState({
    statusCliente: [],
    statusComplementar: [],
    periodicidadeCliente: [],
    tipoCliente: [],
    tierCliente: [],
    clusterCliente: [],
    categoriaCliente: [],
    sedeCliente: [], // Mantido para compatibilidade
    escritorioGestor: [], // Endpoint correto
    localizacaoCliente: [],
    tags: [], // Tags do Cliente
    adiantamentoFolha: [],
    distribuicaoLucros: [],
    grupoCliente: [],
    segmento: [],
    atuacao: [],
    porteFederal: [],
    porteEstadual: [],
    porteMunicipal: [],
    regimeTributarioFederal: [],
    regimeTributarioEstadual: [],
    regimeTributarioMunicipal: [],
    volumeFiscal: [],
    volumeContabil: [],
    volumeDP: [],
    volumeBPO: [],
    modalidadeFechamentoContabil: [],
    modalidadeFechamentoFiscal: [],
    modalidadeFechamentoDP: [],
    modalFechBPO: [],
  });

  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);
        await loadParametros();
        if (id) {
          await loadModelo();
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

  const loadParametros = async () => {
    try {
      const responses = await Promise.allSettled([
        api.get("/parametros/statuscliente"),
        api.get("/parametros/statuscomplementar"),
        api.get("/parametros/periodicidadecliente"),
        api.get("/parametros/tipocliente"),
        api.get("/parametros/tiercliente"),
        api.get("/parametros/clustercliente"),
        api.get("/parametros/categoriacliente"),
        api.get("/parametros/escritoriogestor"),
        api.get("/parametros/localizacaocliente"),
        api.get("/parametros/tags"),
        api.get("/parametros/adiantamentofolha"),
        api.get("/parametros/distribuicaolucros"),
        api.get("/parametros/grupocliente"),
        api.get("/parametros/segmento"),
        api.get("/parametros/atuacao"),
        api.get("/parametros/portefederal"),
        api.get("/parametros/porteestadual"),
        api.get("/parametros/portemunicipal"),
        api.get("/parametros/regimetributariofederal"),
        api.get("/parametros/regimetributarioestadual"),
        api.get("/parametros/regimetributariomunicipal"),
        api.get("/parametros/volumefiscal"),
        api.get("/parametros/volumecontabil"),
        api.get("/parametros/volumedp"),
        api.get("/parametros/volumebpo"),
        api.get("/parametros/modalidadefechamentocontabil"),
        api.get("/parametros/modalidadefechamentofiscal"),
        api.get("/parametros/modalidadefechamentodp"),
        api.get("/parametros/modalfechbpo"),
      ]);

      const [
        statusCliente, statusComplementar, periodicidadeCliente, tipoCliente,
        tierCliente, clusterCliente, categoriaCliente, escritorioGestor,
        localizacaoCliente, tags, adiantamentoFolha, distribuicaoLucros,
        grupoCliente, segmento, atuacao,
        porteFederal, porteEstadual, porteMunicipal,
        regimeTributarioFederal, regimeTributarioEstadual, regimeTributarioMunicipal,
        volumeFiscal, volumeContabil, volumeDP, volumeBPO,
        modalidadeFechamentoContabil, modalidadeFechamentoFiscal,
        modalidadeFechamentoDP, modalFechBPO
      ] = responses;

      setParametros({
        statusCliente: statusCliente.status === "fulfilled" ? statusCliente.value.data : [],
        statusComplementar: statusComplementar.status === "fulfilled" ? statusComplementar.value.data : [],
        periodicidadeCliente: periodicidadeCliente.status === "fulfilled" ? periodicidadeCliente.value.data : [],
        tipoCliente: tipoCliente.status === "fulfilled" ? tipoCliente.value.data : [],
        tierCliente: tierCliente.status === "fulfilled" ? tierCliente.value.data : [],
        clusterCliente: clusterCliente.status === "fulfilled" ? clusterCliente.value.data : [],
        categoriaCliente: categoriaCliente.status === "fulfilled" ? categoriaCliente.value.data : [],
        sedeCliente: escritorioGestor.status === "fulfilled" ? escritorioGestor.value.data : [], // Compatibilidade
        escritorioGestor: escritorioGestor.status === "fulfilled" ? escritorioGestor.value.data : [], // Correto
        localizacaoCliente: localizacaoCliente.status === "fulfilled" ? localizacaoCliente.value.data : [],
        tags: tags.status === "fulfilled" ? tags.value.data : [], // Tags do Cliente
        adiantamentoFolha: adiantamentoFolha.status === "fulfilled" ? adiantamentoFolha.value.data : [],
        distribuicaoLucros: distribuicaoLucros.status === "fulfilled" ? distribuicaoLucros.value.data : [],
        grupoCliente: grupoCliente.status === "fulfilled" ? grupoCliente.value.data.parametros || grupoCliente.value.data : [],
        segmento: segmento.status === "fulfilled" ? segmento.value.data.parametros || segmento.value.data : [],
        atuacao: atuacao.status === "fulfilled" ? atuacao.value.data.parametros || atuacao.value.data : [],
        porteFederal: porteFederal.status === "fulfilled" ? porteFederal.value.data : [],
        porteEstadual: porteEstadual.status === "fulfilled" ? porteEstadual.value.data : [],
        porteMunicipal: porteMunicipal.status === "fulfilled" ? porteMunicipal.value.data : [],
        regimeTributarioFederal: regimeTributarioFederal.status === "fulfilled" ? regimeTributarioFederal.value.data : [],
        regimeTributarioEstadual: regimeTributarioEstadual.status === "fulfilled" ? regimeTributarioEstadual.value.data : [],
        regimeTributarioMunicipal: regimeTributarioMunicipal.status === "fulfilled" ? regimeTributarioMunicipal.value.data : [],
        volumeFiscal: volumeFiscal.status === "fulfilled" ? volumeFiscal.value.data : [],
        volumeContabil: volumeContabil.status === "fulfilled" ? volumeContabil.value.data : [],
        volumeDP: volumeDP.status === "fulfilled" ? volumeDP.value.data : [],
        volumeBPO: volumeBPO.status === "fulfilled" ? volumeBPO.value.data : [],
        modalidadeFechamentoContabil: modalidadeFechamentoContabil.status === "fulfilled" ? modalidadeFechamentoContabil.value.data : [],
        modalidadeFechamentoFiscal: modalidadeFechamentoFiscal.status === "fulfilled" ? modalidadeFechamentoFiscal.value.data : [],
        modalidadeFechamentoDP: modalidadeFechamentoDP.status === "fulfilled" ? modalidadeFechamentoDP.value.data : [],
        modalFechBPO: modalFechBPO.status === "fulfilled" ? modalFechBPO.value.data : [],
      });
    } catch (error) {
      console.error("Erro ao carregar parâmetros:", error);
      toast.error("Erro ao carregar parâmetros");
    }
  };

  const loadModelo = async () => {
    try {
      const [modeloRes, endpointsRes] = await Promise.allSettled([
        api.get(`/modelos-parametros/${id}`),
        api.get(`/modelos-parametros/${id}/endpoints`),
      ]);
      if (modeloRes.status === "fulfilled") setFormData(modeloRes.value.data);
      if (endpointsRes.status === "fulfilled") setEndpointsModelo(endpointsRes.value.data || []);
    } catch (error) {
      console.error("Erro ao carregar modelo:", error);
      toast.error("Erro ao carregar modelo");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      toast.warning("Informe o nome do modelo");
      return;
    }

    try {
      setSaving(true);
      
      // Converter campos vazios para null para o backend
      const dataToSend = Object.keys(formData).reduce((acc, key) => {
        const value = formData[key];
        // Se for string vazia ou null/undefined, envia null. Senão envia o valor ou converte para número se for ID
        if (value === "" || value === null || value === undefined) {
          acc[key] = null;
        } else if (key.endsWith('Id') && typeof value === 'string') {
          // Converte IDs de string para número
          acc[key] = value ? parseInt(value, 10) : null;
        } else {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      let modeloId = id;
      if (id) {
        await api.put(`/modelos-parametros/${id}`, dataToSend);
        toast.success("Modelo atualizado com sucesso");
      } else {
        const { data: novoModelo } = await api.post("/modelos-parametros", dataToSend);
        modeloId = novoModelo.id;
        toast.success("Modelo criado com sucesso");
      }

      // Salva endpoints vinculados ao modelo
      if (modeloId) {
        await api.put(`/modelos-parametros/${modeloId}/endpoints`, { endpoints: endpointsModelo });
      }

      history.push("/modelos-parametros");
    } catch (error) {
      console.error("Erro ao salvar modelo:", error);
      toast.error("Erro ao salvar modelo");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    history.push("/modelos-parametros");
  };

  const SelectParametro = ({ label, name, value, options }) => (
    <FormControl fullWidth variant="outlined" margin="normal">
      <InputLabel>{label}</InputLabel>
      <Select
        name={name}
        value={value || ""}
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
  );

  if (loading) {
    return (
      <MainContainer>
        <MainHeader>
          <Title>{id ? "Editar Modelo" : "Novo Modelo"}</Title>
        </MainHeader>
        <Paper className={classes.mainPaper} variant="outlined">
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </Paper>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <MainHeader>
        <Title>{id ? "Editar Modelo de Parâmetros" : "Novo Modelo de Parâmetros"}</Title>
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

      <Paper className={classes.mainPaper} variant="outlined">
        <form onSubmit={handleSubmit} className={classes.form}>
          
          {/* Informações Básicas */}
          <Typography variant="h6" gutterBottom>
            Informações do Modelo
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Nome do Modelo"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                variant="outlined"
                placeholder="Ex: Simples Nacional"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                variant="outlined"
                multiline
                rows={2}
                placeholder="Descrição opcional do modelo"
                margin="normal"
              />
            </Grid>
          </Grid>

          <Divider style={{ margin: "24px 0" }} />

          {/* Parâmetros */}
          <Typography variant="h6" className={classes.sectionTitle} gutterBottom>
            Parâmetros do Modelo
          </Typography>

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
                  <SelectParametro
                    label="Periodicidade do Cliente"
                    name="periodicidadeClienteId"
                    value={formData.periodicidadeClienteId}
                    options={parametros.periodicidadeCliente}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Tier Cliente"
                    name="tierClienteId"
                    value={formData.tierClienteId}
                    options={parametros.tierCliente}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Cluster Cliente"
                    name="clusterClienteId"
                    value={formData.clusterClienteId}
                    options={parametros.clusterCliente}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Categoria Cliente"
                    name="categoriaClienteId"
                    value={formData.categoriaClienteId}
                    options={parametros.categoriaCliente}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Escritório Gestor"
                    name="sedeClienteId"
                    value={formData.sedeClienteId}
                    options={parametros.escritorioGestor || parametros.sedeCliente}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Localização"
                    name="localizacaoClienteId"
                    value={formData.localizacaoClienteId}
                    options={parametros.localizacaoCliente}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Tag do Cliente"
                    name="tagsId"
                    value={formData.tagsId}
                    options={parametros.tags}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Adiantamento Folha"
                    name="adiantamentoFolhaId"
                    value={formData.adiantamentoFolhaId}
                    options={parametros.adiantamentoFolha}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Distribuição Lucro"
                    name="distribuicaoLucrosId"
                    value={formData.distribuicaoLucrosId}
                    options={parametros.distribuicaoLucros}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Volume Fiscal"
                    name="volumeFiscalId"
                    value={formData.volumeFiscalId}
                    options={parametros.volumeFiscal}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Volume Contábil"
                    name="volumeContabilId"
                    value={formData.volumeContabilId}
                    options={parametros.volumeContabil}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Volume DP"
                    name="volumeDPId"
                    value={formData.volumeDPId}
                    options={parametros.volumeDP}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Volume BPO"
                    name="volumeBPOId"
                    value={formData.volumeBPOId}
                    options={parametros.volumeBPO}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Modal Fecha Contábil"
                    name="modalidadeFechamentoContabilId"
                    value={formData.modalidadeFechamentoContabilId}
                    options={parametros.modalidadeFechamentoContabil}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Modal Fecha Fiscal"
                    name="modalidadeFechamentoFiscalId"
                    value={formData.modalidadeFechamentoFiscalId}
                    options={parametros.modalidadeFechamentoFiscal}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Modal Fecha DP"
                    name="modalidadeFechamentoDPId"
                    value={formData.modalidadeFechamentoDPId}
                    options={parametros.modalidadeFechamentoDP}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Modal Fecha BPO"
                    name="modalFechBPOId"
                    value={formData.modalFechBPOId}
                    options={parametros.modalFechBPO}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Grupo do Cliente"
                    name="grupoClienteId"
                    value={formData.grupoClienteId}
                    options={parametros.grupoCliente}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Segmento"
                    name="segmentoId"
                    value={formData.segmentoId}
                    options={parametros.segmento}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Atuação"
                    name="atuacaoId"
                    value={formData.atuacaoId}
                    options={parametros.atuacao}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Accordion 2: Enquadramento */}
          <Accordion className={classes.accordion}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} className={classes.accordionSummary}>
              <Typography variant="subtitle1" style={{ fontWeight: 600, color: '#1976d2' }}>
                📋 Enquadramento
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Status do Cliente"
                    name="statusClienteId"
                    value={formData.statusClienteId}
                    options={parametros.statusCliente}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Status Complementar"
                    name="statusComplementarId"
                    value={formData.statusComplementarId}
                    options={parametros.statusComplementar}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Tipo de Pessoa"
                    name="tipoClienteId"
                    value={formData.tipoClienteId}
                    options={parametros.tipoCliente}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Porte Federal"
                    name="porteFederalId"
                    value={formData.porteFederalId}
                    options={parametros.porteFederal}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Porte Estadual"
                    name="porteEstadualId"
                    value={formData.porteEstadualId}
                    options={parametros.porteEstadual}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Porte Municipal"
                    name="porteMunicipalId"
                    value={formData.porteMunicipalId}
                    options={parametros.porteMunicipal}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Regime Tributário Federal"
                    name="regimeTributarioFederalId"
                    value={formData.regimeTributarioFederalId}
                    options={parametros.regimeTributarioFederal}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Regime Tributário Estadual"
                    name="regimeTributarioEstadualId"
                    value={formData.regimeTributarioEstadualId}
                    options={parametros.regimeTributarioEstadual}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectParametro
                    label="Regime Tributário Municipal"
                    name="regimeTributarioMunicipalId"
                    value={formData.regimeTributarioMunicipalId}
                    options={parametros.regimeTributarioMunicipal}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Divider style={{ margin: "32px 0" }} />

          {/* Seletor de Tarefas & Controles do Modelo */}
          <Typography variant="h6" className={classes.sectionTitle} gutterBottom>
            Tarefas & Controles do Modelo
          </Typography>
          <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
            Selecione as tarefas, controles, recorrências e parcelamentos que fazem parte deste modelo.
            Ao aplicar o modelo em um cliente, estas configurações aparecerão pré-selecionadas.
          </Typography>
          <Card style={{ padding: 16, border: '1px solid #e3e8ef', backgroundColor: '#fafafa', marginBottom: 24 }}>
            <EndpointSelector
              selectedEndpoints={endpointsModelo}
              onChange={setEndpointsModelo}
            />
          </Card>

          <Divider style={{ margin: "32px 0" }} />

          {/* Botões de Ação */}
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" onClick={handleCancel} disabled={saving}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={saving}
            >
              {saving ? "Salvando..." : "Salvar Modelo"}
            </Button>
          </Box>
        </form>
      </Paper>
    </MainContainer>
  );
};

export default ModelosParametrosCadastro;
