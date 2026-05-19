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
  Card,
  CardContent,
  IconButton,
} from "@material-ui/core";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@material-ui/icons";
import { useHistory, useParams } from "react-router-dom";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import api from "../../services/api";
import { toast } from "react-toastify";

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
  competenciaCard: {
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
  },
}));

const PerfilCargoPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const { userId } = useParams();

  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    // Informações Básicas
    codigoCargo: "",
    dataEmissao: "",
    revisao: "",
    dataRevisao: "",
    
    // Cargo e Função
    cargo: "",
    funcao: "",
    cbo: "",
    
    // Hierarquia
    setor: "",
    superiorImediato: "",
    subordinados: "",
    
    // Descrições
    missaoCargo: "",
    descricaoSumaria: "",
    
    // Competências Comportamentais (array de objetos)
    competenciasComportamentais: [],
    
    // Competências Técnicas
    formacaoObrigatoria: "",
    formacaoDesejavel: "",
    conhecimentosTecnicos: "",
    conhecimentosDesejaveis: "",
    
    // Atividades e Resultados
    descricaoAtividades: "",
    responsabilidadesComplementares: "",
    resultadosEsperados: "",
  });

  const [newCompetencia, setNewCompetencia] = useState({ competencia: "", significado: "" });

  useEffect(() => {
    fetchUserData();
    fetchPerfilCargo();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const { data } = await api.get(`/users/${userId}`);
      setUserData(data);
    } catch (error) {
      toast.error("Erro ao carregar dados do usuário");
      console.error(error);
    }
  };

  const fetchPerfilCargo = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/perfil-cargo/${userId}`);
      if (data) {
        setFormData({
          codigoCargo: data.codigoCargo || "",
          dataEmissao: data.dataEmissao || "",
          revisao: data.revisao || "",
          dataRevisao: data.dataRevisao || "",
          cargo: data.cargo || "",
          funcao: data.funcao || "",
          cbo: data.cbo || "",
          setor: data.setor || "",
          superiorImediato: data.superiorImediato || "",
          subordinados: data.subordinados || "",
          missaoCargo: data.missaoCargo || "",
          descricaoSumaria: data.descricaoSumaria || "",
          competenciasComportamentais: data.competenciasComportamentais || [],
          formacaoObrigatoria: data.formacaoObrigatoria || "",
          formacaoDesejavel: data.formacaoDesejavel || "",
          conhecimentosTecnicos: data.conhecimentosTecnicos || "",
          conhecimentosDesejaveis: data.conhecimentosDesejaveis || "",
          descricaoAtividades: data.descricaoAtividades || "",
          responsabilidadesComplementares: data.responsabilidadesComplementares || "",
          resultadosEsperados: data.resultadosEsperados || "",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar perfil de cargo:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddCompetencia = () => {
    if (!newCompetencia.competencia.trim() || !newCompetencia.significado.trim()) {
      toast.warning("Preencha a competência e o significado");
      return;
    }

    setFormData({
      ...formData,
      competenciasComportamentais: [
        ...formData.competenciasComportamentais,
        { ...newCompetencia },
      ],
    });
    setNewCompetencia({ competencia: "", significado: "" });
  };

  const handleRemoveCompetencia = (index) => {
    const updated = formData.competenciasComportamentais.filter((_, i) => i !== index);
    setFormData({ ...formData, competenciasComportamentais: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      await api.post(`/perfil-cargo/${userId}`, formData);
      toast.success("Perfil de cargo salvo com sucesso!");
      history.push("/users");
    } catch (error) {
      toast.error("Erro ao salvar perfil de cargo");
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    history.push("/users");
  };

  if (!userData) {
    return null;
  }

  return (
    <MainContainer>
      <MainHeader>
        <Title>Perfil de Cargo - {userData.name}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleCancel}
          >
            Voltar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={loading}
          >
            Salvar
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <form onSubmit={handleSubmit}>
          {/* INFORMAÇÕES BÁSICAS */}
          <Typography variant="h6" className={classes.sectionTitle}>
            Informações Básicas
          </Typography>
          <Grid container spacing={2} className={classes.formSection}>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Código do Cargo"
                value={formData.codigoCargo}
                onChange={(e) => handleInputChange("codigoCargo", e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="Ex: 012"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Data de Emissão"
                type="date"
                value={formData.dataEmissao}
                onChange={(e) => handleInputChange("dataEmissao", e.target.value)}
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Revisão"
                value={formData.revisao}
                onChange={(e) => handleInputChange("revisao", e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="Ex: 01"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Data da Revisão"
                type="date"
                value={formData.dataRevisao}
                onChange={(e) => handleInputChange("dataRevisao", e.target.value)}
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <Divider />

          {/* CARGO E FUNÇÃO */}
          <Typography variant="h6" className={classes.sectionTitle}>
            Cargo e Função
          </Typography>
          <Grid container spacing={2} className={classes.formSection}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Cargo"
                value={formData.cargo}
                onChange={(e) => handleInputChange("cargo", e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="Ex: Coordenador"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Função"
                value={formData.funcao}
                onChange={(e) => handleInputChange("funcao", e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="Ex: Coordenador Sênior Fiscal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="CBO (Classificação Brasileira de Ocupações)"
                value={formData.cbo}
                onChange={(e) => handleInputChange("cbo", e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="Ex: 4131-10"
              />
            </Grid>
          </Grid>

          <Divider />

          {/* HIERARQUIA */}
          <Typography variant="h6" className={classes.sectionTitle}>
            Hierarquia
          </Typography>
          <Grid container spacing={2} className={classes.formSection}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Setor"
                value={formData.setor}
                onChange={(e) => handleInputChange("setor", e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="Ex: Departamento Fiscal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Superior Imediato"
                value={formData.superiorImediato}
                onChange={(e) => handleInputChange("superiorImediato", e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="Ex: Diretoria Executiva"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Subordinados"
                value={formData.subordinados}
                onChange={(e) => handleInputChange("subordinados", e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="Ex: Coordenadores Juniores"
              />
            </Grid>
          </Grid>

          <Divider />

          {/* MISSÃO E DESCRIÇÃO */}
          <Typography variant="h6" className={classes.sectionTitle}>
            Missão e Descrição do Cargo
          </Typography>
          <div className={classes.formSection}>
            <TextField
              label="Missão do Cargo"
              value={formData.missaoCargo}
              onChange={(e) => handleInputChange("missaoCargo", e.target.value)}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Descreva a missão principal do cargo..."
            />
          </div>
          <div className={classes.formSection}>
            <TextField
              label="Descrição Sumária"
              value={formData.descricaoSumaria}
              onChange={(e) => handleInputChange("descricaoSumaria", e.target.value)}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Descrição geral das responsabilidades e características do cargo..."
            />
          </div>

          <Divider />

          {/* COMPETÊNCIAS COMPORTAMENTAIS */}
          <Typography variant="h6" className={classes.sectionTitle}>
            Competências Comportamentais
          </Typography>
          
          <Box display="flex" gap={2} alignItems="flex-start" mb={2}>
            <TextField
              label="Competência"
              value={newCompetencia.competencia}
              onChange={(e) => setNewCompetencia({ ...newCompetencia, competencia: e.target.value })}
              variant="outlined"
              placeholder="Ex: Demonstrar Comunicação Assertiva"
              style={{ flex: 1 }}
            />
            <TextField
              label="Significado/Descrição"
              value={newCompetencia.significado}
              onChange={(e) => setNewCompetencia({ ...newCompetencia, significado: e.target.value })}
              variant="outlined"
              multiline
              rows={1}
              placeholder="Descreva o que significa essa competência..."
              style={{ flex: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddCompetencia}
              style={{ height: "56px" }}
            >
              Adicionar
            </Button>
          </Box>

          {formData.competenciasComportamentais.map((comp, index) => (
            <Card key={index} className={classes.competenciaCard}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box flex={1}>
                    <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                      {comp.competencia}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {comp.significado}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={() => handleRemoveCompetencia(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}

          <Divider style={{ marginTop: 24 }} />

          {/* COMPETÊNCIAS TÉCNICAS */}
          <Typography variant="h6" className={classes.sectionTitle}>
            Competências Técnicas
          </Typography>
          
          <div className={classes.formSection}>
            <TextField
              label="Formação Obrigatória"
              value={formData.formacaoObrigatoria}
              onChange={(e) => handleInputChange("formacaoObrigatoria", e.target.value)}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Descreva a formação acadêmica e experiências obrigatórias..."
            />
          </div>

          <div className={classes.formSection}>
            <TextField
              label="Formação Desejável"
              value={formData.formacaoDesejavel}
              onChange={(e) => handleInputChange("formacaoDesejavel", e.target.value)}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Descreva formações e certificações desejáveis..."
            />
          </div>

          <div className={classes.formSection}>
            <TextField
              label="Conhecimentos Técnicos Obrigatórios"
              value={formData.conhecimentosTecnicos}
              onChange={(e) => handleInputChange("conhecimentosTecnicos", e.target.value)}
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              placeholder="Liste os conhecimentos técnicos obrigatórios..."
            />
          </div>

          <div className={classes.formSection}>
            <TextField
              label="Conhecimentos Desejáveis"
              value={formData.conhecimentosDesejaveis}
              onChange={(e) => handleInputChange("conhecimentosDesejaveis", e.target.value)}
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              placeholder="Liste os conhecimentos desejáveis..."
            />
          </div>

          <Divider />

          {/* ATIVIDADES E RESPONSABILIDADES */}
          <Typography variant="h6" className={classes.sectionTitle}>
            Atividades e Responsabilidades
          </Typography>

          <div className={classes.formSection}>
            <TextField
              label="Descrição das Atividades"
              value={formData.descricaoAtividades}
              onChange={(e) => handleInputChange("descricaoAtividades", e.target.value)}
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              placeholder="Descreva as atividades principais do cargo..."
            />
          </div>

          <div className={classes.formSection}>
            <TextField
              label="Responsabilidades Complementares"
              value={formData.responsabilidadesComplementares}
              onChange={(e) => handleInputChange("responsabilidadesComplementares", e.target.value)}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Descreva responsabilidades adicionais..."
            />
          </div>

          <Divider />

          {/* RESULTADOS ESPERADOS */}
          <Typography variant="h6" className={classes.sectionTitle}>
            Resultados Esperados
          </Typography>

          <div className={classes.formSection}>
            <TextField
              label="Resultados Esperados"
              value={formData.resultadosEsperados}
              onChange={(e) => handleInputChange("resultadosEsperados", e.target.value)}
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              placeholder="Descreva os resultados esperados para este cargo..."
            />
          </div>
        </form>
      </Paper>
    </MainContainer>
  );
};

export default PerfilCargoPage;
