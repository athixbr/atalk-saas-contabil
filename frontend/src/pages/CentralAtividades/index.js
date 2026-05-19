import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Grid, Card, CardContent, Typography, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem
} from '@material-ui/core';
import {
  Edit as EditIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  PlayArrow as StartIcon,
  Visibility as ViewIcon,
  Autorenew as RefreshIcon
} from '@material-ui/icons';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CentralAtividades = () => {
  const [tarefas, setTarefas] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    status: '',
    clienteId: '',
    departamentoId: '',
    userId: ''
  });
  
  const [clientes, setClientes] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  
  const [dialogStatus, setDialogStatus] = useState(false);
  const [dialogReatribuir, setDialogReatribuir] = useState(false);
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
  const [novoStatus, setNovoStatus] = useState('');
  const [observacao, setObservacao] = useState('');
  const [historico, setHistorico] = useState([]);
  const [novoResponsavel, setNovoResponsavel] = useState({
    departamentoId: '',
    userId: ''
  });

  useEffect(() => {
    carregarDados();
    carregarStatistics();
  }, [filtros]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const params = { ...filtros };
      
      const [tarefasRes, clientesRes, deptosRes, usersRes] = await Promise.all([
        api.get('/tarefas-geradas', { params }),
        api.get('/contacts'),
        api.get('/departamentos'),
        api.get('/users')
      ]);

      setTarefas(tarefasRes.data);
      
      // Ordenar clientes alfabeticamente
      const clientesData = clientesRes.data.contacts || clientesRes.data || [];
      const clientesOrdenados = [...clientesData].sort((a, b) => 
        (a.name || '').localeCompare(b.name || '')
      );
      setClientes(clientesOrdenados);
      setDepartamentos(deptosRes.data.departamentos || deptosRes.data || []);
      setUsuarios(usersRes.data.users || usersRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const carregarStatistics = async () => {
    try {
      const { data } = await api.get('/tarefas-geradas/statistics');
      setStatistics(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleOpenStatus = async (tarefa) => {
    setTarefaSelecionada(tarefa);
    setNovoStatus(tarefa.status);
    setObservacao('');
    setDialogStatus(true);
    
    // Carregar histórico
    try {
      const { data } = await api.get(`/tarefas-geradas/${tarefa.id}/historico`);
      setHistorico(data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setHistorico([]);
    }
  };

  const handleSalvarStatus = async () => {
    if (!novoStatus) {
      toast.error('Selecione um status');
      return;
    }
    
    try {
      await api.put(`/tarefas-geradas/${tarefaSelecionada.id}/status`, {
        status: novoStatus,
        observacao: observacao || undefined
      });
      toast.success('Status atualizado com sucesso');
      setDialogStatus(false);
      carregarDados();
      carregarStatistics();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleOpenReatribuir = (tarefa) => {
    setTarefaSelecionada(tarefa);
    setNovoResponsavel({
      departamentoId: tarefa.departamentoId || '',
      userId: tarefa.userId || ''
    });
    setDialogReatribuir(true);
  };

  const handleReatribuir = async () => {
    try {
      await api.put(`/tarefas-geradas/${tarefaSelecionada.id}/reatribuir`, {
        departamentoId: novoResponsavel.departamentoId,
        novoUserId: novoResponsavel.userId,
        observacao: 'Reatribuída manualmente pela Central de Atividades'
      });
      toast.success('Tarefa reatribuída com sucesso');
      setDialogReatribuir(false);
      carregarDados();
    } catch (error) {
      console.error('Erro ao reatribuir:', error);
      toast.error('Erro ao reatribuir tarefa');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pendente': 'warning',
      'em_andamento': 'info',
      'concluida': 'success',
      'cancelada': 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pendente': 'Pendente',
      'em_andamento': 'Em Andamento',
      'concluida': 'Concluída',
      'cancelada': 'Cancelada'
    };
    return labels[status] || status;
  };

  const handleClickCard = (status) => {
    setFiltros({ ...filtros, status: status || '' });
  };

  return (
    <Box style={{ padding: 24 }}>
      <Typography variant="h4" style={{ marginBottom: 24 }}>
        Central de Atividades
      </Typography>

      {/* Cards de Estatísticas */}
      <Grid container spacing={2} style={{ marginBottom: 24 }}>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <Card style={{ cursor: 'pointer' }} onClick={() => handleClickCard('')}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total</Typography>
              <Typography variant="h4">{statistics.total || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <Card style={{ borderLeft: '4px solid #ff9800', cursor: 'pointer' }} onClick={() => handleClickCard('pendente')}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Pendentes</Typography>
              <Typography variant="h4">{statistics.pendentes || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <Card style={{ borderLeft: '4px solid #2196f3', cursor: 'pointer' }} onClick={() => handleClickCard('em_andamento')}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Em Andamento</Typography>
              <Typography variant="h4">{statistics.emAndamento || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <Card style={{ borderLeft: '4px solid #4caf50', cursor: 'pointer' }} onClick={() => handleClickCard('concluida')}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Concluídas</Typography>
              <Typography variant="h4">{statistics.concluidas || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <Card style={{ borderLeft: '4px solid #f44336', cursor: 'pointer' }} onClick={() => handleClickCard('cancelada')}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Canceladas</Typography>
              <Typography variant="h4">{statistics.canceladas || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Paper style={{ padding: 16, marginBottom: 24 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filtros.status}
                onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="pendente">Pendente</MenuItem>
                <MenuItem value="em_andamento">Em Andamento</MenuItem>
                <MenuItem value="concluida">Concluída</MenuItem>
                <MenuItem value="cancelada">Cancelada</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Cliente</InputLabel>
              <Select
                value={filtros.clienteId}
                onChange={(e) => setFiltros({ ...filtros, clienteId: e.target.value })}
              >
                <MenuItem value="">Todos</MenuItem>
                {clientes.map(cliente => (
                  <MenuItem key={cliente.id} value={cliente.id}>{cliente.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Departamento</InputLabel>
              <Select
                value={filtros.departamentoId}
                onChange={(e) => setFiltros({ ...filtros, departamentoId: e.target.value })}
              >
                <MenuItem value="">Todos</MenuItem>
                {departamentos.map(dept => (
                  <MenuItem key={dept.id} value={dept.id}>{dept.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setFiltros({ status: '', clienteId: '', departamentoId: '', userId: '' })}
            >
              Limpar Filtros
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabela de Tarefas */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nº</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Prazo</TableCell>
              <TableCell>Departamento</TableCell>
              <TableCell>Responsável</TableCell>
              <TableCell>Competência</TableCell>
              <TableCell>Data Entrega</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center">Carregando...</TableCell>
              </TableRow>
            ) : tarefas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">Nenhuma tarefa encontrada</TableCell>
              </TableRow>
            ) : (
              tarefas.map((tarefa) => (
                <TableRow key={tarefa.id}>
                  <TableCell>{tarefa.id}</TableCell>
                  <TableCell>{tarefa.titulo}</TableCell>
                  <TableCell>{tarefa.cliente?.name || tarefa.cliente?.nome || '-'}</TableCell>
                  <TableCell>
                    {tarefa.dataInicio ? format(parseISO(tarefa.dataInicio), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                  </TableCell>
                  <TableCell>{tarefa.departamento?.nome || '-'}</TableCell>
                  <TableCell>{tarefa.user?.name || '-'}</TableCell>
                  <TableCell>{tarefa.competencia}</TableCell>
                  <TableCell>
                    {tarefa.dataEntrega ? format(parseISO(tarefa.dataEntrega), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(tarefa.status)}
                      color={getStatusColor(tarefa.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      title="Alterar Status"
                      onClick={() => handleOpenStatus(tarefa)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      title="Reatribuir"
                      onClick={() => handleOpenReatribuir(tarefa)}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Alteração de Status */}
      <Dialog open={dialogStatus} onClose={() => setDialogStatus(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Alterar Status da Tarefa #{tarefaSelecionada?.id}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: 8 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">
                Status Atual: {tarefaSelecionada && getStatusLabel(tarefaSelecionada.status)}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Novo Status</InputLabel>
                <Select
                  value={novoStatus}
                  onChange={(e) => setNovoStatus(e.target.value)}
                >
                  <MenuItem value="pendente">Pendente</MenuItem>
                  <MenuItem value="em_andamento">Em Andamento</MenuItem>
                  <MenuItem value="concluida">Concluída</MenuItem>
                  <MenuItem value="cancelada">Cancelada</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Observação"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </Grid>
            
            {/* Histórico */}
            <Grid item xs={12}>
              <Typography variant="h6" style={{ marginTop: 16, marginBottom: 8 }}>
                Histórico de Alterações
              </Typography>
              <TableContainer component={Paper} style={{ maxHeight: 300 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Data</TableCell>
                      <TableCell>Usuário</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Observação</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {historico.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">Nenhuma alteração registrada</TableCell>
                      </TableRow>
                    ) : (
                      historico.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {item.createdAt ? format(parseISO(item.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-'}
                          </TableCell>
                          <TableCell>{item.usuario?.name || item.user?.name || '-'}</TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(item.status)}
                              color={getStatusColor(item.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{item.observacao || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogStatus(false)}>Cancelar</Button>
          <Button variant="contained" color="primary" onClick={handleSalvarStatus}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Reatribuição */}
      <Dialog open={dialogReatribuir} onClose={() => setDialogReatribuir(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reatribuir Tarefa</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: 8 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Departamento</InputLabel>
                <Select
                  value={novoResponsavel.departamentoId}
                  onChange={(e) => setNovoResponsavel({ ...novoResponsavel, departamentoId: e.target.value })}
                >
                  {departamentos.map(dept => (
                    <MenuItem key={dept.id} value={dept.id}>{dept.nome}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Usuário</InputLabel>
                <Select
                  value={novoResponsavel.userId}
                  onChange={(e) => setNovoResponsavel({ ...novoResponsavel, userId: e.target.value })}
                >
                  {usuarios
                    .filter(u => !novoResponsavel.departamentoId || 
                      u.departamentos?.some(d => d.id === novoResponsavel.departamentoId))
                    .map(user => (
                      <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogReatribuir(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleReatribuir}>Reatribuir</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CentralAtividades;
