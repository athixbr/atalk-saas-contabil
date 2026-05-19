import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Chip from "@material-ui/core/Chip";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Avatar from "@material-ui/core/Avatar";
import Tooltip from "@material-ui/core/Tooltip";
import { Add, Settings, Visibility, Edit, Delete, Phone, Email, TrendingUp, AccountCircle, Business } from "@material-ui/icons";
import Board from "react-trello";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/Auth/AuthContext";
import { 
  getLeads, 
  getLead,
  createLead, 
  updateLead, 
  deleteLead,
  getStages,
  getBusinessTypes,
  getTaxRegimes,
  getSources
} from "../../services/crmApi";
import api from "../../services/api";
import CRMSettings from "./Settings";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(3),
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
  },
  tabs: {
    marginBottom: theme.spacing(3),
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: theme.spacing(1),
  },
  tab: {
    minWidth: 120,
    fontWeight: 600,
  },
  addButton: {
    background: "linear-gradient(135deg, #0596cd 0%, #047ba5 100%)",
    color: "#fff",
    "&:hover": {
      background: "linear-gradient(135deg, #047ba5 0%, #035c7d 100%)",
    },
  },
  settingsButton: {
    marginLeft: theme.spacing(1),
    background: "linear-gradient(135deg, #757575 0%, #616161 100%)",
    color: "#fff",
    "&:hover": {
      background: "linear-gradient(135deg, #616161 0%, #424242 100%)",
    },
  },
  boardContainer: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: theme.spacing(2),
    minHeight: "500px",
    "& > div": {
      backgroundColor: "transparent",
    },
  },
  cardActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(1),
    paddingTop: theme.spacing(1),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  cardInfo: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
    fontSize: "13px",
    color: theme.palette.text.secondary,
  },
  cardIcon: {
    fontSize: "16px",
  },
  cardAvatar: {
    width: 24,
    height: 24,
    fontSize: "11px",
    marginTop: theme.spacing(1),
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  statCard: {
    padding: theme.spacing(2),
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: "24px",
    fontWeight: 700,
  },
  statLabel: {
    fontSize: "13px",
    color: theme.palette.text.secondary,
  },
}));

