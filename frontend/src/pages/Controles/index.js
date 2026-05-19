import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid
} from "@material-ui/core";
import { Add as AddIcon, Build as BuildIcon } from "@material-ui/icons";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(3),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  developmentContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    textAlign: "center",
  },
  icon: {
    fontSize: 120,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
  },
  title: {
    marginBottom: theme.spacing(2),
    color: theme.palette.text.primary,
  },
  subtitle: {
    marginBottom: theme.spacing(4),
    color: theme.palette.text.secondary,
    maxWidth: 600,
  },
}));

const Controles = () => {
  const classes = useStyles();

  const handleNovo = () => {
    // Função para criar novo controle (será implementada futuramente)
    console.log("Criar novo controle");
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Controles</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNovo}
          >
            Novo
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <Box className={classes.developmentContainer}>
          <BuildIcon className={classes.icon} />
          
          <Typography variant="h4" className={classes.title}>
            Página em Desenvolvimento
          </Typography>
          
          <Typography variant="body1" className={classes.subtitle}>
            Esta funcionalidade está sendo desenvolvida para auxiliar no controle
            de processos do escritório de contabilidade. Em breve, você poderá
            gerenciar diversos processos pequenos de forma organizada e eficiente.
          </Typography>

          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Paper
                elevation={0}
                style={{
                  padding: "16px 24px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: 8,
                }}
              >
                <Typography variant="body2" color="textSecondary">
                  <strong>Em breve:</strong> Criação e gerenciamento de controles
                </Typography>
              </Paper>
            </Grid>
            <Grid item>
              <Paper
                elevation={0}
                style={{
                  padding: "16px 24px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: 8,
                }}
              >
                <Typography variant="body2" color="textSecondary">
                  <strong>Em breve:</strong> Acompanhamento de processos
                </Typography>
              </Paper>
            </Grid>
            <Grid item>
              <Paper
                elevation={0}
                style={{
                  padding: "16px 24px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: 8,
                }}
              >
                <Typography variant="body2" color="textSecondary">
                  <strong>Em breve:</strong> Relatórios e estatísticas
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </MainContainer>
  );
};

export default Controles;
