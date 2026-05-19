import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Chip,
  CircularProgress,
  makeStyles,
  FormGroup,
  Divider,
} from "@material-ui/core";
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Search as SearchIcon,
} from "@material-ui/icons";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    backgroundColor: "#065183",
    color: "#fff",
    "& h2": {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(1),
      fontSize: "18px",
      fontWeight: 600,
    },
  },
  dialogContent: {
    paddingTop: theme.spacing(3),
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#333",
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  tipoClienteBox: {
    display: "flex",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  tipoButton: {
    flex: 1,
    padding: theme.spacing(2),
    border: "2px solid #e0e0e0",
    borderRadius: 12,
    cursor: "pointer",
    transition: "all 0.3s ease",
    textAlign: "center",
    "&:hover": {
      borderColor: "#065183",
      backgroundColor: "#f5f5f5",
    },
  },
  tipoButtonActive: {
    borderColor: "#065183",
    backgroundColor: "#e3f2fd",
  },
  certidaoSection: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
  },
  certidaoCategory: {
    marginBottom: theme.spacing(2),
  },
  categoryTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#555",
    marginBottom: theme.spacing(1),
    textTransform: "uppercase",
  },
  certidaoChip: {
    margin: theme.spacing(0.5),
    cursor: "pointer",
  },
  buscarCnpjButton: {
    marginTop: theme.spacing(1),
  },
  loadingBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(2),
  },
}));

