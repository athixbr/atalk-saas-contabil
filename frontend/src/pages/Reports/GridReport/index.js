import React, { useState, useEffect, useContext } from "react";

import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Button from "@material-ui/core/Button";
import Pagination from "@material-ui/lab/Pagination";
import * as XLSX from 'xlsx';

import api from "../../../services/api";
import TableRowSkeleton from "../../../components/TableRowSkeleton";

import { i18n } from "../../../translate/i18n";
import toastError from "../../../errors/toastError";
import { AuthContext } from "../../../context/Auth/AuthContext";

import {
    CircularProgress,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Tooltip,
    Typography
} from "@material-ui/core";
import { Card, CardContent, Chip, Divider } from "@mui/material";
import { UsersFilter } from "../../../components/UsersFilter";
import { WhatsappsFilter } from "../../../components/WhatsappsFilter";
import { StatusFilter } from "../../../components/StatusFilter";
import useDashboard from "../../../hooks/useDashboard";
import { TagsFilter } from '../../../components/TagsFilter';
import QueueSelect from "../../../components/QueueSelect";
import ButtonWithSpinner from "../../../components/ButtonWithSpinner";
import moment from "moment";

import { Forward, Assessment, FilterList, TableChart, Clear, SaveAlt } from "@material-ui/icons";
import Autocomplete, { createFilterOptions } from "@material-ui/lab/Autocomplete";

const STATUS_COLORS = { open: '#00bcd4', pending: '#ff9800', closed: '#4caf50', group: '#9c27b0' };
const STATUS_LABELS = { open: 'Em atendimento', pending: 'Aguardando', closed: 'Encerrado', group: 'Grupo' };

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(3),
    width: "100%",
    boxSizing: "border-box",
    overflowY: "auto",
    overflowX: "hidden",
    ...theme.scrollbarStyles,
  },
  pageHeader: {
    background: "linear-gradient(135deg, #1A4783 0%, #2d7dd2 100%)",
    borderRadius: "20px",
    padding: "24px 28px",
    color: "#fff",
    marginBottom: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 4px 24px rgba(26,71,131,0.25)",
  },
  pageHeaderIcon: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: "14px",
    padding: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontWeight: 700,
    color: "#1A4783",
    fontSize: "1.1rem",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  countChip: {
    marginLeft: "auto",
    fontWeight: 700,
  },
  card: {
    borderRadius: "20px",
    boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
    background: "#fff",
    border: "1px solid #eef1f7",
  },
  divider: {
    margin: "8px 0 20px 0",
    backgroundColor: "#eef1f7",
  },
  fullWidth: {
    width: "100%",
  },
  actionsRow: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "12px",
    marginTop: theme.spacing(2),
  },
  filterButton: {
    background: "linear-gradient(135deg, #1A4783 0%, #2d7dd2 100%)",
    color: "white",
    borderRadius: "10px",
    padding: "8px 24px",
    fontWeight: 600,
    boxShadow: "0 4px 12px rgba(26,71,131,0.3)",
  },
  tableHeadCell: {
    fontWeight: 700,
    color: "#1A4783",
    whiteSpace: "nowrap",
  },
  tableWrapper: {
    maxHeight: "58vh",
    ...theme.scrollbarStylesSoftBig,
  },
  paginationFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  emptyState: {
    padding: theme.spacing(6),
    textAlign: "center",
  },
}));