const CRM = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [leads, setLeads] = useState([]);
  const [stages, setStages] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [taxRegimes, setTaxRegimes] = useState([]);
  const [sources, setSources] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadForm, setLeadForm] = useState({
    name: "",
    phone: "",
    email: "",
    businessTypeId: "",
    taxRegimeId: "",
    sourceId: "",
    userId: user?.id,
    estimatedValue: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        leadsData,
        stagesData,
        businessTypesData,
        taxRegimesData,
        sourcesData,
        usersData
      ] = await Promise.all([
        getLeads({ status: "active" }),
        getStages({ active: true }),
        getBusinessTypes({ active: true }),
        getTaxRegimes({ active: true }),
        getSources({ active: true }),
        api.get("/users")
      ]);

      setLeads(leadsData);
      setStages(stagesData.sort((a, b) => a.order - b.order));
      setBusinessTypes(businessTypesData);
      setTaxRegimes(taxRegimesData);
      setSources(sourcesData);
      setUsers(usersData.data.users || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados do CRM");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setSelectedLead(null);
    setLeadForm({
      name: "",
      phone: "",
      email: "",
      businessTypeId: "",
      taxRegimeId: "",
      sourceId: "",
      userId: user?.id,
      estimatedValue: "",
      notes: "",
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedLead(null);
  };

  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    setLeadForm({
      name: lead.name || "",
      phone: lead.phone || "",
      email: lead.email || "",
      businessTypeId: lead.businessTypeId || "",
      taxRegimeId: lead.taxRegimeId || "",
      sourceId: lead.sourceId || "",
      userId: lead.userId || "",
      estimatedValue: lead.estimatedValue || "",
      notes: lead.notes || "",
    });
    setModalOpen(true);
  };

  const handleViewLead = async (leadId) => {
    history.push(`/crm/leads/${leadId}`);
  };

  const handleSaveLead = async () => {
    try {
      if (!leadForm.name) {
        toast.error("Nome é obrigatório");
        return;
      }

      if (selectedLead) {
        await updateLead(selectedLead.id, leadForm);
        toast.success("Lead atualizado com sucesso!");
      } else {
        await createLead(leadForm);
        toast.success("Lead criado com sucesso!");
      }

      handleCloseModal();
      loadData();
    } catch (error) {
      console.error("Erro ao salvar lead:", error);
      toast.error("Erro ao salvar lead");
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (window.confirm("Tem certeza que deseja excluir este lead?")) {
      try {
        await deleteLead(leadId);
        toast.success("Lead excluído com sucesso!");
        loadData();
      } catch (error) {
        toast.error("Erro ao excluir lead");
      }
    }
  };

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
    if (sourceLaneId === targetLaneId) return;

    try {
      await updateLead(parseInt(cardId), { stage: targetLaneId });
      toast.success("Lead movido com sucesso!");
      loadData();
    } catch (error) {
      toast.error("Erro ao mover lead");
      loadData();
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getUserInitials = (userName) => {
    if (!userName) return "?";
    const names = userName.split(" ");
    return names.length > 1
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : names[0][0].toUpperCase();
  };

  const calculateStats = () => {
    const total = leads.length;
    const totalValue = leads.reduce((sum, lead) => sum + (parseFloat(lead.estimatedValue) || 0), 0);
    const wonLeads = leads.filter(l => l.status === "won").length;
    const activeLeads = leads.filter(l => l.status === "active").length;

    return { total, totalValue, wonLeads, activeLeads };
  };

  const stats = calculateStats();

  const buildBoardData = () => {
    const lanes = stages.map((stage) => {
      const stageLeads = leads.filter(lead => lead.stage === stage.name.toLowerCase());
      
      return {
        id: stage.name.toLowerCase(),
        title: stage.name,
        label: `${stageLeads.length}`,
        style: {
          backgroundColor: "#f5f5f5",
          borderRadius: "12px",
          minWidth: "300px",
        },
        cards: stageLeads.map((lead) => ({
          id: lead.id.toString(),
          title: lead.name,
          description: renderCardDescription(lead),
          label: lead.estimatedValue ? formatCurrency(lead.estimatedValue) : "",
          metadata: lead,
        })),
      };
    });

    return { lanes };
  };

  const renderCardDescription = (lead) => {
    return (
      <div>
        {lead.phone && (
          <div className={classes.cardInfo}>
            <Phone className={classes.cardIcon} />
            <span>{lead.phone}</span>
          </div>
        )}
        {lead.email && (
          <div className={classes.cardInfo}>
            <Email className={classes.cardIcon} />
            <span>{lead.email}</span>
          </div>
        )}
        {lead.source && (
          <div className={classes.cardInfo}>
            <TrendingUp className={classes.cardIcon} />
            <span>{lead.source.name}</span>
          </div>
        )}
        {lead.user && (
          <Tooltip title={lead.user.name}>
            <Avatar className={classes.cardAvatar}>
              {getUserInitials(lead.user.name)}
            </Avatar>
          </Tooltip>
        )}
        <div className={classes.cardActions}>
          <IconButton size="small" onClick={() => handleViewLead(lead.id)}>
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleEditLead(lead)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDeleteLead(lead.id)}>
            <Delete fontSize="small" />
          </IconButton>
        </div>
      </div>
    );
  };

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <div>
          <Typography variant="h4" gutterBottom>
            CRM - Pipeline de Vendas
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gestão de leads e oportunidades
          </Typography>
        </div>
        <div>
          <Button
            variant="contained"
            className={classes.addButton}
            startIcon={<Add />}
            onClick={handleOpenModal}
          >
            Novo Lead
          </Button>
          <Button
            variant="contained"
            className={classes.settingsButton}
            startIcon={<Settings />}
            onClick={() => setTabValue(1)}
          >
            Configurações
          </Button>
        </div>
      </div>

      <Paper className={classes.tabs} elevation={0}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Pipeline" className={classes.tab} />
          <Tab label="Configurações" className={classes.tab} />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <>
          <div className={classes.statsContainer}>
            <Paper className={classes.statCard} elevation={0}>
              <div className={classes.statIcon} style={{ backgroundColor: "#E3F2FD" }}>
                <TrendingUp style={{ color: "#2196F3" }} />
              </div>
              <div className={classes.statContent}>
                <Typography className={classes.statValue}>{stats.total}</Typography>
                <Typography className={classes.statLabel}>Total de Leads</Typography>
              </div>
            </Paper>

            <Paper className={classes.statCard} elevation={0}>
              <div className={classes.statIcon} style={{ backgroundColor: "#E8F5E9" }}>
                <AccountCircle style={{ color: "#4CAF50" }} />
              </div>
              <div className={classes.statContent}>
                <Typography className={classes.statValue}>{stats.activeLeads}</Typography>
                <Typography className={classes.statLabel}>Leads Ativos</Typography>
              </div>
            </Paper>

            <Paper className={classes.statCard} elevation={0}>
              <div className={classes.statIcon} style={{ backgroundColor: "#FFF3E0" }}>
                <Business style={{ color: "#FF9800" }} />
              </div>
              <div className={classes.statContent}>
                <Typography className={classes.statValue}>{stats.wonLeads}</Typography>
                <Typography className={classes.statLabel}>Leads Ganhos</Typography>
              </div>
            </Paper>

            <Paper className={classes.statCard} elevation={0}>
              <div className={classes.statIcon} style={{ backgroundColor: "#F3E5F5" }}>
                <TrendingUp style={{ color: "#9C27B0" }} />
              </div>
              <div className={classes.statContent}>
                <Typography className={classes.statValue}>{formatCurrency(stats.totalValue)}</Typography>
                <Typography className={classes.statLabel}>Valor Total</Typography>
              </div>
            </Paper>
          </div>

          <div className={classes.boardContainer}>
            <Board
              data={buildBoardData()}
              draggable
              editable={false}
              canAddLanes={false}
              onCardMoveAcrossLanes={handleCardMove}
              hideCardDeleteIcon
              style={{
                backgroundColor: "transparent",
                height: "auto",
                fontFamily: "Roboto, sans-serif",
              }}
              laneStyle={{
                backgroundColor: "#f5f5f5",
                borderRadius: "12px",
                minWidth: "300px",
              }}
              cardStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                marginBottom: "12px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            />
          </div>
        </>
      )}

      {tabValue === 1 && <CRMSettings />}

      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedLead ? "Editar Lead" : "Novo Lead"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: 8 }}>
            <Grid item xs={12}>
              <TextField
                label="Nome *"
                fullWidth
                value={leadForm.name}
                onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Telefone"
                fullWidth
                value={leadForm.phone}
                onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="E-mail"
                fullWidth
                type="email"
                value={leadForm.email}
                onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Negócio</InputLabel>
                <Select
                  value={leadForm.businessTypeId}
                  onChange={(e) => setLeadForm({ ...leadForm, businessTypeId: e.target.value })}
                >
                  <MenuItem value="">
                    <em>Nenhum</em>
                  </MenuItem>
                  {businessTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Regime Tributário</InputLabel>
                <Select
                  value={leadForm.taxRegimeId}
                  onChange={(e) => setLeadForm({ ...leadForm, taxRegimeId: e.target.value })}
                >
                  <MenuItem value="">
                    <em>Nenhum</em>
                  </MenuItem>
                  {taxRegimes.map((regime) => (
                    <MenuItem key={regime.id} value={regime.id}>
                      {regime.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Fonte do Lead</InputLabel>
                <Select
                  value={leadForm.sourceId}
                  onChange={(e) => setLeadForm({ ...leadForm, sourceId: e.target.value })}
                >
                  <MenuItem value="">
                    <em>Nenhum</em>
                  </MenuItem>
                  {sources.map((source) => (
                    <MenuItem key={source.id} value={source.id}>
                      {source.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Responsável</InputLabel>
                <Select
                  value={leadForm.userId}
                  onChange={(e) => setLeadForm({ ...leadForm, userId: e.target.value })}
                >
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Valor Estimado"
                fullWidth
                type="number"
                value={leadForm.estimatedValue}
                onChange={(e) => setLeadForm({ ...leadForm, estimatedValue: e.target.value })}
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>R$</span>,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Observações"
                fullWidth
                multiline
                rows={4}
                value={leadForm.notes}
                onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button
            onClick={handleSaveLead}
            variant="contained"
            className={classes.addButton}
          >
            {selectedLead ? "Atualizar" : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalhes do Lead</DialogTitle>
        <DialogContent>
          {selectedLead && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">{selectedLead.name}</Typography>
              </Grid>
              {selectedLead.phone && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Telefone</Typography>
                  <Typography variant="body1">{selectedLead.phone}</Typography>
                </Grid>
              )}
              {selectedLead.email && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">E-mail</Typography>
                  <Typography variant="body1">{selectedLead.email}</Typography>
                </Grid>
              )}
              {selectedLead.estimatedValue && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Valor Estimado</Typography>
                  <Typography variant="body1">{formatCurrency(selectedLead.estimatedValue)}</Typography>
                </Grid>
              )}
              {selectedLead.businessType && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Tipo de Negócio</Typography>
                  <Typography variant="body1">{selectedLead.businessType.name}</Typography>
                </Grid>
              )}
              {selectedLead.taxRegime && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Regime Tributário</Typography>
                  <Typography variant="body1">{selectedLead.taxRegime.name}</Typography>
                </Grid>
              )}
              {selectedLead.source && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Fonte</Typography>
                  <Typography variant="body1">{selectedLead.source.name}</Typography>
                </Grid>
              )}
              {selectedLead.user && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Responsável</Typography>
                  <Typography variant="body1">{selectedLead.user.name}</Typography>
                </Grid>
              )}
              {selectedLead.notes && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">Observações</Typography>
                  <Typography variant="body1">{selectedLead.notes}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewModalOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CRM;
