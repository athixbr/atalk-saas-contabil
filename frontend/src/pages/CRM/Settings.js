import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Chip from "@material-ui/core/Chip";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { Add, Edit, Delete, Save, Cancel } from "@material-ui/icons";
import { toast } from "react-toastify";
import { 
  getBusinessTypes,
  createBusinessType,
  updateBusinessType,
  deleteBusinessType,
  getTaxRegimes,
  createTaxRegime,
  updateTaxRegime,
  deleteTaxRegime,
  getSources,
  createSource,
  updateSource,
  deleteSource,
  getStages,
  createStage,
  updateStage,
  deleteStage,
  getTaskCategories,
  createTaskCategory,
  updateTaskCategory,
  deleteTaskCategory,
} from "../../services/crmApi";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
  },
  tabs: {
    marginBottom: theme.spacing(3),
    backgroundColor: "#fff",
    borderRadius: "12px",
  },
  tab: {
    minWidth: 120,
    fontWeight: 500,
  },
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: theme.spacing(2),
  },
  addButton: {
    background: "linear-gradient(135deg, #0596cd 0%, #047ba5 100%)",
    color: "#fff",
    "&:hover": {
      background: "linear-gradient(135deg, #047ba5 0%, #035c7d 100%)",
    },
  },
  colorInput: {
    width: "100%",
    height: "40px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    cursor: "pointer",
  },
  chipActive: {
    backgroundColor: theme.palette.success.main,
    color: "#fff",
  },
  chipInactive: {
    backgroundColor: theme.palette.error.main,
    color: "#fff",
  },
}));

