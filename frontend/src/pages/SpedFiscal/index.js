import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

const useStyles = makeStyles(() => ({
  frame: {
    flex: 1,
    width: "100%",
    border: "none",
    display: "block",
  },
}));

const SpedFiscal = () => {
  const classes = useStyles();

  return (
    <MainContainer>
      <MainHeader>
        <Title>SPED Fiscal</Title>
      </MainHeader>
      <iframe
        className={classes.frame}
        src="/sped-fiscal/"
        title="Análise SPED Fiscal"
      />
    </MainContainer>
  );
};

export default SpedFiscal;
