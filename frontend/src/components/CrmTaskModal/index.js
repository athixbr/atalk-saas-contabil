import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Typography
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";
import moment from "moment";

import api from "../../services/api";

const TaskSchema = Yup.object().shape({
  title: Yup.string().min(2, "Muito curto").required("Obrigatório"),
  userId: Yup.number().required("Obrigatório"),
  dueDate: Yup.date().required("Obrigatório"),
  stageId: Yup.number().required("Etapa é obrigatória")
});

const CrmTaskModal = ({ open, onClose, onSuccess, leadId, clientId, task, defaultStageId }) => {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stages, setStages] = useState([]);
  const [clients, setClients] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadUsers();
      loadCategories();
      loadStages();
      // Sempre carrega clientes e leads para o autocomplete
      loadClients();
      loadLeads();
    }
  }, [open]);

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCategories = async () => {
    try {
      const { data } = await api.get("/crm/task-categories");
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadStages = async () => {
    try {
      const { data } = await api.get("/crm/task-stages");
      setStages(data.stages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadClients = async () => {
    try {
      const { data } = await api.get("/clientes", { 
        params: { 
          ativo: true,
          limit: 9999 
        } 
      });
      setClients(data.clientes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadLeads = async () => {
    try {
      const { data } = await api.get("/crm/leads");
      setLeads(data.leads || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const taskData = {
        ...values,
        dueDate: moment(values.dueDate).format("YYYY-MM-DD HH:mm:ss")
      };

      // Se foi passado clientId/leadId como prop, usa eles
      if (leadId) {
        taskData.leadId = parseInt(leadId);
      } else if (clientId) {
        taskData.clienteId = parseInt(clientId);
      } else {
        // Senão, usa os valores selecionados no formulário
        if (values.selectedClientId) {
          taskData.clienteId = parseInt(values.selectedClientId);
        }
        if (values.selectedLeadId) {
          taskData.leadId = parseInt(values.selectedLeadId);
        }
      }

      if (task) {
        // Edição
        await api.put(`/crm/tasks/${task.id}`, taskData);
        toast.success("Tarefa atualizada com sucesso!");
      } else {
        // Criação
        await api.post("/crm/tasks", taskData);
        toast.success("Tarefa criada com sucesso!");
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Erro ao salvar tarefa";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const initialValues = {
    title: task?.title || "",
    description: task?.description || "",
    userId: task?.userId || "",
    categoryId: task?.categoryId || "",
    stageId: task?.stageId || defaultStageId || "",
    selectedClientId: task?.clienteId || "",
    selectedLeadId: task?.leadId || "",
    dueDate: task?.dueDate ? moment(task.dueDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
    priority: task?.priority || "medium",
    recurrence: task?.recurrence || "",
    reminderDays: task?.reminderDays || ""
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{task ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={TaskSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, setFieldValue }) => (
          <Form>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    label="Título"
                    name="title"
                    fullWidth
                    error={touched.title && Boolean(errors.title)}
                    helperText={touched.title && errors.title}
                    variant="outlined"
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    label="Descrição"
                    name="description"
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                  />
                </Grid>

                {/* Mostrar seleção de Cliente/Lead apenas se não foi passado como prop */}
                {!clientId && !leadId && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        options={clients}
                        getOptionLabel={(option) => {
                          let nome = "";
                          if (option.tipoCliente === "fisica" || option.tipo === "PF") {
                            nome = option.nome || "";
                          } else {
                            nome = option.nomeFantasia || option.razaoSocial || "";
                          }
                          const doc = option.tipoCliente === "juridica" || option.tipo === "PJ" 
                            ? option.cnpj 
                            : option.cpf;
                          return doc ? `${nome} (${doc})` : nome;
                        }}
                        value={clients.find(c => c.id === values.selectedClientId) || null}
                        onChange={(event, newValue) => {
                          setFieldValue("selectedClientId", newValue ? newValue.id : "");
                          if (newValue) {
                            setFieldValue("selectedLeadId", "");
                          }
                        }}
                        filterOptions={(options, state) => {
                          const inputValue = state.inputValue.toLowerCase();
                          return options.filter(option => {
                            const nome = (option.nome || option.nomeFantasia || option.razaoSocial || "").toLowerCase();
                            const doc = (option.cnpj || option.cpf || "").replace(/\D/g, "");
                            return nome.includes(inputValue) || doc.includes(inputValue.replace(/\D/g, ""));
                          });
                        }}
                        disabled={!!values.selectedLeadId}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Cliente"
                            variant="outlined"
                            placeholder="Digite para buscar..."
                          />
                        )}
                        noOptionsText="Nenhum cliente encontrado"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        options={leads}
                        getOptionLabel={(option) => option.name || ""}
                        value={leads.find(l => l.id === values.selectedLeadId) || null}
                        onChange={(event, newValue) => {
                          setFieldValue("selectedLeadId", newValue ? newValue.id : "");
                          if (newValue) {
                            setFieldValue("selectedClientId", "");
                          }
                        }}
                        disabled={!!values.selectedClientId}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Lead"
                            variant="outlined"
                            placeholder="Digite para buscar..."
                          />
                        )}
                        noOptionsText="Nenhum lead encontrado"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="caption" color="textSecondary">
                        * Selecione um Cliente OU um Lead para a tarefa
                      </Typography>
                    </Grid>
                  </>
                )}

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel>Responsável</InputLabel>
                    <Select
                      label="Responsável"
                      name="userId"
                      value={values.userId}
                      onChange={handleChange}
                      error={touched.userId && Boolean(errors.userId)}
                    >
                      <MenuItem value="">
                        <em>Selecione...</em>
                      </MenuItem>
                      {users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel>Etapa do Funil</InputLabel>
                    <Select
                      label="Etapa do Funil"
                      name="stageId"
                      value={values.stageId}
                      onChange={handleChange}
                      error={touched.stageId && Boolean(errors.stageId)}
                    >
                      <MenuItem value="">
                        <em>Selecione...</em>
                      </MenuItem>
                      {stages.map((stage) => (
                        <MenuItem key={stage.id} value={stage.id}>
                          {stage.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Categoria</InputLabel>
                    <Select
                      label="Categoria"
                      name="categoryId"
                      value={values.categoryId}
                      onChange={handleChange}
                    >
                      <MenuItem value="">
                        <em>Nenhuma</em>
                      </MenuItem>
                      {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Data de Vencimento"
                    name="dueDate"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    required
                    error={touched.dueDate && Boolean(errors.dueDate)}
                    helperText={touched.dueDate && errors.dueDate}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Prioridade</InputLabel>
                    <Select
                      label="Prioridade"
                      name="priority"
                      value={values.priority}
                      onChange={handleChange}
                    >
                      <MenuItem value="low">Baixa</MenuItem>
                      <MenuItem value="medium">Média</MenuItem>
                      <MenuItem value="high">Alta</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Recorrência</InputLabel>
                    <Select
                      label="Recorrência"
                      name="recurrence"
                      value={values.recurrence}
                      onChange={handleChange}
                    >
                      <MenuItem value="">
                        <em>Não recorrente</em>
                      </MenuItem>
                      <MenuItem value="monthly">Mensal</MenuItem>
                      <MenuItem value="quarterly">Trimestral (3 meses)</MenuItem>
                      <MenuItem value="semiannual">Semestral (6 meses)</MenuItem>
                      <MenuItem value="annual">Anual</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Lembrete (dias antes)"
                    name="reminderDays"
                    type="number"
                    fullWidth
                    variant="outlined"
                    placeholder="Ex: 3 (lembrete 3 dias antes)"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} color="secondary">
                Cancelar
              </Button>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Salvar"}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default CrmTaskModal;
