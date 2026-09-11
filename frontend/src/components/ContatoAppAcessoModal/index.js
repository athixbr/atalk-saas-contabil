import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
  CircularProgress,
  Box,
} from "@material-ui/core";
import { toast } from "react-toastify";
import api from "../../services/api";

const ContatoAppAcessoModal = ({ open, onClose, clienteId, contato }) => {
  const [ativo, setAtivo] = useState(false);
  const [hasSenha, setHasSenha] = useState(false);
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && contato) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contato]);

  const loadData = async () => {
    try {
      setLoading(true);
      setSenha("");
      const { data } = await api.get(
        `/clientes/${clienteId}/contatos/${contato.id}/app-acesso`
      );
      setAtivo(!!data.ativo);
      setHasSenha(!!data.hasSenha);
    } catch (err) {
      console.error("Erro ao carregar acesso ao app:", err);
      toast.error("Erro ao carregar acesso ao app");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (ativo && !hasSenha && !senha) {
      toast.warning("Informe uma senha para ativar o acesso ao app");
      return;
    }

    try {
      setSaving(true);
      const { data } = await api.put(
        `/clientes/${clienteId}/contatos/${contato.id}/app-acesso`,
        { ativo, ...(senha ? { senha } : {}) }
      );
      setHasSenha(!!data.hasSenha);
      setSenha("");
      toast.success("Acesso ao app atualizado com sucesso");
      onClose();
    } catch (err) {
      console.error("Erro ao salvar acesso ao app:", err);
      toast.error(err?.response?.data?.error || "Erro ao salvar acesso ao app");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        Acesso ao App de {contato ? contato.nome : ""}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Defina se este contato terá acesso ao aplicativo da empresa.
            </Typography>

            <Box mt={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={ativo}
                    onChange={(e) => setAtivo(e.target.checked)}
                    color="primary"
                  />
                }
                label={ativo ? "Ativo" : "Inativo"}
              />
            </Box>

            {ativo && (
              <TextField
                fullWidth
                type="password"
                label="Senha de acesso"
                name="senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                margin="normal"
                required={!hasSenha}
                helperText={
                  hasSenha
                    ? "Deixe em branco para manter a senha atual"
                    : "Defina a senha que o contato usará para acessar o app"
                }
              />
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={loading || saving}
        >
          {saving ? <CircularProgress size={20} /> : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContatoAppAcessoModal;
