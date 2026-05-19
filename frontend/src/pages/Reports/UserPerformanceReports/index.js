import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  makeStyles,
  Avatar,
  LinearProgress
} from '@material-ui/core';
import {
  ChevronLeft,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  EmojiEvents as TrophyIcon,
  Speed as SpeedIcon,
  SwapHoriz as TransferIcon,
  CheckCircle as CheckIcon
} from '@material-ui/icons';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import MainContainer from '../../../components/MainContainer';
import MainHeader from '../../../components/MainHeader';
import MainHeaderButtonsWrapper from '../../../components/MainHeaderButtonsWrapper';
import Title from '../../../components/Title';
import TableRowSkeleton from '../../../components/TableRowSkeleton';

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: 'scroll',
    ...theme.scrollbarStyles,
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0',
    minHeight: '48px',
  },
  cardGold: {
    borderLeft: `4px solid #FFD700`,
    background: 'linear-gradient(135deg, #FFF8DC 0%, #FFFFFF 100%)',
  },
  cardSilver: {
    borderLeft: `4px solid #C0C0C0`,
    background: 'linear-gradient(135deg, #F5F5F5 0%, #FFFFFF 100%)',
  },
  cardBronze: {
    borderLeft: `4px solid #CD7F32`,
    background: 'linear-gradient(135deg, #FFF0E0 0%, #FFFFFF 100%)',
  },
  cardGreen: {
    borderLeft: `4px solid ${theme.palette.success.main}`,
  },
  cardRed: {
    borderLeft: `4px solid ${theme.palette.error.main}`,
  },
  avatarGold: {
    backgroundColor: '#FFD700',
    color: '#000',
  },
  avatarSilver: {
    backgroundColor: '#C0C0C0',
    color: '#000',
  },
  avatarBronze: {
    backgroundColor: '#CD7F32',
    color: '#fff',
  },
  progressGreen: {
    backgroundColor: theme.palette.success.light,
    '& .MuiLinearProgress-bar': {
      backgroundColor: theme.palette.success.main,
    },
  },
  progressYellow: {
    backgroundColor: theme.palette.warning.light,
    '& .MuiLinearProgress-bar': {
      backgroundColor: theme.palette.warning.main,
    },
  },
  progressRed: {
    backgroundColor: theme.palette.error.light,
    '& .MuiLinearProgress-bar': {
      backgroundColor: theme.palette.error.main,
    },
  },
}));

