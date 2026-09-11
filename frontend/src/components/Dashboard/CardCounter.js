import React from "react";
import { Card, CardContent } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles(() => ({
  card: {
    borderRadius: "16px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
    color: "#fff",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "default",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
    },
  },
  cardClickable: {
    cursor: "pointer",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 10px 36px rgba(0,0,0,0.24)",
    },
    "& $linkHint": {
      opacity: 1,
    },
  },
  linkHint: {
    fontSize: "10px",
    opacity: 0,
    transition: "opacity 0.2s",
    marginTop: "4px",
    display: "flex",
    alignItems: "center",
    gap: "3px",
    fontWeight: 500,
    letterSpacing: "0.3px",
  },
  content: {
    padding: "20px !important",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  iconBox: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: "14px",
    padding: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: "28px",
    minWidth: "52px",
    height: "52px",
  },
  label: {
    fontSize: "11px",
    fontWeight: 700,
    opacity: 0.88,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    marginBottom: "6px",
    lineHeight: 1.3,
  },
  value: {
    fontSize: "28px",
    fontWeight: 700,
    letterSpacing: "-0.5px",
    lineHeight: 1.1,
  },
}));

export default function CardCounter({ icon, title, value, loading, gradient, to }) {
  const classes = useStyles();
  const history = useHistory();

  if (loading) {
    return (
      <Skeleton
        variant="rect"
        height={92}
        style={{ borderRadius: "16px" }}
      />
    );
  }

  const handleClick = () => {
    if (to) history.push(to);
  };

  return (
    <Card
      className={`${classes.card} ${to ? classes.cardClickable : ""}`}
      style={{
        background:
          gradient || "linear-gradient(135deg, #1A4783 0%, #2d7dd2 100%)",
      }}
      onClick={handleClick}
    >
      <CardContent className={classes.content}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Typography className={classes.label}>{title}</Typography>
          <Typography className={classes.value} noWrap>
            {value ?? "—"}
          </Typography>
          {to && (
            <Typography className={classes.linkHint}>
              Ver detalhes →
            </Typography>
          )}
        </div>
        <div className={classes.iconBox}>{icon}</div>
      </CardContent>
    </Card>
  );
}
