import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Typography,
  Button,
  Divider,
  Box,
  Chip,
  CircularProgress,
  Card,
  CardContent,
} from "@material-ui/core";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
} from "@material-ui/icons";
import { useHistory, useParams } from "react-router-dom";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import api from "../../services/api";
import { toast } from "react-toastify";
import { getImageUrl } from "../../helpers/imageHelper";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(3),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  section: {
    marginBottom: theme.spacing(3),
  },
  sectionTitle: {
    marginBottom: theme.spacing(2),
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
  infoRow: {
    display: "flex",
    marginBottom: theme.spacing(1),
  },
  infoLabel: {
    fontWeight: 600,
    minWidth: 150,
    color: theme.palette.text.secondary,
  },
  infoValue: {
    flex: 1,
  },
  checklistCard: {
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
  },
  checklistNumber: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 600,
    marginRight: theme.spacing(1),
  },
  imagePreview: {
    maxWidth: "100%",
    maxHeight: 300,
    marginTop: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 400,
  },
}));

const TarefasVisualizarPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [tarefa, setTarefa] = useState(null);

  useEffect(() => {
    fetchTarefa();
  }, [id]);

  const fetchTarefa = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/tarefas-config/${id}`);
      setTarefa(data);
    } catch (error) {
      toast.error("Erro ao carregar tarefa");
      console.error("Erro ao buscar tarefa:", error);
      history.push("/tarefas-config");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    history.push(`/tarefas-config/cadastro/${id}`);
  };

  const handleBack = () => {
    history.push("/tarefas-config");
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

  if (!tarefa) {
    return null;
  }

  return (
    <MainContainer>
      <MainHeader>
        <Title>Visualizar Tarefa</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Voltar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Editar
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        {/* Informações Básicas */}
        <Box className={classes.section}>
          <Typography variant="h6" className={classes.sectionTitle}>
            Informações Básicas
          </Typography>
          <Box className={classes.infoRow}>
            <Typography className={classes.infoLabel}>Título:</Typography>
            <Typography className={classes.infoValue}>{tarefa.titulo}</Typography>
          </Box>
          {tarefa.descricao && (
            <Box className={classes.infoRow}>
              <Typography className={classes.infoLabel}>Descrição:</Typography>
              <Typography className={classes.infoValue}>{tarefa.descricao}</Typography>
            </Box>
          )}
          <Box className={classes.infoRow}>
            <Typography className={classes.infoLabel}>Departamento:</Typography>
            <Typography className={classes.infoValue}>
              <Chip label={tarefa.departamento?.nome || "N/A"} color="primary" size="small" />
            </Typography>
          </Box>
          <Box className={classes.infoRow}>
            <Typography className={classes.infoLabel}>Status:</Typography>
            <Typography className={classes.infoValue}>
              <Chip
                label={tarefa.ativo ? "Ativo" : "Inativo"}
                color={tarefa.ativo ? "primary" : "default"}
                size="small"
              />
            </Typography>
          </Box>
          <Box className={classes.infoRow}>
            <Typography className={classes.infoLabel}>Aceita Arquivos:</Typography>
            <Typography className={classes.infoValue}>
              <Chip
                label={tarefa.aceitaArquivos ? "Sim" : "Não"}
                color={tarefa.aceitaArquivos ? "primary" : "default"}
                size="small"
              />
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Configurações de Vencimento */}
        <Box className={classes.section} style={{ marginTop: 24 }}>
          <Typography variant="h6" className={classes.sectionTitle}>
            Configurações de Vencimento
          </Typography>
          <Box className={classes.infoRow}>
            <Typography className={classes.infoLabel}>Possui Vencimento:</Typography>
            <Typography className={classes.infoValue}>
              <Chip
                label={tarefa.temVencimento ? "Sim" : "Não"}
                color={tarefa.temVencimento ? "primary" : "default"}
                size="small"
              />
            </Typography>
          </Box>
          
          {!tarefa.temVencimento && (
            <Box className={classes.infoRow}>
              <Typography className={classes.infoValue} color="textSecondary" style={{ fontStyle: "italic" }}>
                💡 Esta tarefa não possui prazo definido - útil para tarefas genéricas e procedimentos sem data limite
              </Typography>
            </Box>
          )}
          
          {tarefa.temVencimento && (
            <>
              <Box style={{ marginTop: 16, marginBottom: 8 }}>
                <Typography variant="subtitle2" style={{ fontWeight: 600, color: "#666" }}>
                  Configurações de Prazo:
                </Typography>
              </Box>
              <Box className={classes.infoRow}>
                <Typography className={classes.infoLabel}>Dias para Vencimento:</Typography>
                <Typography className={classes.infoValue}>
                  <strong>{tarefa.diasParaVencimento} dias</strong>
                </Typography>
              </Box>
              <Box className={classes.infoRow}>
                <Typography className={classes.infoLabel}>Status Inicial:</Typography>
                <Typography className={classes.infoValue}>
                  {tarefa.status?.nome ? (
                    <Chip
                      label={tarefa.status.nome}
                      size="small"
                      style={{
                        backgroundColor: tarefa.status.cor,
                        color: "#fff",
                      }}
                    />
                  ) : (
                    "N/A"
                  )}
                </Typography>
              </Box>
              <Box className={classes.infoRow}>
                <Typography className={classes.infoLabel}>Sábado é dia útil:</Typography>
                <Typography className={classes.infoValue}>
                  <Chip
                    label={tarefa.sabadoUtil ? "Sim" : "Não"}
                    color={tarefa.sabadoUtil ? "primary" : "default"}
                    size="small"
                  />
                </Typography>
              </Box>
              {tarefa.diasNaoUteis && (
                <Box className={classes.infoRow}>
                  <Typography className={classes.infoLabel}>Dias Não Úteis:</Typography>
                  <Typography className={classes.infoValue}>
                    <Chip label={tarefa.diasNaoUteis} size="small" color="default" />
                  </Typography>
                </Box>
              )}
              
              {tarefa.diasLembrete && (
                <>
                  <Box style={{ marginTop: 16, marginBottom: 8 }}>
                    <Typography variant="subtitle2" style={{ fontWeight: 600, color: "#666" }}>
                      Configurações de Lembrete:
                    </Typography>
                  </Box>
                  <Box className={classes.infoRow}>
                    <Typography className={classes.infoLabel}>Dias para Lembrar:</Typography>
                    <Typography className={classes.infoValue}>
                      <strong>{tarefa.diasLembrete} dias antes</strong>
                    </Typography>
                  </Box>
                  <Box className={classes.infoRow}>
                    <Typography className={classes.infoLabel}>Prazo do Lembrete:</Typography>
                    <Typography className={classes.infoValue}>
                      {tarefa.prazo?.nome ? (
                        <Chip
                          label={tarefa.prazo.nome}
                          size="small"
                          style={{
                            backgroundColor: tarefa.prazo.cor,
                            color: "#fff",
                          }}
                        />
                      ) : (
                        "N/A"
                      )}
                    </Typography>
                  </Box>
                </>
              )}
            </>
          )}
        </Box>

        <Divider />

        {/* Informações Adicionais */}
        <Box className={classes.section} style={{ marginTop: 24 }}>
          <Typography variant="h6" className={classes.sectionTitle}>
            Informações Adicionais
          </Typography>
          <Box className={classes.infoRow}>
            <Typography className={classes.infoLabel}>Tarefa Interna:</Typography>
            <Typography className={classes.infoValue}>
              <Chip
                label={tarefa.tarefaInterna ? "Sim" : "Não"}
                color={tarefa.tarefaInterna ? "primary" : "default"}
                size="small"
              />
            </Typography>
          </Box>
          {tarefa.valorReferencial && (
            <Box className={classes.infoRow}>
              <Typography className={classes.infoLabel}>Valor Referencial:</Typography>
              <Typography className={classes.infoValue}>
                R$ {parseFloat(tarefa.valorReferencial).toFixed(2).replace('.', ',')}
              </Typography>
            </Box>
          )}
        </Box>

        <Divider />

        {/* Checklist */}
        <Box className={classes.section} style={{ marginTop: 24 }}>
          <Typography variant="h6" className={classes.sectionTitle}>
            Checklist ({tarefa.checklist?.length || 0} itens)
          </Typography>
          {tarefa.checklist && tarefa.checklist.length > 0 ? (
            tarefa.checklist.map((item, index) => (
              <Card key={item.id} className={classes.checklistCard}>
                <CardContent>
                  <Box display="flex" alignItems="flex-start">
                    <Chip
                      label={`#${index + 1}`}
                      size="small"
                      className={classes.checklistNumber}
                    />
                    <Box flex={1}>
                      <Typography variant="body1" style={{ whiteSpace: "pre-wrap" }}>
                        {item.text}
                      </Typography>
                      {item.image && (
                        <Box mt={2}>
                          <img
                            src={getImageUrl(item.image)}
                            alt={`Imagem do item ${index + 1}`}
                            className={classes.imagePreview}
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              Nenhum item no checklist
            </Typography>
          )}
        </Box>
      </Paper>
    </MainContainer>
  );
};

export default TarefasVisualizarPage;
