import React, { useState, useEffect, useRef, useContext } from "react";

import { useHistory, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";
import clsx from "clsx";
import emojiRegex from "emoji-regex";

import { makeStyles, withStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import Badge from "@material-ui/core/Badge";
import IconButton from "@material-ui/core/IconButton";
import Chip from "@material-ui/core/Chip";
import { i18n } from "../../translate/i18n";
import VisibilityIcon from "@material-ui/icons/Visibility";
import CheckIcon from "@material-ui/icons/CheckCircle";
import ReplayIcon from "@material-ui/icons/Replay";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";
import Checkbox from "@material-ui/core/Checkbox";
import api from "../../services/api";

import MarkdownWrapper from "../MarkdownWrapper";
import { Tooltip } from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import formatMentions from "../../utils/formatMentions";

import facebookIcon from "../../assets/facebook.png";
import insatagramIcon from "../../assets/instagram.png";
import whatsappIcon from "../../assets/whatsapp.png";

const useStyles = makeStyles((theme) => ({
    ticket: {
        position: "relative",
    },

    pendingTicket: {
        cursor: "unset",
    },

    noTicketsDiv: {
        display: "flex",
        height: "100px",
        margin: 40,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },

    noTicketsText: {
        textAlign: "center",
        color: "rgb(104, 121, 146)",
        fontSize: "14px",
        lineHeight: "1.4",
    },

    noTicketsTitle: {
        textAlign: "center",
        fontSize: "16px",
        fontWeight: "600",
        margin: "0px",
    },

    contactNameWrapper: {
        display: "flex",
        justifyContent: "space-between",
    },

    lastMessageTime: {
        position: "absolute",
        marginRight: 5,
        right: 20,
        bottom: 30,
    },

    closedBadge: {
        alignSelf: "center",
        justifySelf: "flex-end",
        marginRight: 32,
        marginLeft: "auto",
    },

    contactLastMessage: {
        paddingRight: 20,
    },

    newMessagesCount: {
        alignSelf: "center",
        marginRight: 8,
        marginLeft: "auto",
    },

    bottomButton: {
        top: "12px",
    },

    badgeStyle: {
        color: "white",
        backgroundColor: green[500],
    },

    acceptButton: {
        position: "absolute",
        left: "50%",
    },

    ticketQueueColor: {
        flex: "none",
        width: "8px",
        height: "100%",
        position: "absolute",
        top: "0%",
        left: "0%",
    },

    userTag: {
        position: "absolute",
        marginRight: 110,
        right: 20,
        bottom: 30,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.primary.main,
        border: "1px solid #CCC",
        padding: 1,
        paddingLeft: 5,
        paddingRight: 5,
        borderRadius: 10,
        fontSize: "0.9em",
    },
    divTags: {
        position: "absolute",
        marginRight: 0,
        left: 0,
        bottom: 0,
        flexWrap: "wrap",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    tags: {
        color: "#FFF",
        border: "1px solid #CCC",
        padding: 0,
        paddingLeft: 5,
        paddingRight: 5,
        borderRadius: 0,
        fontSize: "0.6em",
        textAlign: "center",
    },
    divUser: {
        position: "absolute",
        marginRight: 0,
        left: 0,
        top: 0,
        flexWrap: "wrap",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    user: {
        color: "#eee",
        border: "1px solid #CCC",
        padding: 0,
        paddingLeft: 5,
        paddingRight: 5,
        borderRadius: 0,
        fontSize: "0.6em",
        textAlign: "center",
    },

    tagsWrapper: {
        zIndex: 500,
    },

    statusChip: {
        height: 16,
        fontSize: "0.6em",
        marginLeft: 4,
        borderRadius: 4,
    },

    matchSnippet: {
        display: "block",
        fontSize: "0.75em",
        color: "#888",
        fontStyle: "italic",
        marginTop: 2,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },

    badge: {
        backgroundColor: "#44b700",
        color: "#44b700",
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        "&::after": {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            animation: "$ripple 1.2s infinite ease-in-out",
            border: "1px solid currentColor",
            content: '""',
        },
    },
    "@keyframes ripple": {
        "0%": {
            transform: "scale(.8)",
            opacity: 1,
        },
        "100%": {
            transform: "scale(2.4)",
            opacity: 0,
        },
    },
}));

const SmallAvatar = withStyles((theme) => ({
    root: {
        width: 22,
        height: 22,
        border: `2px solid ${theme.palette.background.paper}`,
    },
}))(Avatar);

const getAvatarChannel = (channel) => {
    if (channel === "facebook") {
        return facebookIcon;
    }

    if (channel === "whatsapp") {
        return whatsappIcon;
    }

    if (channel === "whatsappapi") {
        return whatsappIcon;
    }

    if (channel === "instagram") {
        return insatagramIcon;
    }
};

const TicketListItem = ({ ticket, mergeMode = false, isSelectedForMerge = false, onToggleSelectForMerge }) => {
    const classes = useStyles();
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const { ticketId } = useParams();
    const isMounted = useRef(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    function getRatingIcon(rate) {
        let icon = "";
        if (rate === 1) {
            icon = "😡";
        } else if (rate === 2) {
            icon = "😠";
        } else if (rate === 3) {
            icon = "😐";
        } else if (rate === 4) {
            icon = "😃";
        } else if (rate === 5) {
            icon = "😍";
        }

        return icon;
    }

    const handleAcepptTicket = async (ticket) => {
        setLoading(true);
        try {
            await api.put(`/tickets/${ticket.id}`, {
                status: "open",
                userId: user?.id,
            });
        } catch (err) {
            setLoading(false);
            toastError(err);
        }
        if (isMounted.current) {
            setLoading(false);
        }
        history.push(`/tickets/${ticket.uuid}`);
    };

    const handleAcepptTicketBot = async (ticket) => {
        // alert("Bot");
        setLoading(true);
        try {
            await api.put(`/tickets/${ticket.id}`, {
                status: "open",
                userId: user?.id,
            });
        } catch (err) {
            setLoading(false);
            toastError(err);
        }
        if (isMounted.current) {
            setLoading(false);
        }
        history.push(`/tickets/${ticket.uuid}`);
    };

    const handleReopenTicket = async (ticket) => {
        setLoading(true);
        try {
            await api.put(`/tickets/${ticket.id}`, {
                status: "open",
                userId: user?.id,
            });
        } catch (err) {
            setLoading(false);
            toastError(err);
        }
        if (isMounted.current) {
            setLoading(false);
        }
        history.push(`/tickets/${ticket.uuid}`);
    };

    const handleViewTicket = async (ticket) => {
        setLoading(true);
        try {
            await api.put(`/tickets/${ticket.id}`, {
                status: "pending",
            });
        } catch (err) {
            setLoading(false);
            toastError(err);
        }
        if (isMounted.current) {
            setLoading(false);
        }
        history.push(`/tickets/${ticket.uuid}`);
    };

    const handleClosedTicket = async (ticket) => {
        setLoading(true);
        try {
            await api.put(`/tickets/${ticket.id}`, {
                status: "closed",
            });
        } catch (err) {
            setLoading(false);
            toastError(err);
        }
        if (isMounted.current) {
            setLoading(false);
        }
    };

    const handleSelectTicket = (ticket) => {
        history.push(`/tickets/${ticket.uuid}`);
    };

    const renderUserName = (name) => {
        let str = name.replace(emojiRegex(), "").trim();

        const firstName = str.split(" ")[0];

        return firstName;
    };

    const statusLabels = {
        open: { label: "Aberto", color: "#43a047" },
        pending: { label: "Pendente", color: "#fb8c00" },
        closed: { label: "Fechado", color: "#757575" },
    };

    const getStatusChip = (status) => {
        const info = statusLabels[status];
        if (!info) return null;
        return (
            <Chip
                label={info.label}
                className={classes.statusChip}
                style={{ backgroundColor: info.color, color: "#fff" }}
            />
        );
    };

    const getMatchSnippet = () => {
        if (!ticket.messages || ticket.messages.length === 0) return null;
        const body = ticket.messages[0]?.body;
        if (!body) return null;
        const truncated = body.length > 80 ? body.substring(0, 80) + "…" : body;
        return (
            <span className={classes.matchSnippet}>
                🔍 {truncated}
            </span>
        );
    };

    return (
        <React.Fragment key={ticket.id}>
            <ListItem
                dense
                button
                onClick={(e) => {
                    if (mergeMode) {
                        onToggleSelectForMerge && onToggleSelectForMerge(ticket);
                        return;
                    }
                    if (ticket.status === "pending") return;
                    handleSelectTicket(ticket);
                }}
                selected={!mergeMode && ticketId && +ticketId === ticket.id}
                style={isSelectedForMerge ? { backgroundColor: "#e3f2fd", borderLeft: "3px solid #1976d2" } : {}}
                className={clsx(classes.ticket, {
                    [classes.pendingTicket]: ticket.status === "pending",
                })}
            >
                {mergeMode && (
                    <Checkbox
                        checked={isSelectedForMerge}
                        color="primary"
                        size="small"
                        style={{ padding: 4, marginRight: 4 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleSelectForMerge && onToggleSelectForMerge(ticket);
                        }}
                    />
                )}
                <Tooltip
                    arrow
                    placement="right"
                    title={ticket.queue?.name || "Sem departamento"}
                >
                    <span
                        style={{
                            backgroundColor: ticket.queue?.color || "#7C7C7C",
                        }}
                        className={classes.ticketQueueColor}
                    ></span>
                </Tooltip>
                <ListItemAvatar>
                    <Badge
                        overlap="circular"
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                        }}
                        badgeContent={
                            <SmallAvatar
                                alt={ticket?.channel}
                                src={getAvatarChannel(ticket?.channel)}
                            />
                        }
                    >
                        <Avatar
                            alt={ticket?.contact?.name}
                            src={ticket?.contact?.urlPicture}
                        />
                    </Badge>
                </ListItemAvatar>
                <ListItemText
                    disableTypography
                    primary={
                        <span className={classes.contactNameWrapper}>
                            <Typography
                                noWrap
                                component="span"
                                variant="body2"
                                color="textPrimary"
                            >
                                {ticket.contact.name}
                                {ticket.status && getStatusChip(ticket.status)}
                            </Typography>

                            {ticket.lastMessage && (
                                <Typography
                                    className={classes.lastMessageTime}
                                    component="span"
                                    variant="body2"
                                    color="textSecondary"
                                >
                                    {isSameDay(
                                        parseISO(ticket.updatedAt),
                                        new Date()
                                    ) ? (
                                        <>
                                            {format(
                                                parseISO(ticket.updatedAt),
                                                "HH:mm"
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {format(
                                                parseISO(ticket.updatedAt),
                                                "dd/MM/yyyy"
                                            )}
                                        </>
                                    )}
                                </Typography>
                            )}
                            {ticket.whatsappId && (
                                <div
                                    className={classes.userTag}
                                    title={i18n.t(
                                        "ticketsList.connectionTitle"
                                    )}
                                >
                                    {ticket.whatsapp?.name}
                                </div>
                            )}
                        </span>
                    }
                    secondary={
                        <span className={classes.contactNameWrapper} style={{ flexDirection: "column", alignItems: "flex-start" }}>
                            <span style={{ display: "flex", width: "100%", alignItems: "center" }}>
                                {ticket.status === "closed"
                                    ? ticket?.userRating
                                        ? getRatingIcon(ticket?.userRating?.rate)
                                        : null
                                    : null}
                                <Typography
                                    className={classes.contactLastMessage}
                                    noWrap
                                    component="span"
                                    variant="body2"
                                    color="textSecondary"
                                >
                                    {ticket.lastMessage ? (
                                        <MarkdownWrapper>
                                            {formatMentions(ticket.lastMessage)}
                                        </MarkdownWrapper>
                                    ) : (
                                        <br />
                                    )}
                                </Typography>

                                <Badge
                                    overlap="rectangular"
                                    className={classes.newMessagesCount}
                                    badgeContent={ticket.unreadMessages}
                                    classes={{
                                        badge: classes.badgeStyle,
                                    }}
                                />
                            </span>
                            {getMatchSnippet()}
                        </span>
                    }
                />
                {ticket.status === "pending" && (
                    <IconButton
                        className={classes.bottomButton}
                        color="primary"
                        loading={loading.toString()}
                        onClick={(e) =>
                            ticket.isBot
                                ? handleAcepptTicketBot(ticket)
                                : handleAcepptTicket(ticket)
                        }
                    >
                        <CheckIcon />
                    </IconButton>
                )}
                {ticket.status === "pending" && (
                    <IconButton
                        className={classes.bottomButton}
                        color="primary"
                        onClick={(e) => handleViewTicket(ticket)}
                    >
                        <VisibilityIcon />
                    </IconButton>
                )}
                <div className={classes.divTags}>
                    {ticket.isGroup && (
                        <div className={classes.tagsWrapper}>
                            <div
                                key={ticket.isGroup}
                                className={classes.tags}
                                title={ticket.isGroup}
                                style={{
                                    backgroundColor: "#7C7C7C",
                                }}
                            >
                                Grupo
                            </div>
                        </div>
                    )}
                    {ticket.user?.id &&
                        user.profile.toUpperCase() === "ADMIN" && (
                            <div className={classes.tagsWrapper}>
                                <div
                                    key={ticket.user.id}
                                    className={classes.tags}
                                    title={renderUserName(ticket.user.name)}
                                    style={{
                                        backgroundColor:
                                            ticket.user.color === "" ||
                                                !ticket.user.color
                                                ? "#7C7C7C"
                                                : ticket.user.color,
                                    }}
                                >
                                    {renderUserName(ticket.user.name)}
                                </div>
                            </div>
                        )}
                    {ticket.tags?.length > 0 && (
                        <>
                            <div className={classes.tagsWrapper}>
                                <div
                                    key={ticket.tags[0].id}
                                    className={classes.tags}
                                    title={ticket.tags[0].name}
                                    style={{
                                        backgroundColor: ticket.tags[0].color,
                                    }}
                                >
                                    {ticket.tags[0].name}
                                </div>
                            </div>
                            {ticket.tags.length > 1 && (
                                <div
                                    key={ticket.tags[1].id}
                                    className={classes.tags}
                                    title={ticket.tags[1].name}
                                    style={{
                                        backgroundColor: ticket.tags[1].color,
                                    }}
                                >
                                    +{ticket.tags.length - 1}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {ticket.status === "pending" && (
                    <IconButton
                        className={classes.bottomButton}
                        color="primary"
                        onClick={(e) => handleClosedTicket(ticket)}
                    >
                        <ClearOutlinedIcon />
                    </IconButton>
                )}
                {ticket.status === "open" && (
                    <IconButton
                        className={classes.bottomButton}
                        color="primary"
                        onClick={(e) => handleViewTicket(ticket)}
                    >
                        <ReplayIcon />
                    </IconButton>
                )}
                {ticket.status === "open" && (
                    <IconButton
                        className={classes.bottomButton}
                        color="primary"
                        onClick={(e) => handleClosedTicket(ticket)}
                    >
                        <ClearOutlinedIcon />
                    </IconButton>
                )}
                {ticket.status === "closed" && (
                    <IconButton
                        className={classes.bottomButton}
                        color="primary"
                        onClick={(e) => handleReopenTicket(ticket)}
                    >
                        <ReplayIcon />
                    </IconButton>
                )}
                {ticket.status === "closed" && (
                    <IconButton
                        className={classes.bottomButton}
                        color="primary"
                    ></IconButton>
                )}
            </ListItem>
            <Divider variant="inset" component="li" />
        </React.Fragment>
    );
};

export default TicketListItem;
