import React, { useContext, useEffect, useRef, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import MoveToInboxIcon from "@material-ui/icons/MoveToInbox";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import MergeTypeIcon from "@material-ui/icons/MergeType";
import CallMergeIcon from "@material-ui/icons/CallMerge";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import Badge from "@material-ui/core/Badge";

import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";

import NewTicketModal from "../NewTicketModal";
import MergeTicketModal from "../MergeTicketModal";
import TicketsList from "../TicketsList";
import TabPanel from "../TabPanel";

import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import TicketsQueueSelect from "../TicketsQueueSelect";
import { Button } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
	ticketsWrapper: {
		position: "relative",
		display: "flex",
		height: "100%",
		flexDirection: "column",
		overflow: "hidden",
		borderTopRightRadius: 0,
		borderBottomRightRadius: 0,
	},

	tabsHeader: {
		flex: "none",
		backgroundColor: theme.palette.tabHeaderBackground,
	},

	settingsIcon: {
		alignSelf: "center",
		marginLeft: "auto",
		padding: 8,
	},

	tab: {
		minWidth: 120,
		width: 120,
	},

	ticketOptionsBox: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		// background: "#fafafa",
		background: theme.palette.optionsBackground,
		padding: theme.spacing(1),
	},

	serachInputWrapper: {
		flex: 1,
		// background: "#fff",
		background: theme.palette.total,
		display: "flex",
		borderRadius: 40,
		padding: 4,
		marginRight: theme.spacing(1),
	},

	searchIcon: {
		color: "grey",
		marginLeft: 6,
		marginRight: 6,
		alignSelf: "center",
	},

	searchInput: {
		flex: 1,
		border: "none",
		borderRadius: 30,
	},
}));

