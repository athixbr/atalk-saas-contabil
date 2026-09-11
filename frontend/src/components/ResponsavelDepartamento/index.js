import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Menu,
  MenuItem,
  Checkbox,
  ListItemText,
  Chip,
  Tooltip,
} from "@material-ui/core";
import { Save as SaveIcon, Add as AddIcon } from "@material-ui/icons";
import { toast } from "react-toastify";
import api from "../../services/api";

const ResponsavelDepartamento = ({ clienteId }) => {
  const [departamentos, setDepartamentos] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [selecoes, setSelecoes] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuDeptId, setMenuDeptId] = useState(null);

  useEffect(() => {
    fetchDepartamentos();
    if (clienteId) {
      fetchResponsaveis();
    }
  }, [clienteId]);

  useEffect(() => {
    if (departamentos.length === 0) return;

    // Agrupa os responsáveis já salvos por departamento
    const salvosPorDepartamento = {};
    responsaveis.forEach((resp) => {
      if (!salvosPorDepartamento[resp.departamentoId]) {
        salvosPorDepartamento[resp.departamentoId] = [];
      }
      salvosPorDepartamento[resp.departamentoId].push(resp.userId);
    });

    // Para departamentos sem responsável salvo, pré-seleciona o(s) coordenador(es)
    const novasSelecoes = {};
    departamentos.forEach((dept) => {
      if (salvosPorDepartamento[dept.id]) {
        novasSelecoes[dept.id] = salvosPorDepartamento[dept.id];
      } else {
        const coordenadores = (dept.usuarios || [])
          .filter((u) => u.isCoordenador)
          .map((u) => u.id);
        if (coordenadores.length > 0) {
          novasSelecoes[dept.id] = coordenadores;
        }
      }
    });

    setSelecoes(novasSelecoes);
  }, [departamentos, responsaveis]);

  const fetchDepartamentos = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/departamentos");
      setDepartamentos(Array.isArray(data) ? data : data.departamentos || []);
    } catch (err) {
      console.error("Erro ao carregar departamentos:", err);
      toast.error("Erro ao carregar departamentos");
      setDepartamentos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchResponsaveis = async () => {
    if (!clienteId) return;
    try {
      const { data } = await api.get(`/clientes/${clienteId}/responsaveis-departamento`);
      setResponsaveis(data);
    } catch (err) {
      console.error("Erro ao carregar responsáveis:", err);
      toast.error("Erro ao carregar responsáveis");
    }
  };

  const handleAbrirMenu = (departamentoId) => (e) => {
    setMenuAnchorEl(e.currentTarget);
    setMenuDeptId(departamentoId);
  };

  const handleFecharMenu = () => {
    setMenuAnchorEl(null);
    setMenuDeptId(null);
  };

  const handleToggleUsuario = (departamentoId, userId) => () => {
    setSelecoes((prev) => {
      const atuais = prev[departamentoId] || [];
      const jaSelecionado = atuais.includes(userId);
      return {
        ...prev,
        [departamentoId]: jaSelecionado
          ? atuais.filter((id) => id !== userId)
          : [...atuais, userId],
      };
    });
  };

  const handleRemoverUsuario = (departamentoId, userId) => () => {
    setSelecoes((prev) => ({
      ...prev,
      [departamentoId]: (prev[departamentoId] || []).filter((id) => id !== userId),
    }));
  };

  const handleSalvar = async () => {
    if (!clienteId) {
      toast.warning("Salve o cliente primeiro para adicionar responsáveis");
      return;
    }

    // Mapeia os responsáveis originais: departamentoId -> { userId: responsavelId }
    const originalPorDepartamento = {};
    responsaveis.forEach((resp) => {
      if (!originalPorDepartamento[resp.departamentoId]) {
        originalPorDepartamento[resp.departamentoId] = {};
      }
      originalPorDepartamento[resp.departamentoId][resp.userId] = resp.id;
    });

    try {
      setSaving(true);

      const requisicoes = [];

      departamentos.forEach((dept) => {
        const selecionados = selecoes[dept.id] || [];
        const originais = originalPorDepartamento[dept.id] || {};

        const paraAdicionar = selecionados.filter(
          (userId) => !(userId in originais)
        );
        const paraRemover = Object.keys(originais).filter(
          (userId) => !selecionados.includes(parseInt(userId, 10))
        );

        if (paraAdicionar.length > 0) {
          requisicoes.push(
            api.post(`/clientes/${clienteId}/responsaveis-departamento`, {
              departamentoId: dept.id,
              userIds: paraAdicionar,
            })
          );
        }

        paraRemover.forEach((userId) => {
          const responsavelId = originais[userId];
          requisicoes.push(
            api.delete(
              `/clientes/${clienteId}/responsaveis-departamento/${responsavelId}`
            )
          );
        });
      });

      if (requisicoes.length === 0) {
        toast.info("Nenhuma alteração para salvar");
        return;
      }

      await Promise.all(requisicoes);
      toast.success("Responsáveis salvos com sucesso");
      fetchResponsaveis();
    } catch (err) {
      console.error("Erro ao salvar responsáveis:", err);
      const errorMessage = err.response?.data?.error || "Erro ao salvar responsáveis";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Responsabilidade pelo Departamento</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSalvar}
          disabled={saving || loading}
        >
          Salvar
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="30%">Departamento</TableCell>
                <TableCell>Responsáveis</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departamentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    <Typography color="textSecondary">
                      Nenhum departamento cadastrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                departamentos.map((dept) => {
                  const usuariosDept = dept.usuarios || [];
                  const selecionados = selecoes[dept.id] || [];

                  return (
                    <TableRow key={dept.id}>
                      <TableCell>{dept.nome}</TableCell>
                      <TableCell>
                        <Box display="flex" flexWrap="wrap" alignItems="center" style={{ gap: 4 }}>
                          {selecionados.length === 0 && (
                            <Typography color="textSecondary" variant="body2">
                              {usuariosDept.length === 0
                                ? "Nenhum usuário neste departamento"
                                : "Nenhum responsável selecionado"}
                            </Typography>
                          )}
                          {selecionados.map((userId) => {
                            const user = usuariosDept.find((u) => u.id === userId);
                            if (!user) return null;
                            return (
                              <Chip
                                key={userId}
                                size="small"
                                label={
                                  user.isCoordenador
                                    ? `${user.name} (Coordenador)`
                                    : user.name
                                }
                                color={user.isCoordenador ? "primary" : "default"}
                                onDelete={handleRemoverUsuario(dept.id, userId)}
                              />
                            );
                          })}
                          <Tooltip
                            title={
                              usuariosDept.length === 0
                                ? "Nenhum usuário neste departamento"
                                : "Adicionar responsável"
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={handleAbrirMenu(dept.id)}
                                disabled={usuariosDept.length === 0}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleFecharMenu}
      >
        {(departamentos.find((d) => d.id === menuDeptId)?.usuarios || []).map((user) => {
          const atuais = selecoes[menuDeptId] || [];
          const marcado = atuais.includes(user.id);
          return (
            <MenuItem
              key={user.id}
              dense
              onClick={handleToggleUsuario(menuDeptId, user.id)}
            >
              <Checkbox checked={marcado} size="small" style={{ padding: 4 }} color="primary" />
              <ListItemText
                primary={
                  user.isCoordenador ? `${user.name} (Coordenador)` : user.name
                }
                secondary={user.email}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
};

export default ResponsavelDepartamento;
