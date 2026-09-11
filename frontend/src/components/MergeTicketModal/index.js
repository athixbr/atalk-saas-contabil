import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, TextField, RadioGroup, FormControlLabel,
  Radio, Box, Divider, CircularProgress
} from "@material-ui/core";
import MergeTypeIcon from "@material-ui/icons/MergeType";
import WarningIcon from "@material-ui/icons/Warning";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";

const statusLabel = { open: "Em atendimento", pending: "Pendente", closed: "Encerrado" };

const TicketCard = ({ ticket, selected, onSelect }) => (
  <Box
    onClick={onSelect}
    style={{
      flex: 1,
      border: selected ? "2px solid #1976d2" : "1px solid #ddd",
      borderRadius: 8,
      padding: 12,
      cursor: "pointer",
      backgroundColor: selected ? "#e3f2fd" : "#fafafa",
      transition: "all 0.2s"
    }}
  >
    <Box display="flex" alignItems="center" mb={0.5}>
      <Radio checked={selected} color="primary" size="small" style={{ padding: 0, marginRight: 6 }} />
      <Typography variant="subtitle2" style={{ fontWeight: 600 }}>
        Ticket #{ticket.id}
      </Typography>
    </Box>
    <Typography variant="body2" color="textPrimary">{ticket.contact?.name}</Typography>
    <Typography variant="caption" color="textSecondary">
      Tel: {ticket.contact?.number || "—"}
    </Typography>
    <br />
    <Typography variant="caption" color="textSecondary">
      Status: {statusLabel[ticket.status] || ticket.status}
    </Typography>
    {ticket.queue && (
      <>
        <br />
        <Typography variant="caption" color="textSecondary">
          Fila: {ticket.queue.name}
        </Typography>
      </>
    )}
  </Box>
);

const MergeTicketModal = ({ open, onClose, ticketA, ticketB, onMergeSuccess }) => {
  const [masterTicketId, setMasterTicketId] = useState(null);
  const [contactName, setContactName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !ticketA || !ticketB) return;
    setMasterTicketId(ticketA.id);
    setContactName(ticketA.contact?.name || "");
    setContactNumber(ticketA.contact?.number || "");
  }, [open, ticketA, ticketB]);

  const handleSelectMaster = (ticketId) => {
    setMasterTicketId(ticketId);
    const master = ticketId === ticketA?.id ? ticketA : ticketB;
    setContactName(master.contact?.name || "");
    setContactNumber(master.contact?.number || "");
  };

  const getMergedTicketId = () =>
    masterTicketId === ticketA?.id ? ticketB?.id : ticketA?.id;

  const handleConfirm = async () => {
    if (!masterTicketId || !contactName.trim() || !contactNumber.trim()) {
      toast.warn("Preencha o nome e o telefone do contato.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/tickets/merge", {
        masterTicketId,
        mergedTicketId: getMergedTicketId(),
        contactName: contactName.trim(),
        contactNumber: contactNumber.trim()
      });
      toast.success("Tickets agrupados com sucesso!");
      onMergeSuccess && onMergeSuccess(masterTicketId);
      onClose();
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  if (!ticketA || !ticketB) return null;

  const mergedTicketId = getMergedTicketId();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" style={{ gap: 8 }}>
          <MergeTypeIcon color="primary" />
          <Typography variant="h6">Agrupar Tickets</Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Selecione qual ticket fica como <strong>principal</strong>. O outro será ocultado e suas mensagens serão incorporadas.
        </Typography>

        <Box display="flex" style={{ gap: 12, marginTop: 12, marginBottom: 16 }}>
          <TicketCard
            ticket={ticketA}
            selected={masterTicketId === ticketA.id}
            onSelect={() => handleSelectMaster(ticketA.id)}
          />
          <TicketCard
            ticket={ticketB}
            selected={masterTicketId === ticketB.id}
            onSelect={() => handleSelectMaster(ticketB.id)}
          />
        </Box>

        <Divider style={{ marginBottom: 16 }} />

        <Typography variant="subtitle2" gutterBottom>Contato final (editável):</Typography>
        <TextField
          label="Nome do contato"
          value={contactName}
          onChange={e => setContactName(e.target.value)}
          fullWidth
          size="small"
          variant="outlined"
          style={{ marginBottom: 10 }}
        />
        <TextField
          label="Número de telefone"
          value={contactNumber}
          onChange={e => setContactNumber(e.target.value)}
          fullWidth
          size="small"
          variant="outlined"
        />

        <Box
          display="flex"
          alignItems="flex-start"
          style={{ gap: 6, marginTop: 16, backgroundColor: "#fff8e1", borderRadius: 6, padding: 10 }}
        >
          <WarningIcon style={{ color: "#f57c00", fontSize: 18, marginTop: 2 }} />
          <Typography variant="caption" style={{ color: "#7c5200" }}>
            O ticket <strong>#{mergedTicketId}</strong> será ocultado e suas mensagens serão transferidas
            para o ticket <strong>#{masterTicketId}</strong> em ordem cronológica.
            Um marcador de incorporação aparecerá na conversa.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <MergeTypeIcon />}
        >
          {loading ? "Agrupando..." : "Confirmar Agrupamento"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MergeTicketModal;
