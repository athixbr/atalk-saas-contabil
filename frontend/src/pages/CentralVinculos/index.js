import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import {
  Paper,
  Typography,
  makeStyles,
  Grid,
  Button,
  IconButton,
  Tooltip,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Checkbox,
  Box,
} from "@material-ui/core";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  Link as LinkIcon,
  LinkOff as UnlinkIcon,
  PlayArrow as PlayArrowIcon,
  Delete as DeleteIcon,
  DateRange as DateRangeIcon,
  GetApp as GetAppIcon,
  FilterList as FilterListIcon,
  ArrowUpward,
  ArrowDownward,
  SwapHoriz as SwapHorizIcon,
} from "@material-ui/icons";
import { toast } from "react-toastify";
import Pagination from "@material-ui/lab/Pagination";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import ModalEditarDatas from "./components/ModalEditarDatas";
import DrawerHistorico from "./components/DrawerHistorico";
import ModalGerarTarefas from "./components/ModalGerarTarefas";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(3),
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
  },
  addButton: {
    background: "linear-gradient(135deg, #0596cd 0%, #047ba5 100%)",
    color: "#fff",
    "&:hover": {
      background: "linear-gradient(135deg, #047ba5 0%, #035c7d 100%)",
    },
  },
  statsCard: {
    padding: theme.spacing(3),
    borderRadius: "16px",
    height: "100%",
    background: "linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  statsValue: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: theme.spacing(1),
  },
  statsLabel: {
    color: theme.palette.text.secondary,
    fontSize: "0.875rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tablePaper: {
    padding: theme.spacing(3),
    borderRadius: "16px",
    marginTop: theme.spacing(3),
  },
  filtersContainer: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: "16px",
    backgroundColor: "#f5f5f5",
  },
  filterField: {
    minWidth: 200,
    backgroundColor: "#fff",
    borderRadius: "8px",
  },
  pagination: {
    marginTop: theme.spacing(3),
    display: "flex",
    justifyContent: "center",
  },
  tableHeader: {
    backgroundColor: "#f5f5f5",
    fontWeight: 600,
  },
  tableHeaderCell: {
    padding: "8px 16px",
    cursor: "pointer",
    userSelect: "none",
    "&:hover": {
      backgroundColor: "#e0e0e0",
    },
  },
  chipAtivo: {
    backgroundColor: theme.palette.success.main,
    color: "#fff",
    fontWeight: 600,
  },
  chipInativo: {
    backgroundColor: theme.palette.error.main,
    color: "#fff",
    fontWeight: 600,
  },
  chipVencendo: {
    backgroundColor: theme.palette.warning.main,
    color: "#fff",
    fontWeight: 600,
  },
  actionButton: {
    margin: theme.spacing(0.5),
  },
  bulkActionsBar: {
    backgroundColor: "#e3f2fd",
    padding: theme.spacing(2),
    borderRadius: "8px",
    marginBottom: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sortIcon: {
    fontSize: 16,
    marginLeft: 4,
    verticalAlign: "middle",
  },
}));

