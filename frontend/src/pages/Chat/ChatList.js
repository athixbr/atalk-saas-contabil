import React, { useContext, useState } from "react";
import {
  Avatar,
  Badge,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Tooltip,
  Typography,
} from "@material-ui/core";

import { useHistory, useParams } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";

import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import GroupIcon from "@material-ui/icons/Group";

import ConfirmationModal from "../../components/ConfirmationModal";
import api from "../../services/api";
import { getBackendUrl } from "../../config";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    height: "calc(100% - 58px)",
    overflow: "hidden",
    backgroundColor: theme.mode === 'light' ? "#ffffff" : "#2d3748",
  },
  chatList: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    padding: theme.spacing(1),
  },
  listItemActive: {
    cursor: "pointer",
    backgroundColor: theme.mode === 'light' ? '#e3f2fd' : '#1e293b',
    borderRadius: 12,
    marginBottom: theme.spacing(1),
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: `2px solid ${theme.mode === 'light' ? '#2196f3' : '#3b82f6'}`,
    '&:hover': {
      transform: 'translateX(4px)',
      boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
    },
  },
  listItem: {
    cursor: "pointer",
    backgroundColor: theme.mode === 'light' ? '#f8fafc' : '#334155',
    borderRadius: 12,
    marginBottom: theme.spacing(1),
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: `1px solid ${theme.mode === 'light' ? '#e2e8f0' : '#475569'}`,
    '&:hover': {
      backgroundColor: theme.mode === 'light' ? '#f1f5f9' : '#475569',
      transform: 'translateX(2px)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
  },
  avatar: {
    width: 50,
    height: 50,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontSize: 20,
    fontWeight: 600,
  },
  badge: {
    '& .MuiBadge-badge': {
      backgroundColor: '#ef4444',
      color: '#fff',
      fontWeight: 600,
      minWidth: 20,
      height: 20,
      padding: '0 6px',
      fontSize: 11,
    },
  },
  chatTitle: {
    fontWeight: 600,
    fontSize: 15,
    color: theme.mode === 'light' ? '#1e293b' : '#f1f5f9',
  },
  lastMessage: {
    fontSize: 13,
    color: theme.mode === 'light' ? '#64748b' : '#94a3b8',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 200,
  },
  timestamp: {
    fontSize: 11,
    color: theme.mode === 'light' ? '#94a3b8' : '#cbd5e1',
  },
}));

export default function ChatList({
  chats,
  handleSelectChat,
  handleDeleteChat,
  handleEditChat,
  pageInfo,
  loading,
}) {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const { datetimeToClient } = useDate();

  const [confirmationModal, setConfirmModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState({});

  const { id } = useParams();

  const goToMessages = async (chat) => {
    if (unreadMessages(chat) > 0) {
      try {
        await api.post(`/chats/${chat.id}/read`, { userId: user.id });
      } catch (err) {}
    }

    if (id !== chat.uuid) {
      history.push(`/chats/${chat.uuid}`);
      handleSelectChat(chat);
    }
  };

  const handleDelete = () => {
    handleDeleteChat(selectedChat);
  };

  const unreadMessages = (chat) => {
    const currentUser = chat.users.find((u) => u.userId === user.id);
    return currentUser.unreads;
  };

  const getPrimaryText = (chat) => {
    let mainText = chat.title;
    
    // Se é conversa individual (2 usuários e sem título customizado)
    if (chat.users?.length === 2 && (!chat.title || chat.title.trim() === "")) {
      const otherUser = chat.users.find(u => u.userId !== user.id);
      mainText = otherUser ? otherUser.user.name : "Chat";
    }
    
    return (
      <Typography className={classes.chatTitle}>
        {mainText}
        {chat.users?.length > 2 && (
          <Chip 
            size="small" 
            icon={<GroupIcon />} 
            label={`${chat.users.length}`}
            style={{ marginLeft: 8, height: 20, fontSize: 11 }}
          />
        )}
      </Typography>
    );
  };

  const getSecondaryText = (chat) => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <Typography className={classes.lastMessage}>
          {chat.lastMessage || "Sem mensagens"}
        </Typography>
        {chat.updatedAt && (
          <Typography className={classes.timestamp}>
            {datetimeToClient(chat.updatedAt)}
          </Typography>
        )}
      </div>
    );
  };

  const getChatInitials = (chat) => {
    // Se é conversa individual, pega as iniciais do outro usuário
    if (chat.users?.length === 2 && (!chat.title || chat.title.trim() === "")) {
      const otherUser = chat.users.find(u => u.userId !== user.id);
      if (otherUser) {
        const name = otherUser.user.name;
        const words = name.split(' ');
        if (words.length >= 2) {
          return (words[0][0] + words[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
      }
    }
    
    // Para grupos, usa o título
    const title = chat.title || "Chat";
    const words = title.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return title.substring(0, 2).toUpperCase();
  };

  const getChatAvatarUrl = (chat) => {
    // Para grupos, não mostra foto individual
    if (chat.users?.length > 2) {
      return null;
    }
    // Para conversa 1-1, mostra a foto do outro usuário
    const otherUser = chat.users?.find(u => u.userId !== user.id);
    if (otherUser?.user?.profileImage && 
        otherUser.user.profileImage !== 'null' && 
        otherUser.user.profileImage !== '') {
      const backendUrl = getBackendUrl();
      return `${backendUrl}/public/company${otherUser.user.companyId}/user/${otherUser.user.profileImage}`;
    }
    return null;
  };

  return (
    <>
      <ConfirmationModal
        title={"Excluir Conversa"}
        open={confirmationModal}
        onClose={setConfirmModalOpen}
        onConfirm={handleDelete}
      >
        Esta ação não pode ser revertida, confirmar?
      </ConfirmationModal>
      <div className={classes.mainContainer}>
        <div className={classes.chatList}>
          <List>
            {Array.isArray(chats) &&
              chats.length > 0 &&
              chats.map((chat, key) => {
                const unreads = unreadMessages(chat);
                return (
                  <ListItem
                    onClick={() => goToMessages(chat)}
                    key={key}
                    className={chat.uuid === id ? classes.listItemActive : classes.listItem}
                    button
                  >
                    <ListItemAvatar>
                      <Badge 
                        badgeContent={unreads} 
                        className={classes.badge}
                        invisible={unreads === 0}
                      >
                        <Avatar 
                          className={classes.avatar}
                          src={getChatAvatarUrl(chat)}
                        >
                          {chat.users?.length > 2 ? (
                            <GroupIcon />
                          ) : (
                            !getChatAvatarUrl(chat) && getChatInitials(chat)
                          )}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={getPrimaryText(chat)}
                      secondary={getSecondaryText(chat)}
                    />
                    {chat.ownerId === user.id && (
                      <ListItemSecondaryAction>
                        <Tooltip title="Editar">
                          <IconButton
                            onClick={() => {
                              goToMessages(chat).then(() => {
                                handleEditChat(chat);
                              });
                            }}
                            edge="end"
                            size="small"
                            style={{ marginRight: 5 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            onClick={() => {
                              setSelectedChat(chat);
                              setConfirmModalOpen(true);
                            }}
                            edge="end"
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                );
              })}
          </List>
        </div>
      </div>
    </>
  );
}
