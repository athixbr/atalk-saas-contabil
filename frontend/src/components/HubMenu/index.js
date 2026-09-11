import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Card, CardActionArea, CardContent, Grid, Typography } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import MainContainer from "../MainContainer";
import MainHeader from "../MainHeader";
import Title from "../Title";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(3),
    overflowY: "auto",
  },
  fullWidthContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(3),
    width: "100%",
    boxSizing: "border-box",
  },
  grid: {
    marginTop: theme.spacing(2),
  },
  card: {
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    transition: "all 0.2s ease",
    "&:hover": {
      boxShadow: "0 6px 24px rgba(6, 81, 131, 0.15)",
      transform: "translateY(-2px)",
    },
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: theme.spacing(3),
  },
  iconWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#065183",
    marginBottom: theme.spacing(2),
    color: "#fff",
  },
  cardTitle: {
    fontFamily: "Inter, sans-serif",
    fontWeight: 600,
    fontSize: "1rem",
    color: "#1a1a2e",
    marginBottom: theme.spacing(0.5),
  },
  cardDescription: {
    fontFamily: "Inter, sans-serif",
    fontSize: "0.82rem",
    color: "#666",
    lineHeight: 1.5,
  },
  subLink: {
    marginTop: theme.spacing(2),
    display: "flex",
    gap: theme.spacing(1),
    flexWrap: "wrap",
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "4px 10px",
    borderRadius: 8,
    backgroundColor: "rgba(6, 81, 131, 0.08)",
    color: "#065183",
    fontSize: "0.75rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.15s",
    "&:hover": {
      backgroundColor: "rgba(6, 81, 131, 0.18)",
    },
  },
}));

const goTo = (history, item) => {
  if (item.external) {
    window.open(item.path, "_blank", "noopener,noreferrer");
  } else {
    history.push(item.path);
  }
};

const HubMenu = ({ title, subtitle, items, fullWidth = false }) => {
  const classes = useStyles();
  const history = useHistory();

  const visibleItems = items.filter((item) => !item.hidden);

  const content = (
    <>
      <MainHeader>
        <Title>{title}</Title>
      </MainHeader>

      <Box className={classes.mainPaper}>
        {subtitle && (
          <Typography variant="body2" style={{ color: "#666", marginBottom: 8, fontFamily: "Inter, sans-serif" }}>
            {subtitle}
          </Typography>
        )}

        <Grid container spacing={3} className={classes.grid}>
          {visibleItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.title}>
              {item.subItems ? (
                <Card className={classes.card} elevation={0}>
                  <CardContent className={classes.cardContent}>
                    <Box className={classes.iconWrapper}>{item.icon}</Box>
                    <Typography className={classes.cardTitle}>{item.title}</Typography>
                    <Typography className={classes.cardDescription}>{item.description}</Typography>
                    <Box className={classes.subLink}>
                      {item.subItems
                        .filter((sub) => !sub.hidden)
                        .map((sub) => (
                          <Box key={sub.path} className={classes.chip} onClick={() => goTo(history, sub)}>
                            {sub.icon}
                            {sub.label}
                          </Box>
                        ))}
                    </Box>
                  </CardContent>
                </Card>
              ) : (
                <Card className={classes.card} elevation={0}>
                  <CardActionArea onClick={() => goTo(history, item)}>
                    <CardContent className={classes.cardContent}>
                      <Box className={classes.iconWrapper}>{item.icon}</Box>
                      <Typography className={classes.cardTitle}>{item.title}</Typography>
                      <Typography className={classes.cardDescription}>{item.description}</Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              )}
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );

  if (fullWidth) {
    return <div className={classes.fullWidthContainer}>{content}</div>;
  }

  return (
    <MainContainer>
      {content}
    </MainContainer>
  );
};

export default HubMenu;
