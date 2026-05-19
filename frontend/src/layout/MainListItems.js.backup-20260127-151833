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
} from "iconsax-react";
import { isArray } from "lodash";
import toastError from "../errors/toastError";
import usePlans from "../hooks/usePlans";
import ColorModeContext from "../layout/themeContext";
import api from "../services/api";
import { socketConnection } from "../services/socket";
import { i18n } from "../translate/i18n";
// import logo from "../assets/logo.png";

const useStyles = makeStyles((theme) => ({
  listItem: {
    height: "48px",
    width: "auto",
    borderRadius: "12px",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
    },
  },
  listSubheader: {
    color: "#25b6e8",
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    padding: "24px 16px 8px 16px",
    backgroundColor: "transparent",
  },
  listItemText: {
    fontSize: "14px",
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
    borderRadius: "12px",
    height: 36,
    width: 36,
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
      fontSize: "1.3rem",
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
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [openGruposSubmenu, setOpenGruposSubmenu] = useState(false);
  const [openKanbanSubmenu, setOpenKanbanSubmenu] = useState(false);
  const [openAjustesSubmenu, setOpenAjustesSubmenu] = useState(false);
  const [openRecursosSubmenu, setOpenRecursosSubmenu] = useState(false);
  const [openFerramentasSubmenu, setOpenFerramentasSubmenu] = useState(false);
  const [openRecursosMenuSubmenu, setOpenRecursosMenuSubmenu] = useState(false);
  const [openCrmMenuSubmenu, setOpenCrmMenuSubmenu] = useState(false);
  const [openUsuariosSubmenu, setOpenUsuariosSubmenu] = useState(false);
  const [openRecorrenteSubmenu, setOpenRecorrenteSubmenu] = useState(false);
  const [openControlesSubmenu, setOpenControlesSubmenu] = useState(false);

  const [openAdminSubmenu, setOpenAdminSubmenu] = useState(false); // abre menu admin

  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const backendUrl = getBackendUrl();
  // novas features
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
  const [openFlowSubmenu, setOpenFlowSubmenu] = useState(false);
  const [openDashboardSubmenu, setOpenDashboardSubmenu] = useState(false);

  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const greaterThenSm = useMediaQuery(theme.breakpoints.up("md"));
  // novas features

  const [showExternalApi, setShowExternalApi] = useState(false);

  const [version, setVersion] = useState(false);
  const [managementHover, setManagementHover] = useState(false);
  const [campaignHover, setCampaignHover] = useState(false);
  const [gruposHover, setGruposHover] = useState(false);
  const [ajustesHover, setAjustesHover] = useState(false);
  const [recursosHover, setRecursosHover] = useState(false);
  const [ferramentasHover, setFerramentasHover] = useState(false);
  const [recursosMenuHover, setRecursosMenuHover] = useState(false);
  const [crmMenuHover, setCrmMenuHover] = useState(false);
  const [usuariosHover, setUsuariosHover] = useState(false);
  const [recorrenteHover, setRecorrenteHover] = useState(false);
  const [controlesHover, setControlesHover] = useState(false);
  const [flowHover, setFlowHover] = useState(false);
  const { list } = useHelps(); // INSERIR
  const [hasHelps, setHasHelps] = useState(false);
  useEffect(() => {
    setIsAdmin(user.profile === "admin");
  }, [user]);

  useEffect(() => {
    // INSERIR ESSE EFFECT INTEIRO
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setShowGroups(planConfigs.plan.useGroups || true); // Ativa por padrão
      setShowKanban(planConfigs.plan.useKanban);
      setShowOpenAi(planConfigs.plan.useOpenAi);
      setShowIntegrations(planConfigs.plan.useIntegrations);
      setShowSchedules(planConfigs.plan.useSchedules);
      setShowInternalChat(planConfigs.plan.useInternalChat);
      setShowExternalApi(planConfigs.plan.useExternalApi);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // useEffect(() => {
  //   if (localStorage.getItem("cshow")) {
  //     setShowCampaigns(true);
  //   }
  // }, []);
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
  const isManagementActive =
    location.pathname === "/" ||
    location.pathname.startsWith("/reports") ||
    location.pathname.startsWith("/moments");

  const isCampaignRouteActive =
    location.pathname === "/campaigns" ||
    location.pathname.startsWith("/contact-lists") ||
    location.pathname.startsWith("/campaigns-config");

  const isFlowbuilderRouteActive =
    location.pathname.startsWith("/phrase-lists");
  location.pathname.startsWith("/flowbuilders");

  const isAjustesRouteActive =
    location.pathname === "/settings";

  const isRecursosRouteActive =
    location.pathname === "/queues" ||
    location.pathname === "/prompts" ||
    location.pathname === "/queue-integration" ||
    location.pathname === "/messages-api" ||
    location.pathname === "/plantao" ||
    location.pathname === "/files";

  const isFerramentasRouteActive = false; // Links externos, nunca ativo

  const isRecursosMenuRouteActive =
    location.pathname === "/schedules" ||
    location.pathname === "/tags" ||
    location.pathname === "/quick-messages";

  const isRecorrenteRouteActive =
    location.pathname === "/recorrencia" ||
    location.pathname === "/parcelamentos";

  const isUsuariosRouteActive =
    location.pathname === "/users" ||
    location.pathname === "/departamentos";

  return (
    <div onClick={props.drawerClose}>
      {/* {greaterThenSm && (
        <div
          onClick={() => {
            isHorizontal(true);
            localStorage.setItem("horizontal", "Sim");
          }}
        >
          <ListItemLink
            to="#"
            primary={i18n.t("Menu horizontal")}
            icon={<MenuIcon />}
            tooltip={collapsed}
          />
        </div>
      )} */}

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
            <Tooltip
              title={collapsed ? i18n.t("mainDrawer.listItems.management") : ""}
              placement="right"
            >
              <ListItem
                dense
                button
                onClick={() => setOpenDashboardSubmenu((prev) => !prev)}
                onMouseEnter={() => setManagementHover(true)}
                onMouseLeave={() => setManagementHover(false)}
              >
                <ListItemIcon>
                  <Avatar
                    className={`${classes.iconHoverActive} ${
                      isManagementActive || managementHover ? "active" : ""
                    }`}
                  >
                    <HomeTrendUp />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography className={classes.listItemText}>
                      {i18n.t("mainDrawer.listItems.management")}
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
                      primary="⏱️ Tempo"
                      icon={<AccessTime />}
                      tooltip={collapsed}
                    />
                    <ListItemLink
                      small
                      to="/reports/users/performance"
                      primary="👥 Performance"
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
                    primary={i18n.t("mainDrawer.listItems.chatsTempoReal")}
                    icon={<Grid1 />}
                    tooltip={collapsed}
                  />
                )}
              />
            </Collapse>
          </>
        )}
      />

      <ListItemLink
        to="/tickets"
        primary={i18n.t("mainDrawer.listItems.tickets")}
        icon={<Whatsapp />}
        tooltip={collapsed}
      />
      {/* <ListItemLink
        to="/NotifyMe"
        primary={i18n.t("mainDrawer.listItems.notifyUser")}
        icon={<Ri24HoursFill />}
        tooltip={collapsed}
      /> */}

      <ListItemLink
        to="/contacts"
        primary={i18n.t("mainDrawer.listItems.contacts")}
        icon={<UserAdd />}
        tooltip={collapsed}
      />

      {/* TAREFAS - Item direto no menu */}
      <ListItemLink
        to="/tarefas"
        primary="Tarefas"
        icon={<TaskSquare />}
        tooltip={collapsed}
      />

      {/* MENU RECORRENTE com submenus */}
      <Tooltip
        title={collapsed ? "Recorrente" : ""}
        placement="right"
      >
        <ListItem
          dense
          button
          onClick={() => setOpenRecorrenteSubmenu((prev) => !prev)}
          onMouseEnter={() => setRecorrenteHover(true)}
          onMouseLeave={() => setRecorrenteHover(false)}
        >
          <ListItemIcon>
            <Avatar
              className={`${classes.iconHoverActive} ${
                isRecorrenteRouteActive || recorrenteHover
                  ? "active"
                  : ""
              }`}
            >
              <Calendar />
            </Avatar>
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography className={classes.listItemText}>
                Recorrente
              </Typography>
            }
          />
          {openRecorrenteSubmenu ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItem>
      </Tooltip>

      <Collapse
        in={openRecorrenteSubmenu}
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
            dense
            to="/recorrencia"
            primary="Recorrência"
            icon={<Calendar />}
            tooltip={collapsed}
          />
          <ListItemLink
            dense
            to="/parcelamentos"
            primary="Parcelamentos"
            icon={<MoneySend />}
            tooltip={collapsed}
          />
        </List>
      </Collapse>

      {/* MENU AGENDA */}
      <ListItemLink
        to="/agenda"
        primary="Agenda"
        icon={<Calendar />}
        tooltip={collapsed}
      />

      {/* MENU CRM - Integrado com /clientes principal */}
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
        className={classes.listItemNested}
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
            primary="Tarefas"
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

      {/* SUBMENU RECURSOS (Agendamentos, Tags, Respostas Rápidas) */}
      <Tooltip
        title={
          collapsed
            ? "Recursos"
            : ""
        }
        placement="right"
      >
        <ListItem
          dense
          button
          onClick={() => setOpenRecursosMenuSubmenu((prev) => !prev)}
          onMouseEnter={() => setRecursosMenuHover(true)}
          onMouseLeave={() => setRecursosMenuHover(false)}
        >
          <ListItemIcon>
            <Avatar
              className={`${classes.iconHoverActive} ${
                isRecursosMenuRouteActive || recursosMenuHover
                  ? "active"
                  : ""
              }`}
            >
              <Grid1 />
            </Avatar>
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography className={classes.listItemText}>
                Recursos
              </Typography>
            }
          />
          {openRecursosMenuSubmenu ? (
            <ExpandLessIcon />
          ) : (
            <ExpandMoreIcon />
          )}
        </ListItem>
      </Tooltip>
      <Collapse
        in={openRecursosMenuSubmenu}
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
          {showSchedules && (
            <ListItemLink
              to="/schedules"
              primary={i18n.t("mainDrawer.listItems.schedules")}
              icon={<Calendar />}
              tooltip={collapsed}
            />
          )}
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
        </List>
      </Collapse>

      {/* SUBMENU FERRAMENTAS */}
      <Tooltip
        title={
          collapsed
            ? "Ferramentas"
            : ""
        }
        placement="right"
      >
        <ListItem
          dense
          button
          onClick={() => setOpenFerramentasSubmenu((prev) => !prev)}
          onMouseEnter={() => setFerramentasHover(true)}
          onMouseLeave={() => setFerramentasHover(false)}
        >
          <ListItemIcon>
            <Avatar
              className={`${classes.iconHoverActive} ${
                isFerramentasRouteActive || ferramentasHover
                  ? "active"
                  : ""
              }`}
            >
              <Setting2 />
            </Avatar>
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography className={classes.listItemText}>
                Ferramentas
              </Typography>
            }
          />
          {openFerramentasSubmenu ? (
            <ExpandLessIcon />
          ) : (
            <ExpandMoreIcon />
          )}
        </ListItem>
      </Tooltip>
      <Collapse
        in={openFerramentasSubmenu}
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
              <Tooltip title={collapsed ? "Sped" : ""} placement="right">
                <Avatar className={classes.iconHoverActive}>
                  <Link21 />
                </Avatar>
              </Tooltip>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography className={classes.listItemText}>
                  Sped
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
              <Tooltip title={collapsed ? "Xml Cartorio" : ""} placement="right">
                <Avatar className={classes.iconHoverActive}>
                  <Link21 />
                </Avatar>
              </Tooltip>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography className={classes.listItemText}>
                  Xml Cartorio
                </Typography>
              }
            />
          </ListItem>
          <ListItem
            dense
            button
            component="a"
            href="https://crm.contco.com.br"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ListItemIcon>
              <Tooltip title={collapsed ? "CRM" : ""} placement="right">
                <Avatar className={classes.iconHoverActive}>
                  <Link21 />
                </Avatar>
              </Tooltip>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography className={classes.listItemText}>
                  CRM
                </Typography>
              }
            />
          </ListItem>
        </List>
      </Collapse>

      {showInternalChat && (
        <>
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
        </>
      )}

      {/* <ListItemLink
        to="/todolist"
        primary={i18n.t("ToDoList")}
        icon={<EventAvailableIcon />}
      /> */}

      <ListItemLink
        to="/helps"
        primary={i18n.t("mainDrawer.listItems.helps")}
        icon={<CalendarEdit />}
        tooltip={collapsed}
      />

      <ListItemLink
        to="/base-conhecimento"
        primary="Base de Conhecimento"
        icon={<DocumentText />}
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
          <>
            <Divider />
            <ListSubheader inset>
              {i18n.t("mainDrawer.listItems.administration")}
            </ListSubheader>
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
                          primary={i18n.t("campaigns.subMenus.list")}
                          icon={<VolumeUp />}
                          tooltip={collapsed}
                        />
                        <ListItemLink
                          to="/contact-lists"
                          primary={i18n.t("campaigns.subMenus.listContacts")}
                          icon={<Profile2User />}
                          tooltip={collapsed}
                        />
                        <ListItemLink
                          to="/campaigns-config"
                          primary={i18n.t("campaigns.subMenus.settings")}
                          icon={<Setting2 />}
                          tooltip={collapsed}
                        />
                      </List>
                    </Collapse>
                  </>
                )}
              />
            )}

            {/* MENU GRUPOS */}
            {showGroups && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <>
                    <Tooltip
                      title={
                        collapsed
                          ? "Grupos"
                          : ""
                      }
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
                          primary="Campanhas"
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
                      </List>
                    </Collapse>
                  </>
                )}
              />
            )}

            {/* FLOWBUILDER */}
            {/* <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <>
                  <Tooltip
                    title={
                      collapsed
                        ? i18n.t("mainDrawer.listItems.flowbuilder")
                        : ""
                    }
                    placement="right"
                  >
                    <ListItem
                      dense
                      button
                      onClick={() => setOpenFlowSubmenu((prev) => !prev)}
                      onMouseEnter={() => setFlowHover(true)}
                      onMouseLeave={() => setFlowHover(false)}
                    >
                      <ListItemIcon>
                        <Avatar
                          className={`${classes.iconHoverActive} ${
                            isFlowbuilderRouteActive || flowHover
                              ? "active"
                              : ""
                          }`}
                        >
                          <HierarchySquare3 />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography className={classes.listItemText}>
                            {i18n.t("Flowbuilder")}
                          </Typography>
                        }
                      />
                      {openFlowSubmenu ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </ListItem>
                  </Tooltip>

                  <Collapse
                    in={openFlowSubmenu}
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
                        to="/phrase-lists"
                        primary={i18n.t("mainDrawer.listItems.campaignFlow")}
                        icon={<VolumeHigh />}
                        tooltip={collapsed}
                      />

                      <ListItemLink
                        to="/flowbuilders"
                        primary={i18n.t(
                          "mainDrawer.listItems.conversationFlow"
                        )}
                        icon={<Messages1 />}
                        tooltip={collapsed}
                      />
                    </List>
                  </Collapse>
                </>
              )}
            /> */}

            {user.super && (
              <ListItemLink
                to="/announcements"
                primary={i18n.t("mainDrawer.listItems.annoucements")}
                icon={<Information />}
                tooltip={collapsed}
              />
            )}

            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <>
                  {/* SUBMENU USUÁRIOS */}
                  <Tooltip
                    title={
                      collapsed
                        ? i18n.t("mainDrawer.listItems.users")
                        : ""
                    }
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
                            isUsuariosRouteActive || usuariosHover
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
                            {i18n.t("mainDrawer.listItems.users")}
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
                  
                  {/* MENU CLIENTES - ADMIN (PRINCIPAL - ÚNICA FONTE) */}
                  <ListItemLink
                    to="/clientes"
                    primary="Clientes"
                    icon={<Profile2User />}
                    tooltip={collapsed}
                  />
                  
                  {/* MENU SÓCIOS - ADMIN */}
                  <ListItemLink
                    to="/socios"
                    primary="Sócios"
                    icon={<Profile2User />}
                    tooltip={collapsed}
                  />
                  
                  {/* MENU COBRANÇA - ADMIN */}
                  <ListItemLink
                    to="/cobranca"
                    primary="Cobrança"
                    icon={<MoneySend />}
                    tooltip={collapsed}
                  />
                  
                  {/* MENU CERTIDÕES - ADMIN */}
                  {/* Nota: Certidões vai usar dados de /clientes */}
                  <ListItemLink
                    to="/certidoes"
                    primary="Certidões"
                    icon={<DocumentText />}
                    tooltip={collapsed}
                  />
                </>
              )}
            />

            {/* SUBMENU RECURSOS */}
            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <>
                  <Tooltip
                    title={
                      collapsed
                        ? "Recursos"
                        : ""
                    }
                    placement="right"
                  >
                    <ListItem
                      dense
                      button
                      onClick={() => setOpenRecursosSubmenu((prev) => !prev)}
                      onMouseEnter={() => setRecursosHover(true)}
                      onMouseLeave={() => setRecursosHover(false)}
                    >
                      <ListItemIcon>
                        <Avatar
                          className={`${classes.iconHoverActive} ${
                            isRecursosRouteActive || recursosHover
                              ? "active"
                              : ""
                          }`}
                        >
                          <ArrowSquare />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography className={classes.listItemText}>
                            Recursos
                          </Typography>
                        }
                      />
                      {openRecursosSubmenu ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </ListItem>
                  </Tooltip>
                  <Collapse
                    in={openRecursosSubmenu}
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
                        to="/queues"
                        primary={i18n.t("mainDrawer.listItems.queues")}
                        icon={<ArrowSquare />}
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
                      <ListItemLink
                        to="/queue-integration"
                        primary={i18n.t("mainDrawer.listItems.queueIntegration")}
                        icon={<Hierarchy />}
                        tooltip={collapsed}
                      />
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
                        to="/files"
                        primary="GED"
                        icon={<Paperclip />}
                        tooltip={collapsed}
                      />
                    </List>
                  </Collapse>
                </>
              )}
            />

            <Can
              role={
                user.profile === "user" && user.allowConnections === "enabled"
                  ? "admin"
                  : user.profile
              }
              perform={"drawer-admin-items:view"}
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

            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ListItemLink
                  to="/financeiro"
                  primary={i18n.t("mainDrawer.listItems.financeiro")}
                  icon={<MoneySend />}
                  tooltip={collapsed}
                />
              )}
            />

            {/* SUBMENU AJUSTES */}
            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <>
                  <Tooltip
                    title={
                      collapsed
                        ? "Ajustes"
                        : ""
                    }
                    placement="right"
                  >
                    <ListItem
                      dense
                      button
                      onClick={() => setOpenAjustesSubmenu((prev) => !prev)}
                      onMouseEnter={() => setAjustesHover(true)}
                      onMouseLeave={() => setAjustesHover(false)}
                    >
                      <ListItemIcon>
                        <Avatar
                          className={`${classes.iconHoverActive} ${
                            isAjustesRouteActive || ajustesHover
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
                            Ajustes
                          </Typography>
                        }
                      />
                      {openAjustesSubmenu ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </ListItem>
                  </Tooltip>
                  <Collapse
                    in={openAjustesSubmenu}
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
                        primary={i18n.t("mainDrawer.listItems.settings")}
                        icon={<Setting />}
                        tooltip={collapsed}
                      />
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

                      {/* SUBMENU CONTROLES dentro de Ajustes */}
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
                                location.pathname.startsWith("/central-vinculos") ||
                                location.pathname.startsWith("/controles") ||
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
                            to="/controles-vinculados"
                            primary="Controles Vinculados"
                            icon={<Hierarchy />}
                            tooltip={collapsed}
                          />
                          <ListItemLink
                            dense
                            to="/controles-config"
                            primary="Cadastro de Controles"
                            icon={<Setting3 />}
                            tooltip={collapsed}
                          />
                        </List>
                      </Collapse>

                      <ListItemLink
                        to="/tarefas-config"
                        primary="Tarefas"
                        icon={<TaskSquare />}
                        tooltip={collapsed}
                      />
                      <ListItemLink
                        to="/tarefas-recorrentes"
                        primary="Tarefas Recorrentes"
                        icon={<TaskSquare />}
                        tooltip={collapsed}
                      />
                      <ListItemLink
                        to="/parcelamentos"
                        primary="Parcelamentos"
                        icon={<TaskSquare />}
                        tooltip={collapsed}
                      />
                      <ListItemLink
                        to="/tipo-servico"
                        primary="Tipos de Serviço"
                        icon={<Setting2 />}
                        tooltip={collapsed}
                      />
                      <ListItemLink
                        to="/parametros"
                        primary="Parâmetros"
                        icon={<Setting2 />}
                        tooltip={collapsed}
                      />
                    </List>
                  </Collapse>
                </>
              )}
            />
            {/* {user.super && (
              <ListSubheader inset>
                {i18n.t("mainDrawer.listItems.administration")}
              </ListSubheader>
            )} */}

            {user.super && (
              <ListItemLink
                to="/companies"
                primary={i18n.t("mainDrawer.listItems.companies")}
                icon={<Buliding />}
                tooltip={collapsed}
              />
            )}
          </>
        )}
      />

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
          {/* <Divider /> */}
          {/* 
              // IMAGEM NO MENU
              <Hidden only={['sm', 'xs']}>
                <img style={{ width: "100%", padding: "10px" }} src={logo} alt="image" />            
              </Hidden> 
              */}
          {/* <Typography
            style={{
              fontSize: "12px",
              padding: "10px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {`${version}`}
          </Typography> */}
        </React.Fragment>
      )}
    </div>
  );
};

export default MainListItems;
