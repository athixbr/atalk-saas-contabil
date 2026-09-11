import React, { useContext, useEffect, useState } from "react";
import {
  ArrowSwapHorizontal,
  Calendar,
  CalendarEdit,
  DocumentText,
  Flash,
  MessageFavorite,
  People,
  Story,
  Tag,
  UserAdd,
  VolumeUp,
  Whatsapp,
} from "iconsax-react";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import HubMenu from "../../components/HubMenu";

const AtendimentoHub = () => {
  const { user } = useContext(AuthContext);
  const { getPlanCompany } = usePlans();
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showGroups, setShowGroups] = useState(true);
  const [showSchedules, setShowSchedules] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      setShowCampaigns(planConfigs.plan.useCampaigns);
      setShowGroups(planConfigs.plan.useGroups || true);
      setShowSchedules(planConfigs.plan.useSchedules);
      setShowInternalChat(planConfigs.plan.useInternalChat);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = [
    {
      title: "WhatsApp",
      description: "Central de atendimento — tickets e conversas do WhatsApp.",
      icon: <Whatsapp size={24} color="#fff" />,
      path: "/tickets",
    },
    {
      title: "Contatos",
      description: "Gerencie os contatos utilizados no atendimento.",
      icon: <UserAdd size={24} color="#fff" />,
      path: "/contacts",
    },
    {
      title: "Conexões",
      description: "Gerencie as conexões de WhatsApp da empresa.",
      icon: <ArrowSwapHorizontal size={24} color="#fff" />,
      path: "/connections",
    },
    {
      title: "Campanhas",
      description: "Envios em massa e listas de contatos para campanhas.",
      icon: <VolumeUp size={24} color="#fff" />,
      path: "/campaigns",
      hidden: !showCampaigns,
    },
    {
      title: "Grupos",
      description: "Campanhas e configurações de grupos de WhatsApp.",
      icon: <People size={24} color="#fff" />,
      hidden: !showGroups,
      subItems: [
        { label: "Campanhas de Grupos", path: "/grupos", icon: <VolumeUp size={14} /> },
        { label: "Lista de Grupos", path: "/grupos/lista", icon: <People size={14} /> },
        { label: "Configurações", path: "/grupos/config", icon: <Flash size={14} /> },
        { label: "Story", path: "/whatsapp-stories", icon: <Story size={14} /> },
      ],
    },
    {
      title: "Ferramentas",
      description: "Tags, respostas rápidas e agendamentos de mensagens.",
      icon: <Flash size={24} color="#fff" />,
      subItems: [
        { label: "Tags", path: "/tags", icon: <Tag size={14} /> },
        { label: "Respostas Rápidas", path: "/quick-messages", icon: <Flash size={14} /> },
        { label: "Agendamentos", path: "/schedules", icon: <Calendar size={14} />, hidden: !showSchedules },
      ],
    },
    {
      title: "Comunicação",
      description: "Chat interno, base de conhecimento e central de ajuda.",
      icon: <MessageFavorite size={24} color="#fff" />,
      subItems: [
        { label: "Chats", path: "/chats", icon: <MessageFavorite size={14} />, hidden: !showInternalChat },
        { label: "Base de Conhecimento", path: "/base-conhecimento", icon: <DocumentText size={14} /> },
        { label: "Central de Ajuda", path: "/helps", icon: <CalendarEdit size={14} /> },
      ],
    },
  ];

  return (
    <HubMenu
      title="Atendimento"
      subtitle="Selecione uma categoria de atendimento."
      items={items}
      fullWidth
    />
  );
};

export default AtendimentoHub;
