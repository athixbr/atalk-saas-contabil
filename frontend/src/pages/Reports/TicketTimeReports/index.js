import React, { useState, useEffect, useRef } from 'react';
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
  Collapse,
  Chip,
  Grid,
  Card,
  CardContent,
  makeStyles,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel
} from '@material-ui/core';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccessTime as AccessTimeIcon,
  SwapHoriz as SwapHorizIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon
} from '@material-ui/icons';
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import MainHeader from '../../../components/MainHeader';
import MainHeaderButtonsWrapper from '../../../components/MainHeaderButtonsWrapper';
import Title from '../../../components/Title';
import TableRowSkeleton from '../../../components/TableRowSkeleton';

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: theme.spacing(3),
    width: '100%',
    boxSizing: 'border-box',
  },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: 'auto',
    overflowX: 'hidden',
    width: '100%',
    boxSizing: 'border-box',
    ...theme.scrollbarStyles,
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0',
    minHeight: '48px',
  },
  cardGreen: {
    borderLeft: `4px solid ${theme.palette.success.main}`,
  },
  cardYellow: {
    borderLeft: `4px solid ${theme.palette.warning.main}`,
  },
  cardRed: {
    borderLeft: `4px solid ${theme.palette.error.main}`,
  },
  cardBlue: {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
  },
  timeline: {
    paddingLeft: theme.spacing(3),
    borderLeft: `2px solid ${theme.palette.divider}`,
    marginTop: theme.spacing(1),
  },
  timelineItem: {
    position: 'relative',
    paddingBottom: theme.spacing(2),
    '&:before': {
      content: '""',
      position: 'absolute',
      left: -9,
      top: 4,
      width: 16,
      height: 16,
      borderRadius: '50%',
      backgroundColor: theme.palette.primary.main,
      border: `2px solid ${theme.palette.background.paper}`,
    },
  },
  chipSuccess: {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark,
  },
  chipWarning: {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.dark,
  },
  chipError: {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark,
  },
  filterSection: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1.5),
    alignItems: 'center',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
  statCard: {
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1.5, 2),
    flex: 1,
    minWidth: 140,
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
  },
  liveIndicator: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: theme.palette.success.main,
    marginRight: 6,
    animation: '$pulse 1.5s infinite',
  },
  '@keyframes pulse': {
    '0%': { opacity: 1 },
    '50%': { opacity: 0.3 },
    '100%': { opacity: 1 },
  },
}));

