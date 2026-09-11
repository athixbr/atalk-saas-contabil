import React, { useState, useEffect } from "react";

import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";

import GroupAddIcon from "@material-ui/icons/GroupAdd";
import SpeedIcon from "@material-ui/icons/Speed";
import GroupIcon from "@material-ui/icons/Group";
import AssignmentTurnedInIcon from "@material-ui/icons/AssignmentTurnedIn";
import CancelIcon from "@material-ui/icons/Cancel";
import DateRangeIcon from "@material-ui/icons/DateRange";
import PersonIcon from "@material-ui/icons/Person";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import FilterListIcon from "@material-ui/icons/FilterList";
import DashboardIcon from "@material-ui/icons/Dashboard";

import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";
import { Card, CardContent } from "@mui/material";
import { isArray, isEmpty } from "lodash";
import moment from "moment";

import CardCounter from "../../components/Dashboard/CardCounter";
import ButtonWithSpinner from "../../components/ButtonWithSpinner";
import { ChartsDate } from "./ChartsDate";
import { ChartsQueue } from "./ChartsQueue";
import { ChartsUser } from "./ChartsUser";

import useDashboard from "../../hooks/useDashboard";
import useCompanies from "../../hooks/useCompanies";
import api from "../../services/api";

const CARD_GRADIENTS = {
  pending:    "linear-gradient(135deg, #F7971E 0%, #FFD200 100%)",
  active:     "linear-gradient(135deg, #1A4783 0%, #2d7dd2 100%)",
  finished:   "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  closed:     "linear-gradient(135deg, #6a3093 0%, #a044ff 100%)",
  leads:      "linear-gradient(135deg, #f12711 0%, #f5af19 100%)",
  avgSupport: "linear-gradient(135deg, #0099f7 0%, #00d2ff 100%)",
  avgWait:    "linear-gradient(135deg, #e52d27 0%, #b31217 100%)",
  dueDate:    "linear-gradient(135deg, #373b44 0%, #4286f4 100%)",
};

const ICON_STYLE = { color: "#fff", fontSize: "26px" };

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
  sectionLabel: {
    fontWeight: 700,
    color: "#1A4783",
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "4px",
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
  filterCard: {
    borderRadius: "20px",
    boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
    background: "#fff",
    border: "1px solid #eef1f7",
  },
  chartCard: {
    borderRadius: "20px",
    boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
    height: "100%",
    border: "1px solid #eef1f7",
    transition: "box-shadow 0.2s",
    "&:hover": {
      boxShadow: "0 6px 28px rgba(0,0,0,0.11)",
    },
  },
  fullWidth: {
    width: "100%",
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
  alignRight: {
    textAlign: "right",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  divider: {
    margin: "8px 0 20px 0",
    backgroundColor: "#eef1f7",
  },
}));

const getLastDayOfMonth = (date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

const Dashboard = () => {
  const classes = useStyles();
  const [counters, setCounters] = useState({});
  const [attendants, setAttendants] = useState([]);
  const [filterType, setFilterType] = useState(1);
  const [period, setPeriod] = useState(0);
  const [companyDueDate, setCompanyDueDate] = useState();
  const [dateFrom, setDateFrom] = useState(
    moment("1", "D").format("YYYY-MM-DD")
  );
  const [dateTo, setDateTo] = useState(getLastDayOfMonth(new Date()));
  const [loading, setLoading] = useState(false);
  const [contagemEncerrados, setContagemEncerrados] = useState(null);

  const { find } = useDashboard();
  const { finding } = useCompanies();
  const companyId = localStorage.getItem("companyId");

  useEffect(() => {
    setTimeout(() => fetchData(), 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadCompanies();
    fetchChatsEncerrados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCompanies = async () => {
    try {
      await finding(companyId);
      const date = localStorage.getItem("companyDueDate");
      setCompanyDueDate(date);
    } catch (_) {}
  };

  const fetchChatsEncerrados = async () => {
    try {
      const params = { initialDate: dateFrom, finalDate: dateTo };
      const { data } = await api.get("/dashboard/atendimentos-encerrados", { params });
      setContagemEncerrados(data);
    } catch (_) {}
  };

  async function fetchData() {
    setLoading(true);
    let params = {};

    if (period > 0) params = { days: period };

    if (!isEmpty(dateFrom) && moment(dateFrom).isValid())
      params = { ...params, date_from: moment(dateFrom).format("YYYY-MM-DD") };

    if (!isEmpty(dateTo) && moment(dateTo).isValid())
      params = { ...params, date_to: moment(dateTo).format("YYYY-MM-DD") };

    if (Object.keys(params).length === 0) {
      toast.error("Parametrize o filtro");
      setLoading(false);
      return;
    }

    const data = await find(params);
    setCounters(data.counters);
    setAttendants(isArray(data.attendants) ? data.attendants : []);
    setLoading(false);
  }

  function handleChangePeriod(value) {
    setPeriod(value);
  }

  function handleChangeFilterType(value) {
    setFilterType(value);
    if (value === 1) setPeriod(0);
    else { setDateFrom(""); setDateTo(""); }
  }

  async function handleFilterButtonClick() {
    await fetchData();
    await fetchChatsEncerrados();
  }

  function formatTime(minutes) {
    return moment().startOf("day").add(minutes, "minutes").format("HH[h] mm[m]");
  }

  function renderFilters() {
    if (filterType === 1) {
      return (
        <>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Data Inicial"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={classes.fullWidth}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Data Final"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={classes.fullWidth}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </>
      );
    }
    return (
      <Grid item xs={12} sm={6} md={4}>
        <FormControl className={classes.selectContainer}>
          <InputLabel id="period-selector-label">Período</InputLabel>
          <Select
            labelId="period-selector-label"
            value={period}
            onChange={(e) => handleChangePeriod(e.target.value)}
          >
            <MenuItem value={0}>Nenhum selecionado</MenuItem>
            <MenuItem value={3}>Últimos 3 dias</MenuItem>
            <MenuItem value={7}>Últimos 7 dias</MenuItem>
            <MenuItem value={15}>Últimos 15 dias</MenuItem>
            <MenuItem value={30}>Últimos 30 dias</MenuItem>
            <MenuItem value={60}>Últimos 60 dias</MenuItem>
            <MenuItem value={90}>Últimos 90 dias</MenuItem>
          </Select>
          <FormHelperText>Selecione o período desejado</FormHelperText>
        </FormControl>
      </Grid>
    );
  }

  return (
    <div className={classes.mainContainer}>
      <Grid container spacing={3}>

        {/* Cabeçalho */}
        <Grid item xs={12}>
          <div className={classes.pageHeader}>
            <div className={classes.pageHeaderIcon}>
              <DashboardIcon style={{ color: "#fff", fontSize: "32px" }} />
            </div>
            <div>
              <Typography style={{ fontSize: "22px", fontWeight: 700, lineHeight: 1.2 }}>
                Dashboard
              </Typography>
              <Typography style={{ fontSize: "13px", opacity: 0.82, marginTop: "2px" }}>
                Visão geral dos atendimentos
              </Typography>
            </div>
          </div>
        </Grid>

        {/* KPIs — Linha 1 */}
        <Grid item xs={12} sm={6} md={3}>
          <CardCounter
            gradient={CARD_GRADIENTS.pending}
            icon={<GroupAddIcon style={ICON_STYLE} />}
            title="Chats Pendentes"
            value={counters.supportPending}
            loading={loading}
            to="/tickets?tab=pending"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CardCounter
            gradient={CARD_GRADIENTS.active}
            icon={<GroupIcon style={ICON_STYLE} />}
            title="Chats Ativos"
            value={counters.supportHappening}
            loading={loading}
            to="/tickets?tab=open"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CardCounter
            gradient={CARD_GRADIENTS.finished}
            icon={<AssignmentTurnedInIcon style={ICON_STYLE} />}
            title="Chats Concluídos"
            value={counters.supportFinished}
            loading={loading}
            to="/tickets?tab=closed"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CardCounter
            gradient={CARD_GRADIENTS.closed}
            icon={<CancelIcon style={ICON_STYLE} />}
            title="Chats Encerrados"
            value={contagemEncerrados}
            loading={loading}
            to="/reports/tickets/logs"
          />
        </Grid>

        {/* KPIs — Linha 2 */}
        <Grid item xs={12} sm={6} md={3}>
          <CardCounter
            gradient={CARD_GRADIENTS.leads}
            icon={<PersonIcon style={ICON_STYLE} />}
            title="Leads"
            value={counters.leads}
            loading={loading}
            to="/crm"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CardCounter
            gradient={CARD_GRADIENTS.avgSupport}
            icon={<SpeedIcon style={ICON_STYLE} />}
            title="T.M. de Atendimento"
            value={formatTime(counters.avgSupportTime)}
            loading={loading}
            to="/reports/tickets/time-analysis"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CardCounter
            gradient={CARD_GRADIENTS.avgWait}
            icon={<AccessTimeIcon style={ICON_STYLE} />}
            title="T.M. de Espera"
            value={formatTime(counters.avgWaitTime)}
            loading={loading}
            to="/reports/tickets/time-analysis"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CardCounter
            gradient={CARD_GRADIENTS.dueDate}
            icon={<DateRangeIcon style={ICON_STYLE} />}
            title="Data Vencimento"
            value={companyDueDate}
            loading={loading}
          />
        </Grid>

        {/* Filtros */}
        <Grid item xs={12}>
          <Card className={classes.filterCard}>
            <CardContent>
              <Typography className={classes.sectionTitle}>
                <FilterListIcon style={{ fontSize: "20px", color: "#1A4783" }} />
                Filtros de Período
              </Typography>
              <Divider className={classes.divider} />
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={4} md={4}>
                  <FormControl className={classes.selectContainer}>
                    <InputLabel id="filter-type-label">Tipo de Filtro</InputLabel>
                    <Select
                      labelId="filter-type-label"
                      value={filterType}
                      onChange={(e) => handleChangeFilterType(e.target.value)}
                    >
                      <MenuItem value={1}>Filtro por Data</MenuItem>
                      <MenuItem value={2}>Filtro por Período</MenuItem>
                    </Select>
                    <FormHelperText>Selecione o tipo de filtro</FormHelperText>
                  </FormControl>
                </Grid>

                {renderFilters()}

                <Grid item xs={12} sm={2} md={2} className={classes.alignRight}>
                  <ButtonWithSpinner
                    loading={loading}
                    onClick={handleFilterButtonClick}
                    style={{
                      background: "linear-gradient(135deg, #1A4783 0%, #2d7dd2 100%)",
                      color: "white",
                      borderRadius: "10px",
                      padding: "8px 24px",
                      fontWeight: 600,
                      boxShadow: "0 4px 12px rgba(26,71,131,0.3)",
                    }}
                  >
                    Filtrar
                  </ButtonWithSpinner>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráficos */}
        <Grid item xs={12} sm={12} md={6}>
          <Card className={classes.chartCard}>
            <CardContent>
              <Typography className={classes.sectionTitle}>
                Atendimentos por Fila
              </Typography>
              <Divider className={classes.divider} />
              <ChartsQueue />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={12} md={6}>
          <Card className={classes.chartCard}>
            <CardContent>
              <Typography className={classes.sectionTitle}>
                Atendimentos por Usuário
              </Typography>
              <Divider className={classes.divider} />
              <ChartsUser />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card className={classes.chartCard}>
            <CardContent>
              <Typography className={classes.sectionTitle}>
                Evolução dos Atendimentos
              </Typography>
              <Divider className={classes.divider} />
              <ChartsDate />
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </div>
  );
};

export default Dashboard;
