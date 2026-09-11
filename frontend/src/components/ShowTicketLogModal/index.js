import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, Box, Divider, Tooltip
} from '@mui/material';
import { format, parseISO, differenceInSeconds, differenceInMinutes, differenceInHours } from 'date-fns';

const LOG_CONFIG = {
  create:                  { label: 'Ticket criado',                           emoji: '✅', color: '#4caf50', showUser: false, showQueue: false },
  chatBot:                 { label: 'ChatBot iniciado',                         emoji: '🤖', color: '#9c27b0', showUser: false, showQueue: false },
  queue:                   { label: 'Fila definida',                            emoji: '📋', color: '#2196f3', showUser: false, showQueue: true  },
  open:                    { label: 'Iniciou o atendimento',                    emoji: '🎧', color: '#00bcd4', showUser: true,  showQueue: false },
  pending:                 { label: 'Atendimento pendente',                     emoji: '⏳', color: '#ff9800', showUser: true,  showQueue: false },
  access:                  { label: 'Acessou o ticket',                         emoji: '👁️', color: '#607d8b', showUser: true,  showQueue: false },
  transfered:              { label: 'Transferiu o ticket',                      emoji: '➡️', color: '#ff5722', showUser: true,  showQueue: false },
  receivedTransfer:        { label: 'Recebeu o ticket transferido',             emoji: '⬅️', color: '#8bc34a', showUser: true,  showQueue: true  },
  inactivityReturn:        { label: 'Retornado por inatividade (1h sem resposta)', emoji: '⏰', color: '#ff9800', showUser: false, showQueue: false },
  blockedAccess:           { label: 'Tentou acessar ticket em atendimento',     emoji: '🚫', color: '#f44336', showUser: true,  showQueue: false },
  autoClose:               { label: 'Ticket encerrado automaticamente',         emoji: '🔒', color: '#795548', showUser: false, showQueue: false },
  closed:                  { label: 'Encerrou o atendimento',                   emoji: '✔️', color: '#4caf50', showUser: true,  showQueue: false },
  adminTakeOver:           { label: 'Administrador assumiu o ticket',           emoji: '👮', color: '#e91e63', showUser: true,  showQueue: false },
  nps:                     { label: 'NPS enviado',                              emoji: '⭐', color: '#ffc107', showUser: false, showQueue: false },
  lgpd:                    { label: 'LGPD processado',                          emoji: '🔐', color: '#9e9e9e', showUser: false, showQueue: false },
  delete:                  { label: 'Ticket deletado',                          emoji: '🗑️', color: '#f44336', showUser: true,  showQueue: false },
  userDefine:              { label: 'Usuário definido',                         emoji: '👤', color: '#3f51b5', showUser: true,  showQueue: false },
  retriesLimitQueue:       { label: 'Limite de tentativas da fila atingido',    emoji: '⚠️', color: '#ff5722', showUser: false, showQueue: true  },
  retriesLimitUserDefine:  { label: 'Limite de tentativas do usuário atingido', emoji: '⚠️', color: '#ff5722', showUser: true,  showQueue: false },
};

function formatElapsed(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function buildLabel(log) {
  const cfg = LOG_CONFIG[log.type] || { label: log.type, emoji: '📌', color: '#9e9e9e', showUser: false, showQueue: false };
  const parts = [];
  if (cfg.showUser && log.user?.name) parts.push(log.user.name);
  if (cfg.showQueue && log.queue?.name) parts.push(log.queue.name);
  const prefix = parts.length > 0 ? `${parts.join(' / ')} — ` : '';
  return { text: `${prefix}${cfg.label}`, emoji: cfg.emoji, color: cfg.color };
}

const ShowTicketLogModal = ({ isOpen, handleClose, logs }) => {
  const sorted = [...(logs || [])].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" component="span">Histórico do Ticket</Typography>
          <Typography variant="body2" color="text.secondary" component="span">
            ({sorted.length} {sorted.length === 1 ? 'evento' : 'eventos'})
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ maxHeight: '65vh', overflowY: 'auto', p: 0 }}>
        {sorted.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Nenhum evento registrado para este ticket.</Typography>
          </Box>
        ) : (
          sorted.map((log, index) => {
            const { text, emoji, color } = buildLabel(log);
            const date = parseISO(log.createdAt);
            const nextLog = sorted[index + 1];
            const elapsedToNext = nextLog
              ? differenceInSeconds(parseISO(nextLog.createdAt), date)
              : null;
            const isLast = index === sorted.length - 1;

            return (
              <Box key={log.id || index}>
                <Box sx={{ display: 'flex', px: 2.5, py: 1.5, gap: 2, alignItems: 'flex-start' }}>
                  {/* Timeline: dot + line */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <Box sx={{
                      width: 32, height: 32, borderRadius: '50%',
                      backgroundColor: color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, userSelect: 'none', flexShrink: 0
                    }}>
                      <span>{emoji}</span>
                    </Box>
                    {!isLast && (
                      <Box sx={{ width: 2, flex: 1, minHeight: 12, backgroundColor: '#e0e0e0', mt: 0.5 }} />
                    )}
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1, pb: isLast ? 0 : 1 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.4 }}>
                      {text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                      {format(date, 'dd/MM/yyyy')} às {format(date, 'HH:mm:ss')}
                    </Typography>
                    {elapsedToNext !== null && (
                      <Tooltip title="Tempo até o próximo evento">
                        <Typography variant="caption" sx={{ color: '#90a4ae', display: 'block', mt: 0.2 }}>
                          ⏱ {formatElapsed(elapsedToNext)} até o próximo evento
                        </Typography>
                      </Tooltip>
                    )}
                  </Box>

                  {/* Index badge */}
                  <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0, pt: 0.5 }}>
                    #{index + 1}
                  </Typography>
                </Box>
                {!isLast && <Divider sx={{ ml: 7 }} />}
              </Box>
            );
          })
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid #e0e0e0', px: 3, py: 1.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
          {sorted.length > 0 && (
            <>Início: {format(parseISO(sorted[0].createdAt), 'dd/MM/yyyy HH:mm')}</>
          )}
        </Typography>
        <Button onClick={handleClose} variant="contained" size="small">Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShowTicketLogModal;
