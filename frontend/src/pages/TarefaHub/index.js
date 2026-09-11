import React, { useContext } from "react";
import { HierarchySquare3, Kanban, Setting3, TaskSquare } from "iconsax-react";
import { AuthContext } from "../../context/Auth/AuthContext";
import HubMenu from "../../components/HubMenu";

const TarefaHub = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user.profile === "admin";

  const items = [
    {
      title: "Minhas Tarefas",
      description: "Quadro de tarefas pessoais no formato kanban.",
      icon: <TaskSquare size={24} color="#fff" />,
      path: "/tarefas",
    },
    {
      title: "Painel",
      description: "Panorama, atividades e tarefas geradas de toda a equipe.",
      icon: <Kanban size={24} color="#fff" />,
      path: "/gestao-tarefas/painel",
      hidden: !isAdmin,
    },
    {
      title: "Workflow",
      description: "Fluxograma visual montado a partir das tarefas.",
      icon: <HierarchySquare3 size={24} color="#fff" />,
      path: "/fluxograma",
    },
    {
      title: "Cadastro",
      description: "Configure tipos de tarefas, recorrências, controles e parcelamentos.",
      icon: <Setting3 size={24} color="#fff" />,
      path: "/tarefas-recorrentes",
      hidden: !isAdmin,
    },
  ];

  return (
    <HubMenu
      title="Tarefa"
      subtitle="Selecione uma opção de gestão de tarefas."
      items={items}
      fullWidth
    />
  );
};

export default TarefaHub;
