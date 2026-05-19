import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  Checkbox,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  makeStyles,
} from "@material-ui/core";
import {
  CheckCircle as CheckCircleIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
} from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    minWidth: "800px",
    maxWidth: "900px",
  },
  clienteInfo: {
    backgroundColor: "#f5f5f5",
    padding: theme.spacing(2),
    borderRadius: 12,
    marginBottom: theme.spacing(3),
  },
  clienteNome: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#333",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  clienteDetalhes: {
    fontSize: "14px",
    color: "#666",
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(2),
  },
  categorySection: {
    marginBottom: theme.spacing(3),
  },
  categoryTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#333",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "bold",
  },
  federalIcon: {
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
  },
  estadualIcon: {
    backgroundColor: "#f3e5f5",
    color: "#7b1fa2",
  },
  municipalIcon: {
    backgroundColor: "#fff3e0",
    color: "#f57c00",
  },
  certidaoCard: {
    border: "2px solid #e0e0e0",
    borderRadius: 12,
    transition: "all 0.2s",
    cursor: "pointer",
    "&:hover": {
      borderColor: "#065183",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
  },
  certidaoCardSelected: {
    border: "2px solid #065183",
    backgroundColor: "#f0f7ff",
  },
  certidaoNome: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#333",
    marginBottom: theme.spacing(0.5),
  },
  certidaoDescricao: {
    fontSize: "12px",
    color: "#666",
  },
  selectedCount: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#065183",
    marginTop: theme.spacing(2),
  },
  actions: {
    padding: theme.spacing(2, 3),
    justifyContent: "space-between",
  },
}));

const CERTIDOES_DISPONIVEIS = {
  federal: [
    { id: "receita_federal", nome: "Receita Federal", descricao: "Certidão de Regularidade Fiscal" },
    { id: "divida_ativa_uniao", nome: "Dívida Ativa da União", descricao: "PGFN" },
    { id: "trabalhista", nome: "Trabalhista", descricao: "Certidão Negativa de Débitos Trabalhistas" },
    { id: "fgts", nome: "FGTS", descricao: "Certificado de Regularidade do FGTS" },
  ],
  estadual: [
    { id: "icms_sp", nome: "ICMS - SP", descricao: "Certidão de Débitos Tributários - São Paulo" },
    { id: "icms_rj", nome: "ICMS - RJ", descricao: "Certidão de Débitos Tributários - Rio de Janeiro" },
    { id: "icms_mg", nome: "ICMS - MG", descricao: "Certidão de Débitos Tributários - Minas Gerais" },
  ],
  municipal: [
    { id: "iss_sp_capital", nome: "ISS - SP Capital", descricao: "Certidão de Tributos Mobiliários" },
    { id: "iss_rj_capital", nome: "ISS - RJ Capital", descricao: "Certidão de Tributos Municipais" },
    { id: "iss_bh", nome: "ISS - BH", descricao: "Certidão de Tributos Municipais - Belo Horizonte" },
  ],
};

const GerenciarCertidoesModal = ({ open, cliente, onClose, onSave }) => {
  const classes = useStyles();
  const [certidoesSelecionadas, setCertidoesSelecionadas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cliente && cliente.certidoesSelecionadas) {
      setCertidoesSelecionadas(cliente.certidoesSelecionadas);
    } else {
      setCertidoesSelecionadas([]);
    }
  }, [cliente]);

  const handleToggleCertidao = (certidaoId) => {
    setCertidoesSelecionadas((prev) => {
      if (prev.includes(certidaoId)) {
        return prev.filter((id) => id !== certidaoId);
      } else {
        return [...prev, certidaoId];
      }
    });
  };

  const handleSalvar = async () => {
    setLoading(true);
    try {
      await onSave(cliente.id, certidoesSelecionadas);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const renderCategorySection = (tipo, titulo, icon, iconClass) => {
    const certidoes = CERTIDOES_DISPONIVEIS[tipo];

    return (
      <div className={classes.categorySection} key={tipo}>
        <div className={classes.categoryTitle}>
          <div className={`${classes.categoryIcon} ${iconClass}`}>{icon}</div>
          <span>{titulo}</span>
        </div>
        <Grid container spacing={2}>
          {certidoes.map((certidao) => {
            const isSelected = certidoesSelecionadas.includes(certidao.id);
            return (
              <Grid item xs={12} sm={6} md={4} key={certidao.id}>
                <Card
                  className={`${classes.certidaoCard} ${
                    isSelected ? classes.certidaoCardSelected : ""
                  }`}
                  onClick={() => handleToggleCertidao(certidao.id)}
                >
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isSelected}
                          color="primary"
                          onChange={() => handleToggleCertidao(certidao.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                      label={
                        <div>
                          <div className={classes.certidaoNome}>{certidao.nome}</div>
                          <div className={classes.certidaoDescricao}>
                            {certidao.descricao}
                          </div>
                        </div>
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </div>
    );
  };

  if (!cliente) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      classes={{ paper: classes.dialogPaper }}
    >
      <DialogTitle>
        <Typography variant="h6" style={{ fontWeight: 700 }}>
          Gerenciar Certidões
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {/* Informações do Cliente */}
        <div className={classes.clienteInfo}>
          <div className={classes.clienteNome}>
            {cliente.tipoCliente === "juridica" ? (
              <BusinessIcon />
            ) : (
              <PersonIcon />
            )}
            {cliente.nome}
          </div>
          <div className={classes.clienteDetalhes}>
            {cliente.cpf && <Chip label={`CPF: ${cliente.cpf}`} size="small" />}
            {cliente.cnpj && <Chip label={`CNPJ: ${cliente.cnpj}`} size="small" />}
            {cliente.email && <Chip label={cliente.email} size="small" />}
          </div>
        </div>

        <Divider style={{ marginBottom: 24 }} />

        {/* Certidões Federais */}
        {renderCategorySection("federal", "Certidões Federais", "F", classes.federalIcon)}

        {/* Certidões Estaduais */}
        {renderCategorySection("estadual", "Certidões Estaduais", "E", classes.estadualIcon)}

        {/* Certidões Municipais */}
        {renderCategorySection("municipal", "Certidões Municipais", "M", classes.municipalIcon)}

        {/* Contador */}
        <Box display="flex" justifyContent="center" alignItems="center">
          <CheckCircleIcon style={{ color: "#065183", marginRight: 8 }} />
          <Typography className={classes.selectedCount}>
            {certidoesSelecionadas.length} certidão(ões) selecionada(s)
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions className={classes.actions}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSalvar}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={<DescriptionIcon />}
        >
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GerenciarCertidoesModal;
