import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
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
}));

const GruposConfig = () => {
  const classes = useStyles();

  const [config, setConfig] = useState({
    syncInterval: 60,
    autoSync: true,
    maxGroupsPerCampaign: 50,
    delayBetweenMessages: 5,
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data } = await api.get("/campaign-grupos/config");
      if (data) {
        setConfig(data);
      }
    } catch (err) {
      console.log("Configuração não encontrada, usando padrões");
    }
  };

  const handleSaveConfig = async () => {
    try {
      await api.post("/campaign-grupos/config", config);
      toast.success("Configurações salvas com sucesso!");
    } catch (err) {
      toastError(err);
    }
  };

  const handleChange = (field) => (event) => {
    setConfig({
      ...config,
      [field]: event.target.value,
    });
  };

  const handleSwitchChange = (field) => (event) => {
    setConfig({
      ...config,
      [field]: event.target.checked,
    });
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Configurações - Campanhas para Grupos</Title>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <div className={classes.section}>
          <Typography variant="h6" className={classes.sectionTitle}>
            Sincronização de Grupos
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.autoSync}
                    onChange={handleSwitchChange("autoSync")}
                    color="primary"
                  />
                }
                label="Sincronizar grupos automaticamente"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Intervalo de sincronização (minutos)"
                type="number"
                value={config.syncInterval}
                onChange={handleChange("syncInterval")}
                disabled={!config.autoSync}
              />
            </Grid>
          </Grid>
        </div>

        <div className={classes.section}>
          <Typography variant="h6" className={classes.sectionTitle}>
            Limites de Campanha
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Máximo de grupos por campanha"
                type="number"
                value={config.maxGroupsPerCampaign}
                onChange={handleChange("maxGroupsPerCampaign")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Delay entre mensagens (segundos)"
                type="number"
                value={config.delayBetweenMessages}
                onChange={handleChange("delayBetweenMessages")}
                helperText="Tempo de espera entre envios para evitar bloqueios"
              />
            </Grid>
          </Grid>
        </div>

        <div className={classes.section}>
          <Typography variant="body2" color="textSecondary" paragraph>
            <strong>Dicas:</strong>
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            • Mantenha um delay adequado entre mensagens para evitar que sua
            conta seja bloqueada pelo WhatsApp
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            • A sincronização automática mantém sua lista de grupos atualizada
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            • Evite enviar campanhas para muitos grupos simultaneamente
          </Typography>
        </div>

        <Grid container justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveConfig}
          >
            Salvar Configurações
          </Button>
        </Grid>
      </Paper>
    </MainContainer>
  );
};

export default GruposConfig;
