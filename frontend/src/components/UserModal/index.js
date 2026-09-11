import React, { useState, useEffect, useContext, useRef } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Typography from "@material-ui/core/Typography";
import Chip from "@material-ui/core/Chip";
import whatsappIcon from '../../assets/nopicture.png'
import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";
import { AuthContext } from "../../context/Auth/AuthContext";
import useWhatsApps from "../../hooks/useWhatsApps";

import { Can } from "../Can";
import { Avatar, Input } from "@material-ui/core";
import { getBackendUrl } from "../../config";

const backendUrl = getBackendUrl();

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	multFieldLine: {
		display: "flex",
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(1),
		},
	},
	btnWrapper: {
		position: "relative",
	},
	buttonProgress: {
		color: green[500],
		position: "absolute",
		top: "50%",
		left: "50%",
		marginTop: -12,
		marginLeft: -12,
	},
	formControl: {
		margin: theme.spacing(1),
		minWidth: 120,
	},
	textField: {
		marginRight: theme.spacing(1),
		flex: 1,
	},
	container: {
		display: 'flex',
		flexWrap: 'wrap',
	},
	avatar: {
		width: theme.spacing(12),
		height: theme.spacing(12),
		margin: theme.spacing(2),
		cursor: 'pointer',
		borderRadius: '50%',
		border: '2px solid #ccc',
	},
	updateDiv: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
	},
	updateInput: {
		display: 'none',
	},
	updateLabel: {
		padding: theme.spacing(1),
		margin: theme.spacing(1),
		textTransform: 'uppercase',
		textAlign: 'center',
		cursor: 'pointer',
		border: '2px solid #ccc',
		borderRadius: '5px',
		minWidth: 160,
		fontWeight: 'bold',
		color: '#555',
	},
	errorUpdate: {
		border: '2px solid red',
	},
	errorText: {
		color: 'red',
		fontSize: '0.8rem',
		fontWeight: 'bold',
	},
	deptRow: {
		display: 'flex',
		alignItems: 'center',
		padding: '6px 8px',
		borderRadius: 6,
		marginBottom: 4,
		border: '1px solid',
		borderColor: theme.palette.divider,
		gap: 8,
	},
	deptRowSelected: {
		borderColor: theme.palette.primary.main,
		backgroundColor: theme.palette.action.selected,
	},
	deptName: {
		flex: 1,
		fontWeight: 500,
	},
	roleRadios: {
		display: 'flex',
		flexDirection: 'row',
		gap: 0,
	},
}));

const UserSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
	password: Yup.string().min(5, "Too Short!").max(50, "Too Long!"),
	email: Yup.string().email("Invalid email").required("Required"),
});

