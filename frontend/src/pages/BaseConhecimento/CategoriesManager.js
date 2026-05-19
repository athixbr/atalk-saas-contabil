import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
} from "@material-ui/core";
import {
  Add,
  Edit,
  Delete,
  ArrowBack,
  Category as CategoryIcon,
} from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4),
  },
  categoriesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: theme.spacing(3),
  },
  categoryCard: {
    borderRadius: "12px",
    transition: "all 0.3s",
    "&:hover": {
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    },
  },
  categoryHeader: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },
}));

const CategoriesManager = () => {
  const classes = useStyles();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "📁",
    color: "#667eea",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    // TODO: Implementar carregamento de categorias
    // Por enquanto, vamos usar dados de exemplo
    setCategories([
      {
        id: 1,
        name: "Tutoriais",
        description: "Guias passo a passo",
        icon: "📖",
        color: "#667eea",
        articlesCount: 5,
      },
      {
        id: 2,
        name: "Dicas",
        description: "Dicas rápidas e úteis",
        icon: "💡",
        color: "#f093fb",
        articlesCount: 3,
      },
    ]);
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
        icon: category.icon || "📁",
        color: category.color || "#667eea",
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        icon: "📁",
        color: "#667eea",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
  };

  const handleSaveCategory = async () => {
    try {
      setLoading(true);
      // TODO: Implementar criação/edição de categoria
      toast.success(
        editingCategory
          ? "Categoria atualizada com sucesso!"
          : "Categoria criada com sucesso!"
      );
      handleCloseDialog();
      loadCategories();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      toast.error("Erro ao salvar categoria");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Deseja realmente excluir esta categoria?")) {
      return;
    }

    try {
      setLoading(true);
      // TODO: Implementar exclusão de categoria
      toast.success("Categoria excluída com sucesso!");
      loadCategories();
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      toast.error("Erro ao excluir categoria");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Gerenciar Categorias</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => history.push("/base-conhecimento")}
          >
            Voltar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Nova Categoria
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <div className={classes.container}>
        <div className={classes.categoriesGrid}>
          {categories.map((category) => (
            <Card key={category.id} className={classes.categoryCard}>
              <CardContent>
                <div className={classes.categoryHeader}>
                  <div
                    className={classes.iconCircle}
                    style={{ backgroundColor: category.color + "20" }}
                  >
                    {category.icon}
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <Typography variant="h6">{category.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {category.articlesCount || 0} artigos
                    </Typography>
                  </div>
                </div>
                {category.description && (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    style={{ marginTop: 8 }}
                  >
                    {category.description}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => handleOpenDialog(category)}
                >
                  Editar
                </Button>
                <Button
                  size="small"
                  color="secondary"
                  startIcon={<Delete />}
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  Excluir
                </Button>
              </CardActions>
            </Card>
          ))}
        </div>
      </div>

      {/* Dialog de Criação/Edição */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCategory ? "Editar Categoria" : "Nova Categoria"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: 8 }}>
            <Grid item xs={12}>
              <TextField
                label="Nome da Categoria"
                fullWidth
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descrição"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Ícone (Emoji)"
                fullWidth
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                helperText="Ex: 📖 💡 🔧"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Cor"
                type="color"
                fullWidth
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSaveCategory}
            color="primary"
            variant="contained"
            disabled={loading || !formData.name}
          >
            {loading ? <CircularProgress size={24} /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </MainContainer>
  );
};

export default CategoriesManager;
