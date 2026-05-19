import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
} from "@material-ui/core";
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Label as LabelIcon,
  BarChart as BarChartIcon,
} from "@material-ui/icons";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import StatusTab from "./StatusTab";
import PrazosTab from "./PrazosTab";
import PrioridadeTab from "./PrioridadeTab";
import StatusComplementarTab from "./StatusComplementarTab";
import SegmentoTab from "./SegmentoTab";
import RegimeTributarioFederalTab from "./RegimeTributarioFederalTab";
import ModalidadeFechamentoContabilTab from "./ModalidadeFechamentoContabilTab";
import DistribuicaoLucrosTab from "./DistribuicaoLucrosTab";
import GrupoClienteTab from "./GrupoClienteTab";
import GrupoServicoTab from "./GrupoServicoTab";
import EscritorioGestorTab from "./EscritorioGestorTab";
import LocalizacaoClienteTab from "./LocalizacaoClienteTab";
import TagServicoTab from "./TagServicoTab";
import RegimeTributarioEstadualTab from "./RegimeTributarioEstadualTab";
import ModalidadeFechamentoFiscalTab from "./ModalidadeFechamentoFiscalTab";
import AdiantamentoFolhaTab from "./AdiantamentoFolhaTab";
import TipoClienteTab from "./TipoClienteTab";
import CategoriaClienteTab from "./CategoriaClienteTab";
import PeriodicidadeClienteTab from "./PeriodicidadeClienteTab";
import RegimeTributarioMunicipalTab from "./RegimeTributarioMunicipalTab";
import ModalidadeFechamentoDPTab from "./ModalidadeFechamentoDPTab";
import TagsTab from "./TagsTab";
import Checklists from "../Checklists";
import TipoServicoTab from "./TipoServicoTab";
import StatusClienteTab from "./StatusClienteTab";
import PorteFederalTab from "./PorteFederalTab";
import PorteEstadualTab from "./PorteEstadualTab";
import PorteMunicipalTab from "./PorteMunicipalTab";
import TierClienteTab from "./TierClienteTab";
import ClusterClienteTab from "./ClusterClienteTab";
import VolumeFiscalTab from "./VolumeFiscalTab";
import VolumeContabilTab from "./VolumeContabilTab";
import VolumeDPTab from "./VolumeDPTab";
import VolumeBPOTab from "./VolumeBPOTab";
import ModalFechBPOTab from "./ModalFechBPOTab";
import TipoDocumentoTab from "./TipoDocumentoTab";
import CargoSocioTab from "./CargoSocioTab";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    height: 'calc(100vh - 120px)',
    display: 'flex',
    gap: theme.spacing(2),
    ...theme.scrollbarStyles,
  },
  sidebar: {
    width: 320,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  searchField: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  categoriesContainer: {
    flex: 1,
    overflowY: 'auto',
    ...theme.scrollbarStyles,
  },
  accordion: {
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    '&:before': {
      display: 'none',
    },
    '&.Mui-expanded': {
      margin: '8px 0',
    },
  },
  accordionSummary: {
    backgroundColor: theme.palette.background.default,
    minHeight: 56,
    '&.Mui-expanded': {
      minHeight: 56,
      backgroundColor: theme.palette.primary.light + '15',
    },
  },
  categoryTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flex: 1,
  },
  categoryIcon: {
    color: theme.palette.primary.main,
  },
  itemCount: {
    marginLeft: 'auto',
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
  },
  accordionDetails: {
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  listItem: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(2),
    '&.Mui-selected': {
      backgroundColor: theme.palette.primary.main + '20',
      borderLeft: `3px solid ${theme.palette.primary.main}`,
      '&:hover': {
        backgroundColor: theme.palette.primary.main + '30',
      },
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  tabPanel: {
    flex: 1,
    padding: theme.spacing(3),
    overflowY: 'auto',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    ...theme.scrollbarStyles,
  },
  newBadge: {
    marginLeft: theme.spacing(1),
  },
  headerBox: {
    marginBottom: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
  },
}));

