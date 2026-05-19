import React from "react";
import { Paper, Typography, Box, Grid, Card, CardContent } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { differenceInDays, parseISO } from "date-fns";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(3),
  },
  chartTitle: {
    marginBottom: theme.spacing(2),
    fontWeight: "bold",
  },
  statCard: {
    textAlign: "center",
    padding: theme.spacing(2),
  },
  statValue: {
    fontSize: "3rem",
    fontWeight: "bold",
    marginBottom: theme.spacing(1),
  },
  statLabel: {
    color: theme.palette.text.secondary,
  },
}));

const GraficosVencimentos = ({ vinculos }) => {
  const classes = useStyles();

  const calcularStatus = (vinculo) => {
    if (!vinculo.ativo) return "inativo";
    if (!vinculo.dataFim) return "ativo";

    const dias = differenceInDays(parseISO(vinculo.dataFim), new Date());
    if (dias < 0) return "vencido";
    if (dias <= 30) return "vencendo";
    return "ativo";
  };

  const stats = {
    total: vinculos.length,
    ativos: vinculos.filter((v) => calcularStatus(v) === "ativo").length,
    vencendo: vinculos.filter((v) => calcularStatus(v) === "vencendo").length,
    vencidos: vinculos.filter((v) => calcularStatus(v) === "vencido").length,
    inativos: vinculos.filter((v) => calcularStatus(v) === "inativo").length,
  };

  if (vinculos.length === 0) {
    return (
      <Paper className={classes.paper}>
        <Typography variant="h6" className={classes.chartTitle}>
          Estatísticas de Vencimentos
        </Typography>
        <Box textAlign="center" py={5}>
          <Typography color="textSecondary">
            Nenhum dado disponível
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper className={classes.paper}>
      <Typography variant="h6" className={classes.chartTitle}>
        Análise de Vencimentos
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent className={classes.statCard}>
              <Typography className={classes.statValue} style={{ color: "#2196f3" }}>
                {stats.total}
              </Typography>
              <Typography className={classes.statLabel}>Total</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent className={classes.statCard}>
              <Typography className={classes.statValue} style={{ color: "#4caf50" }}>
                {stats.ativos}
              </Typography>
              <Typography className={classes.statLabel}>Ativos</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent className={classes.statCard}>
              <Typography className={classes.statValue} style={{ color: "#ff9800" }}>
                {stats.vencendo}
              </Typography>
              <Typography className={classes.statLabel}>Vencendo (30d)</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent className={classes.statCard}>
              <Typography className={classes.statValue} style={{ color: "#f44336" }}>
                {stats.vencidos}
              </Typography>
              <Typography className={classes.statLabel}>Vencidos</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent className={classes.statCard}>
              <Typography className={classes.statValue} style={{ color: "#9e9e9e" }}>
                {stats.inativos}
              </Typography>
              <Typography className={classes.statLabel}>Inativos</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default GraficosVencimentos;
