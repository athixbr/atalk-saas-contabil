import React, { useState, useEffect } from "react";
import { Avatar, CardHeader, Chip, Box } from "@material-ui/core";
import { AccessTime, Warning } from "@material-ui/icons";
import { i18n } from "../../translate/i18n";
import { makeStyles } from "@material-ui/core/styles";
import { differenceInMinutes, parseISO } from "date-fns";

const useStyles = makeStyles(theme => ({
	userQueueStyle: {
		// position: "absolute",
		marginRight: 5,
		// left: 10,
		// bottom: 5,
		color: "#ffffff",
		// background: theme.palette.total,
		padding: "1px 5px",
		borderRadius: "3px",
		fontWeight: 'bold',
		fontSize: "0.8em",
		display: "inline-flex"
	},
	inactivityWarning: {
		backgroundColor: "#fff3cd",
		color: "#856404",
		fontWeight: "bold",
		marginTop: "4px",
		"& .MuiChip-icon": {
			color: "#ff9800"
		}
	},
	inactivityCritical: {
		backgroundColor: "#f8d7da",
		color: "#721c24",
		fontWeight: "bold",
		marginTop: "4px",
		"& .MuiChip-icon": {
			color: "#dc3545"
		}
	},
}));

const TicketInfo = ({ contact, ticket, onClick }) => {
	const classes = useStyles();
	
	const { user } = ticket
	const [userName, setUserName] = useState('')
	const [contactName, setContactName] = useState('')
	const [inactivityMinutes, setInactivityMinutes] = useState(0)

	useEffect(() => {
		if (contact) {
			setContactName(contact.name);
			if (document.body.offsetWidth < 600) {
				if (contact.name.length > 10) {
					const truncadName = contact.name.substring(0, 10) + '...';
					setContactName(truncadName);
				}
			}
		}

		if (user && contact) {
			setUserName(`${i18n.t("messagesList.header.assignedTo")} ${user.name}`);

			if (document.body.offsetWidth < 600) {
				setUserName(`${user.name}`);
			}
		}

		// Calcular tempo de inatividade
		if (ticket.status === "open" && ticket.updatedAt) {
			const updateInterval = setInterval(() => {
				const minutes = differenceInMinutes(new Date(), parseISO(ticket.updatedAt));
				setInactivityMinutes(minutes);
			}, 30000); // Atualiza a cada 30 segundos

			// Calcula imediatamente
			const minutes = differenceInMinutes(new Date(), parseISO(ticket.updatedAt));
			setInactivityMinutes(minutes);

			return () => clearInterval(updateInterval);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ticket.updatedAt, ticket.status])

	const renderInactivityChip = () => {
		if (ticket.status !== "open" || inactivityMinutes < 30) return null;

		const isCritical = inactivityMinutes >= 50;
		const chipClass = isCritical ? classes.inactivityCritical : classes.inactivityWarning;
		const icon = isCritical ? <Warning /> : <AccessTime />;
		const label = isCritical 
			? `⚠️ ${inactivityMinutes} min sem resposta - Retorna em ${60 - inactivityMinutes} min`
			: `${inactivityMinutes} min sem resposta`;

		return (
			<Chip
				size="small"
				icon={icon}
				label={label}
				className={chipClass}
			/>
		);
	};

	return (
		<Box>
			<CardHeader
				onClick={onClick}
				style={{ cursor: "pointer" }}
				titleTypographyProps={{ noWrap: true }}
				subheaderTypographyProps={{ noWrap: true }}
				avatar={
					<Avatar
						src={`${ticket?.contact?.urlPicture}`}					
						alt="contact_image"
						style={{
							width: "50px",
							height: "50px",
							borderRadius: "50%"
						}}
					/>}
				title={`${contactName} #${ticket.id}`}
				subheader={ticket.user && `${userName}`}
			/>
			{renderInactivityChip()}
		</Box>
	);
};

export default TicketInfo;