function TabPanel({ value, index, children }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`parametros-tabpanel-${index}`}
      aria-labelledby={`parametros-tab-${index}`}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const Parametros = () => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategory, setExpandedCategory] = useState("tarefas");

  const categories = [
    {
      id: "tarefas",
      title: "Tarefas",
      icon: <AssignmentIcon />,
      items: [
        { index: 0, label: "Status da Tarefa", isNew: false },
        { index: 15, label: "Prazos", isNew: false },
        { index: 16, label: "Prioridade", isNew: false },
        { index: 31, label: "Checklists", isNew: false },
        { index: 6, label: "Grupo da Tarefa", isNew: false },
        { index: 32, label: "Tipo da Tarefa", isNew: false },
        { index: 34, label: "Tag da Tarefa", isNew: true },
      ],
    },
    {
      id: "clientes",
      title: "Classificação de Clientes",
      icon: <BusinessIcon />,
      items: [
        { index: 1, label: "Status Cliente", isNew: true },
        { index: 5, label: "Tier do Cliente", isNew: true },
        { index: 7, label: "Cluster do Cliente", isNew: true },
        { index: 25, label: "Tipo do Cliente", isNew: false },
        { index: 26, label: "Categoria de Cliente", isNew: false },
        { index: 14, label: "Status Complementar", isNew: false },
        { index: 17, label: "Segmento", isNew: false },
        { index: 21, label: "Grupo de Cliente", isNew: false },
        { index: 13, label: "Escritório Gestor", isNew: true },
        { index: 33, label: "Localização do Cliente", isNew: true },
        { index: 27, label: "Periodicidade do Cliente", isNew: false },
        { index: 30, label: "Tag do Cliente", isNew: false },
        { index: 20, label: "Distribuição de Lucros", isNew: false },
        { index: 24, label: "Adiantamento da Folha", isNew: false },
      ],
    },
    {
      id: "portes",
      title: "Portes e Enquadramento",
      icon: <CategoryIcon />,
      items: [
        { index: 2, label: "Porte Federal", isNew: true },
        { index: 3, label: "Porte Estadual", isNew: true },
        { index: 4, label: "Porte Municipal", isNew: true },
        { index: 18, label: "Regime Tributário Federal", isNew: false },
        { index: 22, label: "Regime Tributário Estadual", isNew: false },
        { index: 28, label: "Regime Tributário Municipal", isNew: false },
      ],
    },
    {
      id: "volumes",
      title: "Volumes Operacionais",
      icon: <BarChartIcon />,
      items: [
        { index: 8, label: "Volume Fiscal", isNew: true },
        { index: 9, label: "Volume Contábil", isNew: true },
        { index: 10, label: "Volume DP", isNew: true },
        { index: 11, label: "Volume BPO", isNew: true },
      ],
    },
    {
      id: "modalidades",
      title: "Modalidades de Fechamento",
      icon: <AssessmentIcon />,
      items: [
        { index: 19, label: "Modal. Fechamento Contábil", isNew: false },
        { index: 23, label: "Modal. Fechamento Fiscal", isNew: false },
        { index: 29, label: "Modal. Fechamento DP", isNew: false },
        { index: 12, label: "Modal Fech BPO", isNew: true },
      ],
    },
    {
      id: "outros",
      title: "Outros",
      icon: <LabelIcon />,
      items: [
        { index: 35, label: "Tipo de Documento", isNew: true },
        { index: 36, label: "Cargo", isNew: true },
      ],
    },
  ];

  const handleTabChange = (index) => {
    setTabValue(index);
  };

  const handleCategoryChange = (categoryId) => (event, isExpanded) => {
    setExpandedCategory(isExpanded ? categoryId : false);
  };

  const getFilteredCategories = () => {
    if (!searchTerm) return categories;
    return categories
      .map((category) => ({
        ...category,
        items: category.items.filter((item) =>
          item.label.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      }))
      .filter((category) => category.items.length > 0);
  };

  const getCurrentTabInfo = () => {
    for (const category of categories) {
      const item = category.items.find((item) => item.index === tabValue);
      if (item) {
        return { category: category.title, item: item.label };
      }
    }
    return { category: "", item: "" };
  };

  const filteredCategories = getFilteredCategories();
  const currentTabInfo = getCurrentTabInfo();

  const renderTabContent = (index) => {
    switch (index) {
      case 0: return <StatusTab />;
      case 1: return <StatusClienteTab />;
      case 2: return <PorteFederalTab />;
      case 3: return <PorteEstadualTab />;
      case 4: return <PorteMunicipalTab />;
      case 5: return <TierClienteTab />;
      case 6: return <GrupoServicoTab />;
      case 7: return <ClusterClienteTab />;
      case 8: return <VolumeFiscalTab />;
      case 9: return <VolumeContabilTab />;
      case 10: return <VolumeDPTab />;
      case 11: return <VolumeBPOTab />;
      case 12: return <ModalFechBPOTab />;
      case 13: return <EscritorioGestorTab />;
      case 14: return <StatusComplementarTab />;
      case 15: return <PrazosTab />;
      case 16: return <PrioridadeTab />;
      case 17: return <SegmentoTab />;
      case 18: return <RegimeTributarioFederalTab />;
      case 19: return <ModalidadeFechamentoContabilTab />;
      case 20: return <DistribuicaoLucrosTab />;
      case 21: return <GrupoClienteTab />;
      case 22: return <RegimeTributarioEstadualTab />;
      case 23: return <ModalidadeFechamentoFiscalTab />;
      case 24: return <AdiantamentoFolhaTab />;
      case 25: return <TipoClienteTab />;
      case 26: return <CategoriaClienteTab />;
      case 27: return <PeriodicidadeClienteTab />;
      case 28: return <RegimeTributarioMunicipalTab />;
      case 29: return <ModalidadeFechamentoDPTab />;
      case 30: return <TagsTab />;
      case 31: return <Checklists />;
      case 32: return <TipoServicoTab />;
      case 33: return <LocalizacaoClienteTab />;
      case 34: return <TagServicoTab />;
      case 35: return <TipoDocumentoTab />;
      case 36: return <CargoSocioTab />;
      default: return null;
    }
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Configurações do Sistema</Title>
      </MainHeader>
      <Box className={classes.mainPaper}>
        <Box className={classes.sidebar}>
          <TextField
            className={classes.searchField}
            placeholder="Buscar parâmetro..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Paper className={classes.categoriesContainer} variant="outlined">
            {filteredCategories.map((category) => (
              <Accordion
                key={category.id}
                expanded={expandedCategory === category.id}
                onChange={handleCategoryChange(category.id)}
                className={classes.accordion}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  className={classes.accordionSummary}
                >
                  <Box className={classes.categoryTitle}>
                    <Box className={classes.categoryIcon}>{category.icon}</Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {category.title}
                    </Typography>
                    <Chip
                      label={category.items.length}
                      size="small"
                      color="primary"
                      className={classes.itemCount}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails className={classes.accordionDetails}>
                  <List disablePadding>
                    {category.items.map((item) => (
                      <ListItem
                        button
                        key={item.index}
                        selected={tabValue === item.index}
                        onClick={() => handleTabChange(item.index)}
                        className={classes.listItem}
                      >
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center">
                              {item.label}
                              {item.isNew && (
                                <Chip
                                  label="NOVO"
                                  size="small"
                                  color="secondary"
                                  className={classes.newBadge}
                                  style={{ height: 20, fontSize: '0.65rem' }}
                                />
                              )}
                            </Box>
                          }
                          primaryTypographyProps={{
                            variant: "body2",
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        </Box>
        <Box className={classes.tabPanel}>
          <Box className={classes.headerBox}>
            <Box>
              <Box className={classes.breadcrumb}>
                <SettingsIcon fontSize="small" />
                <Typography variant="caption">
                  {currentTabInfo.category}
                </Typography>
                <Typography variant="caption">›</Typography>
                <Typography variant="caption" color="primary">
                  {currentTabInfo.item}
                </Typography>
              </Box>
              <Typography variant="h5" style={{ marginTop: 8, fontWeight: 600 }}>
                {currentTabInfo.item}
              </Typography>
            </Box>
          </Box>
          <Divider style={{ marginBottom: 24 }} />
          <TabPanel value={tabValue} index={tabValue}>
            {renderTabContent(tabValue)}
          </TabPanel>
        </Box>
      </Box>
    </MainContainer>
  );
};

export default Parametros;
