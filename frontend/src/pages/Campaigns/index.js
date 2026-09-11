/* eslint-disable no-unused-vars */

import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";

import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import Chip from "@material-ui/core/Chip";
import AddIcon from "@material-ui/icons/Add";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import DescriptionIcon from "@material-ui/icons/Description";
import TimerOffIcon from "@material-ui/icons/TimerOff";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import PauseCircleOutlineIcon from "@material-ui/icons/PauseCircleOutline";
import CampaignIcon from "@material-ui/icons/Send";

import MainHeader from "../../components/MainHeader";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import CampaignModal from "../../components/CampaignModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { Grid } from "@material-ui/core";
import { isArray } from "lodash";
import { useDate } from "../../hooks/useDate";
import { socketConnection } from "../../services/socket";
import usePlans from "../../hooks/usePlans";
import { AuthContext } from "../../context/Auth/AuthContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_CAMPAIGNS") {
    const campaigns = action.payload;
    const newCampaigns = [];

    if (isArray(campaigns)) {
      campaigns.forEach((campaign) => {
        const campaignIndex = state.findIndex((u) => u.id === campaign.id);
        if (campaignIndex !== -1) {
          state[campaignIndex] = campaign;
        } else {
          newCampaigns.push(campaign);
        }
      });
    }

    return [...state, ...newCampaigns];
  }

  if (action.type === "UPDATE_CAMPAIGNS") {
    const campaign = action.payload;
    const campaignIndex = state.findIndex((u) => u.id === campaign.id);

    if (campaignIndex !== -1) {
      state[campaignIndex] = campaign;
      return [...state];
    } else {
      return [campaign, ...state];
    }
  }

  if (action.type === "DELETE_CAMPAIGN") {
    const campaignId = action.payload;

    const campaignIndex = state.findIndex((u) => u.id === campaignId);
    if (campaignIndex !== -1) {
      state.splice(campaignIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const STATUS_GRADIENTS = {
  INATIVA: "linear-gradient(135deg, #757f9a 0%, #9aa5b8 100%)",
  PROGRAMADA: "linear-gradient(135deg, #F7971E 0%, #FFD200 100%)",
  EM_ANDAMENTO: "linear-gradient(135deg, #1A4783 0%, #2d7dd2 100%)",
  CANCELADA: "linear-gradient(135deg, #e52d27 0%, #b31217 100%)",
  FINALIZADA: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
};

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(3),
    width: "100%",
    boxSizing: "border-box",
  },
  mainPaper: {
    flex: 1,
    padding: theme.padding,
    overflowY: "auto",
    overflowX: "auto",
    width: "100%",
    boxSizing: "border-box",
    ...theme.scrollbarStyles,
    borderRadius: "20px",
    border: "1px solid #eef1f7",
    boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
  },
  pageHeader: {
    background: "linear-gradient(135deg, #1A4783 0%, #2d7dd2 100%)",
    borderRadius: "20px",
    padding: "20px 28px",
    color: "#fff",
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
  filterRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    flexWrap: "wrap",
  },
  searchField: {
    minWidth: "220px",
    backgroundColor: theme.palette.type === "light" ? "#fff" : undefined,
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
    },
  },
  addButton: {
    borderRadius: "10px",
    fontWeight: 600,
    padding: "9px 20px",
    boxShadow: "0 4px 12px rgba(26,71,131,0.3)",
  },
  tableHeadCell: {
    fontWeight: 700,
    color: "#1A4783",
    borderBottom: "2px solid #eef1f7",
  },
  statusChip: {
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.7rem",
    height: "24px",
  },
  actionsCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "2px",
  },
}));

