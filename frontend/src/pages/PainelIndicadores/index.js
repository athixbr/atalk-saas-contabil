import React, { useContext } from "react";
import { Grid1, Notepad2, People } from "iconsax-react";
import AccessTime from "@material-ui/icons/AccessTime";
import DashboardOutlinedIcon from "@material-ui/icons/DashboardOutlined";
import { AuthContext } from "../../context/Auth/AuthContext";
import HubMenu from "../../components/HubMenu";

const PainelIndicadores = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user.profile === "admin";
  const canSeeDashboard = isAdmin || user.showDashboard === "enabled";
  const canSeeRealTime = isAdmin || user.allowRealTime === "enabled";

  const items = [
    {
      title: "Dashboard",
      description: "Indicadores gerais de atendimento e tickets da empresa.",
      icon: <DashboardOutlinedIcon style={{ fontSize: 24, color: "#fff" }} />,
      path: "/",
      hidden: !canSeeDashboard,
    },
    {
      title: "Relatórios",
      description: "Relatórios detalhados de tickets e atendimentos.",
      icon: <Notepad2 size={24} color="#fff" />,
      path: "/reports",
      hidden: !canSeeDashboard,
    },
    {
      title: "Análise de Tempo",
      description: "Tempos médios de espera e atendimento por ticket.",
      icon: <AccessTime style={{ fontSize: 24, color: "#fff" }} />,
      path: "/reports/tickets/time-analysis",
      hidden: !canSeeDashboard,
    },
    {
      title: "Performance",
      description: "Desempenho individual dos usuários no atendimento.",
      icon: <People size={24} color="#fff" />,
      path: "/reports/users/performance",
      hidden: !canSeeDashboard,
    },
    {
      title: "Tempo Real",
      description: "Acompanhamento em tempo real dos atendimentos.",
      icon: <Grid1 size={24} color="#fff" />,
      path: "/moments",
      hidden: !canSeeRealTime,
    },
  ];

  return (
    <HubMenu
      title="Painel"
      subtitle="Selecione um indicador para visualizar."
      items={items}
      fullWidth
    />
  );
};

export default PainelIndicadores;
