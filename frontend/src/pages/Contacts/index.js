import React, {
    useState,
    useEffect,
    useReducer,
    useContext,
    useRef,
} from "react";
import { socketConnection } from "../../services/socket";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import Chip from "@material-ui/core/Chip";
import Tooltip from "@material-ui/core/Tooltip";
import { Facebook, Instagram, WhatsApp } from "@material-ui/icons";
import SearchIcon from "@material-ui/icons/Search";
import GetAppIcon from "@material-ui/icons/GetApp";
import PictureAsPdfIcon from "@material-ui/icons/PictureAsPdf";
import PersonIcon from "@material-ui/icons/Person";
import { CSVLink } from "react-csv";

import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";
import BlockIcon from "@material-ui/icons/Block";

import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactModal from "../../components/ContactModal";
import ConfirmationModal from "../../components/ConfirmationModal/";

import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import toastError from "../../errors/toastError";

import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";
import NewTicketModal from "../../components/NewTicketModal";
import { TagsFilter } from "../../components/TagsFilter";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import formatSerializedId from '../../utils/formatSerializedId';

import {
    ArrowDropDown,
    Backup,
    ContactPhone,
} from "@material-ui/icons";
import { Menu, MenuItem, Box, Typography, Select, FormControl, InputLabel } from "@material-ui/core";

import ContactImportWpModal from "../../components/ContactImportWpModal";
import useCompanySettings from "../../hooks/useSettings/companySettings";

const reducer = (state, action) => {
    if (action.type === "LOAD_CONTACTS") {
        return action.payload;
    }

    if (action.type === "UPDATE_CONTACTS") {
        const contact = action.payload;
        const contactIndex = state.findIndex((c) => c.id === contact.id);

        if (contactIndex !== -1) {
            state[contactIndex] = contact;
            return [...state];
        } else {
            return [contact, ...state];
        }
    }

    if (action.type === "DELETE_CONTACT") {
        const contactId = action.payload;
        const contactIndex = state.findIndex((c) => c.id === contactId);
        if (contactIndex !== -1) {
            state.splice(contactIndex, 1);
        }
        return [...state];
    }

    if (action.type === "RESET") {
        return [];
    }
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
        padding: theme.spacing(1),
        overflowY: "auto",
        overflowX: "auto",
        width: "100%",
        boxSizing: "border-box",
        ...theme.scrollbarStyles,
    },
    filterBar: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: theme.spacing(1),
        padding: theme.spacing(1, 0),
        marginBottom: theme.spacing(0.5),
    },
    searchField: {
        minWidth: 220,
        flex: 1,
    },
    filterSelect: {
        minWidth: 120,
    },
    exportGroup: {
        display: "flex",
        gap: theme.spacing(0.5),
        alignItems: "center",
    },
    tagChip: {
        margin: "2px",
        height: 20,
        fontSize: "0.7rem",
    },
    ticketBadge: {
        display: "flex",
        gap: 4,
        justifyContent: "center",
        flexWrap: "wrap",
    },
    countLabel: {
        fontSize: "0.8rem",
        color: theme.palette.text.secondary,
        marginLeft: theme.spacing(1),
    },
    lastAgent: {
        display: "flex",
        alignItems: "center",
        gap: 4,
        justifyContent: "center",
        fontSize: "0.8rem",
    },
    dateCell: {
        fontSize: "0.78rem",
        whiteSpace: "nowrap",
    },
    headerActions: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: theme.spacing(1),
        width: "100%",
    },
    sectionDivider: {
        width: "100%",
        borderBottom: `1px solid ${theme.palette.divider}`,
        margin: theme.spacing(0.5, 0),
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: "50%",
        display: "inline-block",
        marginRight: 4,
    },
    tableHead: {
        "& th": {
            backgroundColor: theme.palette.type === "dark"
                ? theme.palette.grey[800]
                : theme.palette.grey[100],
            fontWeight: 600,
            fontSize: "0.78rem",
            color: theme.palette.text.primary,
            borderBottom: `2px solid ${theme.palette.divider}`,
            whiteSpace: "nowrap",
        },
    },
    tableRow: {
        "&:hover": {
            backgroundColor: theme.palette.type === "dark"
                ? "rgba(255,255,255,0.04)"
                : "rgba(0,0,0,0.03)",
        },
    },
    lidBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        padding: "1px 6px",
        borderRadius: 10,
        backgroundColor: theme.palette.type === "dark"
            ? "rgba(37,211,102,0.12)"
            : "rgba(37,211,102,0.08)",
        border: `1px solid rgba(37,211,102,0.3)`,
        fontSize: "0.68rem",
        color: theme.palette.text.secondary,
        whiteSpace: "nowrap",
    },
    unavailableBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        padding: "1px 6px",
        borderRadius: 10,
        backgroundColor: theme.palette.type === "dark"
            ? "rgba(158,158,158,0.12)"
            : "rgba(158,158,158,0.08)",
        border: `1px solid rgba(158,158,158,0.3)`,
        fontSize: "0.68rem",
        color: theme.palette.text.secondary,
        whiteSpace: "nowrap",
    },
    actionButtons: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
    },
}));

