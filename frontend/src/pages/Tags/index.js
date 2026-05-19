import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
} from "react";
import { toast } from "react-toastify";

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
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import VisibilityIcon from "@material-ui/icons/Visibility";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import TagModal from "../../components/TagModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { Chip, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, ListItemAvatar, Avatar, Tooltip, Box, Typography, Divider } from "@material-ui/core";
import { socketConnection } from "../../services/socket";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useHistory } from "react-router-dom";
import { Doughnut } from "react-chartjs-2";
import "chart.js/auto";

const reducer = (state, action) => {
  if (action.type === "LOAD_TAGS") {
    const tags = action.payload;
    const newTags = [];

    tags.forEach((tag) => {
      const tagIndex = state.findIndex((s) => s.id === tag.id);
      if (tagIndex !== -1) {
        state[tagIndex] = tag;
      } else {
        newTags.push(tag);
      }
    });

    return [...state, ...newTags];
  }

  if (action.type === "UPDATE_TAGS") {
    const tag = action.payload;
    const tagIndex = state.findIndex((s) => s.id === tag.id);

    if (tagIndex !== -1) {
      state[tagIndex] = tag;
      return [...state];
    } else {
      return [tag, ...state];
    }
  }

  if (action.type === "DELETE_TAG") {
    const tagId = action.payload;

    const tagIndex = state.findIndex((s) => s.id == tagId);
    if (tagIndex !== -1) {
      state.splice(tagIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  tableRow: {
    cursor: "pointer",
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  tagChip: {
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    "&:hover": {
      transform: "scale(1.05)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    },
  },
  statsCard: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: 8,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  actionButton: {
    transition: "transform 0.2s",
    "&:hover": {
      transform: "scale(1.1)",
    },
  },
}));

const Tags = () => {
  const classes = useStyles();

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [deletingTag, setDeletingTag] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [tags, dispatch] = useReducer(reducer, []);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [ticketsModalOpen, setTicketsModalOpen] = useState(false);
  const [selectedTagTickets, setSelectedTagTickets] = useState(null);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketsList, setTicketsList] = useState([]);
  const [contactsTotal, setContactsTotal] = useState(0);
  const history = useHistory();

  const fetchTags = async () => {

    try {
      setLoading(true);
      const { data } = await api.get("/tags/", {
        params: { searchParam, offset: tags?.length, kanban: 0 },
      });
      dispatch({ type: "LOAD_TAGS", payload: data.tags });      
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  useEffect(() => {
    fetchTags();   
    const fetchContactsTotal = async () => {
      try {
        const { data } = await api.get("/contacts", {
          params: { pageNumber: 1 }
        });
        setContactsTotal(data.count || 0);
      } catch (err) {
        toastError(err);
      }
    };

    fetchContactsTotal();
  }, [searchParam]);


  useEffect(() => {
    const socket = socketConnection({ companyId: user.companyId });

    socket.on("user", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_TAGS", payload: data.tag });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_TAGS", payload: data.tagId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleOpenTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(true);
  };

  const handleCloseTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(false);
  };

  const handleSearch = (event) => {
    dispatch({ type: "RESET" });
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditTag = (tag) => {
    setSelectedTag(tag);
    setTagModalOpen(true);
  };

  const handleViewTickets = async (tag) => {
    setSelectedTagTickets(tag);
    setTicketsModalOpen(true);
    setLoadingTickets(true);
    
    try {
      // Buscar contatos com essa tag
      const { data } = await api.get("/contacts", {
        params: {
          searchParam: "",
          pageNumber: 1,
          tags: [tag.id],
        },
      });
      
      // Se encontrou contatos, buscar tickets desses contatos
      if (data.contacts && data.contacts.length > 0) {
        // Em vez de buscar por contactIds, chamar /tickets com status=search e filtro por tags
        const tagsParam = JSON.stringify([tag.id]);
        const ticketsResponse = await api.get("/tickets", {
          params: {
            status: "search",
            tags: tagsParam,
            pageNumber: 1,
            showAll: true,
          },
        });

        // Os tickets retornados já incluem o contato (include). Mapear contato localmente para consistência
        const ticketsWithContactInfo = ticketsResponse.data.tickets.map(ticket => ({
          ...ticket,
          contactInfo: ticket.contact || data.contacts.find(c => c.id === ticket.contactId)
        }));

        setTicketsList(ticketsWithContactInfo || []);
      } else {
        setTicketsList([]);
      }
    } catch (err) {
      toastError(err);
      setTicketsList([]);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleCloseTicketsModal = () => {
    setTicketsModalOpen(false);
    setSelectedTagTickets(null);
    setTicketsList([]);
  };

  const handleOpenTicket = (ticketId) => {
    history.push(`/tickets/${ticketId}`);
    handleCloseTicketsModal();
  };

  const handleDeleteTag = async (tagId) => {
    try {
      await api.delete(`/tags/${tagId}`);
      toast.success(i18n.t("tags.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingTag(null);
    setSearchParam("");

    dispatch({ type: "RESET" });
    await fetchTags();
  };

  const loadMore = async () => {
    await fetchTags()
  };

  const handleScroll = async (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      await loadMore();
    }
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={deletingTag && `${i18n.t("tags.confirmationModal.deleteTitle")}`}
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteTag(deletingTag.id)}
      >
        {i18n.t("tags.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <TagModal
        open={tagModalOpen}
        onClose={handleCloseTagModal}
        reload={fetchTags}
        aria-labelledby="form-dialog-title"
        tagId={selectedTag && selectedTag.id}
        kanban={0}
      />
      <MainHeader>
        <Title>{i18n.t("tags.title")} ({tags.length})</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
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
            variant="contained"
            color="primary"
            onClick={handleOpenTagModal}
          >
            {i18n.t("tags.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      {/* Cards de Estatísticas */}
      <Grid container spacing={2} style={{ padding: 16 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statsCard}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" style={{ fontWeight: 700, color: "#1976d2" }}>
                    {tags.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total de Tags
                  </Typography>
                </Box>
                <LocalOfferIcon style={{ fontSize: 48, color: "#1976d2", opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.statsCard}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" style={{ fontWeight: 700, color: "#4caf50" }}>
                    {contactsTotal}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total de Contatos
                  </Typography>
                </Box>
                <Box style={{ width: 72, height: 72 }}>
                  <Doughnut
                    data={{
                      labels: ["Com Tag", "Sem Tag"],
                      datasets: [
                        {
                          data: [
                            Math.max(0, tags.reduce((sum, tag) => sum + Number(tag.contactsCount || 0), 0)),
                            Math.max(0, Number(contactsTotal) - tags.reduce((sum, tag) => sum + Number(tag.contactsCount || 0), 0)),
                          ],
                          backgroundColor: ["#4caf50", "#e0e0e0"],
                          hoverBackgroundColor: ["#66bb6a", "#bdbdbd"],
                        },
                      ],
                    }}
                    options={{
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                    }}
                    style={{ width: 72, height: 72 }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">{i18n.t("tags.table.name")}</TableCell>
              <TableCell align="center">
                {i18n.t("tags.table.contacts")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("tags.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {tags.map((tag) => (
                <TableRow key={tag.id} hover className={classes.tableRow}>
                  <TableCell align="center">
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                      <LocalOfferIcon style={{ color: tag.color, fontSize: 20 }} />
                      <Chip
                        variant="outlined"
                        className={classes.tagChip}
                        style={{
                          backgroundColor: tag.color,
                          textShadow: "1px 1px 1px #000",
                          color: "white",
                        }}
                        label={tag.name}
                        size="small"
                        onClick={() => handleViewTickets(tag)}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Clique na tag para ver os tickets">
                      <span>{tag.contactsCount}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver Tickets">
                      <IconButton 
                        size="small" 
                        className={classes.actionButton}
                        onClick={() => handleViewTickets(tag)}
                        style={{ color: tag.color }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton 
                        size="small" 
                        className={classes.actionButton}
                        onClick={() => handleEditTag(tag)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        className={classes.actionButton}
                        onClick={(e) => {
                          setConfirmModalOpen(true);
                          setDeletingTag(tag);
                        }}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={4} />}
            </>
          </TableBody>
        </Table>
      </Paper>

      {/* Modal de Tickets */}
      <Dialog
        open={ticketsModalOpen}
        onClose={handleCloseTicketsModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <LocalOfferIcon style={{ color: selectedTagTickets?.color, fontSize: 28 }} />
              <Typography variant="h6">
                Tag: {selectedTagTickets?.name}
              </Typography>
            </Box>
            <Chip
              label={`${ticketsList.length} ${ticketsList.length === 1 ? 'ticket' : 'tickets'}`}
              style={{
                backgroundColor: selectedTagTickets?.color,
                color: "white",
                fontWeight: 600,
              }}
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {loadingTickets ? (
            <Box display="flex" justifyContent="center" padding={3}>
              <Typography>Carregando tickets...</Typography>
            </Box>
          ) : ticketsList.length === 0 ? (
            <Box display="flex" flexDirection="column" alignItems="center" padding={3}>
              <LocalOfferIcon style={{ fontSize: 60, color: "#ccc", marginBottom: 16 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Nenhum ticket ativo encontrado
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Os contatos com esta tag não possuem tickets abertos ou pendentes no momento.
              </Typography>
            </Box>
          ) : (
            <List>
              {ticketsList.map((ticket, index) => (
                <React.Fragment key={ticket.id}>
                  <ListItem 
                    button 
                    onClick={() => handleOpenTicket(ticket.id)}
                    style={{
                      borderLeft: `4px solid ${selectedTagTickets?.color}`,
                      marginBottom: 8,
                      backgroundColor: index % 2 === 0 ? "#f5f5f5" : "white",
                      borderRadius: 4,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        src={ticket.contact?.urlPicture || ticket.contact?.profilePicUrl}
                        style={{ border: `2px solid ${selectedTagTickets?.color}` }}
                      >
                        {ticket.contact?.name?.charAt(0) || "?"}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                              {ticket.contact?.name || "Sem nome"}
                            </Typography>
                            {ticket.contact?.number && (
                              <Typography variant="caption" color="textSecondary">
                                {ticket.contact.number}
                              </Typography>
                            )}
                          </Box>
                          <Chip
                            label={ticket.status === "open" ? "Aberto" : ticket.status === "pending" ? "Pendente" : "Fechado"}
                            size="small"
                            style={{
                              backgroundColor: 
                                ticket.status === "open" ? "#4caf50" : 
                                ticket.status === "pending" ? "#ff9800" : 
                                "#9e9e9e",
                              color: "white",
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Ticket #{ticket.id} • {ticket.queue?.name || "Sem fila"} 
                            {ticket.user?.name && ` • ${ticket.user.name}`}
                          </Typography>
                          {ticket.lastMessage && (
                            <Typography 
                              variant="body2" 
                              style={{ 
                                marginTop: 4,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {ticket.lastMessage}
                            </Typography>
                          )}
                          {ticket.updatedAt && (
                            <Typography variant="caption" color="textSecondary" style={{ marginTop: 4, display: "block" }}>
                              Atualizado: {new Date(ticket.updatedAt).toLocaleString("pt-BR")}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTicketsModal} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </MainContainer>
  );
};

export default Tags;