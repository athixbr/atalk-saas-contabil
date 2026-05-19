import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Box, Alert, AlertTitle } from '@mui/material';
import { Warning, PersonOutline, QueueMusic, AccessTime } from '@mui/icons-material';
import { i18n } from '../../translate/i18n';

const ShowTicketOpen = ({ isOpen, handleClose, user, queue, onTransfer }) => {
  
  const handleTransferClick = () => {
    if (onTransfer) {
      onTransfer();
    }
    handleClose();
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '12px',
          padding: '8px'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        color: '#ff9800',
        fontWeight: 'bold'
      }}>
        <Warning sx={{ fontSize: 32 }} />
        {i18n.t("showTicketOpenModal.title.header")}
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle sx={{ fontWeight: 'bold' }}>{i18n.t("showTicketOpenModal.form.message")}</AlertTitle>
        </Alert>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <PersonOutline sx={{ color: '#1976d2', fontSize: 28 }} />
            <Box>
              <DialogContentText sx={{ fontSize: '0.75rem', color: '#666', mb: 0.5 }}>
                {i18n.t("showTicketOpenModal.form.user")}
              </DialogContentText>
              <DialogContentText sx={{ fontSize: '1rem', fontWeight: 'bold', color: '#000' }}>
                {user}
              </DialogContentText>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <QueueMusic sx={{ color: '#9c27b0', fontSize: 28 }} />
            <Box>
              <DialogContentText sx={{ fontSize: '0.75rem', color: '#666', mb: 0.5 }}>
                {i18n.t("showTicketOpenModal.form.queue")}
              </DialogContentText>
              <DialogContentText sx={{ fontSize: '1rem', fontWeight: 'bold', color: '#000' }}>
                {queue}
              </DialogContentText>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.5, backgroundColor: '#fff3e0', borderRadius: '8px', border: '1px solid #ffb74d' }}>
            <AccessTime sx={{ color: '#ff9800', fontSize: 24, mt: 0.5 }} />
            <DialogContentText sx={{ fontSize: '0.875rem', color: '#333', lineHeight: 1.6 }}>
              {i18n.t("showTicketOpenModal.form.instructions")}
            </DialogContentText>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ padding: '16px 24px', gap: 1 }}>
        <Button 
          onClick={handleClose} 
          color="primary" 
          variant="outlined"
          sx={{ minWidth: '140px' }}
        >
          {i18n.t("showTicketOpenModal.buttons.wait")}
        </Button>
        {onTransfer && (
          <Button 
            onClick={handleTransferClick} 
            color="secondary" 
            variant="contained"
            sx={{ minWidth: '180px', fontWeight: 'bold' }}
          >
            {i18n.t("showTicketOpenModal.buttons.requestTransfer")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ShowTicketOpen;