const formatTime = (seconds) => {
  if (!seconds || seconds === 0) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

const UserPerformanceReports = () => {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  
  // Define datas padrão: primeiro dia do mês até hoje
  const hoje = new Date();
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  
  const [dateStart, setDateStart] = useState(
    primeiroDiaMes.toISOString().split('T')[0]
  );
  const [dateEnd, setDateEnd] = useState(
    hoje.toISOString().split('T')[0]
  );

  const loadReports = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/reports/users/performance', {
        params: {
          dateStart,
          dateEnd,
        },
      });
      setUsers(data);
    } catch (error) {
      toast.error('Erro ao carregar relatório');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Carrega automaticamente ao montar o componente
  React.useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    if (!dateStart || !dateEnd) {
      toast.warning('Selecione as datas de início e fim');
      return;
    }
    loadReports();
  };

  const handleBack = () => {
    history.goBack();
  };

  const getTransferClass = (percentage) => {
    if (percentage <= 10) return classes.progressGreen;
    if (percentage <= 25) return classes.progressYellow;
    return classes.progressRed;
  };

  const getTopUsers = () => {
    if (users.length === 0) return { fastest: null, slowest: null, mostProductive: null };
    
    const sorted = [...users].sort((a, b) => a.tempoMedioAtendimento - b.tempoMedioAtendimento);
    const fastest = sorted[0];
    const slowest = sorted[sorted.length - 1];
    const mostProductive = [...users].sort((a, b) => b.totalTicketsAtendidos - a.totalTicketsAtendidos)[0];

    return { fastest, slowest, mostProductive };
  };

  const topUsers = getTopUsers();

  return (
    <MainContainer>
      <Box sx={{ display: 'flex', flexDirection: 'row', width: '50px' }}>
        <div className={classes.toolbarIcon}>
          <IconButton onClick={handleBack}>
            <ChevronLeft />
            <span style={{ fontSize: '1rem' }}>Voltar</span>
          </IconButton>
        </div>
      </Box>
      
      <MainHeader>
        <Title>👥 Relatório de Performance dos Atendentes</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            label="Data Início"
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            InputLabelProps={{ shrink: true }}
            style={{ marginRight: 8 }}
          />
          <TextField
            label="Data Fim"
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            InputLabelProps={{ shrink: true }}
            style={{ marginRight: 8 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            disabled={loading}
          >
            Buscar
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper}>
        {loading && <TableRowSkeleton />}
        
        {!loading && users.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="textSecondary">
              📊 Nenhum dado encontrado
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Selecione um período e clique em Buscar
            </Typography>
          </Box>
        )}

        {!loading && users.length > 0 && (
          <>
            {/* CARDS DE DESTAQUE */}
            <Grid container spacing={2} style={{ marginBottom: 24 }}>
              <Grid item xs={12} md={4}>
                <Card className={classes.cardGold}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Avatar className={classes.avatarGold}>
                        <TrophyIcon />
                      </Avatar>
                      <Box ml={2}>
                        <Typography variant="caption" color="textSecondary">
                          🏆 Mais Rápido
                        </Typography>
                        <Typography variant="h6">
                          {topUsers.fastest?.userName}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="h5" color="primary">
                      {formatTime(topUsers.fastest?.tempoMedioAtendimento)}
                    </Typography>
                    <Typography variant="caption">
                      Tempo médio de atendimento
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card className={classes.cardSilver}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Avatar className={classes.avatarSilver}>
                        <SpeedIcon />
                      </Avatar>
                      <Box ml={2}>
                        <Typography variant="caption" color="textSecondary">
                          🚀 Mais Produtivo
                        </Typography>
                        <Typography variant="h6">
                          {topUsers.mostProductive?.userName}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="h5" color="primary">
                      {topUsers.mostProductive?.totalTicketsAtendidos}
                    </Typography>
                    <Typography variant="caption">
                      Tickets atendidos
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card className={classes.cardBronze}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Avatar className={classes.avatarBronze}>
                        <TrendingDownIcon />
                      </Avatar>
                      <Box ml={2}>
                        <Typography variant="caption" color="textSecondary">
                          ⚠️ Precisa Melhorar
                        </Typography>
                        <Typography variant="h6">
                          {topUsers.slowest?.userName}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="h5" color="secondary">
                      {formatTime(topUsers.slowest?.tempoMedioAtendimento)}
                    </Typography>
                    <Typography variant="caption">
                      Tempo médio de atendimento
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* LEGENDAS */}
            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                <strong>📖 Legendas:</strong>
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap" mt={1}>
                <Chip size="small" label="🟢 Transferências Baixas (<10%)" className={classes.progressGreen} />
                <Chip size="small" label="🟡 Transferências Médias (10-25%)" className={classes.progressYellow} />
                <Chip size="small" label="🔴 Transferências Altas (>25%)" className={classes.progressRed} />
              </Box>
            </Box>

            {/* TABELA DE PERFORMANCE */}
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Posição</TableCell>
                  <TableCell>Atendente</TableCell>
                  <TableCell align="center">Tickets</TableCell>
                  <TableCell align="center">Tempo Médio</TableCell>
                  <TableCell align="center">Mais Rápido</TableCell>
                  <TableCell align="center">Mais Lento</TableCell>
                  <TableCell align="center">Transferências</TableCell>
                  <TableCell align="center">Taxa Resolução</TableCell>
                  <TableCell align="center">Mensagens</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={user.userId} hover>
                    <TableCell>
                      {index === 0 && <TrophyIcon style={{ color: '#FFD700', fontSize: 20 }} />}
                      {index === 1 && <TrophyIcon style={{ color: '#C0C0C0', fontSize: 20 }} />}
                      {index === 2 && <TrophyIcon style={{ color: '#CD7F32', fontSize: 20 }} />}
                      {index > 2 && <span>{index + 1}º</span>}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        <strong>{user.userName}</strong>
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={user.totalTicketsAtendidos} color="primary" size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <strong>{formatTime(user.tempoMedioAtendimento)}</strong>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="caption" style={{ color: 'green' }}>
                        {formatTime(user.ticketMaisRapido)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="caption" style={{ color: 'red' }}>
                        {formatTime(user.ticketMaisLento)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box>
                        <Typography variant="caption">
                          {user.totalTransferencias} ({user.percentualTransferencias}%)
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(user.percentualTransferencias, 100)}
                          className={getTransferClass(user.percentualTransferencias)}
                          style={{ marginTop: 4 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${user.taxaResolucao}%`}
                        size="small"
                        style={{
                          backgroundColor: user.taxaResolucao >= 80 ? '#4caf50' : user.taxaResolucao >= 60 ? '#ff9800' : '#f44336',
                          color: '#fff'
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="caption">
                        {user.totalMensagens} ({user.mediaMensagensPorTicket}/ticket)
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* RESUMO GERAL */}
            <Box mt={3} p={2} bgcolor="rgba(0, 0, 0, 0.02)" borderRadius={2}>
              <Typography variant="subtitle2" gutterBottom>
                📊 Resumo Geral do Período
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="textSecondary">Total de Atendentes</Typography>
                  <Typography variant="h6">{users.length}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="textSecondary">Total de Tickets</Typography>
                  <Typography variant="h6">
                    {users.reduce((sum, u) => sum + u.totalTicketsAtendidos, 0)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="textSecondary">Média Geral de Tempo</Typography>
                  <Typography variant="h6">
                    {formatTime(Math.round(users.reduce((sum, u) => sum + u.tempoMedioAtendimento, 0) / users.length))}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="textSecondary">Taxa Média Resolução</Typography>
                  <Typography variant="h6">
                    {Math.round(users.reduce((sum, u) => sum + u.taxaResolucao, 0) / users.length)}%
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </>
        )}
      </Paper>
    </MainContainer>
  );
};

export default UserPerformanceReports;
