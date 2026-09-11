import {
  Avatar,
  Badge,
  makeStyles,
  useTheme,
  withStyles,
} from "@material-ui/core";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Tooltip from "@material-ui/core/Tooltip";
import DashboardOutlinedIcon from "@material-ui/icons/DashboardOutlined";
import { default as React, useContext, useEffect, useState } from "react";
import { Link as RouterLink, useHistory, useLocation } from "react-router-dom";
import styled from "styled-components";
import logo from "../assets/logo1.png";
import { getBackendUrl } from "../config";
import useHelps from "../hooks/useHelps";

import { useActiveMenu } from "../context/ActiveMenuContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";

import { Can } from "../components/Can";

import { useMediaQuery } from "@material-ui/core";
import {
  DocumentText,
  Logout,
  MagicStar,
  MoneySend,
  People,
  Profile2User,
  Setting,
  HierarchySquare3,
  TaskSquare,
  Whatsapp,
} from "iconsax-react";
import toastError from "../errors/toastError";
import ColorModeContext from "../layout/themeContext";
import { socketConnection } from "../services/socket";
import { i18n } from "../translate/i18n";

const useStyles = makeStyles((theme) => ({
  listItem: {
    height: "56px",
    width: "auto",
    borderRadius: "12px",
    paddingTop: "4px",
    paddingBottom: "4px",
    justifyContent: "center",
    paddingLeft: 0,
    paddingRight: 0,
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
    },
  },
  listItemIconCollapsed: {
    minWidth: "auto",
    justifyContent: "center",
  },
  iconHoverActive: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "12px",
    height: 48,
    width: 48,
    minWidth: 48,
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
      fontSize: "1.6rem",
      transition: "all 0.2s",
    },
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
  logoContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "12px 0",
  },
  logoImg: {
    width: "56px",
    height: "auto",
    objectFit: "contain",
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

// Prefixos de rota que mantêm cada item do menu "ativo" enquanto o usuário
// navega dentro das sub-páginas do respectivo hub.
const PAINEL_ACTIVE_PATHS = ["/painel", "/reports", "/moments"];
const PAINEL_EXACT_PATHS = ["/"];
const ATENDIMENTO_ACTIVE_PATHS = [
  "/atendimento",
  "/tickets",
  "/contacts",
  "/connections",
  "/campaigns",
  "/contact-lists",
  "/campaigns-config",
  "/grupos",
  "/whatsapp-stories",
  "/tags",
  "/quick-messages",
  "/schedules",
  "/chats",
  "/base-conhecimento",
  "/helps",
];
const TAREFA_ACTIVE_PATHS = ["/tarefa", "/tarefas", "/gestao-tarefas"];
const CRM_ACTIVE_PATHS = ["/crm-hub", "/crm"];
const CLIENTES_ACTIVE_PATHS = [
  "/clientes-hub",
  "/clientes",
  "/socios",
  "/certidoes",
  "/cobranca",
];
const DOCUMENTOS_ACTIVE_PATHS = ["/documentos", "/files", "/xml-nfe"];
const FINANCEIRO_ACTIVE_PATHS = ["/fin"];
const ASSISTENTE_AI_ACTIVE_PATHS = ["/assistente-ai"];
const FLUXOGRAMA_ACTIVE_PATHS = ["/fluxograma"];
const CONFIGURACOES_ACTIVE_PATHS = [
  "/configuracoes",
  "/settings",
  "/queues",
  "/queue-integration",
  "/prompts",
  "/messages-api",
  "/plantao",
  "/admin-notifications",
  "/financeiro",
  "/companies",
  "/announcements",
  "/users",
  "/departamentos",
  "/parametros",
  "/modelos-parametros",
  "/config-email",
  "/config-whatsapp",
];

function ListItemLink(props) {
  const { icon, primary, to, showBadge, activePaths, exactPaths } = props;
  const classes = useStyles();
  const { activeMenu } = useActiveMenu();
  const location = useLocation();
  const isActive =
    activeMenu === to ||
    location.pathname === to ||
    (exactPaths && exactPaths.includes(location.pathname)) ||
    (activePaths && activePaths.some((p) => location.pathname.startsWith(p)));

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <Tooltip title={primary} placement="right" arrow>
      <li>
        <ListItem button component={renderLink} className={classes.listItem}>
          {icon ? (
            <ListItemIcon className={classes.listItemIconCollapsed}>
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
        </ListItem>
      </li>
    </Tooltip>
  );
}

const MainListItems = ({ drawerClose }) => {
  const classes = useStyles();
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user } = useContext(AuthContext);

  const [connectionWarning, setConnectionWarning] = useState(false);

  const backendUrl = getBackendUrl();
  const { handleLogout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const history = useHistory();
  const [profileUrl, setProfileUrl] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);

  const { colorMode } = useContext(ColorModeContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const toggleColorMode = () => {
    colorMode.toggleColorMode();
  };

  const { socket } = useContext(AuthContext);
  const theme = useTheme();

  const greaterThenSm = useMediaQuery(theme.breakpoints.up("md"));
  const [version, setVersion] = useState(false);

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

  return (
    <div onClick={drawerClose}>
      <div className={classes.logoContainer}>
        <RouterLink to="/">
          <img src={logo} alt="atalk" className={classes.logoImg} />
        </RouterLink>
      </div>

      <Can
        role={
          (user.profile === "user" && user.showDashboard === "enabled") ||
          user.allowRealTime === "enabled"
            ? "admin"
            : user.profile
        }
        perform={"drawer-admin-items:view"}
        yes={() => (
          <ListItemLink
            to="/painel"
            primary="Painel"
            icon={<DashboardOutlinedIcon />}
            activePaths={PAINEL_ACTIVE_PATHS}
            exactPaths={PAINEL_EXACT_PATHS}
          />
        )}
      />

      <ListItemLink
        to="/atendimento"
        primary="Atendimento"
        icon={<Whatsapp />}
        activePaths={ATENDIMENTO_ACTIVE_PATHS}
        showBadge={connectionWarning}
      />

      <ListItemLink
        to="/tarefa"
        primary="Tarefa"
        icon={<TaskSquare />}
        activePaths={TAREFA_ACTIVE_PATHS}
      />

      <ListItemLink
        to="/crm-hub"
        primary="CRM"
        icon={<Profile2User />}
        activePaths={CRM_ACTIVE_PATHS}
      />

      <ListItemLink
        to="/clientes-hub"
        primary="Clientes"
        icon={<People />}
        activePaths={CLIENTES_ACTIVE_PATHS}
      />

      <ListItemLink
        to="/documentos"
        primary="Documentos"
        icon={<DocumentText />}
        activePaths={DOCUMENTOS_ACTIVE_PATHS}
      />

      <ListItemLink
        to="/fin"
        primary="Financeiro"
        icon={<MoneySend />}
        activePaths={FINANCEIRO_ACTIVE_PATHS}
      />

      <ListItemLink
        to="/assistente-ai"
        primary="Assistente AI"
        icon={<MagicStar />}
        activePaths={ASSISTENTE_AI_ACTIVE_PATHS}
      />

      <ListItemLink
        to="/fluxograma"
        primary="Fluxograma"
        icon={<HierarchySquare3 />}
        activePaths={FLUXOGRAMA_ACTIVE_PATHS}
      />

      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <ListItemLink
            to="/configuracoes"
            primary="Configurações"
            icon={<Setting />}
            activePaths={CONFIGURACOES_ACTIVE_PATHS}
          />
        )}
      />

      <div onClick={handleClickLogout}>
        <ListItemLink
          to="#"
          primary={i18n.t("mainDrawer.appBar.user.logout")}
          icon={<Logout />}
        />
      </div>
    </div>
  );
};

export default MainListItems;
