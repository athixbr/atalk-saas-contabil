import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@material-ui/core";
import {
  Assignment,
  HourglassEmpty,
  PlayArrow,
  CheckCircle,
  TrendingUp,
  Warning,
  EmojiEvents,
} from "@material-ui/icons";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import "chart.js/auto";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
  },
  header: {
    marginBottom: theme.spacing(4),
  },
  title: {
    fontWeight: 700,
    background: "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: theme.spacing(1),
  },
  subtitle: {
    color: "#666",
  },
  kpiCard: {
    height: "100%",
    background: "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    transition: "transform 0.3s, box-shadow 0.3s",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
    },
  },
  kpiContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  kpiIcon: {
    fontSize: 48,
    opacity: 0.8,
  },
  kpiValue: {
    fontSize: "2.5rem",
    fontWeight: 700,
    lineHeight: 1,
    marginBottom: theme.spacing(0.5),
  },
  kpiLabel: {
    fontSize: "0.875rem",
    color: "#666",
    fontWeight: 500,
  },
  chartCard: {
    padding: theme.spacing(3),
    borderRadius: "16px",
    height: "100%",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  chartTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  chartContainer: {
    position: "relative",
    height: "300px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  tableCard: {
    padding: theme.spacing(3),
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  filterBar: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    borderRadius: "16px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  overdueRow: {
    backgroundColor: "#ffebee",
  },
  rankingCard: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1),
    borderRadius: "12px",
    backgroundColor: "#f8f9fa",
    transition: "transform 0.2s",
    "&:hover": {
      transform: "translateX(4px)",
      backgroundColor: "#e3f2fd",
    },
  },
  medal: {
    fontSize: 32,
  },
}));

