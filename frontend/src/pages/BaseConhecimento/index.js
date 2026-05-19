import React, { useState, useEffect, useReducer } from "react";
import {
  makeStyles,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Box,
  Tooltip,
  Menu,
  MenuItem,
  CircularProgress
} from "@material-ui/core";
import {
  Add,
  Search,
  Category,
  Description as Article,
  Visibility,
  Edit,
  Delete,
  MoreVert,
  TrendingUp,
  Star,
  FilterList
} from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import {
  listArticles,
  listCategories,
  searchArticles,
  deleteArticle,
  getFeaturedArticles
} from "../../services/knowledgeBase";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4),
  },
  headerCard: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    padding: theme.spacing(3),
    borderRadius: "16px",
    marginBottom: theme.spacing(3),
    boxShadow: "0 4px 20px rgba(102, 126, 234, 0.4)",
  },
  searchContainer: {
    marginBottom: theme.spacing(3),
    display: "flex",
    gap: theme.spacing(2),
    alignItems: "center",
  },
  searchField: {
    flexGrow: 1,
    backgroundColor: "#fff",
    borderRadius: "8px",
  },
  tabsContainer: {
    marginBottom: theme.spacing(3),
    backgroundColor: "#fff",
    borderRadius: "8px",
  },
  categoriesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  categoryCard: {
    cursor: "pointer",
    transition: "all 0.3s",
    borderRadius: "12px",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
    },
  },
  articlesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: theme.spacing(3),
  },
  articleCard: {
    borderRadius: "12px",
    transition: "all 0.3s",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    "&:hover": {
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    },
  },
  articleContent: {
    flexGrow: 1,
  },
  articleTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    "-webkit-line-clamp": 2,
    "-webkit-box-orient": "vertical",
  },
  articleSummary: {
    color: theme.palette.text.secondary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    "-webkit-line-clamp": 3,
    "-webkit-box-orient": "vertical",
  },
  articleMeta: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  chip: {
    marginRight: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
  },
  statsCard: {
    padding: theme.spacing(2),
    borderRadius: "12px",
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    color: "#fff",
    marginBottom: theme.spacing(2),
  },
  rankingCard: {
    padding: theme.spacing(2),
    borderRadius: "12px",
    marginBottom: theme.spacing(2),
  },
  rankingItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(1.5),
    borderRadius: "8px",
    marginBottom: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
  },
  rankingNumber: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "1.1rem",
  },
  goldMedal: {
    backgroundColor: "#FFD700",
    color: "#000",
  },
  silverMedal: {
    backgroundColor: "#C0C0C0",
    color: "#000",
  },
  bronzeMedal: {
    backgroundColor: "#CD7F32",
    color: "#fff",
  },
  defaultRank: {
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
  },
}));

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_ARTICLES":
      return { ...state, articles: action.payload, loading: false };
    case "LOAD_CATEGORIES":
      return { ...state, categories: action.payload };
    case "LOAD_RANKING":
      return { ...state, ranking: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_TAB":
      return { ...state, currentTab: action.payload };
    default:
      return state;
  }
};

