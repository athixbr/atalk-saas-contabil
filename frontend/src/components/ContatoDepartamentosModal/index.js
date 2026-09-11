import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
  CircularProgress,
  Box,
} from "@material-ui/core";
import { toast } from "react-toastify";
import api from "../../services/api";

const ContatoDepartamentosModal = ({ open, onClose, clienteId, contato }) => {
  const [departamentos, setDepartamentos] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
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
      const [todosRes, atuaisRes] = await Promise.all([
        api.get("/departamentos"),
        api.get(`/clientes/${clienteId}/contatos/${contato.id}/departamentos`),
      ]);

      const todos = todosRes.data.departamentos || [];
      const atuais = atuaisRes.data || [];

      setDepartamentos(todos);
      setSelectedIds(
        atuais.length > 0 ? atuais.map((d) => d.id) : todos.map((d) => d.id)
      );
    } catch (err) {
      console.error("Erro ao carregar departamentos:", err);
      toast.error("Erro ao carregar departamentos");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (departamentoId) => {
    setSelectedIds((prev) =>
      prev.includes(departamentoId)
        ? prev.filter((id) => id !== departamentoId)
        : [...prev, departamentoId]
    );
  };

  const allSelected =
    departamentos.length > 0 && selectedIds.length === departamentos.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const handleToggleAll = () => {
    setSelectedIds(allSelected ? [] : departamentos.map((d) => d.id));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(
        `/clientes/${clienteId}/contatos/${contato.id}/departamentos`,
        { departamentoIds: selectedIds }
      );
      toast.success("Departamentos atualizados com sucesso");
      onClose();
    } catch (err) {
      console.error("Erro ao salvar departamentos:", err);
      toast.error("Erro ao salvar departamentos");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        Departamentos de {contato ? contato.nome : ""}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Selecione os departamentos que este contato deve receber informações.
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={24} />
          </Box>
        ) : departamentos.length === 0 ? (
          <Box p={2}>
            <Typography variant="body2" color="textSecondary">
              Nenhum departamento cadastrado
            </Typography>
          </Box>
        ) : (
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={handleToggleAll}
                  color="primary"
                />
              }
              label={<strong>Selecionar todos</strong>}
            />
            <Box borderBottom={1} borderColor="divider" mb={1} />
            {departamentos.map((departamento) => (
              <FormControlLabel
                key={departamento.id}
                control={
                  <Checkbox
                    checked={selectedIds.includes(departamento.id)}
                    onChange={() => handleToggle(departamento.id)}
                    color="primary"
                  />
                }
                label={departamento.nome}
              />
            ))}
          </FormGroup>
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

export default ContatoDepartamentosModal;
