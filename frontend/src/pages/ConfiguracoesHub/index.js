import React, { useContext, useEffect, useState } from "react";
import {
  Buliding,
  CodeCircle,
  DocumentText,
  Hierarchy,
  Information,
  KeyboardOpen,
  MoneySend,
  Notification1,
  People,
  Setting,
  Setting2,
  Setting3,
  Sms,
  VolumeHigh,
  Whatsapp,
} from "iconsax-react";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import HubMenu from "../../components/HubMenu";
import { i18n } from "../../translate/i18n";

const ConfiguracoesHub = () => {
  const { user } = useContext(AuthContext);
  const { getPlanCompany } = usePlans();
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      setShowOpenAi(planConfigs.plan.useOpenAi);
      setShowExternalApi(planConfigs.plan.useExternalApi);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = [
    {
      title: "Usuários & Departamentos",
      description: "Gerencie usuários, permissões e departamentos.",
      icon: <People size={24} color="#fff" />,
      subItems: [
        { label: i18n.t("mainDrawer.listItems.users"), path: "/users", icon: <People size={14} /> },
        { label: "Departamentos", path: "/departamentos", icon: <Hierarchy size={14} /> },
      ],
    },
    {
      title: "Sistema",
      description: "Configurações gerais, filas, integrações e assinatura.",
      icon: <Setting size={24} color="#fff" />,
      subItems: [
        { label: "Configurações Gerais", path: "/settings", icon: <Setting size={14} /> },
        { label: i18n.t("mainDrawer.listItems.queues"), path: "/queues", icon: <Setting3 size={14} /> },
        { label: i18n.t("mainDrawer.listItems.queueIntegration"), path: "/queue-integration", icon: <Hierarchy size={14} /> },
        { label: i18n.t("mainDrawer.listItems.prompts"), path: "/prompts", icon: <KeyboardOpen size={14} />, hidden: !showOpenAi },
        { label: i18n.t("mainDrawer.listItems.messagesAPI"), path: "/messages-api", icon: <CodeCircle size={14} />, hidden: !showExternalApi },
        { label: i18n.t("mainDrawer.listItems.orderly"), path: "/plantao", icon: <Notification1 size={14} /> },
        { label: "Avisos para Usuários", path: "/admin-notifications", icon: <VolumeHigh size={14} /> },
        { label: "Assinatura", path: "/financeiro", icon: <MoneySend size={14} /> },
        { label: i18n.t("mainDrawer.listItems.companies"), path: "/companies", icon: <Buliding size={14} />, hidden: !user.super },
        { label: i18n.t("mainDrawer.listItems.annoucements"), path: "/announcements", icon: <Information size={14} />, hidden: !user.super },
      ],
    },
    {
      title: "Config do Cliente",
      description: "Parâmetros do sistema, modelos, e-mail e WhatsApp.",
      icon: <Setting2 size={24} color="#fff" />,
      subItems: [
        { label: "Parâmetros do Sistema", path: "/parametros", icon: <Setting3 size={14} /> },
        { label: "Modelos de Parâmetros", path: "/modelos-parametros", icon: <DocumentText size={14} /> },
        { label: "E-mail", path: "/config-email", icon: <Sms size={14} /> },
        { label: "WhatsApp", path: "/config-whatsapp", icon: <Whatsapp size={14} /> },
      ],
    },
  ];

  return (
    <HubMenu
      title="Configurações"
      subtitle="Selecione uma categoria de configuração."
      items={items}
      fullWidth
    />
  );
};

export default ConfiguracoesHub;
