import React, { useState, useEffect, useContext } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
	Button,
	TextField,
	CircularProgress,
	Select,
	InputLabel,
	MenuItem,
	FormControl,
	Typography,
	Avatar,
	Input,
	Paper,
	Grid,
	Divider,
	IconButton,
	Card,
	CardContent,
	CardHeader,
	Box,
	Chip,
	List,
	ListItem,
	ListItemText,
	useTheme,
	useMediaQuery,
	Collapse,
	Tab,
	Tabs,
} from "@material-ui/core";
import {
	ArrowBack as ArrowBackIcon,
	Edit as EditIcon,
	Work as WorkIcon,
	Person as PersonIcon,
	Business as BusinessIcon,
	GetApp as DownloadIcon,
	ExpandMore as ExpandMoreIcon,
	ExpandLess as ExpandLessIcon,
	CheckCircle as VerifiedIcon,
	School as SchoolIcon,
	EmojiObjects as EmojiObjectsIcon,
	ListAlt as ListAltIcon,
	Description as DescriptionIcon,
	Assignment as AssignmentIcon,
} from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import whatsappIcon from "../../assets/nopicture.png";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import QueueSelect from "../../components/QueueSelect";
import { AuthContext } from "../../context/Auth/AuthContext";
import useWhatsApps from "../../hooks/useWhatsApps";
import { getBackendUrl } from "../../config";
import { format, parseISO } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

const backendUrl = getBackendUrl();

const useStyles = makeStyles((theme) => ({
	root: {
		display: "flex",
		flexDirection: "column",
		height: "100%",
		padding: theme.spacing(2),
		backgroundColor: theme.palette.background.default,
		overflowY: "auto",
	},
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: theme.spacing(3),
	},
	coverCard: {
		position: "relative",
		borderRadius: 16,
		marginBottom: theme.spacing(2),
		overflow: "visible",
	},
	coverImage: {
		height: 200,
		background: "linear-gradient(135deg, #0596cd 0%, #047ba5 100%)",
		borderRadius: "16px 16px 0 0",
	},
	profileHeader: {
		display: "flex",
		alignItems: "flex-end",
		padding: theme.spacing(0, 3, 2, 3),
		marginTop: -60,
		gap: theme.spacing(2),
		[theme.breakpoints.down("sm")]: {
			flexDirection: "column",
			alignItems: "center",
			textAlign: "center",
		},
	},
	avatar: {
		width: 120,
		height: 120,
		border: "4px solid white",
		cursor: "pointer",
		boxShadow: theme.shadows[3],
	},
	profileInfo: {
		flex: 1,
		color: theme.palette.text.primary,
	},
	userName: {
		fontWeight: 700,
		fontSize: "1.5rem",
		display: "flex",
		alignItems: "center",
		gap: theme.spacing(1),
	},
	userRole: {
		color: theme.palette.text.secondary,
		marginTop: theme.spacing(0.5),
	},
	editButton: {
		marginBottom: theme.spacing(1),
	},
	card: {
		borderRadius: 16,
		marginBottom: theme.spacing(2),
		boxShadow: theme.shadows[2],
	},
	cardHeader: {
		backgroundColor: theme.palette.background.default,
		borderBottom: `1px solid ${theme.palette.divider}`,
	},
	sectionIcon: {
		marginRight: theme.spacing(1),
		color: theme.palette.primary.main,
		verticalAlign: "middle",
	},
	formSection: {
		padding: theme.spacing(3),
	},
	perfilCargoSection: {
		padding: theme.spacing(2),
	},
	perfilCargoItem: {
		marginBottom: theme.spacing(2),
	},
	perfilCargoLabel: {
		fontWeight: 600,
		color: theme.palette.text.secondary,
		fontSize: "0.875rem",
		marginBottom: theme.spacing(0.5),
		display: "flex",
		alignItems: "center",
	},
	perfilCargoValue: {
		color: theme.palette.text.primary,
	},
	competenciaCard: {
		padding: theme.spacing(1.5),
		marginBottom: theme.spacing(1),
		backgroundColor: theme.palette.background.default,
		borderRadius: 8,
	},
	holeriteCard: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		padding: theme.spacing(2),
		marginBottom: theme.spacing(1),
		backgroundColor: theme.palette.background.default,
		borderRadius: 8,
		"&:hover": {
			backgroundColor: theme.palette.action.hover,
		},
	},
	holeriteInfo: {
		display: "flex",
		alignItems: "center",
		gap: theme.spacing(2),
	},
	pdfIcon: {
		fontSize: 40,
		color: theme.palette.error.main,
	},
	emptyState: {
		textAlign: "center",
		padding: theme.spacing(4),
		color: theme.palette.text.secondary,
	},
	tabs: {
		borderBottom: `1px solid ${theme.palette.divider}`,
	},
	updateInput: {
		display: "none",
	},
	buttonProgress: {
		color: green[500],
		position: "absolute",
		top: "50%",
		left: "50%",
		marginTop: -12,
		marginLeft: -12,
	},
	saveButton: {
		background: "linear-gradient(135deg, #0596cd 0%, #047ba5 100%)",
		color: "#fff",
		"&:hover": {
			background: "linear-gradient(135deg, #047ba5 0%, #035c7d 100%)",
		},
	},
}));

