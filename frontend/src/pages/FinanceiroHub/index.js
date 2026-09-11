import React from "react";
import { ArrowSquare, DocumentText, HomeTrendUp, Notepad2, TaskSquare } from "iconsax-react";
import HubMenu from "../../components/HubMenu";

const items = [
  {
    title: "Honorários",
    description: "Gestão de honorários contábeis dos clientes.",
    icon: <HomeTrendUp size={24} color="#fff" />,
    path: "/fin/honorarios",
  },
  {
    title: "Serviços Avulsos",
    description: "Cobrança de serviços avulsos prestados.",
    icon: <Notepad2 size={24} color="#fff" />,
    path: "/fin/servicos-avulsos",
  },
  {
    title: "Pedidos",
    description: "Pedidos de serviços e produtos dos clientes.",
    icon: <DocumentText size={24} color="#fff" />,
    path: "/fin/pedidos",
  },
  {
    title: "Contas a Receber",
    description: "Controle de valores a receber dos clientes.",
    icon: <ArrowSquare size={24} color="#fff" />,
    path: "/fin/contas-receber",
  },
  {
    title: "Contas a Pagar",
    description: "Controle de valores a pagar da empresa.",
    icon: <ArrowSquare size={24} color="#fff" />,
    path: "/fin/contas-pagar",
  },
  {
    title: "Tarefas com Valor",
    description: "Tarefas vinculadas a valores cobrados dos clientes.",
    icon: <TaskSquare size={24} color="#fff" />,
    path: "/fin/tarefas-valor",
  },
];

const FinanceiroHub = () => (
  <HubMenu title="Financeiro" subtitle="Selecione uma opção financeira." items={items} fullWidth />
);

export default FinanceiroHub;
