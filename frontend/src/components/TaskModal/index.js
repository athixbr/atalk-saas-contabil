import React, { useState, useEffect, useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  IconButton,
  Box,
} from "@material-ui/core";
import { Add as AddIcon } from "@material-ui/icons";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { toast } from "react-toastify";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import TarefaConfigModal from "../TarefaConfigModal";

const TaskModal = ({ open, onClose, ticket, contact }) => {
  const { user } = useContext(AuthContext);
  
  const [tarefasConfig, setTarefasConfig] = useState([]);
  const [selectedTarefaConfig, setSelectedTarefaConfig] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [users, setUsers] = useState([]);
  const [tarefaConfigModalOpen, setTarefaConfigModalOpen] = useState(false);
  
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "Pendente",
    userId: user?.id || "",
    tarefaConfigId: null,
    prioridadeId: null,
    clienteId: null,
    departamentoId: null,
    dataHoraCriacao: new Date().toISOString().slice(0, 16),
    valor: "",
    ticketId: ticket?.id || null,
    contactId: contact?.id || null,
    contactName: contact?.name || "",
  });

  useEffect(() => {
    if (open) {
      loadTarefasConfig();
      loadClientes();
      loadPrioridades();
      loadDepartamentos();
      loadUsers();
      
      // Preenche dados do ticket/contato se fornecidos
      setTaskForm(prev => ({
        ...prev,
        ticketId: ticket?.id || null,
        contactId: contact?.id || null,
        contactName: contact?.name || "",
        clienteId: contact?.clienteId || null,
      }));
    }
  }, [open, ticket, contact]);

  const loadTarefasConfig = async (selectId = null) => {
    try {
      const { data } = await api.get("/tarefas-config", {
        params: { limit: 999999, ativo: "true" },
      });
      setTarefasConfig(data.tarefas || []);
      
      // Se foi passado um ID, seleciona automaticamente
      if (selectId) {
        const tarefaToSelect = (data.tarefas || []).find(t => t.id === selectId);
        if (tarefaToSelect) {
          setSelectedTarefaConfig(tarefaToSelect);
          handleTarefaConfigChange(null, tarefaToSelect);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar configurações de tarefas:", err);
    }
  };

  const loadClientes = async () => {
    try {
      const { data } = await api.get("/clientes", {
        params: { limit: 999999 },
      });
      setClientes(data.clientes || []);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
    }
  };

  const loadPrioridades = async () => {
    try {
      const { data } = await api.get("/parametros/prioridades");
      setPrioridades(data.prioridades || data || []);
    } catch (err) {
      console.error("Erro ao carregar prioridades:", err);
    }
  };

  const loadDepartamentos = async () => {
    try {
      const { data } = await api.get("/departamentos");
      setDepartamentos(data.departamentos || []);
    } catch (err) {
      console.error("Erro ao carregar departamentos:", err);
    }
  };

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data.users || data || []);
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
    }
  };

  const handleTarefaConfigChange = (event, newValue) => {
    setSelectedTarefaConfig(newValue);

    if (newValue) {
      // Calcula data de vencimento se configurado
      let dueDate = "";
      if (newValue.temVencimento && newValue.diasParaVencimento) {
        const dataHoraCriacao = taskForm.dataHoraCriacao || new Date().toISOString().slice(0, 16);
        const criacao = new Date(dataHoraCriacao);
        const vencimento = new Date(criacao.getTime() + newValue.diasParaVencimento * 24 * 60 * 60 * 1000);
        dueDate = vencimento.toISOString().slice(0, 16);
      }

      setTaskForm({
        ...taskForm,
        tarefaConfigId: newValue.id,
        title: newValue.titulo,
        description: newValue.descricao || "",
        dueDate: dueDate,
        prioridadeId: newValue.prioridadeId || taskForm.prioridadeId,
        departamentoId: newValue.departamentoId || taskForm.departamentoId,
      });
    } else {
      setTaskForm({
        ...taskForm,
        tarefaConfigId: null,
        title: "",
        description: "",
        dueDate: "",
      });
    }
  };

  const handleSaveTask = async () => {
    try {
      if (!taskForm.tarefaConfigId) {
        toast.error("Por favor, selecione uma tarefa");
        return;
      }

      if (!taskForm.dataHoraCriacao) {
        toast.error("Por favor, informe a data/hora de criação");
        return;
      }

      const payload = {
        title: taskForm.title || selectedTarefaConfig?.titulo,
        description: taskForm.description || selectedTarefaConfig?.descricao,
        dueDate: taskForm.dueDate || null,
        status: taskForm.status,
        userId: taskForm.userId,
        tarefaConfigId: taskForm.tarefaConfigId,
        prioridadeId: taskForm.prioridadeId || null,
        clienteId: taskForm.clienteId || null,
        departamentoId: taskForm.departamentoId || null,
        dataHoraCriacao: taskForm.dataHoraCriacao,
        valor: taskForm.valor || null,
        ticketId: taskForm.ticketId || null,
        contactId: taskForm.contactId || null,
        contactName: taskForm.contactName || "",
      };

      await api.post("/tasks", payload);
      toast.success("Tarefa criada com sucesso!");
      handleClose();
    } catch (err) {
      console.error("Erro ao salvar tarefa:", err);
      const errorMsg = err.response?.data?.message || "Erro ao salvar tarefa";
      toast.error(errorMsg);
    }
  };

  const handleClose = () => {
    setSelectedTarefaConfig(null);
    setTaskForm({
      title: "",
      description: "",
      dueDate: "",
      status: "Pendente",
      userId: user?.id || "",
      tarefaConfigId: null,
      prioridadeId: null,
      clienteId: null,
      departamentoId: null,
      dataHoraCriacao: new Date().toISOString().slice(0, 16),
      valor: "",
      ticketId: null,
      contactId: null,
      contactName: "",
    });
    onClose();
  };

  const handleOpenTarefaConfigModal = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setTarefaConfigModalOpen(true);
  };

  const handleCloseTarefaConfigModal = () => {
    setTarefaConfigModalOpen(false);
  };

  const handleSaveTarefaConfig = (novaTarefa) => {
    // Recarregar a lista e selecionar a tarefa recém-criada
    loadTarefasConfig(novaTarefa.id);
    toast.success("Configuração salva! Agora você pode continuar criando a tarefa!");
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Nova Tarefa</Typography>
            <IconButton
              color="primary"
              onClick={handleOpenTarefaConfigModal}
              title="Criar Nova Configuração de Tarefa"
              size="small"
            >
              <AddIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Autocomplete
            options={tarefasConfig}
            getOptionLabel={(option) => option.titulo || ""}
            value={selectedTarefaConfig}
            onChange={handleTarefaConfigChange}
            autoHighlight
            openOnFocus
            renderInput={(params) => (
              <TextField
                {...params}
                label="Selecione uma Tarefa *"
                variant="outlined"
                margin="dense"
                fullWidth
                placeholder="Clique para selecionar uma tarefa..."
                style={{ marginBottom: 16, marginTop: 8 }}
              />
            )}
            noOptionsText="Nenhuma tarefa encontrada"
            loadingText="Carregando tarefas..."
          />

          {selectedTarefaConfig && (
            <Paper style={{ padding: 16, marginBottom: 16, backgroundColor: "#f5f5f5" }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Detalhes da Tarefa
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Descrição:</strong> {selectedTarefaConfig.descricao || "Sem descrição"}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Tem Vencimento:</strong> {selectedTarefaConfig.temVencimento ? "Sim" : "Não"}
              </Typography>
              {selectedTarefaConfig.temVencimento && (
                <>
                  <Typography variant="body2" gutterBottom>
                    <strong>Dias para Vencimento:</strong> {selectedTarefaConfig.diasParaVencimento || 0} dias
                  </Typography>
                  {selectedTarefaConfig.diasLembrete && (
                    <Typography variant="body2" gutterBottom>
                      <strong>Lembrete antes do vencimento:</strong> {selectedTarefaConfig.diasLembrete} dias
                    </Typography>
                  )}
                </>
              )}
              {selectedTarefaConfig.checklist && selectedTarefaConfig.checklist.length > 0 && (
                <>
                  <Typography variant="subtitle2" style={{ marginTop: 8 }} gutterBottom>
                    Checklist:
                  </Typography>
                  {selectedTarefaConfig.checklist.map((item, index) => (
                    <Typography key={index} variant="body2" style={{ paddingLeft: 16 }}>
                      • {typeof item === "string" ? item : item.text || item.texto || ""}
                    </Typography>
                  ))}
                </>
              )}
            </Paper>
          )}

          <Autocomplete
            options={clientes}
            getOptionLabel={(option) => {
              const codigo = option.codigoErp ? `[${option.codigoErp}] ` : "";
              const nome = option.nomeFantasia || option.razaoSocial || option.nome || "";
              return `${codigo}${nome}`;
            }}
            value={clientes.find((c) => c.id === taskForm.clienteId) || null}
            autoHighlight
            openOnFocus
            onChange={(event, newValue) => {
              setTaskForm({ ...taskForm, clienteId: newValue?.id || null });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Cliente"
                variant="outlined"
                margin="dense"
                fullWidth
                placeholder="Digite para buscar cliente..."
                style={{ marginBottom: 16 }}
              />
            )}
          />

          <FormControl fullWidth variant="outlined" style={{ marginBottom: 16 }}>
            <InputLabel>Prioridade</InputLabel>
            <Select
              value={taskForm.prioridadeId || ""}
              onChange={(e) => setTaskForm({ ...taskForm, prioridadeId: e.target.value || null })}
              label="Prioridade"
            >
              <MenuItem value="">
                <em>Nenhuma</em>
              </MenuItem>
              {prioridades.map((prioridade) => (
                <MenuItem key={prioridade.id} value={prioridade.id}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: prioridade.cor || "#757575",
                      marginRight: 8,
                    }}
                  ></span>
                  {prioridade.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth variant="outlined" style={{ marginBottom: 16 }}>
            <InputLabel>Responsável</InputLabel>
            <Select
              value={taskForm.userId || ""}
              onChange={(e) => setTaskForm({ ...taskForm, userId: e.target.value })}
              label="Responsável"
            >
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Data/Hora de Criação *"
            type="datetime-local"
            fullWidth
            variant="outlined"
            value={taskForm.dataHoraCriacao}
            onChange={(e) => {
              const newDataHoraCriacao = e.target.value;
              const newDueDate =
                selectedTarefaConfig?.temVencimento && selectedTarefaConfig?.diasParaVencimento
                  ? new Date(
                      new Date(newDataHoraCriacao).getTime() +
                        selectedTarefaConfig.diasParaVencimento * 24 * 60 * 60 * 1000
                    )
                      .toISOString()
                      .slice(0, 16)
                  : taskForm.dueDate;
              setTaskForm({
                ...taskForm,
                dataHoraCriacao: newDataHoraCriacao,
                dueDate: newDueDate,
              });
            }}
            InputLabelProps={{
              shrink: true,
            }}
            style={{ marginBottom: 16 }}
          />

          {selectedTarefaConfig?.temVencimento && (
            <TextField
              margin="dense"
              label="Data/Hora de Vencimento"
              type="datetime-local"
              fullWidth
              variant="outlined"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              InputLabelProps={{
                shrink: true,
              }}
              style={{ marginBottom: 16 }}
            />
          )}

          <FormControl fullWidth variant="outlined" style={{ marginBottom: 16 }}>
            <InputLabel>Departamento</InputLabel>
            <Select
              value={taskForm.departamentoId || ""}
              onChange={(e) => setTaskForm({ ...taskForm, departamentoId: e.target.value || null })}
              label="Departamento"
            >
              <MenuItem value="">
                <em>Nenhum</em>
              </MenuItem>
              {departamentos.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Valor"
            type="number"
            fullWidth
            variant="outlined"
            value={taskForm.valor}
            onChange={(e) => setTaskForm({ ...taskForm, valor: e.target.value })}
            style={{ marginBottom: 16 }}
          />

          {taskForm.contactName && (
            <Typography variant="caption" color="textSecondary" style={{ display: "block", marginTop: 8 }}>
              📞 Contato: <strong>{taskForm.contactName}</strong>
            </Typography>
          )}

          {ticket && (
            <Typography variant="caption" color="textSecondary" style={{ display: "block", marginTop: 4 }}>
              🎫 Ticket: <strong>#{ticket.id}</strong>
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={handleSaveTask}
            color="primary"
            variant="contained"
            disabled={!taskForm.tarefaConfigId || !taskForm.dataHoraCriacao}
          >
            Salvar Tarefa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para Criar Nova Configuração de Tarefa */}
      <TarefaConfigModal
        open={tarefaConfigModalOpen}
        onClose={handleCloseTarefaConfigModal}
        onSave={handleSaveTarefaConfig}
      />
    </>
  );
};

export default TaskModal;
