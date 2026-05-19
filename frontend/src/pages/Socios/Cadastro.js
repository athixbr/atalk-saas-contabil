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
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Tooltip,
  Link,
} from "@material-ui/core";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Launch as LaunchIcon,
  Search as SearchIcon,
  AddCircle as AddCircleIcon,
} from "@material-ui/icons";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useHistory, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import api from "../../services/api";
import Dialog from "../../components/Dialog";
import ConfirmationModal from "../../components/ConfirmationModal";

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
  dependenteCard: {
    marginBottom: theme.spacing(2),
    position: "relative",
  },
  deleteButton: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
  },
  empresaCard: {
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
  },
}));

const estadosBrasileiros = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const estadosCivis = [
  { value: "solteiro", label: "Solteiro(a)" },
  { value: "casado", label: "Casado(a)" },
  { value: "divorciado", label: "Divorciado(a)" },
  { value: "viuvo", label: "Viúvo(a)" },
  { value: "uniao_estavel", label: "União Estável" },
];

const parentescos = [
  "Filho(a)", "Cônjuge", "Companheiro(a)", "Pai", "Mãe", "Irmão(ã)", "Avô(ó)", "Neto(a)", "Outro"
];

const SociosCadastro = () => {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [consultandoCep, setConsultandoCep] = useState(false);
  const [searchingEmpresas, setSearchingEmpresas] = useState(false);
  const [empresaSearchTerm, setEmpresaSearchTerm] = useState("");

  // Estados para vínculos com empresas
  const [empresas, setEmpresas] = useState([]);
  const [vinculoModalOpen, setVinculoModalOpen] = useState(false);
  const [editingVinculo, setEditingVinculo] = useState(null);
  const [deletingVinculo, setDeletingVinculo] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  
  const [vinculoForm, setVinculoForm] = useState({
    clienteId: null,
    percentual: "",
    cargo: "",
    valorQuota: "",
    quantidadeQuotas: "",
    dataEntrada: "",
    dataSaida: "",
    podeAssinar: false,
    poderIsolado: false,
    isAdministrador: false,
    recebeProlabore: false,
    valorProlabore: "",
    observacoes: "",
  });

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    rg: "",
    dataNascimento: "",
    nacionalidade: "Brasileira",
    naturalidade: "",
    estadoCivil: "",
    profissao: "",
    telefone: "",
    celular: "",
    email: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    dependentes: [],
    banco: "",
    agencia: "",
    conta: "",
    tipoConta: "",
    chavePix: "",
    observacoes: "",
    ativo: true,
  });

  const [dependenteForm, setDependenteForm] = useState({
    nome: "",
    cpf: "",
    parentesco: "",
    dataNascimento: "",
  });

  useEffect(() => {
    if (id) {
      loadSocio();
    }
    loadEmpresas();
  }, [id]);

  const loadEmpresas = async (searchQuery = "") => {
    try {
      setSearchingEmpresas(true);
      const { data } = await api.get("/clientes", {
        params: {
          tipoCliente: "juridica",
          ativo: "true",
          searchParam: searchQuery || empresaSearchTerm,
          limit: 50,
        },
      });
      setEmpresas(data.clientes || []);
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
    } finally {
      setSearchingEmpresas(false);
    }
  };

  const loadSocio = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/socios/${id}`);
      setFormData({
        nome: data.nome || "",
        cpf: data.cpf || "",
        rg: data.rg || "",
        dataNascimento: data.dataNascimento || "",
        nacionalidade: data.nacionalidade || "Brasileira",
        naturalidade: data.naturalidade || "",
        estadoCivil: data.estadoCivil || "",
        profissao: data.profissao || "",
        telefone: data.telefone || "",
        celular: data.celular || "",
        email: data.email || "",
        cep: data.cep || "",
        logradouro: data.logradouro || "",
        numero: data.numero || "",
        complemento: data.complemento || "",
        bairro: data.bairro || "",
        cidade: data.cidade || "",
        estado: data.estado || "",
        dependentes: data.dependentes || [],
        banco: data.banco || "",
        agencia: data.agencia || "",
        conta: data.conta || "",
        tipoConta: data.tipoConta || "",
        chavePix: data.chavePix || "",
        observacoes: data.observacoes || "",
        ativo: data.ativo !== undefined ? data.ativo : true,
      });
    } catch (error) {
      toast.error("Erro ao carregar sócio");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDependenteChange = (e) => {
    const { name, value } = e.target;
    setDependenteForm({ ...dependenteForm, [name]: value });
  };

  const handleAddDependente = () => {
    if (!dependenteForm.nome || !dependenteForm.cpf || !dependenteForm.parentesco) {
      toast.error("Preencha nome, CPF e parentesco do dependente");
      return;
    }

    setFormData({
      ...formData,
      dependentes: [...formData.dependentes, dependenteForm],
    });

    setDependenteForm({
      nome: "",
      cpf: "",
      parentesco: "",
      dataNascimento: "",
    });
  };

  const handleRemoveDependente = (index) => {
    const newDependentes = formData.dependentes.filter((_, i) => i !== index);
    setFormData({ ...formData, dependentes: newDependentes });
  };

  const handleCepBlur = async () => {
    if (!formData.cep) return;

    const cepLimpo = formData.cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      toast.error("CEP inválido");
      return;
    }

    setConsultandoCep(true);
    try {
      const { data } = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`).then((res) =>
        res.json()
      );

      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      setFormData({
        ...formData,
        logradouro: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || "",
      });
    } catch (error) {
      toast.error("Erro ao consultar CEP");
    } finally {
      setConsultandoCep(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome || !formData.cpf) {
      toast.error("Nome e CPF são obrigatórios");
      return;
    }

    try {
      if (id) {
        await api.put(`/socios/${id}`, formData);
        toast.success("Sócio atualizado com sucesso");
      } else {
        await api.post("/socios", formData);
        toast.success("Sócio cadastrado com sucesso");
      }
      history.push("/socios");
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Erro ao salvar sócio";
      toast.error(errorMsg);
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

  const formatCEP = (value) => {
    if (!value) return "";
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{3})\d+?$/, "$1");
  };

  const formatTelefone = (value) => {
    if (!value) return "";
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  // Funções para gerenciar vínculos
  const handleOpenVinculoModal = (vinculo = null) => {
    console.log("handleOpenVinculoModal called with:", vinculo);
    if (vinculo) {
      setEditingVinculo(vinculo);
      setVinculoForm({
        clienteId: vinculo.id,
        percentual: vinculo.ClienteSocio?.percentual || "",
        cargo: vinculo.ClienteSocio?.cargo || "",
        valorQuota: vinculo.ClienteSocio?.valorQuota || "",
        quantidadeQuotas: vinculo.ClienteSocio?.quantidadeQuotas || "",
        dataEntrada: vinculo.ClienteSocio?.dataEntrada || "",
        dataSaida: vinculo.ClienteSocio?.dataSaida || "",
        podeAssinar: vinculo.ClienteSocio?.podeAssinar || false,
        poderIsolado: vinculo.ClienteSocio?.poderIsolado || false,
        isAdministrador: vinculo.ClienteSocio?.isAdministrador || false,
        recebeProlabore: vinculo.ClienteSocio?.recebeProlabore || false,
        valorProlabore: vinculo.ClienteSocio?.valorProlabore || "",
        observacoes: vinculo.ClienteSocio?.observacoes || "",
      });
    } else {
      setEditingVinculo(null);
      setVinculoForm({
        clienteId: null,
        percentual: "",
        cargo: "",
        valorQuota: "",
        quantidadeQuotas: "",
        dataEntrada: "",
        dataSaida: "",
        podeAssinar: false,
        poderIsolado: false,
        isAdministrador: false,
        recebeProlabore: false,
        valorProlabore: "",
        observacoes: "",
      });
    }
    console.log("Setting vinculoModalOpen to true");
    setVinculoModalOpen(true);
  };

  const handleCloseVinculoModal = () => {
    setVinculoModalOpen(false);
    setEditingVinculo(null);
  };

  const handleVinculoFormChange = (field, value) => {
    setVinculoForm({ ...vinculoForm, [field]: value });
  };

  const handleSaveVinculo = async () => {
    if (!id) {
      toast.error("Salve o sócio antes de adicionar vínculos");
      return;
    }

    if (!vinculoForm.clienteId) {
      toast.error("Selecione uma empresa");
      return;
    }

    try {
      const payload = {
        socioId: parseInt(id),
        clienteId: vinculoForm.clienteId,
        percentual: vinculoForm.percentual ? parseFloat(vinculoForm.percentual) : null,
        cargo: vinculoForm.cargo || null,
        valorQuota: vinculoForm.valorQuota ? parseFloat(vinculoForm.valorQuota) : null,
        quantidadeQuotas: vinculoForm.quantidadeQuotas ? parseInt(vinculoForm.quantidadeQuotas) : null,
        dataEntrada: vinculoForm.dataEntrada || null,
        dataSaida: vinculoForm.dataSaida || null,
        podeAssinar: vinculoForm.podeAssinar,
        poderIsolado: vinculoForm.poderIsolado,
        isAdministrador: vinculoForm.isAdministrador,
        recebeProlabore: vinculoForm.recebeProlabore,
        valorProlabore: vinculoForm.valorProlabore ? parseFloat(vinculoForm.valorProlabore) : null,
        observacoes: vinculoForm.observacoes || null,
      };

      if (editingVinculo && editingVinculo.ClienteSocio?.id) {
        await api.put(`/socios/vinculos/${editingVinculo.ClienteSocio.id}`, payload);
        toast.success("Vínculo atualizado com sucesso");
      } else {
        await api.post("/socios/vinculos", payload);
        toast.success("Vínculo criado com sucesso");
      }

      handleCloseVinculoModal();
      loadSocio();
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Erro ao salvar vínculo";
      toast.error(errorMsg);
    }
  };

  const handleDeleteVinculo = (vinculo) => {
    setDeletingVinculo(vinculo);
    setConfirmModalOpen(true);
  };

  const handleCreateNewCliente = () => {
    // Abre a página de cadastro de clientes em uma nova aba
    window.open("/clientes/cadastro", "_blank");
  };

  const handleViewCliente = (clienteId) => {
    // Abre a página de edição do cliente em uma nova aba
    window.open(`/clientes/cadastro/${clienteId}`, "_blank");
  };

  const formatCNPJ = (cnpj) => {
    if (!cnpj) return "";
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  };

  const handleConfirmDeleteVinculo = async () => {
    try {
      await api.delete(`/socios/vinculos/${deletingVinculo.ClienteSocio.id}`);
      toast.success("Vínculo removido com sucesso");
      setConfirmModalOpen(false);
      setDeletingVinculo(null);
      loadSocio();
    } catch (error) {
      toast.error("Erro ao remover vínculo");
      console.error(error);
    }
  };

  const handleCancelDeleteVinculo = () => {
    setConfirmModalOpen(false);
    setDeletingVinculo(null);
  };

  if (loading) {
    return (
      <MainContainer>
        <Paper className={classes.loadingContainer}>
          <CircularProgress />
        </Paper>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <MainHeader>
        <Title>{id ? "Editar Sócio" : "Novo Sócio"}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => history.push("/socios")}
          >
            Voltar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
          >
            Salvar
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <form onSubmit={handleSubmit}>
          {/* DADOS PESSOAIS */}
          <Typography variant="h6" className={classes.sectionTitle}>
            Dados Pessoais
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nome Completo"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="CPF"
                name="cpf"
                value={formatCPF(formData.cpf)}
                onChange={(e) =>
                  setFormData({ ...formData, cpf: e.target.value.replace(/\D/g, "") })
                }
                fullWidth
                required
                inputProps={{ maxLength: 14 }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="RG"
                name="rg"
                value={formData.rg}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Data de Nascimento"
                name="dataNascimento"
                type="date"
                value={formData.dataNascimento}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Nacionalidade"
                name="nacionalidade"
                value={formData.nacionalidade}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Naturalidade"
                name="naturalidade"
                value={formData.naturalidade}
                onChange={handleInputChange}
                fullWidth
                placeholder="Ex: São Paulo/SP"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Estado Civil</InputLabel>
                <Select
                  name="estadoCivil"
                  value={formData.estadoCivil}
                  onChange={handleInputChange}
                >
                  <MenuItem value="">Selecione</MenuItem>
                  {estadosCivis.map((ec) => (
                    <MenuItem key={ec.value} value={ec.value}>
                      {ec.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Profissão"
                name="profissao"
                value={formData.profissao}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
          </Grid>

          <Divider style={{ margin: "24px 0" }} />

          {/* CONTATO */}
          <Typography variant="h6" className={classes.sectionTitle}>
            Contato
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Telefone"
                name="telefone"
                value={formatTelefone(formData.telefone)}
                onChange={(e) =>
                  setFormData({ ...formData, telefone: e.target.value.replace(/\D/g, "") })
                }
                fullWidth
                inputProps={{ maxLength: 15 }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Celular"
                name="celular"
                value={formatTelefone(formData.celular)}
                onChange={(e) =>
                  setFormData({ ...formData, celular: e.target.value.replace(/\D/g, "") })
                }
                fullWidth
                inputProps={{ maxLength: 15 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="E-mail"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
          </Grid>

          <Divider style={{ margin: "24px 0" }} />

          {/* ENDEREÇO */}
          <Typography variant="h6" className={classes.sectionTitle}>
            Endereço
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                label="CEP"
                name="cep"
                value={formatCEP(formData.cep)}
                onChange={(e) =>
                  setFormData({ ...formData, cep: e.target.value.replace(/\D/g, "") })
                }
                onBlur={handleCepBlur}
                fullWidth
                inputProps={{ maxLength: 9 }}
                disabled={consultandoCep}
              />
            </Grid>
            <Grid item xs={12} sm={7}>
              <TextField
                label="Logradouro"
                name="logradouro"
                value={formData.logradouro}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                label="Número"
                name="numero"
                value={formData.numero}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Complemento"
                name="complemento"
                value={formData.complemento}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Bairro"
                name="bairro"
                value={formData.bairro}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <FormControl fullWidth>
                <InputLabel>UF</InputLabel>
                <Select name="estado" value={formData.estado} onChange={handleInputChange}>
                  <MenuItem value="">-</MenuItem>
                  {estadosBrasileiros.map((uf) => (
                    <MenuItem key={uf} value={uf}>
                      {uf}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider style={{ margin: "24px 0" }} />

          {/* DEPENDENTES */}
          <Typography variant="h6" className={classes.sectionTitle}>
            Dependentes (para IRPF)
          </Typography>

          {formData.dependentes.length > 0 && (
            <Box mb={2}>
              {formData.dependentes.map((dep, index) => (
                <Card key={index} className={classes.dependenteCard} variant="outlined">
                  <CardContent>
                    <IconButton
                      className={classes.deleteButton}
                      size="small"
                      onClick={() => handleRemoveDependente(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <Typography variant="subtitle2">
                      <strong>{dep.nome}</strong> - {dep.parentesco}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      CPF: {formatCPF(dep.cpf)}
                      {dep.dataNascimento && ` | Nascimento: ${dep.dataNascimento}`}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          <Card variant="outlined">
            <CardHeader title="Adicionar Dependente" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Nome"
                    name="nome"
                    value={dependenteForm.nome}
                    onChange={handleDependenteChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="CPF"
                    name="cpf"
                    value={formatCPF(dependenteForm.cpf)}
                    onChange={(e) =>
                      setDependenteForm({
                        ...dependenteForm,
                        cpf: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    fullWidth
                    size="small"
                    inputProps={{ maxLength: 14 }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Parentesco</InputLabel>
                    <Select
                      name="parentesco"
                      value={dependenteForm.parentesco}
                      onChange={handleDependenteChange}
                    >
                      {parentescos.map((p) => (
                        <MenuItem key={p} value={p}>
                          {p}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    label="Nascimento"
                    name="dataNascimento"
                    type="date"
                    value={dependenteForm.dataNascimento}
                    onChange={handleDependenteChange}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
              <Box mt={2}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddDependente}
                  size="small"
                >
                  Adicionar Dependente
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Divider style={{ margin: "24px 0" }} />

          {/* DADOS BANCÁRIOS */}
          <Typography variant="h6" className={classes.sectionTitle}>
            Dados Bancários (Pró-labore)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Banco"
                name="banco"
                value={formData.banco}
                onChange={handleInputChange}
                fullWidth
                placeholder="Ex: Banco do Brasil"
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                label="Agência"
                name="agencia"
                value={formData.agencia}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Conta"
                name="conta"
                value={formData.conta}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Conta</InputLabel>
                <Select name="tipoConta" value={formData.tipoConta} onChange={handleInputChange}>
                  <MenuItem value="">Selecione</MenuItem>
                  <MenuItem value="corrente">Conta Corrente</MenuItem>
                  <MenuItem value="poupanca">Poupança</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Chave PIX"
                name="chavePix"
                value={formData.chavePix}
                onChange={handleInputChange}
                fullWidth
                placeholder="CPF, e-mail, celular ou chave aleatória"
              />
            </Grid>
          </Grid>

          <Divider style={{ margin: "24px 0" }} />

          {/* EMPRESAS VINCULADAS - CRUD COMPLETO */}
          {id && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" className={classes.sectionTitle}>
                  Empresas Vinculadas
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenVinculoModal()}
                  disabled={!id}
                >
                  Adicionar Empresa
                </Button>
              </Box>

              {formData.clientes && formData.clientes.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Empresa</strong></TableCell>
                      <TableCell><strong>CNPJ</strong></TableCell>
                      <TableCell><strong>Participação</strong></TableCell>
                      <TableCell><strong>Cargo</strong></TableCell>
                      <TableCell><strong>Pró-labore</strong></TableCell>
                      <TableCell align="center"><strong>Status</strong></TableCell>
                      <TableCell align="center"><strong>Ações</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.clientes.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell>{cliente.nome}</TableCell>
                        <TableCell>{cliente.cnpj}</TableCell>
                        <TableCell>
                          {cliente.ClienteSocio?.percentual ? `${cliente.ClienteSocio.percentual}%` : "-"}
                        </TableCell>
                        <TableCell>{cliente.ClienteSocio?.cargo || "-"}</TableCell>
                        <TableCell>
                          {cliente.ClienteSocio?.recebeProlabore
                            ? `R$ ${parseFloat(cliente.ClienteSocio.valorProlabore || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                            : "Não"}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={cliente.ClienteSocio?.ativo ? "Ativo" : "Inativo"}
                            size="small"
                            color={cliente.ClienteSocio?.ativo ? "primary" : "default"}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Ver/Editar Empresa">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleViewCliente(cliente.id)}
                            >
                              <LaunchIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar Vínculo">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenVinculoModal(cliente)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remover Vínculo">
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => handleDeleteVinculo(cliente)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Box textAlign="center" py={3}>
                  <Typography variant="body2" color="textSecondary">
                    Nenhuma empresa vinculada. Clique em "Adicionar Empresa" para vincular.
                  </Typography>
                </Box>
              )}

              <Divider style={{ margin: "24px 0" }} />
            </>
          )}

          {!id && (
            <>
              <Box textAlign="center" py={2}>
                <Typography variant="body2" color="textSecondary">
                  Salve o sócio para poder vincular empresas
                </Typography>
              </Box>
              <Divider style={{ margin: "24px 0" }} />
            </>
          )}

          {/* OBSERVAÇÕES */}
          <Typography variant="h6" className={classes.sectionTitle}>
            Observações
          </Typography>
          <TextField
            name="observacoes"
            value={formData.observacoes}
            onChange={handleInputChange}
            multiline
            rows={4}
            fullWidth
            variant="outlined"
          />

          <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  color="primary"
                />
              }
              label="Sócio Ativo"
            />
          </Box>
        </form>
      </Paper>

      {/* Modal de Vínculo com Empresa */}
      <Dialog
        open={vinculoModalOpen}
        onClose={handleCloseVinculoModal}
        maxWidth="md"
        fullWidth
      >
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            {editingVinculo ? "Editar Vínculo" : "Adicionar Empresa"}
          </Typography>

          <Grid container spacing={2} style={{ marginTop: 16 }}>
            {/* Seleção de Empresa */}
            <Grid item xs={12}>
              <Autocomplete
                options={empresas}
                getOptionLabel={(option) => {
                  const cnpjFormatted = formatCNPJ(option.cnpj || option.cpfCnpj);
                  return `${option.razaoSocial || option.nome} - ${cnpjFormatted}`;
                }}
                value={empresas.find((e) => e.id === vinculoForm.clienteId) || null}
                onChange={(e, newValue) => handleVinculoFormChange("clienteId", newValue?.id || null)}
                onInputChange={(event, value) => {
                  setEmpresaSearchTerm(value);
                  if (value && value.length >= 3) {
                    loadEmpresas(value);
                  }
                }}
                loading={searchingEmpresas}
                renderOption={(option) => (
                  <Box style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <Typography style={{ fontWeight: 500, fontSize: '0.95rem' }}>
                      {option.razaoSocial || option.nome}
                    </Typography>
                    <Typography style={{ fontSize: '0.85rem', color: '#666' }}>
                      CNPJ: {formatCNPJ(option.cnpj || option.cpfCnpj)}
                      {option.nomeFantasia && ` • ${option.nomeFantasia}`}
                    </Typography>
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Empresa *"
                    variant="outlined"
                    fullWidth
                    placeholder="Digite o nome ou CNPJ da empresa..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <SearchIcon style={{ marginLeft: 8, color: '#999' }} />
                          {params.InputProps.startAdornment}
                        </>
                      ),
                      endAdornment: (
                        <>
                          {searchingEmpresas ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                disabled={!!editingVinculo}
              />
              <Box style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Typography variant="caption" color="textSecondary">
                  Digite ao menos 3 caracteres para buscar
                </Typography>
              </Box>
              <Box style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Typography variant="caption" color="textSecondary">
                  Não encontrou a empresa?
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddCircleIcon fontSize="small" />}
                  onClick={handleCreateNewCliente}
                  style={{ textTransform: 'none', padding: '2px 8px' }}
                >
                  Cadastrar nova empresa
                </Button>
              </Box>
            </Grid>

            {/* Dados Societários */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Participação (%)"
                type="number"
                value={vinculoForm.percentual}
                onChange={(e) => handleVinculoFormChange("percentual", e.target.value)}
                variant="outlined"
                fullWidth
                inputProps={{ min: 0, max: 100, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Cargo"
                value={vinculoForm.cargo}
                onChange={(e) => handleVinculoFormChange("cargo", e.target.value)}
                variant="outlined"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Valor da Quota (R$)"
                type="number"
                value={vinculoForm.valorQuota}
                onChange={(e) => handleVinculoFormChange("valorQuota", e.target.value)}
                variant="outlined"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Quantidade de Quotas"
                type="number"
                value={vinculoForm.quantidadeQuotas}
                onChange={(e) => handleVinculoFormChange("quantidadeQuotas", e.target.value)}
                variant="outlined"
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* Timeline */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Data de Entrada"
                type="date"
                value={vinculoForm.dataEntrada}
                onChange={(e) => handleVinculoFormChange("dataEntrada", e.target.value)}
                variant="outlined"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Data de Saída"
                type="date"
                value={vinculoForm.dataSaida}
                onChange={(e) => handleVinculoFormChange("dataSaida", e.target.value)}
                variant="outlined"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Poderes */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Poderes e Atribuições
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={vinculoForm.podeAssinar}
                    onChange={(e) => handleVinculoFormChange("podeAssinar", e.target.checked)}
                    color="primary"
                  />
                }
                label="Pode Assinar"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={vinculoForm.poderIsolado}
                    onChange={(e) => handleVinculoFormChange("poderIsolado", e.target.checked)}
                    color="primary"
                  />
                }
                label="Poder Isolado"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={vinculoForm.isAdministrador}
                    onChange={(e) => handleVinculoFormChange("isAdministrador", e.target.checked)}
                    color="primary"
                  />
                }
                label="Administrador"
              />
            </Grid>

            {/* Pró-labore */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Pró-labore
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={vinculoForm.recebeProlabore}
                    onChange={(e) => handleVinculoFormChange("recebeProlabore", e.target.checked)}
                    color="primary"
                  />
                }
                label="Recebe Pró-labore"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Valor Pró-labore (R$)"
                type="number"
                value={vinculoForm.valorProlabore}
                onChange={(e) => handleVinculoFormChange("valorProlabore", e.target.value)}
                variant="outlined"
                fullWidth
                disabled={!vinculoForm.recebeProlabore}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            {/* Observações */}
            <Grid item xs={12}>
              <TextField
                label="Observações"
                value={vinculoForm.observacoes}
                onChange={(e) => handleVinculoFormChange("observacoes", e.target.value)}
                variant="outlined"
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>

          <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={handleCloseVinculoModal}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveVinculo}
              startIcon={<SaveIcon />}
            >
              {editingVinculo ? "Atualizar" : "Adicionar"}
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Modal de Confirmação */}
      <ConfirmationModal
        title="Remover Vínculo"
        open={confirmModalOpen}
        onClose={handleCancelDeleteVinculo}
        onConfirm={handleConfirmDeleteVinculo}
      >
        Tem certeza que deseja remover este vínculo?
      </ConfirmationModal>
    </MainContainer>
  );
};

export default SociosCadastro;
