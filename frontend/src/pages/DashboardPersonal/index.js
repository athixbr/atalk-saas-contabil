import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
	Paper,
	Typography,
	Grid,
	Box,
	Card,
	CardContent,
	CircularProgress,
	useTheme,
	useMediaQuery,
} from "@material-ui/core";
import {
	Assignment as AssignmentIcon,
	CheckCircle as CheckCircleIcon,
	Schedule as ScheduleIcon,
	Warning as WarningIcon,
	TrendingUp as TrendingUpIcon,
} from "@material-ui/icons";
import { Doughnut, Bar } from "react-chartjs-2";
import MomentsUser from "../../components/MomentsUser";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
	root: {
		padding: theme.spacing(3),
		maxWidth: "1400px",
		margin: "0 auto",
		[theme.breakpoints.down("sm")]: {
			padding: theme.spacing(2),
		},
	},
	header: {
		marginBottom: theme.spacing(3),
	},
	title: {
		display: "flex",
		alignItems: "center",
		gap: theme.spacing(2),
		color: theme.palette.primary.main,
		fontWeight: 600,
	},
	statsCard: {
		background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
		borderRadius: "16px",
		transition: "transform 0.2s, box-shadow 0.2s",
		"&:hover": {
			transform: "translateY(-4px)",
			boxShadow: theme.shadows[8],
		},
	},
	statsCardContent: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		padding: theme.spacing(2),
	},
	statsNumber: {
		fontSize: "2rem",
		fontWeight: "bold",
		marginBottom: theme.spacing(0.5),
	},
	statsLabel: {
		color: theme.palette.text.secondary,
		fontSize: "0.875rem",
	},
	statsIcon: {
		fontSize: "2.5rem",
	},
	paper: {
		padding: theme.spacing(3),
		borderRadius: "16px",
		marginBottom: theme.spacing(3),
	},
	chartCard: {
		borderRadius: "16px",
		padding: theme.spacing(2),
	},
	chartTitle: {
		fontWeight: 600,
		marginBottom: theme.spacing(2),
		color: theme.palette.text.primary,
	},
	chartContainer: {
		height: 300,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	momentsContainer: {
		marginTop: theme.spacing(3),
	},
}));

