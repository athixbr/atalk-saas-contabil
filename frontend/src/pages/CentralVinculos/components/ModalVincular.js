import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Chip,
  Box,
  Divider,
  CircularProgress,
} from "@material-ui/core";
import {
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  Search as SearchIcon,
} from "@material-ui/icons";
import { toast } from "react-toastify";
import api from "../../../services/api";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    minHeight: 500,
    padding: theme.spacing(3),
  },
  listBox: {
    height: 400,
    overflowY: "auto",
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1),
  },
  listItem: {
    marginBottom: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  selectedItem: {
    backgroundColor: theme.palette.action.selected,
  },
  transferButtons: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  searchField: {
    marginBottom: theme.spacing(2),
  },
  chipContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(1),
  },
}));

const ModalVincular = ({ open, onClose, onSuccess }) => {
  const classes = useStyles();

  // Estados
  const [loading, setLoading] = useState(false);
  const [controleConfigId, setControleConfigId] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");
  const [usuarioId, setUsuarioId] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [gerarTarefas, setGerarTarefas] = useState(true);

  // Dual List
  const [clientesDisponiveis, setClientesDisponiveis] = useState([]);
  const [clientesSelecionados, setClientesSelecionados] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState([]);
  const [selectedRight, setSelectedRight] = useState([]);
  const [searchLeft, setSearchLeft] = useState("");
  const [searchRight, setSearchRight] = useState("");

  // Dados auxiliares
  const [controles, setControles] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    if (open) {
      carregarDados();
      // Definir data início como hoje
      const hoje = new Date().toISOString().split("T")[0];
      setDataInicio(hoje);
    }
  }, [open]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [clientesRes, controlesRes, departamentosRes, usuariosRes] = await Promise.all([
        api.get("/clientes"),
        api.get("/controles-config"),
        api.get("/departamentos"),
        api.get("/users"),
      ]);

      console.log("Controles recebidos:", controlesRes.data);
      
      setClientesDisponiveis(clientesRes.data.clientes || clientesRes.data || []);
      setControles(controlesRes.data.controles || controlesRes.data || []);
      setDepartamentos(departamentosRes.data.departamentos || departamentosRes.data || []);
      setUsuarios(usuariosRes.data.users || usuariosRes.data || []);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      console.error("Erro completo:", err.response?.data);
      toast.error(err.response?.data?.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLeft = (cliente) => {
    const currentIndex = selectedLeft.findIndex((c) => c.id === cliente.id);
    const newSelected = [...selectedLeft];

    if (currentIndex === -1) {
      newSelected.push(cliente);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelectedLeft(newSelected);
  };

  const handleToggleRight = (cliente) => {
    const currentIndex = selectedRight.findIndex((c) => c.id === cliente.id);
    const newSelected = [...selectedRight];

    if (currentIndex === -1) {
      newSelected.push(cliente);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelectedRight(newSelected);
  };

  const handleMoveRight = () => {
    const newSelecionados = [...clientesSelecionados, ...selectedLeft];
    const newDisponiveis = clientesDisponiveis.filter(
      (c) => !selectedLeft.find((s) => s.id === c.id)
    );

    setClientesSelecionados(newSelecionados);
    setClientesDisponiveis(newDisponiveis);
    setSelectedLeft([]);
  };

  const handleMoveLeft = () => {
    const newDisponiveis = [...clientesDisponiveis, ...selectedRight];
    const newSelecionados = clientesSelecionados.filter(
      (c) => !selectedRight.find((s) => s.id === c.id)
    );

    setClientesDisponiveis(newDisponiveis);
    setClientesSelecionados(newSelecionados);
    setSelectedRight([]);
  };

  const handleVincular = async () => {
    if (!controleConfigId) {
      toast.error("Selecione um controle");
      return;
    }

    if (clientesSelecionados.length === 0) {
      toast.error("Selecione pelo menos um cliente");
      return;
    }

    if (!dataInicio || !dataFim) {
      toast.error("Informe as datas de início e fim");
      return;
    }

    if (new Date(dataInicio) > new Date(dataFim)) {
      toast.error("Data de início não pode ser maior que data fim");
      return;
    }

    if (!departamentoId && !usuarioId) {
      toast.error("Selecione um departamento ou usuário responsável");
      return;
    }

    try {
      setLoading(true);

      const clientes = clientesSelecionados.map((cliente) => ({
        clienteId: cliente.id,
        dataInicio,
        dataFim,
      }));

      const payload = {
        controleConfigId: parseInt(controleConfigId),
        clientes,
        departamentoId: departamentoId ? parseInt(departamentoId) : null,
        usuarioId: usuarioId ? parseInt(usuarioId) : null,
        observacoes,
        gerarTarefasImediatamente: gerarTarefas,
      };

      const { data } = await api.post("/controle-clientes/vinculos", payload);

      toast.success(
        `${data.vinculos.length} vínculos criados com sucesso! ${
          data.tarefasGeradas > 0 ? `${data.tarefasGeradas} tarefas geradas.` : ""
        }`
      );

      if (onSuccess) onSuccess();
      handleClose();
    } catch (err) {
      console.error("Erro ao vincular:", err);
      toast.error(err.response?.data?.message || "Erro ao vincular controles");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setControleConfigId("");
    setDataInicio("");
    setDataFim("");
    setDepartamentoId("");
    setUsuarioId("");
    setObservacoes("");
    setClientesSelecionados([]);
    setSelectedLeft([]);
    setSelectedRight([]);
    setSearchLeft("");
    setSearchRight("");
    onClose();
  };

  const filteredLeft = clientesDisponiveis.filter((c) =>
    c.nome.toLowerCase().includes(searchLeft.toLowerCase())
  );

  const filteredRight = clientesSelecionados.filter((c) =>
    c.nome.toLowerCase().includes(searchRight.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Vincular Controles aos Clientes
        <IconButton
          aria-label="close"
          onClick={handleClose}
          style={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className={classes.dialogContent}>
        <Grid container spacing={3}>
          {/* Configurações do Vínculo */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              1. Configurações do Controle
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel>Controle</InputLabel>
                  <Select
                    value={controleConfigId}
                    onChange={(e) => setControleConfigId(e.target.value)}
                    label="Controle"
                  >
                    <MenuItem value="">
                      <em>{controles.length === 0 ? "Nenhum controle disponível" : "Selecione um controle"}</em>
                    </MenuItem>
                    {controles.map((controle) => (
                      <MenuItem key={controle.id} value={controle.id}>
                        {controle.codigo} - {controle.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {controles.length === 0 && (
                  <Typography variant="caption" color="error" style={{ marginTop: 4 }}>
                    Nenhum controle cadastrado. Cadastre controles primeiro em "Cadastro de Controles".
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Data Início"
                  type="date"
                  variant="outlined"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Data Fim"
                  type="date"
                  variant="outlined"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Responsáveis */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              2. Responsáveis
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Departamento</InputLabel>
                  <Select
                    value={departamentoId}
                    onChange={(e) => setDepartamentoId(e.target.value)}
                    label="Departamento"
                  >
                    <MenuItem value="">Nenhum</MenuItem>
                    {departamentos.map((dep) => (
                      <MenuItem key={dep.id} value={dep.id}>
                        {dep.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Usuário</InputLabel>
                  <Select
                    value={usuarioId}
                    onChange={(e) => setUsuarioId(e.target.value)}
                    label="Usuário"
                  >
                    <MenuItem value="">Nenhum</MenuItem>
                    {usuarios.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Dual List de Clientes */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              3. Selecione os Clientes
            </Typography>
          </Grid>

          <Grid item xs={12} md={5}>
            <Typography variant="subtitle2" gutterBottom>
              Clientes Disponíveis ({filteredLeft.length})
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar..."
              variant="outlined"
              value={searchLeft}
              onChange={(e) => setSearchLeft(e.target.value)}
              className={classes.searchField}
              InputProps={{
                startAdornment: <SearchIcon />,
              }}
            />
            <Paper className={classes.listBox}>
              {loading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : (
                <List dense>
                  {filteredLeft.map((cliente) => (
                    <ListItem
                      key={cliente.id}
                      button
                      onClick={() => handleToggleLeft(cliente)}
                      className={`${classes.listItem} ${
                        selectedLeft.find((c) => c.id === cliente.id)
                          ? classes.selectedItem
                          : ""
                      }`}
                    >
                      <Checkbox
                        edge="start"
                        checked={selectedLeft.findIndex((c) => c.id === cliente.id) !== -1}
                        tabIndex={-1}
                        disableRipple
                      />
                      <ListItemText
                        primary={cliente.nome}
                        secondary={cliente.cnpj || cliente.cpf}
                      />
                    </ListItem>
                  ))}
                  {filteredLeft.length === 0 && (
                    <Typography variant="body2" align="center" color="textSecondary">
                      Nenhum cliente disponível
                    </Typography>
                  )}
                </List>
              )}
            </Paper>
          </Grid>

          {/* Botões de Transferência */}
          <Grid item xs={12} md={2}>
            <Box className={classes.transferButtons}>
              <Button
                variant="outlined"
                onClick={handleMoveRight}
                disabled={selectedLeft.length === 0}
                startIcon={<ArrowForwardIcon />}
              >
                Adicionar
              </Button>
              <Button
                variant="outlined"
                onClick={handleMoveLeft}
                disabled={selectedRight.length === 0}
                startIcon={<ArrowBackIcon />}
              >
                Remover
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <Typography variant="subtitle2" gutterBottom>
              Clientes Selecionados ({filteredRight.length})
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar..."
              variant="outlined"
              value={searchRight}
              onChange={(e) => setSearchRight(e.target.value)}
              className={classes.searchField}
              InputProps={{
                startAdornment: <SearchIcon />,
              }}
            />
            <Paper className={classes.listBox}>
              <List dense>
                {filteredRight.map((cliente) => (
                  <ListItem
                    key={cliente.id}
                    button
                    onClick={() => handleToggleRight(cliente)}
                    className={`${classes.listItem} ${
                      selectedRight.find((c) => c.id === cliente.id)
                        ? classes.selectedItem
                        : ""
                    }`}
                  >
                    <Checkbox
                      edge="start"
                      checked={selectedRight.findIndex((c) => c.id === cliente.id) !== -1}
                      tabIndex={-1}
                      disableRipple
                    />
                    <ListItemText
                      primary={cliente.nome}
                      secondary={cliente.cnpj || cliente.cpf}
                    />
                  </ListItem>
                ))}
                {filteredRight.length === 0 && (
                  <Typography variant="body2" align="center" color="textSecondary">
                    Nenhum cliente selecionado
                  </Typography>
                )}
              </List>
            </Paper>
          </Grid>

          {/* Observações */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observações"
              variant="outlined"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </Grid>

          {/* Opções */}
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <Box display="flex" alignItems="center">
                <Checkbox
                  checked={gerarTarefas}
                  onChange={(e) => setGerarTarefas(e.target.checked)}
                  color="primary"
                />
                <Typography>Gerar tarefas automaticamente (para controles recorrentes)</Typography>
              </Box>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleVincular}
          variant="contained"
          color="primary"
          disabled={loading || clientesSelecionados.length === 0}
        >
          {loading ? <CircularProgress size={24} /> : `Vincular ${clientesSelecionados.length} Cliente(s)`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalVincular;