const MESES = {
	1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril",
	5: "Maio", 6: "Junho", 7: "Julho", 8: "Agosto",
	9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro",
};

const UserSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Muito curto!")
		.max(50, "Muito longo!")
		.required("Campo obrigatório"),
	password: Yup.string().min(5, "Muito curto!").max(50, "Muito longo!"),
	email: Yup.string().email("Email inválido").required("Campo obrigatório"),
});

const Profile = () => {
	const classes = useStyles();
	const history = useHistory();

	const initialState = {
		name: "",
		email: "",
		password: "",
		profile: "user",
		position: "",
		startWork: "00:00",
		endWork: "23:59",
		farewellMessage: "",
		allTicket: "disable",
		allowGroup: false,
		defaultTheme: "light",
		defaultMenu: "open",
		defaultHomePage: "tickets",
		wpp: "",
	};

	const { user: loggedInUser } = useContext(AuthContext);

	const [user, setUser] = useState(initialState);
	const [selectedQueueIds, setSelectedQueueIds] = useState([]);
	const [whatsappId, setWhatsappId] = useState(false);
	const { loading: whatsLoading, whatsApps } = useWhatsApps();
	const [profileUrl, setProfileUrl] = useState(null);
	const [perfilCargo, setPerfilCargo] = useState(null);
	const [holerites, setHolerites] = useState([]);
	const [loadingPerfil, setLoadingPerfil] = useState(true);
	const [loadingHolerites, setLoadingHolerites] = useState(true);
	const [tabValue, setTabValue] = useState(0);
	const [expandedSections, setExpandedSections] = useState({
		competencias: true,
		formacao: false,
		atividades: false,
	});

	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
	const isAdmin = loggedInUser?.profile === "admin";

	useEffect(() => {
		const fetchUser = async () => {
			if (!loggedInUser?.id) return;
			try {
				const { data } = await api.get(`/users/${loggedInUser.id}`);
				setUser((prevState) => {
					return { ...prevState, ...data };
				});

				const { profileImage } = data;
				if (profileImage) {
					setProfileUrl(
						`${backendUrl}/public/company${data.companyId}/user/${profileImage}`
					);
				}

				const userQueueIds = data.queues?.map((queue) => queue.id);
				setSelectedQueueIds(userQueueIds);
				setWhatsappId(data.whatsappId ? data.whatsappId : "");
			} catch (err) {
				toastError(err);
			}
		};

		fetchUser();
	}, [loggedInUser]);

	useEffect(() => {
		const fetchPerfilCargo = async () => {
			if (!loggedInUser?.id) return;
			setLoadingPerfil(true);
			try {
				const { data } = await api.get(`/perfil-cargo/${loggedInUser.id}`);
				setPerfilCargo(data);
			} catch (err) {
				console.error("Erro ao carregar perfil de cargo:", err);
				setPerfilCargo(null);
			} finally {
				setLoadingPerfil(false);
			}
		};

		fetchPerfilCargo();
	}, [loggedInUser]);

	useEffect(() => {
		const fetchHolerites = async () => {
			if (!loggedInUser?.id) return;
			setLoadingHolerites(true);
			try {
				const { data } = await api.get(`/holerites/${loggedInUser.id}`);
				setHolerites(data.slice(0, 6));
			} catch (err) {
				console.error("Erro ao carregar holerites:", err);
				setHolerites([]);
			} finally {
				setLoadingHolerites(false);
			}
		};

		fetchHolerites();
	}, [loggedInUser]);

	const handleChangeProfileImage = async (e) => {
		if (!e.target.files[0]) return;

		const formData = new FormData();
		formData.append("userId", loggedInUser.id);
		formData.append("typeArch", "profileImage");
		formData.append("file", e.target.files[0]);

		try {
			const { data } = await api.post("/users/profile-image", formData);
			setProfileUrl(`${backendUrl}/public/company${user.companyId}/user/${data.profileImage}`);
			toast.success("Foto de perfil atualizada!");
		} catch (err) {
			toastError(err);
		}
	};

	const handleDownloadHolerite = async (holeriteId, mesRef, anoRef) => {
		try {
			const response = await api.get(`/holerites/download/${holeriteId}`, {
				responseType: "blob",
			});

			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", `Holerite_${MESES[mesRef]}_${anoRef}.pdf`);
			document.body.appendChild(link);
			link.click();
			link.remove();

			toast.success("Download iniciado!");
		} catch (error) {
			toast.error("Erro ao fazer download do holerite");
			console.error(error);
		}
	};

	const handleSaveUser = async (values) => {
		const userData = { ...values, queueIds: selectedQueueIds, whatsappId };
		try {
			await api.put(`/users/${loggedInUser.id}`, userData);
			toast.success(i18n.t("profile.success"));
		} catch (err) {
			toastError(err);
		}
	};

	const toggleSection = (section) => {
		setExpandedSections((prev) => ({
			...prev,
			[section]: !prev[section],
		}));
	};

	const renderPerfilCargo = () => {
		if (loadingPerfil) {
			return (
				<Box className={classes.emptyState}>
					<CircularProgress />
				</Box>
			);
		}

		if (!perfilCargo) {
			return (
				<Box className={classes.emptyState}>
					<WorkIcon style={{ fontSize: 60, opacity: 0.3, marginBottom: 16 }} />
					<Typography variant="body1">
						Nenhum perfil de cargo cadastrado
					</Typography>
				</Box>
			);
		}

		return (
			<Box className={classes.perfilCargoSection}>
				<Grid container spacing={2}>
					{perfilCargo.cargo && (
						<Grid item xs={12} sm={6}>
							<div className={classes.perfilCargoItem}>
								<Typography className={classes.perfilCargoLabel}>
									Cargo
								</Typography>
								<Typography className={classes.perfilCargoValue}>
									{perfilCargo.cargo}
								</Typography>
							</div>
						</Grid>
					)}
					{perfilCargo.funcao && (
						<Grid item xs={12} sm={6}>
							<div className={classes.perfilCargoItem}>
								<Typography className={classes.perfilCargoLabel}>
									Função
								</Typography>
								<Typography className={classes.perfilCargoValue}>
									{perfilCargo.funcao}
								</Typography>
							</div>
						</Grid>
					)}
					{perfilCargo.setor && (
						<Grid item xs={12} sm={6}>
							<div className={classes.perfilCargoItem}>
								<Typography className={classes.perfilCargoLabel}>
									Setor
								</Typography>
								<Typography className={classes.perfilCargoValue}>
									{perfilCargo.setor}
								</Typography>
							</div>
						</Grid>
					)}
					{perfilCargo.cbo && (
						<Grid item xs={12} sm={6}>
							<div className={classes.perfilCargoItem}>
								<Typography className={classes.perfilCargoLabel}>
									CBO
								</Typography>
								<Typography className={classes.perfilCargoValue}>
									{perfilCargo.cbo}
								</Typography>
							</div>
						</Grid>
					)}
				</Grid>

				{perfilCargo.missaoCargo && (
					<>
						<Divider style={{ margin: "24px 0" }} />
						<div className={classes.perfilCargoItem}>
							<Typography className={classes.perfilCargoLabel}>
								<EmojiObjectsIcon className={classes.sectionIcon} />
								Missão do Cargo
							</Typography>
							<Typography className={classes.perfilCargoValue}>
								{perfilCargo.missaoCargo}
							</Typography>
						</div>
					</>
				)}

				{perfilCargo.competenciasComportamentais && perfilCargo.competenciasComportamentais.length > 0 && (
					<>
						<Divider style={{ margin: "24px 0" }} />
						<Box display="flex" alignItems="center" justifyContent="space-between" style={{ cursor: "pointer" }} onClick={() => toggleSection("competencias")}>
							<Typography className={classes.perfilCargoLabel}>
								<VerifiedIcon className={classes.sectionIcon} />
								Competências Comportamentais ({perfilCargo.competenciasComportamentais.length})
							</Typography>
							<IconButton size="small">
								{expandedSections.competencias ? <ExpandLessIcon /> : <ExpandMoreIcon />}
							</IconButton>
						</Box>
						<Collapse in={expandedSections.competencias}>
							<Box mt={2}>
								{perfilCargo.competenciasComportamentais.map((comp, index) => (
									<Card key={index} className={classes.competenciaCard}>
										<Typography variant="subtitle2" style={{ fontWeight: 600 }}>
											{comp.competencia}
										</Typography>
										<Typography variant="body2" color="textSecondary">
											{comp.significado}
										</Typography>
									</Card>
								))}
							</Box>
						</Collapse>
					</>
				)}

				{(perfilCargo.formacaoObrigatoria || perfilCargo.formacaoDesejavel) && (
					<>
						<Divider style={{ margin: "24px 0" }} />
						<Box display="flex" alignItems="center" justifyContent="space-between" style={{ cursor: "pointer" }} onClick={() => toggleSection("formacao")}>
							<Typography className={classes.perfilCargoLabel}>
								<SchoolIcon className={classes.sectionIcon} />
								Formação e Conhecimentos
							</Typography>
							<IconButton size="small">
								{expandedSections.formacao ? <ExpandLessIcon /> : <ExpandMoreIcon />}
							</IconButton>
						</Box>
						<Collapse in={expandedSections.formacao}>
							<Box mt={2}>
								{perfilCargo.formacaoObrigatoria && (
									<div className={classes.perfilCargoItem}>
										<Typography className={classes.perfilCargoLabel}>
											Formação Obrigatória
										</Typography>
										<Typography className={classes.perfilCargoValue} style={{ whiteSpace: "pre-line" }}>
											{perfilCargo.formacaoObrigatoria}
										</Typography>
									</div>
								)}
								{perfilCargo.formacaoDesejavel && (
									<div className={classes.perfilCargoItem}>
										<Typography className={classes.perfilCargoLabel}>
											Formação Desejável
										</Typography>
										<Typography className={classes.perfilCargoValue} style={{ whiteSpace: "pre-line" }}>
											{perfilCargo.formacaoDesejavel}
										</Typography>
									</div>
								)}
							</Box>
						</Collapse>
					</>
				)}

				{(perfilCargo.descricaoAtividades || perfilCargo.resultadosEsperados) && (
					<>
						<Divider style={{ margin: "24px 0" }} />
						<Box display="flex" alignItems="center" justifyContent="space-between" style={{ cursor: "pointer" }} onClick={() => toggleSection("atividades")}>
							<Typography className={classes.perfilCargoLabel}>
								<ListAltIcon className={classes.sectionIcon} />
								Atividades e Resultados
							</Typography>
							<IconButton size="small">
								{expandedSections.atividades ? <ExpandLessIcon /> : <ExpandMoreIcon />}
							</IconButton>
						</Box>
						<Collapse in={expandedSections.atividades}>
							<Box mt={2}>
								{perfilCargo.descricaoAtividades && (
									<div className={classes.perfilCargoItem}>
										<Typography className={classes.perfilCargoLabel}>
											Descrição das Atividades
										</Typography>
										<Typography className={classes.perfilCargoValue} style={{ whiteSpace: "pre-line" }}>
											{perfilCargo.descricaoAtividades}
										</Typography>
									</div>
								)}
								{perfilCargo.resultadosEsperados && (
									<div className={classes.perfilCargoItem}>
										<Typography className={classes.perfilCargoLabel}>
											Resultados Esperados
										</Typography>
										<Typography className={classes.perfilCargoValue} style={{ whiteSpace: "pre-line" }}>
											{perfilCargo.resultadosEsperados}
										</Typography>
									</div>
								)}
							</Box>
						</Collapse>
					</>
				)}
			</Box>
		);
	};

	const renderHolerites = () => {
		if (loadingHolerites) {
			return (
				<Box className={classes.emptyState}>
					<CircularProgress />
				</Box>
			);
		}

		if (holerites.length === 0) {
			return (
				<Box className={classes.emptyState}>
					<DescriptionIcon style={{ fontSize: 60, opacity: 0.3, marginBottom: 16 }} />
					<Typography variant="body1">
						Nenhum holerite disponível
					</Typography>
				</Box>
			);
		}

		return (
			<Box p={2}>
				{holerites.map((holerite) => (
					<Card key={holerite.id} className={classes.holeriteCard}>
						<Box className={classes.holeriteInfo}>
							<DescriptionIcon className={classes.pdfIcon} />
							<Box>
								<Typography variant="subtitle1" style={{ fontWeight: 600 }}>
									{MESES[holerite.mesReferencia]} / {holerite.anoReferencia}
								</Typography>
								<Typography variant="caption" color="textSecondary">
									Enviado em: {format(parseISO(holerite.createdAt), "dd/MM/yyyy", { locale: ptBR })}
								</Typography>
							</Box>
						</Box>
						<IconButton
							color="primary"
							onClick={() => handleDownloadHolerite(holerite.id, holerite.mesReferencia, holerite.anoReferencia)}
						>
							<DownloadIcon />
						</IconButton>
					</Card>
				))}
			</Box>
		);
	};

	return (
		<div className={classes.root}>
			<Box className={classes.header}>
				<Typography variant="h5" style={{ fontWeight: 700 }}>
					Meu Perfil
				</Typography>
				<Button
					startIcon={<ArrowBackIcon />}
					onClick={() => history.push("/")}
				>
					Voltar
				</Button>
			</Box>

			<Grid container spacing={2}>
				<Grid item xs={12} md={8}>
					<Card className={classes.coverCard}>
						<Box className={classes.coverImage} />
						<Box className={classes.profileHeader}>
							<input
								accept="image/*"
								className={classes.updateInput}
								id="profile-image-upload"
								type="file"
								onChange={handleChangeProfileImage}
							/>
							<label htmlFor="profile-image-upload">
								<Avatar
									alt={user.name}
									src={profileUrl || whatsappIcon}
									className={classes.avatar}
								/>
							</label>
							<Box className={classes.profileInfo}>
								<Typography className={classes.userName}>
									{user.name}
									{isAdmin && <VerifiedIcon color="primary" />}
								</Typography>
								<Typography className={classes.userRole}>
									{user.position || (user.profile === "admin" ? "Administrador" : "Usuário")}
								</Typography>
								<Box mt={1}>
									<Chip
										size="small"
										label={user.email}
										icon={<PersonIcon />}
										variant="outlined"
									/>
								</Box>
							</Box>
							{isAdmin && (
								<Button
									variant="contained"
									color="primary"
									className={classes.editButton}
									startIcon={<EditIcon />}
									onClick={() => setTabValue(0)}
								>
									Editar Perfil
								</Button>
							)}
						</Box>
					</Card>

					<Card className={classes.card}>
						<Tabs
							value={tabValue}
							onChange={(e, newValue) => setTabValue(newValue)}
							className={classes.tabs}
							variant={isMobile ? "fullWidth" : "standard"}
						>
							{isAdmin && <Tab label="Configurações" icon={<EditIcon />} />}
							<Tab label="Perfil de Cargo" icon={<WorkIcon />} />
							<Tab label="Holerites" icon={<DescriptionIcon />} />
						</Tabs>

						{isAdmin && tabValue === 0 && (
							<Box className={classes.formSection}>
								<Formik
									initialValues={user}
									enableReinitialize
									validationSchema={UserSchema}
									onSubmit={(values, actions) => {
										setTimeout(() => {
											handleSaveUser(values);
											actions.setSubmitting(false);
										}, 400);
									}}
								>
									{({ touched, errors, isSubmitting }) => (
										<Form>
											<Grid container spacing={2}>
												<Grid item xs={12} sm={6}>
													<Field
														as={TextField}
														label="Nome"
														name="name"
														error={touched.name && Boolean(errors.name)}
														helperText={touched.name && errors.name}
														variant="outlined"
														fullWidth
													/>
												</Grid>
												<Grid item xs={12} sm={6}>
													<Field
														as={TextField}
														label="Email"
														name="email"
														error={touched.email && Boolean(errors.email)}
														helperText={touched.email && errors.email}
														variant="outlined"
														fullWidth
													/>
												</Grid>
												<Grid item xs={12} sm={6}>
													<Field
														as={TextField}
														label="Cargo/Posição"
														name="position"
														variant="outlined"
														fullWidth
													/>
												</Grid>
												<Grid item xs={12} sm={6}>
													<Field
														as={TextField}
														label="Senha (deixe em branco para não alterar)"
														type="password"
														name="password"
														error={touched.password && Boolean(errors.password)}
														helperText={touched.password && errors.password}
														variant="outlined"
														fullWidth
													/>
												</Grid>
												<Grid item xs={12} sm={6}>
													<Field
														as={TextField}
														label="Início do Expediente"
														type="time"
														name="startWork"
														variant="outlined"
														fullWidth
														InputLabelProps={{ shrink: true }}
													/>
												</Grid>
												<Grid item xs={12} sm={6}>
													<Field
														as={TextField}
														label="Fim do Expediente"
														type="time"
														name="endWork"
														variant="outlined"
														fullWidth
														InputLabelProps={{ shrink: true }}
													/>
												</Grid>

												<Grid item xs={12}>
													<QueueSelect
														selectedQueueIds={selectedQueueIds}
														onChange={(selectedIds) => setSelectedQueueIds(selectedIds)}
													/>
												</Grid>

												<Grid item xs={12}>
													<FormControl variant="outlined" fullWidth>
														<InputLabel>WhatsApp Padrão</InputLabel>
														<Select
															value={whatsappId}
															onChange={(e) => setWhatsappId(e.target.value)}
															label="WhatsApp Padrão"
														>
															<MenuItem value={false}>Nenhum</MenuItem>
															{whatsApps?.map((whatsapp) => (
																<MenuItem key={whatsapp.id} value={whatsapp.id}>
																	{whatsapp.name}
																</MenuItem>
															))}
														</Select>
													</FormControl>
												</Grid>

												<Grid item xs={12}>
													<FormControl variant="outlined" fullWidth>
														<InputLabel>Página Inicial</InputLabel>
														<Field
															as={Select}
															label="Página Inicial"
															name="defaultHomePage"
														>
															<MenuItem value="tickets">Tickets</MenuItem>
															<MenuItem value="dashboard">Dashboard</MenuItem>
															<MenuItem value="tarefas">Tarefas</MenuItem>
															<MenuItem value="contacts">Contatos</MenuItem>
														</Field>
													</FormControl>
												</Grid>

												<Grid item xs={12}>
													<FormControl variant="outlined" fullWidth>
														<InputLabel>Tema Padrão</InputLabel>
														<Field
															as={Select}
															label="Tema Padrão"
															name="defaultTheme"
														>
															<MenuItem value="light">Claro</MenuItem>
															<MenuItem value="dark">Escuro</MenuItem>
														</Field>
													</FormControl>
												</Grid>
											</Grid>

											<Box mt={3} display="flex" justifyContent="flex-end">
												<Button
													type="submit"
													variant="contained"
													className={classes.saveButton}
													disabled={isSubmitting}
												>
													{isSubmitting ? <CircularProgress size={24} /> : "Salvar Alterações"}
												</Button>
											</Box>
										</Form>
									)}
								</Formik>
							</Box>
						)}

						{tabValue === (isAdmin ? 1 : 0) && renderPerfilCargo()}
						{tabValue === (isAdmin ? 2 : 1) && renderHolerites()}
					</Card>
				</Grid>

				<Grid item xs={12} md={4}>
					<Card className={classes.card}>
						<CardHeader
							title="Informações"
							className={classes.cardHeader}
							avatar={<BusinessIcon color="primary" />}
						/>
						<CardContent>
							<List dense>
								{user.position && (
									<ListItem>
										<ListItemText
											primary="Cargo"
											secondary={user.position}
										/>
									</ListItem>
								)}
								{user.email && (
									<ListItem>
										<ListItemText
											primary="Email"
											secondary={user.email}
										/>
									</ListItem>
								)}
								{user.departamentos && user.departamentos.length > 0 && (
									<ListItem>
										<ListItemText
											primary="Departamento"
											secondary={user.departamentos[0].nome}
										/>
									</ListItem>
								)}
								<ListItem>
									<ListItemText
										primary="Expediente"
										secondary={`${user.startWork || "00:00"} - ${user.endWork || "23:59"}`}
									/>
								</ListItem>
							</List>
						</CardContent>
					</Card>

					{user.queues && user.queues.length > 0 && (
						<Card className={classes.card}>
							<CardHeader
								title="Filas de Atendimento"
								className={classes.cardHeader}
								avatar={<AssignmentIcon color="primary" />}
							/>
							<CardContent>
								<Box display="flex" flexWrap="wrap" gap={1}>
									{user.queues.map((queue) => (
										<Chip
											key={queue.id}
											label={queue.name}
											size="small"
											style={{ backgroundColor: queue.color, color: "#fff" }}
										/>
									))}
								</Box>
							</CardContent>
						</Card>
					)}
				</Grid>
			</Grid>
		</div>
	);
};

export default Profile;
