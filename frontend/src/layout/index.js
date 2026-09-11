import clsx from "clsx";
import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
// import moment from "moment";
import UserLanguageSelector from "../components/UserLanguageSelector";
// import { isNill } from "lodash";
// import SoftPhone from "react-softphone";
// import { WebSocketInterface } from "jssip";
import {
  AppBar,
  Avatar,
  // FormControl,
  Badge,
  Chip,
  Drawer,
  IconButton,
  List,
  makeStyles,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  withStyles,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  FormControlLabel,
  Switch,
} from "@material-ui/core";
import InternalChat from "../components/InternalChat"; //Importa internal Chat

import MenuIcon from "@material-ui/icons/Menu";
// import AccountCircle from "@material-ui/icons/AccountCircle";
// import whatsappIcon from "../assets/nopicture.png";

import BackdropLoading from "../components/BackdropLoading";
import NotificationsPopOver from "../components/NotificationsPopOver";
import NotificationsVolume from "../components/NotificationsVolume";
import TasksNotifications from "../components/TasksNotifications";
import { AuthContext } from "../context/Auth/AuthContext";
import MainListItems from "./MainListItems";
// import DarkMode from "../components/DarkMode";
import AnnouncementsPopover from "../components/AnnouncementsPopover";
import AdminNotificationModal from "../components/AdminNotificationModal";
import toastError from "../errors/toastError";
import { toast } from "react-toastify";
import api from "../services/api";
import { i18n } from "../translate/i18n";

import ChatPopover from "../pages/Chat/ChatPopover";

import { useDate } from "../hooks/useDate";

import { Refresh } from "iconsax-react";
import { getBackendUrl } from "../config";
import useSettings from "../hooks/useSettings";
import { socketConnection } from "../services/socket";
import ColorModeContext from "./themeContext";
// import { SocketContext } from "../context/Socket/SocketContext";

const backendUrl = getBackendUrl();

