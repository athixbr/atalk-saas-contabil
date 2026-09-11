import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { toast } from "react-toastify";
import api from "../../services/api";

const NfeXmlClienteAssignDialog = ({ open, onClose, nfeXml, onAssigned }) => {
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      loadClientes();
      setSelectedCliente(nfeXml?.cliente || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, nfeXml]);

  const loadClientes = async () => {
    try {
      const { data } = await api.get("/clientes", { params: { limit: 999999 } });
      setClientes(data.clientes || []);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    }
  };

  const handleSave = async () => {
    if (!nfeXml) return;
    setSaving(true);
    try {
      await api.put(`/nfe-xml/${nfeXml.id}/cliente`, {
        clienteId: selectedCliente?.id || null,
      });
      toast.success("Cliente vinculado com sucesso!");
      onAssigned();
      onClose();
    } catch (error) {
      console.error("Erro ao vincular cliente:", error);
      toast.error(error.response?.data?.message || "Erro ao vincular cliente");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Vincular Cliente</DialogTitle>
      <DialogContent>
        <Autocomplete
          options={clientes}
          getOptionLabel={(option) => option.nomeFantasia || option.razaoSocial || ""}
          value={selectedCliente}
          autoHighlight
          openOnFocus
          onChange={(event, newValue) => setSelectedCliente(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Cliente"
              variant="outlined"
              margin="dense"
              fullWidth
              placeholder="Digite para buscar cliente..."
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained" disabled={saving}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NfeXmlClienteAssignDialog;
