import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Box,
  CircularProgress,
} from "@material-ui/core";
import {
  GetApp as DownloadIcon,
  Link as LinkIcon,
  Delete as DeleteIcon,
} from "@material-ui/icons";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import formatToCurrency from "../../utils/formatToCurrency";

const useStyles = makeStyles((theme) => ({
  clickableRow: {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(6),
    color: theme.palette.text.secondary,
  },
}));

const tipoOperacaoConfig = {
  entrada: { label: "Entrada", color: "#1976d2" },
  saida: { label: "Saída", color: "#388e3c" },
  indeterminado: { label: "Indeterminado", color: "#9e9e9e" },
};

const situacaoConfig = {
  autorizada: { label: "Autorizada", color: "#388e3c" },
  cancelada: { label: "Cancelada", color: "#f44336" },
  denegada: { label: "Denegada", color: "#f44336" },
};

const formatDate = (value) => {
  if (!value) return "-";
  try {
    return format(new Date(value), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "-";
  }
};

const NfeXmlTable = ({ nfeXmls, loading, onRowClick, onAssignCliente, onDownload, onDelete }) => {
  const classes = useStyles();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (nfeXmls.length === 0) {
    return (
      <div className={classes.emptyState}>
        <Typography variant="body1">Nenhum XML de NF-e importado ainda</Typography>
      </div>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Emissão</TableCell>
            <TableCell>Nº/Série</TableCell>
            <TableCell>Emitente</TableCell>
            <TableCell>Destinatário</TableCell>
            <TableCell>Cliente</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Situação</TableCell>
            <TableCell align="right">Valor total</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {nfeXmls.map((nfe) => {
            const tipo = tipoOperacaoConfig[nfe.tipoOperacao] || tipoOperacaoConfig.indeterminado;
            const situacao = situacaoConfig[nfe.situacao] || situacaoConfig.autorizada;

            return (
              <TableRow
                key={nfe.id}
                hover
                className={classes.clickableRow}
                onClick={() => onRowClick(nfe.id)}
              >
                <TableCell>{formatDate(nfe.dataEmissao)}</TableCell>
                <TableCell>
                  {nfe.numeroNF || "-"}
                  {nfe.serie ? ` / ${nfe.serie}` : ""}
                </TableCell>
                <TableCell>{nfe.emitRazaoSocial || nfe.emitNomeFantasia || "-"}</TableCell>
                <TableCell>{nfe.destRazaoSocial || "-"}</TableCell>
                <TableCell>
                  {nfe.cliente ? (
                    nfe.cliente.nomeFantasia || nfe.cliente.razaoSocial
                  ) : (
                    <Chip
                      size="small"
                      label="Sem cliente vinculado"
                      onClick={(event) => {
                        event.stopPropagation();
                        onAssignCliente(nfe);
                      }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Chip size="small" label={tipo.label} style={{ backgroundColor: tipo.color, color: "#fff" }} />
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={situacao.label}
                    style={{ backgroundColor: situacao.color, color: "#fff" }}
                  />
                </TableCell>
                <TableCell align="right">{formatToCurrency(nfe.valorTotalNota || 0)}</TableCell>
                <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                  <Tooltip title="Vincular cliente">
                    <IconButton size="small" onClick={() => onAssignCliente(nfe)}>
                      <LinkIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Baixar XML">
                    <IconButton size="small" onClick={() => onDownload(nfe)}>
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton size="small" onClick={() => onDelete(nfe)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default NfeXmlTable;
