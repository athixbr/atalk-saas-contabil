import React, { useState, useRef, useEffect } from "react";
import {
  makeStyles,
  Fab,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Box,
  Chip,
  Fade,
  Zoom,
} from "@material-ui/core";
import {
  ChatBubble,
  Close,
  Send,
  Minimize,
  MenuBook,
  Help,
  Settings,
  Dashboard,
} from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  fabButton: {
    position: "fixed",
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    zIndex: 9999,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    boxShadow: "0 8px 16px rgba(102, 126, 234, 0.4)",
    "&:hover": {
      background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
      transform: "scale(1.05)",
    },
  },
  chatContainer: {
    position: "fixed",
    bottom: theme.spacing(12),
    right: theme.spacing(3),
    width: 380,
    height: 550,
    zIndex: 9998,
    display: "flex",
    flexDirection: "column",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 12px 48px rgba(0, 0, 0, 0.3)",
  },
  chatHeader: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chatHeaderInfo: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  avatarBot: {
    background: "#fff",
    color: "#667eea",
    width: 40,
    height: 40,
  },
  chatBody: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "auto",
    backgroundColor: "#f5f5f5",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  messageContainer: {
    display: "flex",
    gap: theme.spacing(1),
    alignItems: "flex-start",
  },
  messageContainerUser: {
    flexDirection: "row-reverse",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: theme.spacing(1.5),
    borderRadius: "12px",
    wordBreak: "break-word",
  },
  messageBubbleBot: {
    backgroundColor: "#fff",
    color: theme.palette.text.primary,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  messageBubbleUser: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
  },
  quickActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  quickActionChip: {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.primary.light,
      color: "#fff",
    },
  },
  chatFooter: {
    padding: theme.spacing(2),
    backgroundColor: "#fff",
    borderTop: `1px solid ${theme.palette.divider}`,
    display: "flex",
    gap: theme.spacing(1),
    alignItems: "center",
  },
  inputField: {
    flex: 1,
  },
  sendButton: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    "&:hover": {
      background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
    },
  },
  typingIndicator: {
    display: "flex",
    gap: theme.spacing(0.5),
    padding: theme.spacing(1),
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "#667eea",
    animation: "$typing 1.4s infinite",
    "&:nth-child(2)": {
      animationDelay: "0.2s",
    },
    "&:nth-child(3)": {
      animationDelay: "0.4s",
    },
  },
  "@keyframes typing": {
    "0%, 60%, 100%": {
      transform: "translateY(0)",
      opacity: 0.7,
    },
    "30%": {
      transform: "translateY(-10px)",
      opacity: 1,
    },
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#f5576c",
    color: "#fff",
    borderRadius: "50%",
    width: 24,
    height: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 600,
  },
}));

