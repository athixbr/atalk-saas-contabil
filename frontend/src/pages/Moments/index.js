import React from "react";
import { makeStyles } from "@material-ui/core/styles";

import MomentsUser from "../../components/MomentsUser";
// import MomentsQueues from "../../components/MomentsQueues";

import Title from "./Title";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(3),
    width: "100%",
    boxSizing: "border-box",
    overflowY: "auto",
    overflowX: "hidden",
    ...theme.scrollbarStyles,
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    height: 100,
  },
  chatPapper: {
    display: "flex",
    height: "100%",
  },
  contactsHeader: {
    display: "flex",
    flexWrap: "wrap",
    padding: "0px 6px 6px 6px",
  }
}));

const ChatMoments = () => {
  const classes = useStyles();
  return (
    <div className={classes.mainContainer}>
      <Title variant="h5">Tempo Real</Title>
      <div className={classes.contactsHeader}>
        <MomentsUser />
      </div>
    </div>
  );
};

export default ChatMoments;
