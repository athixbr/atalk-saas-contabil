import React, {
  useState, useEffect, useReducer, useContext, useCallback, useRef, useMemo
} from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Collapse, CircularProgress,
  Tooltip, Select, FormControl, InputLabel, MenuItem, Button, Divider,
  TextField, InputAdornment, Badge
} from '@mui/material';
import {
  ExpandMore, ExpandLess, Refresh, FiberManualRecord, Search, Clear
} from '@mui/icons-material';
import { ChevronLeft } from '@material-ui/icons';
import { format, parseISO, differenceInSeconds } from 'date-fns';
import { useHistory } from 'react-router-dom';

import { AuthContext } from '../../../context/Auth/AuthContext';
import { socketConnection } from '../../../services/socket';
import MainContainer from '../../../components/MainContainer';
import MainHeader from '../../../components/MainHeader';
import MainHeaderButtonsWrapper from '../../../components/MainHeaderButtonsWrapper';
import Title from '../../../components/Title';
import api from '../../../services/api';

/* ─── LOG CONFIG ─────────────────────────────────────────────── */
const LOG_CONFIG = {
  create:                 { label: 'Ticket criado',                            emoji: '✅', color: '#4caf50' },
  chatBot:                { label: 'ChatBot iniciado',                          emoji: '🤖', color: '#9c27b0' },
  queue:                  { label: 'Fila definida',                             emoji: '📋', color: '#2196f3' },
  open:                   { label: 'Iniciou o atendimento',                     emoji: '🎧', color: '#00bcd4' },
  pending:                { label: 'Atendimento pendente',                      emoji: '⏳', color: '#ff9800' },
  access:                 { label: 'Acessou o ticket',                          emoji: '👁️', color: '#607d8b' },
  transfered:             { label: 'Transferiu o ticket',                       emoji: '➡️', color: '#ff5722' },
  receivedTransfer:       { label: 'Recebeu transferência',                     emoji: '⬅️', color: '#8bc34a' },
  inactivityReturn:       { label: 'Retornado por inatividade',                emoji: '⏰', color: '#ff9800' },
  blockedAccess:          { label: 'Acesso bloqueado',                          emoji: '🚫', color: '#f44336' },
  autoClose:              { label: 'Encerrado automaticamente',                 emoji: '🔒', color: '#795548' },
  closed:                 { label: 'Encerrou o atendimento',                    emoji: '✔️', color: '#4caf50' },
  adminTakeOver:          { label: 'Admin assumiu o ticket',                    emoji: '👮', color: '#e91e63' },
  nps:                    { label: 'NPS enviado',                               emoji: '⭐', color: '#ffc107' },
  lgpd:                   { label: 'LGPD processado',                           emoji: '🔐', color: '#9e9e9e' },
  delete:                 { label: 'Ticket deletado',                           emoji: '🗑️', color: '#f44336' },
  userDefine:             { label: 'Usuário definido',                          emoji: '👤', color: '#3f51b5' },
  retriesLimitQueue:      { label: 'Limite de tentativas da fila',              emoji: '⚠️', color: '#ff5722' },
  retriesLimitUserDefine: { label: 'Limite de tentativas do usuário',           emoji: '⚠️', color: '#ff5722' },
};

function buildLogLabel(log) {
  const cfg = LOG_CONFIG[log.type] || { label: log.type, emoji: '📌', color: '#9e9e9e' };
  const parts = [];
  if (log.user?.name) parts.push(log.user.name);
  if (log.queue?.name) parts.push(log.queue.name);
  const prefix = parts.length > 0 ? `${parts.join(' / ')} — ` : '';
  return { text: `${prefix}${cfg.label}`, emoji: cfg.emoji, color: cfg.color };
}

/* ─── HELPERS ────────────────────────────────────────────────── */
function formatDuration(totalSecs) {
  if (!totalSecs || totalSecs < 0) return '—';
  const d = Math.floor(totalSecs / 86400);
  const h = Math.floor((totalSecs % 86400) / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  if (d > 0) {
    const dias = d === 1 ? '1 dia' : `${d} dias`;
    return h > 0 ? `${dias} ${h}h` : dias;
  }
  if (h > 0) return `${h}h ${m}min`;
  if (m > 0) return `${m}min`;
  return '< 1min';
}

function calcElapsedSecs(fromDate, toDate) {
  try {
    const start = typeof fromDate === 'string' ? parseISO(fromDate) : fromDate;
    const end = toDate ? (typeof toDate === 'string' ? parseISO(toDate) : toDate) : new Date();
    return Math.max(0, differenceInSeconds(end, start));
  } catch {
    return 0;
  }
}

function statusColor(status) {
  return { open: '#00bcd4', pending: '#ff9800', closed: '#4caf50', group: '#9c27b0' }[status] || '#607d8b';
}
function statusLabel(status) {
  return { open: 'Em atendimento', pending: 'Aguardando', closed: 'Encerrado', group: 'Grupo' }[status] || status;
}

/* ─── TICKET REDUCER ──────────────────────────────────────────── */
function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return action.payload;
    case 'UPDATE': {
      const idx = state.findIndex(t => t.id === action.payload.id);
      if (idx !== -1) {
        const next = [...state];
        next[idx] = { ...next[idx], ...action.payload };
        return next;
      }
      return [action.payload, ...state];
    }
    case 'DELETE':
      return state.filter(t => t.id !== action.payload);
    default:
      return state;
  }
}