const CRMSettings = () => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [businessTypes, setBusinessTypes] = useState([]);
  const [taxRegimes, setTaxRegimes] = useState([]);
  const [sources, setSources] = useState([]);
  const [stages, setStages] = useState([]);
  const [taskCategories, setTaskCategories] = useState([]);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    order: "",
    color: "#0596cd",
    type: "",
    icon: "",
    active: true,
  });

  useEffect(() => {
    loadData();
  }, [tabValue]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (tabValue) {
        case 0:
          const bt = await getBusinessTypes();
          setBusinessTypes(bt);
          break;
        case 1:
          const tr = await getTaxRegimes();
          setTaxRegimes(tr);
          break;
        case 2:
          const src = await getSources();
          setSources(src);
          break;
        case 3:
          const stg = await getStages();
          setStages(stg.sort((a, b) => a.order - b.order));
          break;
        case 4:
          const tc = await getTaskCategories();
          setTaskCategories(tc);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setSelectedItem(null);
    setFormData({
      name: "",
      description: "",
      order: "",
      color: "#0596cd",
      type: "",
      icon: "",
      active: true,
    });
    setModalOpen(true);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name || "",
      description: item.description || "",
      order: item.order || "",
      color: item.color || "#0596cd",
      type: item.type || "",
      icon: item.icon || "",
      active: item.active !== undefined ? item.active : true,
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  const handleSave = async () => {
    try {
      if (!formData.name) {
        toast.error("Nome é obrigatório");
        return;
      }

      let apiCall;
      
      switch (tabValue) {
        case 0: // Business Types
          apiCall = selectedItem
            ? updateBusinessType(selectedItem.id, formData)
            : createBusinessType(formData);
          break;
        case 1: // Tax Regimes
          apiCall = selectedItem
            ? updateTaxRegime(selectedItem.id, formData)
            : createTaxRegime(formData);
          break;
        case 2: // Sources
          apiCall = selectedItem
            ? updateSource(selectedItem.id, formData)
            : createSource(formData);
          break;
        case 3: // Stages
          if (!formData.order) {
            toast.error("Ordem é obrigatória para etapas");
            return;
          }
          apiCall = selectedItem
            ? updateStage(selectedItem.id, formData)
            : createStage(formData);
          break;
        case 4: // Task Categories
          apiCall = selectedItem
            ? updateTaskCategory(selectedItem.id, formData)
            : createTaskCategory(formData);
          break;
        default:
          return;
      }

      await apiCall;
      toast.success(selectedItem ? "Atualizado com sucesso!" : "Criado com sucesso!");
      handleCloseModal();
      loadData();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este item?")) {
      return;
    }

    try {
      switch (tabValue) {
        case 0:
          await deleteBusinessType(id);
          break;
        case 1:
          await deleteTaxRegime(id);
          break;
        case 2:
          await deleteSource(id);
          break;
        case 3:
          await deleteStage(id);
          break;
        case 4:
          await deleteTaskCategory(id);
          break;
        default:
          return;
      }

      toast.success("Excluído com sucesso!");
      loadData();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error("Erro ao excluir");
    }
  };

  const renderTable = () => {
    let data = [];
    let columns = [];

    switch (tabValue) {
      case 0: // Business Types
        data = businessTypes;
        columns = [
          { id: "name", label: "Nome" },
          { id: "description", label: "Descrição" },
          { id: "active", label: "Status" },
        ];
        break;
      case 1: // Tax Regimes
        data = taxRegimes;
        columns = [
          { id: "name", label: "Nome" },
          { id: "description", label: "Descrição" },
          { id: "active", label: "Status" },
        ];
        break;
      case 2: // Sources
        data = sources;
        columns = [
          { id: "name", label: "Nome" },
          { id: "description", label: "Descrição" },
          { id: "active", label: "Status" },
        ];
        break;
      case 3: // Stages
        data = stages;
        columns = [
          { id: "order", label: "Ordem" },
          { id: "name", label: "Nome" },
          { id: "color", label: "Cor" },
          { id: "active", label: "Status" },
        ];
        break;
      case 4: // Task Categories
        data = taskCategories;
        columns = [
          { id: "name", label: "Nome" },
          { id: "type", label: "Tipo" },
          { id: "icon", label: "Ícone" },
          { id: "color", label: "Cor" },
          { id: "active", label: "Status" },
        ];
        break;
      default:
        break;
    }

    return (
      <TableContainer className={classes.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id}>
                  <strong>{column.label}</strong>
                </TableCell>
              ))}
              <TableCell align="right">
                <strong>Ações</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center">
                  <Typography variant="body2" color="textSecondary">
                    Nenhum registro encontrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id} hover>
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      {column.id === "active" ? (
                        <Chip
                          label={item[column.id] ? "Ativo" : "Inativo"}
                          size="small"
                          className={
                            item[column.id]
                              ? classes.chipActive
                              : classes.chipInactive
                          }
                        />
                      ) : column.id === "color" ? (
                        <div
                          style={{
                            width: 40,
                            height: 24,
                            backgroundColor: item[column.id],
                            borderRadius: 4,
                            border: "1px solid #ccc",
                          }}
                        />
                      ) : (
                        item[column.id] || "-"
                      )}
                    </TableCell>
                  ))}
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEditItem(item)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(item.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderModalFields = () => {
    switch (tabValue) {
      case 0: // Business Types
      case 1: // Tax Regimes
      case 2: // Sources
        return (
          <>
            <Grid item xs={12}>
              <TextField
                label="Nome *"
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descrição"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    color="primary"
                  />
                }
                label="Ativo"
              />
            </Grid>
          </>
        );
      case 3: // Stages
        return (
          <>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Nome *"
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Ordem *"
                fullWidth
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Cor da Etapa
              </Typography>
              <input
                type="color"
                className={classes.colorInput}
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    color="primary"
                  />
                }
                label="Ativo"
              />
            </Grid>
          </>
        );
      case 4: // Task Categories
        return (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nome *"
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tipo"
                fullWidth
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="ex: comercial, suporte, operacional"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Ícone"
                fullWidth
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="ex: phone, email, task"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" gutterBottom>
                Cor
              </Typography>
              <input
                type="color"
                className={classes.colorInput}
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    color="primary"
                  />
                }
                label="Ativo"
              />
            </Grid>
          </>
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    const titles = [
      "Tipo de Negócio",
      "Regime Tributário",
      "Fonte de Lead",
      "Etapa do Funil",
      "Categoria de Tarefa",
    ];
    return `${selectedItem ? "Editar" : "Novo"} ${titles[tabValue]}`;
  };

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <div>
          <Typography variant="h5" gutterBottom>
            Configurações do CRM
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gerencie as configurações do sistema CRM
          </Typography>
        </div>
        <Button
          variant="contained"
          className={classes.addButton}
          startIcon={<Add />}
          onClick={handleOpenModal}
        >
          Adicionar
        </Button>
      </div>

      <Paper className={classes.tabs} elevation={0}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Tipos de Negócio" className={classes.tab} />
          <Tab label="Regimes Tributários" className={classes.tab} />
          <Tab label="Fontes de Lead" className={classes.tab} />
          <Tab label="Etapas do Funil" className={classes.tab} />
          <Tab label="Categorias de Tarefas" className={classes.tab} />
        </Tabs>
      </Paper>

      {renderTable()}

      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{getModalTitle()}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: 8 }}>
            {renderModalFields()}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} startIcon={<Cancel />}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            className={classes.addButton}
            startIcon={<Save />}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CRMSettings;
