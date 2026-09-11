import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Divider,
} from "@material-ui/core";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "react-toastify";
import api from "../../services/api";
import formatToCurrency from "../../utils/formatToCurrency";

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    minWidth: "900px",
    maxWidth: "95vw",
  },
  sectionTitle: {
    fontWeight: 700,
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  label: {
    color: theme.palette.text.secondary,
    fontSize: "0.75rem",
  },
  value: {
    fontWeight: 500,
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(6),
  },
}));

const formatDateTime = (value) => {
  if (!value) return "-";
  try {
    return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return "-";
  }
};

const Field = ({ label, value, classes }) => (
  <Grid item xs={12} sm={6} md={4}>
    <Typography className={classes.label}>{label}</Typography>
    <Typography className={classes.value}>{value ?? "-"}</Typography>
  </Grid>
);

const NfeXmlDetailModal = ({ open, onClose, nfeXmlId }) => {
  const classes = useStyles();
  const [nfeXml, setNfeXml] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && nfeXmlId) {
      loadNfeXml();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, nfeXmlId]);

  const loadNfeXml = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/nfe-xml/${nfeXmlId}`);
      setNfeXml(data);
    } catch (error) {
      console.error("Erro ao carregar XML de NF-e:", error);
      toast.error("Erro ao carregar detalhes da NF-e");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth classes={{ paper: classes.dialogPaper }}>
      <DialogTitle>
        <Typography variant="h6" style={{ fontWeight: 700 }}>
          NF-e {nfeXml?.numeroNF ? `nº ${nfeXml.numeroNF}` : ""}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {loading || !nfeXml ? (
          <div className={classes.loadingContainer}>
            <CircularProgress />
          </div>
        ) : (
          <>
            <Typography className={classes.sectionTitle}>Identificação</Typography>
            <Grid container spacing={2}>
              <Field label="Chave de acesso" value={nfeXml.chaveAcesso} classes={classes} />
              <Field label="Natureza da operação" value={nfeXml.naturezaOperacao} classes={classes} />
              <Field label="Data de emissão" value={formatDateTime(nfeXml.dataEmissao)} classes={classes} />
              <Field label="Protocolo de autorização" value={nfeXml.protocoloAutorizacao} classes={classes} />
              <Field
                label="Cliente vinculado"
                value={nfeXml.cliente?.nomeFantasia || nfeXml.cliente?.razaoSocial || "Sem cliente vinculado"}
                classes={classes}
              />
              {nfeXml.situacao === "cancelada" && (
                <>
                  <Field label="Cancelada em" value={formatDateTime(nfeXml.dataCancelamento)} classes={classes} />
                  <Field label="Motivo do cancelamento" value={nfeXml.motivoCancelamento} classes={classes} />
                </>
              )}
            </Grid>

            <Divider style={{ margin: "16px 0" }} />

            <Typography className={classes.sectionTitle}>Emitente</Typography>
            <Grid container spacing={2}>
              <Field label="Razão social" value={nfeXml.emitRazaoSocial} classes={classes} />
              <Field label="Nome fantasia" value={nfeXml.emitNomeFantasia} classes={classes} />
              <Field label="CNPJ" value={nfeXml.emitCnpj} classes={classes} />
              <Field label="Inscrição estadual" value={nfeXml.emitInscricaoEstadual} classes={classes} />
            </Grid>

            <Divider style={{ margin: "16px 0" }} />

            <Typography className={classes.sectionTitle}>Destinatário</Typography>
            <Grid container spacing={2}>
              <Field label="Razão social" value={nfeXml.destRazaoSocial} classes={classes} />
              <Field label="CNPJ/CPF" value={nfeXml.destCnpjCpf} classes={classes} />
              <Field label="Inscrição estadual" value={nfeXml.destInscricaoEstadual} classes={classes} />
            </Grid>

            <Divider style={{ margin: "16px 0" }} />

            <Typography className={classes.sectionTitle}>Totais</Typography>
            <Grid container spacing={2}>
              <Field label="Valor dos produtos" value={formatToCurrency(nfeXml.valorTotalProdutos || 0)} classes={classes} />
              <Field label="Desconto" value={formatToCurrency(nfeXml.valorTotalDesconto || 0)} classes={classes} />
              <Field label="Frete" value={formatToCurrency(nfeXml.valorTotalFrete || 0)} classes={classes} />
              <Field label="Base de cálculo ICMS" value={formatToCurrency(nfeXml.valorBaseCalculoICMS || 0)} classes={classes} />
              <Field label="ICMS" value={formatToCurrency(nfeXml.valorICMS || 0)} classes={classes} />
              <Field label="IPI" value={formatToCurrency(nfeXml.valorTotalIPI || 0)} classes={classes} />
              <Field label="PIS" value={formatToCurrency(nfeXml.valorTotalPIS || 0)} classes={classes} />
              <Field label="COFINS" value={formatToCurrency(nfeXml.valorTotalCOFINS || 0)} classes={classes} />
              <Field label="Valor total da nota" value={formatToCurrency(nfeXml.valorTotalNota || 0)} classes={classes} />
            </Grid>

            <Divider style={{ margin: "16px 0" }} />

            <Typography className={classes.sectionTitle}>Itens ({nfeXml.itens?.length || 0})</Typography>
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Código</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell>NCM</TableCell>
                    <TableCell>CFOP</TableCell>
                    <TableCell align="right">Qtd.</TableCell>
                    <TableCell align="right">Vlr. unit.</TableCell>
                    <TableCell align="right">Vlr. total</TableCell>
                    <TableCell align="right">ICMS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(nfeXml.itens || []).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.codigoProduto}</TableCell>
                      <TableCell>{item.descricao}</TableCell>
                      <TableCell>{item.ncm}</TableCell>
                      <TableCell>{item.cfop}</TableCell>
                      <TableCell align="right">{item.quantidadeComercial}</TableCell>
                      <TableCell align="right">{formatToCurrency(item.valorUnitarioComercial || 0)}</TableCell>
                      <TableCell align="right">{formatToCurrency(item.valorTotalProduto || 0)}</TableCell>
                      <TableCell align="right">{formatToCurrency(item.valorICMS || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Box display="flex" justifyContent="flex-end" width="100%" px={1}>
          <Button onClick={onClose}>Fechar</Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default NfeXmlDetailModal;
