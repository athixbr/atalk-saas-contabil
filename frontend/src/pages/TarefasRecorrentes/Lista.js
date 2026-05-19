import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Button, Tooltip, Chip,
  TextField, InputAdornment, Grid, FormControl, InputLabel,
  Select, MenuItem, CircularProgress, Typography, Popover,
  List, ListItem, ListItemText, Divider, Checkbox
} from '@material-ui/core';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  FilterList as FilterListIcon
} from '@material-ui/icons';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import MainContainer from '../../components/MainContainer';
import MainHeader from '../../components/MainHeader';
import MainHeaderButtonsWrapper from '../../components/MainHeaderButtonsWrapper';
import Title from '../../components/Title';
import api from '../../services/api';

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(3),
    borderRadius: '16px',
    overflowY: 'scroll',
    ...theme.scrollbarStyles,
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },
  filtersContainer: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: '16px',
    backgroundColor: '#f5f5f5',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1.5),
    },
  },
  searchField: {
    backgroundColor: '#fff',
    borderRadius: '8px',
  },
  filterField: {
    backgroundColor: '#fff',
    borderRadius: '8px',
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
  },
  tableHeaderCell: {
    fontWeight: 600,
    padding: '12px 16px',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    [theme.breakpoints.down('sm')]: {
      padding: '8px 12px',
      fontSize: '0.875rem',
    },
  },
  tableRow: {
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#f9f9f9',
    },
  },
  tableCell: {
    [theme.breakpoints.down('sm')]: {
      padding: '8px 12px',
      fontSize: '0.875rem',
    },
  },
  actionButtons: {
    display: 'flex',
    gap: theme.spacing(1),
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  addButton: {
    background: 'linear-gradient(135deg, #0596cd 0%, #047ba5 100%)',
    color: '#fff',
    '&:hover': {
      background: 'linear-gradient(135deg, #047ba5 0%, #035c7d 100%)',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.875rem',
      padding: '6px 12px',
    },
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
  },
  totalCount: {
    padding: theme.spacing(2),
    borderTop: '1px solid #e0e0e0',
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1.5),
    },
  },
  sortIcon: {
    fontSize: '1rem',
    marginLeft: 4,
    verticalAlign: 'middle',
  },
}));

