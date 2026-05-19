import {
  Avatar,
  Badge,
  Collapse,
  List,
  makeStyles,
  useTheme,
  withStyles,
} from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import DashboardOutlinedIcon from "@material-ui/icons/DashboardOutlined";
import AccessTime from "@material-ui/icons/AccessTime";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {
  default as React,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { Link as RouterLink, useHistory, useLocation } from "react-router-dom";
import styled from "styled-components";
import { getBackendUrl } from "../config";
import useHelps from "../hooks/useHelps";

import { useActiveMenu } from "../context/ActiveMenuContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";

import { Can } from "../components/Can";

import { useMediaQuery } from "@material-ui/core";
import {
  ArrowSquare,
  ArrowSwapHorizontal,
  Buliding,
  Calendar,
  CalendarEdit,
  CodeCircle,
  DocumentText,
  Flash,
  Grid1,
  Hierarchy,
  HierarchySquare3,
  HomeTrendUp,
  Information,
  Kanban,
  KeyboardOpen,
  Link21,
  Logout,
  MessageFavorite,
  Messages1,
  MoneySend,
  Notepad2,
  Notification1,
  Paperclip,
  People,
  Profile2User,
  Setting,
  Setting2,
  Setting3,
  Tag,
  TaskSquare,
  UserAdd,
  VolumeHigh,
  VolumeUp,
  Whatsapp,
  Story,
} from "iconsax-react";
import { isArray } from "lodash";
import toastError from "../errors/toastError";
import usePlans from "../hooks/usePlans";
import ColorModeContext from "../layout/themeContext";
import api from "../services/api";
import { socketConnection } from "../services/socket";
import { i18n } from "../translate/i18n";

const useStyles = makeStyles((theme) => ({
  listItem: {
    height: "40px",
    width: "auto",
    borderRadius: "10px",
    paddingTop: "4px",
    paddingBottom: "4px",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
    },
  },
  listSubheader: {
    color: "#25b6e8",
    fontSize: "0.68rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    padding: "14px 16px 4px 16px",
    backgroundColor: "transparent",
  },
  listItemText: {
    fontSize: "13px",
    fontWeight: 500,
    color: "#000",
    fontFamily: "Inter, sans-serif",
    transition: "all 0.2s",
    "&:hover": {
      color: "#999",
    },
  },
  iconHoverActive: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "10px",
    height: 30,
    width: 30,
    minWidth: 30,
    transition: "all 0.2s ease",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    color: "#000",
    "&:hover, &.active": {
      backgroundColor: "#065183",
      color: "#FFF",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(37, 182, 232, 0.2)",
    },
    "& svg": {
      fontSize: "1.1rem",
      transition: "all 0.2s",
    },
  },
  collapseContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    margin: "0 8px",
    borderRadius: "12px",
    overflow: "hidden",
  },
  badge: {
    "& .MuiBadge-badge": {
      backgroundColor: "#ef5350",
      color: "#fff",
      boxShadow: "0 0 0 2px rgb(9, 11, 17)",
      "&::after": {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        animation: "$ripple 1.2s infinite ease-in-out",
        border: "1px solid #ef5350",
        content: '""',
      },
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
  menuContainer: {
    backgroundColor: "#FFF",
    height: "100%",
    position: "relative",
    overflowX: "hidden",
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: "6px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: "3px",
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "transparent",
    },
  },
  expandIcon: {
    color: "rgba(255, 255, 255, 0.7)",
    transition: "all 0.2s",
    "&.open": {
      transform: "rotate(180deg)",
      color: "#25b6e8",
    },
  },
  submenuItem: {
    paddingLeft: theme.spacing(2),
    "&:hover": {
      backgroundColor: "#FFF",
    },
  },
  versionText: {
    fontSize: "12px",
    padding: "16px",
    textAlign: "center",
    fontWeight: 500,
    color: "rgba(255, 255, 255, 0.5)",
    letterSpacing: "0.5px",
  },
}));

const StyledBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
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
}))(Badge);

const MenuButton = styled.div`
  color: white;
  display: flex;
  justify-content: end;
  align-items: center;
  width: "40px";

  border-radius: 50px;
  background-color: transparent;
  padding: 8px;
  cursor: pointer;
  &:hover {
    background-color: #24272c;
  }
`;

const Theme = styled.div`
  width: 35px;
  height: 35px;
  border-radius: 20px;
  margin-left: 28px;
  &:hover {
    background-color: #24272c;
  }
`;

