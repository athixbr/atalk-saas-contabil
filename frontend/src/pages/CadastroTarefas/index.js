import React, { useEffect } from "react";
import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(3),
    overflowY: "auto",
  },
}));

const CadastroTarefas = () => {
  const classes = useStyles();
  const history = useHistory();

  useEffect(() => {
    history.replace("/tarefas-recorrentes");
  }, [history]);

  return (
    <MainContainer>
      <MainHeader>
        <Title>Tarefas</Title>
      </MainHeader>
      <Box className={classes.mainPaper} />
    </MainContainer>
  );
};

export default CadastroTarefas;
