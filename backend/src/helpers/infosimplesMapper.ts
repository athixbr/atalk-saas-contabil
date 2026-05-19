// Mapeamento de certidões do sistema para endpoints da API Info Simples
interface CertidaoMapping {
  id: string;
  label: string;
  tipo: "federal" | "estadual" | "municipal";
  infoSimplesEndpoint: string;
  infoSimplesPath: string;
  camposNecessarios: string[];
  custoBase: number;
  origemApi?: "infosimples" | "coplan";
}

export const certidoesMapping: CertidaoMapping[] = [
  // ==================== FEDERAIS ====================
  {
    id: "ecac-fiscal",
    label: "E-CAC Situação Fiscal",
    tipo: "federal",
    infoSimplesEndpoint: "consultas/ecac/situacao-fiscal",
    infoSimplesPath: "/consultas/ecac/situacao-fiscal",
    camposNecessarios: ["cnpj"],
    custoBase: 0.20
  },
  {
    id: "ecac-cadin",
    label: "E-CAC CADIN/SISBACEN",
    tipo: "federal",
    infoSimplesEndpoint: "consultas/portal-transparencia/cadin",
    infoSimplesPath: "/consultas/portal-transparencia/cadin",
    camposNecessarios: ["cnpj"],
    custoBase: 0.20
  },
  {
    id: "ecac-postal",
    label: "E-CAC Caixa Postal",
    tipo: "federal",
    infoSimplesEndpoint: "consultas/ecac/caixa-postal",
    infoSimplesPath: "/consultas/ecac/caixa-postal",
    camposNecessarios: ["cnpj"],
    custoBase: 0.20
  },
  {
    id: "rfb-pgfn",
    label: "RFB/PGFN",
    tipo: "federal",
    infoSimplesEndpoint: "consultas/receita-federal/certidao-negativa-conjunta",
    infoSimplesPath: "/consultas/receita-federal/certidao-negativa-conjunta",
    camposNecessarios: ["cnpj"],
    custoBase: 0.20
  },
  {
    id: "tst",
    label: "TST",
    tipo: "federal",
    infoSimplesEndpoint: "consultas/tribunal/tst/cndt",
    infoSimplesPath: "/consultas/tribunal/tst/cndt",
    camposNecessarios: ["cnpj"],
    custoBase: 0.20
  },
  {
    id: "fgts",
    label: "FGTS",
    tipo: "federal",
    infoSimplesEndpoint: "consultas/caixa/regularidade",
    infoSimplesPath: "/consultas/caixa/regularidade",
    camposNecessarios: ["cnpj"],
    custoBase: 0.06
  },
  {
    id: "mte-certidao",
    label: "MTE - Certidão de Débitos",
    tipo: "federal",
    infoSimplesEndpoint: "consultas/mte/certidao-debitos",
    infoSimplesPath: "/consultas/mte/certidao-debitos",
    camposNecessarios: ["cnpj"],
    custoBase: 0.08
  },
  {
    id: "mte-processos",
    label: "MTE - Processos Empregador",
    tipo: "federal",
    infoSimplesEndpoint: "consultas/mte/processo-empregador",
    infoSimplesPath: "/consultas/mte/processo-empregador",
    camposNecessarios: ["cnpj"],
    custoBase: 0.04
  },
  {
    id: "simples-nacional",
    label: "Simples Nacional",
    tipo: "federal",
    infoSimplesEndpoint: "consultas/receita-federal/simples",
    infoSimplesPath: "/consultas/receita-federal/simples",
    camposNecessarios: ["cnpj"],
    custoBase: 0.04
  },
  {
    id: "protesto-ieptb",
    label: "Protesto IEPTB (Nacional)",
    tipo: "federal",
    infoSimplesEndpoint: "consultas/ieptb/protestos",
    infoSimplesPath: "/consultas/ieptb/protestos",
    camposNecessarios: ["cnpj"],
    custoBase: 0.06
  },

  // ==================== ESTADUAIS ====================
  {
    id: "sefaz-mt",
    label: "SEFAZ MT - Certidão Débitos",
    tipo: "estadual",
    infoSimplesEndpoint: "consultas/sefaz/mt/certidao-debitos",
    infoSimplesPath: "/consultas/sefaz/mt/certidao-debitos",
    camposNecessarios: ["cnpj"],
    custoBase: 0.04
  },
  {
    id: "sefaz-mt-caixa",
    label: "SEFAZ MT (Caixa de Entrada)",
    tipo: "estadual",
    infoSimplesEndpoint: "consultas/sefaz/mt/dec/caixa-postal",
    infoSimplesPath: "/consultas/sefaz/mt/dec/caixa-postal",
    camposNecessarios: ["cnpj", "inscricaoEstadual"],
    custoBase: 0.20
  },
  {
    id: "sefaz-go",
    label: "SEFAZ GO - Certidão Débitos",
    tipo: "estadual",
    infoSimplesEndpoint: "consultas/sefaz/go/certidao-debitos",
    infoSimplesPath: "/consultas/sefaz/go/certidao-debitos",
    camposNecessarios: ["cnpj"],
    custoBase: 0.20
  },
  {
    id: "sefaz-go-caixa",
    label: "SEFAZ GO (Caixa de Entrada)",
    tipo: "estadual",
    infoSimplesEndpoint: "consultas/sefaz/go/caixa-postal",
    infoSimplesPath: "/consultas/sefaz/go/caixa-postal",
    camposNecessarios: ["cnpj", "inscricaoEstadual"],
    custoBase: 0.20
  },

  // ==================== MUNICIPAIS ====================
  {
    id: "prefeitura-campo-verde",
    label: "Prefeitura Campo Verde/MT",
    tipo: "municipal",
    infoSimplesEndpoint: "",
    infoSimplesPath: "",
    camposNecessarios: ["cnpj"],
    custoBase: 0.20,
    origemApi: "coplan"
  },
  {
    id: "prefeitura-rondonopolis",
    label: "Prefeitura Rondonópolis",
    tipo: "municipal",
    infoSimplesEndpoint: "consultas/prefeitura/mt/rondonopolis/certidao-negativa-debitos",
    infoSimplesPath: "/consultas/prefeitura/mt/rondonopolis/certidao-negativa-debitos",
    camposNecessarios: ["cnpj"],
    custoBase: 0.20
  },
  {
    id: "prefeitura-cuiaba",
    label: "Prefeitura Cuiabá - CND",
    tipo: "municipal",
    infoSimplesEndpoint: "consultas/pref/mt/cuiaba/cnd",
    infoSimplesPath: "/consultas/pref/mt/cuiaba/cnd",
    camposNecessarios: ["cnpj"],
    custoBase: 0.20
  },
  {
    id: "prefeitura-sao-paulo",
    label: "Prefeitura São Paulo - CTM",
    tipo: "municipal",
    infoSimplesEndpoint: "consultas/pref/sp/sao-paulo/ctm",
    infoSimplesPath: "/consultas/pref/sp/sao-paulo/ctm",
    camposNecessarios: ["cnpj"],
    custoBase: 0.04
  },
  {
    id: "prefeitura-sao-luis",
    label: "Prefeitura São Luís de Montes Belos",
    tipo: "municipal",
    infoSimplesEndpoint: "consultas/prefeitura/go/sao-luis-de-montes-belos/certidao-negativa-debitos",
    infoSimplesPath: "/consultas/prefeitura/go/sao-luis-de-montes-belos/certidao-negativa-debitos",
    camposNecessarios: ["cnpj"],
    custoBase: 0.20
  },
  {
    id: "prefeitura-primavera-leste",
    label: "Prefeitura Primavera do Leste/MT",
    tipo: "municipal",
    infoSimplesEndpoint: "consultas/prefeitura/mt/primavera-do-leste/certidao-negativa-debitos",
    infoSimplesPath: "/consultas/prefeitura/mt/primavera-do-leste/certidao-negativa-debitos",
    camposNecessarios: ["cnpj"],
    custoBase: 0.20
  },
  {
    id: "prefeitura-chapada-guimaraes",
    label: "Prefeitura Chapada dos Guimarães/MT",
    tipo: "municipal",
    infoSimplesEndpoint: "consultas/prefeitura/mt/chapada-dos-guimaraes/certidao-negativa-debitos",
    infoSimplesPath: "/consultas/prefeitura/mt/chapada-dos-guimaraes/certidao-negativa-debitos",
    camposNecessarios: ["cnpj"],
    custoBase: 0.20
  }
];

export function getCertidaoMapping(categoriaId: string): CertidaoMapping | undefined {
  return certidoesMapping.find(c => c.id === categoriaId);
}

export function getCertidoesPorTipo(tipo: "federal" | "estadual" | "municipal"): CertidaoMapping[] {
  return certidoesMapping.filter(c => c.tipo === tipo);
}

export function isCertidaoDisponivel(categoriaId: string): boolean {
  return certidoesMapping.some(c => c.id === categoriaId);
}
