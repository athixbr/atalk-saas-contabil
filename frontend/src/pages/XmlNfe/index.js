import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
} from "@material-ui/core";
import ConstructionIcon from "@material-ui/icons/Build";
import DescriptionIcon from "@material-ui/icons/Description";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(4),
    borderRadius: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    textAlign: "center",
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
  },
  iconContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing(3),
  },
  constructionIcon: {
    fontSize: 120,
    color: "#FFA726",
    animation: "$bounce 2s infinite",
  },
  documentIcon: {
    fontSize: 80,
    color: "#1A4783",
    position: "absolute",
    animation: "$rotate 3s infinite linear",
  },
  title: {
    fontWeight: 600,
    color: "#1A4783",
    marginBottom: theme.spacing(2),
  },
  subtitle: {
    color: "#666",
    marginBottom: theme.spacing(3),
  },
  featureBox: {
    padding: theme.spacing(2),
    borderRadius: "12px",
    backgroundColor: "#f5f5f5",
    marginTop: theme.spacing(2),
  },
  featureTitle: {
    fontWeight: 600,
    color: "#1A4783",
    marginBottom: theme.spacing(1),
  },
  featureText: {
    color: "#666",
    fontSize: "0.9rem",
  },
  "@keyframes bounce": {
    "0%, 100%": {
      transform: "translateY(0)",
    },
    "50%": {
      transform: "translateY(-20px)",
    },
  },
  "@keyframes rotate": {
    "0%": {
      transform: "rotate(0deg)",
    },
    "100%": {
      transform: "rotate(360deg)",
    },
  },
}));

const XmlNfe = () => {
  const classes = useStyles();

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Paper className={classes.paper}>
        <Box className={classes.iconContainer} style={{ position: "relative", height: 140 }}>
          <ConstructionIcon className={classes.constructionIcon} />
          <DescriptionIcon className={classes.documentIcon} />
        </Box>

        <Typography variant="h3" className={classes.title}>
          XML NF-e
        </Typography>

        <Typography variant="h6" className={classes.subtitle}>
          Módulo em Construção
        </Typography>

        <Typography variant="body1" style={{ marginBottom: 32, color: "#666" }}>
          Estamos trabalhando para trazer uma solução completa de gestão de XML e Notas Fiscais Eletrônicas.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box className={classes.featureBox}>
              <Typography className={classes.featureTitle}>
                📥 Importação
              </Typography>
              <Typography className={classes.featureText}>
                Importação automática de XML de NF-e
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box className={classes.featureBox}>
              <Typography className={classes.featureTitle}>
                📊 Gestão
              </Typography>
              <Typography className={classes.featureText}>
                Organização e gerenciamento de documentos fiscais
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box className={classes.featureBox}>
              <Typography className={classes.featureTitle}>
                📋 Relatórios
              </Typography>
              <Typography className={classes.featureText}>
                Relatórios detalhados e análises fiscais
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box style={{ marginTop: 32 }}>
          <Typography variant="body2" style={{ color: "#999" }}>
            🚀 Em breve disponível
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default XmlNfe;
