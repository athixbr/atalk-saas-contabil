import React, { useState, useEffect, useContext,  Suspense, lazy, useRef } from "react";
import { useParams, useHistory } from "react-router-dom";

import { toast } from "react-toastify";
import clsx from "clsx";

import { Button, IconButton, Paper, Tooltip, makeStyles } from "@material-ui/core";

import ContactDrawer from "../ContactDrawer";
import MessageInput from "../MessageInput/";
import TicketHeader from "../TicketHeader";
import TicketInfo from "../TicketInfo";
import TicketActionButtons from "../TicketActionButtonsCustom";
import MessagesList from "../MessagesList";
import api from "../../services/api";
import { ReplyMessageProvider } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { ForwardMessageContext, ForwardMessageProvider } from "../../context/ForwarMessage/ForwardMessageContext";
import { EditMessageProvider } from "../../context/EditingMessage/EditingMessageContext";

import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import { TagsContainer } from "../TagsContainer";
import { socketConnection } from "../../services/socket";
import { isNil } from 'lodash';
import { Lock, LockOpen } from "@material-ui/icons";
import { i18n } from "../../translate/i18n";
import { ForwardMessageModal } from "../ForwardMessageModal";

const drawerWidth = 320;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100%",
    position: "relative",
    overflow: "hidden",
  },

  mainWrapper: {
    flex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderLeft: "0",
    marginRight: -drawerWidth,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },

  mainWrapperShift: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
  },
  
  warningBanner: {
    backgroundColor: "#fff3cd",
    color: "#856404",
    padding: "12px 20px",
    borderLeft: "4px solid #ffc107",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: "500",
    fontSize: "14px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    animation: "$slideDown 0.3s ease-in-out",
  },
  
  adminBanner: {
    backgroundColor: "#d1ecf1",
    color: "#0c5460",
    padding: "12px 20px",
    borderLeft: "4px solid #17a2b8",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: "500",
    fontSize: "14px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  
  "@keyframes slideDown": {
    from: {
      transform: "translateY(-100%)",
      opacity: 0,
    },
    to: {
      transform: "translateY(0)",
      opacity: 1,
    },
  },
  
  dropOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(66, 133, 244, 0.95)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    pointerEvents: "none",
    animation: "$fadeIn 0.2s ease-in",
  },
  
  dropContent: {
    textAlign: "center",
    color: "#fff",
  },
  
  dropIcon: {
    fontSize: "80px",
    marginBottom: "20px",
    animation: "$bounce 1s infinite",
  },
  
  dropText: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  
  dropSubtext: {
    fontSize: "16px",
    opacity: 0.9,
  },
  
  "@keyframes fadeIn": {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  
  "@keyframes bounce": {
    "0%, 100%": { transform: "translateY(0)" },
    "50%": { transform: "translateY(-20px)" },
  },
}));

