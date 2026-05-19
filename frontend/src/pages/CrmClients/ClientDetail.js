import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  Paper,
  Typography,
  Grid,
  Chip,
  IconButton,
  Button,
  Divider,
  makeStyles,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText
} from "@material-ui/core";
import {
  ArrowBack,
  Edit,
  Business,
  Phone,
  Email,
  WhatsApp,
  LocationOn,
  Person,
  Assessment,
  Add
} from "@material-ui/icons";
import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import CrmTaskModal from "../../components/CrmTaskModal";
import { getCrmClient } from "../../services/crmClients";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(3),
    margin: theme.spacing(1),
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
  },
  section: {
    marginTop: theme.spacing(3),
  },
  infoCard: {
    marginBottom: theme.spacing(2),
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1),
  },
  icon: {
    marginRight: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  statusChip: {
    fontWeight: "bold",
  },
  taskItem: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
  },
}));

const ClientDetail = () => {
  const classes = useStyles();
  const { clientId } = useParams();
  const history = useHistory();

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  useEffect(() => {
    loadClient();
  }, [clientId]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const data = await getCrmClient(clientId);
      setClient(data);
    } catch (err) {
      console.error("Erro ao carregar cliente:", err);
      toast.error("Erro ao carregar dados do cliente");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    history.push("/crm/clientes");
  };

  const handleEdit = () => {
    // Volta para a lista e abre o modal de edição
    history.push("/crm/clientes", { editClient: client });
  };

  const formatCNPJ = (cnpj) => {
    if (!cnpj) return "";
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  };

  const formatPhone = (phone) => {
    if (!phone) return "";
    if (phone.length === 11) {
      return phone.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return phone.replace(/^(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  };

  if (loading || !client) {
    return (
      <MainContainer>
        <MainHeader>
          <Title>Carregando...</Title>
        </MainHeader>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <MainHeader>
        <IconButton onClick={handleBack}>
          <ArrowBack />
        </IconButton>
        <Title>Detalhes do Cliente</Title>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Edit />}
          onClick={handleEdit}
        >
          Editar
        </Button>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <div className={classes.header}>
          <div>
            <Typography variant="h5" gutterBottom>
              {client.name}
            </Typography>
            {client.companyName && (
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                <Business className={classes.icon} style={{ verticalAlign: "middle" }} />
                {client.companyName}
              </Typography>
            )}
          </div>
          <Chip
            label={client.status === "active" ? "Ativo" : "Inativo"}
            color={client.status === "active" ? "primary" : "default"}
            className={classes.statusChip}
          />
        </div>

        <Divider />

        <Grid container spacing={3} className={classes.section}>
          {/* Informações de Contato */}
          <Grid item xs={12} md={6}>
            <Card className={classes.infoCard}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informações de Contato
                </Typography>
                
                {client.phone && (
                  <div className={classes.infoItem}>
                    <Phone className={classes.icon} />
                    <Typography>{formatPhone(client.phone)}</Typography>
                  </div>
                )}
                
                {client.whatsapp && (
                  <div className={classes.infoItem}>
                    <WhatsApp className={classes.icon} />
                    <Typography>{formatPhone(client.whatsapp)}</Typography>
                  </div>
                )}
                
                {client.email && (
                  <div className={classes.infoItem}>
                    <Email className={classes.icon} />
                    <Typography>{client.email}</Typography>
                  </div>
                )}
                
                {client.cnpj && (
                  <div className={classes.infoItem}>
                    <Assessment className={classes.icon} />
                    <Typography>CNPJ: {formatCNPJ(client.cnpj)}</Typography>
                  </div>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Endereço */}
          <Grid item xs={12} md={6}>
            <Card className={classes.infoCard}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Endereço
                </Typography>
                
                {(client.street || client.city) ? (
                  <>
                    {client.street && (
                      <div className={classes.infoItem}>
                        <LocationOn className={classes.icon} />
                        <Typography>
                          {client.street}
                          {client.number && `, ${client.number}`}
                          {client.complement && ` - ${client.complement}`}
                        </Typography>
                      </div>
                    )}
                    
                    {client.neighborhood && (
                      <div className={classes.infoItem}>
                        <Typography style={{ marginLeft: 32 }}>
                          {client.neighborhood}
                        </Typography>
                      </div>
                    )}
                    
                    {(client.city || client.state) && (
                      <div className={classes.infoItem}>
                        <Typography style={{ marginLeft: 32 }}>
                          {client.city}{client.state && ` - ${client.state}`}
                        </Typography>
                      </div>
                    )}
                    
                    {client.zipCode && (
                      <div className={classes.infoItem}>
                        <Typography style={{ marginLeft: 32 }}>
                          CEP: {client.zipCode}
                        </Typography>
                      </div>
                    )}
                  </>
                ) : (
                  <Typography color="textSecondary">
                    Endereço não informado
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Informações Comerciais */}
          <Grid item xs={12} md={6}>
            <Card className={classes.infoCard}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informações Comerciais
                </Typography>
                
                {client.businessType && (
                  <div className={classes.infoItem}>
                    <Business className={classes.icon} />
                    <Typography>
                      <strong>Tipo de Negócio:</strong> {client.businessType.name}
                    </Typography>
                  </div>
                )}
                
                {client.taxRegime && (
                  <div className={classes.infoItem}>
                    <Assessment className={classes.icon} />
                    <Typography>
                      <strong>Regime Tributário:</strong> {client.taxRegime.name}
                    </Typography>
                  </div>
                )}
                
                {client.user && (
                  <div className={classes.infoItem}>
                    <Person className={classes.icon} />
                    <Typography>
                      <strong>Responsável:</strong> {client.user.name}
                    </Typography>
                  </div>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Observações */}
          {client.notes && (
            <Grid item xs={12} md={6}>
              <Card className={classes.infoCard}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Observações
                  </Typography>
                  <Typography variant="body2" style={{ whiteSpace: "pre-wrap" }}>
                    {client.notes}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Tarefas */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <Typography variant="h6">
                    Tarefas ({client.tasks?.length || 0})
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={() => setTaskModalOpen(true)}
                  >
                    Nova Tarefa
                  </Button>
                </div>
                
                {client.tasks && client.tasks.length > 0 ? (
                  <List>
                    {client.tasks.map((task) => (
                      <ListItem key={task.id} className={classes.taskItem}>
                        <ListItemText
                          primary={task.title}
                          secondary={`Status: ${task.status} | Responsável: ${task.user?.name || "Não atribuído"}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="textSecondary">
                    Nenhuma tarefa cadastrada
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Interações */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Histórico de Interações ({client.interactions?.length || 0})
                </Typography>
                
                {client.interactions && client.interactions.length > 0 ? (
                  <List>
                    {client.interactions.map((interaction) => (
                      <ListItem key={interaction.id}>
                        <ListItemText
                          primary={interaction.description}
                          secondary={`${interaction.type} - ${new Date(interaction.date).toLocaleString("pt-BR")} - ${interaction.user?.name || ""}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="textSecondary">
                    Nenhuma interação registrada
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <CrmTaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSuccess={loadClient}
        clientId={clientId}
      />
    </MainContainer>
  );
};

export default ClientDetail;
