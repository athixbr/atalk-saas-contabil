import React from "react";
import { Avatar, Box, Typography, makeStyles } from "@material-ui/core";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import VideocamIcon from "@material-ui/icons/Videocam";
import CallIcon from "@material-ui/icons/Call";
import { renderWhatsappText } from "./whatsappMarkdown";

const useStyles = makeStyles(() => ({
  phone: {
    width: "100%",
    maxWidth: 320,
    margin: "0 auto",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 4px 18px rgba(0,0,0,0.25)",
    border: "8px solid #1f1f1f",
    background: "#000",
  },
  header: {
    background: "#075e54",
    color: "#fff",
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  headerName: { fontWeight: 600, fontSize: 15, lineHeight: 1.2 },
  headerStatus: { fontSize: 12, opacity: 0.85 },
  headerIcons: { marginLeft: "auto", display: "flex", gap: 14, opacity: 0.9 },
  chatArea: {
    minHeight: 220,
    background:
      "#e5ddd5 url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cg fill='%23d9d0c4' fill-opacity='0.4'%3E%3Ccircle cx='6' cy='6' r='1.4'/%3E%3Ccircle cx='30' cy='18' r='1.4'/%3E%3Ccircle cx='48' cy='4' r='1.4'/%3E%3Ccircle cx='18' cy='40' r='1.4'/%3E%3Ccircle cx='42' cy='48' r='1.4'/%3E%3C/g%3E%3C/svg%3E\")",
    padding: "16px 10px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  bubbleWrap: { display: "flex", justifyContent: "flex-end" },
  bubble: {
    position: "relative",
    background: "#d9fdd3",
    borderRadius: "8px 2px 8px 8px",
    padding: "6px 8px 4px 8px",
    maxWidth: "86%",
    boxShadow: "0 1px 1px rgba(0,0,0,0.15)",
  },
  bubbleText: {
    fontSize: 14.2,
    lineHeight: 1.35,
    color: "#111b21",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  meta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 3,
    marginTop: 2,
  },
  time: { fontSize: 11, color: "rgba(0,0,0,0.45)" },
  check: { fontSize: 15, color: "#53bdeb" },
  empty: { color: "rgba(0,0,0,0.4)", fontStyle: "italic", fontSize: 13 },
}));

const now = () => {
  const d = new Date();
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

const ChatPreview = ({ text, contactName = "Sua Empresa" }) => {
  const classes = useStyles();

  return (
    <Box className={classes.phone}>
      <Box className={classes.header}>
        <Avatar style={{ background: "#128c7e", width: 34, height: 34 }}>
          <WhatsAppIcon fontSize="small" />
        </Avatar>
        <Box>
          <Typography className={classes.headerName}>{contactName}</Typography>
          <Typography className={classes.headerStatus}>online</Typography>
        </Box>
        <Box className={classes.headerIcons}>
          <VideocamIcon fontSize="small" />
          <CallIcon fontSize="small" />
          <MoreVertIcon fontSize="small" />
        </Box>
      </Box>

      <Box className={classes.chatArea}>
        <Box className={classes.bubbleWrap}>
          <Box className={classes.bubble}>
            {text ? (
              <Typography component="div" className={classes.bubbleText}>
                {renderWhatsappText(text)}
              </Typography>
            ) : (
              <Typography component="div" className={classes.empty}>
                Sua mensagem aparecerá aqui...
              </Typography>
            )}
            <Box className={classes.meta}>
              <span className={classes.time}>{now()}</span>
              <DoneAllIcon className={classes.check} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatPreview;
