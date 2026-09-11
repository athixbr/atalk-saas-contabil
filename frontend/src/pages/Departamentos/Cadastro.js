import React, { useState, useEffect, useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import toastError from "../../errors/toastError";
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
  Divider,
  Box,
  Card,
  Avatar,
  Chip,
  CircularProgress,
  Radio,
  InputAdornment,
} from "@material-ui/core";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  PeopleOutline as PeopleOutlineIcon,
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
  usuariosSearch: {
    marginBottom: theme.spacing(1.5),
  },
  usuariosCard: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
    maxHeight: 420,
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  usuarioItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
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
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(4, 2),
    color: theme.palette.text.secondary,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: theme.spacing(1),
    opacity: 0.5,
  },
}));

const DepartamentosCadastroPage = () => {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams();

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSearch, setUsuarioSearch] = useState("");
  const [formData, setFormData] = useState({
    nome: "",
    usuariosSelecionados: [],
    coordenadorId: null,
  });

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const requests = [api.get("/departamentos/users")];
        if (id) {
          requests.push(api.get(`/departamentos/${id}`));
        }
        const [usersRes, deptRes] = await Promise.all(requests);

        setUsuarios(usersRes.data.users || []);

        if (deptRes) {
          const coordenador = deptRes.data.usuarios.find(
            (u) => u.isCoordenador
          );
          setFormData({
            nome: deptRes.data.nome,
            usuariosSelecionados: deptRes.data.usuarios.map((u) => u.id),
            coordenadorId: coordenador ? coordenador.id : null,
          });
        }
      } catch (error) {
        toastError(error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (formData.coordenadorId === usuarioId) {
        setFormData({
          ...formData,
          usuariosSelecionados: newSelected,
          coordenadorId: null,
        });
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
      setFormData({ ...formData, usuariosSelecionados: [], coordenadorId: null });
    } else {
      setFormData({
        ...formData,
        usuariosSelecionados: usuarios.map((u) => u.id),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome || !formData.nome.trim()) {
      toast.warn("Informe o nome do departamento");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nome: formData.nome.trim(),
        usuarios: formData.usuariosSelecionados.map((userId) => ({
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
      toastError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    history.push("/departamentos");
  };

  const getInitials = (nome = "") => {
    return nome
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const filteredUsuarios = useMemo(() => {
    if (!usuarioSearch.trim()) return usuarios;
    const term = usuarioSearch.trim().toLowerCase();
    return usuarios.filter(
      (u) =>
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)
    );
  }, [usuarios, usuarioSearch]);

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
        {loadingData ? (
          <Box display="flex" justifyContent="center" p={5}>
            <CircularProgress />
          </Box>
        ) : (
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
                autoFocus
              />
            </div>

            <Divider style={{ margin: "24px 0" }} />

            {/* Usuários */}
            <div className={classes.formSection}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
                flexWrap="wrap"
                gridGap={8}
              >
                <FormLabel component="legend">
                  <Typography variant="h6">Usuários do Departamento</Typography>
                </FormLabel>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleSelectAll}
                  disabled={usuarios.length === 0}
                >
                  {formData.usuariosSelecionados.length === usuarios.length &&
                  usuarios.length > 0
                    ? "Desmarcar Todos"
                    : "Selecionar Todos"}
                </Button>
              </Box>

              <TextField
                className={classes.usuariosSearch}
                placeholder="Buscar usuário por nome ou e-mail..."
                value={usuarioSearch}
                onChange={(e) => setUsuarioSearch(e.target.value)}
                variant="outlined"
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" style={{ color: "gray" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl component="fieldset" fullWidth>
                <Card className={classes.usuariosCard} variant="outlined">
                  {filteredUsuarios.length === 0 ? (
                    <Box className={classes.emptyState}>
                      <PeopleOutlineIcon className={classes.emptyIcon} />
                      <Typography variant="body2">
                        {usuarios.length === 0
                          ? "Nenhum usuário disponível"
                          : "Nenhum usuário encontrado para essa busca"}
                      </Typography>
                    </Box>
                  ) : (
                    <FormGroup>
                      {filteredUsuarios.map((usuario) => (
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
                              <Box
                                display="flex"
                                alignItems="center"
                                gridGap={16}
                                flex={1}
                              >
                                <Avatar className={classes.avatar}>
                                  {getInitials(usuario.name)}
                                </Avatar>
                                <Box flex={1}>
                                  <Typography variant="body1">
                                    {usuario.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="textSecondary"
                                  >
                                    {usuario.email}
                                  </Typography>
                                </Box>
                                {formData.usuariosSelecionados.includes(
                                  usuario.id
                                ) && (
                                  <>
                                    <Radio
                                      checked={
                                        formData.coordenadorId === usuario.id
                                      }
                                      onChange={() =>
                                        handleCoordenadorChange(usuario.id)
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                      value={usuario.id}
                                      name="coordenador"
                                      color="primary"
                                      size="small"
                                    />
                                    <Chip
                                      label={
                                        formData.coordenadorId === usuario.id
                                          ? "Coordenador"
                                          : "Membro"
                                      }
                                      size="small"
                                      color={
                                        formData.coordenadorId === usuario.id
                                          ? "primary"
                                          : "default"
                                      }
                                    />
                                  </>
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
              </FormControl>

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
                        {
                          usuarios.find((u) => u.id === formData.coordenadorId)
                            ?.name
                        }
                      </>
                    )}
                  </Typography>
                </Box>
              )}
            </div>

            <Divider style={{ margin: "24px 0" }} />

            {/* Botões de Ação */}
            <Box display="flex" justifyContent="flex-end" gridGap={16}>
              <Button variant="outlined" onClick={handleCancel} disabled={saving}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={
                  saving ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar Departamento"}
              </Button>
            </Box>
          </form>
        )}
      </Paper>
    </MainContainer>
  );
};

export default DepartamentosCadastroPage;