const CentralVinculos = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const history = useHistory();

  const [vinculos, setVinculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedVinculos, setSelectedVinculos] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [searchParam, setSearchParam] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("true");
  const [controleConfigId, setControleConfigId] = useState("");
  const [tarefaConfigId, setTarefaConfigId] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");
  const [filtroCodigoErp, setFiltroCodigoErp] = useState("");
  const [filtroDocumento, setFiltroDocumento] = useState("");
  const [dataInicioMin, setDataInicioMin] = useState("");
  const [dataInicioMax, setDataInicioMax] = useState("");
  const [dataFimMin, setDataFimMin] = useState("");
  const [dataFimMax, setDataFimMax] = useState("");
  const [tipoVinculo, setTipoVinculo] = useState("");
  const [filterScope, setFilterScope] = useState(user?.profile === "admin" ? "all" : "mine");
  const [usuarioId, setUsuarioId] = useState("");

  const [orderBy, setOrderBy] = useState("id");
  const [orderDirection, setOrderDirection] = useState("desc");

  const [stats, setStats] = useState({
    totalVinculos: 0,
    vinculosAtivos: 0,
    vinculosInativos: 0,
    proximosVencimentos: [],
  });

  const [controles, setControles] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [openEditarDatasModal, setOpenEditarDatasModal] = useState(false);
  const [openHistoricoDrawer, setOpenHistoricoDrawer] = useState(false);
  const [openGerarTarefasModal, setOpenGerarTarefasModal] = useState(false);
  const [vinculoSelecionado, setVinculoSelecionado] = useState(null);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);

  const [openBulkEditModal, setOpenBulkEditModal] = useState(false);
  const [openBulkDeleteDialog, setOpenBulkDeleteDialog] = useState(false);
  const [openTransferModal, setOpenTransferModal] = useState(false);
  const [openBulkTransferModal, setOpenBulkTransferModal] = useState(false);
  const [openEditCompleteModal, setOpenEditCompleteModal] = useState(false);
  const [openBulkEditCompleteModal, setOpenBulkEditCompleteModal] = useState(false);
  const [bulkDataInicio, setBulkDataInicio] = useState("");
  const [bulkDataFim, setBulkDataFim] = useState("");
  const [bulkObservacao, setBulkObservacao] = useState("");
  const [transferUsuarioId, setTransferUsuarioId] = useState("");
  const [transferDepartamentoId, setTransferDepartamentoId] = useState("");
  const [editDataInicio, setEditDataInicio] = useState("");
  const [editDataFim, setEditDataFim] = useState("");
  const [editDepartamentoId, setEditDepartamentoId] = useState("");
  const [editUsuarioId, setEditUsuarioId] = useState("");
  const [editObservacao, setEditObservacao] = useState("");

  useEffect(() => {
    carregarVinculos();
  }, [
    page,
    searchParam,
    filtroAtivo,
    controleConfigId,
    tarefaConfigId,
    departamentoId,
    filtroCodigoErp,
    filtroDocumento,
    dataInicioMin,
    dataInicioMax,
    dataFimMin,
    dataFimMax,
    tipoVinculo,
    filterScope,
    usuarioId,
    orderBy,
    orderDirection,
  ]);

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  useEffect(() => {
    carregarControles();
    carregarTarefas();
    carregarDepartamentos();
    carregarUsuarios();
  }, []);

  useEffect(() => {
    setSelectedVinculos([]);
    setSelectAll(false);
  }, [page]);

  const carregarVinculos = async () => {
    try {
      setLoading(true);
      const params = {
        pageNumber: page,
        pageSize,
      };

      if (searchParam) params.searchParam = searchParam;
      if (filtroAtivo !== "") params.ativo = filtroAtivo;
      if (controleConfigId) params.controleConfigId = controleConfigId;
      if (tarefaConfigId) params.tarefaConfigId = tarefaConfigId;
      if (departamentoId) params.departamentoId = departamentoId;
      if (dataInicioMin) params.dataInicioMin = dataInicioMin;
      if (dataInicioMax) params.dataInicioMax = dataInicioMax;
      if (dataFimMin) params.dataFimMin = dataFimMin;
      if (dataFimMax) params.dataFimMax = dataFimMax;

      // Adicionar filtro de escopo
      if (filterScope === "mine") {
        params.usuarioId = user.id;
      } else if (filterScope === "department") {
        // Buscar vínculos do departamento do usuário
        // Será tratado no backend ou via filtro client-side
      }

      // Adicionar filtro de usuário específico
      if (usuarioId) {
        params.usuarioId = usuarioId;
      }

      const { data } = await api.get("/controle-clientes/vinculos", { params });

      let vinculosFiltrados = data.vinculos || [];

      // Filtro de escopo pelo departamento (client-side se backend não suportar)
      if (filterScope === "department" && !usuarioId) {
        const userDepartamentos = user.departamentos?.map(d => d.id) || [];
        vinculosFiltrados = vinculosFiltrados.filter((v) =>
          userDepartamentos.includes(v.departamentoId)
        );
      }

      if (tipoVinculo === "controle") {
        vinculosFiltrados = vinculosFiltrados.filter((v) => v.controleConfigId);
      } else if (tipoVinculo === "tarefa") {
        vinculosFiltrados = vinculosFiltrados.filter((v) => v.tarefaConfigId);
      }

      if (filtroCodigoErp) {
        vinculosFiltrados = vinculosFiltrados.filter((v) =>
          v.cliente?.codigoErp?.toLowerCase().includes(filtroCodigoErp.toLowerCase())
        );
      }

      if (filtroDocumento) {
        vinculosFiltrados = vinculosFiltrados.filter((v) =>
          (v.cliente?.cpf?.includes(filtroDocumento) ||
            v.cliente?.cnpj?.includes(filtroDocumento))
        );
      }

      vinculosFiltrados.sort((a, b) => {
        let aValue, bValue;

        switch (orderBy) {
          case "cliente":
            aValue = a.cliente?.nome || "";
            bValue = b.cliente?.nome || "";
            break;
          case "controle":
            aValue = a.controleConfig?.nome || a.tarefaConfig?.titulo || "";
            bValue = b.controleConfig?.nome || b.tarefaConfig?.titulo || "";
            break;
          case "dataInicio":
            aValue = a.dataInicio || "";
            bValue = b.dataInicio || "";
            break;
          case "dataFim":
            aValue = a.dataFim || "";
            bValue = b.dataFim || "";
            break;
          case "departamento":
            aValue = a.departamento?.nome || "";
            bValue = b.departamento?.nome || "";
            break;
          default:
            aValue = a[orderBy];
            bValue = b[orderBy];
        }

        if (aValue < bValue) return orderDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return orderDirection === "asc" ? 1 : -1;
        return 0;
      });

      setVinculos(vinculosFiltrados);
      setTotalCount(vinculosFiltrados.length);
      setTotalPages(Math.ceil(vinculosFiltrados.length / pageSize));
    } catch (err) {
      console.error("Erro ao carregar vínculos:", err);
      toast.error("Erro ao carregar vínculos");
    } finally {
      setLoading(false);
    }
  };

  const carregarEstatisticas = async () => {
    try {
      const { data } = await api.get("/controle-clientes/estatisticas");
      setStats(data);
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
    }
  };

  const carregarControles = async () => {
    try {
      const { data } = await api.get("/controles-config");
      setControles(data.controles || data || []);
    } catch (err) {
      console.error("Erro ao carregar controles:", err);
    }
  };

  const carregarTarefas = async () => {
    try {
      const { data } = await api.get("/tarefas-config");
      setTarefas(data.tarefas || data || []);
    } catch (err) {
      console.error("Erro ao carregar tarefas:", err);
    }
  };

  const carregarDepartamentos = async () => {
    try {
      const { data } = await api.get("/departamentos");
      setDepartamentos(data.departamentos || data || []);
    } catch (err) {
      console.error("Erro ao carregar departamentos:", err);
    }
  };

  const carregarUsuarios = async () => {
    try {
      const { data } = await api.get("/users");
      setUsuarios(data.users || data || []);
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleSort = (column) => {
    if (orderBy === column) {
      setOrderDirection(orderDirection === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(column);
      setOrderDirection("asc");
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedVinculos([]);
    } else {
      setSelectedVinculos(vinculos.map((v) => v.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectVinculo = (vinculoId) => {
    if (selectedVinculos.includes(vinculoId)) {
      setSelectedVinculos(selectedVinculos.filter((id) => id !== vinculoId));
    } else {
      setSelectedVinculos([...selectedVinculos, vinculoId]);
    }
  };

  const handleDesvincular = async (vinculo) => {
    setVinculoSelecionado(vinculo);
    setConfirmDeleteDialog(true);
  };

  const confirmarDesvincular = async () => {
    if (!vinculoSelecionado) return;

    try {
      await api.delete(`/controle-clientes/vinculos/${vinculoSelecionado.id}`, {
        data: {
          observacao: "Desvinculado pela Central de Vínculos",
          excluirDefinitivamente: false,
        },
      });
      toast.success("Vínculo desativado com sucesso!");
      setConfirmDeleteDialog(false);
      setVinculoSelecionado(null);
      carregarVinculos();
      carregarEstatisticas();
    } catch (err) {
      console.error("Erro ao desvincular:", err);
      toast.error("Erro ao desvincular controle");
    }
  };

  const handleEditarDatas = (vinculo) => {
    setVinculoSelecionado(vinculo);
    setOpenEditarDatasModal(true);
  };

  const handleGerarTarefas = (vinculo) => {
    setVinculoSelecionado(vinculo);
    setOpenGerarTarefasModal(true);
  };

  const handleVerHistorico = (vinculo) => {
    setVinculoSelecionado(vinculo);
    setOpenHistoricoDrawer(true);
  };

  const handleSuccess = () => {
    carregarVinculos();
    carregarEstatisticas();
  };

  const handleBulkEdit = () => {
    if (selectedVinculos.length === 0) {
      toast.warning("Selecione pelo menos um vínculo");
      return;
    }
    setOpenBulkEditModal(true);
  };

  const handleBulkDelete = () => {
    if (selectedVinculos.length === 0) {
      toast.warning("Selecione pelo menos um vínculo");
      return;
    }
    setOpenBulkDeleteDialog(true);
  };

  const handleTransferir = (vinculo) => {
    setVinculoSelecionado(vinculo);
    setTransferUsuarioId(vinculo.usuarioId || "");
    setTransferDepartamentoId(vinculo.departamentoId || "");
    setOpenTransferModal(true);
  };

  const handleBulkTransferir = () => {
    if (selectedVinculos.length === 0) {
      toast.warning("Selecione pelo menos um vínculo");
      return;
    }
    setTransferUsuarioId("");
    setTransferDepartamentoId("");
    setOpenBulkTransferModal(true);
  };

  const handleEditarCompleto = (vinculo) => {
    setVinculoSelecionado(vinculo);
    setEditDataInicio(vinculo.dataInicio ? vinculo.dataInicio.split('T')[0] : "");
    setEditDataFim(vinculo.dataFim ? vinculo.dataFim.split('T')[0] : "");
    setEditDepartamentoId(vinculo.departamentoId || "");
    setEditUsuarioId(vinculo.usuarioId || "");
    setEditObservacao("");
    setOpenEditCompleteModal(true);
  };

  const handleBulkEditarCompleto = () => {
    if (selectedVinculos.length === 0) {
      toast.warning("Selecione pelo menos um vínculo");
      return;
    }
    setEditDataInicio("");
    setEditDataFim("");
    setEditDepartamentoId("");
    setEditUsuarioId("");
    setEditObservacao("");
    setOpenBulkEditCompleteModal(true);
  };

  const confirmarTransferir = async () => {
    if (!vinculoSelecionado) return;
    if (!transferUsuarioId && !transferDepartamentoId) {
      toast.error("Selecione um usuário ou departamento");
      return;
    }

    try {
      setLoading(true);
      await api.put(`/controle-clientes/vinculos/${vinculoSelecionado.id}/responsavel`, {
        usuarioId: transferUsuarioId ? parseInt(transferUsuarioId) : null,
        departamentoId: transferDepartamentoId ? parseInt(transferDepartamentoId) : null,
        observacao: `Transferido para ${transferUsuarioId ? usuarios.find(u => u.id === parseInt(transferUsuarioId))?.name : departamentos.find(d => d.id === parseInt(transferDepartamentoId))?.nome}`,
      });

      toast.success("Vínculo transferido com sucesso!");
      setOpenTransferModal(false);
      setVinculoSelecionado(null);
      setTransferUsuarioId("");
      setTransferDepartamentoId("");
      carregarVinculos();
      carregarEstatisticas();
    } catch (err) {
      console.error("Erro ao transferir vínculo:", err);
      toast.error(err.response?.data?.message || "Erro ao transferir vínculo");
    } finally {
      setLoading(false);
    }
  };

  const confirmarBulkTransferir = async () => {
    if (!transferUsuarioId && !transferDepartamentoId) {
      toast.error("Selecione um usuário ou departamento");
      return;
    }

    try {
      setLoading(true);
      const promises = selectedVinculos.map((id) =>
        api.put(`/controle-clientes/vinculos/${id}/responsavel`, {
          usuarioId: transferUsuarioId ? parseInt(transferUsuarioId) : null,
          departamentoId: transferDepartamentoId ? parseInt(transferDepartamentoId) : null,
          observacao: `Transferido em lote para ${transferUsuarioId ? usuarios.find(u => u.id === parseInt(transferUsuarioId))?.name : departamentos.find(d => d.id === parseInt(transferDepartamentoId))?.nome}`,
        })
      );

      await Promise.all(promises);

      toast.success("Vínculos transferidos com sucesso!");
      setOpenBulkTransferModal(false);
      setTransferUsuarioId("");
      setTransferDepartamentoId("");
      setSelectedVinculos([]);
      setSelectAll(false);
      carregarVinculos();
      carregarEstatisticas();
    } catch (err) {
      console.error("Erro ao transferir vínculos:", err);
      toast.error(err.response?.data?.message || "Erro ao transferir vínculos em lote");
    } finally {
      setLoading(false);
    }
  };

  const confirmarEditarCompleto = async () => {
    if (!vinculoSelecionado) return;

    try {
      setLoading(true);
      const updates = [];

      // Atualizar datas se alteradas
      if (editDataInicio) {
        updates.push(
          api.put(`/controle-clientes/vinculos/${vinculoSelecionado.id}/datas`, {
            dataInicio: editDataInicio,
            dataFim: editDataFim || null,
            observacao: editObservacao || "Dados do vínculo editados",
          })
        );
      }

      // Atualizar responsável se alterado
      if (editDepartamentoId || editUsuarioId) {
        updates.push(
          api.put(`/controle-clientes/vinculos/${vinculoSelecionado.id}/responsavel`, {
            departamentoId: editDepartamentoId ? parseInt(editDepartamentoId) : null,
            usuarioId: editUsuarioId ? parseInt(editUsuarioId) : null,
            observacao: editObservacao || "Responsável do vínculo alterado",
          })
        );
      }

      if (updates.length === 0) {
        toast.warning("Nenhuma alteração foi realizada");
        return;
      }

      await Promise.all(updates);

      toast.success("Vínculo editado com sucesso!");
      setOpenEditCompleteModal(false);
      setVinculoSelecionado(null);
      setEditDataInicio("");
      setEditDataFim("");
      setEditDepartamentoId("");
      setEditUsuarioId("");
      setEditObservacao("");
      carregarVinculos();
      carregarEstatisticas();
    } catch (err) {
      console.error("Erro ao editar vínculo:", err);
      toast.error(err.response?.data?.message || "Erro ao editar vínculo");
    } finally {
      setLoading(false);
    }
  };

  const confirmarBulkEditarCompleto = async () => {
    if (!editDataInicio && !editDepartamentoId && !editUsuarioId) {
      toast.error("Informe pelo menos um campo para editar");
      return;
    }

    try {
      setLoading(true);
      const promises = [];

      // Atualizar datas em lote se informadas
      if (editDataInicio) {
        promises.push(
          api.put("/controle-clientes/vinculos/lote/datas", {
            vinculos: selectedVinculos.map((id) => ({
              controleClienteId: id,
              dataInicio: editDataInicio,
              dataFim: editDataFim || null,
            })),
            observacao: editObservacao || "Dados editados em lote",
          })
        );
      }

      // Atualizar responsável em lote se informado
      if (editDepartamentoId || editUsuarioId) {
        selectedVinculos.forEach((id) => {
          promises.push(
            api.put(`/controle-clientes/vinculos/${id}/responsavel`, {
              departamentoId: editDepartamentoId ? parseInt(editDepartamentoId) : null,
              usuarioId: editUsuarioId ? parseInt(editUsuarioId) : null,
              observacao: editObservacao || "Responsável alterado em lote",
            })
          );
        });
      }

      await Promise.all(promises);

      toast.success("Vínculos editados com sucesso!");
      setOpenBulkEditCompleteModal(false);
      setEditDataInicio("");
      setEditDataFim("");
      setEditDepartamentoId("");
      setEditUsuarioId("");
      setEditObservacao("");
      setSelectedVinculos([]);
      setSelectAll(false);
      carregarVinculos();
      carregarEstatisticas();
    } catch (err) {
      console.error("Erro ao editar vínculos:", err);
      toast.error(err.response?.data?.message || "Erro ao editar vínculos em lote");
    } finally {
      setLoading(false);
    }
  };

  const confirmarBulkEdit = async () => {
    if (!bulkDataInicio) {
      toast.error("Informe a data de início");
      return;
    }

    try {
      setLoading(true);
      const vinculos = selectedVinculos.map((id) => ({
        controleClienteId: id,
        dataInicio: bulkDataInicio,
        dataFim: bulkDataFim || null,
      }));

      const { data } = await api.put("/controle-clientes/vinculos/lote/datas", {
        vinculos,
        observacao: bulkObservacao || "Datas alteradas em lote",
      });

      toast.success(data.message);
      if (data.erros && data.erros.length > 0) {
        toast.warning(`${data.erros.length} vínculo(s) com erro`);
      }

      setOpenBulkEditModal(false);
      setBulkDataInicio("");
      setBulkDataFim("");
      setBulkObservacao("");
      setSelectedVinculos([]);
      setSelectAll(false);
      carregarVinculos();
      carregarEstatisticas();
    } catch (err) {
      console.error("Erro ao alterar datas em lote:", err);
      toast.error(err.response?.data?.message || "Erro ao alterar datas em lote");
    } finally {
      setLoading(false);
    }
  };

  const confirmarBulkDelete = async () => {
    try {
      setLoading(true);
      const { data } = await api.post("/controle-clientes/vinculos/lote/desvincular", {
        controleClienteIds: selectedVinculos,
        observacao: bulkObservacao || "Vínculos desativados em lote",
        excluirDefinitivamente: false,
      });

      toast.success(data.message);
      if (data.erros && data.erros.length > 0) {
        toast.warning(`${data.erros.length} vínculo(s) com erro`);
      }

      setOpenBulkDeleteDialog(false);
      setBulkObservacao("");
      setSelectedVinculos([]);
      setSelectAll(false);
      carregarVinculos();
      carregarEstatisticas();
    } catch (err) {
      console.error("Erro ao desvincular em lote:", err);
      toast.error(err.response?.data?.message || "Erro ao desvincular em lote");
    } finally {
      setLoading(false);
    }
  };

  const limparFiltros = () => {
    setSearchParam("");
    setFiltroAtivo("true");
    setControleConfigId("");
    setTarefaConfigId("");
    setDepartamentoId("");
    setFiltroCodigoErp("");
    setFiltroDocumento("");
    setDataInicioMin("");
    setDataInicioMax("");
    setDataFimMin("");
    setDataFimMax("");
    setTipoVinculo("");
    setFilterScope(user?.profile === "admin" ? "all" : "mine");
    setUsuarioId("");
    setPage(1);
  };

  const exportarParaExcel = () => {
    if (vinculos.length === 0) {
      toast.warning("Não há dados para exportar");
      return;
    }

    const headers = [
      "ID",
      "Cliente",
      "Código ERP",
      "Documento",
      "Tipo",
      "Controle/Tarefa",
      "Data Início",
      "Data Fim",
      "Departamento",
      "Responsável",
      "Status",
    ];

    const rows = vinculos.map((v) => [
      v.id,
      v.cliente?.nome || "",
      v.cliente?.codigoErp || "",
      v.cliente?.cnpj || v.cliente?.cpf || "",
      v.controleConfigId ? "Controle" : "Tarefa",
      v.controleConfig?.nome || v.tarefaConfig?.titulo || "",
      formatarData(v.dataInicio),
      formatarData(v.dataFim),
      v.departamento?.nome || "",
      v.usuario?.name || "",
      v.ativo ? "Ativo" : "Inativo",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vinculos_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Dados exportados com sucesso!");
  };

  const formatarData = (data) => {
    if (!data) return "-";
    try {
      return format(parseISO(data), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  const isVencendo = (vinculo) => {
    if (!vinculo.dataFim) return false;
    const hoje = new Date();
    const dataFim = new Date(vinculo.dataFim);
    const diffDias = Math.ceil((dataFim - hoje) / (1000 * 60 * 60 * 24));
    return diffDias > 0 && diffDias <= 30;
  };

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Typography variant="h4" style={{ fontWeight: 600 }}>
          Central de Vínculos
        </Typography>
        <Button
          variant="contained"
          className={classes.addButton}
          startIcon={<LinkIcon />}
          onClick={() => history.push("/vincular-controles")}
        >
          Vincular Controles
        </Button>
      </div>

      <Grid container spacing={3} style={{ marginBottom: 24 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className={classes.statsCard}>
            <Typography className={classes.statsValue} style={{ color: "#0596cd" }}>
              {stats.totalVinculos}
            </Typography>
            <Typography className={classes.statsLabel}>Total de Vínculos</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className={classes.statsCard}>
            <Typography className={classes.statsValue} style={{ color: "#4caf50" }}>
              {stats.vinculosAtivos}
            </Typography>
            <Typography className={classes.statsLabel}>Vínculos Ativos</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className={classes.statsCard}>
            <Typography className={classes.statsValue} style={{ color: "#f44336" }}>
              {stats.vinculosInativos}
            </Typography>
            <Typography className={classes.statsLabel}>Vínculos Inativos</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className={classes.statsCard}>
            <Typography className={classes.statsValue} style={{ color: "#ff9800" }}>
              {stats.proximosVencimentos?.length || 0}
            </Typography>
            <Typography className={classes.statsLabel}>Vencendo em 30 dias</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper className={classes.filtersContainer}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Buscar cliente"
              variant="outlined"
              size="small"
              value={searchParam}
              onChange={(e) => setSearchParam(e.target.value)}
              className={classes.filterField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Código ERP"
              variant="outlined"
              size="small"
              value={filtroCodigoErp}
              onChange={(e) => setFiltroCodigoErp(e.target.value)}
              className={classes.filterField}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="CPF/CNPJ"
              variant="outlined"
              size="small"
              value={filtroDocumento}
              onChange={(e) => setFiltroDocumento(e.target.value)}
              className={classes.filterField}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth variant="outlined" size="small" className={classes.filterField}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filtroAtivo}
                onChange={(e) => setFiltroAtivo(e.target.value)}
                label="Status"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Ativos</MenuItem>
                <MenuItem value="false">Inativos</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth variant="outlined" size="small" className={classes.filterField}>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={tipoVinculo}
                onChange={(e) => setTipoVinculo(e.target.value)}
                label="Tipo"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="controle">Controles</MenuItem>
                <MenuItem value="tarefa">Tarefas</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined" size="small" className={classes.filterField}>
              <InputLabel>Controle</InputLabel>
              <Select
                value={controleConfigId}
                onChange={(e) => setControleConfigId(e.target.value)}
                label="Controle"
              >
                <MenuItem value="">Todos</MenuItem>
                {controles.map((controle) => (
                  <MenuItem key={controle.id} value={controle.id}>
                    {controle.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined" size="small" className={classes.filterField}>
              <InputLabel>Tarefa</InputLabel>
              <Select
                value={tarefaConfigId}
                onChange={(e) => setTarefaConfigId(e.target.value)}
                label="Tarefa"
              >
                <MenuItem value="">Todas</MenuItem>
                {tarefas.map((tarefa) => (
                  <MenuItem key={tarefa.id} value={tarefa.id}>
                    {tarefa.titulo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined" size="small" className={classes.filterField}>
              <InputLabel>Departamento</InputLabel>
              <Select
                value={departamentoId}
                onChange={(e) => setDepartamentoId(e.target.value)}
                label="Departamento"
              >
                <MenuItem value="">Todos</MenuItem>
                {departamentos.map((dep) => (
                  <MenuItem key={dep.id} value={dep.id}>
                    {dep.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined" size="small" className={classes.filterField}>
              <InputLabel>Escopo</InputLabel>
              <Select
                value={filterScope}
                onChange={(e) => setFilterScope(e.target.value)}
                label="Escopo"
              >
                <MenuItem value="all">Todos os Vínculos</MenuItem>
                <MenuItem value="mine">Meus Vínculos</MenuItem>
                <MenuItem value="department">Meu Departamento</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined" size="small" className={classes.filterField}>
              <InputLabel>Responsável</InputLabel>
              <Select
                value={usuarioId}
                onChange={(e) => setUsuarioId(e.target.value)}
                label="Responsável"
              >
                <MenuItem value="">Todos</MenuItem>
                {usuarios.map((usuario) => (
                  <MenuItem key={usuario.id} value={usuario.id}>
                    {usuario.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Data Início - De"
              type="date"
              variant="outlined"
              size="small"
              value={dataInicioMin}
              onChange={(e) => setDataInicioMin(e.target.value)}
              className={classes.filterField}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Data Início - Até"
              type="date"
              variant="outlined"
              size="small"
              value={dataInicioMax}
              onChange={(e) => setDataInicioMax(e.target.value)}
              className={classes.filterField}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Data Fim - De"
              type="date"
              variant="outlined"
              size="small"
              value={dataFimMin}
              onChange={(e) => setDataFimMin(e.target.value)}
              className={classes.filterField}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Data Fim - Até"
              type="date"
              variant="outlined"
              size="small"
              value={dataFimMax}
              onChange={(e) => setDataFimMax(e.target.value)}
              className={classes.filterField}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={limparFiltros} startIcon={<FilterListIcon />}>
                Limpar Filtros
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={exportarParaExcel}
                startIcon={<GetAppIcon />}
              >
                Exportar Excel
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {selectedVinculos.length > 0 && (
        <Box className={classes.bulkActionsBar}>
          <Typography variant="body1" style={{ fontWeight: 600 }}>
            {selectedVinculos.length} vínculo(s) selecionado(s)
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleBulkEditarCompleto}
            >
              Editar Selecionados
            </Button>
            <Button
              variant="contained"
              style={{ backgroundColor: "#ff9800", color: "#fff" }}
              startIcon={<SwapHorizIcon />}
              onClick={handleBulkTransferir}
            >
              Transferir
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<DeleteIcon />}
              onClick={handleBulkDelete}
            >
              Desvincular Selecionados
            </Button>
          </Box>
        </Box>
      )}

      <Paper className={classes.tablePaper}>
        {loading && <LinearProgress />}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow className={classes.tableHeader}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectAll}
                    onChange={handleSelectAll}
                    indeterminate={selectedVinculos.length > 0 && !selectAll}
                  />
                </TableCell>
                <TableCell className={classes.tableHeaderCell} onClick={() => handleSort("id")}>
                  <strong>ID</strong>
                  {orderBy === "id" && (
                    orderDirection === "asc" ? <ArrowUpward className={classes.sortIcon} /> : <ArrowDownward className={classes.sortIcon} />
                  )}
                </TableCell>
                <TableCell className={classes.tableHeaderCell} onClick={() => handleSort("cliente")}>
                  <strong>Cliente</strong>
                  {orderBy === "cliente" && (
                    orderDirection === "asc" ? <ArrowUpward className={classes.sortIcon} /> : <ArrowDownward className={classes.sortIcon} />
                  )}
                </TableCell>
                <TableCell>
                  <strong>Tipo</strong>
                </TableCell>
                <TableCell className={classes.tableHeaderCell} onClick={() => handleSort("controle")}>
                  <strong>Controle/Tarefa</strong>
                  {orderBy === "controle" && (
                    orderDirection === "asc" ? <ArrowUpward className={classes.sortIcon} /> : <ArrowDownward className={classes.sortIcon} />
                  )}
                </TableCell>
                <TableCell className={classes.tableHeaderCell} onClick={() => handleSort("dataInicio")}>
                  <strong>Data Início</strong>
                  {orderBy === "dataInicio" && (
                    orderDirection === "asc" ? <ArrowUpward className={classes.sortIcon} /> : <ArrowDownward className={classes.sortIcon} />
                  )}
                </TableCell>
                <TableCell className={classes.tableHeaderCell} onClick={() => handleSort("dataFim")}>
                  <strong>Data Fim</strong>
                  {orderBy === "dataFim" && (
                    orderDirection === "asc" ? <ArrowUpward className={classes.sortIcon} /> : <ArrowDownward className={classes.sortIcon} />
                  )}
                </TableCell>
                <TableCell className={classes.tableHeaderCell} onClick={() => handleSort("departamento")}>
                  <strong>Departamento</strong>
                  {orderBy === "departamento" && (
                    orderDirection === "asc" ? <ArrowUpward className={classes.sortIcon} /> : <ArrowDownward className={classes.sortIcon} />
                  )}
                </TableCell>
                <TableCell>
                  <strong>Responsável</strong>
                </TableCell>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Ações</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vinculos.map((vinculo) => (
                <TableRow key={vinculo.id} hover selected={selectedVinculos.includes(vinculo.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedVinculos.includes(vinculo.id)}
                      onChange={() => handleSelectVinculo(vinculo.id)}
                    />
                  </TableCell>
<TableCell>{vinculo.id}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" style={{ fontWeight: 600 }}>
                        {vinculo.cliente?.nome || "-"}
                      </Typography>
                      {vinculo.cliente?.codigoErp && (
                        <Typography variant="caption" color="textSecondary">
                          ERP: {vinculo.cliente.codigoErp}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={vinculo.controleConfigId ? "Controle" : "Tarefa"}
                      color={vinculo.controleConfigId ? "primary" : "default"}
                    />
                  </TableCell>
                  <TableCell>{vinculo.controleConfig?.nome || vinculo.tarefaConfig?.titulo || "-"}</TableCell>
                  <TableCell>{formatarData(vinculo.dataInicio)}</TableCell>
                  <TableCell>
                    {formatarData(vinculo.dataFim)}
                    {isVencendo(vinculo) && (
                      <Chip
                        size="small"
                        label="Vencendo"
                        className={classes.chipVencendo}
                        style={{ marginLeft: 8 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{vinculo.departamento?.nome || "-"}</TableCell>
                  <TableCell>{vinculo.usuario?.name || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={vinculo.ativo ? "Ativo" : "Inativo"}
                      className={vinculo.ativo ? classes.chipAtivo : classes.chipInativo}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver Histórico">
                      <IconButton
                        size="small"
                        className={classes.actionButton}
                        onClick={() => handleVerHistorico(vinculo)}
                      >
                        <HistoryIcon />
                      </IconButton>
                    </Tooltip>
                    {vinculo.ativo && (
                      <>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            className={classes.actionButton}
                            color="primary"
                            onClick={() => handleEditarCompleto(vinculo)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Transferir">
                          <IconButton
                            size="small"
                            className={classes.actionButton}
                            style={{ color: "#ff9800" }}
                            onClick={() => handleTransferir(vinculo)}
                          >
                            <SwapHorizIcon />
                          </IconButton>
                        </Tooltip>
                        {vinculo.controleConfigId && (
                          <Tooltip title="Gerar Tarefas">
                            <IconButton
                              size="small"
                              className={classes.actionButton}
                              style={{ color: "#4caf50" }}
                              onClick={() => handleGerarTarefas(vinculo)}
                            >
                              <PlayArrowIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Desvincular">
                          <IconButton
                            size="small"
                            className={classes.actionButton}
                            color="secondary"
                            onClick={() => handleDesvincular(vinculo)}
                          >
                            <UnlinkIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {vinculos.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <Typography variant="body2" color="textSecondary" style={{ padding: "40px 0" }}>
                      Nenhum vínculo encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <div className={classes.pagination}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handleChangePage}
              color="primary"
              showFirstButton
              showLastButton
            />
          </div>
        )}

        <Typography
          variant="caption"
          color="textSecondary"
          align="center"
          style={{ display: "block", marginTop: 16 }}
        >
          {totalCount} vínculo{totalCount !== 1 ? "s" : ""} encontrado{totalCount !== 1 ? "s" : ""}
        </Typography>
      </Paper>

      <ModalEditarDatas
        open={openEditarDatasModal}
        onClose={() => {
          setOpenEditarDatasModal(false);
          setVinculoSelecionado(null);
        }}
        vinculo={vinculoSelecionado}
        onSuccess={handleSuccess}
      />

      <DrawerHistorico
        open={openHistoricoDrawer}
        onClose={() => {
          setOpenHistoricoDrawer(false);
          setVinculoSelecionado(null);
        }}
        vinculoId={vinculoSelecionado?.id}
        clienteNome={vinculoSelecionado?.cliente?.nome}
      />

      <ModalGerarTarefas
        open={openGerarTarefasModal}
        onClose={() => {
          setOpenGerarTarefasModal(false);
          setVinculoSelecionado(null);
        }}
        vinculo={vinculoSelecionado}
        onSuccess={handleSuccess}
      />

      <Dialog open={confirmDeleteDialog} onClose={() => setConfirmDeleteDialog(false)}>
        <DialogTitle>Confirmar Desvinculação</DialogTitle>
        <DialogContent>
          <Typography>
            Deseja realmente desvincular o controle{" "}
            <strong>"{vinculoSelecionado?.controleConfig?.nome || vinculoSelecionado?.tarefaConfig?.titulo}"</strong>{" "}
            do cliente <strong>"{vinculoSelecionado?.cliente?.nome}"</strong>?
          </Typography>
          <Typography variant="caption" color="textSecondary" style={{ marginTop: 8, display: "block" }}>
            O vínculo será desativado, mas não será excluído do histórico.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={confirmarDesvincular} color="secondary" variant="contained">
            Confirmar Desvinculação
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openBulkEditModal}
        onClose={() => setOpenBulkEditModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Alterar Datas de {selectedVinculos.length} Vínculo(s)
        </DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              fullWidth
              label="Data Início"
              type="date"
              variant="outlined"
              value={bulkDataInicio}
              onChange={(e) => setBulkDataInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
              style={{ marginBottom: 16 }}
              required
            />
            <TextField
              fullWidth
              label="Data Fim (Opcional)"
              type="date"
              variant="outlined"
              value={bulkDataFim}
              onChange={(e) => setBulkDataFim(e.target.value)}
              InputLabelProps={{ shrink: true }}
              style={{ marginBottom: 16 }}
            />
            <TextField
              fullWidth
              label="Observação"
              multiline
              rows={3}
              variant="outlined"
              value={bulkObservacao}
              onChange={(e) => setBulkObservacao(e.target.value)}
              placeholder="Motivo da alteração..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkEditModal(false)}>Cancelar</Button>
          <Button
            onClick={confirmarBulkEdit}
            color="primary"
            variant="contained"
            disabled={!bulkDataInicio}
          >
            Confirmar Alteração
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openBulkDeleteDialog}
        onClose={() => setOpenBulkDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar Desvinculação em Lote</DialogTitle>
        <DialogContent>
          <Typography>
            Deseja realmente desvincular <strong>{selectedVinculos.length} vínculo(s)</strong>?
          </Typography>
          <Typography variant="caption" color="textSecondary" style={{ marginTop: 8, display: "block" }}>
            Os vínculos serão desativados, mas não serão excluídos do histórico.
          </Typography>
          <Box mt={3}>
            <TextField
              fullWidth
              label="Observação"
              multiline
              rows={3}
              variant="outlined"
              value={bulkObservacao}
              onChange={(e) => setBulkObservacao(e.target.value)}
              placeholder="Motivo da desvinculação..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={confirmarBulkDelete} color="secondary" variant="contained">
            Confirmar Desvinculação
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openTransferModal}
        onClose={() => {
          setOpenTransferModal(false);
          setVinculoSelecionado(null);
          setTransferUsuarioId("");
          setTransferDepartamentoId("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Transferir Vínculo</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Transferindo o vínculo: <strong>{vinculoSelecionado?.controleConfig?.nome || vinculoSelecionado?.tarefaConfig?.titulo}</strong>
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Cliente: <strong>{vinculoSelecionado?.cliente?.nome}</strong>
          </Typography>
          <Box mt={3}>
            <FormControl fullWidth variant="outlined" style={{ marginBottom: 16 }}>
              <InputLabel>Novo Responsável</InputLabel>
              <Select
                value={transferUsuarioId}
                onChange={(e) => setTransferUsuarioId(e.target.value)}
                label="Novo Responsável"
              >
                <MenuItem value="">Nenhum</MenuItem>
                {usuarios.map((usuario) => (
                  <MenuItem key={usuario.id} value={usuario.id}>
                    {usuario.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Novo Departamento</InputLabel>
              <Select
                value={transferDepartamentoId}
                onChange={(e) => setTransferDepartamentoId(e.target.value)}
                label="Novo Departamento"
              >
                <MenuItem value="">Nenhum</MenuItem>
                {departamentos.map((dep) => (
                  <MenuItem key={dep.id} value={dep.id}>
                    {dep.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenTransferModal(false);
            setVinculoSelecionado(null);
            setTransferUsuarioId("");
            setTransferDepartamentoId("");
          }}>
            Cancelar
          </Button>
          <Button
            onClick={confirmarTransferir}
            color="primary"
            variant="contained"
            disabled={!transferUsuarioId && !transferDepartamentoId}
          >
            Confirmar Transferência
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openBulkTransferModal}
        onClose={() => {
          setOpenBulkTransferModal(false);
          setTransferUsuarioId("");
          setTransferDepartamentoId("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Transferir {selectedVinculos.length} Vínculo(s)</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Selecione o novo responsável e/ou departamento para os vínculos selecionados.
          </Typography>
          <Box mt={3}>
            <FormControl fullWidth variant="outlined" style={{ marginBottom: 16 }}>
              <InputLabel>Novo Responsável</InputLabel>
              <Select
                value={transferUsuarioId}
                onChange={(e) => setTransferUsuarioId(e.target.value)}
                label="Novo Responsável"
              >
                <MenuItem value="">Nenhum</MenuItem>
                {usuarios.map((usuario) => (
                  <MenuItem key={usuario.id} value={usuario.id}>
                    {usuario.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Novo Departamento</InputLabel>
              <Select
                value={transferDepartamentoId}
                onChange={(e) => setTransferDepartamentoId(e.target.value)}
                label="Novo Departamento"
              >
                <MenuItem value="">Nenhum</MenuItem>
                {departamentos.map((dep) => (
                  <MenuItem key={dep.id} value={dep.id}>
                    {dep.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenBulkTransferModal(false);
            setTransferUsuarioId("");
            setTransferDepartamentoId("");
          }}>
            Cancelar
          </Button>
          <Button
            onClick={confirmarBulkTransferir}
            color="primary"
            variant="contained"
            disabled={!transferUsuarioId && !transferDepartamentoId}
          >
            Confirmar Transferência
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEditCompleteModal}
        onClose={() => {
          setOpenEditCompleteModal(false);
          setVinculoSelecionado(null);
          setEditDataInicio("");
          setEditDataFim("");
          setEditDepartamentoId("");
          setEditUsuarioId("");
          setEditObservacao("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar Vínculo</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Editando o vínculo: <strong>{vinculoSelecionado?.controleConfig?.nome || vinculoSelecionado?.tarefaConfig?.titulo}</strong>
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Cliente: <strong>{vinculoSelecionado?.cliente?.nome}</strong>
          </Typography>
          <Box mt={3}>
            <TextField
              fullWidth
              label="Data Início"
              type="date"
              variant="outlined"
              value={editDataInicio}
              onChange={(e) => setEditDataInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
              style={{ marginBottom: 16 }}
            />
            <TextField
              fullWidth
              label="Data Fim (Opcional)"
              type="date"
              variant="outlined"
              value={editDataFim}
              onChange={(e) => setEditDataFim(e.target.value)}
              InputLabelProps={{ shrink: true }}
              style={{ marginBottom: 16 }}
            />
            <FormControl fullWidth variant="outlined" style={{ marginBottom: 16 }}>
              <InputLabel>Departamento</InputLabel>
              <Select
                value={editDepartamentoId}
                onChange={(e) => setEditDepartamentoId(e.target.value)}
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
            <FormControl fullWidth variant="outlined" style={{ marginBottom: 16 }}>
              <InputLabel>Responsável</InputLabel>
              <Select
                value={editUsuarioId}
                onChange={(e) => setEditUsuarioId(e.target.value)}
                label="Responsável"
              >
                <MenuItem value="">Nenhum</MenuItem>
                {usuarios.map((usuario) => (
                  <MenuItem key={usuario.id} value={usuario.id}>
                    {usuario.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Observação"
              multiline
              rows={3}
              variant="outlined"
              value={editObservacao}
              onChange={(e) => setEditObservacao(e.target.value)}
              placeholder="Motivo da edição..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenEditCompleteModal(false);
            setVinculoSelecionado(null);
            setEditDataInicio("");
            setEditDataFim("");
            setEditDepartamentoId("");
            setEditUsuarioId("");
            setEditObservacao("");
          }}>
            Cancelar
          </Button>
          <Button
            onClick={confirmarEditarCompleto}
            color="primary"
            variant="contained"
          >
            Confirmar Edição
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openBulkEditCompleteModal}
        onClose={() => {
          setOpenBulkEditCompleteModal(false);
          setEditDataInicio("");
          setEditDataFim("");
          setEditDepartamentoId("");
          setEditUsuarioId("");
          setEditObservacao("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar {selectedVinculos.length} Vínculo(s)</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom color="textSecondary">
            Edite os campos que deseja alterar. Os campos em branco não serão modificados.
          </Typography>
          <Box mt={3}>
            <TextField
              fullWidth
              label="Data Início (Opcional)"
              type="date"
              variant="outlined"
              value={editDataInicio}
              onChange={(e) => setEditDataInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
              style={{ marginBottom: 16 }}
            />
            <TextField
              fullWidth
              label="Data Fim (Opcional)"
              type="date"
              variant="outlined"
              value={editDataFim}
              onChange={(e) => setEditDataFim(e.target.value)}
              InputLabelProps={{ shrink: true }}
              style={{ marginBottom: 16 }}
            />
            <FormControl fullWidth variant="outlined" style={{ marginBottom: 16 }}>
              <InputLabel>Departamento (Opcional)</InputLabel>
              <Select
                value={editDepartamentoId}
                onChange={(e) => setEditDepartamentoId(e.target.value)}
                label="Departamento (Opcional)"
              >
                <MenuItem value="">Não alterar</MenuItem>
                {departamentos.map((dep) => (
                  <MenuItem key={dep.id} value={dep.id}>
                    {dep.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth variant="outlined" style={{ marginBottom: 16 }}>
              <InputLabel>Responsável (Opcional)</InputLabel>
              <Select
                value={editUsuarioId}
                onChange={(e) => setEditUsuarioId(e.target.value)}
                label="Responsável (Opcional)"
              >
                <MenuItem value="">Não alterar</MenuItem>
                {usuarios.map((usuario) => (
                  <MenuItem key={usuario.id} value={usuario.id}>
                    {usuario.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Observação"
              multiline
              rows={3}
              variant="outlined"
              value={editObservacao}
              onChange={(e) => setEditObservacao(e.target.value)}
              placeholder="Motivo da edição em lote..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenBulkEditCompleteModal(false);
            setEditDataInicio("");
            setEditDataFim("");
            setEditDepartamentoId("");
            setEditUsuarioId("");
            setEditObservacao("");
          }}>
            Cancelar
          </Button>
          <Button
            onClick={confirmarBulkEditarCompleto}
            color="primary"
            variant="contained"
            disabled={!editDataInicio && !editDepartamentoId && !editUsuarioId}
          >
            Confirmar Edição
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CentralVinculos;
