import React from "react";
import { MoneySend, Profile2User } from "iconsax-react";
import HubMenu from "../../components/HubMenu";

const items = [
  {
    title: "Clientes",
    description: "Cadastro e gestão dos clientes da empresa.",
    icon: <Profile2User size={24} color="#fff" />,
    path: "/clientes",
  },
  {
    title: "Cobrança",
    description: "Cobranças e pendências financeiras dos clientes.",
    icon: <MoneySend size={24} color="#fff" />,
    path: "/cobranca",
  },
];

const ClientesHub = () => (
  <HubMenu title="Clientes" subtitle="Selecione uma opção de clientes." items={items} fullWidth />
);

export default ClientesHub;