const ClienteCertidaoModal = ({ open, onClose, clienteData, onSave }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [buscandoCnpj, setBuscandoCnpj] = useState(false);
  
  // Dados do cliente
  const [tipoCliente, setTipoCliente] = useState("juridica"); // juridica ou fisica
  const [nome, setNome] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [cpf, setCpf] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [cep, setCep] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  // Certidões selecionadas
  const [certidoesSelecionadas, setCertidoesSelecionadas] = useState([]);

  // Categorias de certidões
  const categoriasFederais = [
    { id: "ecac-fiscal", label: "E-CAC Situação Fiscal" },
    { id: "ecac-cadin", label: "E-CAC CADIN/SISBACEN" },
    { id: "ecac-postal", label: "E-CAC Caixa Postal" },
    { id: "rfb-pgfn", label: "RFB/PGFN" },
    { id: "tst", label: "TST" },
    { id: "fgts", label: "FGTS" },
    { id: "mte-certidao", label: "MTE - Certidão de Débitos", badge: "Gov.br" },
    { id: "mte-processos", label: "MTE - Processos Empregador", badge: "Público" },
    { id: "simples-nacional", label: "Simples Nacional", badge: "Público" },
    { id: "protesto-ieptb", label: "Protesto IEPTB (Nacional)", badge: "Gov.br" },
  ];

  const categoriasEstaduais = [
    { id: "sefaz-mt", label: "SEFAZ MT - Certidão Débitos", badge: "Público" },
    { id: "sefaz-go", label: "SEFAZ GO - Certidão Débitos", badge: "Público" },
    { id: "sefaz-mt-caixa", label: "SEFAZ MT (Caixa de Entrada)" },
  ];

  const categoriasMunicipais = [
    { id: "prefeitura-campo-verde", label: "Prefeitura Campo Verde" },
    { id: "prefeitura-rondonopolis", label: "Prefeitura Rondonópolis" },
    { id: "prefeitura-cuiaba", label: "Prefeitura Cuiabá - CND", badge: "Público" },
    { id: "prefeitura-sao-paulo", label: "Prefeitura São Paulo - CTM", badge: "Público" },
    { id: "prefeitura-sao-luis", label: "Prefeitura São Luís de Montes Belos" },
    { id: "prefeitura-agua-boa", label: "Prefeitura Água Boa/MT" },
  ];

  useEffect(() => {
    if (clienteData) {
      // Modo edição - preenche os dados
      setTipoCliente(clienteData.tipoCliente || "juridica");
      setNome(clienteData.nome || "");
      setRazaoSocial(clienteData.razaoSocial || "");
      setCnpj(clienteData.cnpj || "");
      setCpf(clienteData.cpf || "");
      setEndereco(clienteData.endereco || "");
      setCidade(clienteData.cidade || "");
      setEstado(clienteData.estado || "");
      setCep(clienteData.cep || "");
      setEmail(clienteData.email || "");
      setTelefone(clienteData.telefone || "");
      setCertidoesSelecionadas(clienteData.certidoesSelecionadas || []);
    } else {
      // Modo criação - limpa os dados
      resetForm();
    }
  }, [clienteData, open]);

  const resetForm = () => {
    setTipoCliente("juridica");
    setNome("");
    setRazaoSocial("");
    setCnpj("");
    setCpf("");
    setEndereco("");
    setCidade("");
    setEstado("");
    setCep("");
    setEmail("");
    setTelefone("");
    setCertidoesSelecionadas([]);
  };

  const buscarCNPJ = async () => {
    if (!cnpj || cnpj.length < 14) {
      toast.error("CNPJ inválido");
      return;
    }

    setBuscandoCnpj(true);
    try {
      // API pública de consulta CNPJ (ReceitaWS)
      const cnpjLimpo = cnpj.replace(/\D/g, "");
      const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`);
      const data = await response.json();

      if (data.status === "ERROR") {
        toast.error(data.message || "Erro ao buscar CNPJ");
        return;
      }

      // Preenche os campos
      setRazaoSocial(data.nome || "");
      setNome(data.fantasia || data.nome || "");
      setEndereco(
        `${data.logradouro || ""}, ${data.numero || ""} ${data.complemento || ""}`.trim()
      );
      setCidade(data.municipio || "");
      setEstado(data.uf || "");
      setCep(data.cep || "");
      setEmail(data.email || "");
      setTelefone(data.telefone || "");

      toast.success("Dados do CNPJ carregados com sucesso!");
    } catch (error) {
      toast.error("Erro ao consultar CNPJ. Tente novamente.");
      console.error(error);
    } finally {
      setBuscandoCnpj(false);
    }
  };

  const toggleCertidao = (certidaoId) => {
    setCertidoesSelecionadas((prev) => {
      if (prev.includes(certidaoId)) {
        return prev.filter((id) => id !== certidaoId);
      } else {
        return [...prev, certidaoId];
      }
    });
  };

  const handleSave = () => {
    // Validações
    if (!nome) {
      toast.error("Nome é obrigatório");
      return;
    }

    if (tipoCliente === "juridica" && !cnpj) {
      toast.error("CNPJ é obrigatório para pessoa jurídica");
      return;
    }

    if (tipoCliente === "fisica" && !cpf) {
      toast.error("CPF é obrigatório para pessoa física");
      return;
    }

    if (certidoesSelecionadas.length === 0) {
      toast.error("Selecione pelo menos uma certidão");
      return;
    }

    const clienteDataToSave = {
      id: clienteData?.id,
      tipoCliente,
      nome,
      razaoSocial,
      cnpj,
      cpf,
      endereco,
      cidade,
      estado,
      cep,
      email,
      telefone,
      certidoesSelecionadas: certidoesSelecionadas,
    };

    onSave(clienteDataToSave);
    handleClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatCNPJ = (value) => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/);
    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}/${match[4]}-${match[5]}`;
    }
    return cleaned;
  };

  const formatCPF = (value) => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
    }
    return cleaned;
  };

  const formatCEP = (value) => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{5})(\d{3})$/);
    if (match) {
      return `${match[1]}-${match[2]}`;
    }
    return cleaned;
  };

  const renderCertidoesSection = () => (
    <Box className={classes.certidaoSection}>
      <Typography className={classes.sectionTitle}>
        Certidões para Emissão
      </Typography>

      <Box className={classes.certidaoCategory}>
        <Typography className={classes.categoryTitle}>Federal</Typography>
        <Box>
          {categoriasFederais.map((cert) => (
            <Box key={cert.id} display="inline-flex" alignItems="center" mr={1} mb={1}>
              <Chip
                label={cert.label}
                onClick={() => toggleCertidao(cert.id)}
                color={certidoesSelecionadas.includes(cert.id) ? "primary" : "default"}
                className={classes.certidaoChip}
                size="small"
              />
              {cert.badge && (
                <Chip
                  label={cert.badge}
                  size="small"
                  style={{
                    marginLeft: 4,
                    height: 20,
                    fontSize: 10,
                    backgroundColor: cert.badge === "Gov.br" ? "#1351b4" : "#2e7d32",
                    color: "white",
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
          ))}
        </Box>
      </Box>

      <Box className={classes.certidaoCategory}>
        <Typography className={classes.categoryTitle}>Estadual</Typography>
        <Box>
          {categoriasEstaduais.map((cert) => (
            <Box key={cert.id} display="inline-flex" alignItems="center" mr={1} mb={1}>
              <Chip
                label={cert.label}
                onClick={() => toggleCertidao(cert.id)}
                color={certidoesSelecionadas.includes(cert.id) ? "primary" : "default"}
                className={classes.certidaoChip}
                size="small"
              />
              {cert.badge && (
                <Chip
                  label={cert.badge}
                  size="small"
                  style={{
                    marginLeft: 4,
                    height: 20,
                    fontSize: 10,
                    backgroundColor: cert.badge === "Gov.br" ? "#1351b4" : "#2e7d32",
                    color: "white",
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
          ))}
        </Box>
      </Box>

      <Box className={classes.certidaoCategory}>
        <Typography className={classes.categoryTitle}>Municipal</Typography>
        <Box>
          {categoriasMunicipais.map((cert) => (
            <Box key={cert.id} display="inline-flex" alignItems="center" mr={1} mb={1}>
              <Chip
                label={cert.label}
                onClick={() => toggleCertidao(cert.id)}
                color={certidoesSelecionadas.includes(cert.id) ? "primary" : "default"}
                className={classes.certidaoChip}
                size="small"
              />
              {cert.badge && (
                <Chip
                  label={cert.badge}
                  size="small"
                  style={{
                    marginLeft: 4,
                    height: 20,
                    fontSize: 10,
                    backgroundColor: cert.badge === "Gov.br" ? "#1351b4" : "#2e7d32",
                    color: "white",
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
          ))}
        </Box>
      </Box>

      <Box mt={2}>
        <Typography variant="caption" color="textSecondary">
          {certidoesSelecionadas.length} certidão(ões) selecionada(s)
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle className={classes.dialogTitle}>
        {clienteData ? "Editar Cliente" : "Novo Cliente"}
      </DialogTitle>

      <DialogContent className={classes.dialogContent}>
        {/* Tipo de Cliente */}
        <Typography className={classes.sectionTitle}>Tipo de Cliente</Typography>
        <Box className={classes.tipoClienteBox}>
          <Box
            className={`${classes.tipoButton} ${
              tipoCliente === "juridica" ? classes.tipoButtonActive : ""
            }`}
            onClick={() => setTipoCliente("juridica")}
          >
            <BusinessIcon style={{ fontSize: 40, color: "#065183" }} />
            <Typography variant="body2" style={{ fontWeight: 600, marginTop: 8 }}>
              Pessoa Jurídica
            </Typography>
          </Box>
          <Box
            className={`${classes.tipoButton} ${
              tipoCliente === "fisica" ? classes.tipoButtonActive : ""
            }`}
            onClick={() => setTipoCliente("fisica")}
          >
            <PersonIcon style={{ fontSize: 40, color: "#065183" }} />
            <Typography variant="body2" style={{ fontWeight: 600, marginTop: 8 }}>
              Pessoa Física
            </Typography>
          </Box>
        </Box>

        <Divider style={{ marginBottom: 16 }} />

        {/* Dados Básicos */}
        <Typography className={classes.sectionTitle}>Dados Básicos</Typography>
        <Grid container spacing={2}>
          {tipoCliente === "juridica" ? (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="CNPJ"
                  fullWidth
                  value={cnpj}
                  onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                  variant="outlined"
                  size="small"
                  inputProps={{ maxLength: 18 }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  className={classes.buscarCnpjButton}
                  startIcon={buscandoCnpj ? <CircularProgress size={16} /> : <SearchIcon />}
                  onClick={buscarCNPJ}
                  disabled={buscandoCnpj || !cnpj}
                >
                  {buscandoCnpj ? "Buscando..." : "Buscar CNPJ"}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Razão Social"
                  fullWidth
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  variant="outlined"
                  size="small"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Nome Fantasia"
                  fullWidth
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  variant="outlined"
                  size="small"
                  required
                />
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="CPF"
                  fullWidth
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  variant="outlined"
                  size="small"
                  required
                  inputProps={{ maxLength: 14 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nome Completo"
                  fullWidth
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  variant="outlined"
                  size="small"
                  required
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <TextField
              label="Endereço"
              fullWidth
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="CEP"
              fullWidth
              value={cep}
              onChange={(e) => setCep(formatCEP(e.target.value))}
              variant="outlined"
              size="small"
              inputProps={{ maxLength: 9 }}
            />
          </Grid>

          <Grid item xs={12} sm={5}>
            <TextField
              label="Cidade"
              fullWidth
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                label="Estado"
              >
                <MenuItem value="">Selecione</MenuItem>
                <MenuItem value="AC">AC</MenuItem>
                <MenuItem value="AL">AL</MenuItem>
                <MenuItem value="AP">AP</MenuItem>
                <MenuItem value="AM">AM</MenuItem>
                <MenuItem value="BA">BA</MenuItem>
                <MenuItem value="CE">CE</MenuItem>
                <MenuItem value="DF">DF</MenuItem>
                <MenuItem value="ES">ES</MenuItem>
                <MenuItem value="GO">GO</MenuItem>
                <MenuItem value="MA">MA</MenuItem>
                <MenuItem value="MT">MT</MenuItem>
                <MenuItem value="MS">MS</MenuItem>
                <MenuItem value="MG">MG</MenuItem>
                <MenuItem value="PA">PA</MenuItem>
                <MenuItem value="PB">PB</MenuItem>
                <MenuItem value="PR">PR</MenuItem>
                <MenuItem value="PE">PE</MenuItem>
                <MenuItem value="PI">PI</MenuItem>
                <MenuItem value="RJ">RJ</MenuItem>
                <MenuItem value="RN">RN</MenuItem>
                <MenuItem value="RS">RS</MenuItem>
                <MenuItem value="RO">RO</MenuItem>
                <MenuItem value="RR">RR</MenuItem>
                <MenuItem value="SC">SC</MenuItem>
                <MenuItem value="SP">SP</MenuItem>
                <MenuItem value="SE">SE</MenuItem>
                <MenuItem value="TO">TO</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="E-mail"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              size="small"
              type="email"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Telefone"
              fullWidth
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>
        </Grid>

        {/* Certidões */}
        {renderCertidoesSection()}
      </DialogContent>

      <DialogActions style={{ padding: 16 }}>
        <Button onClick={handleClose} color="default">
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClienteCertidaoModal;