// Rail de ícones fixo: o menu não expande mais para mostrar texto,
// então a largura do drawer é constante em todas as resoluções.
const drawerWidth = 72;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100vh",
    // [theme.breakpoints.down("sm")]: {
    //   height: "calc(100vh - 56px)",
    // },
    maxHeight: "100% !important",
    backgroundColor: theme.palette.fancyBackground,
    "& .MuiButton-outlinedPrimary": {
      color: theme.palette.primary,
      border:
        theme.mode === "light"
          ? "1px solid rgba(0 124 102)"
          : "1px solid rgba(255, 255, 255, 0.5)",
      borderRadius: "50px",
    },
    "& .MuiTab-textColorPrimary.Mui-selected": {
      color: `#111416`,
    },
    "& .MuiButton-root": {
      borderRadius: "50px",
    },
  },
  chip: {
    background: "red",
    color: "white",
  },
  avatar: {
    width: "100%",
  },
  toolbar: {
    paddingRight: 52, // keep right padding when drawer closed
    color: theme.palette.dark.main,
    background: theme.palette.barraSuperior,
    minHeight: `48px`,
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111416",
    backgroundSize: "cover",
    padding: "17px 8px",
    minHeight: "48px",
    [theme.breakpoints.down("sm")]: {
      height: "48px",
    },
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    [theme.breakpoints.down("sm")]: {
      marginLeft: 0,
      width: "100%",
    },
  },
  appBarMobileHidden: {
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  menuButton: {
    // Só faz sentido no mobile: no desktop o rail de ícones é sempre visível.
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
    fontSize: 14,
    color: "white",
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    overflowX: "hidden",
    overflowY: "hidden",
    padding: "0 !important",
    width: drawerWidth,
  },

  appBarSpacer: {
    minHeight: "48px",
  },
  content: {
    flex: 1,
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  // paper: {
  //     padding: theme.spacing(2),
  //     display: "flex",
  //     overflow: "auto",
  //     flexDirection: "column",
  //   },
  containerWithScroll: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    height: "100vh",
    paddingTop: "8px !important",
    border: "2px solid transparent",
    backgroundColor: "#FFF",
    "&::-webkit-scrollbar": {
      width: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(0,0,0,0.15)",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "transparent",
    },
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(0,0,0,0.15) transparent",
  },
  NotificationsPopOver: {
    // color: theme.barraSuperior.secondary.main,
  },
  avatar2: {
    width: theme.spacing(6),
    height: theme.spacing(6),
    cursor: "pointer",
    borderRadius: "50%",
    border: "1px solid #ccc",
  },
  updateDiv: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const StyledBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: -10,
      left: -10,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "$ripple 1.2s infinite ease-in-out",
      border: "14px solid currentColor",
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

const SmallAvatar = withStyles((theme) => ({
  root: {
    width: 22,
    height: 22,
    border: `2px solid ${theme.palette.background.paper}`,
  },
}))(Avatar);

const LoggedInLayout = ({ children, themeToggle }) => {
  const classes = useStyles();
  const history = useHistory();
  const [userToken, setUserToken] = useState("disabled");
  const [loadingUserToken, setLoadingUserToken] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { handleLogout, loading, showDialogButton } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVariant, setDrawerVariant] = useState("permanent");
  // const [dueDate, setDueDate] = useState("");
  //   const socketManager = useContext(SocketContext);
  const { user, socket } = useContext(AuthContext);

  const theme = useTheme();
  const { colorMode } = useContext(ColorModeContext);
  const greaterThenSm = useMediaQuery(theme.breakpoints.up("sm"));

  const [volume, setVolume] = useState(localStorage.getItem("volume") || 1);

  const { dateToClient } = useDate();
  const [profileUrl, setProfileUrl] = useState(null);

  const settings = useSettings();

  useEffect(() => {
    const getSetting = async () => {
      const response = await settings.get("wtV");

      if (response) {
        setUserToken("disabled");
      } else {
        setUserToken("disabled");
      }
    };

    //  getSetting();
  });

  useEffect(() => {
    // if (localStorage.getItem("public-token") === null) {
    //   handleLogout()
    // }

    if (document.body.offsetWidth > 600) {
      // Menu inicia recolhido (somente ícones) por padrão, exceto quando
      // o usuário definiu explicitamente a preferência de abrir o menu.
      setDrawerOpen(user.defaultMenu === "open");
    }
    if (user.defaultTheme === "dark" && theme.mode === "light") {
      colorMode.toggleColorMode();
    }
  }, [user.defaultMenu, document.body.offsetWidth]);

  useEffect(() => {
    if (document.body.offsetWidth < 600) {
      setDrawerVariant("temporary");
    } else {
      setDrawerVariant("permanent");
    }
  }, [drawerOpen]);

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

  // Carregar status inicial do usuário
  useEffect(() => {
    if (user) {
      setIsOnline(user.isOnline !== false); // Default true se undefined
    }
  }, [user]);

  const handleToggleOnline = () => {
    setConfirmDialogOpen(true);
  };

  const handleConfirmToggle = async () => {
    const newStatus = !isOnline;
    
    try {
      const { data } = await api.put("/users/toggle-status", { isOnline: newStatus });
      setIsOnline(newStatus);
      
      // Atualizar o user no contexto
      user.isOnline = newStatus;
      
      toast.success(data.message);
      setConfirmDialogOpen(false);
      handleCloseMenu();
      
      // Recarregar a página para atualizar todas as referências
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      toastError(err);
    }
  };

  const handleCancelToggle = () => {
    setConfirmDialogOpen(false);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleOpenUserModal = () => {
    history.push("/profile");
    handleCloseMenu();
  };

  const handleClickLogout = () => {
    handleCloseMenu();
    handleLogout();
  };

  const drawerClose = () => {
    if (document.body.offsetWidth < 600 || user.defaultMenu === "closed") {
      setDrawerOpen(false);
    }
  };

  const handleRefreshPage = () => {
    window.location.reload(false);
  };

  const handleMenuItemClick = () => {
    const { innerWidth: width } = window;
    if (width <= 600) {
      setDrawerOpen(false);
    }
  };

  if (loading) {
    return <BackdropLoading />;
  }

  return (
    <div className={classes.root}>
      <Drawer
        variant={drawerVariant}
        classes={{ paper: classes.drawerPaper }}
        open={drawerOpen}
      >
        <List className={classes.containerWithScroll}>
          <MainListItems drawerClose={drawerClose} />
        </List>
      </Drawer>

      <AppBar
        position="absolute"
        className={clsx(classes.appBar, drawerOpen && classes.appBarMobileHidden)}
        color="primary"
      >
        <Toolbar variant="dense" className={classes.toolbar}>
          <IconButton
            edge="start"
            variant="contained"
            aria-label="open drawer"
            style={{ color: "white" }}
            onClick={() => setDrawerOpen(!drawerOpen)}
            className={clsx(
              classes.menuButton,
              drawerOpen && classes.menuButtonHidden
            )}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            component="h2"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            {/* {greaterThenSm && user?.profile === "admin" && getDateAndDifDays(user?.company?.dueDate).difData < 7 ? ( */}
            {greaterThenSm &&
            user?.profile === "admin" &&
            user?.company?.dueDate ? (
              <>
                {i18n.t("mainDrawer.appBar.user.message")} <b>{user.name}</b>,{" "}
                {i18n.t("mainDrawer.appBar.user.messageEnd")}{" "}
                <b>{user?.company?.name}</b>! (
                {i18n.t("mainDrawer.appBar.user.active")}{" "}
                {dateToClient(user?.company?.dueDate)})
              </>
            ) : (
              <>
                {i18n.t("mainDrawer.appBar.user.message")} <b>{user.name}</b>,{" "}
                {i18n.t("mainDrawer.appBar.user.messageEnd")}{" "}
                <b>{user?.company?.name}</b>!
              </>
            )}
          </Typography>

          {userToken === "enabled" && user?.companyId === 1 && (
            <Chip
              className={classes.chip}
              label={i18n.t("mainDrawer.appBar.user.token")}
            />
          )}

          {/* DESABILITADO POIS TEM BUGS */}
          <UserLanguageSelector />
          {/* <SoftPhone
            callVolume={33} //Set Default callVolume
            ringVolume={44} //Set Default ringVolume
            connectOnStart={false} //Auto connect to sip
            notifications={false} //Show Browser Notification of an incoming call
            config={config} //Voip config
            setConnectOnStartToLocalStorage={setConnectOnStartToLocalStorage} // Callback function
            setNotifications={setNotifications} // Callback function
            setCallVolume={setCallVolume} // Callback function
            setRingVolume={setRingVolume} // Callback function
            timelocale={'UTC-3'} //Set time local for call history
          /> */}
          {/* <IconButton edge="start" onClick={colorMode.toggleColorMode}>
            {theme.mode === "dark" ? (
              <Brightness7Icon style={{ color: "white" }} />
            ) : (
              <Brightness4Icon style={{ color: "white" }} />
            )}
          </IconButton> */}

          <NotificationsVolume setVolume={setVolume} volume={volume} />

          <TasksNotifications />

          <IconButton
            onClick={handleRefreshPage}
            aria-label={i18n.t("mainDrawer.appBar.refresh")}
            color="inherit"
          >
            <Refresh color="white" />
          </IconButton>

          {/* <DarkMode themeToggle={themeToggle} /> */}

          {user.id && <NotificationsPopOver volume={volume} />}

          <AnnouncementsPopover />

          <AdminNotificationModal />

          <ChatPopover />

          <div>
            <Badge
              overlap="circular"
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              badgeContent={
                <Avatar
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor: isOnline ? "#4caf50" : "#9e9e9e",
                    border: "2px solid #fff",
                  }}
                />
              }
              onClick={handleMenu}
            >
              <Avatar
                alt="Multi100"
                className={classes.avatar2}
                src={profileUrl}
              />
            </Badge>

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={menuOpen}
              onClose={handleCloseMenu}
            >
              <MenuItem onClick={handleToggleOnline}>
                <Switch
                  checked={isOnline}
                  color="primary"
                  size="small"
                  style={{ marginRight: 8 }}
                />
                {isOnline ? "Online" : "Offline"}
              </MenuItem>
              <MenuItem onClick={handleOpenUserModal}>
                {i18n.t("mainDrawer.appBar.user.profile")}
              </MenuItem>
              <MenuItem onClick={handleClickLogout}>
                {i18n.t("mainDrawer.appBar.user.logout")}
              </MenuItem>
            </Menu>

            <Dialog
              open={confirmDialogOpen}
              onClose={handleCancelToggle}
            >
              <DialogTitle>
                {isOnline ? "Ficar Offline?" : "Ficar Online?"}
              </DialogTitle>
              <DialogContent>
                <DialogContentText>
                  {isOnline
                    ? "Ao ficar offline, você não receberá novos atendimentos. Deseja continuar?"
                    : "Ao ficar online, você poderá receber novos atendimentos. Deseja continuar?"}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCancelToggle} color="primary">
                  Cancelar
                </Button>
                <Button onClick={handleConfirmToggle} color="primary" autoFocus>
                  Confirmar
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        </Toolbar>
      </AppBar>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        {showDialogButton && <InternalChat />}

        {children ? children : null}
      </main>
    </div>
  );
};

export default LoggedInLayout;