const Campaigns = () => {
  const classes = useStyles();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [deletingCampaign, setDeletingCampaign] = useState(null);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [campaigns, dispatch] = useReducer(reducer, []);
  const { user } = useContext(AuthContext);

  const { datetimeToClient } = useDate();
  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useCampaigns) {
        toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
        setTimeout(() => {          
          history.push(`/`)
        }, 1000);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchCampaigns();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = user.companyId;
    const socket = socketConnection({ companyId, userId: user.id });

    socket.on(`company-${companyId}-campaign`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CAMPAIGNS", payload: data.record });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_CAMPAIGN", payload: +data.id });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data } = await api.get("/campaigns/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CAMPAIGNS", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenCampaignModal = () => {
    setSelectedCampaign(null);
    setCampaignModalOpen(true);
  };

  const handleCloseCampaignModal = () => {
    setSelectedCampaign(null);
    setCampaignModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setCampaignModalOpen(true);
  };

  const handleDeleteCampaign = async (campaignId) => {
    try {
      await api.delete(`/campaigns/${campaignId}`);
      toast.success(i18n.t("campaigns.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingCampaign(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const formatStatus = (val) => {
    switch (val) {
      case "INATIVA":
        return "Inativa";
      case "PROGRAMADA":
        return "Programada";
      case "EM_ANDAMENTO":
        return "Em Andamento";
      case "CANCELADA":
        return "Cancelada";
      case "FINALIZADA":
        return "Finalizada";
      default:
        return val;
    }
  };

  const cancelCampaign = async (campaign) => {
    try {
      await api.post(`/campaigns/${campaign.id}/cancel`);
      toast.success(i18n.t("campaigns.toasts.cancel"));
      setPageNumber(1);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const restartCampaign = async (campaign) => {
    try {
      await api.post(`/campaigns/${campaign.id}/restart`);
      toast.success(i18n.t("campaigns.toasts.restart"));
      setPageNumber(1);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className={classes.mainContainer}>
      <ConfirmationModal
        title={
          deletingCampaign &&
          `${i18n.t("campaigns.confirmationModal.deleteTitle")} ${deletingCampaign.name}?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteCampaign(deletingCampaign.id)}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <CampaignModal
        resetPagination={() => {
          setPageNumber(1);
          fetchCampaigns();
        }}
        open={campaignModalOpen}
        onClose={handleCloseCampaignModal}
        aria-labelledby="form-dialog-title"
        campaignId={selectedCampaign && selectedCampaign.id}
      />
      <MainHeader>
        <Grid style={{ width: "99.6%" }} container>
          <Grid xs={12} item>
            <div className={classes.pageHeader}>
              <div className={classes.pageHeaderIcon}>
                <CampaignIcon style={{ color: "#fff", fontSize: "28px" }} />
              </div>
              <div>
                <Typography style={{ fontSize: "20px", fontWeight: 700, lineHeight: 1.2 }}>
                  {i18n.t("campaigns.title")}
                </Typography>
                <Typography style={{ fontSize: "13px", opacity: 0.82, marginTop: "2px" }}>
                  Crie e acompanhe disparos em massa para seus contatos
                </Typography>
              </div>
            </div>
            <div className={classes.filterRow}>
              <TextField
                className={classes.searchField}
                placeholder={i18n.t("campaigns.searchPlaceholder")}
                type="search"
                variant="outlined"
                size="small"
                value={searchParam}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon style={{ color: "gray" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                className={classes.addButton}
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCampaignModal}
                color="primary"
              >
                {i18n.t("campaigns.buttons.add")}
              </Button>
            </div>
          </Grid>
        </Grid>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell className={classes.tableHeadCell} align="center">
                {i18n.t("campaigns.table.name")}
              </TableCell>
              <TableCell className={classes.tableHeadCell} align="center">
                {i18n.t("campaigns.table.status")}
              </TableCell>
              <TableCell className={classes.tableHeadCell} align="center">
                {i18n.t("campaigns.table.contactList")}
              </TableCell>
              <TableCell className={classes.tableHeadCell} align="center">
                {i18n.t("campaigns.table.whatsapp")}
              </TableCell>
              <TableCell className={classes.tableHeadCell} align="center">
                {i18n.t("campaigns.table.scheduledAt")}
              </TableCell>
              <TableCell className={classes.tableHeadCell} align="center">
                {i18n.t("campaigns.table.completedAt")}
              </TableCell>
              <TableCell className={classes.tableHeadCell} align="center">
                {i18n.t("campaigns.table.confirmation")}
              </TableCell>
              <TableCell className={classes.tableHeadCell} align="center">
                {i18n.t("campaigns.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell align="center">{campaign.name}</TableCell>
                  <TableCell align="center">
                    <Chip
                      className={classes.statusChip}
                      style={{
                        background:
                          STATUS_GRADIENTS[campaign.status] ||
                          STATUS_GRADIENTS.INATIVA,
                      }}
                      label={formatStatus(campaign.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {campaign.contactListId
                      ? campaign.contactList.name
                      : "Não definida"}
                  </TableCell>
                  <TableCell align="center">
                    {campaign.whatsappId
                      ? campaign.whatsapp.name
                      : "Não definido"}
                  </TableCell>
                  <TableCell align="center">
                    {campaign.scheduledAt
                      ? datetimeToClient(campaign.scheduledAt)
                      : "Sem agendamento"}
                  </TableCell>
                  <TableCell align="center">
                    {campaign.completedAt
                      ? datetimeToClient(campaign.completedAt)
                      : "Não concluída"}
                  </TableCell>
                  <TableCell align="center">
                    {campaign.confirmation ? "Habilitada" : "Desabilitada"}
                  </TableCell>
                  <TableCell align="center">
                    <div className={classes.actionsCell}>
                      {campaign.status === "EM_ANDAMENTO" && (
                        <Tooltip title="Parar Campanha">
                          <IconButton
                            onClick={() => cancelCampaign(campaign)}
                            size="small"
                          >
                            <PauseCircleOutlineIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {campaign.status === "CANCELADA" && (
                        <Tooltip title="Reiniciar Campanha">
                          <IconButton
                            onClick={() => restartCampaign(campaign)}
                            size="small"
                          >
                            <PlayCircleOutlineIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Relatório">
                        <IconButton
                          onClick={() =>
                            history.push(`/campaign/${campaign.id}/report`)
                          }
                          size="small"
                        >
                          <DescriptionIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleEditCampaign(campaign)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setConfirmModalOpen(true);
                            setDeletingCampaign(campaign);
                          }}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={8} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </div>
  );
};

export default Campaigns;
