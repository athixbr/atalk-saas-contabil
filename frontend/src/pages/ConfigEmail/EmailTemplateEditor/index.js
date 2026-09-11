import React, { useEffect, useRef, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  Grid,
  IconButton,
  makeStyles,
  TextField,
  Toolbar,
  Typography,
} from "@material-ui/core";
import {
  Close as CloseIcon,
  Visibility as VisibilityIcon,
} from "@material-ui/icons";
import { toast } from "react-toastify";
import api from "../../../services/api";
import toastError from "../../../errors/toastError";
import GrapesJsEditor from "./GrapesJsEditor";
import VariablesPanel from "./VariablesPanel";
import PreviewModal from "./PreviewModal";
import { FALLBACK_VARIABLE_GROUPS } from "./variables";

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: "relative",
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  fieldsBar: {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  body: {
    flex: 1,
    display: "flex",
    minHeight: 0,
  },
  editorArea: {
    flex: 1,
    minWidth: 0,
  },
  sidebar: {
    width: 260,
    flexShrink: 0,
    borderLeft: `1px solid ${theme.palette.divider}`,
    overflowY: "auto",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  },
}));

const EmailTemplateEditor = ({ open, onClose, onSave, editing }) => {
  const classes = useStyles();
  const editorRef = useRef(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [variableGroups, setVariableGroups] = useState(FALLBACK_VARIABLE_GROUPS);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(editing?.title || "");
      setSubject(editing?.subject || "");
    }
  }, [open, editing]);

  useEffect(() => {
    if (!open) return;
    const fetchVariables = async () => {
      try {
        const { data } = await api.get("/email-templates/variables");
        if (Array.isArray(data) && data.length) setVariableGroups(data);
      } catch (err) {
        setVariableGroups(FALLBACK_VARIABLE_GROUPS);
      }
    };
    fetchVariables();
  }, [open]);

  const handleInsertVariable = (key) => {
    if (editorRef.current) editorRef.current.insertVariable(key);
  };

  const handlePreview = () => {
    if (!editorRef.current) return;
    setPreviewHtml(editorRef.current.getHtml());
    setPreviewOpen(true);
  };

  const handleSave = async () => {
    if (!title || !subject) {
      toast.error("Preencha o nome do template e o assunto.");
      return;
    }
    const body = editorRef.current ? editorRef.current.getHtml() : "";
    const design = editorRef.current ? editorRef.current.getProjectData() : null;

    if (!body) {
      toast.error("O corpo do e-mail não pode ficar vazio.");
      return;
    }

    setSaving(true);
    try {
      await onSave({ title, subject, body, design });
      onClose();
    } catch (err) {
      toastError(err);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <Box className={classes.container}>
        <AppBar className={classes.appBar} color="default">
          <Toolbar>
            <IconButton edge="start" onClick={onClose} aria-label="fechar">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              {editing ? "Editar Template de E-mail" : "Novo Template de E-mail"}
            </Typography>
            <Button startIcon={<VisibilityIcon />} onClick={handlePreview} style={{ marginRight: 8 }}>
              Visualizar
            </Button>
            <Button
              color="primary"
              variant="contained"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <CircularProgress size={20} /> : "Salvar"}
            </Button>
          </Toolbar>
        </AppBar>

        <Grid container spacing={2} className={classes.fieldsBar}>
          <Grid item xs={12} sm={5}>
            <TextField
              label="Nome do template"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Ex: Boas-vindas ao cliente"
            />
          </Grid>
          <Grid item xs={12} sm={7}>
            <TextField
              label="Assunto"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Assunto do e-mail (aceita variáveis)"
            />
          </Grid>
        </Grid>

        <Box className={classes.body}>
          <Box className={classes.editorArea}>
            <GrapesJsEditor
              ref={editorRef}
              initialHtml={editing?.design ? null : editing?.body || null}
              initialProjectData={editing?.design || null}
            />
          </Box>
          <Box className={classes.sidebar}>
            <VariablesPanel variableGroups={variableGroups} onInsert={handleInsertVariable} />
          </Box>
        </Box>
      </Box>

      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        html={previewHtml}
        variableGroups={variableGroups}
      />
    </Dialog>
  );
};

export default EmailTemplateEditor;