const Ticket = () => {
  const { ticketId } = useParams();
  const history = useHistory();
  const classes = useStyles();
  const currentTicketId = useRef(ticketId);

  const { user } = useContext(AuthContext);
  const { currentTicket } = useContext(TicketsContext);
  const isMounted = useRef(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState({});
  const [ticket, setTicket] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragFiles, setDragFiles] = useState([]);
  const dragCounter = useRef(0);
  const messageInputRef = useRef(null);





  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchTicket = async () => {
        try {
          if (!isNil(ticketId) && ticketId !== "undefined") {
            const { data } = await api.get("/tickets/u/" + ticketId);

            // const { queueId } = data;
            // const { queues, profile, allowGroup } = user;

            // const queueAllowed = queues.find((q) => q.id === queueId);
            // if (queueAllowed === undefined && profile !== "admin" && !allowGroup) {
            //   toast.error("Acesso não permitido");
            //   history.push("/tickets");
            //   return;
            // }
            if (isMounted.current) {
              setContact(data.contact);
              setTicket(data);
              setLoading(false);
            }
          }
        } catch (err) {
          history.push("/tickets");   // correção para evitar tela branca uuid não encontrado Feito por Altemir 16/08/2023
          setLoading(false);
          toastError(err);
        }
      };
      fetchTicket();
    }, 500);

    return () =>
      clearTimeout(delayDebounceFn);
  }, [ticketId]);

  useEffect(() => {
    const companyId = user.companyId;
    const socket = socketConnection({ companyId, userId: user.id });

    socket.on("connect", () => socket.emit("joinChatBox", `${ticket.id}`));

    socket.on(`company-${companyId}-ticket`, (data) => {
      if (data.action === "update") {
        setTicket(data.ticket);
      }

      if (data.action === "delete") {
        toast.success("Ticket encerrado com sucesso.");
        history.push("/tickets");
      }
    });

    // Notificação quando admin assume o ticket
    socket.on(`company-${companyId}-ticket-takeover`, (data) => {
      if (data.action === "adminTakeOver" && data.ticket.id === ticket.id) {
        toast.warning(`⚠️ ${data.message} - O ticket foi assumido por um administrador.`, {
          position: "top-center",
          autoClose: 5000,
        });
        // Redirecionar para lista de tickets
        setTimeout(() => {
          history.push("/tickets");
        }, 2000);
      }
    });

    socket.on(`company-${companyId}-contact`, (data) => {
      if (data.action === "update") {
        setContact((prevState) => {
          if (prevState.id === data.contact?.id) {
            return { ...prevState, ...data.contact };
          }
          return prevState;
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [ticketId, ticket, history, user.companyId, user.id]);

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  // Handlers para Drag & Drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounter.current++;
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounter.current--;
    
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(false);
    dragCounter.current = 0;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setDragFiles(files);
      
      // Dispara evento customizado para o MessageInput processar os arquivos
      const event = new CustomEvent('ticketFileDrop', { 
        detail: { files } 
      });
      window.dispatchEvent(event);
      
      toast.success(`📎 ${files.length} arquivo(s) adicionado(s)`);
    }
  };

  const renderTicketInfo = () => {
    if (ticket.user !== undefined) {
      return (
        <TicketInfo
          contact={contact}
          ticket={ticket}
          onClick={handleDrawerOpen}
        />
      );
    }
  };
  
  const renderWarningBanner = () => {
    // Se o ticket está em atendimento por outro usuário
    if (ticket.status === "open" && ticket.userId && ticket.userId !== user.id) {
      const isAdmin = user.profile === "admin";
      
      if (isAdmin) {
        return (
          <div className={classes.adminBanner}>
            <span style={{ fontSize: "20px" }}>👮</span>
            <div>
              <strong>Modo Administrador:</strong> Este ticket está sendo atendido por <strong>{ticket.user?.name}</strong>.
              Você pode assumir o atendimento, mas o usuário será notificado.
            </div>
          </div>
        );
      } else {
        return (
          <div className={classes.warningBanner}>
            <span style={{ fontSize: "20px" }}>⚠️</span>
            <div>
              <strong>Ticket em Atendimento:</strong> Este ticket está sendo atendido por <strong>{ticket.user?.name}</strong>.
              Aguarde a finalização ou solicite transferência.
            </div>
          </div>
        );
      }
    }
    return null;
  };

  const renderMessagesList = () => {
    return (
      <>
        <MessagesList
          ticket={ticket}
          ticketId={ticket.id}
          isGroup={ticket.isGroup}
          searchParam={currentTicket?.searchParam}
        ></MessagesList>
        <MessageInput ticketId={ticket.id} ticketStatus={ticket.status} ticket={ticket} />
      </>
    );
  };

  return (
    <div className={classes.root} id="drawer-container">



      <Paper
        variant="outlined"
        elevation={0}
        className={clsx(classes.mainWrapper, {
          [classes.mainWrapperShift]: drawerOpen,
        })}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className={classes.dropOverlay}>
            <div className={classes.dropContent}>
              <div className={classes.dropIcon}>📁</div>
              <div className={classes.dropText}>Solte os arquivos aqui</div>
              <div className={classes.dropSubtext}>Arraste e solte para enviar</div>
            </div>
          </div>
        )}
        <TicketHeader loading={loading}>
          {renderTicketInfo()}
          <TicketActionButtons ticket={ticket} />


        </TicketHeader>
        {renderWarningBanner()}
        <Paper>
          <TagsContainer contact={contact} ticket={ticket} />
        </Paper>
        <ReplyMessageProvider>
          <ForwardMessageProvider>
            <EditMessageProvider>
              {renderMessagesList()}
            </EditMessageProvider>
          </ForwardMessageProvider>
        </ReplyMessageProvider>
      </Paper>
      <ContactDrawer
        open={drawerOpen}
        handleDrawerClose={handleDrawerClose}
        contact={contact}
        loading={loading}
        ticket={ticket}
      />
    </div>
  );
};

export default Ticket;