const UserModal = ({ open, onClose, userId }) => {
	const classes = useStyles();

	const initialState = {
		name: "",
		email: "",
		password: "",
		profile: "user",
		startWork: "00:00",
		endWork: "23:59",
		farewellMessage: "",
		allTicket: "disable",
		allowGroup: false,
		defaultTheme: "light",
		defaultMenu: "open",
		wpp: "",
		isActive: true,
	};

	const { user: loggedInUser } = useContext(AuthContext);

	const [user, setUser] = useState(initialState);
	const [selectedQueueIds, setSelectedQueueIds] = useState([]);
	const [selectedQueueIdsRead, setSelectedQueueIdsRead] = useState([]);
	const [whatsappId, setWhatsappId] = useState(false);
	// const [allTicket, setAllTicket] = useState("disable");
	const { loading, whatsApps } = useWhatsApps();
	const [profileUrl, setProfileUrl] = useState(null);
	const [departamentos, setDepartamentos] = useState([]);
	const [selectedDepartamentos, setSelectedDepartamentos] = useState([]);

	const startWorkRef = useRef();
	const endWorkRef = useRef();

	useEffect(() => {
		const fetchDepartamentos = async () => {
			try {
				const { data } = await api.get("/departamentos");
				// A API retorna { departamentos: [...], count: ... }
				setDepartamentos(data.departamentos || data || []);
			} catch (err) {
				console.error("Erro ao carregar departamentos:", err);
				setDepartamentos([]);
			}
		};
		if (open) {
			fetchDepartamentos();
		}
	}, [open]);

	useEffect(() => {
		const fetchUser = async () => {

			if (!userId) return;
			try {
				const { data } = await api.get(`/users/${userId}`);
				setUser(prevState => {
					return { ...prevState, ...data };
				});

				const { profileImage } = data;
				setProfileUrl(`${backendUrl}/public/company${data.companyId}/user/${profileImage}`);

				const userQueueIds = data.queues?.map(queue => queue.id);
				setSelectedQueueIds(userQueueIds);
				setWhatsappId(data.whatsappId ? data.whatsappId : '');
				
				// Load user's departamentos
				if (data.departamentos && data.departamentos.length > 0) {
					const userDepts = data.departamentos.map(dept => ({
						departamentoId: dept.id,
						isCoordenador: dept.DepartamentoUsuario?.isCoordenador || false
					}));
					setSelectedDepartamentos(userDepts);
				}
			} catch (err) {
				toastError(err);
			}
		};

		fetchUser();
	}, [userId, open]);

	const handleClose = () => {
		onClose();
		setUser(initialState);
		setSelectedDepartamentos([]);
	};

	const handleSaveUser = async values => {
		const uploadAvatar = async (file) => {
			const formData = new FormData();
			formData.append('userId', file.id);
			formData.append('typeArch', "user");
			formData.append('profileImage', file.profileImage);

			const { data } = await api.post(`/users/${file.id}/media-upload`, formData);

			localStorage.setItem("profileImage", data.user.profileImage);

		}
		const userData = { 
			...values, 
			whatsappId, 
			queueIds: selectedQueueIds,
			departamentos: selectedDepartamentos
		};
		try {
			if (userId) {
				const { data } = await api.put(`/users/${userId}`, userData);
				window.localStorage.setItem("preferredTheme", values.defaultTheme);

				if (user.profileImage && typeof user.profileImage === 'object')
					uploadAvatar(user)
			} else {
				const { data } = await api.post("/users", userData);
				window.localStorage.setItem("preferredTheme", values.defaultTheme);

				if (user.profileImage && user.avatar)
					uploadAvatar(user)
			}

			toast.success(i18n.t("userModal.success"));
		} catch (err) {
			toastError(err);
		}
		handleClose();
	};

	const handleUpdateProfileImage = (e) => {
		if (!e.target.files[0]) return;

		const newAvatarUrl = URL.createObjectURL(e.target.files[0]);
		setUser(prevState => ({
			...prevState,
			avatar: newAvatarUrl,
			profileImage: e.target.files[0]
		}));
		setProfileUrl(newAvatarUrl);
	};

	const handleToggleDepartamento = (departamentoId) => {
		setSelectedDepartamentos(prev => {
			const exists = prev.find(d => d.departamentoId === departamentoId);
			if (exists) {
				return prev.filter(d => d.departamentoId !== departamentoId);
			} else {
				return [...prev, { departamentoId, isCoordenador: false }];
			}
		});
	};

	const handleToggleCoordenador = (departamentoId) => {
		setSelectedDepartamentos(prev => 
			prev.map(d => 
				d.departamentoId === departamentoId 
					? { ...d, isCoordenador: !d.isCoordenador }
					: d
			)
		);
	};

	return (
		<div className={classes.root}>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="md"
				fullWidth
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title">
					{userId
						? `${i18n.t("userModal.title.edit")}`
						: `${i18n.t("userModal.title.add")}`}
				</DialogTitle>
				<Formik
					initialValues={user}
					enableReinitialize={true}
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
							<DialogContent dividers>
								<FormControl className={classes.updateDiv}>
									<label htmlFor="profileImage">
										<Avatar
											src={profileUrl ? profileUrl : whatsappIcon}
											alt="profile-image"
											className={`${classes.avatar} ${touched.profileImage && errors.profileImage ? classes.errorUpdate : ''}`}
										/>
									</label>
									<FormControl className={classes.updateDiv}>
										<label htmlFor="profileImage"
											className={`${classes.updateLabel} ${touched.profileImage && errors.profileImage ? classes.errorUpdate : ''}`}
										>
											{profileUrl ? i18n.t("userModal.title.updateImage") : i18n.t("userModal.buttons.addImage")}
										</label>
										{
											touched.profileImage && errors.profileImage && (
												<span className={classes.errorText}>{errors.profileImage}</span>)
										}
										<Input
											type="file"
											name="profileImage"
											id="profileImage"
											className={classes.updateInput}
											onChange={event => handleUpdateProfileImage(event)}
										/>
									</FormControl>
									{user.avatar &&
										<Button
											variant="outlined"
											color="secondary"
											onClick={() => {
												setUser(prevState => ({ ...prevState, avatar: null, profileImage: null }));
												setProfileUrl(whatsappIcon);
											}}
										>
											{i18n.t("userModal.title.removeImage")}
										</Button>
									}
								</FormControl>
								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label={i18n.t("userModal.form.name")}
										autoFocus
										name="name"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										margin="dense"
										fullWidth
									/>
									<Field
										as={TextField}
										label={i18n.t("userModal.form.password")}
										type="password"
										name="password"
										error={touched.password && Boolean(errors.password)}
										helperText={touched.password && errors.password}
										variant="outlined"
										margin="dense"
										fullWidth
									/>
								</div>

								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label={i18n.t("userModal.form.email")}
										name="email"
										error={touched.email && Boolean(errors.email)}
										helperText={touched.email && errors.email}
										variant="outlined"
										margin="dense"
										fullWidth
									/>
									<FormControl
										variant="outlined"
										className={classes.formControl}
										margin="dense"
									>
										<Can
											role={loggedInUser.profile}
											perform="user-modal:editProfile"
											yes={() => (
												<>
													<InputLabel id="profile-selection-input-label">
														{i18n.t("userModal.form.profile")}
													</InputLabel>

													<Field
														as={Select}
														label={i18n.t("userModal.form.profile")}
														name="profile"
														labelId="profile-selection-label"
														id="profile-selection"
														required
													>
														<MenuItem value="admin">Admin</MenuItem>
														<MenuItem value="user">User</MenuItem>
													</Field>
												</>
											)}
										/>
									</FormControl>
								</div>
								<div className={classes.multFieldLine}>
									<Field
										as={TextField}
										label={i18n.t("contactModal.form.number")}
										name="wpp"
										placeholder="5513912344321"
										error={touched.wpp && Boolean(errors.wpp)}
										helperText={touched.wpp && errors.wpp}
										variant="outlined"
										margin="dense"
										fullWidth
									/>

								</div>
								<div className={classes.multFieldLine}>
									<FormControl
										variant="outlined"
										className={classes.formControl}
										margin="dense"
										fullWidth
									>
										<InputLabel id="user-active-selection-label">
											Status do usuário
										</InputLabel>
										<Field
											as={Select}
											label="Status do usuário"
											name="isActive"
											labelId="user-active-selection-label"
											id="user-active-selection"
										>
											<MenuItem value={true}>Ativo</MenuItem>
											<MenuItem value={false}>Inativo</MenuItem>
										</Field>
									</FormControl>
								</div>
								<Can
									role={loggedInUser.profile}
									perform="user-modal:editQueues"
									yes={() => (
										<QueueSelect
											selectedQueueIds={selectedQueueIds}
											onChange={values => setSelectedQueueIds(values)}
											fullWidth
										/>
									)}
								/>
								<Can
									role={loggedInUser.profile}
									perform="user-modal:editQueues"
									yes={() => (
										<>
											<QueueSelect
												selectedQueueIds={selectedQueueIdsRead}
												onChange={values => setSelectedQueueIdsRead(values)}
												fullWidth
												label={"RO"}
											/>
										</>
									)}
								/>
								<Can
									role={loggedInUser.profile}
									perform="user-modal:editProfile"
									yes={() => (
										<FormControl variant="outlined" margin="dense" className={classes.maxWidth} fullWidth>
											<InputLabel>
												{i18n.t("userModal.form.whatsapp")}
											</InputLabel>
											<Field
												as={Select}
												value={whatsappId}
												onChange={(e) => setWhatsappId(e.target.value)}
												label={i18n.t("userModal.form.whatsapp")}

											>
												<MenuItem value={''}>&nbsp;</MenuItem>
												{whatsApps.map((whatsapp) => (
													<MenuItem key={whatsapp.id} value={whatsapp.id}>{whatsapp.name}</MenuItem>
												))}
											</Field>
										</FormControl>
									)}
								/>
								<Can
									role={loggedInUser.profile}
									perform="user-modal:editProfile"
									yes={() => (
										<div className={classes.multFieldLine}>
											<Field
												as={TextField}
												label={i18n.t("userModal.form.startWork")}
												type="time"
												ampm={"false"}
												inputRef={startWorkRef}
												InputLabelProps={{
													shrink: true,
												}}
												inputProps={{
													step: 600, // 5 min
												}}
												fullWidth
												name="startWork"
												error={
													touched.startWork && Boolean(errors.startWork)
												}
												helperText={
													touched.startWork && errors.startWork
												}
												variant="outlined"
												margin="dense"
												className={classes.textField}
											/>
											<Field
												as={TextField}
												label={i18n.t("userModal.form.endWork")}
												type="time"
												ampm={"false"}
												inputRef={endWorkRef}
												InputLabelProps={{
													shrink: true,
												}}
												inputProps={{
													step: 600, // 5 min
												}}
												fullWidth
												name="endWork"
												error={
													touched.endWork && Boolean(errors.endWork)
												}
												helperText={
													touched.endWork && errors.endWork
												}
												variant="outlined"
												margin="dense"
												className={classes.textField}
											/>
										</div>
									)}
								/>

								<Field
									as={TextField}
									label={i18n.t("userModal.form.farewellMessage")}
									type="farewellMessage"
									multiline
									rows={4}
									fullWidth
									name="farewellMessage"
									error={touched.farewellMessage && Boolean(errors.farewellMessage)}
									helperText={touched.farewellMessage && errors.farewellMessage}
									variant="outlined"
									margin="dense"
								/>
								<div className={classes.multFieldLine}>
									<Can
										role={loggedInUser.profile}
										perform="user-modal:editProfile"
										yes={() =>
											<FormControl
												variant="outlined"
												className={classes.maxWidth}
												margin="dense"
												fullWidth
											>
												<>
													<InputLabel >
														{i18n.t("userModal.form.allTicket")}
													</InputLabel>

													<Field
														as={Select}
														label={i18n.t("userModal.form.allTicket")}
														name="allTicket"
														type="allTicket"
														required
													>
														<MenuItem value="enable">{i18n.t("userModal.form.allTicketEnable")}</MenuItem>
														<MenuItem value="disable">{i18n.t("userModal.form.allTicketDisable")}</MenuItem>
													</Field>
												</>
											</FormControl>
										}
									/>
									<Can
										role={loggedInUser.profile}
										perform="user-modal:editProfile"
										yes={() =>
											<FormControl
												variant="outlined"
												className={classes.maxWidth}
												margin="dense"
												fullWidth
											>
												<>
													<InputLabel >
														{i18n.t("userModal.form.allowGroup")}
													</InputLabel>

													<Field
														as={Select}
														label={i18n.t("userModal.form.allowGroup")}
														name="allowGroup"
														type="allowGroup"
														required
													>
														<MenuItem value={true}>{i18n.t("userModal.form.allTicketEnable")}</MenuItem>
														<MenuItem value={false}>{i18n.t("userModal.form.allTicketDisable")}</MenuItem>
													</Field>
												</>
											</FormControl>
										}
									/>
								</div>
								<div className={classes.multFieldLine}>
									<FormControl
										variant="outlined"
										className={classes.maxWidth}
										margin="dense"
										fullWidth
									>
										<>
											<InputLabel >
												{i18n.t("userModal.form.defaultTheme")}
											</InputLabel>

											<Field
												as={Select}
												label={i18n.t("userModal.form.defaultTheme")}
												name="defaultTheme"
												type="defaultTheme"
												required
											>
												<MenuItem value="light">{i18n.t("userModal.form.defaultThemeLight")}</MenuItem>
												<MenuItem value="dark">{i18n.t("userModal.form.defaultThemeDark")}</MenuItem>
											</Field>
										</>
									</FormControl>

									<FormControl
										variant="outlined"
										className={classes.maxWidth}
										margin="dense"
										fullWidth
									>
										<>
											<InputLabel >
												{i18n.t("userModal.form.defaultMenu")}
											</InputLabel>

											<Field
												as={Select}
												label={i18n.t("userModal.form.defaultMenu")}
												name="defaultMenu"
												type="defaultMenu"
												required
											>
												<MenuItem value={"open"}>{i18n.t("userModal.form.defaultMenuOpen")}</MenuItem>
												<MenuItem value={"closed"}>{i18n.t("userModal.form.defaultMenuClosed")}</MenuItem>
											</Field>
										</>
									</FormControl>
								</div>
								
								<Can
									role={loggedInUser.profile}
									perform="user-modal:editProfile"
									yes={() => (
										<div style={{ marginTop: 16 }}>
											<Typography variant="subtitle2" color="textSecondary" style={{ marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, fontSize: 11 }}>
												Departamentos
											</Typography>
											{departamentos && departamentos.length > 0 ? (
												departamentos.map(dept => {
													const selected = selectedDepartamentos.find(d => d.departamentoId === dept.id);
													const isSelected = !!selected;
													const role = selected?.isCoordenador ? 'coordenador' : 'membro';

													return (
														<div
															key={dept.id}
															className={`${classes.deptRow} ${isSelected ? classes.deptRowSelected : ''}`}
														>
															<Checkbox
																checked={isSelected}
																onChange={() => handleToggleDepartamento(dept.id)}
																color="primary"
																size="small"
																style={{ padding: 4 }}
															/>
															<Typography variant="body2" className={classes.deptName}>
																{dept.nome}
															</Typography>
															{isSelected && (
																<RadioGroup
																	row
																	value={role}
																	onChange={(e) => {
																		const isCoordenador = e.target.value === 'coordenador';
																		setSelectedDepartamentos(prev =>
																			prev.map(d =>
																				d.departamentoId === dept.id
																					? { ...d, isCoordenador }
																					: d
																			)
																		);
																	}}
																	className={classes.roleRadios}
																>
																	<FormControlLabel
																		value="membro"
																		control={<Radio size="small" color="primary" />}
																		label={<Typography variant="caption">Membro</Typography>}
																		style={{ marginRight: 4 }}
																	/>
																	<FormControlLabel
																		value="coordenador"
																		control={<Radio size="small" color="secondary" />}
																		label={<Typography variant="caption" color={role === 'coordenador' ? 'secondary' : 'inherit'}>Coordenador</Typography>}
																		style={{ marginRight: 0 }}
																	/>
																</RadioGroup>
															)}
															{!isSelected && (
																<Typography variant="caption" color="textSecondary" style={{ paddingRight: 8 }}>
																	Não vinculado
																</Typography>
															)}
														</div>
													);
												})
											) : (
												<Typography variant="body2" color="textSecondary">
													Nenhum departamento cadastrado
												</Typography>
											)}
										</div>
									)}
								/>
							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("userModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={classes.btnWrapper}
								>
									{userId
										? `${i18n.t("userModal.buttons.okEdit")}`
										: `${i18n.t("userModal.buttons.okAdd")}`}
									{isSubmitting && (
										<CircularProgress
											size={24}
											className={classes.buttonProgress}
										/>
									)}
								</Button>
							</DialogActions>
						</Form>
					)}
				</Formik>
			</Dialog>
		</div>
	);
};

export default UserModal;