const Contacts = () => {
    const classes = useStyles();
    const history = useHistory();

    const { user } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [searchParam, setSearchParam] = useState("");
    const [contacts, dispatch] = useReducer(reducer, []);
    const [selectedContactId, setSelectedContactId] = useState(null);
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    const [importContactModalOpen, setImportContactModalOpen] = useState(false);
    const [deletingContact, setDeletingContact] = useState(null);
    const [ImportContacts, setImportContacts] = useState(null);
    const [blockingContact, setBlockingContact] = useState(null);
    const [unBlockingContact, setUnBlockingContact] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmChatsOpen, setConfirmChatsOpen] = useState(false);
    const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
    const [contactTicket, setContactTicket] = useState({});
    const fileUploadRef = useRef(null);
    const [selectedTags, setSelectedTags] = useState([]);
    const [filterChannel, setFilterChannel] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    const { get: getSetting } = useCompanySettings();
    const [hideNum, setHideNum] = useState(false);

    useEffect(() => {
        async function fetchData() {
            const setting = await getSetting({ "column": "lgpdHideNumber" });
            if (setting.lgpdHideNumber === "enabled") {
                setHideNum(true);
            }
        }
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleImportExcel = async () => {
        try {
            const formData = new FormData();
            formData.append("file", fileUploadRef.current.files[0]);
            await api.request({
                url: `/contacts/upload`,
                method: "POST",
                data: formData,
            });
            history.go(0);
        } catch (err) {
            toastError(err);
        }
    };

    useEffect(() => {
        dispatch({ type: "RESET" });
        setPageNumber(1);
    }, [searchParam, selectedTags, filterChannel, filterStatus]);

    useEffect(() => {
        setLoading(true);
        const delayDebounceFn = setTimeout(() => {
            const fetchContacts = async () => {
                try {
                    const { data } = await api.get("/contacts/", {
                        params: {
                            searchParam,
                            pageNumber,
                            contactTag: JSON.stringify(selectedTags),
                            channel: filterChannel,
                            active: filterStatus
                        },
                    });
                    dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
                    setTotalCount(data.count);
                    setLoading(false);
                } catch (err) {
                    toastError(err);
                    setLoading(false);
                }
            };
            fetchContacts();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchParam, pageNumber, selectedTags, filterChannel, filterStatus]);

    useEffect(() => {
        const companyId = user.companyId;
        const socket = socketConnection({ companyId, userId: user.id });

        socket.on(`company-${companyId}-contact`, (data) => {
            if (data.action === "update" || data.action === "create") {
                dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
            }
            if (data.action === "delete") {
                dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
            }
        });

        return () => { socket.disconnect(); };
    }, []);

    const handleCloseOrOpenTicket = (ticket) => {
        setNewTicketModalOpen(false);
        if (ticket !== undefined && ticket.uuid !== undefined) {
            history.push(`/tickets/${ticket.uuid}`);
        }
    };

    const handleSelectedTags = (selecteds) => {
        const tags = selecteds.map((t) => t.id);
        setSelectedTags(tags);
    };

    const handleSearch = (event) => {
        setSearchParam(event.target.value);
    };

    const handleOpenContactModal = () => {
        setSelectedContactId(null);
        setContactModalOpen(true);
    };

    const handleCloseContactModal = () => {
        setSelectedContactId(null);
        setContactModalOpen(false);
    };

    const hadleEditContact = (contactId) => {
        setSelectedContactId(contactId);
        setContactModalOpen(true);
    };

    const handleDeleteContact = async (contactId) => {
        try {
            await api.delete(`/contacts/${contactId}`);
            toast.success(i18n.t("contacts.toasts.deleted"));
        } catch (err) {
            toastError(err);
        }
        setDeletingContact(null);
        setSearchParam("");
        setPageNumber(1);
    };

    const handleBlockContact = async (contactId) => {
        try {
            await api.put(`/contacts/block/${contactId}`, { active: false });
            toast.success("Contato bloqueado");
        } catch (err) {
            toastError(err);
        }
        setBlockingContact(null);
        setSearchParam("");
        setPageNumber(1);
    };

    const handleUnBlockContact = async (contactId) => {
        try {
            await api.put(`/contacts/block/${contactId}`, { active: true });
            toast.success("Contato desbloqueado");
        } catch (err) {
            toastError(err);
        }
        setUnBlockingContact(null);
        setSearchParam("");
        setPageNumber(1);
    };

    const handleimportContact = async () => {
        try {
            await api.post("/contacts/import");
            history.go(0);
            setImportContacts(false);
        } catch (err) {
            toastError(err);
            setImportContacts(false);
        }
    };

    const handleimportChats = async () => {
        try {
            await api.post("/contacts/import/chats");
            history.go(0);
        } catch (err) {
            toastError(err);
        }
    };

    // Retorna o último ticket (mais recente pelo updatedAt)
    const getLastTicket = (contact) => {
        if (!contact?.tickets?.length) return null;
        return [...contact.tickets].sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        )[0];
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        const date = new Date(dateStr);
        const pad = (n) => String(n).padStart(2, "0");
        return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const getTicketStats = (contact) => {
        if (!contact?.tickets?.length) return { open: 0, pending: 0, closed: 0 };
        return contact.tickets.reduce(
            (acc, t) => {
                if (t.status === "open") acc.open++;
                else if (t.status === "pending") acc.pending++;
                else if (t.status === "closed") acc.closed++;
                return acc;
            },
            { open: 0, pending: 0, closed: 0 }
        );
    };

    const formatNumber = (contact) => {
        if (contact.isGroup) return contact.number;
        const formatted = formatSerializedId(contact.number, contact.remoteJid);
        if (hideNum && user.profile === "user") {
            return formatted.slice(0, -6) + "**-**" + contact.number.slice(-2);
        }
        return formatted;
    };

    const prepareExportData = () => {
        return contacts.map((contact) => {
            const lastTicket = getLastTicket(contact);
            const stats = getTicketStats(contact);
            return {
                Nome: contact.name,
                Número: formatNumber(contact),
                Email: contact.email || "",
                Canal: contact.channel || "whatsapp",
                Status: contact.active ? "Ativo" : "Bloqueado",
                Tags: contact.tags?.map(t => t.name).join(", ") || "",
                "Último Atendente": lastTicket?.user?.name || "",
                "Última Interação": lastTicket ? formatDate(lastTicket.updatedAt) : "",
                "Tickets Abertos": stats.open,
                "Tickets Pendentes": stats.pending,
                "Tickets Fechados": stats.closed,
            };
        });
    };

    const handleExportPDF = () => {
        try {
            const exportData = prepareExportData();
            const printWindow = window.open('', '_blank');
            const htmlContent = `<!DOCTYPE html>
<html><head>
<title>Contatos - ${new Date().toLocaleDateString()}</title>
<style>
  body{font-family:Arial,sans-serif;margin:20px}
  h1{color:#3f51b5}
  .info{margin:10px 0;color:#666}
  table{width:100%;border-collapse:collapse;margin-top:20px}
  th,td{border:1px solid #ddd;padding:6px 8px;text-align:left;font-size:11px}
  th{background-color:#3f51b5;color:#fff}
  tr:nth-child(even){background-color:#f5f5f5}
  @media print{button{display:none}}
</style></head>
<body>
<h1>Lista de Contatos</h1>
<div class="info"><strong>Total:</strong> ${totalCount} | <strong>Exibindo:</strong> ${contacts.length} | <strong>Data:</strong> ${new Date().toLocaleString()}</div>
<table><thead><tr>
  <th>Nome</th><th>Número</th><th>Email</th><th>Canal</th><th>Status</th>
  <th>Tags</th><th>Último Atendente</th><th>Última Interação</th>
  <th>Abertos</th><th>Pendentes</th><th>Fechados</th>
</tr></thead><tbody>
${exportData.map(c => `<tr>
  <td>${c.Nome}</td><td>${c.Número}</td><td>${c.Email}</td><td>${c.Canal}</td><td>${c.Status}</td>
  <td>${c.Tags}</td><td>${c["Último Atendente"]}</td><td>${c["Última Interação"]}</td>
  <td>${c["Tickets Abertos"]}</td><td>${c["Tickets Pendentes"]}</td><td>${c["Tickets Fechados"]}</td>
</tr>`).join('')}
</tbody></table>
<script>window.onload=function(){window.print()}</script>
</body></html>`;
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            toast.success("PDF preparado para impressão!");
        } catch (err) {
            toastError(err);
        }
    };

    const handleChangePage = (_event, newPage) => {
        setPageNumber(newPage + 1);
    };

    const getChannelIcon = (channel) => {
        if (channel === "instagram") return <Instagram style={{ color: "#C13584", fontSize: 18 }} />;
        if (channel === "facebook") return <Facebook style={{ color: "#1877F2", fontSize: 18 }} />;
        return <WhatsApp style={{ color: "#25D366", fontSize: 18 }} />;
    };

    const getChannelLabel = (channel) => {
        if (channel === "instagram") return "Instagram";
        if (channel === "facebook") return "Facebook";
        return "WhatsApp";
    };

    const renderContactNumber = (contact) => {
        const remoteJid = contact.remoteJid || "";
        const rawNumber = String(contact.number || "");
        const digitsOnly = rawNumber.replace(/\D/g, "");

        // Contato com identificador interno do WhatsApp (@lid)
        const isLid = remoteJid.includes("@lid") || digitsOnly.length > 13;

        // Número muito curto ou ausente
        const isUnavailable = !contact.number || digitsOnly.length < 8;

        if (isLid) {
            return (
                <Tooltip title="Contato importado via identificador interno do WhatsApp (não possui número telefônico visível)" arrow>
                    <span className={classes.lidBadge}>
                        <WhatsApp style={{ fontSize: 11, color: "#25D366" }} />
                        WhatsApp ID
                    </span>
                </Tooltip>
            );
        }

        if (isUnavailable) {
            return (
                <Tooltip title="Número de telefone não disponível para este contato" arrow>
                    <span className={classes.unavailableBadge}>
                        Não disponível
                    </span>
                </Tooltip>
            );
        }

        return (
            <Typography variant="body2" className={classes.dateCell}>
                {formatNumber(contact)}
            </Typography>
        );
    };

    return (
        <div className={classes.mainContainer}>
            <NewTicketModal
                modalOpen={newTicketModalOpen}
                initialContact={contactTicket}
                onClose={(ticket) => { handleCloseOrOpenTicket(ticket); }}
            />
            <ContactModal
                open={contactModalOpen}
                onClose={handleCloseContactModal}
                aria-labelledby="form-dialog-title"
                contactId={selectedContactId}
            />
            <ConfirmationModal
                title={
                    deletingContact
                        ? `${i18n.t("contacts.confirmationModal.deleteTitle")} ${deletingContact.name}?`
                        : blockingContact
                            ? `Bloquear Contato ${blockingContact.name}?`
                            : unBlockingContact
                                ? `Desbloquear Contato ${unBlockingContact.name}?`
                                : ImportContacts
                                    ? `${i18n.t("contacts.confirmationModal.importTitlte")}`
                                    : `${i18n.t("contactListItems.confirmationModal.importTitlte")}`
                }
                open={confirmOpen}
                onClose={setConfirmOpen}
                onConfirm={() =>
                    deletingContact
                        ? handleDeleteContact(deletingContact.id)
                        : blockingContact
                            ? handleBlockContact(blockingContact.id)
                            : unBlockingContact
                                ? handleUnBlockContact(unBlockingContact.id)
                                : ImportContacts
                                    ? handleimportContact()
                                    : handleImportExcel()
                }
            >
                {deletingContact
                    ? `${i18n.t("contacts.confirmationModal.deleteMessage")}`
                    : blockingContact
                        ? `${i18n.t("contacts.confirmationModal.blockContact")}`
                        : unBlockingContact
                            ? `${i18n.t("contacts.confirmationModal.unblockContact")}`
                            : ImportContacts
                                ? `${i18n.t("contacts.confirmationModal.importMessage")}`
                                : `${i18n.t("contactListItems.confirmationModal.importMessage")}`}
            </ConfirmationModal>
            <ConfirmationModal
                title={i18n.t("contacts.confirmationModal.importChat")}
                open={confirmChatsOpen}
                onClose={setConfirmChatsOpen}
                onConfirm={() => handleimportChats()}
            >
                {i18n.t("contacts.confirmationModal.wantImport")}
            </ConfirmationModal>

            <MainHeader>
                <Title>
                    {i18n.t("contacts.title")}
                    {totalCount > 0 && (
                        <span className={classes.countLabel}>
                            ({contacts.length} de {totalCount})
                        </span>
                    )}
                </Title>

                <MainHeaderButtonsWrapper>
                    {/* Linha de filtros */}
                    <Box className={classes.filterBar}>
                        {/* Busca unificada */}
                        <TextField
                            className={classes.searchField}
                            placeholder="Buscar por nome, número, e-mail..."
                            type="search"
                            value={searchParam}
                            onChange={handleSearch}
                            size="small"
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Filtro por Tags */}
                        <TagsFilter onFiltered={handleSelectedTags} />

                        {/* Filtro por Canal */}
                        <FormControl variant="outlined" size="small" className={classes.filterSelect}>
                            <InputLabel>Canal</InputLabel>
                            <Select
                                label="Canal"
                                value={filterChannel}
                                onChange={(e) => setFilterChannel(e.target.value)}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="whatsapp">
                                    <Box display="flex" alignItems="center" style={{ gap: 6 }}>
                                        <WhatsApp style={{ color: "#25D366", fontSize: 16 }} /> WhatsApp
                                    </Box>
                                </MenuItem>
                                <MenuItem value="instagram">
                                    <Box display="flex" alignItems="center" style={{ gap: 6 }}>
                                        <Instagram style={{ color: "#C13584", fontSize: 16 }} /> Instagram
                                    </Box>
                                </MenuItem>
                                <MenuItem value="facebook">
                                    <Box display="flex" alignItems="center" style={{ gap: 6 }}>
                                        <Facebook style={{ color: "#1877F2", fontSize: 16 }} /> Facebook
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>

                        {/* Filtro por Status */}
                        <FormControl variant="outlined" size="small" className={classes.filterSelect}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                label="Status"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="true">
                                    <Box display="flex" alignItems="center" style={{ gap: 6 }}>
                                        <span className={classes.statusDot} style={{ background: "#4caf50" }} /> Ativo
                                    </Box>
                                </MenuItem>
                                <MenuItem value="false">
                                    <Box display="flex" alignItems="center" style={{ gap: 6 }}>
                                        <span className={classes.statusDot} style={{ background: "#f44336" }} /> Bloqueado
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>

                        {/* Exportar */}
                        <Box className={classes.exportGroup}>
                            <Tooltip title="Exportar PDF">
                                <span>
                                    <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={handleExportPDF}
                                        disabled={contacts.length === 0}
                                    >
                                        <PictureAsPdfIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <CSVLink
                                data={prepareExportData()}
                                filename={`contatos_${new Date().toISOString().split('T')[0]}.csv`}
                                separator=";"
                                style={{ textDecoration: "none", display: "inline-flex" }}
                            >
                                <Tooltip title="Exportar CSV/Excel">
                                    <span>
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            disabled={contacts.length === 0}
                                        >
                                            <GetAppIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </CSVLink>
                        </Box>

                        {/* Importar */}
                        <PopupState variant="popover" popupId="import-menu">
                            {(popupState) => (
                                <React.Fragment>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        size="small"
                                        {...bindTrigger(popupState)}
                                        endIcon={<ArrowDropDown />}
                                    >
                                        Importar
                                    </Button>
                                    <Menu {...bindMenu(popupState)}>
                                        <MenuItem onClick={() => { setConfirmOpen(true); setImportContacts(true); popupState.close(); }}>
                                            <ContactPhone fontSize="small" color="primary" style={{ marginRight: 8 }} />
                                            {i18n.t("contacts.menu.importYourPhone")}
                                        </MenuItem>
                                        <MenuItem onClick={() => { setImportContactModalOpen(true); popupState.close(); }}>
                                            <Backup fontSize="small" color="primary" style={{ marginRight: 8 }} />
                                            {i18n.t("contacts.menu.importToExcel")}
                                        </MenuItem>
                                    </Menu>
                                </React.Fragment>
                            )}
                        </PopupState>

                        {/* Novo Contato */}
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={handleOpenContactModal}
                        >
                            {i18n.t("contacts.buttons.add")}
                        </Button>
                    </Box>
                </MainHeaderButtonsWrapper>
            </MainHeader>

            <ContactImportWpModal
                isOpen={importContactModalOpen}
                handleClose={() => setImportContactModalOpen(false)}
                selectedTags={selectedTags}
                hideNum={hideNum}
                userProfile={user.profile}
            />

            <Paper
                className={classes.mainPaper}
                variant="outlined"
            >
                <input
                    style={{ display: "none" }}
                    id="upload"
                    name="file"
                    type="file"
                    accept=".xls,.xlsx"
                    onChange={() => { setConfirmOpen(true); }}
                    ref={fileUploadRef}
                />

                <Table size="small" stickyHeader>
                    <TableHead className={classes.tableHead}>
                        <TableRow>
                            <TableCell padding="checkbox" />
                            <TableCell>{i18n.t("contacts.table.name")}</TableCell>
                            <TableCell align="center">Número / Contato</TableCell>
                            <TableCell align="center">Canal</TableCell>
                            <TableCell align="center">Tags</TableCell>
                            <TableCell align="center">Último Atendente</TableCell>
                            <TableCell align="center">Última Interação</TableCell>
                            <TableCell align="center">Tickets</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="center">{i18n.t("contacts.table.actions")}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {contacts.map((contact) => {
                            const lastTicket = getLastTicket(contact);
                            const stats = getTicketStats(contact);
                            return (
                                <TableRow key={contact.id} className={classes.tableRow}>
                                    {/* Avatar */}
                                    <TableCell style={{ paddingRight: 0 }}>
                                        <Tooltip title={contact.name} arrow>
                                            <Avatar
                                                src={contact?.urlPicture || undefined}
                                                alt={contact.name}
                                                style={{ width: 34, height: 34, cursor: "pointer", fontSize: "0.85rem" }}
                                            >
                                                {!contact?.urlPicture && contact.name?.charAt(0).toUpperCase()}
                                            </Avatar>
                                        </Tooltip>
                                    </TableCell>

                                    {/* Nome + email */}
                                    <TableCell style={{ minWidth: 160, maxWidth: 240 }}>
                                        <Typography variant="body2" style={{ fontWeight: 500, lineHeight: 1.3 }}>
                                            {contact.name}
                                        </Typography>
                                        {contact.email && (
                                            <Typography variant="caption" color="textSecondary" style={{ display: "block" }}>
                                                {contact.email}
                                            </Typography>
                                        )}
                                    </TableCell>

                                    {/* Número */}
                                    <TableCell align="center" style={{ minWidth: 140 }}>
                                        {renderContactNumber(contact)}
                                    </TableCell>

                                    {/* Canal */}
                                    <TableCell align="center">
                                        <Tooltip title={getChannelLabel(contact.channel)} arrow>
                                            <span style={{ display: "inline-flex", alignItems: "center" }}>
                                                {getChannelIcon(contact.channel)}
                                            </span>
                                        </Tooltip>
                                    </TableCell>

                                    {/* Tags */}
                                    <TableCell align="center" style={{ maxWidth: 180 }}>
                                        <Box display="flex" flexWrap="wrap" justifyContent="center" style={{ gap: 2 }}>
                                            {contact.tags?.length > 0
                                                ? contact.tags.map((tag) => (
                                                    <Chip
                                                        key={tag.id}
                                                        label={tag.name}
                                                        size="small"
                                                        className={classes.tagChip}
                                                        style={{
                                                            backgroundColor: tag.color || "#90a4ae",
                                                            color: "#fff",
                                                            fontWeight: 500,
                                                        }}
                                                    />
                                                ))
                                                : <Typography variant="caption" color="textSecondary">—</Typography>
                                            }
                                        </Box>
                                    </TableCell>

                                    {/* Último Atendente */}
                                    <TableCell align="center" style={{ minWidth: 100 }}>
                                        {lastTicket?.user ? (
                                            <Box className={classes.lastAgent}>
                                                <PersonIcon fontSize="inherit" color="action" />
                                                <Typography variant="caption" style={{ maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                                                    {lastTicket.user.name}
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Typography variant="caption" color="textSecondary">—</Typography>
                                        )}
                                    </TableCell>

                                    {/* Última Interação */}
                                    <TableCell align="center">
                                        <Typography variant="caption" className={classes.dateCell}>
                                            {lastTicket ? formatDate(lastTicket.updatedAt) : "—"}
                                        </Typography>
                                    </TableCell>

                                    {/* Tickets stats */}
                                    <TableCell align="center">
                                        <Box className={classes.ticketBadge}>
                                            {stats.open > 0 && (
                                                <Tooltip title={`${stats.open} aberto(s)`} arrow>
                                                    <Chip
                                                        label={`${stats.open} Ab`}
                                                        size="small"
                                                        style={{ backgroundColor: "#43a047", color: "#fff", height: 18, fontSize: "0.65rem", fontWeight: 600 }}
                                                    />
                                                </Tooltip>
                                            )}
                                            {stats.pending > 0 && (
                                                <Tooltip title={`${stats.pending} pendente(s)`} arrow>
                                                    <Chip
                                                        label={`${stats.pending} Pe`}
                                                        size="small"
                                                        style={{ backgroundColor: "#fb8c00", color: "#fff", height: 18, fontSize: "0.65rem", fontWeight: 600 }}
                                                    />
                                                </Tooltip>
                                            )}
                                            {stats.closed > 0 && (
                                                <Tooltip title={`${stats.closed} fechado(s)`} arrow>
                                                    <Chip
                                                        label={`${stats.closed} Fe`}
                                                        size="small"
                                                        style={{ backgroundColor: "#757575", color: "#fff", height: 18, fontSize: "0.65rem", fontWeight: 600 }}
                                                    />
                                                </Tooltip>
                                            )}
                                            {stats.open === 0 && stats.pending === 0 && stats.closed === 0 && (
                                                <Typography variant="caption" color="textSecondary">—</Typography>
                                            )}
                                        </Box>
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell align="center">
                                        <Tooltip title={contact.active ? "Ativo" : "Bloqueado"} arrow>
                                            <span>
                                                {contact.active
                                                    ? <CheckCircleIcon style={{ color: "#43a047" }} fontSize="small" />
                                                    : <CancelIcon style={{ color: "#e53935" }} fontSize="small" />
                                                }
                                            </span>
                                        </Tooltip>
                                    </TableCell>

                                    {/* Ações */}
                                    <TableCell align="center">
                                        <Box className={classes.actionButtons}>
                                            <Tooltip title="Iniciar conversa" arrow>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setContactTicket(contact);
                                                        setNewTicketModalOpen(true);
                                                    }}
                                                >
                                                    {getChannelIcon(contact.channel)}
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Editar contato" arrow>
                                                <IconButton size="small" onClick={() => hadleEditContact(contact.id)}>
                                                    <EditIcon color="secondary" fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={contact.active ? "Bloquear" : "Desbloquear"} arrow>
                                                <IconButton
                                                    size="small"
                                                    onClick={
                                                        contact.active
                                                            ? () => { setConfirmOpen(true); setBlockingContact(contact); }
                                                            : () => { setConfirmOpen(true); setUnBlockingContact(contact); }
                                                    }
                                                >
                                                    {contact.active
                                                        ? <BlockIcon color="secondary" fontSize="small" />
                                                        : <CheckCircleIcon color="secondary" fontSize="small" />
                                                    }
                                                </IconButton>
                                            </Tooltip>
                                            <Can
                                                role={user.profile}
                                                perform="contacts-page:deleteContact"
                                                yes={() => (
                                                    <Tooltip title="Excluir" arrow>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => { setConfirmOpen(true); setDeletingContact(contact); }}
                                                        >
                                                            <DeleteOutlineIcon color="secondary" fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            />
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {loading && <TableRowSkeleton avatar columns={9} />}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={totalCount}
                    page={pageNumber - 1}
                    onChangePage={handleChangePage}
                    rowsPerPage={250}
                    rowsPerPageOptions={[250]}
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}–${to} de ${count !== -1 ? count : `mais de ${to}`}`
                    }
                />
            </Paper>
        </div>
    );
};

export default Contacts;
