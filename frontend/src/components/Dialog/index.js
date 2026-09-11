import React, { useState, useEffect } from 'react';
import CoreDialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';

function Dialog ({ title, open: modalOpen, onClose, children, maxWidth, fullWidth }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setOpen(modalOpen)
    }, [modalOpen])

    const handleClose = () => {
        setOpen(false);
        onClose()
    };

    return (
        <>
            <CoreDialog
                open={open}
                onClose={handleClose}
                maxWidth={maxWidth}
                fullWidth={fullWidth}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                {title && (
                    <DialogTitle id="alert-dialog-title">
                        {title}
                    </DialogTitle>
                )}
                {children}
            </CoreDialog>
        </>
    );
}

export default Dialog;