const formatTime = (seconds) => {
  if (!seconds || seconds === 0) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

const TicketRow = ({ ticket }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'closed':
        return 'success';
      case 'waiting':
        return 'warning';
      case 'active':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getTempoOciosoChip = (tempoOcioso) => {
    if (tempoOcioso > 3600) return classes.chipError;
    if (tempoOcioso > 1800) return classes.chipWarning;
    return classes.chipSuccess;
  };

  return (
    <>
      <TableRow hover>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </TableCell>
        <TableCell>#{ticket.ticketNumber}</TableCell>
        <TableCell>{ticket.contactName}</TableCell>
        <TableCell>
          <Chip
            label={ticket.status}
            color={getStatusColor(ticket.status)}
            size="small"
          />
        </TableCell>
        <TableCell>{formatTime(ticket.tempoEsperaInicial)}</TableCell>
        <TableCell>{formatTime(ticket.tempoAtePrimeiraResposta)}</TableCell>
        <TableCell>{formatTime(ticket.tempoTotalAtendimento)}</TableCell>
        <TableCell>
          <Chip
            label={formatTime(ticket.tempoOcioso)}
            size="small"
            className={getTempoOciosoChip(ticket.tempoOcioso)}
          />
        </TableCell>
        <TableCell>{ticket.numeroTransferencias}</TableCell>
        <TableCell>{ticket.usuariosAtendentes.length}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={2}>
              <Typography variant="h6" gutterBottom>
                📊 Detalhes do Atendimento
              </Typography>
              
              <Grid container spacing={2} style={{ marginBottom: 16 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card className={classes.cardBlue}>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom variant="caption">
                        Mensagens Cliente
                      </Typography>
                      <Typography variant="h5">
                        {ticket.totalMensagensCliente}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card className={classes.cardGreen}>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom variant="caption">
                        Mensagens Atendente
                      </Typography>
                      <Typography variant="h5">
                        {ticket.totalMensagensUsuario}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card className={classes.cardYellow}>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom variant="caption">
                        Tempo Ativo
                      </Typography>
                      <Typography variant="h6">
                        {formatTime(ticket.tempoAtivo)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card className={classes.cardRed}>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom variant="caption">
                        Tempo Parado
                      </Typography>
                      <Typography variant="h6">
                        {formatTime(ticket.tempoOcioso)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="subtitle1" gutterBottom style={{ marginTop: 16 }}>
                🔄 Linha do Tempo de Atendimento
              </Typography>
              
              <div className={classes.timeline}>
                {ticket.usuariosAtendentes.map((user, index) => (
                  <div key={index} className={classes.timelineItem}>
                    <Typography variant="body2" color="primary">
                      <strong>{user.order}º Atendente:</strong> {user.userName} ({user.queueName})
                    </Typography>
                    <Typography variant="caption" display="block">
                      Início: {new Date(user.startedAt).toLocaleString('pt-BR')}
                    </Typography>
                    {user.finishedAt && (
                      <Typography variant="caption" display="block">
                        Fim: {new Date(user.finishedAt).toLocaleString('pt-BR')}
                      </Typography>
                    )}
                    <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                      <Chip
                        size="small"
                        icon={<AccessTimeIcon style={{ fontSize: 14 }} />}
                        label={`Tempo: ${formatTime(user.tempoTotal)}`}
                      />
                      <Chip
                        size="small"
                        label={`${user.totalMensagens} mensagens`}
                      />
                      {user.foiTransferido && (
                        <Chip
                          size="small"
                          icon={<SwapHorizIcon style={{ fontSize: 14 }} />}
                          label="Transferiu"
                          className={classes.chipWarning}
                        />
                      )}
                      {user.finalizouTicket && (
                        <Chip
                          size="small"
                          icon={<CheckCircleIcon style={{ fontSize: 14 }} />}
                          label="Finalizou"
                          className={classes.chipSuccess}
                        />
                      )}
                    </Box>
                  </div>
                ))}
              </div>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const TicketTimeReports = () => {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [queues, setQueues] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedQueue, setSelectedQueue] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef(null);

  const hoje = new Date();
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const [dateStart, setDateStart] = useState(
    primeiroDiaMes.toISOString().split('T')[0]
  );
  const [dateEnd, setDateEnd] = useState(
    hoje.toISOString().split('T')[0]
  );

  // Carrega usuários e filas para os filtros
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [usersRes, queuesRes] = await Promise.all([
          api.get('/users', { params: { all: true } }),
          api.get('/queue'),
        ]);
        setUsers(usersRes.data?.users || usersRes.data || []);
        setQueues(queuesRes.data || []);
      } catch (e) {
        console.error('Erro ao carregar filtros:', e);
      }
    };
    loadFilters();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const params = { dateStart, dateEnd };
      if (selectedUser) params.userId = selectedUser;
      if (selectedQueue) params.queueId = selectedQueue;
      if (selectedStatus) params.status = selectedStatus;

      const { data } = await api.get('/reports/tickets/time', { params });
      setTickets(data);
    } catch (error) {
      toast.error('Erro ao carregar relatório');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh a cada 30s quando ativo
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        loadReports();
      }, 30000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, dateStart, dateEnd, selectedUser, selectedQueue, selectedStatus]);

  const handleSearch = () => {
    if (!dateStart || !dateEnd) {
      toast.warning('Selecione as datas de início e fim');
      return;
    }
    loadReports();
  };

  // Estatísticas resumidas
  const stats = React.useMemo(() => {
    if (!tickets.length) return null;
    const closed = tickets.filter(t => t.status === 'closed');
    const avgTotal = closed.length
      ? Math.round(closed.reduce((s, t) => s + (t.tempoTotalAtendimento || 0), 0) / closed.length)
      : 0;
    const avgFirst = closed.length
      ? Math.round(closed.reduce((s, t) => s + (t.tempoAtePrimeiraResposta || 0), 0) / closed.length)
      : 0;
    const withTransfer = tickets.filter(t => t.numeroTransferencias > 0).length;
    return {
      total: tickets.length,
      closed: closed.length,
      open: tickets.filter(t => t.status === 'open' || t.status === 'active').length,
      avgTotal,
      avgFirst,
      withTransfer,
    };
  }, [tickets]);

  return (
    <div className={classes.mainContainer}>
      <Box style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
        <IconButton onClick={() => history.goBack()} size="small">
          <ChevronLeft />
        </IconButton>
        <Typography variant="body2" style={{ cursor: 'pointer' }} onClick={() => history.goBack()}>
          Voltar
        </Typography>
      </Box>

      <MainHeader>
        <Title>
          {autoRefresh && <span className={classes.liveIndicator} />}
          Relatório de Tempo de Atendimento
        </Title>
        <MainHeaderButtonsWrapper>
          <Tooltip title="Atualizar agora">
            <IconButton onClick={loadReports} disabled={loading} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                color="primary"
              />
            }
            label={<Typography variant="caption">Tempo real</Typography>}
            style={{ marginRight: 8 }}
          />
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper} variant="outlined">
        {/* Filtros */}
        <div className={classes.filterSection}>
          <TextField
            label="Data Início"
            type="date"
            size="small"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            InputLabelProps={{ shrink: true }}
            style={{ minWidth: 150 }}
          />
          <TextField
            label="Data Fim"
            type="date"
            size="small"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            InputLabelProps={{ shrink: true }}
            style={{ minWidth: 150 }}
          />
          <FormControl size="small" style={{ minWidth: 160 }}>
            <InputLabel>Atendente</InputLabel>
            <Select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" style={{ minWidth: 160 }}>
            <InputLabel>Fila</InputLabel>
            <Select
              value={selectedQueue}
              onChange={(e) => setSelectedQueue(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {queues.map((q) => (
                <MenuItem key={q.id} value={q.id}>{q.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" style={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="closed">Encerrado</MenuItem>
              <MenuItem value="open">Aberto</MenuItem>
              <MenuItem value="pending">Pendente</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            disabled={loading}
            size="small"
          >
            Buscar
          </Button>
        </div>

        {/* Cards de resumo */}
        {stats && (
          <Grid container spacing={2} style={{ marginBottom: 16 }}>
            <Grid item xs={6} sm={4} md={2}>
              <Card className={classes.cardBlue}>
                <CardContent style={{ padding: '12px 16px' }}>
                  <Typography variant="caption" color="textSecondary">Total</Typography>
                  <Typography variant="h5">{stats.total}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Card className={classes.cardGreen}>
                <CardContent style={{ padding: '12px 16px' }}>
                  <Typography variant="caption" color="textSecondary">Encerrados</Typography>
                  <Typography variant="h5">{stats.closed}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Card className={classes.cardYellow}>
                <CardContent style={{ padding: '12px 16px' }}>
                  <Typography variant="caption" color="textSecondary">Em Aberto</Typography>
                  <Typography variant="h5">{stats.open}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Card className={classes.cardRed}>
                <CardContent style={{ padding: '12px 16px' }}>
                  <Typography variant="caption" color="textSecondary">Com Transferência</Typography>
                  <Typography variant="h5">{stats.withTransfer}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Card className={classes.cardBlue}>
                <CardContent style={{ padding: '12px 16px' }}>
                  <Typography variant="caption" color="textSecondary">Tempo Médio Total</Typography>
                  <Typography variant="body1" style={{ fontWeight: 600 }}>{formatTime(stats.avgTotal)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Card className={classes.cardGreen}>
                <CardContent style={{ padding: '12px 16px' }}>
                  <Typography variant="caption" color="textSecondary">Média 1ª Resposta</Typography>
                  <Typography variant="body1" style={{ fontWeight: 600 }}>{formatTime(stats.avgFirst)}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {loading && <TableRowSkeleton />}

        {!loading && tickets.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="textSecondary">
              Nenhum ticket encontrado
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Ajuste os filtros e clique em Buscar
            </Typography>
          </Box>
        )}

        {!loading && tickets.length > 0 && (
          <>
            <Box mb={1} display="flex" flexWrap="wrap" style={{ gap: 8 }}>
              <Chip size="small" label="Tempo Ocioso Bom (<30min)" className={classes.chipSuccess} />
              <Chip size="small" label="Tempo Ocioso Médio (30-60min)" className={classes.chipWarning} />
              <Chip size="small" label="Tempo Ocioso Alto (>60min)" className={classes.chipError} />
              <Typography variant="caption" color="textSecondary" style={{ alignSelf: 'center', marginLeft: 8 }}>
                {tickets.length} ticket(s) encontrado(s)
              </Typography>
            </Box>

            <div className={classes.tableWrapper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>Ticket</TableCell>
                    <TableCell>Contato</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>
                      <Tooltip title="Tempo desde abertura até primeira visualização">
                        <span>Espera Inicial</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Tempo até primeira mensagem do atendente">
                        <span>1ª Resposta</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Tempo total desde abertura até fechamento">
                        <span>Tempo Total</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Tempo sem interação do atendente">
                        <span>Ocioso</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>Transferências</TableCell>
                    <TableCell>Atendentes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TicketRow key={ticket.ticketId} ticket={ticket} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </Paper>
    </div>
  );
};

export default TicketTimeReports;
