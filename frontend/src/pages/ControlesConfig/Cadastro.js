import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Button,
  TextField,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Typography,
  Box,
  CircularProgress,
  Divider,
  Switch,
} from "@material-ui/core";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from "@material-ui/icons";
import { useHistory, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";

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
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "400px",
  },
  clientesTable: {
    marginTop: theme.spacing(2),
  },
  addClienteButton: {
    marginTop: theme.spacing(2),
  },
}));

const ControlesCadastro = () => {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Dados do formulário
  const [formData, setFormData] = useState({
    codigo: "",
    nome: "",
    departamentoId: "",
    tipoServicoId: "",
    prioridadeId: "",
    prazoId: "",
    recorrente: false,
    valorReferencial: "",
    sabadoUtil: false,
    diasNaoUteis: "",
    diasLembrete: "",
    aceitaArquivos: true,
    ativo: true,
  });

  // Listas para os selects
  const [departamentos, setDepartamentos] = useState([]);
  const [tiposServico, setTiposServico] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [prazos, setPrazos] = useState([]);

  useEffect(() => {
    fetchDepartamentos();
    fetchTiposServico();
    fetchPrioridades();
    fetchPrazos();

    if (id) {
      fetchControle();
    }
  }, [id]);

  const fetchDepartamentos = async () => {
    try {
      const { data } = await api.get("/departamentos");
      setDepartamentos(data.departamentos || []);
    } catch (err) {
      console.error("Erro ao buscar departamentos:", err);
    }
  };

  const fetchTiposServico = async () => {
    try {
      const { data } = await api.get("/tipo-servico");
      setTiposServico(Array.isArray(data) ? data : data.tipos || []);
    } catch (err) {
      console.error("Erro ao buscar tipos de serviço:", err);
    }
  };

  const fetchPrioridades = async () => {
    try {
      const { data } = await api.get("/parametros/prioridades");
      setPrioridades(Array.isArray(data) ? data : data.prioridades || []);
    } catch (err) {
      console.error("Erro ao buscar prioridades:", err);
    }
  };

  const fetchPrazos = async () => {
    try {
      const { data } = await api.get("/parametros/prazos");
      setPrazos(Array.isArray(data) ? data : data.prazos || []);
    } catch (err) {
      console.error("Erro ao buscar prazos:", err);
    }
  };

  const fetchControle = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/controles-config/${id}`);
      
      setFormData({
        codigo: data.codigo || "",
        nome: data.nome || "",
        departamentoId: data.departamentoId || "",
        tipoServicoId: data.tipoServicoId || "",
        prioridadeId: data.prioridadeId || "",
        prazoId: data.prazoId || "",
        recorrente: data.recorrente || false,
        valorReferencial: data.valorReferencial || "",
        sabadoUtil: data.sabadoUtil || false,
        diasNaoUteis: data.diasNaoUteis || "",
        diasLembrete: data.diasLembrete || "",
        aceitaArquivos: data.aceitaArquivos !== false,
        ativo: data.ativo !== false,
      });
    } catch (err) {
      console.error("Erro ao buscar controle:", err);
      toast.error("Erro ao carregar controle");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações
    if (!formData.codigo) {
      toast.error("Código é obrigatório");
      return;
    }

    if (!formData.nome) {
      toast.error("Nome é obrigatório");
      return;
    }

    if (!formData.departamentoId) {
      toast.error("Departamento é obrigatório");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        codigo: formData.codigo,
        nome: formData.nome,
        departamentoId: formData.departamentoId ? parseInt(formData.departamentoId) : null,
        tipoServicoId: formData.tipoServicoId ? parseInt(formData.tipoServicoId) : null,
        prioridadeId: formData.prioridadeId ? parseInt(formData.prioridadeId) : null,
        prazoId: formData.prazoId ? parseInt(formData.prazoId) : null,
        recorrente: formData.recorrente,
        valorReferencial: formData.valorReferencial ? parseFloat(formData.valorReferencial) : null,
        sabadoUtil: formData.sabadoUtil,
        diasNaoUteis: formData.diasNaoUteis || null,
        diasLembrete: formData.diasLembrete ? parseInt(formData.diasLembrete) : null,
        aceitaArquivos: formData.aceitaArquivos,
        ativo: formData.ativo,
      };

      if (id) {
        await api.put(`/controles-config/${id}`, payload);
        toast.success("Controle atualizado com sucesso!");
      } else {
        await api.post("/controles-config", payload);
        toast.success("Controle cadastrado com sucesso!");
      }

      history.push("/controles-config");
    } catch (err) {
      console.error("Erro ao salvar controle:", err);
      toast.error(err.response?.data?.error || "Erro ao salvar controle");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    history.push("/controles-config");
  };

  if (loading) {
    return (
      <MainContainer>
        <Box className={classes.loadingContainer}>
          <CircularProgress />
        </Box>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <MainHeader>
        <Title>{id ? "Editar Controle" : "Novo Controle"}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="outlined"
            color="default"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Voltar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <form onSubmit={handleSubmit}>
          {/* Informações Básicas */}
          <Typography variant="h6" className={classes.sectionTitle}>
            Informações Básicas
          </Typography>

          <Grid container spacing={2} className={classes.formSection}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Código *"
                variant="outlined"
                value={formData.codigo}
                onChange={(e) => handleInputChange("codigo", e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} md={9}>
              <TextField
                fullWidth
                label="Nome *"
                variant="outlined"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel>Departamento *</InputLabel>
                <Select
                  value={formData.departamentoId}
                  onChange={(e) =>
                    handleInputChange("departamentoId", e.target.value)
                  }
                  label="Departamento *"
                >
                  <MenuItem value="">Selecione...</MenuItem>
                  {departamentos.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Tipo de Serviço</InputLabel>
                <Select
                  value={formData.tipoServicoId}
                  onChange={(e) =>
                    handleInputChange("tipoServicoId", e.target.value)
                  }
                  label="Tipo de Serviço"
                >
                  <MenuItem value="">Selecione...</MenuItem>
                  {tiposServico.map((tipo) => (
                    <MenuItem key={tipo.id} value={tipo.id}>
                      {tipo.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Prioridade</InputLabel>
                <Select
                  value={formData.prioridadeId}
                  onChange={(e) =>
                    handleInputChange("prioridadeId", e.target.value)
                  }
                  label="Prioridade"
                >
                  <MenuItem value="">Selecione...</MenuItem>
                  {prioridades.map((prioridade) => (
                    <MenuItem key={prioridade.id} value={prioridade.id}>
                      {prioridade.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Prazo</InputLabel>
                <Select
                  value={formData.prazoId}
                  onChange={(e) => handleInputChange("prazoId", e.target.value)}
                  label="Prazo"
                >
                  <MenuItem value="">Selecione...</MenuItem>
                  {prazos.map((prazo) => (
                    <MenuItem key={prazo.id} value={prazo.id}>
                      {prazo.nome} ({prazo.dias} dias)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Valor Referencial"
                variant="outlined"
                type="number"
                value={formData.valorReferencial}
                onChange={(e) =>
                  handleInputChange("valorReferencial", e.target.value)
                }
                InputProps={{
                  startAdornment: <Typography>R$</Typography>,
                }}
              />
            </Grid>
          </Grid>

          <Divider />

          {/* Recorrência */}
          <Typography variant="h6" className={classes.sectionTitle}>
            Recorrência
          </Typography>

          <Grid container spacing={2} className={classes.formSection}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Recorrência</FormLabel>
                <RadioGroup
                  row
                  value={formData.recorrente ? "true" : "false"}
                  onChange={(e) =>
                    handleInputChange("recorrente", e.target.value === "true")
                  }
                >
                  <FormControlLabel
                    value="false"
                    control={<Radio />}
                    label="Não Recorrente"
                  />
                  <FormControlLabel
                    value="true"
                    control={<Radio />}
                    label="Recorrente"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>

          <Divider />

          {/* Configurações */}
          <Typography variant="h6" className={classes.sectionTitle}>
            Configurações
          </Typography>

          <Grid container spacing={2} className={classes.formSection}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dias de Lembrete"
                variant="outlined"
                type="number"
                value={formData.diasLembrete}
                onChange={(e) =>
                  handleInputChange("diasLembrete", e.target.value)
                }
                helperText="Quantos dias antes do vencimento será enviado o lembrete"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Dias Não Úteis</InputLabel>
                <Select
                  value={formData.diasNaoUteis}
                  onChange={(e) =>
                    handleInputChange("diasNaoUteis", e.target.value)
                  }
                  label="Dias Não Úteis"
                >
                  <MenuItem value="">Selecione...</MenuItem>
                  <MenuItem value="Antecipar">Antecipar</MenuItem>
                  <MenuItem value="Postergar">Postergar</MenuItem>
                  <MenuItem value="Manter">Manter</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.sabadoUtil}
                    onChange={(e) =>
                      handleInputChange("sabadoUtil", e.target.checked)
                    }
                    color="primary"
                  />
                }
                label="Sábado é dia útil"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.aceitaArquivos}
                    onChange={(e) =>
                      handleInputChange("aceitaArquivos", e.target.checked)
                    }
                    color="primary"
                  />
                }
                label="Aceita arquivos"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.ativo}
                    onChange={(e) =>
                      handleInputChange("ativo", e.target.checked)
                    }
                    color="primary"
                  />
                }
                label="Controle ativo"
              />
            </Grid>
          </Grid>
        </form>
      </Paper>
    </MainContainer>
  );
};

export default ControlesCadastro;
