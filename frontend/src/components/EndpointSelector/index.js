import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
  TablePagination,
} from "@material-ui/core";
import { Search as SearchIcon } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  filtersRow: {
    display: "flex",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    flexWrap: "wrap",
  },
  searchField: {
    flex: 1,
    minWidth: 200,
    backgroundColor: "#fff",
  },
  filterField: {
    minWidth: 160,
    backgroundColor: "#fff",
  },
  tableContainer: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    maxHeight: 400,
    overflowY: "auto",
  },
  tableHead: {
    backgroundColor: "#f5f5f5",
    "& th": {
      fontWeight: 700,
      fontSize: "0.8rem",
      padding: "8px 12px",
    },
  },
  tableRow: {
    "& td": {
      padding: "6px 12px",
      fontSize: "0.82rem",
    },
    "&:hover": {
      backgroundColor: "#f0f7ff",
    },
    cursor: "pointer",
  },
  selectedRow: {
    backgroundColor: "#e3f2fd !important",
  },
  tipoBadge: {
    fontSize: "0.7rem",
    height: 22,
    fontWeight: 600,
  },
  countBadge: {
    marginLeft: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    borderRadius: 12,
    padding: "2px 10px",
    fontSize: "0.78rem",
    fontWeight: 600,
  },
  emptyMsg: {
    textAlign: "center",
    padding: theme.spacing(3),
    color: theme.palette.text.secondary,
  },
}));

const TIPO_LABELS = {
  controle: { label: "Controle", color: "#7b1fa2" },
  recorrente: { label: "Recorrente", color: "#1565c0" },
  tarefa: { label: "Tarefa", color: "#2e7d32" },
  parcelamento: { label: "Parcelamento", color: "#e65100" },
};

const EndpointSelector = ({ selectedEndpoints = [], onChange, readOnly = false }) => {
  const classes = useStyles();

  const [allEndpoints, setAllEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/endpoints-disponiveis");
        setAllEndpoints(data || []);
      } catch (err) {
        console.error("Erro ao carregar endpoints:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredEndpoints = useMemo(() => {
    let list = allEndpoints;
    if (filterTipo) list = list.filter((e) => e.tipo === filterTipo);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          (e.nome || "").toLowerCase().includes(q) ||
          (e.codigo || "").toLowerCase().includes(q) ||
          (e.departamento || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [allEndpoints, search, filterTipo]);

  const paginatedEndpoints = useMemo(
    () => filteredEndpoints.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredEndpoints, page, rowsPerPage]
  );

  const isSelected = (tipo, endpointId) =>
    selectedEndpoints.some((e) => e.tipo === tipo && e.endpointId === endpointId);

  const handleToggle = (endpoint) => {
    if (readOnly) return;
    const key = { tipo: endpoint.tipo, endpointId: endpoint.endpointId };
    const alreadySelected = isSelected(endpoint.tipo, endpoint.endpointId);
    const next = alreadySelected
      ? selectedEndpoints.filter((e) => !(e.tipo === endpoint.tipo && e.endpointId === endpoint.endpointId))
      : [...selectedEndpoints, key];
    onChange(next);
  };

  const handleSelectAll = (checked) => {
    if (readOnly) return;
    if (checked) {
      const toAdd = filteredEndpoints.filter((e) => !isSelected(e.tipo, e.endpointId));
      onChange([...selectedEndpoints, ...toAdd.map((e) => ({ tipo: e.tipo, endpointId: e.endpointId }))]);
    } else {
      const filteredKeys = new Set(filteredEndpoints.map((e) => `${e.tipo}:${e.endpointId}`));
      onChange(selectedEndpoints.filter((e) => !filteredKeys.has(`${e.tipo}:${e.endpointId}`)));
    }
  };

  const allFilteredSelected =
    filteredEndpoints.length > 0 && filteredEndpoints.every((e) => isSelected(e.tipo, e.endpointId));
  const someFilteredSelected =
    !allFilteredSelected && filteredEndpoints.some((e) => isSelected(e.tipo, e.endpointId));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="subtitle1" style={{ fontWeight: 700 }}>
          Tarefas & Controles Vinculados
        </Typography>
        {selectedEndpoints.length > 0 && (
          <span className={classes.countBadge}>{selectedEndpoints.length} selecionado(s)</span>
        )}
      </Box>

      {/* Filtros */}
      <Box className={classes.filtersRow}>
        <TextField
          className={classes.searchField}
          variant="outlined"
          size="small"
          placeholder="Buscar por nome, código ou departamento..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl variant="outlined" size="small" className={classes.filterField}>
          <InputLabel>Tipo</InputLabel>
          <Select
            value={filterTipo}
            onChange={(e) => {
              setFilterTipo(e.target.value);
              setPage(0);
            }}
            label="Tipo"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="controle">Controle</MenuItem>
            <MenuItem value="recorrente">Recorrente</MenuItem>
            <MenuItem value="tarefa">Tarefa</MenuItem>
            <MenuItem value="parcelamento">Parcelamento</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Tabela */}
      <TableContainer className={classes.tableContainer} component={Paper} elevation={0}>
        <Table size="small" stickyHeader>
          <TableHead className={classes.tableHead}>
            <TableRow>
              {!readOnly && (
                <TableCell padding="checkbox" style={{ width: 48 }}>
                  <Checkbox
                    indeterminate={someFilteredSelected}
                    checked={allFilteredSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    size="small"
                  />
                </TableCell>
              )}
              <TableCell style={{ width: 110 }}>Tipo</TableCell>
              <TableCell style={{ width: 100 }}>Código</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell style={{ width: 160 }}>Departamento</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEndpoints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={readOnly ? 4 : 5} className={classes.emptyMsg}>
                  Nenhum item encontrado
                </TableCell>
              </TableRow>
            ) : (
              paginatedEndpoints.map((endpoint) => {
                const selected = isSelected(endpoint.tipo, endpoint.endpointId);
                const tipoInfo = TIPO_LABELS[endpoint.tipo] || {};
                return (
                  <TableRow
                    key={`${endpoint.tipo}:${endpoint.endpointId}`}
                    className={`${classes.tableRow} ${selected ? classes.selectedRow : ""}`}
                    onClick={() => handleToggle(endpoint)}
                  >
                    {!readOnly && (
                      <TableCell padding="checkbox">
                        <Checkbox checked={selected} size="small" />
                      </TableCell>
                    )}
                    <TableCell>
                      <Chip
                        label={tipoInfo.label || endpoint.tipo}
                        size="small"
                        className={classes.tipoBadge}
                        style={{ backgroundColor: tipoInfo.color, color: "#fff" }}
                      />
                    </TableCell>
                    <TableCell>{endpoint.codigo || "—"}</TableCell>
                    <TableCell>{endpoint.nome || "—"}</TableCell>
                    <TableCell>{endpoint.departamento || "—"}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredEndpoints.length > rowsPerPage && (
        <TablePagination
          component="div"
          count={filteredEndpoints.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
          labelRowsPerPage="Por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      )}
    </Box>
  );
};

export default EndpointSelector;
