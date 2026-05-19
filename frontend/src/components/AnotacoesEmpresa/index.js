import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Grid,
} from "@material-ui/core";
import { Add as AddIcon } from "@material-ui/icons";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import api from "../../services/api";

const AnotacoesEmpresa = ({ clienteId }) => {
  const [anotacoes, setAnotacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [novaAnotacao, setNovaAnotacao] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (clienteId) {
      fetchAnotacoes();
    }
  }, [clienteId]);

  const fetchAnotacoes = async () => {
    if (!clienteId) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/clientes/${clienteId}/anotacoes`);
      setAnotacoes(data);
    } catch (err) {
      console.error("Erro ao carregar anotações:", err);
      toast.error("Erro ao carregar anotações");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!novaAnotacao.trim()) {
      toast.warning("Digite uma anotação");
      return;
    }

    if (!clienteId) {
      toast.warning("Salve o cliente primeiro para adicionar anotações");
      return;
    }

    try {
      setSalvando(true);
      await api.post(`/clientes/${clienteId}/anotacoes`, {
        anotacao: novaAnotacao,
      });
      toast.success("Anotação adicionada com sucesso");
      setNovaAnotacao("");
      fetchAnotacoes();
    } catch (err) {
      console.error("Erro ao adicionar anotação:", err);
      toast.error("Erro ao adicionar anotação");
    } finally {
      setSalvando(false);
    }
  };

  const formatarData = (dataString) => {
    try {
      const data = parseISO(dataString);
      return format(data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (err) {
      return dataString;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Anotações da Empresa
      </Typography>

      {/* Formulário para nova anotação */}
      <Paper variant="outlined" style={{ padding: 16, marginBottom: 24 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={10}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Nova Anotação"
              placeholder="Digite sua anotação aqui..."
              value={novaAnotacao}
              onChange={(e) => setNovaAnotacao(e.target.value)}
              variant="outlined"
              disabled={salvando}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={salvando ? <CircularProgress size={20} /> : <AddIcon />}
              onClick={handleSubmit}
              disabled={salvando || !novaAnotacao.trim()}
            >
              Adicionar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Divider style={{ marginBottom: 16 }} />

      {/* Lista de anotações */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : anotacoes.length === 0 ? (
        <Paper variant="outlined" style={{ padding: 24 }}>
          <Typography color="textSecondary" align="center">
            Nenhuma anotação registrada ainda
          </Typography>
        </Paper>
      ) : (
        <Box>
          {anotacoes.map((anotacao, index) => (
            <Card
              key={anotacao.id}
              variant="outlined"
              style={{
                marginBottom: 16,
                backgroundColor: index % 2 === 0 ? "#fafafa" : "#ffffff",
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="subtitle2" color="primary">
                    {anotacao.user?.name || "Usuário"}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {formatarData(anotacao.createdAt)}
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                >
                  {anotacao.anotacao}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default AnotacoesEmpresa;