const PainelTarefas = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState("30");
  const [kpis, setKpis] = useState({
    total: 0,
    pendente: 0,
    emAndamento: 0,
    concluida: 0,
  });

  useEffect(() => {
    if (user?.profile === "admin") {
      loadDashboardData();
    }
  }, [filterPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/tasks", {
        params: {
          pageNumber: 1,
          pageSize: 1000, // Carregar todas para análise
        },
      });

      const allTasks = data.tasks || [];
      
      // Filtrar por período
      const filteredTasks = filterTasksByPeriod(allTasks, filterPeriod);
      
      setTasks(filteredTasks);
      calculateKPIs(filteredTasks);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      toast.error("Erro ao carregar dados do painel");
    } finally {
      setLoading(false);
    }
  };

  const filterTasksByPeriod = (tasks, period) => {
    if (period === "all") return tasks;

    const now = new Date();
    const periodDays = parseInt(period);
    const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

    return tasks.filter((task) => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= startDate;
    });
  };

  const calculateKPIs = (tasks) => {
    const kpiData = {
      total: tasks.length,
      pendente: tasks.filter((t) => t.status === "Pendente").length,
      emAndamento: tasks.filter((t) => t.status === "Em Andamento").length,
      concluida: tasks.filter((t) => t.status === "Concluída").length,
    };
    setKpis(kpiData);
  };

  const getStatusChartData = () => {
    return {
      labels: ["Pendente", "Em Andamento", "Concluída", "Cancelada"],
      datasets: [
        {
          data: [
            tasks.filter((t) => t.status === "Pendente").length,
            tasks.filter((t) => t.status === "Em Andamento").length,
            tasks.filter((t) => t.status === "Concluída").length,
            tasks.filter((t) => t.status === "Cancelada").length,
          ],
          backgroundColor: ["#ff9800", "#2196f3", "#4caf50", "#f44336"],
          borderWidth: 0,
        },
      ],
    };
  };

  const getDepartmentChartData = () => {
    const deptCount = {};
    tasks.forEach((task) => {
      const deptName = task.departamento?.nome || "Sem Departamento";
      deptCount[deptName] = (deptCount[deptName] || 0) + 1;
    });

    return {
      labels: Object.keys(deptCount),
      datasets: [
        {
          label: "Tarefas por Departamento",
          data: Object.values(deptCount),
          backgroundColor: "rgba(33, 150, 243, 0.7)",
          borderColor: "rgba(33, 150, 243, 1)",
          borderWidth: 2,
        },
      ],
    };
  };

  const getUserChartData = () => {
    const userCount = {};
    tasks.forEach((task) => {
      const userName = task.user?.name || "Não Atribuído";
      userCount[userName] = (userCount[userName] || 0) + 1;
    });

    // Top 10 usuários
    const sortedUsers = Object.entries(userCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      labels: sortedUsers.map((u) => u[0]),
      datasets: [
        {
          label: "Tarefas por Usuário",
          data: sortedUsers.map((u) => u[1]),
          backgroundColor: "rgba(76, 175, 80, 0.7)",
          borderColor: "rgba(76, 175, 80, 1)",
          borderWidth: 2,
        },
      ],
    };
  };

  const getTimelineChartData = () => {
    const last7Days = [];
    const createdCount = [];
    const completedCount = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      last7Days.push(dateStr);

      const created = tasks.filter((t) => {
        const taskDate = new Date(t.createdAt);
        return taskDate.toDateString() === date.toDateString();
      }).length;

      const completed = tasks.filter((t) => {
        const taskDate = new Date(t.updatedAt);
        return t.status === "Concluída" && taskDate.toDateString() === date.toDateString();
      }).length;

      createdCount.push(created);
      completedCount.push(completed);
    }

    return {
      labels: last7Days,
      datasets: [
        {
          label: "Criadas",
          data: createdCount,
          borderColor: "#2196f3",
          backgroundColor: "rgba(33, 150, 243, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Concluídas",
          data: completedCount,
          borderColor: "#4caf50",
          backgroundColor: "rgba(76, 175, 80, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const getOverdueTasks = () => {
    const now = new Date();
    return tasks
      .filter(
        (t) =>
          t.dueDate &&
          new Date(t.dueDate) < now &&
          t.status !== "Concluída" &&
          t.status !== "Cancelada"
      )
      .sort((a, b) => {
        // Ordenar por prioridade e depois por dias de atraso
        const priorityOrder = { Alta: 1, Média: 2, Baixa: 3 };
        const aPriority = priorityOrder[a.prioridade?.nome] || 999;
        const bPriority = priorityOrder[b.prioridade?.nome] || 999;
        
        if (aPriority !== bPriority) return aPriority - bPriority;
        
        return new Date(a.dueDate) - new Date(b.dueDate);
      })
      .slice(0, 10);
  };

  const getTopUsers = () => {
    const userStats = {};
    
    tasks.forEach((task) => {
      const userName = task.user?.name;
      if (!userName) return;

      if (!userStats[userName]) {
        userStats[userName] = {
          name: userName,
          total: 0,
          completed: 0,
        };
      }

      userStats[userName].total += 1;
      if (task.status === "Concluída") {
        userStats[userName].completed += 1;
      }
    });

    return Object.values(userStats)
      .map((user) => ({
        ...user,
        percentage: user.total > 0 ? Math.round((user.completed / user.total) * 100) : 0,
      }))
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 5);
  };

  const getDaysOverdue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = now - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getMedalIcon = (position) => {
    const medals = ["🥇", "🥈", "🥉"];
    return medals[position] || "🏅";
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  if (user?.profile !== "admin") {
    return (
      <div className={classes.root}>
        <Typography variant="h5" color="error">
          Acesso restrito a administradores
        </Typography>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Typography variant="h4" className={classes.title}>
          📊 Painel de Tarefas
        </Typography>
        <Typography variant="body1" className={classes.subtitle}>
          Visão completa e em tempo real do gerenciamento de tarefas
        </Typography>
      </div>

      {/* Filtro de Período */}
      <Paper className={classes.filterBar}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Período</InputLabel>
              <Select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                label="Período"
              >
                <MenuItem value="7">Últimos 7 dias</MenuItem>
                <MenuItem value="15">Últimos 15 dias</MenuItem>
                <MenuItem value="30">Últimos 30 dias</MenuItem>
                <MenuItem value="60">Últimos 60 dias</MenuItem>
                <MenuItem value="all">Todas</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* KPI Cards */}
      <Grid container spacing={3} style={{ marginBottom: 24 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.kpiCard}>
            <CardContent>
              <div className={classes.kpiContent}>
                <div>
                  <Typography className={classes.kpiValue} style={{ color: "#1976d2" }}>
                    {kpis.total}
                  </Typography>
                  <Typography className={classes.kpiLabel}>Total de Tarefas</Typography>
                </div>
                <Assignment className={classes.kpiIcon} style={{ color: "#1976d2" }} />
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.kpiCard}>
            <CardContent>
              <div className={classes.kpiContent}>
                <div>
                  <Typography className={classes.kpiValue} style={{ color: "#ff9800" }}>
                    {kpis.pendente}
                  </Typography>
                  <Typography className={classes.kpiLabel}>Pendentes</Typography>
                </div>
                <HourglassEmpty className={classes.kpiIcon} style={{ color: "#ff9800" }} />
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.kpiCard}>
            <CardContent>
              <div className={classes.kpiContent}>
                <div>
                  <Typography className={classes.kpiValue} style={{ color: "#2196f3" }}>
                    {kpis.emAndamento}
                  </Typography>
                  <Typography className={classes.kpiLabel}>Em Andamento</Typography>
                </div>
                <PlayArrow className={classes.kpiIcon} style={{ color: "#2196f3" }} />
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className={classes.kpiCard}>
            <CardContent>
              <div className={classes.kpiContent}>
                <div>
                  <Typography className={classes.kpiValue} style={{ color: "#4caf50" }}>
                    {kpis.concluida}
                  </Typography>
                  <Typography className={classes.kpiLabel}>Concluídas</Typography>
                </div>
                <CheckCircle className={classes.kpiIcon} style={{ color: "#4caf50" }} />
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos - Linha Superior */}
      <Grid container spacing={3} style={{ marginBottom: 24 }}>
        <Grid item xs={12} md={6}>
          <Paper className={classes.chartCard}>
            <Typography variant="h6" className={classes.chartTitle}>
              <TrendingUp /> Status das Tarefas
            </Typography>
            <div className={classes.chartContainer}>
              <Doughnut data={getStatusChartData()} options={chartOptions} />
            </div>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper className={classes.chartCard}>
            <Typography variant="h6" className={classes.chartTitle}>
              <TrendingUp /> Tarefas por Departamento
            </Typography>
            <div className={classes.chartContainer}>
              <Bar data={getDepartmentChartData()} options={chartOptions} />
            </div>
          </Paper>
        </Grid>
      </Grid>

      {/* Gráficos - Linha Inferior */}
      <Grid container spacing={3} style={{ marginBottom: 24 }}>
        <Grid item xs={12} md={6}>
          <Paper className={classes.chartCard}>
            <Typography variant="h6" className={classes.chartTitle}>
              <TrendingUp /> Top 10 Usuários
            </Typography>
            <div className={classes.chartContainer}>
              <Bar
                data={getUserChartData()}
                options={{
                  ...chartOptions,
                  indexAxis: "y",
                }}
              />
            </div>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper className={classes.chartCard}>
            <Typography variant="h6" className={classes.chartTitle}>
              <TrendingUp /> Evolução - Últimos 7 Dias
            </Typography>
            <div className={classes.chartContainer}>
              <Line data={getTimelineChartData()} options={chartOptions} />
            </div>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabelas de Destaques */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper className={classes.tableCard}>
            <Typography variant="h6" className={classes.chartTitle}>
              <Warning style={{ color: "#f44336" }} /> Tarefas Atrasadas
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Tarefa</strong></TableCell>
                    <TableCell><strong>Responsável</strong></TableCell>
                    <TableCell><strong>Prioridade</strong></TableCell>
                    <TableCell><strong>Dias Atrasada</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getOverdueTasks().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="textSecondary">
                          🎉 Nenhuma tarefa atrasada!
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    getOverdueTasks().map((task) => (
                      <TableRow key={task.id} className={classes.overdueRow}>
                        <TableCell>{task.tarefaConfig?.titulo || task.title}</TableCell>
                        <TableCell>{task.user?.name || "-"}</TableCell>
                        <TableCell>
                          {task.prioridade && (
                            <Chip
                              label={task.prioridade.nome}
                              size="small"
                              style={{
                                backgroundColor: task.prioridade.cor || "#757575",
                                color: "#fff",
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${getDaysOverdue(task.dueDate)} dias`}
                            size="small"
                            style={{ backgroundColor: "#f44336", color: "#fff" }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper className={classes.tableCard}>
            <Typography variant="h6" className={classes.chartTitle}>
              <EmojiEvents style={{ color: "#ffc107" }} /> Top 5 Produtividade
            </Typography>
            {getTopUsers().length === 0 ? (
              <Box textAlign="center" py={3}>
                <Typography variant="body2" color="textSecondary">
                  Nenhum dado disponível
                </Typography>
              </Box>
            ) : (
              getTopUsers().map((userStat, index) => (
                <Box key={userStat.name} className={classes.rankingCard}>
                  <Typography className={classes.medal}>{getMedalIcon(index)}</Typography>
                  <Box flex={1}>
                    <Typography variant="body1" style={{ fontWeight: 600 }}>
                      {userStat.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {userStat.completed} concluídas de {userStat.total} ({userStat.percentage}%)
                    </Typography>
                  </Box>
                  <Chip
                    label={`${userStat.percentage}%`}
                    size="small"
                    style={{
                      backgroundColor: userStat.percentage >= 70 ? "#4caf50" : "#ff9800",
                      color: "#fff",
                      fontWeight: 600,
                    }}
                  />
                </Box>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default PainelTarefas;