function ListItemLink(props) {
  const { icon, primary, to, tooltip, showBadge } = props;
  const classes = useStyles();
  const { activeMenu } = useActiveMenu();
  const location = useLocation();
  const isActive = activeMenu === to || location.pathname === to;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  const ConditionalTooltip = ({ children, tooltipEnabled }) =>
    tooltipEnabled ? (
      <Tooltip title={primary} placement="right">
        {children}
      </Tooltip>
    ) : (
      children
    );

  return (
    <ConditionalTooltip tooltipEnabled={!!tooltip}>
      <li>
        <ListItem button component={renderLink} className={classes.listItem}>
          {icon ? (
            <ListItemIcon>
              {showBadge ? (
                <Badge
                  badgeContent="!"
                  color="error"
                  overlap="circular"
                  className={classes.badge}
                >
                  <Avatar
                    className={`${classes.iconHoverActive} ${
                      isActive ? "active" : ""
                    }`}
                  >
                    {icon}
                  </Avatar>
                </Badge>
              ) : (
                <Avatar
                  className={`${classes.iconHoverActive} ${
                    isActive ? "active" : ""
                  }`}
                >
                  {icon}
                </Avatar>
              )}
            </ListItemIcon>
          ) : null}
          <ListItemText
            primary={
              <Typography className={classes.listItemText}>
                {primary}
              </Typography>
            }
          />
        </ListItem>
      </li>
    </ConditionalTooltip>
  );
}

const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }

    return [...state, ...newChats];
  }

  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);

    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }

  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;

    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