const TicketsManager = () => {
	const classes = useStyles();

	const [searchParam, setSearchParam] = useState("");
	const [tab, setTab] = useState("open");
	const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
	const [showAllTickets, setShowAllTickets] = useState(false);
	const [mergeMode, setMergeMode] = useState(false);
	const [selectedForMerge, setSelectedForMerge] = useState([]);
	const [mergeModalOpen, setMergeModalOpen] = useState(false);
	const searchInputRef = useRef();
	const { user } = useContext(AuthContext);

	const userQueueIds = user.queues.map(q => q.id);
	const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);

	useEffect(() => {
		if (tab === "search") {
			searchInputRef.current.focus();
		}
	}, [tab]);

	let searchTimeout;

	const handleSearch = e => {
		const searchedTerm = e.target.value.toLowerCase();

		clearTimeout(searchTimeout);

		if (searchedTerm === "") {
			setSearchParam(searchedTerm);
			// setTab("open");
			return;
		}

		searchTimeout = setTimeout(() => {
			setSearchParam(searchedTerm);
		}, 500);
	};

	const handleChangeTab = (e, newValue) => {
		setTab(newValue);
	};

	const handleToggleMergeMode = () => {
		setMergeMode(prev => !prev);
		setSelectedForMerge([]);
	};

	const handleToggleSelectForMerge = (ticket) => {
		setSelectedForMerge(prev => {
			const alreadySelected = prev.some(t => t.id === ticket.id);
			if (alreadySelected) {
				return prev.filter(t => t.id !== ticket.id);
			}
			if (prev.length >= 2) return prev;
			return [...prev, ticket];
		});
	};

	const handleMergeSuccess = (masterTicketId) => {
		setMergeMode(false);
		setSelectedForMerge([]);
	};

	return (
		<Paper elevation={0} variant="outlined" className={classes.ticketsWrapper}>
			<NewTicketModal
				modalOpen={newTicketModalOpen}
				onClose={e => setNewTicketModalOpen(false)}
			/>
			<MergeTicketModal
				open={mergeModalOpen}
				onClose={() => setMergeModalOpen(false)}
				ticketA={selectedForMerge[0]}
				ticketB={selectedForMerge[1]}
				onMergeSuccess={handleMergeSuccess}
			/>
			<Paper elevation={0} square className={classes.tabsHeader}>
				<Tabs
					value={tab}
					onChange={handleChangeTab}
					variant="fullWidth"
					indicatorColor="primary"
					textColor="primary"
					aria-label="icon label tabs example"
				>
					<Tab
						value={"open"}
						icon={<MoveToInboxIcon />}
						label={i18n.t("tickets.tabs.open.title")}
						classes={{ root: classes.tab }}
					/>
					<Tab
						value={"closed"}
						icon={<CheckBoxIcon />}
						label={i18n.t("tickets.tabs.closed.title")}
						classes={{ root: classes.tab }}
					/>
					<Tab
						value={"search"}
						icon={<SearchIcon />}
						label={i18n.t("tickets.tabs.search.title")}
						classes={{ root: classes.tab }}
					/>
				</Tabs>
			</Paper>
			<Paper square elevation={0} className={classes.ticketOptionsBox}>
				{tab === "search" ? (
					<div className={classes.serachInputWrapper}>
						<SearchIcon className={classes.searchIcon} />
						<InputBase
							className={classes.searchInput}
							inputRef={searchInputRef}
							placeholder={i18n.t("tickets.search.placeholder")}
							type="search"
							onChange={handleSearch}
						/>
					</div>
				) : (
					<>
						{!mergeMode ? (
							<Button
								variant="outlined"
								color="primary"
								onClick={() => setNewTicketModalOpen(true)}
							>
								{i18n.t("ticketsManager.buttons.newTicket")}
							</Button>
						) : (
							<Button
								variant="contained"
								color="secondary"
								size="small"
								onClick={handleToggleMergeMode}
								style={{ marginRight: 4 }}
							>
								Cancelar
							</Button>
						)}
						{mergeMode && selectedForMerge.length === 2 && (
							<Button
								variant="contained"
								color="primary"
								size="small"
								onClick={() => setMergeModalOpen(true)}
								style={{ marginRight: 4 }}
							>
								Mesclar ({selectedForMerge.length})
							</Button>
						)}
						<Can
							role={user.profile}
							perform="tickets-manager:showall"
							yes={() => (
								<>
									{!mergeMode && (
										<FormControlLabel
											label={i18n.t("tickets.buttons.showAll")}
											labelPlacement="start"
											control={
												<Switch
													size="small"
													checked={showAllTickets}
													onChange={() =>
														setShowAllTickets(prevState => !prevState)
													}
													name="showAllTickets"
													color="primary"
												/>
											}
										/>
									)}
									<Tooltip title={mergeMode ? "Sair do modo agrupar" : "Agrupar tickets duplicados"}>
										<IconButton
											size="small"
											color={mergeMode ? "secondary" : "default"}
											onClick={handleToggleMergeMode}
											style={{ marginLeft: 4 }}
										>
											<Badge
												badgeContent={mergeMode && selectedForMerge.length > 0 ? selectedForMerge.length : 0}
												color="primary"
											>
												<CallMergeIcon />
											</Badge>
										</IconButton>
									</Tooltip>
								</>
							)}
						/>
					</>
				)}
				<TicketsQueueSelect
					style={{ marginLeft: 6 }}
					selectedQueueIds={selectedQueueIds}
					userQueues={user?.queues}
					onChange={values => setSelectedQueueIds(values)}
				/>
			</Paper>
			<TabPanel value={tab} name="open" className={classes.ticketsWrapper}>
				<TicketsList
					status="open"
					showAll={showAllTickets}
					selectedQueueIds={selectedQueueIds}
					mergeMode={mergeMode}
					selectedForMerge={selectedForMerge}
					onToggleSelectForMerge={handleToggleSelectForMerge}
				/>
				<TicketsList
					status="pending"
					selectedQueueIds={selectedQueueIds}
					mergeMode={mergeMode}
					selectedForMerge={selectedForMerge}
					onToggleSelectForMerge={handleToggleSelectForMerge}
				/>
			</TabPanel>
			<TabPanel value={tab} name="closed" className={classes.ticketsWrapper}>
				<TicketsList
					status="closed"
					showAll={true}
					selectedQueueIds={selectedQueueIds}
					mergeMode={mergeMode}
					selectedForMerge={selectedForMerge}
					onToggleSelectForMerge={handleToggleSelectForMerge}
				/>
			</TabPanel>
			<TabPanel value={tab} name="search" className={classes.ticketsWrapper}>
				<TicketsList
					status="search"
					searchParam={searchParam}
					showAll={true}
					selectedQueueIds={selectedQueueIds}
					mergeMode={mergeMode}
					selectedForMerge={selectedForMerge}
					onToggleSelectForMerge={handleToggleSelectForMerge}
				/>
			</TabPanel>
		</Paper>
	);
};

export default TicketsManager;
