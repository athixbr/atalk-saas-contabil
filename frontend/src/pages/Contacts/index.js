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
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import { Facebook, Instagram, WhatsApp } from "@material-ui/icons";
import SearchIcon from "@material-ui/icons/Search";
import GetAppIcon from "@material-ui/icons/GetApp";
import PictureAsPdfIcon from "@material-ui/icons/PictureAsPdf";
import { CSVLink } from "react-csv";
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';

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
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";

import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";
import NewTicketModal from "../../components/NewTicketModal";
import { TagsFilter } from "../../components/TagsFilter";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import formatSerializedId from '../../utils/formatSerializedId';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

import {
    ArrowDropDown,
    Backup,
    ContactPhone,
} from "@material-ui/icons";
import { Menu, MenuItem, Box, Tooltip } from "@material-ui/core";

import ContactImportWpModal from "../../components/ContactImportWpModal";
import useCompanySettings from "../../hooks/useSettings/companySettings";

const reducer = (state, action) => {
    if (action.type === "LOAD_CONTACTS") {
        const contacts = action.payload;
        const newContacts = [];

        contacts.forEach((contact) => {
            const contactIndex = state.findIndex((c) => c.id === contact.id);
            if (contactIndex !== -1) {
                state[contactIndex] = contact;
            } else {
                newContacts.push(contact);
            }
        });

        return [...state, ...newContacts];
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
    mainPaper: {
        flex: 1,
        padding: theme.spacing(1),
        overflowY: "scroll",
        ...theme.scrollbarStyles,
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
    const [exportContact, setExportContact] = useState(false);
    const [confirmChatsOpen, setConfirmChatsOpen] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
    const [contactTicket, setContactTicket] = useState({});
    const fileUploadRef = useRef(null);
    const [selectedTags, setSelectedTags] = useState([]);
    
    // Novos filtros
    const [filterChannel, setFilterChannel] = useState("");
    const [filterStatus, setFilterStatus] = useState("");


    const { get: getSetting } = useCompanySettings();
    const [hideNum, setHideNum] = useState(false);

    useEffect(() => {

        async function fetchData() {
            const setting = await getSetting({
                "column": "lgpdHideNumber"
            });

            if (setting.lgpdHideNumber === "enabled") {
                setHideNum(true);
            }
        }
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
                    setHasMore(data.hasMore);
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

        return () => {
            socket.disconnect();
        };
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
        setSearchParam(event.target.value.toLowerCase());
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
        setDeletingContact(null);
        setSearchParam("");
        setPageNumber(1);
        setBlockingContact(null);
    };

    const handleUnBlockContact = async (contactId) => {
        try {
            await api.put(`/contacts/block/${contactId}`, { active: true });
            toast.success("Contato desbloqueado");
        } catch (err) {
            toastError(err);
        }
        setDeletingContact(null);
        setSearchParam("");
        setPageNumber(1);
        setUnBlockingContact(null);
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

    const prepareExportData = () => {
        return contacts.map((contact) => ({
            Nome: contact.name,
            Número: hideNum && user.profile === "user" 
                ? contact.isGroup 
                    ? contact.number 
                    : formatSerializedId(contact.number).slice(0, -6) + "**-**" + contact.number.slice(-2)
                : contact.isGroup 
                    ? contact.number 
                    : formatSerializedId(contact.number),
            Email: contact.email || "",
            Status: contact.active ? "Ativo" : "Bloqueado",
            Tags: contact.tags?.map(t => t.name).join(", ") || "",
            "Última Mensagem": getDateLastMessage(contact) || "Sem mensagens"
        }));
    };

    const handleExportPDF = () => {
        try {
            const exportData = prepareExportData();
            
            // Cria uma janela para impressão
            const printWindow = window.open('', '_blank');
            
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Contatos - ${new Date().toLocaleDateString()}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #3f51b5; }
                        .info { margin: 10px 0; color: #666; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                        th { background-color: #3f51b5; color: white; }
                        tr:nth-child(even) { background-color: #f2f2f2; }
                        @media print {
                            body { margin: 0; }
                            button { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <h1>Lista de Contatos</h1>
                    <div class="info">
                        <strong>Total:</strong> ${totalCount} contatos | 
                        <strong>Exibindo:</strong> ${contacts.length} contatos |
                        <strong>Data:</strong> ${new Date().toLocaleString()}
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Número</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Tags</th>
                                <th>Última Mensagem</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${exportData.map(contact => `
                                <tr>
                                    <td>${contact.Nome}</td>
                                    <td>${contact.Número}</td>
                                    <td>${contact.Email}</td>
                                    <td>${contact.Status}</td>
                                    <td>${contact.Tags}</td>
                                    <td>${contact["Última Mensagem"]}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <script>
                        window.onload = function() {
                            window.print();
                        }
                    </script>
                </body>
                </html>
            `;
            
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            
            toast.success("PDF preparado para impressão!");
        } catch (err) {
            toastError(err);
        }
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

    function getDateLastMessage(contact) {
        if (!contact) return null;
        if (!contact.tickets) return null;

        if (contact.tickets.length > 0) {
            const date = new Date(
                contact.tickets[contact.tickets.length - 1].updatedAt
            );

            const day =
                date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
            const month = date.getMonth() + 1;
            const year = date.getFullYear();

            const hours = date.getHours();
            const minutes = date.getMinutes();

            return `${day}/${month}/${year} ${hours}:${minutes}`;
        }

        return null;
    }

    return (

        <MainContainer className={classes.mainContainer}>
            <NewTicketModal
                modalOpen={newTicketModalOpen}
                initialContact={contactTicket}
                onClose={(ticket) => {
                    handleCloseOrOpenTicket(ticket);
                }}
            />
            <ContactModal
                open={contactModalOpen}
                onClose={handleCloseContactModal}
                aria-labelledby="form-dialog-title"
                contactId={selectedContactId}
            ></ContactModal>
            <ConfirmationModal
                title={
                    deletingContact
                        ? `${i18n.t(
                            "contacts.confirmationModal.deleteTitle"
                        )} ${deletingContact.name}?`
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
                onConfirm={(e) =>
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
                {exportContact
                    ?
                    `${i18n.t("contacts.confirmationModal.exportContact")}`
                    : deletingContact
                        ? `${i18n.t("contacts.confirmationModal.deleteMessage")}`
                        : blockingContact
                            ? `${i18n.t("contacts.confirmationModal.blockContact")}`
                            : unBlockingContact
                                ? `${i18n.t("contacts.confirmationModal.unblockContact")}`
                                : ImportContacts
                                    ? `${i18n.t("contacts.confirmationModal.importMessage")}`
                                    : `${i18n.t(
                                        "contactListItems.confirmationModal.importMessage"
                                    )}`}
            </ConfirmationModal>
            <ConfirmationModal
                title={i18n.t("contacts.confirmationModal.importChat")}
                open={confirmChatsOpen}
                onClose={setConfirmChatsOpen}
                onConfirm={(e) => handleimportChats()}
            >
                {i18n.t("contacts.confirmationModal.wantImport")}
            </ConfirmationModal>
            <MainHeader>
                <Title>
                    {i18n.t("contacts.title")} 
                    {totalCount > 0 && (
                        <span style={{ fontSize: '0.875rem', color: '#666', marginLeft: '8px' }}>
                            (Exibindo {contacts.length} de {totalCount})
                        </span>
                    )}
                </Title>
                <MainHeaderButtonsWrapper>
                    <TagsFilter
                        onFiltered={handleSelectedTags}
                    />
                    <TextField
                        select
                        label="Canal"
                        value={filterChannel}
                        onChange={(e) => setFilterChannel(e.target.value)}
                        style={{ minWidth: 120, marginRight: 8 }}
                        size="small"
                    >
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="whatsapp">WhatsApp</MenuItem>
                        <MenuItem value="instagram">Instagram</MenuItem>
                        <MenuItem value="facebook">Facebook</MenuItem>
                    </TextField>
                    <TextField
                        select
                        label="Status"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ minWidth: 120, marginRight: 8 }}
                        size="small"
                    >
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="true">Ativo</MenuItem>
                        <MenuItem value="false">Bloqueado</MenuItem>
                    </TextField>
                    <TextField
                        placeholder={i18n.t("contacts.searchPlaceholder")}
                        type="search"
                        value={searchParam}
                        onChange={handleSearch}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="secondary" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleExportPDF}
                        disabled={contacts.length === 0}
                        startIcon={<PictureAsPdfIcon />}
                        style={{ marginRight: 8 }}
                    >
                        PDF
                    </Button>
                    <CSVLink
                        data={prepareExportData()}
                        filename={`contatos_${new Date().toISOString().split('T')[0]}.csv`}
                        separator=";"
                        style={{ textDecoration: 'none' }}
                    >
                        <Button
                            variant="outlined"
                            color="primary"
                            disabled={contacts.length === 0}
                            startIcon={<GetAppIcon />}
                            style={{ marginRight: 8 }}
                        >
                            Excel
                        </Button>
                    </CSVLink>
                    <PopupState variant="popover" popupId="demo-popup-menu">
                        {(popupState) => (
                            <React.Fragment>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    {...bindTrigger(popupState)}
                                >
                                    Importar
                                    <ArrowDropDown />
                                </Button>
                                <Menu {...bindMenu(popupState)}>
                                    <MenuItem
                                        onClick={() => {
                                            setConfirmOpen(true);
                                            setImportContacts(true);
                                            popupState.close();
                                        }}
                                    >
                                        <ContactPhone
                                            fontSize="small"
                                            color="primary"
                                            style={{
                                                marginRight: 10,
                                            }}
                                        />
                                        {i18n.t("contacts.menu.importYourPhone")}
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => { setImportContactModalOpen(true) }}

                                    >
                                        <Backup
                                            fontSize="small"
                                            color="primary"
                                            style={{
                                                marginRight: 10,
                                            }}
                                        />
                                        {i18n.t("contacts.menu.importToExcel")}

                                    </MenuItem>
                                    {/* {<MenuItem>
                        
                                       <CSVLink
                                            className={classes.csvbtn}
                                            separator=";"
                                            filename={'contacts.csv'}
                                            data={
                                                contacts.map((contact) => ({
                                                    number: hideNum && user.profile === "user" ? contact.isGroup ? contact.number : formatSerializedId(contact.number).slice(0,-6)+"**-**"+ contact.number.slice(-2): contact.isGroup ? contact.number : formatSerializedId(contact.number),
                                                    firstName: contact.name.split(' ')[0],
                                                    lastname: String(contact.name).replace(contact.name.split(' ')[0],''),
                                                    tags: contact?.tags?.name
                                                }))

                                            }
                                            
                                            >
                                        
                                        <CloudDownload fontSize="small"
                                            color="primary"
                                            style={{
                                                marginRight: 10,
                                            
                                                }}                                                
                                        />        
                                        Exportar Excel                                
                                   </CSVLink>
                                        
                                    </MenuItem> } */}
                                </Menu>
                            </React.Fragment>
                        )}
                    </PopupState>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleOpenContactModal}
                    >
                        {i18n.t("contacts.buttons.add")}
                    </Button>
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
                onScroll={handleScroll}
            >
                <>
                    <input
                        style={{ display: "none" }}
                        id="upload"
                        name="file"
                        type="file"
                        accept=".xls,.xlsx"
                        onChange={() => {
                            setConfirmOpen(true);
                        }}
                        ref={fileUploadRef}
                    />
                </>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox" />
                            <TableCell>
                                {i18n.t("contacts.table.name")}
                            </TableCell>
                            <TableCell align="center">
                                {i18n.t("contacts.table.whatsapp")}
                            </TableCell>
                            <TableCell align="center">
                                Canal
                            </TableCell>
                            <TableCell align="center">
                                {i18n.t("contacts.table.email")}
                            </TableCell>
                            <TableCell align="center">
                                {i18n.t("contacts.table.lastMessage")}
                            </TableCell>
                            <TableCell align="center">{"Status"}</TableCell>
                            <TableCell align="center">
                                {i18n.t("contacts.table.actions")}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <>
                            {contacts.map((contact) => (
                                <TableRow key={contact.id}>
                                    <TableCell style={{ paddingRight: 0 }}>
                                        <Tooltip title={contact.name} arrow>
                                            <Avatar 
                                                src={contact?.urlPicture || undefined}
                                                alt={contact.name}
                                                style={{ 
                                                    width: 40, 
                                                    height: 40,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {!contact?.urlPicture && contact.name?.charAt(0).toUpperCase()}
                                            </Avatar>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>{contact.name}</TableCell>
                                    <TableCell align="center">
                                        {hideNum && user.profile === "user" 
                                            ? contact.isGroup 
                                                ? contact.number 
                                                : formatSerializedId(contact.number).slice(0, -6) + "**-**" + contact.number.slice(-2)
                                            : contact.isGroup 
                                                ? contact.number 
                                                : formatSerializedId(contact.number)
                                        }
                                    </TableCell>
                                    <TableCell align="center">
                                        {contact.channel === "whatsapp" && (
                                            <Tooltip title="WhatsApp">
                                                <WhatsApp style={{ color: "green", fontSize: 20 }} />
                                            </Tooltip>
                                        )}
                                        {contact.channel === "instagram" && (
                                            <Tooltip title="Instagram">
                                                <Instagram style={{ color: "purple", fontSize: 20 }} />
                                            </Tooltip>
                                        )}
                                        {contact.channel === "facebook" && (
                                            <Tooltip title="Facebook">
                                                <Facebook style={{ color: "blue", fontSize: 20 }} />
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        {contact.email}
                                    </TableCell>
                                    <TableCell align="center">
                                        {getDateLastMessage(contact)}
                                    </TableCell>
                                    <TableCell align="center">
                                        {contact.active ? (
                                            <CheckCircleIcon
                                                style={{ color: "green" }}
                                                fontSize="small"
                                            />
                                        ) : (
                                            <CancelIcon
                                                style={{ color: "red" }}
                                                fontSize="small"
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setContactTicket(contact);
                                                setNewTicketModalOpen(true);
                                                // handleSaveTicket(contact.id);
                                            }}
                                        >
                                            {contact.channel === "whatsapp" && (<WhatsApp style={{ color: "green" }} />)}
                                            {contact.channel === "instagram" && (<Instagram style={{ color: "purple" }} />)}
                                            {contact.channel === "facebook" && (<Facebook style={{ color: "blue" }} />)}
                                        </IconButton>

                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                hadleEditContact(contact.id)
                                            }
                                        >
                                            <EditIcon color="secondary" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={
                                                contact.active
                                                    ? () => {
                                                        setConfirmOpen(true);
                                                        setBlockingContact(
                                                            contact
                                                        );
                                                    }
                                                    : () => {
                                                        setConfirmOpen(true);
                                                        setUnBlockingContact(
                                                            contact
                                                        );
                                                    }
                                            }
                                        >
                                            {contact.active ? (
                                                <BlockIcon color="secondary" />
                                            ) : (
                                                <CheckCircleIcon color="secondary" />
                                            )}
                                        </IconButton>
                                        <Can
                                            role={user.profile}
                                            perform="contacts-page:deleteContact"
                                            yes={() => (
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        setConfirmOpen(true);
                                                        setDeletingContact(
                                                            contact
                                                        );
                                                    }}
                                                >
                                                    <DeleteOutlineIcon color="secondary" />
                                                </IconButton>
                                            )}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {loading && <TableRowSkeleton avatar columns={3} />}
                        </>
                    </TableBody>
                </Table>
            </Paper>
        </MainContainer >
    );
};

export default Contacts;