const MainListItems = (props, { collapsed }) => {
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user } = useContext(AuthContext);

  const [connectionWarning, setConnectionWarning] = useState(false);
  
  // Estados de submenu atualizados
  const [openDashboardSubmenu, setOpenDashboardSubmenu] = useState(false);
  const [openWhatsappSubmenu, setOpenWhatsappSubmenu] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [openGruposSubmenu, setOpenGruposSubmenu] = useState(false);
  const [openOperacionalSubmenu, setOpenOperacionalSubmenu] = useState(false);
  const [openCrmMenuSubmenu, setOpenCrmMenuSubmenu] = useState(false);
  const [openRecursosMenuSubmenu, setOpenRecursosMenuSubmenu] = useState(false);
  const [openConfigSubmenu, setOpenConfigSubmenu] = useState(false);
  const [openUsuariosSubmenu, setOpenUsuariosSubmenu] = useState(false);
  const [openSistemaSubmenu, setOpenSistemaSubmenu] = useState(false);
  const [openGestaoTarefasSubmenu, setOpenGestaoTarefasSubmenu] = useState(false);
  const [openControlesSubmenu, setOpenControlesSubmenu] = useState(false);
  const [openConfigClienteSubmenu, setOpenConfigClienteSubmenu] = useState(false);

  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const backendUrl = getBackendUrl();
  const [showSchedules, setShowSchedules] = useState(false);
  const { handleLogout } = useContext(AuthContext);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const history = useHistory();
  const classes = useStyles();
  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const [profileUrl, setProfileUrl] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const { getPlanCompany } = usePlans();

  const { colorMode } = useContext(ColorModeContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const toggleColorMode = () => {
    colorMode.toggleColorMode();
  };

  const { socket } = useContext(AuthContext);
  const { setActiveMenu } = useActiveMenu();
  const location = useLocation();
  const theme = useTheme();

  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const greaterThenSm = useMediaQuery(theme.breakpoints.up("md"));

  const [showExternalApi, setShowExternalApi] = useState(false);

  const [version, setVersion] = useState(false);
  
  // Estados de hover atualizados
  const [dashboardHover, setDashboardHover] = useState(false);
  const [whatsappHover, setWhatsappHover] = useState(false);
  const [campaignHover, setCampaignHover] = useState(false);
  const [gruposHover, setGruposHover] = useState(false);
  const [operacionalHover, setOperacionalHover] = useState(false);
  const [crmMenuHover, setCrmMenuHover] = useState(false);
  const [recursosMenuHover, setRecursosMenuHover] = useState(false);
  const [configHover, setConfigHover] = useState(false);
  const [usuariosHover, setUsuariosHover] = useState(false);
  const [sistemaHover, setSistemaHover] = useState(false);
  const [gestaoTarefasHover, setGestaoTarefasHover] = useState(false);
  const [controlesHover, setControlesHover] = useState(false);
  
  const { list } = useHelps();
  const [hasHelps, setHasHelps] = useState(false);
  
  useEffect(() => {
    setIsAdmin(user.profile === "admin");
  }, [user]);

  useEffect(() => {
    async function checkHelps() {
      const helps = await list();
      setHasHelps(helps.length > 0);
    }
    checkHelps();
  }, []);

  useEffect(() => {
    const companyId = user.companyId;
    const userId = user.id;

    const socket = socketConnection({ companyId, userId: user.id });
    if (!socket) {
      return () => {};
    }
    const ImageUrl = user.profileImage;

    if (ImageUrl !== undefined && ImageUrl !== null)
      setProfileUrl(
        `${backendUrl}/public/company${companyId}/user/${ImageUrl}`
      );
    else setProfileUrl(`${process.env.FRONTEND_URL}/nopicture.png`);

    socket.on(`company-${companyId}-auth`, (data) => {
      if (data.user.id === +userId) {
        toastError("Sua conta foi acessada em outro computador.");
        setTimeout(() => {
          localStorage.clear();
          window.location.reload();
        }, 1000);
      }
    });

    socket.emit("userStatus");
    const interval = setInterval(() => {
      socket.emit("userStatus");
    }, 1000 * 60 * 5);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      setShowCampaigns(planConfigs.plan.useCampaigns);
      setShowGroups(planConfigs.plan.useGroups || true);
      setShowKanban(planConfigs.plan.useKanban);
      setShowOpenAi(planConfigs.plan.useOpenAi);
      setShowIntegrations(planConfigs.plan.useIntegrations);
      setShowSchedules(planConfigs.plan.useSchedules);
      setShowInternalChat(planConfigs.plan.useInternalChat);
      setShowExternalApi(planConfigs.plan.useExternalApi);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = user.companyId;
    const socket = socketConnection({ companyId, userId: user.id });
    if (!socket) {
      return () => {};
    }
    socket.on(`company-${companyId}-chat`, (data) => {
      if (data.action === "new-message") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
      if (data.action === "update") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    if (unreadsCount > 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  }, [chats, user.id]);

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    handleCloseMenu();
  };

  const handleClickLogout = () => {
    if (theme.mode === "dark") toggleColorMode();
    handleCloseMenu();
    handleLogout();
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  // Lógica simplificada de rotas ativas
  const isDashboardRouteActive =
    location.pathname === "/" ||
    location.pathname.startsWith("/reports") ||
    location.pathname.startsWith("/moments");

  const isCampaignRouteActive =
    location.pathname === "/campaigns" ||
    location.pathname.startsWith("/contact-lists") ||
    location.pathname.startsWith("/campaigns-config");

  const isWhatsappRouteActive =
    location.pathname === "/tickets" ||
    location.pathname === "/contacts" ||
    location.pathname === "/connections" ||
    isCampaignRouteActive ||
    location.pathname.startsWith("/grupos");

  const isOperacionalRouteActive =
    location.pathname.startsWith("/tarefas") ||
    location.pathname.startsWith("/crm") ||
    location.pathname.startsWith("/clientes") ||
    location.pathname.startsWith("/socios") ||
    location.pathname.startsWith("/certidoes") ||
    location.pathname.startsWith("/cobranca");

  const isConfigRouteActive =
    location.pathname.startsWith("/settings") ||
    location.pathname.startsWith("/users") ||
    location.pathname.startsWith("/departamentos") ||
    location.pathname.startsWith("/queues") ||
    location.pathname.startsWith("/prompts") ||
    location.pathname.startsWith("/queue-integration") ||
    location.pathname.startsWith("/messages-api") ||
    location.pathname.startsWith("/plantao") ||
    location.pathname.startsWith("/files") ||
    location.pathname.startsWith("/painel-tarefas") ||
    location.pathname.startsWith("/central-atividades") ||
    location.pathname.startsWith("/central-vinculos") ||
    location.pathname.startsWith("/controles") ||
    location.pathname.startsWith("/tarefas-config") ||
    location.pathname.startsWith("/tarefas-recorrentes") ||
    location.pathname.startsWith("/tarefas-geradas") ||
    location.pathname.startsWith("/recorrencia") ||
    location.pathname.startsWith("/parcelamentos") ||
    location.pathname.startsWith("/tipo-servico") ||
    location.pathname.startsWith("/parametros") ||
    location.pathname.startsWith("/financeiro");

  return (
    <div onClick={props.drawerClose}>
      {/* ====================================== */}
      {/* 📊 SEÇÃO 1: GESTÃO (Admin/Manager only) */}
      {/* ====================================== */}
      <Can
        role={
          (user.profile === "user" && user.showDashboard === "enabled") ||
          user.allowRealTime === "enabled"
            ? "admin"
            : user.profile
        }
        perform={"drawer-admin-items:view"}
        yes={() => (
          <>
            <ListSubheader className={classes.listSubheader}>
              GESTÃO
            </ListSubheader>
            
            <Tooltip
              title={collapsed ? "Dashboard & Relatórios" : ""}
              placement="right"
            >
              <ListItem
                dense
                button
                onClick={() => setOpenDashboardSubmenu((prev) => !prev)}
                onMouseEnter={() => setDashboardHover(true)}
                onMouseLeave={() => setDashboardHover(false)}
              >
                <ListItemIcon>
                  <Avatar
                    className={`${classes.iconHoverActive} ${
                      isDashboardRouteActive || dashboardHover ? "active" : ""
                    }`}
                  >
                    <HomeTrendUp />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography className={classes.listItemText}>
                      Dashboard & Relatórios
                    </Typography>
                  }
                />
                {openDashboardSubmenu ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItem>
            </Tooltip>
            
            <Collapse
              in={openDashboardSubmenu}
              timeout="auto"
              unmountOnExit
              style={{
                backgroundColor:
                  theme.mode === "light"
                    ? "rgba(120,120,120,0.1)"
                    : "rgba(120,120,120,0.5)",
              }}
            >
              <Can
                role={
                  user.profile === "user" && user.showDashboard === "enabled"
                    ? "admin"
                    : user.profile
                }
                perform={"drawer-admin-items:view"}
                yes={() => (
                  <>
                    <ListItemLink
                      small
                      to="/"
                      primary="Dashboard"
                      icon={<DashboardOutlinedIcon />}
                      tooltip={collapsed}
                    />
                    <ListItemLink
                      small
                      to="/reports"
                      primary={i18n.t("mainDrawer.listItems.reports")}
                      icon={<Notepad2 />}
                      tooltip={collapsed}
                    />
                    <ListItemLink
                      small
                      to="/reports/tickets/time-analysis"
                      primary="Análise de Tempo"
                      icon={<AccessTime />}
                      tooltip={collapsed}
                    />
                    <ListItemLink
                      small
                      to="/reports/users/performance"
                      primary="Performance"
                      icon={<People />}
                      tooltip={collapsed}
                    />
                  </>
                )}
              />
              <Can
                role={
                  user.profile === "user" && user.allowRealTime === "enabled"
                    ? "admin"
                    : user.profile
                }
                perform={"drawer-admin-items:view"}
                yes={() => (
                  <ListItemLink
                    to="/moments"
                    primary="Tempo Real"
                    icon={<Grid1 />}
                    tooltip={collapsed}
                  />
                )}
              />
            </Collapse>
          </>
        )}
      />

      <Divider />

      {/* ====================================== */}
      {/* SEÇÃO 2: WHATSAPP (All users) */}
      {/* ====================================== */}
      <ListSubheader className={classes.listSubheader}>
        WHATSAPP
      </ListSubheader>

      <ListItemLink
        to="/tickets"
        primary={i18n.t("mainDrawer.listItems.tickets")}
        icon={<Whatsapp />}
        tooltip={collapsed}
      />

      <ListItemLink
        to="/contacts"
        primary={i18n.t("mainDrawer.listItems.contacts")}
        icon={<UserAdd />}
        tooltip={collapsed}
      />

      <Can
        role={
          user.profile === "user" && user.allowConnections === "enabled"
            ? "admin"
            : user.profile
        }
        perform="dashboard:view"
        yes={() => (
          <ListItemLink
            to="/connections"
            primary={i18n.t("mainDrawer.listItems.connections")}
            icon={<ArrowSwapHorizontal />}
            showBadge={connectionWarning}
            tooltip={collapsed}
          />
        )}
      />

      {/* SUBMENU CAMPANHAS */}
      {showCampaigns && (
        <Can
          role={user.profile}
          perform="dashboard:view"
          yes={() => (
            <>
              <Tooltip
                title={
                  collapsed
                    ? i18n.t("mainDrawer.listItems.campaigns")
                    : ""
                }
                placement="right"
              >
                <ListItem
                  dense
                  button
                  onClick={() => setOpenCampaignSubmenu((prev) => !prev)}
                  onMouseEnter={() => setCampaignHover(true)}
                  onMouseLeave={() => setCampaignHover(false)}
                >
                  <ListItemIcon>
                    <Avatar
                      className={`${classes.iconHoverActive} ${
                        isCampaignRouteActive || campaignHover
                          ? "active"
                          : ""
                      }`}
                    >
                      <VolumeHigh />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography className={classes.listItemText}>
                        {i18n.t("mainDrawer.listItems.campaigns")}
                      </Typography>
                    }
                  />
                  {openCampaignSubmenu ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </ListItem>
              </Tooltip>
              <Collapse
                in={openCampaignSubmenu}
                timeout="auto"
                unmountOnExit
                style={{
                  backgroundColor:
                    theme.mode === "light"
                      ? "rgba(120,120,120,0.1)"
                      : "rgba(120,120,120,0.5)",
                }}
              >
                <List dense component="div" disablePadding>
                  <ListItemLink
                    to="/campaigns"
                    primary="Envios"
                    icon={<VolumeUp />}
                    tooltip={collapsed}
                  />
                  <ListItemLink
                    to="/contact-lists"
                    primary="Listas de Contatos"
                    icon={<Profile2User />}
                    tooltip={collapsed}
                  />
                  <ListItemLink
                    to="/campaigns-config"
                    primary="Configurações"
                    icon={<Setting2 />}
                    tooltip={collapsed}
                  />
                </List>
              </Collapse>
            </>
          )}
        />
      )}

      {/* SUBMENU GRUPOS */}
      {showGroups && (
        <Can
          role={user.profile}
          perform="dashboard:view"
          yes={() => (
            <>
              <Tooltip
                title={collapsed ? "Grupos" : ""}
                placement="right"
              >
                <ListItem
                  dense
                  button
                  onClick={() => setOpenGruposSubmenu((prev) => !prev)}
                  onMouseEnter={() => setGruposHover(true)}
                  onMouseLeave={() => setGruposHover(false)}
                >
                  <ListItemIcon>
                    <Avatar
                      className={`${classes.iconHoverActive} ${
                        location.pathname.startsWith("/grupos") || gruposHover
                          ? "active"
                          : ""
                      }`}
                    >
                      <People />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography className={classes.listItemText}>
                        Grupos
                      </Typography>
                    }
                  />
                  {openGruposSubmenu ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </ListItem>
              </Tooltip>
              <Collapse
                in={openGruposSubmenu}
                timeout="auto"
                unmountOnExit
                style={{
                  backgroundColor:
                    theme.mode === "light"
                      ? "rgba(120,120,120,0.1)"
                      : "rgba(120,120,120,0.5)",
                }}
              >
                <List dense component="div" disablePadding>
                  <ListItemLink
                    to="/grupos"
                    primary="Campanhas de Grupos"
                    icon={<VolumeUp />}
                    tooltip={collapsed}
                  />
                  <ListItemLink
                    to="/grupos/lista"
                    primary="Lista de Grupos"
                    icon={<People />}
                    tooltip={collapsed}
                  />
                  <ListItemLink
                    to="/grupos/config"
                    primary="Configurações"
                    icon={<Setting2 />}
                    tooltip={collapsed}
                  />
                  <Can
                    role={user.profile}
                    perform="drawer-admin-items:view"
                    yes={() => (
                      <ListItemLink
                        to="/whatsapp-stories"
                        primary="Story"
                        icon={<Story />}
                        tooltip={collapsed}
                      />
                    )}
                  />
                </List>
              </Collapse>
            </>
          )}
        />
      )}

      {/* Tags, Respostas Rápidas e Agendamentos - Ferramentas WhatsApp */}
      <ListItemLink
        to="/tags"
        primary={i18n.t("mainDrawer.listItems.tags")}
        icon={<Tag />}
        tooltip={collapsed}
      />

      <ListItemLink
        to="/quick-messages"
        primary={i18n.t("mainDrawer.listItems.quickMessages")}
        icon={<Flash />}
        tooltip={collapsed}
      />

      {showSchedules && (
        <ListItemLink
          to="/schedules"
          primary={i18n.t("mainDrawer.listItems.schedules")}
          icon={<Calendar />}
          tooltip={collapsed}
        />
      )}

      <Divider />

      {/* ====================================== */}
      {/* SEÇÃO 3: OPERACIONAL (All users) */}
      {/* ====================================== */}
      <ListSubheader className={classes.listSubheader}>
        OPERACIONAL
      </ListSubheader>

      {/* TAREFAS - Menu único para todas as tarefas */}
      <ListItemLink
        to="/tarefas"
        primary="Tarefas"
        icon={<TaskSquare />}
        tooltip={collapsed}
      />

      {/* SUBMENU CRM */}
      <Tooltip
        title={collapsed ? "CRM" : ""}
        placement="right"
      >
        <ListItem
          dense
          button
          onClick={() => setOpenCrmMenuSubmenu((prev) => !prev)}
          onMouseEnter={() => setCrmMenuHover(true)}
          onMouseLeave={() => setCrmMenuHover(false)}
        >
          <ListItemIcon>
            <Avatar
              className={`${classes.iconHoverActive} ${
                location.pathname.startsWith("/crm") || crmMenuHover
                  ? "active"
                  : ""
              }`}
            >
              <Profile2User />
            </Avatar>
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography className={classes.listItemText}>
                CRM
              </Typography>
            }
          />
          {openCrmMenuSubmenu ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItem>
      </Tooltip>

      <Collapse
        in={openCrmMenuSubmenu}
        timeout="auto"
        unmountOnExit
        style={{
          backgroundColor:
            theme.mode === "light"
              ? "rgba(120,120,120,0.1)"
              : "rgba(120,120,120,0.5)",
        }}
      >
        <List component="div" disablePadding>
          <ListItemLink
            dense
            to="/crm"
            primary="Leads"
            icon={<Kanban />}
            tooltip={collapsed}
          />
          <ListItemLink
            dense
            to="/crm/tarefas"
            primary="Tarefas CRM"
            icon={<TaskSquare />}
            tooltip={collapsed}
          />
          <ListItemLink
            dense
            to="/crm/tarefas/pipeline"
            primary="Pipeline"
            icon={<TaskSquare />}
            tooltip={collapsed}
          />
        </List>
      </Collapse>

      {/* GERENCIADOR DE ARQUIVOS (GED) */}
      <ListItemLink
        to="/files"
        primary="Gerenciador de Arquivos"
        icon={<Paperclip />}
        tooltip={collapsed}
      />

      <ListItemLink
        to="/clientes"
        primary="Clientes"
        icon={<Profile2User />}
        tooltip={collapsed}
      />

      <ListItemLink
        to="/socios"
        primary="Sócios"
        icon={<Profile2User />}
        tooltip={collapsed}
      />

      <ListItemLink
        to="/certidoes"
        primary="Certidões"
        icon={<DocumentText />}
        tooltip={collapsed}
      />

      <ListItemLink
        to="/cobranca"
        primary="Cobrança"
        icon={<MoneySend />}
        tooltip={collapsed}
      />

      <Divider />

      {/* ====================================== */}
      {/* SEÇÃO 4: CENTRAL DE SUPORTE (All users) */}
      {/* ====================================== */}
      <ListSubheader className={classes.listSubheader}>
        CENTRAL DE SUPORTE
      </ListSubheader>

      {showInternalChat && (
        <ListItemLink
          to="/chats"
          primary={i18n.t("mainDrawer.listItems.chats")}
          icon={
            <Badge color="secondary" variant="dot" invisible={invisible}>
              <MessageFavorite />
            </Badge>
          }
          tooltip={collapsed}
        />
      )}

      <ListItemLink
        to="/base-conhecimento"
        primary="Base de Conhecimento"
        icon={<DocumentText />}
        tooltip={collapsed}
      />

      <ListItemLink
        to="/helps"
        primary="Central de Ajuda"
        icon={<CalendarEdit />}
        tooltip={collapsed}
      />

      {/* ====================================== */}
      {/* SEÇÃO 5: FERRAMENTAS EXTERNAS (All users) */}
      {/* ====================================== */}
      <ListSubheader className={classes.listSubheader}>
        FERRAMENTAS EXTERNAS
      </ListSubheader>

      {/* SUBMENU FERRAMENTAS EXTERNAS */}
      <ListItem
        dense
        button
        component={RouterLink}
        to="/xml-nfe"
      >
        <ListItemIcon>
          <Tooltip title={collapsed ? "XML NF-e" : ""} placement="right">
            <Avatar className={classes.iconHoverActive}>
              <Link21 />
            </Avatar>
          </Tooltip>
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography className={classes.listItemText}>
              XML NF-e
            </Typography>
          }
        />
      </ListItem>

      <ListItem
        dense
        button
        component="a"
        href="https://sped.contco.com.br"
        target="_blank"
        rel="noopener noreferrer"
      >
        <ListItemIcon>
          <Tooltip title={collapsed ? "SPED" : ""} placement="right">
            <Avatar className={classes.iconHoverActive}>
              <Link21 />
            </Avatar>
          </Tooltip>
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography className={classes.listItemText}>
              SPED
            </Typography>
          }
        />
      </ListItem>

      <ListItem
        dense
        button
        component="a"
        href="https://xml.contco.com.br"
        target="_blank"
        rel="noopener noreferrer"
      >
        <ListItemIcon>
          <Tooltip title={collapsed ? "XML Cartório" : ""} placement="right">
            <Avatar className={classes.iconHoverActive}>
              <Link21 />
            </Avatar>
          </Tooltip>
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography className={classes.listItemText}>
              XML Cartório
            </Typography>
          }
        />
      </ListItem>

      {/* ====================================== */}
      {/* SEÇÃO 6: CONFIGURAÇÕES (Admin only) */}
      {/* ====================================== */}
      <Can
        role={user.profile}
        perform="dashboard:view"
        yes={() => (
          <>
            <Divider />
            <ListSubheader className={classes.listSubheader}>
              CONFIGURAÇÕES
            </ListSubheader>

            {/* SUBMENU USUÁRIOS & DEPARTAMENTOS */}
            <Tooltip
              title={collapsed ? "Usuários & Departamentos" : ""}
              placement="right"
            >
              <ListItem
                dense
                button
                onClick={() => setOpenUsuariosSubmenu((prev) => !prev)}
                onMouseEnter={() => setUsuariosHover(true)}
                onMouseLeave={() => setUsuariosHover(false)}
              >
                <ListItemIcon>
                  <Avatar
                    className={`${classes.iconHoverActive} ${
                      (location.pathname === "/users" ||
                        location.pathname === "/departamentos") ||
                      usuariosHover
                        ? "active"
                        : ""
                    }`}
                  >
                    <People />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography className={classes.listItemText}>
                      Usuários & Departamentos
                    </Typography>
                  }
                />
                {openUsuariosSubmenu ? (
                  <ExpandLessIcon />
                ) : (
                  <ExpandMoreIcon />
                )}
              </ListItem>
            </Tooltip>
            <Collapse
              in={openUsuariosSubmenu}
              timeout="auto"
              unmountOnExit
              style={{
                backgroundColor:
                  theme.mode === "light"
                    ? "rgba(120,120,120,0.1)"
                    : "rgba(120,120,120,0.5)",
              }}
            >
              <List dense component="div" disablePadding>
                <ListItemLink
                  to="/users"
                  primary={i18n.t("mainDrawer.listItems.users")}
                  icon={<People />}
                  tooltip={collapsed}
                />
                <ListItemLink
                  to="/departamentos"
                  primary="Departamentos"
                  icon={<Hierarchy />}
                  tooltip={collapsed}
                />
              </List>
            </Collapse>

            {/* SUBMENU SISTEMA */}
            <Tooltip
              title={collapsed ? "Sistema" : ""}
              placement="right"
            >
              <ListItem
                dense
                button
                onClick={() => setOpenSistemaSubmenu((prev) => !prev)}
                onMouseEnter={() => setSistemaHover(true)}
                onMouseLeave={() => setSistemaHover(false)}
              >
                <ListItemIcon>
                  <Avatar
                    className={`${classes.iconHoverActive} ${
                      (location.pathname.startsWith("/settings") ||
                        location.pathname.startsWith("/queues") ||
                        location.pathname.startsWith("/prompts") ||
                        location.pathname.startsWith("/queue-integration") ||
                        location.pathname.startsWith("/messages-api") ||
                        location.pathname.startsWith("/plantao") ||
                        location.pathname.startsWith("/files")) ||
                      sistemaHover
                        ? "active"
                        : ""
                    }`}
                  >
                    <Setting />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography className={classes.listItemText}>
                      Sistema
                    </Typography>
                  }
                />
                {openSistemaSubmenu ? (
                  <ExpandLessIcon />
                ) : (
                  <ExpandMoreIcon />
                )}
              </ListItem>
            </Tooltip>
            <Collapse
              in={openSistemaSubmenu}
              timeout="auto"
              unmountOnExit
              style={{
                backgroundColor:
                  theme.mode === "light"
                    ? "rgba(120,120,120,0.1)"
                    : "rgba(120,120,120,0.5)",
              }}
            >
              <List dense component="div" disablePadding>
                <ListItemLink
                  to="/settings"
                  primary="Configurações Gerais"
                  icon={<Setting />}
                  tooltip={collapsed}
                />
                <ListItemLink
                  to="/queues"
                  primary={i18n.t("mainDrawer.listItems.queues")}
                  icon={<ArrowSquare />}
                  tooltip={collapsed}
                />
                <ListItemLink
                  to="/queue-integration"
                  primary={i18n.t("mainDrawer.listItems.queueIntegration")}
                  icon={<Hierarchy />}
                  tooltip={collapsed}
                />
                {showOpenAi && (
                  <ListItemLink
                    to="/prompts"
                    primary={i18n.t("mainDrawer.listItems.prompts")}
                    icon={<KeyboardOpen />}
                    tooltip={collapsed}
                  />
                )}
                {showExternalApi && (
                  <ListItemLink
                    to="/messages-api"
                    primary={i18n.t("mainDrawer.listItems.messagesAPI")}
                    icon={<CodeCircle />}
                    tooltip={collapsed}
                  />
                )}
                <ListItemLink
                  to="/plantao"
                  primary={i18n.t("mainDrawer.listItems.orderly")}
                  icon={<Notification1 />}
                  tooltip={collapsed}
                />
                <ListItemLink
                  to="/admin-notifications"
                  primary="Avisos para Usuários"
                  icon={<VolumeHigh />}
                  tooltip={collapsed}
                />
              </List>
            </Collapse>

            {/* SUBMENU GESTÃO DE TAREFAS */}
            <Tooltip
              title={collapsed ? "Gestão de Tarefas" : ""}
              placement="right"
            >
              <ListItem
                dense
                button
                onClick={() => setOpenGestaoTarefasSubmenu((prev) => !prev)}
                onMouseEnter={() => setGestaoTarefasHover(true)}
                onMouseLeave={() => setGestaoTarefasHover(false)}
              >
                <ListItemIcon>
                  <Avatar
                    className={`${classes.iconHoverActive} ${
                      (location.pathname.startsWith("/painel-tarefas") ||
                        location.pathname.startsWith("/central-atividades") ||
                        location.pathname.startsWith("/central-vinculos") ||
                        location.pathname.startsWith("/controles") ||
                        location.pathname.startsWith("/tarefas-config") ||
                        location.pathname.startsWith("/tarefas-recorrentes") ||
                        location.pathname.startsWith("/tarefas-geradas") ||
                        location.pathname.startsWith("/recorrencia") ||
                        location.pathname.startsWith("/parcelamentos") ||
                        location.pathname.startsWith("/tipo-servico") ||
                        location.pathname.startsWith("/checklists")) ||
                      gestaoTarefasHover
                        ? "active"
                        : ""
                    }`}
                  >
                    <TaskSquare />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography className={classes.listItemText}>
                      Gestão de Tarefas
                    </Typography>
                  }
                />
                {openGestaoTarefasSubmenu ? (
                  <ExpandLessIcon />
                ) : (
                  <ExpandMoreIcon />
                )}
              </ListItem>
            </Tooltip>
            <Collapse
              in={openGestaoTarefasSubmenu}
              timeout="auto"
              unmountOnExit
              style={{
                backgroundColor:
                  theme.mode === "light"
                    ? "rgba(120,120,120,0.1)"
                    : "rgba(120,120,120,0.5)",
              }}
            >
              <List dense component="div" disablePadding>
                <ListItemLink
                  to="/painel-tarefas"
                  primary="Painel de Tarefas"
                  icon={<TaskSquare />}
                  tooltip={collapsed}
                />
                <ListItemLink
                  to="/central-atividades"
                  primary="Central de Atividades"
                  icon={<Kanban />}
                  tooltip={collapsed}
                />

                {/* SUBMENU CONTROLES (ANINHADO) */}
                <Tooltip
                  title={collapsed ? "Controles" : ""}
                  placement="right"
                >
                  <ListItem
                    dense
                    button
                    onClick={() => setOpenControlesSubmenu((prev) => !prev)}
                    onMouseEnter={() => setControlesHover(true)}
                    onMouseLeave={() => setControlesHover(false)}
                    style={{ paddingLeft: theme.spacing(2) }}
                  >
                    <ListItemIcon>
                      <Avatar
                        className={`${classes.iconHoverActive} ${
                          (location.pathname.startsWith("/central-vinculos") ||
                            location.pathname.startsWith("/controles")) ||
                          controlesHover
                            ? "active"
                            : ""
                        }`}
                        style={{ width: 32, height: 32 }}
                      >
                        <Setting3 />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography className={classes.listItemText}>
                          Controles
                        </Typography>
                      }
                    />
                    {openControlesSubmenu ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItem>
                </Tooltip>

                <Collapse
                  in={openControlesSubmenu}
                  timeout="auto"
                  unmountOnExit
                  style={{
                    backgroundColor:
                      theme.mode === "light"
                        ? "rgba(100,100,100,0.15)"
                        : "rgba(100,100,100,0.6)",
                    paddingLeft: theme.spacing(2),
                  }}
                >
                  <List dense component="div" disablePadding>
                    <ListItemLink
                      dense
                      to="/central-vinculos"
                      primary="Central de Vínculos"
                      icon={<HierarchySquare3 />}
                      tooltip={collapsed}
                    />
                    <ListItemLink
                      dense
                      to="/controles-config"
                      primary="Cadastro Controles"
                      icon={<Setting3 />}
                      tooltip={collapsed}
                    />
                  </List>
                </Collapse>

                <ListItemLink
                  to="/tarefas-config"
                  primary="Cadastro de Tarefas"
                  icon={<TaskSquare />}
                  tooltip={collapsed}
                />
                <ListItemLink
                  to="/recorrencia"
                  primary="Recorrências"
                  icon={<Calendar />}
                  tooltip={collapsed}
                />
                <ListItemLink
                  to="/tarefas-geradas"
                  primary="Tarefas Geradas"
                  icon={<CalendarEdit />}
                  tooltip={collapsed}
                />
                <ListItemLink
                  to="/parcelamentos"
                  primary="Parcelamentos"
                  icon={<MoneySend />}
                  tooltip={collapsed}
                />
              </List>
            </Collapse>

            {/* FINANCEIRO (Plano/Assinatura) */}
            <ListItemLink
              to="/financeiro"
              primary="Financeiro"
              icon={<MoneySend />}
              tooltip={collapsed}
            />

            {/* CONFIGURAÇÕES DO CLIENTE */}
            <Tooltip title={collapsed ? "Configurações do Cliente" : ""} placement="right">
              <ListItem
                button
                onClick={() => setOpenConfigClienteSubmenu((prev) => !prev)}
                style={{
                  paddingLeft: collapsed ? theme.spacing(2.5) : theme.spacing(2),
                  display: 'flex',
                  justifyContent: 'space-between',
                  backgroundColor: openConfigClienteSubmenu
                    ? theme.mode === "light"
                      ? "rgba(0,0,0,0.05)"
                      : "rgba(255,255,255,0.1)"
                    : "transparent",
                }}
              >
                <ListItemIcon style={{ minWidth: "48px" }}>
                  <Setting2 />
                </ListItemIcon>
                <ListItemText
                  primary={
                    !collapsed && (
                      <Typography className={classes.listItemText}>
                        Configurações do Cliente
                      </Typography>
                    )
                  }
                />
                {openConfigClienteSubmenu ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItem>
            </Tooltip>

            <Collapse
              in={openConfigClienteSubmenu}
              timeout="auto"
              unmountOnExit
              style={{
                backgroundColor:
                  theme.mode === "light"
                    ? "rgba(100,100,100,0.15)"
                    : "rgba(100,100,100,0.6)",
                paddingLeft: theme.spacing(2),
              }}
            >
              <List dense component="div" disablePadding>
                <ListItemLink
                  dense
                  to="/parametros"
                  primary="Parâmetros do Sistema"
                  icon={<Setting3 />}
                  tooltip={collapsed}
                />
                <ListItemLink
                  dense
                  to="/modelos-parametros"
                  primary="Modelos de Parâmetros"
                  icon={<DocumentText />}
                  tooltip={collapsed}
                />
              </List>
            </Collapse>

            {/* EMPRESAS (Super Admin only) */}
            {user.super && (
              <ListItemLink
                to="/companies"
                primary={i18n.t("mainDrawer.listItems.companies")}
                icon={<Buliding />}
                tooltip={collapsed}
              />
            )}

            {user.super && (
              <ListItemLink
                to="/announcements"
                primary={i18n.t("mainDrawer.listItems.annoucements")}
                icon={<Information />}
                tooltip={collapsed}
              />
            )}
          </>
        )}
      />

      {/* ====================================== */}
      {/* LOGOUT */}
      {/* ====================================== */}
      <Divider />
      <div onClick={handleClickLogout}>
        <ListItemLink
          to="#"
          primary={i18n.t("mainDrawer.appBar.user.logout")}
          icon={<Logout />}
          tooltip={collapsed}
        />
      </div>
      
      {!collapsed && (
        <React.Fragment>
          {/* Version info can be displayed here if needed */}
        </React.Fragment>
      )}
    </div>
  );
};

export default MainListItems;