const BaseConhecimento = () => {
  const classes = useStyles();
  const history = useHistory();

  const [state, dispatch] = useReducer(reducer, {
    articles: [],
    categories: [],
    ranking: [],
    loading: true,
    currentTab: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      
      const [articlesRes, categoriesRes] = await Promise.all([
        listArticles({ status: "published", pageNumber: 1 }),
        listCategories({ pageNumber: 1 })
      ]);

      dispatch({ type: "LOAD_ARTICLES", payload: articlesRes.data.articles });
      dispatch({ type: "LOAD_CATEGORIES", payload: categoriesRes.data.categories });

      // Calcular ranking
      calculateRanking(articlesRes.data.articles);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados da base de conhecimento");
    }
  };

  const calculateRanking = (articles) => {
    const userStats = {};
    
    articles.forEach(article => {
      const userId = article.user?.id;
      const userName = article.user?.name;
      
      if (userId && userName) {
        if (!userStats[userId]) {
          userStats[userId] = {
            id: userId,
            name: userName,
            count: 0,
            views: 0,
          };
        }
        userStats[userId].count += 1;
        userStats[userId].views += article.views || 0;
      }
    });

    const ranking = Object.values(userStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    dispatch({ type: "LOAD_RANKING", payload: ranking });
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadData();
      return;
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await searchArticles({ q: searchTerm });
      dispatch({ type: "LOAD_ARTICLES", payload: response.data.articles });
    } catch (error) {
      console.error("Erro na busca:", error);
      toast.error("Erro ao buscar artigos");
    }
  };

  const handleCategoryFilter = async (category) => {
    setSelectedCategory(category);
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await listArticles({ 
        categoryId: category?.id, 
        status: "published",
        pageNumber: 1 
      });
      dispatch({ type: "LOAD_ARTICLES", payload: response.data.articles });
    } catch (error) {
      console.error("Erro ao filtrar:", error);
      toast.error("Erro ao filtrar artigos");
    }
  };

  const handleTabChange = async (event, newValue) => {
    dispatch({ type: "SET_TAB", payload: newValue });
    
    if (newValue === 1) {
      // Artigos em destaque
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        const response = await getFeaturedArticles();
        dispatch({ type: "LOAD_ARTICLES", payload: response.data.articles });
      } catch (error) {
        console.error("Erro:", error);
      }
    } else {
      loadData();
    }
  };

  const handleMenuOpen = (event, article) => {
    setAnchorEl(event.currentTarget);
    setSelectedArticle(article);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedArticle(null);
  };

  const handleDelete = async () => {
    try {
      await deleteArticle(selectedArticle.id);
      toast.success("Artigo deletado com sucesso!");
      handleMenuClose();
      loadData();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      toast.error("Erro ao deletar artigo");
    }
  };

  const getRankingClass = (index) => {
    if (index === 0) return classes.goldMedal;
    if (index === 1) return classes.silverMedal;
    if (index === 2) return classes.bronzeMedal;
    return classes.defaultRank;
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Base de Conhecimento</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => history.push("/base-conhecimento/novo")}
          >
            Novo Artigo
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Category />}
            onClick={() => history.push("/base-conhecimento/categorias")}
          >
            Categorias
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.headerCard}>
        <Typography variant="h5" style={{ fontWeight: 700, marginBottom: 8 }}>
          📚 Central de Conhecimento
        </Typography>
        <Typography variant="body1" style={{ opacity: 0.9 }}>
          Compartilhe tutoriais, dicas e soluções com a equipe
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={9}>
          {/* Busca */}
          <div className={classes.searchContainer}>
            <TextField
              className={classes.searchField}
              variant="outlined"
              size="small"
              placeholder="Buscar artigos... (Ex: cadastrar produto, NCM, domínio)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              startIcon={<Search />}
            >
              Buscar
            </Button>
          </div>

          {/* Categorias */}
          {state.categories.length > 0 && (
            <Box mb={3}>
              <Typography variant="h6" gutterBottom style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FilterList /> Filtrar por Categoria
              </Typography>
              <div className={classes.categoriesGrid}>
                <Card
                  className={classes.categoryCard}
                  onClick={() => handleCategoryFilter(null)}
                  style={{
                    border: !selectedCategory ? "2px solid #667eea" : "none",
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                      Todas
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {state.articles.length} artigos
                    </Typography>
                  </CardContent>
                </Card>

                {state.categories.map((category) => (
                  <Card
                    key={category.id}
                    className={classes.categoryCard}
                    onClick={() => handleCategoryFilter(category)}
                    style={{
                      border: selectedCategory?.id === category.id ? "2px solid #667eea" : "none",
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                        {category.icon} {category.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {category.description}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Box>
          )}

          {/* Tabs */}
          <Paper className={classes.tabsContainer}>
            <Tabs
              value={state.currentTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Todos os Artigos" icon={<Article />} />
              <Tab label="Em Destaque" icon={<Star />} />
            </Tabs>
          </Paper>

          {/* Lista de Artigos */}
          {state.loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : state.articles.length === 0 ? (
            <Paper style={{ padding: 32, textAlign: "center" }}>
              <Typography variant="h6" color="textSecondary">
                Nenhum artigo encontrado
              </Typography>
              <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
                Seja o primeiro a criar um artigo!
              </Typography>
            </Paper>
          ) : (
            <div className={classes.articlesGrid}>
              {state.articles.map((article) => (
                <Card key={article.id} className={classes.articleCard}>
                  <CardContent className={classes.articleContent}>
                    {article.featured && (
                      <Chip
                        icon={<Star />}
                        label="Destaque"
                        size="small"
                        color="secondary"
                        style={{ marginBottom: 8 }}
                      />
                    )}
                    
                    <Typography
                      variant="h6"
                      className={classes.articleTitle}
                      onClick={() => history.push(`/base-conhecimento/artigos/${article.id}`)}
                      style={{ cursor: "pointer", color: "#667eea" }}
                    >
                      {article.title}
                    </Typography>

                    {article.summary && (
                      <Typography
                        variant="body2"
                        className={classes.articleSummary}
                      >
                        {article.summary}
                      </Typography>
                    )}

                    <div className={classes.articleMeta}>
                      <Avatar style={{ width: 24, height: 24, fontSize: 12 }}>
                        {article.user?.name?.charAt(0)}
                      </Avatar>
                      <Typography variant="caption" color="textSecondary">
                        {article.user?.name}
                      </Typography>
                      <Chip
                        icon={<Visibility />}
                        label={article.views || 0}
                        size="small"
                        variant="outlined"
                      />
                    </div>

                    {article.category && (
                      <Chip
                        label={article.category.name}
                        size="small"
                        className={classes.chip}
                        style={{ backgroundColor: article.category.color || "#e0e0e0" }}
                      />
                    )}

                    {article.tags?.map((tag) => (
                      <Chip
                        key={tag.id}
                        label={tag.name}
                        size="small"
                        variant="outlined"
                        className={classes.chip}
                      />
                    ))}
                  </CardContent>

                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      startIcon={<Visibility />}
                      onClick={() => history.push(`/base-conhecimento/artigos/${article.id}`)}
                    >
                      Ver Artigo
                    </Button>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, article)}
                    >
                      <MoreVert />
                    </IconButton>
                  </CardActions>
                </Card>
              ))}
            </div>
          )}
        </Grid>

        {/* Sidebar - Ranking */}
        <Grid item xs={12} md={3}>
          <Paper className={classes.statsCard}>
            <Typography variant="h6" style={{ fontWeight: 700, marginBottom: 8 }}>
              <TrendingUp /> Estatísticas
            </Typography>
            <Typography variant="h4" style={{ fontWeight: 700 }}>
              {state.articles.length}
            </Typography>
            <Typography variant="body2">Artigos publicados</Typography>
          </Paper>

          <Paper className={classes.rankingCard}>
            <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 16 }}>
              🏆 Top Colaboradores
            </Typography>
            {state.ranking.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                Nenhum dado disponível
              </Typography>
            ) : (
              state.ranking.map((user, index) => (
                <div key={user.id} className={classes.rankingItem}>
                  <div className={`${classes.rankingNumber} ${getRankingClass(index)}`}>
                    {index + 1}
                  </div>
                  <Avatar style={{ width: 32, height: 32 }}>
                    {user.name?.charAt(0)}
                  </Avatar>
                  <div style={{ flexGrow: 1 }}>
                    <Typography variant="body2" style={{ fontWeight: 600 }}>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {user.count} artigos • {user.views} visualizações
                    </Typography>
                  </div>
                </div>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Menu de ações */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            history.push(`/base-conhecimento/editar/${selectedArticle?.id}`);
            handleMenuClose();
          }}
        >
          <Edit fontSize="small" style={{ marginRight: 8 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete fontSize="small" style={{ marginRight: 8 }} />
          Deletar
        </MenuItem>
      </Menu>
    </MainContainer>
  );
};

export default BaseConhecimento;