const ListaTarefasRecorrentes = () => {
  const classes = useStyles();
  const history = useHistory();
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroAtiva, setFiltroAtiva] = useState('todas');

  // Estados para ordenação e filtros
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [columnFilters, setColumnFilters] = useState({});
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [currentFilterColumn, setCurrentFilterColumn] = useState(null);

  useEffect(() => {
    carregarTarefas();
  }, []);

  const carregarTarefas = async () => {
    try {
      setLoading(true);
      const params = { searchParam: searchTerm };
      
      const { data } = await api.get('/tarefas-recorrentes', { params });
      setTarefas(data.tarefas || data || []);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      toast.error('Erro ao carregar tarefas recorrentes');
      setTarefas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNovaTarefa = () => {
    history.push('/tarefas-recorrentes/novo');
  };

  const handleEditar = (id) => {
    history.push(`/tarefas-recorrentes/editar/${id}`);
  };

  const handleVisualizar = (id) => {
    history.push(`/tarefas-recorrentes/${id}`);
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa recorrente?')) {
      try {
        await api.delete(`/tarefas-recorrentes/${id}`);
        toast.success('Tarefa excluída com sucesso');
        carregarTarefas();
      } catch (error) {
        console.error('Erro ao excluir:', error);
        toast.error('Erro ao excluir tarefa');
      }
    }
  };

  const tarefasFiltradas = tarefas.filter(tarefa => {
    const matchesSearch = tarefa.nomeTarefa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tarefa.codigo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filtroAtiva === 'todas') return matchesSearch;
    if (filtroAtiva === 'ativas') return matchesSearch && tarefa.ativa;
    if (filtroAtiva === 'inativas') return matchesSearch && !tarefa.ativa;
    return matchesSearch;
  });

  // Função para obter valor da célula para ordenação/filtro
  const getCellValue = (tarefa, columnId) => {
    switch (columnId) {
      case 'codigo':
        return tarefa.codigo || '';
      case 'nomeTarefa':
        return tarefa.nomeTarefa || '';
      case 'departamento':
        return tarefa.departamento?.name || '';
      case 'clientes':
        return tarefa.clientes?.length || 0;
      case 'status':
        return tarefa.ativa ? 'Ativa' : 'Inativa';
      default:
        return '';
    }
  };

  // Função para ordenar tarefas
  const handleSort = (columnId) => {
    setSortConfig(prev => {
      if (prev.key === columnId) {
        // Alternar direção: asc -> desc -> null
        if (prev.direction === 'asc') {
          return { key: columnId, direction: 'desc' };
        } else if (prev.direction === 'desc') {
          return { key: null, direction: 'asc' };
        }
      }
      return { key: columnId, direction: 'asc' };
    });
  };

  // Função para aplicar filtro em coluna
  const handleColumnFilter = (columnId, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnId]: value
    }));
  };

  // Obter valores únicos de uma coluna para filtro
  const getUniqueColumnValues = (columnId) => {
    const values = tarefasFiltradas.map(tarefa => {
      const value = getCellValue(tarefa, columnId);
      return value ? String(value) : '';
    }).filter(v => v !== '');
    
    const uniqueValues = [...new Set(values)];
    
    return uniqueValues.sort((a, b) => {
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.localeCompare(b, 'pt-BR');
    });
  };

  // Toggle valor no filtro multi-seleção
  const toggleFilterValue = (columnId, value) => {
    const currentFilters = columnFilters[columnId] || [];
    const isArray = Array.isArray(currentFilters);
    const filterArray = isArray ? currentFilters : [];
    
    if (filterArray.includes(value)) {
      const newFilters = filterArray.filter(v => v !== value);
      handleColumnFilter(columnId, newFilters.length > 0 ? newFilters : []);
    } else {
      handleColumnFilter(columnId, [...filterArray, value]);
    }
  };

  // Limpar filtro de uma coluna
  const clearColumnFilter = (columnId) => {
    handleColumnFilter(columnId, []);
  };

  // Abrir menu de filtro
  const handleOpenFilterMenu = (event, columnId) => {
    setFilterAnchorEl(event.currentTarget);
    setCurrentFilterColumn(columnId);
  };

  // Fechar menu de filtro
  const handleCloseFilterMenu = () => {
    setFilterAnchorEl(null);
    setCurrentFilterColumn(null);
  };

  // Aplicar ordenação e filtros às tarefas
  const getFilteredAndSortedTarefas = () => {
    let result = [...tarefasFiltradas];

    // Aplicar filtros de coluna
    Object.keys(columnFilters).forEach(columnId => {
      const filterValues = columnFilters[columnId];
      if (filterValues && Array.isArray(filterValues) && filterValues.length > 0) {
        result = result.filter(tarefa => {
          const cellValue = String(getCellValue(tarefa, columnId));
          return filterValues.includes(cellValue);
        });
      }
    });

    // Aplicar ordenação
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = getCellValue(a, sortConfig.key);
        const bValue = getCellValue(b, sortConfig.key);

        // Comparação numérica
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // Comparação de string
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        
        if (sortConfig.direction === 'asc') {
          return aStr.localeCompare(bStr, 'pt-BR');
        } else {
          return bStr.localeCompare(aStr, 'pt-BR');
        }
      });
    }

    return result;
  };

  const tarefasOrdenadasFiltradas = getFilteredAndSortedTarefas();

  return (
    <MainContainer>
      <MainHeader>
        <Title>Tarefas Recorrentes</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            className={classes.addButton}
            startIcon={<AddIcon />}
            onClick={handleNovaTarefa}
          >
            Nova Tarefa Recorrente
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        <Box className={classes.filtersContainer}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={8}>
              <TextField
                fullWidth
                placeholder="Pesquisar por descrição ou tipo de serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
                className={classes.searchField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
              <FormControl fullWidth variant="outlined" size="small" className={classes.filterField}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filtroAtiva}
                  onChange={(e) => setFiltroAtiva(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="todas">Todas</MenuItem>
                  <MenuItem value="ativas">Ativas</MenuItem>
                  <MenuItem value="inativas">Inativas</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {loading ? (
          <Box className={classes.loadingContainer}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer style={{ overflowX: 'auto' }}>
              <Table>
                <TableHead className={classes.tableHeader}>
                  <TableRow>
                    <TableCell 
                      className={classes.tableHeaderCell}
                      onClick={() => handleSort('codigo')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <strong>Código</strong>
                        {sortConfig.key === 'codigo' && (
                          sortConfig.direction === 'asc' 
                            ? <ArrowUpwardIcon className={classes.sortIcon} />
                            : <ArrowDownwardIcon className={classes.sortIcon} />
                        )}
                        <Tooltip title="Filtrar coluna">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenFilterMenu(e, 'codigo');
                            }}
                            style={{
                              padding: 4,
                              color: columnFilters['codigo']?.length > 0 ? '#1976d2' : '#757575'
                            }}
                          >
                            <FilterListIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </TableCell>
                    <TableCell 
                      className={classes.tableHeaderCell}
                      onClick={() => handleSort('nomeTarefa')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <strong>Nome da Tarefa</strong>
                        {sortConfig.key === 'nomeTarefa' && (
                          sortConfig.direction === 'asc' 
                            ? <ArrowUpwardIcon className={classes.sortIcon} />
                            : <ArrowDownwardIcon className={classes.sortIcon} />
                        )}
                        <Tooltip title="Filtrar coluna">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenFilterMenu(e, 'nomeTarefa');
                            }}
                            style={{
                              padding: 4,
                              color: columnFilters['nomeTarefa']?.length > 0 ? '#1976d2' : '#757575'
                            }}
                          >
                            <FilterListIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </TableCell>
                    <TableCell 
                      className={classes.tableHeaderCell}
                      onClick={() => handleSort('departamento')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <strong>Departamento</strong>
                        {sortConfig.key === 'departamento' && (
                          sortConfig.direction === 'asc' 
                            ? <ArrowUpwardIcon className={classes.sortIcon} />
                            : <ArrowDownwardIcon className={classes.sortIcon} />
                        )}
                        <Tooltip title="Filtrar coluna">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenFilterMenu(e, 'departamento');
                            }}
                            style={{
                              padding: 4,
                              color: columnFilters['departamento']?.length > 0 ? '#1976d2' : '#757575'
                            }}
                          >
                            <FilterListIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </TableCell>
                    <TableCell 
                      className={classes.tableHeaderCell}
                      onClick={() => handleSort('clientes')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <strong>Clientes</strong>
                        {sortConfig.key === 'clientes' && (
                          sortConfig.direction === 'asc' 
                            ? <ArrowUpwardIcon className={classes.sortIcon} />
                            : <ArrowDownwardIcon className={classes.sortIcon} />
                        )}
                        <Tooltip title="Filtrar coluna">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenFilterMenu(e, 'clientes');
                            }}
                            style={{
                              padding: 4,
                              color: columnFilters['clientes']?.length > 0 ? '#1976d2' : '#757575'
                            }}
                          >
                            <FilterListIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </TableCell>
                    <TableCell 
                      className={classes.tableHeaderCell}
                      onClick={() => handleSort('status')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <strong>Status</strong>
                        {sortConfig.key === 'status' && (
                          sortConfig.direction === 'asc' 
                            ? <ArrowUpwardIcon className={classes.sortIcon} />
                            : <ArrowDownwardIcon className={classes.sortIcon} />
                        )}
                        <Tooltip title="Filtrar coluna">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenFilterMenu(e, 'status');
                            }}
                            style={{
                              padding: 4,
                              color: columnFilters['status']?.length > 0 ? '#1976d2' : '#757575'
                            }}
                          >
                            <FilterListIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </TableCell>
                    <TableCell className={classes.tableHeaderCell} align="center">
                      <strong>Ações</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tarefasOrdenadasFiltradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="textSecondary">
                          {Object.values(columnFilters).some(v => v && v.length > 0)
                            ? "Nenhuma tarefa encontrada com os filtros aplicados"
                            : "Nenhuma tarefa encontrada"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    tarefasOrdenadasFiltradas.map((tarefa) => (
                      <TableRow key={tarefa.id} hover className={classes.tableRow}>
                        <TableCell className={classes.tableCell}>{tarefa.codigo || '-'}</TableCell>
                        <TableCell className={classes.tableCell}>{tarefa.nomeTarefa}</TableCell>
                        <TableCell className={classes.tableCell}>{tarefa.departamento?.name || '-'}</TableCell>
                        <TableCell className={classes.tableCell}>
                          {tarefa.clientes && tarefa.clientes.length > 0 
                            ? `${tarefa.clientes.length} cliente(s)` 
                            : '-'}
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                          <Chip
                            label={tarefa.ativa ? 'Ativa' : 'Inativa'}
                            color={tarefa.ativa ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center" className={classes.tableCell}>
                          <Box className={classes.actionButtons}>
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditar(tarefa.id)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir">
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => handleExcluir(tarefa.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box className={classes.totalCount}>
              <Typography variant="body2" color="textSecondary">
                <strong>Total:</strong> {tarefasOrdenadasFiltradas.length} tarefa(s)
              </Typography>
            </Box>
          </>
        )}
      </Paper>

      {/* Popover para filtros */}
      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={handleCloseFilterMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {currentFilterColumn && (
          <Box style={{ padding: '16px', minWidth: '250px', maxHeight: '400px', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Typography variant="subtitle2" style={{ fontWeight: 600 }}>
                Filtrar por {currentFilterColumn}
              </Typography>
              {columnFilters[currentFilterColumn]?.length > 0 && (
                <Button
                  size="small"
                  onClick={() => clearColumnFilter(currentFilterColumn)}
                  style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                >
                  Limpar
                </Button>
              )}
            </div>
            <Divider style={{ marginBottom: 8 }} />
            <List dense>
              {getUniqueColumnValues(currentFilterColumn).map((value, index) => {
                const isSelected = columnFilters[currentFilterColumn]?.includes(value);
                return (
                  <ListItem
                    key={index}
                    button
                    onClick={() => toggleFilterValue(currentFilterColumn, value)}
                    style={{
                      backgroundColor: isSelected ? '#e3f2fd' : 'transparent',
                      borderRadius: 4,
                      marginBottom: 4
                    }}
                  >
                    <Checkbox
                      edge="start"
                      checked={isSelected}
                      tabIndex={-1}
                      disableRipple
                      size="small"
                    />
                    <ListItemText
                      primary={value || '(vazio)'}
                      primaryTypographyProps={{
                        style: {
                          fontSize: '0.875rem',
                          fontWeight: isSelected ? 600 : 400
                        }
                      }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}
      </Popover>
    </MainContainer>
  );
};

export default ListaTarefasRecorrentes;
