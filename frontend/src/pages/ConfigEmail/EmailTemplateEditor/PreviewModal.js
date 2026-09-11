import React from "react";
import { Dialog, DialogTitle, DialogContent, Box } from "@material-ui/core";
import { applyMockVariables } from "./variables";

const PreviewModal = ({ open, onClose, html, variableGroups }) => {
  const finalHtml = applyMockVariables(html, variableGroups);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Visualizar E-mail</DialogTitle>
      <DialogContent>
        <Box display="flex" justifyContent="center" bgcolor="#f0f0f0" p={2}>
          <iframe
            title="Preview do e-mail"
            srcDoc={finalHtml}
            style={{
              width: 600,
              maxWidth: "100%",
              height: "70vh",
              border: "1px solid #ddd",
              background: "#fff",
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;
