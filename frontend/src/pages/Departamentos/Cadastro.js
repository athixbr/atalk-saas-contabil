import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Divider,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  CircularProgress,
  Radio,
  RadioGroup,
} from "@material-ui/core";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
} from "@material-ui/icons";
import { useHistory, useParams } from "react-router-dom";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(3),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  formSection: {
    marginBottom: theme.spacing(3),
  },
  usuariosCard: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
  },
  usuarioItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(1),
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      borderRadius: theme.shape.borderRadius,
    },
  },
  avatar: {
    width: theme.spacing(5),
    height: theme.spacing(5),
    backgroundColor: theme.palette.primary.main,
  },
  selectedCount: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.primary.light,
    borderRadius: theme.shape.borderRadius,
  },
}));

const DepartamentosCadastroPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({
    nome: "",
    usuariosSelecionados: [],
    coordenadorId: null,
  });

  const fetchUsuarios = async () => {
    try {
      const { data } = await api.get("/departamentos/users");
      setUsuarios(data.users || []);
    } catch (error) {
      toast.error("Erro ao carregar usuários");
      console.error("Erro ao buscar usuários:", error);
    }
  };

  const fetchDepartamento = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/departamentos/${id}`);
      const coordenador = data.usuarios.find(u => u.isCoordenador);
      setFormData({
        nome: data.nome,
        usuariosSelecionados: data.usuarios.map(u => u.id),
        coordenadorId: coordenador ? coordenador.id : null,
      });
    } catch (error) {
      toast.error("Erro ao carregar departamento");
      console.error("Erro ao buscar departamento:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchDepartamento();
  }, [id]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, nome: e.target.value });
  };

  const handleUsuarioToggle = (usuarioId) => {
    const currentIndex = formData.usuariosSelecionados.indexOf(usuarioId);
    const newSelected = [...formData.usuariosSelecionados];

    if (currentIndex === -1) {
      newSelected.push(usuarioId);
    } else {
      newSelected.splice(currentIndex, 1);
      // Se desmarcar o coordenador, limpar a seleção
      if (formData.coordenadorId === usuarioId) {
        setFormData({ ...formData, usuariosSelecionados: newSelected, coordenadorId: null });
        return;
      }
    }

    setFormData({ ...formData, usuariosSelecionados: newSelected });
  };

  const handleCoordenadorChange = (usuarioId) => {
    setFormData({ ...formData, coordenadorId: usuarioId });
  };

  const handleSelectAll = () => {
    if (formData.usuariosSelecionados.length === usuarios.length) {
      setFormData({ ...formData, usuariosSelecionados: [] });
    } else {
      setFormData({
        ...formData,
        usuariosSelecionados: usuarios.map((u) => u.id),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.usuariosSelecionados.length === 0) {
      toast.warning("Selecione pelo menos um usuário para o departamento.");
      return;
    }

    if (!formData.coordenadorId) {
      toast.warning("Selecione um coordenador para o departamento.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nome: formData.nome,
        usuarios: formData.usuariosSelecionados.map(userId => ({
          userId,
          isCoordenador: userId === formData.coordenadorId,
        })),
      };

      if (id) {
        await api.put(`/departamentos/${id}`, payload);
        toast.success("Departamento atualizado com sucesso!");
      } else {
        await api.post("/departamentos", payload);
        toast.success("Departamento criado com sucesso!");
      }
      
      history.push("/departamentos");
    } catch (error) {
      toast.error("Erro ao salvar departamento");
      console.error("Erro ao salvar departamento:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    history.push("/departamentos");
  };

  const getInitials = (nome) => {
    return nome
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{id ? "Editar Departamento" : "Novo Departamento"}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleCancel}
          >
            Voltar
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <form onSubmit={handleSubmit}>
          {/* Nome */}
          <div className={classes.formSection}>
            <TextField
              label="Nome do Departamento"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              required
              fullWidth
              variant="outlined"
              placeholder="Ex: Fiscal, Contabilidade, RH..."
            />
          </div>

          <Divider style={{ margin: "24px 0" }} />

          {/* Usuários */}
          <div className={classes.formSection}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <FormLabel component="legend">
                <Typography variant="h6">Usuários do Departamento</Typography>
              </FormLabel>
              <Button
                variant="outlined"
                size="small"
                onClick={handleSelectAll}
              >
                {formData.usuariosSelecionados.length === usuarios.length
                  ? "Desmarcar Todos"
                  : "Selecionar Todos"}
              </Button>
            </Box>

            <Card className={classes.usuariosCard}>
              {loading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : (
                <FormGroup>
                  {usuarios.map((usuario) => (
                    <div key={usuario.id} className={classes.usuarioItem}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.usuariosSelecionados.includes(
                              usuario.id
                            )}
                            onChange={() => handleUsuarioToggle(usuario.id)}
                            color="primary"
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center" gap={2} flex={1}>
                            <Avatar className={classes.avatar}>
                              {getInitials(usuario.name)}
                            </Avatar>
                            <Box flex={1}>
                              <Typography variant="body1">
                                {usuario.name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {usuario.email}
                              </Typography>
                            </Box>
                            {formData.usuariosSelecionados.includes(usuario.id) && (
                              <Radio
                                checked={formData.coordenadorId === usuario.id}
                                onChange={() => handleCoordenadorChange(usuario.id)}
                                value={usuario.id}
                                name="coordenador"
                                color="primary"
                                size="small"
                              />
                            )}
                            {formData.usuariosSelecionados.includes(usuario.id) && (
                              <Chip
                                label={formData.coordenadorId === usuario.id ? "Coordenador" : "Membro"}
                                size="small"
                                color={formData.coordenadorId === usuario.id ? "primary" : "default"}
                              />
                            )}
                          </Box>
                        }
                        style={{ width: "100%", margin: 0 }}
                      />
                    </div>
                  ))}
                </FormGroup>
              )}
            </Card>

            {formData.usuariosSelecionados.length > 0 && (
              <Box className={classes.selectedCount}>
                <Typography variant="body2" align="center">
                  <strong>{formData.usuariosSelecionados.length}</strong>{" "}
                  {formData.usuariosSelecionados.length === 1
                    ? "usuário selecionado"
                    : "usuários selecionados"}
                  {formData.coordenadorId && (
                    <>
                      {" | "}
                      <strong>Coordenador:</strong>{" "}
                      {usuarios.find(u => u.id === formData.coordenadorId)?.name}
                    </>
                  )}
                </Typography>
              </Box>
            )}
          </div>

          <Divider style={{ margin: "24px 0" }} />

          {/* Botões de Ação */}
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" onClick={handleCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar Departamento"}
            </Button>
          </Box>
        </form>
      </Paper>
    </MainContainer>
  );
};

export default DepartamentosCadastroPage;
