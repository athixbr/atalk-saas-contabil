import React, { useState, useEffect, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  MenuItem,
  TablePagination,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { CloudUpload as UploadIcon } from "@material-ui/icons";
import { toast } from "react-toastify";
import api from "../../services/api";
import MainContainer from "../../components/MainContainer";
import ConfirmationModal from "../../components/ConfirmationModal";
import NfeXmlTable from "./NfeXmlTable";
import NfeXmlUploadDialog from "./NfeXmlUploadDialog";
import NfeXmlDetailModal from "./NfeXmlDetailModal";
import NfeXmlClienteAssignDialog from "./NfeXmlClienteAssignDialog";

const useStyles = makeStyles((theme) => ({
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  filtersPaper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  tablePaper: {
    flex: 1,
    overflowY: "auto",
  },
}));

const SEM_CLIENTE_OPTION = { id: "null", nomeFantasia: "Sem cliente vinculado" };
const ROWS_PER_PAGE = 50;

const XmlNfe = () => {
  const classes = useStyles();

  const [nfeXmls, setNfeXmls] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const [clientes, setClientes] = useState([]);
  const [clienteFiltro, setClienteFiltro] = useState(null);
  const [tipoOperacao, setTipoOperacao] = useState("");
  const [situacao, setSituacao] = useState("");
  const [search, setSearch] = useState("");

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [detailModalId, setDetailModalId] = useState(null);
  const [assignDialogNfe, setAssignDialogNfe] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadClientes = useCallback(async () => {
    try {
      const { data } = await api.get("/clientes", { params: { limit: 999999 } });
      setClientes(data.clientes || []);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    }
  }, []);

  const loadNfeXmls = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/nfe-xml", {
        params: {
          clienteId: clienteFiltro?.id,
          tipoOperacao: tipoOperacao || undefined,
          situacao: situacao || undefined,
          search: search || undefined,
          page: page + 1,
          limit: ROWS_PER_PAGE,
        },
      });
      setNfeXmls(data.nfeXmls || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Erro ao carregar XMLs de NF-e:", error);
      toast.error("Erro ao carregar XMLs de NF-e");
    } finally {
      setLoading(false);
    }
  }, [clienteFiltro, tipoOperacao, situacao, search, page]);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  useEffect(() => {
    loadNfeXmls();
  }, [loadNfeXmls]);

  const handleDownload = async (nfe) => {
    try {
      const response = await api.get(`/nfe-xml/${nfe.id}/download`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", nfe.xmlOriginalNome || `${nfe.chaveAcesso}.xml`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar XML:", error);
      toast.error("Erro ao baixar o XML");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/nfe-xml/${deleteTarget.id}`);
      toast.success("XML de NF-e removido com sucesso!");
      loadNfeXmls();
    } catch (error) {
      console.error("Erro ao remover XML de NF-e:", error);
      toast.error("Erro ao remover o XML de NF-e");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <MainContainer>
      <div className={classes.header}>
        <Typography variant="h5">XML NF-e</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<UploadIcon />}
          onClick={() => setUploadDialogOpen(true)}
        >
          Importar XML
        </Button>
      </div>

      <Paper className={classes.filtersPaper}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              options={[SEM_CLIENTE_OPTION, ...clientes]}
              getOptionLabel={(option) => option.nomeFantasia || option.razaoSocial || ""}
              value={clienteFiltro}
              onChange={(event, newValue) => {
                setPage(0);
                setClienteFiltro(newValue);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Cliente" variant="outlined" size="small" />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              label="Tipo"
              variant="outlined"
              size="small"
              fullWidth
              value={tipoOperacao}
              onChange={(event) => {
                setPage(0);
                setTipoOperacao(event.target.value);
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="entrada">Entrada</MenuItem>
              <MenuItem value="saida">Saída</MenuItem>
              <MenuItem value="indeterminado">Indeterminado</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              label="Situação"
              variant="outlined"
              size="small"
              fullWidth
              value={situacao}
              onChange={(event) => {
                setPage(0);
                setSituacao(event.target.value);
              }}
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="autorizada">Autorizada</MenuItem>
              <MenuItem value="cancelada">Cancelada</MenuItem>
              <MenuItem value="denegada">Denegada</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={5}>
            <TextField
              label="Buscar por número, chave ou razão social"
              variant="outlined"
              size="small"
              fullWidth
              value={search}
              onChange={(event) => {
                setPage(0);
                setSearch(event.target.value);
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper className={classes.tablePaper}>
        <NfeXmlTable
          nfeXmls={nfeXmls}
          loading={loading}
          onRowClick={setDetailModalId}
          onAssignCliente={setAssignDialogNfe}
          onDownload={handleDownload}
          onDelete={setDeleteTarget}
        />
        <TablePagination
          component="div"
          count={total}
          page={page}
          onChangePage={(event, newPage) => setPage(newPage)}
          rowsPerPage={ROWS_PER_PAGE}
          rowsPerPageOptions={[ROWS_PER_PAGE]}
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      </Paper>

      <NfeXmlUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUploaded={loadNfeXmls}
      />

      <NfeXmlDetailModal
        open={!!detailModalId}
        onClose={() => setDetailModalId(null)}
        nfeXmlId={detailModalId}
      />

      <NfeXmlClienteAssignDialog
        open={!!assignDialogNfe}
        onClose={() => setAssignDialogNfe(null)}
        nfeXml={assignDialogNfe}
        onAssigned={loadNfeXmls}
      />

      <ConfirmationModal
        title="Remover XML de NF-e"
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      >
        Tem certeza que deseja remover o XML da NF-e{" "}
        <strong>{deleteTarget?.numeroNF || deleteTarget?.chaveAcesso}</strong>? Esta ação não
        pode ser desfeita.
      </ConfirmationModal>
    </MainContainer>
  );
};

export default XmlNfe;