const GridReport = () => {
  const classes = useStyles();
  const history = useHistory();
  const { getReport } = useDashboard();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchParam, setSearchParam] = useState("");
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [selectedWhatsapp, setSelectedWhatsapp] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);

  const [tagIds, setTagIds] = useState([]);
  const [queueIds, setQueueIds] = useState([]);
  const [userIds, setUserIds] = useState([]);
  const [options, setOptions] = useState([]);
  const [dateFrom, setDateFrom] = useState(moment("1", "D").format("YYYY-MM-DD"));
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
  const [totalTickets, setTotalTickets] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("contacts", {
            params: { searchParam },
          });
          setOptions(data.contacts);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam]);

  const handleSelectedTags = (selecteds) => {
    const tags = selecteds.map((t) => t.id);
    setTagIds(tags);
  };

  const exportarGridParaExcel = async () => {
    setExporting(true);

    try {
      const data = await getReport({
        searchParam,
        contactId: selectedContactId,
        whatsappId: JSON.stringify(selectedWhatsapp),
        tags: JSON.stringify(tagIds),
        users: JSON.stringify(userIds),
        queueIds: JSON.stringify(queueIds),
        status: JSON.stringify(selectedStatus),
        dateFrom,
        dateTo,
        page: 1,
        pageSize: 9999999,
      });

      const ticketsData = data.tickets.map(ticket => {
        return {
          id: ticket.id,
          Conexão: ticket.whatsappName,
          Contato: ticket.contactName,
          Usuário: ticket.userName,
          Fila: ticket.queueName,
          Status: ticket.status,
          ÚltimaMensagem: ticket.lastMessage,
          DataHoraAbertura: ticket.createdAt,
          DataHoraFechamento: ticket.closedAt === null ? "" : ticket.closedAt,
          TempoDeAtendimento: ticket.supportTime,
          nps: ticket.NPS,
        }
      });

      const ws = XLSX.utils.json_to_sheet(ticketsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'RelatorioDeAtendimentos');
      XLSX.writeFile(wb, 'relatorio-de-atendimentos.xlsx');
    } catch (error) {
      toastError(error);
    } finally {
      setExporting(false);
    }
  };


  const handleFilter = async (page) => {
    setLoading(true);

    try {
      const data = await getReport({
        searchParam,
        contactId: selectedContactId,
        whatsappId: JSON.stringify(selectedWhatsapp),
        tags: JSON.stringify(tagIds),
        users: JSON.stringify(userIds),
        queueIds: JSON.stringify(queueIds),
        status: JSON.stringify(selectedStatus),
        dateFrom,
        dateTo,
        page,
        pageSize,
      });

      setTotalTickets(data.totalTickets.total);
      setTickets(data.tickets);
      setPageNumber(page);
      setHasSearched(true);
    } catch (error) {
      toastError(error);
    } finally {
      setLoading(false);
    }
  }

  const handleClearFilters = () => {
    setSearchParam("");
    setSelectedContactId(null);
    setSelectedWhatsapp([]);
    setSelectedStatus([]);
    setTagIds([]);
    setQueueIds([]);
    setUserIds([]);
    setDateFrom(moment("1", "D").format("YYYY-MM-DD"));
    setDateTo(moment().format("YYYY-MM-DD"));
    setResetKey((k) => k + 1);
  };

  const handleSelectedUsers = (selecteds) => {
    const users = selecteds.map((t) => t.id);
    setUserIds(users);
  };

  const handleSelectedWhatsapps = (selecteds) => {
    const whatsapp = selecteds.map((t) => t.id);
    setSelectedWhatsapp(whatsapp);
  };

  const handleSelectedStatus = (selecteds) => {
    const statusFilter = selecteds.map((t) => t.status);

    setSelectedStatus(statusFilter);
  };

  const renderOption = (option) => {
    if (option.number) {
      return <>
        <Typography component="span" style={{ fontSize: 14, marginLeft: "10px", display: "inline-flex", alignItems: "center", lineHeight: "2" }}>
          {option.name} - {option.number}
        </Typography>
      </>
    } else {
      return `${i18n.t("newTicketModal.add")} ${option.name}`;
    }
  };

  const handleSelectOption = (e, newValue) => {
    if (!newValue) {
      setSelectedContactId(null);
      return;
    }
    setSelectedContactId(newValue.id);
    setSearchParam("");
  };

  const renderOptionLabel = option => {
    if (option.number) {
      return `${option.name} - ${option.number}`;
    } else {
      return `${option.name}`;
    }
  };
  const filter = createFilterOptions({
    trim: true,
  });

  const createAddContactOption = (filterOptions, params) => {
    const filtered = filter(filterOptions, params);
    if (params.inputValue !== "" && !loading && searchParam.length >= 3) {
      filtered.push({
        name: `${params.inputValue}`,
      });
    }
    return filtered;
  };

  return (
    <div className={classes.mainContainer}>
      <Grid container spacing={3}>

        {/* Cabeçalho */}
        <Grid item xs={12}>
          <div className={classes.pageHeader}>
            <div className={classes.pageHeaderIcon}>
              <Assessment style={{ color: "#fff", fontSize: "32px" }} />
            </div>
            <div>
              <Typography style={{ fontSize: "22px", fontWeight: 700, lineHeight: 1.2 }}>
                {i18n.t("reportsGrid.title")}
              </Typography>
              <Typography style={{ fontSize: "13px", opacity: 0.82, marginTop: "2px" }}>
                Consulte, filtre e exporte o histórico de atendimentos
              </Typography>
            </div>
          </div>
        </Grid>

        {/* Filtros */}
        <Grid item xs={12}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.sectionTitle}>
                <FilterList style={{ fontSize: "20px", color: "#1A4783" }} />
                Filtros de Busca
              </Typography>
              <Divider className={classes.divider} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Autocomplete
                    fullWidth
                    options={options}
                    loading={loading}
                    clearOnBlur
                    autoHighlight
                    freeSolo
                    size="small"
                    clearOnEscape
                    getOptionLabel={renderOptionLabel}
                    renderOption={renderOption}
                    filterOptions={createAddContactOption}
                    onChange={(e, newValue) => handleSelectOption(e, newValue)}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label={i18n.t("newTicketModal.fieldLabel")}
                        variant="outlined"
                        size="small"
                        onChange={e => setSearchParam(e.target.value)}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <React.Fragment>
                              {loading ? (
                                <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </React.Fragment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Data Inicial"
                    type="date"
                    value={dateFrom}
                    variant="outlined"
                    fullWidth
                    size="small"
                    onChange={(e) => setDateFrom(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Data Final"
                    type="date"
                    value={dateTo}
                    variant="outlined"
                    fullWidth
                    size="small"
                    onChange={(e) => setDateTo(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatusFilter key={`status-${resetKey}`} onFiltered={handleSelectedStatus} />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <WhatsappsFilter key={`wa-${resetKey}`} onFiltered={handleSelectedWhatsapps} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <UsersFilter key={`user-${resetKey}`} onFiltered={handleSelectedUsers} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <QueueSelect
                    key={`queue-${resetKey}`}
                    selectedQueueIds={queueIds}
                    onChange={values => setQueueIds(values)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TagsFilter key={`tags-${resetKey}`} onFiltered={handleSelectedTags} />
                </Grid>
              </Grid>

              <div className={classes.actionsRow}>
                <Button
                  startIcon={<Clear />}
                  onClick={handleClearFilters}
                >
                  Limpar Filtros
                </Button>
                <ButtonWithSpinner
                  variant="outlined"
                  color="primary"
                  startIcon={<SaveAlt />}
                  loading={exporting}
                  onClick={exportarGridParaExcel}
                >
                  Exportar Excel
                </ButtonWithSpinner>
                <ButtonWithSpinner
                  loading={loading}
                  onClick={() => handleFilter(1)}
                  className={classes.filterButton}
                >
                  {i18n.t("reportsGrid.buttons.filter")}
                </ButtonWithSpinner>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Resultados */}
        <Grid item xs={12}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.sectionTitle}>
                <TableChart style={{ fontSize: "20px", color: "#1A4783" }} />
                Resultados
                {hasSearched && (
                  <Chip
                    size="small"
                    label={`${totalTickets} atendimento${totalTickets === 1 ? "" : "s"}`}
                    className={classes.countChip}
                    sx={{ backgroundColor: "#eef1f7", color: "#1A4783", fontWeight: 700 }}
                  />
                )}
              </Typography>
              <Divider className={classes.divider} />

              {!hasSearched ? (
                <div className={classes.emptyState}>
                  <Typography color="textSecondary">
                    Selecione os filtros desejados e clique em "{i18n.t("reportsGrid.buttons.filter")}" para visualizar os atendimentos.
                  </Typography>
                </div>
              ) : (
                <>
                  <TableContainer className={classes.tableWrapper}>
                    <Table size="small" id="grid-attendants" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell align="center" className={classes.tableHeadCell}>{i18n.t("reportsGrid.table.id")}</TableCell>
                          <TableCell align="left" className={classes.tableHeadCell}>{i18n.t("reportsGrid.table.whatsapp")}</TableCell>
                          <TableCell align="left" className={classes.tableHeadCell}>{i18n.t("reportsGrid.table.contact")}</TableCell>
                          <TableCell align="left" className={classes.tableHeadCell}>{i18n.t("reportsGrid.table.user")}</TableCell>
                          <TableCell align="left" className={classes.tableHeadCell}>{i18n.t("reportsGrid.table.queue")}</TableCell>
                          <TableCell align="center" className={classes.tableHeadCell}>{i18n.t("reportsGrid.table.status")}</TableCell>
                          <TableCell align="left" className={classes.tableHeadCell}>{i18n.t("reportsGrid.table.lastMessage")}</TableCell>
                          <TableCell align="center" className={classes.tableHeadCell}>{i18n.t("reportsGrid.table.dateOpen")}</TableCell>
                          <TableCell align="center" className={classes.tableHeadCell}>{i18n.t("reportsGrid.table.dateClose")}</TableCell>
                          <TableCell align="center" className={classes.tableHeadCell}>{i18n.t("reportsGrid.table.supportTime")}</TableCell>
                          <TableCell align="center" className={classes.tableHeadCell}>{i18n.t("reportsGrid.table.NPS")}</TableCell>
                          <TableCell align="center" className={classes.tableHeadCell}>{i18n.t("reportsGrid.table.actions")}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tickets.length === 0 && !loading && (
                          <TableRow>
                            <TableCell colSpan={12} align="center" className={classes.emptyState}>
                              <Typography color="textSecondary">
                                Nenhum atendimento encontrado para os filtros informados.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                        {tickets.map((ticket) => (
                          <TableRow key={ticket.id} hover>
                            <TableCell align="center">{ticket.id}</TableCell>
                            <TableCell align="left">{ticket?.whatsappName}</TableCell>
                            <TableCell align="left">{ticket?.contactName}</TableCell>
                            <TableCell align="left">{ticket?.userName || "—"}</TableCell>
                            <TableCell align="left">{ticket?.queueName || "—"}</TableCell>
                            <TableCell align="center">
                              <Chip
                                size="small"
                                label={STATUS_LABELS[ticket?.status] || ticket?.status}
                                sx={{
                                  backgroundColor: STATUS_COLORS[ticket?.status] || "#607d8b",
                                  color: "#fff",
                                  fontWeight: 600,
                                  fontSize: 11,
                                }}
                              />
                            </TableCell>
                            <TableCell align="left">{ticket?.lastMessage}</TableCell>
                            <TableCell align="center">{ticket?.createdAt}</TableCell>
                            <TableCell align="center">{ticket?.closedAt}</TableCell>
                            <TableCell align="center">{ticket?.supportTime}</TableCell>
                            <TableCell align="center">{ticket?.NPS}</TableCell>
                            <TableCell align="center">
                              <Tooltip title="Acessar Ticket">
                                <IconButton
                                  size="small"
                                  onClick={() => { history.push(`/tickets/${ticket.uuid}`) }}
                                >
                                  <Forward fontSize="small" style={{ color: "#1A4783" }} />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                        {loading && <TableRowSkeleton avatar columns={3} />}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <div className={classes.paginationFooter}>
                    <Pagination
                      count={Math.ceil(totalTickets / pageSize) || 1}
                      page={pageNumber}
                      onChange={(event, value) => handleFilter(value)}
                    />

                    <FormControl
                      margin="dense"
                      variant="outlined"
                      size="small"
                      style={{ minWidth: 160 }}
                    >
                      <InputLabel>
                        {i18n.t("tickets.search.ticketsPerPage")}
                      </InputLabel>
                      <Select
                        labelId="dialog-select-prompt-label"
                        id="dialog-select-prompt"
                        name="pageSize"
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(e.target.value);
                        }}
                        label={i18n.t("tickets.search.ticketsPerPage")}
                      >
                        <MenuItem value={5}>{"5"}</MenuItem>
                        <MenuItem value={10}>{"10"}</MenuItem>
                        <MenuItem value={20}>{"20"}</MenuItem>
                        <MenuItem value={50}>{"50"}</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </div>
  );
};

export default GridReport;