/* ─── LOG PANEL (lazy-loaded per row) ───────────────────────────── */
const LogsPanel = React.memo(({ ticketId }) => {
  const [logs, setLogs] = useState(null);

  useEffect(() => {
    api.get(`/tickets-log/${ticketId}`)
      .then(({ data }) => {
        const sorted = [...data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setLogs(sorted);
      })
      .catch(() => setLogs([]));
  }, [ticketId]);

  if (logs === null) {
    return <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={20} /></Box>;
  }
  if (logs.length === 0) {
    return <Box sx={{ p: 2 }}><Typography variant="body2" color="text.secondary">Nenhum log encontrado.</Typography></Box>;
  }

  return (
    <Box sx={{ background: '#f5f5f5' }}>
      <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" letterSpacing={1}>
          HISTÓRICO COMPLETO — {logs.length} EVENTOS
        </Typography>
      </Box>
      {logs.map((log, idx) => {
        const { text, emoji, color } = buildLogLabel(log);
        const date = parseISO(log.createdAt);
        const nextLog = logs[idx + 1];
        const elapsed = nextLog ? differenceInSeconds(parseISO(nextLog.createdAt), date) : null;
        const isLast = idx === logs.length - 1;

        return (
          <Box key={log.id || idx}>
            <Box sx={{ display: 'flex', px: 2, py: 1, gap: 1.5, alignItems: 'flex-start' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <Box sx={{
                  width: 24, height: 24, borderRadius: '50%', backgroundColor: color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11
                }}>
                  {emoji}
                </Box>
                {!isLast && <Box sx={{ width: 2, height: 12, backgroundColor: '#ddd', mt: 0.3 }} />}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600}>{text}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {format(date, 'dd/MM/yyyy')} às {format(date, 'HH:mm:ss')}
                  {elapsed !== null && (
                    <span style={{ marginLeft: 8, color: '#b0bec5' }}>
                      ⏱ {formatDuration(elapsed)} até o próximo
                    </span>
                  )}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.disabled">#{idx + 1}</Typography>
            </Box>
            {!isLast && <Divider sx={{ ml: 6 }} />}
          </Box>
        );
      })}
    </Box>
  );
});

/* ─── TIME CELL (live for open/pending tickets) ───────────────── */
const TimeCell = ({ ticket, now }) => {
  const isClosed = ticket.status === 'closed';
  const secs = isClosed
    ? calcElapsedSecs(ticket.createdAt, ticket.updatedAt)
    : calcElapsedSecs(ticket.createdAt, now);

  const openedAt = ticket.createdAt ? parseISO(ticket.createdAt) : null;
  const todayStr = format(now, 'dd/MM/yyyy');
  const openedStr = openedAt ? format(openedAt, 'dd/MM/yyyy') : null;
  const dateLabel = openedAt
    ? (openedStr === todayStr
        ? `hoje às ${format(openedAt, 'HH:mm')}`
        : `${format(openedAt, 'dd/MM')} às ${format(openedAt, 'HH:mm')}`)
    : '—';

  return (
    <Box>
      <Typography variant="body2" fontWeight={isClosed ? 400 : 600} color={isClosed ? 'text.secondary' : '#00bcd4'}>
        {formatDuration(secs)}
      </Typography>
      <Typography variant="caption" sx={{ color: '#b0bec5' }}>
        {isClosed ? 'encerrado' : 'aberto'} {dateLabel}
      </Typography>
    </Box>
  );
};

/* ─── TICKET ROW ─────────────────────────────────────────────── */
const TicketRow = React.memo(({ ticket, now }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <TableRow
        hover
        sx={{
          '& > *': { borderBottom: 'unset' },
          backgroundColor: ticket.status === 'open' ? 'rgba(0,188,212,0.04)' : 'inherit',
        }}
      >
        <TableCell sx={{ width: 44, p: 0.5 }}>
          <IconButton size="small" onClick={() => setExpanded(v => !v)}>
            {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
          </IconButton>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Typography variant="body2" fontWeight={600} color="text.secondary">
            #{ticket.id}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" fontWeight={600}>{ticket.contact?.name || '—'}</Typography>
          {ticket.contact?.number && (
            <Typography variant="caption" color="text.secondary">{ticket.contact.number}</Typography>
          )}
        </TableCell>

        <TableCell>
          {ticket.user?.name
            ? <Typography variant="body2">{ticket.user.name}</Typography>
            : <Typography variant="body2" color="text.disabled" fontStyle="italic">Sem atendente</Typography>
          }
        </TableCell>

        <TableCell>
          {ticket.queue?.name ? (
            <Chip
              label={ticket.queue.name}
              size="small"
              sx={{
                backgroundColor: ticket.queue.color || '#78909c',
                color: '#fff',
                fontWeight: 700,
                fontSize: 11
              }}
            />
          ) : (
            <Typography variant="body2" color="text.disabled">—</Typography>
          )}
        </TableCell>

        <TableCell>
          <Chip
            size="small"
            label={statusLabel(ticket.status)}
            sx={{ backgroundColor: statusColor(ticket.status), color: '#fff', fontWeight: 600, fontSize: 11 }}
          />
        </TableCell>

        <TableCell>
          <TimeCell ticket={ticket} now={now} />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Typography variant="body2">
            {ticket.updatedAt ? format(parseISO(ticket.updatedAt), 'dd/MM HH:mm') : '—'}
          </Typography>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={8} sx={{ p: 0, border: 0 }}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <LogsPanel ticketId={ticket.id} />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
});

/* ─── MAIN PAGE ──────────────────────────────────────────────── */
const TicketsLogsReport = () => {
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const [tickets, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [now, setNow] = useState(new Date());

  // Filters
  const [filterStatus, setFilterStatus] = useState('open');
  const [filterQueue, setFilterQueue]   = useState('');
  const [filterUser, setFilterUser]     = useState('');
  const [searchText, setSearchText]     = useState('');

  // Options for dropdowns (populated from loaded tickets)
  const [queueOptions, setQueueOptions] = useState([]);
  const [userOptions, setUserOptions]   = useState([]);

  /* Live clock — updates every 30s so open-ticket durations stay fresh */
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  /* ── Fetch all tickets (paginate until hasMore=false) ─────── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        showAll: true,
        queueIds: JSON.stringify(user.queues.map(q => q.id)),
      };
      if (filterStatus && filterStatus !== 'all') params.status = filterStatus;

      let page = 1;
      let all  = [];
      while (true) {
        const { data } = await api.get('/tickets', { params: { ...params, pageNumber: page } });
        all = all.concat(data.tickets || []);
        if (!data.hasMore) break;
        page++;
        if (page > 20) break; // safety cap
      }

      dispatch({ type: 'LOAD', payload: all });
      setLastRefresh(new Date());

      // Build dropdown options from the loaded data
      const qMap = {}, uMap = {};
      all.forEach(t => {
        if (t.queue) qMap[t.queue.id] = t.queue;
        if (t.user)  uMap[t.user.id]  = t.user;
      });
      setQueueOptions(Object.values(qMap).sort((a, b) => a.name.localeCompare(b.name)));
      setUserOptions(Object.values(uMap).sort((a, b) => a.name.localeCompare(b.name)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Socket — real-time updates ──────────────────────────── */
  useEffect(() => {
    const companyId = user.companyId;
    const socket = socketConnection({ companyId, userId: user.id });

    socket.on('connect', () => {
      socket.emit('joinTickets', filterStatus || 'open');
    });

    socket.on(`company-${companyId}-ticket`, (data) => {
      if (data.action === 'update' && data.ticket) {
        // Only add/update if matches current status filter
        const matchesStatus = !filterStatus || filterStatus === 'all' || data.ticket.status === filterStatus;
        if (matchesStatus) {
          dispatch({ type: 'UPDATE', payload: data.ticket });
        } else {
          // Ticket changed to a different status — remove it
          dispatch({ type: 'DELETE', payload: data.ticket.id });
        }
      }
      if (data.action === 'delete') {
        dispatch({ type: 'DELETE', payload: data.ticketId });
      }
    });

    return () => { socket.disconnect(); };
  }, [user, filterStatus]);

  /* ── Client-side filter (queue, user, text) ──────────────── */
  const filtered = useMemo(() => {
    return tickets.filter(t => {
      if (filterQueue && String(t.queueId) !== String(filterQueue)) return false;
      if (filterUser  && String(t.userId)  !== String(filterUser))  return false;
      if (searchText) {
        const q = searchText.toLowerCase();
        const name   = (t.contact?.name   || '').toLowerCase();
        const number = (t.contact?.number || '').toLowerCase();
        const id     = String(t.id);
        if (!name.includes(q) && !number.includes(q) && !id.includes(q)) return false;
      }
      return true;
    });
  }, [tickets, filterQueue, filterUser, searchText]);

  /* ── Summary counts ───────────────────────────────────────── */
  const counts = useMemo(() => ({
    open:    tickets.filter(t => t.status === 'open').length,
    pending: tickets.filter(t => t.status === 'pending').length,
    closed:  tickets.filter(t => t.status === 'closed').length,
    group:   tickets.filter(t => t.status === 'group').length,
  }), [tickets]);

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <MainContainer>
      {/* Header */}
      <MainHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small" onClick={() => history.push('/reports')}>
            <ChevronLeft />
          </IconButton>
          <Title>Logs de Tickets em Tempo Real</Title>
        </Box>
        <MainHeaderButtonsWrapper>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FiberManualRecord sx={{ color: '#4caf50', fontSize: 9 }} />
              <Typography variant="caption" color="text.secondary">
                Atualizado {format(lastRefresh, 'HH:mm:ss')} • Socket ativo
              </Typography>
            </Box>
            <Button
              startIcon={<Refresh />}
              size="small"
              variant="outlined"
              onClick={fetchAll}
              disabled={loading}
            >
              Recarregar
            </Button>
          </Box>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      {/* Summary cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        {[
          { label: 'Em atendimento', count: counts.open,    color: '#00bcd4', status: 'open'    },
          { label: 'Aguardando',     count: counts.pending,  color: '#ff9800', status: 'pending' },
          { label: 'Grupos',         count: counts.group,    color: '#9c27b0', status: 'group'   },
          { label: 'Encerrados',     count: counts.closed,   color: '#4caf50', status: 'closed'  },
          { label: 'Total carregado', count: tickets.length,  color: '#607d8b', status: 'all'    },
        ].map(c => (
          <Paper
            key={c.status}
            onClick={() => setFilterStatus(c.status)}
            sx={{
              p: 2, flex: '1 1 120px', borderLeft: `4px solid ${c.color}`,
              cursor: 'pointer', transition: 'box-shadow .15s',
              boxShadow: filterStatus === c.status ? `0 0 0 2px ${c.color}` : undefined,
              '&:hover': { boxShadow: `0 2px 8px rgba(0,0,0,.15)` }
            }}
          >
            <Typography variant="h4" fontWeight={700} color={c.color}>{c.count}</Typography>
            <Typography variant="body2" color="text.secondary">{c.label}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 1.5, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Text search */}
          <TextField
            size="small"
            placeholder="Buscar por contato, número ou #ID…"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            sx={{ minWidth: 260 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
              endAdornment: searchText ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchText('')}><Clear fontSize="small" /></IconButton>
                </InputAdornment>
              ) : null,
            }}
          />

          {/* Status */}
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <MenuItem value="open">Em atendimento</MenuItem>
              <MenuItem value="pending">Aguardando</MenuItem>
              <MenuItem value="group">Grupos</MenuItem>
              <MenuItem value="closed">Encerrados</MenuItem>
              <MenuItem value="all">Todos os status</MenuItem>
            </Select>
          </FormControl>

          {/* Queue */}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Fila</InputLabel>
            <Select label="Fila" value={filterQueue} onChange={e => setFilterQueue(e.target.value)}>
              <MenuItem value="">Todas as filas</MenuItem>
              {queueOptions.map(q => (
                <MenuItem key={q.id} value={q.id}>{q.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* User */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Atendente</InputLabel>
            <Select label="Atendente" value={filterUser} onChange={e => setFilterUser(e.target.value)}>
              <MenuItem value="">Todos os atendentes</MenuItem>
              {userOptions.map(u => (
                <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Clear filters */}
          {(filterQueue || filterUser || searchText) && (
            <Button
              size="small"
              startIcon={<Clear />}
              onClick={() => { setFilterQueue(''); setFilterUser(''); setSearchText(''); }}
            >
              Limpar filtros
            </Button>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {filtered.length} de {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Paper>

      {/* Table */}
      <Paper sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 300 }}>
        {loading && tickets.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Carregando tickets…
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 44 }} />
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Contato</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Atendente</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Fila</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Tempo gasto</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Últ. atividade</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">
                        {tickets.length === 0
                          ? 'Nenhum ticket encontrado.'
                          : 'Nenhum ticket corresponde aos filtros aplicados.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(ticket => (
                    <TicketRow key={ticket.id} ticket={ticket} now={now} />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </MainContainer>
  );
};

export default TicketsLogsReport;
