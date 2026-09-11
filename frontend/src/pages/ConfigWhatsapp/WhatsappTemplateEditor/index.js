import React, { useEffect, useRef, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  Grid,
  IconButton,
  TextField,
  Toolbar as MuiToolbar,
  Typography,
  makeStyles,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { toast } from "react-toastify";
import Toolbar from "./Toolbar";
import ChatPreview from "./ChatPreview";
import VariablesPanel from "./VariablesPanel";
import { VARIABLE_GROUPS } from "./variables";
import { applyMockVariables, insertAtCursor } from "./whatsappMarkdown";

const SOFT_LIMIT = 1024;

const useStyles = makeStyles((theme) => ({
  appBar: { position: "relative" },
  title: { marginLeft: theme.spacing(2), flex: 1 },
  container: { display: "flex", flexDirection: "column", height: "100vh" },
  fieldsBar: {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  body: { flex: 1, display: "flex", minHeight: 0 },
  editorArea: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  textareaWrap: { flex: 1, padding: theme.spacing(2), minHeight: 0, overflowY: "auto" },
  textarea: {
    "& textarea": {
      fontFamily: "monospace",
      fontSize: 14,
      lineHeight: 1.6,
    },
  },
  counter: { textAlign: "right", marginTop: theme.spacing(0.5) },
  counterOver: { color: theme.palette.error.main },
  sidebar: {
    width: 360,
    flexShrink: 0,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  previewWrap: {
    padding: theme.spacing(2),
    background: "#f0f2f5",
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  previewLabel: { marginBottom: theme.spacing(1), fontWeight: 600 },
}));

const WhatsappTemplateEditor = ({ open, onClose, onSave, editing }) => {
  const classes = useStyles();
  const textareaRef = useRef(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(editing?.title || "");
      setBody(editing?.body || "");
    }
  }, [open, editing]);

  const handleInsertVariable = (key) => {
    const el = textareaRef.current;
    const start = el ? el.selectionStart : body.length;
    const end = el ? el.selectionEnd : body.length;
    const result = insertAtCursor(body, start, end, `{{${key}}}`);
    setBody(result.value);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      el.setSelectionRange(result.selStart, result.selStart);
    });
  };

  const handleSave = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Preencha o nome do template e a mensagem.");
      return;
    }
    setSaving(true);
    try {
      await onSave({ title: title.trim(), body });
      onClose();
    } catch (err) {
      // erro tratado pelo caller
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const previewText = applyMockVariables(body, VARIABLE_GROUPS);
  const overLimit = body.length > SOFT_LIMIT;

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <Box className={classes.container}>
        <AppBar className={classes.appBar} color="default">
          <MuiToolbar>
            <IconButton edge="start" onClick={onClose} aria-label="fechar">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              {editing ? "Editar Template do WhatsApp" : "Novo Template do WhatsApp"}
            </Typography>
            <Button
              color="primary"
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              style={{ background: "#25d366", color: "#fff" }}
            >
              {saving ? <CircularProgress size={20} /> : "Salvar"}
            </Button>
          </MuiToolbar>
        </AppBar>

        <Grid container spacing={2} className={classes.fieldsBar}>
          <Grid item xs={12}>
            <TextField
              label="Nome do template"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Ex: Cobrança mensal"
            />
          </Grid>
        </Grid>

        <Box className={classes.body}>
          <Box className={classes.editorArea}>
            <Toolbar textareaRef={textareaRef} value={body} onChange={setBody} />
            <Box className={classes.textareaWrap}>
              <TextField
                inputRef={textareaRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                fullWidth
                multiline
                minRows={14}
                variant="outlined"
                className={classes.textarea}
                placeholder="Digite a mensagem do WhatsApp. Use os botões acima para negrito, itálico, tachado, lista e emoji."
              />
              <Typography
                variant="caption"
                className={`${classes.counter} ${overLimit ? classes.counterOver : ""}`}
              >
                {body.length} caracteres{overLimit ? " — mensagem longa, considere reduzir" : ""}
              </Typography>
            </Box>
          </Box>

          <Box className={classes.sidebar}>
            <Box className={classes.previewWrap}>
              <Typography variant="body2" className={classes.previewLabel}>
                Pré-visualização
              </Typography>
              <ChatPreview text={previewText} />
            </Box>
            <VariablesPanel variableGroups={VARIABLE_GROUPS} onInsert={handleInsertVariable} />
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};

export default WhatsappTemplateEditor;