const AIAssistant = () => {
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(true);
  const messagesEndRef = useRef(null);

  const quickActions = [
    { icon: <MenuBook />, label: "Base de Conhecimento", action: "knowledge" },
    { icon: <Help />, label: "Como criar tarefa?", action: "create_task" },
    { icon: <Dashboard />, label: "Visão Geral", action: "overview" },
    { icon: <Settings />, label: "Configurações", action: "settings" },
  ];

  const mockResponses = {
    knowledge: "📚 A Base de Conhecimento está disponível no menu lateral. Lá você encontra tutoriais, dicas e soluções para problemas comuns. Posso te ajudar a encontrar algo específico?",
    create_task: "✅ Para criar uma tarefa:\n1. Acesse o menu 'Tarefas'\n2. Clique em 'Nova Tarefa'\n3. Preencha os campos obrigatórios\n4. Defina prazo e responsável\n5. Clique em 'Salvar'",
    overview: "📊 Você pode acessar a visão geral no Dashboard principal. Lá você encontra estatísticas de tickets, tarefas pendentes e indicadores importantes.",
    settings: "⚙️ As configurações do sistema estão no menu 'Configurações'. Você pode ajustar preferências, integrações e parâmetros do sistema.",
    default: "Obrigado pela sua mensagem! Este é um protótipo do assistente AI. Em breve estarei totalmente funcional para te ajudar com suas dúvidas. 🤖",
  };

  useEffect(() => {
    if (messages.length === 0) {
      // Mensagem de boas-vindas automática
      setTimeout(() => {
        setMessages([
          {
            id: 1,
            text: "👋 Olá! Sou o assistente virtual do sistema. Como posso te ajudar hoje?",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      }, 500);
    }
  }, [messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessage(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simular resposta do bot
    setTimeout(() => {
      setIsTyping(false);
      const botResponse = {
        id: Date.now() + 1,
        text: mockResponses.default,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1500);
  };

  const handleQuickAction = (action) => {
    const actionMessage = {
      id: Date.now(),
      text: quickActions.find((a) => a.action === action)?.label || "",
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, actionMessage]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const botResponse = {
        id: Date.now() + 1,
        text: mockResponses[action] || mockResponses.default,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Botão Flutuante */}
      <Zoom in={!isOpen}>
        <Fab
          className={classes.fabButton}
          onClick={handleToggleChat}
          aria-label="assistente ai"
        >
          <ChatBubble fontSize="large" />
          {hasNewMessage && !isOpen && (
            <span className={classes.badge}>1</span>
          )}
        </Fab>
      </Zoom>

      {/* Chat Container */}
      <Fade in={isOpen}>
        <Paper className={classes.chatContainer} elevation={8}>
          {/* Header */}
          <div className={classes.chatHeader}>
            <div className={classes.chatHeaderInfo}>
              <Avatar className={classes.avatarBot}>
                <ChatBubble />
              </Avatar>
              <div>
                <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                  Assistente AI
                </Typography>
                <Typography variant="caption" style={{ opacity: 0.9 }}>
                  Online • Modo teste
                </Typography>
              </div>
            </div>
            <div>
              <IconButton size="small" style={{ color: "#fff" }}>
                <Minimize />
              </IconButton>
              <IconButton
                size="small"
                style={{ color: "#fff" }}
                onClick={handleToggleChat}
              >
                <Close />
              </IconButton>
            </div>
          </div>

          {/* Body */}
          <div className={classes.chatBody}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${classes.messageContainer} ${
                  message.sender === "user"
                    ? classes.messageContainerUser
                    : ""
                }`}
              >
                {message.sender === "bot" && (
                  <Avatar className={classes.avatarBot} style={{ width: 32, height: 32 }}>
                    <ChatBubble fontSize="small" />
                  </Avatar>
                )}
                <div
                  className={`${classes.messageBubble} ${
                    message.sender === "bot"
                      ? classes.messageBubbleBot
                      : classes.messageBubbleUser
                  }`}
                >
                  <Typography variant="body2" style={{ whiteSpace: "pre-wrap" }}>
                    {message.text}
                  </Typography>
                  <Typography
                    variant="caption"
                    style={{
                      opacity: 0.7,
                      fontSize: "10px",
                      marginTop: 4,
                      display: "block",
                    }}
                  >
                    {message.timestamp.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </div>
              </div>
            ))}

            {/* Quick Actions - Mostrar apenas na primeira mensagem */}
            {messages.length === 1 && (
              <Box>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  style={{ marginBottom: 8, display: "block" }}
                >
                  Atalhos rápidos:
                </Typography>
                <div className={classes.quickActions}>
                  {quickActions.map((action, index) => (
                    <Chip
                      key={index}
                      icon={action.icon}
                      label={action.label}
                      size="small"
                      className={classes.quickActionChip}
                      onClick={() => handleQuickAction(action.action)}
                    />
                  ))}
                </div>
              </Box>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className={classes.messageContainer}>
                <Avatar className={classes.avatarBot} style={{ width: 32, height: 32 }}>
                  <ChatBubble fontSize="small" />
                </Avatar>
                <div className={`${classes.messageBubble} ${classes.messageBubbleBot}`}>
                  <div className={classes.typingIndicator}>
                    <span className={classes.typingDot} />
                    <span className={classes.typingDot} />
                    <span className={classes.typingDot} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div className={classes.chatFooter}>
            <TextField
              className={classes.inputField}
              placeholder="Digite sua mensagem..."
              variant="outlined"
              size="small"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              multiline
              maxRows={3}
            />
            <IconButton
              className={classes.sendButton}
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
            >
              <Send />
            </IconButton>
          </div>
        </Paper>
      </Fade>
    </>
  );
};

export default AIAssistant;
