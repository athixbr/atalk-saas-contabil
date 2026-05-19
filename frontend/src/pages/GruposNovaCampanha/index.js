import React, { useState, useEffect, useContext, useRef } from "react";
import { toast } from "react-toastify";
import { useHistory, useParams } from "react-router-dom";
import moment from "moment";
import { head } from "lodash";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemText from "@material-ui/core/ListItemText";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import IconButton from "@material-ui/core/IconButton";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import Chip from "@material-ui/core/Chip";
import Typography from "@material-ui/core/Typography";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";

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
    fontWeight: 500,
  },
  attachmentPreview: {
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(1),
  },
}));

const GruposNovaCampanha = () => {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const attachmentFile = useRef(null);

  const [campaign, setCampaign] = useState({
    name: "",
    message: "",
    scheduledAt: "",
    isScheduled: false,
    status: "pending",
  });
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [whatsapps, setWhatsapps] = useState([]);
  const [selectedWhatsapp, setSelectedWhatsapp] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWhatsapps();
    if (id && id !== "nova") {
      fetchCampaign();
    }
  }, [id]);

  useEffect(() => {
    if (selectedWhatsapp) {
      fetchGroups();
    }
  }, [selectedWhatsapp]);

  const fetchWhatsapps = async () => {
    try {
      const { data } = await api.get("/whatsapp", {
        params: { companyId: user.companyId, session: 0 },
      });
      setWhatsapps(data || []);
    } catch (err) {
      toastError(err);
    }
  };

  const fetchGroups = async () => {
    try {
      const { data } = await api.get("/whatsapp-groups", {
        params: { whatsappId: selectedWhatsapp },
      });
      setGroups(data.groups || []);
    } catch (err) {
      toastError(err);
    }
  };

  const fetchCampaign = async () => {
    try {
      const { data } = await api.get(`/campaign-grupos/${id}`);
      setCampaign({
        name: data.name || "",
        message: data.message || "",
        scheduledAt: data.scheduledAt
          ? moment(data.scheduledAt).format("YYYY-MM-DDTHH:mm")
          : "",
        isScheduled: !!data.scheduledAt,
        status: data.status || "pending",
      });
      setSelectedWhatsapp(data.whatsappId || "");
      setSelectedGroups(data.groups?.map((g) => g.groupId) || []);
    } catch (err) {
      toastError(err);
    }
  };

  const handleInputChange = (field) => (event) => {
    setCampaign({
      ...campaign,
      [field]: event.target.value,
    });
  };

  const handleSwitchChange = (field) => (event) => {
    setCampaign({
      ...campaign,
      [field]: event.target.checked,
    });
  };

  const handleWhatsappChange = (event) => {
    setSelectedWhatsapp(event.target.value);
    setSelectedGroups([]);
  };

  const handleGroupsChange = (event) => {
    setSelectedGroups(event.target.value);
  };

  const handleAttachmentFile = (e) => {
    const file = head(e.target.files);
    if (file) {
      setAttachment(file);
    }
  };

  const deleteMedia = async () => {
    if (attachment) {
      setAttachment(null);
      attachmentFile.current.value = null;
    }
    if (id && id !== "nova") {
      try {
        await api.delete(`/campaign-grupos/${id}/media`);
        toast.success("Mídia removida com sucesso!");
      } catch (err) {
        toastError(err);
      }
    }
  };

  const handleSave = async () => {
    if (!campaign.name) {
      toast.error("Nome da campanha é obrigatório!");
      return;
    }
    if (!campaign.message) {
      toast.error("Mensagem é obrigatória!");
      return;
    }
    if (!selectedWhatsapp) {
      toast.error("Selecione uma conexão WhatsApp!");
      return;
    }
    if (selectedGroups.length === 0) {
      toast.error("Selecione pelo menos um grupo!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: campaign.name,
        message: campaign.message,
        scheduledAt: campaign.isScheduled
          ? moment(campaign.scheduledAt).format("YYYY-MM-DD HH:mm:ss")
          : null,
        whatsappId: selectedWhatsapp,
        groupIds: selectedGroups,
        status: campaign.status,
      };

      let campaignId = id;
      if (id && id !== "nova") {
        await api.put(`/campaign-grupos/${id}`, payload);
        toast.success("Campanha atualizada com sucesso!");
      } else {
        const { data } = await api.post("/campaign-grupos", payload);
        campaignId = data.id;
        toast.success("Campanha criada com sucesso!");
      }

      if (attachment) {
        const formData = new FormData();
        formData.append("file", attachment);
        await api.post(`/campaign-grupos/${campaignId}/media`, formData);
      }

      history.push("/grupos");
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    history.push("/grupos");
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{id ? "Editar Campanha" : "Nova Campanha para Grupos"}</Title>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <div className={classes.section}>
          <Typography variant="h6" className={classes.sectionTitle}>
            Informações Básicas
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome da Campanha"
                value={campaign.name}
                onChange={handleInputChange("name")}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mensagem"
                value={campaign.message}
                onChange={handleInputChange("message")}
                multiline
                rows={5}
                required
                helperText="Digite a mensagem que será enviada aos grupos"
              />
            </Grid>
          </Grid>
        </div>

        <div className={classes.section}>
          <Typography variant="h6" className={classes.sectionTitle}>
            Mídia (Opcional)
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <input
                type="file"
                ref={attachmentFile}
                style={{ display: "none" }}
                onChange={handleAttachmentFile}
                accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.xls,.xlsx,.mp4,.mp3"
              />
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AttachFileIcon />}
                onClick={() => attachmentFile.current.click()}
              >
                Anexar Arquivo
              </Button>
            </Grid>
            {attachment && (
              <Grid item className={classes.attachmentPreview}>
                <Chip
                  label={attachment.name}
                  onDelete={deleteMedia}
                  deleteIcon={<DeleteOutlineIcon />}
                  color="primary"
                />
              </Grid>
            )}
          </Grid>
        </div>

        <div className={classes.section}>
          <Typography variant="h6" className={classes.sectionTitle}>
            Destinatários
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Conexão WhatsApp</InputLabel>
                <Select
                  value={selectedWhatsapp}
                  onChange={handleWhatsappChange}
                  label="Conexão WhatsApp"
                >
                  {whatsapps.map((whatsapp) => (
                    <MenuItem key={whatsapp.id} value={whatsapp.id}>
                      {whatsapp.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required disabled={!selectedWhatsapp}>
                <InputLabel>Grupos</InputLabel>
                <Select
                  multiple
                  value={selectedGroups}
                  onChange={handleGroupsChange}
                  label="Grupos"
                  renderValue={(selected) => (
                    <div>
                      {selected.length} grupo(s) selecionado(s)
                    </div>
                  )}
                >
                  {groups.map((group) => (
                    <MenuItem key={group.groupId} value={group.groupId}>
                      <Checkbox
                        checked={selectedGroups.indexOf(group.groupId) > -1}
                      />
                      <ListItemText primary={group.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </div>

        <div className={classes.section}>
          <Typography variant="h6" className={classes.sectionTitle}>
            Agendamento
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={campaign.isScheduled}
                    onChange={handleSwitchChange("isScheduled")}
                    color="primary"
                  />
                }
                label="Agendar envio"
              />
            </Grid>
            {campaign.isScheduled && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Data e Hora"
                  type="datetime-local"
                  value={campaign.scheduledAt}
                  onChange={handleInputChange("scheduledAt")}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: moment().format("YYYY-MM-DDTHH:mm"),
                  }}
                />
              </Grid>
            )}
          </Grid>
        </div>

        <Grid container spacing={2} justifyContent="flex-end">
          <Grid item>
            <Button variant="outlined" onClick={handleCancel}>
              Cancelar
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Salvando..." : id ? "Atualizar" : "Criar Campanha"}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </MainContainer>
  );
};

export default GruposNovaCampanha;
