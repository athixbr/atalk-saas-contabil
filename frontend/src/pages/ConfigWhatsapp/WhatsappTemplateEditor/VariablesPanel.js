import React from "react";
import { Box, Chip, Typography, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    padding: theme.spacing(1.5),
  },
  groupTitle: {
    fontWeight: 600,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
    color: "#128c7e",
  },
  chip: {
    margin: theme.spacing(0.3),
    cursor: "pointer",
    fontSize: "0.7rem",
    fontFamily: "monospace",
  },
}));

const VariablesPanel = ({ variableGroups, onInsert }) => {
  const classes = useStyles();

  return (
    <Box className={classes.wrapper}>
      <Typography variant="caption" color="textSecondary">
        Clique numa variável para inserir no texto:
      </Typography>
      {variableGroups.map(({ group, variables }) => (
        <Box key={group}>
          <Typography variant="caption" className={classes.groupTitle} component="div">
            {group}
          </Typography>
          <Box display="flex" flexWrap="wrap">
            {variables.map((v) => (
              <Chip
                key={v.key}
                label={`{{${v.key}}}`}
                size="small"
                variant="outlined"
                style={{ borderColor: "#a5d6a7", color: "#128c7e" }}
                className={classes.chip}
                onClick={() => onInsert(v.key)}
              />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default VariablesPanel;
