import React from "react";
import { Kanban, TaskSquare } from "iconsax-react";
import HubMenu from "../../components/HubMenu";

const items = [
  {
    title: "Leads",
    description: "Pipeline de vendas e gestão de leads do CRM.",
    icon: <Kanban size={24} color="#fff" />,
    path: "/crm",
  },
  {
    title: "Tarefas CRM",
    description: "Tarefas vinculadas aos leads e ao processo comercial.",
    icon: <TaskSquare size={24} color="#fff" />,
    path: "/crm/tarefas",
  },
  {
    title: "Pipeline",
    description: "Visão em pipeline das tarefas comerciais.",
    icon: <TaskSquare size={24} color="#fff" />,
    path: "/crm/tarefas/pipeline",
  },
];

const CrmHub = () => (
  <HubMenu title="CRM" subtitle="Selecione uma opção do CRM." items={items} fullWidth />
);

export default CrmHub;
