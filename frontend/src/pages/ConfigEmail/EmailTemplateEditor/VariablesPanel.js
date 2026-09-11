import React from "react";
import { Box, Chip, Typography, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    padding: theme.spacing(1),
  },
  groupTitle: {
    fontWeight: 600,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
    color: theme.palette.primary.main,
  },
  chip: {
    margin: theme.spacing(0.3),
    cursor: "pointer",
    fontSize: "0.7rem",
  },
}));

const VariablesPanel = ({ variableGroups, onInsert }) => {
  const classes = useStyles();

  return (
    <Box className={classes.wrapper}>
      <Typography variant="caption" color="textSecondary">
        Clique numa variável para inserir no bloco de texto em edição:
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
                label={v.label}
                size="small"
                variant="outlined"
                color="primary"
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
