import React from "react";
import { DocumentText, Key, Link21, Paperclip } from "iconsax-react";
import HubMenu from "../../components/HubMenu";

const items = [
  {
    title: "Credenciais e Certificados",
    description: "Senhas Gov, certificados digitais, validade e avisos automáticos.",
    icon: <Key size={24} color="#fff" />,
    path: "/documentos/credenciais",
  },
  {
    title: "Certidões",
    description: "Emissão e acompanhamento de certidões dos clientes.",
    icon: <DocumentText size={24} color="#fff" />,
    path: "/certidoes",
  },
  {
    title: "Modelos de Leitura",
    description: "Cadastre modelos OCR/IA para reconhecer e extrair dados de documentos.",
    icon: <DocumentText size={24} color="#fff" />,
    path: "/modelos-leitura",
  },
  {
    title: "Gerenciador de Arquivos",
    description: "Arquivos e anexos organizados por cliente.",
    icon: <Paperclip size={24} color="#fff" />,
    path: "/files",
  },
  {
    title: "XML NF-e",
    description: "Consulta e download de XMLs de notas fiscais.",
    icon: <Link21 size={24} color="#fff" />,
    path: "/xml-nfe",
  },
  {
    title: "SPED",
    description: "Análise de SPED Fiscal (Bloco C) direto no sistema.",
    icon: <Link21 size={24} color="#fff" />,
    path: "/sped",
  },
  {
    title: "XML Cartório",
    description: "Acesso ao sistema externo de XML de cartório.",
    icon: <Link21 size={24} color="#fff" />,
    path: "https://xml.contco.com.br",
    external: true,
  },
];

const DocumentosHub = () => (
  <HubMenu title="Documentos" subtitle="Selecione uma opção de documentos." items={items} fullWidth />
);

export default DocumentosHub;