const DashboardPersonal = () => {
	const classes = useStyles();
	const { user: loggedInUser } = useContext(AuthContext);
	const [taskStats, setTaskStats] = useState(null);
	const [loadingStats, setLoadingStats] = useState(true);
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

	useEffect(() => {
		const fetchTaskStats = async () => {
			if (!loggedInUser?.id) return;
			setLoadingStats(true);
			try {
				const { data } = await api.get(`/tasks/stats/${loggedInUser.id}`);
				setTaskStats(data);
			} catch (err) {
				console.error("Erro ao carregar estatísticas:", err);
				setTaskStats({
					stats: [],
					recentCompleted: 0,
					tasksByMonth: [],
					totalTasks: 0,
					overdueTasks: 0,
				});
			} finally {
				setLoadingStats(false);
			}
		};

		fetchTaskStats();
	}, [loggedInUser]);

	const getStatsCardData = () => {
		if (!taskStats || loadingStats) return [];

		const statusMap =
			taskStats.stats?.reduce((acc, stat) => {
				acc[stat.status] = parseInt(stat.count);
				return acc;
			}, {}) || {};

		return [
			{
				title: "Total de Tarefas",
				value: taskStats.totalTasks || 0,
				icon: <AssignmentIcon className={classes.statsIcon} />,
				color: "#3f51b5",
			},
			{
				title: "Concluídas (30 dias)",
				value: taskStats.recentCompleted || 0,
				icon: <CheckCircleIcon className={classes.statsIcon} />,
				color: "#4caf50",
			},
			{
				title: "Em Andamento",
				value: statusMap["Em Andamento"] || 0,
				icon: <ScheduleIcon className={classes.statsIcon} />,
				color: "#ff9800",
			},
			{
				title: "Atrasadas",
				value: taskStats.overdueTasks || 0,
				icon: <WarningIcon className={classes.statsIcon} />,
				color: "#f44336",
			},
		];
	};

	const getTasksByStatusData = () => {
		if (!taskStats?.stats || taskStats.stats.length === 0) {
			return {
				labels: ["Aguardando", "Em Andamento", "Concluída"],
				datasets: [
					{
						label: "Tarefas por Status",
						data: [0, 0, 0],
						backgroundColor: ["#2196f3", "#ff9800", "#4caf50"],
						borderColor: ["#2196f3", "#ff9800", "#4caf50"],
						borderWidth: 2,
					},
				],
			};
		}

		const labels = taskStats.stats.map((s) => s.status);
		const data = taskStats.stats.map((s) => parseInt(s.count));
		const colors = [
			"#4caf50",
			"#ff9800",
			"#f44336",
			"#2196f3",
			"#9c27b0",
			"#00bcd4",
		];

		return {
			labels,
			datasets: [
				{
					label: "Tarefas por Status",
					data,
					backgroundColor: colors.slice(0, labels.length),
					borderColor: colors.slice(0, labels.length),
					borderWidth: 2,
				},
			],
		};
	};

	const getTasksByMonthData = () => {
		if (!taskStats?.tasksByMonth || taskStats.tasksByMonth.length === 0) {
			const months = [];
			const now = new Date();
			for (let i = 5; i >= 0; i--) {
				const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
				months.push(
					date.toLocaleDateString("pt-BR", {
						month: "short",
						year: "2-digit",
					})
				);
			}
			return {
				labels: months,
				datasets: [
					{
						label: "Concluídas",
						data: [0, 0, 0, 0, 0, 0],
						backgroundColor: "#4caf50",
						borderColor: "#4caf50",
						borderWidth: 2,
					},
					{
						label: "Em Andamento",
						data: [0, 0, 0, 0, 0, 0],
						backgroundColor: "#ff9800",
						borderColor: "#ff9800",
						borderWidth: 2,
					},
				],
			};
		}

		const monthsMap = {};
		taskStats.tasksByMonth.forEach((item) => {
			if (!monthsMap[item.month]) {
				monthsMap[item.month] = {};
			}
			monthsMap[item.month][item.status] = parseInt(item.count);
		});

		const months = Object.keys(monthsMap).sort();
		const statuses = [
			...new Set(taskStats.tasksByMonth.map((item) => item.status)),
		];

		const datasets = statuses.map((status, index) => {
			const colors = [
				"#4caf50",
				"#ff9800",
				"#f44336",
				"#2196f3",
				"#9c27b0",
			];
			return {
				label: status,
				data: months.map((month) => monthsMap[month][status] || 0),
				backgroundColor: colors[index % colors.length],
				borderColor: colors[index % colors.length],
				borderWidth: 2,
			};
		});

		return {
			labels: months.map((m) => {
				const [year, month] = m.split("-");
				const date = new Date(year, month - 1);
				return date.toLocaleDateString("pt-BR", {
					month: "short",
					year: "2-digit",
				});
			}),
			datasets,
		};
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: isMobile ? "bottom" : "top",
			},
		},
	};

	return (
		<div className={classes.root}>
			{/* Header */}
			<div className={classes.header}>
				<Typography variant="h4" className={classes.title}>
					📊 Meu Dashboard
				</Typography>
				<Typography variant="body2" color="textSecondary">
					Visão geral dos seus atendimentos e tarefas
				</Typography>
			</div>

			{/* Cards de Estatísticas de Tarefas */}
			{loadingStats ? (
				<Box display="flex" justifyContent="center" p={4}>
					<CircularProgress />
				</Box>
			) : (
				<>
					<Grid container spacing={3} style={{ marginBottom: 24 }}>
						{getStatsCardData().map((stat, index) => (
							<Grid item xs={12} sm={6} md={3} key={index}>
								<Paper className={classes.statsCard} elevation={2}>
									<CardContent className={classes.statsCardContent}>
										<Box>
											<Typography
												className={classes.statsNumber}
												style={{ color: stat.color }}
											>
												{stat.value}
											</Typography>
											<Typography
												variant="body2"
												className={classes.statsLabel}
											>
												{stat.title}
											</Typography>
										</Box>
										<Box style={{ color: stat.color }}>{stat.icon}</Box>
									</CardContent>
								</Paper>
							</Grid>
						))}
					</Grid>

					{/* Gráficos de Tarefas */}
					<Grid container spacing={3} style={{ marginBottom: 32 }}>
						<Grid item xs={12} md={6}>
							<Paper className={classes.chartCard} elevation={2}>
								<Typography variant="h6" className={classes.chartTitle}>
									📈 Tarefas por Status
								</Typography>
								<Box className={classes.chartContainer}>
									<Doughnut
										data={getTasksByStatusData()}
										options={chartOptions}
									/>
								</Box>
							</Paper>
						</Grid>

						<Grid item xs={12} md={6}>
							<Paper className={classes.chartCard} elevation={2}>
								<Typography variant="h6" className={classes.chartTitle}>
									📅 Atividades nos Últimos 6 Meses
								</Typography>
								<Box className={classes.chartContainer}>
									<Bar
										data={getTasksByMonthData()}
										options={chartOptions}
									/>
								</Box>
							</Paper>
						</Grid>
					</Grid>
				</>
			)}

			{/* Moments - Atendimentos em Tempo Real */}
			<Paper className={classes.paper} elevation={2}>
				<Typography variant="h6" className={classes.chartTitle}>
					💬 Meus Atendimentos em Tempo Real
				</Typography>
				<Box className={classes.momentsContainer}>
					<MomentsUser />
				</Box>
			</Paper>
		</div>
	);
};

export default DashboardPersonal;
