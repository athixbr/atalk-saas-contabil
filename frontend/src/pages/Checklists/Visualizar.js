import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Divider,
} from "@material-ui/core";
import {
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  InsertDriveFile as FileIcon,
} from "@material-ui/icons";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { useHistory, useParams } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";

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
  itemCard: {
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
  },
  itemHeader: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  itemNumber: {
    backgroundColor: theme.palette.primary.main,
    color: "white",
    width: 32,
    height: 32,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  obrigatorioChip: {
    backgroundColor: "#f44336",
    color: "white",
  },
  filePreview: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
  },
  fileImage: {
    maxWidth: "100%",
    maxHeight: 400,
    borderRadius: theme.shape.borderRadius,
  },
  infoRow: {
    display: "flex",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  infoLabel: {
    fontWeight: "bold",
    minWidth: 100,
  },
}));

const Visualizar = () => {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams();

  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && !isNaN(Number(id))) {
      loadChecklist();
    } else if (id) {
      history.push("/checklists");
    }
  }, [id]);

  const loadChecklist = async () => {
    try {
      const { data } = await api.get(`/checklists/${id}`);
      setChecklist(data);
    } catch (err) {
      console.error("Erro ao carregar checklist:", err);
      toast.error("Erro ao carregar checklist");
      history.push("/checklists");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    history.push(`/checklists/cadastro/${id}`);
  };

  if (loading) {
    return (
      <MainContainer>
        <MainHeader>
          <Title>Checklist</Title>
        </MainHeader>
        <Paper className={classes.mainPaper} variant="outlined">
          <Typography>Carregando...</Typography>
        </Paper>
      </MainContainer>
    );
  }

  if (!checklist) {
    return (
      <MainContainer>
        <MainHeader>
          <Title>Checklist</Title>
        </MainHeader>
        <Paper className={classes.mainPaper} variant="outlined">
          <Typography>Checklist não encontrado</Typography>
        </Paper>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <MainHeader>
        <Title>Visualizar Checklist</Title>
        <MainHeaderButtonsWrapper>
          <Button variant="outlined" onClick={() => history.push("/checklists")}>
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
          <Typography variant="h5" gutterBottom>
            {checklist.titulo}
          </Typography>

          <Box className={classes.infoRow}>
            <Typography className={classes.infoLabel}>Status:</Typography>
            <Chip
              label={checklist.ativo ? "Ativo" : "Inativo"}
              size="small"
              color={checklist.ativo ? "primary" : "default"}
            />
          </Box>

          <Box className={classes.infoRow}>
            <Typography className={classes.infoLabel}>Tipo:</Typography>
            <Typography>{checklist.tipo || "Padrão"}</Typography>
          </Box>

          {checklist.descricao && (
            <Box className={classes.infoRow}>
              <Typography className={classes.infoLabel}>Descrição:</Typography>
              <Typography>{checklist.descricao}</Typography>
            </Box>
          )}

          <Box className={classes.infoRow}>
            <Typography className={classes.infoLabel}>Criado por:</Typography>
            <Typography>{checklist.creator?.name || "-"}</Typography>
          </Box>

          {checklist.updater && (
            <Box className={classes.infoRow}>
              <Typography className={classes.infoLabel}>
                Atualizado por:
              </Typography>
              <Typography>{checklist.updater?.name || "-"}</Typography>
            </Box>
          )}
        </Box>

        <Divider />

        {/* Itens do Checklist */}
        <Box className={classes.section} style={{ marginTop: 24 }}>
          <Typography variant="h6" gutterBottom>
            Itens do Checklist ({checklist.itens?.length || 0})
          </Typography>

          {!checklist.itens || checklist.itens.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              Nenhum item adicionado
            </Typography>
          ) : (
            checklist.itens.map((item) => (
              <Card key={item.id} className={classes.itemCard}>
                <CardContent>
                  <Box className={classes.itemHeader}>
                    <Box className={classes.itemNumber}>{item.ordem}</Box>
                    <Typography variant="h6">{item.titulo}</Typography>
                    {item.obrigatorio && (
                      <Chip
                        label="Obrigatório"
                        size="small"
                        className={classes.obrigatorioChip}
                      />
                    )}
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="textSecondary">
                        Tipo: <strong>{item.tipo}</strong>
                      </Typography>
                    </Grid>
                  </Grid>

                  {item.descricao && (
                    <Box mt={2}>
                      <Typography variant="body2" color="textSecondary">
                        Descrição/Instrução:
                      </Typography>
                      <Typography variant="body1">{item.descricao}</Typography>
                    </Box>
                  )}

                  {/* Preview de Arquivo */}
                  {item.arquivoUrl && (
                    <Box className={classes.filePreview}>
                      {item.tipo === "imagem" && (
                        <Box>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            gutterBottom
                          >
                            Imagem anexada:
                          </Typography>
                          <img
                            src={item.arquivoUrl}
                            alt={item.arquivoNome}
                            className={classes.fileImage}
                          />
                        </Box>
                      )}

                      {item.tipo === "video" && (
                        <Box>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            gutterBottom
                          >
                            Vídeo anexado:
                          </Typography>
                          <video
                            src={item.arquivoUrl}
                            controls
                            className={classes.fileImage}
                          />
                        </Box>
                      )}

                      {item.tipo === "arquivo" && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <FileIcon />
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              Arquivo anexado:
                            </Typography>
                            <Typography variant="body1">
                              <a
                                href={item.arquivoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {item.arquivoNome}
                              </a>
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      </Paper>
    </MainContainer>
  );
};

export default Visualizar;
