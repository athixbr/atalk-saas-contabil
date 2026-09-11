import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

const useStyles = makeStyles(theme => ({
	mainContainer: {
		flex: 1,
		padding: theme.spacing(2),
		height: '100vh',
	},

	contentWrapper: {
		height: "100%",
		overflowY: "hidden",
		display: "flex",
		flexDirection: "column",
	},
}));

const MainContainer = ({ children, fullWidth = false }) => {
	const classes = useStyles();

	return (
		<Container className={classes.mainContainer} maxWidth={fullWidth ? false : "lg"} disableGutters={fullWidth}>
			<div className={classes.contentWrapper}>{children}</div>
		</Container>
	);
};

export default MainContainer;
