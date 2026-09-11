// Espelha ListEmailTemplateVariablesService.ts do backend — usado como fallback
// caso a chamada a GET /email-templates/variables falhe.
export const FALLBACK_VARIABLE_GROUPS = [
  {
    group: "Cliente",
    variables: [
      { key: "nome", label: "Nome", sample: "João da Silva" },
      { key: "razaoSocial", label: "Razão Social", sample: "Empresa Exemplo Ltda" },
      { key: "nomeFantasia", label: "Nome Fantasia", sample: "Exemplo Comércio" },
      { key: "cnpj", label: "CNPJ", sample: "12.345.678/0001-90" },
      { key: "cpf", label: "CPF", sample: "123.456.789-00" },
      { key: "email", label: "E-mail", sample: "cliente@exemplo.com" },
      { key: "telefone", label: "Telefone", sample: "(11) 3333-4444" },
      { key: "celular", label: "Celular", sample: "(11) 99999-8888" },
      { key: "cidade", label: "Cidade", sample: "São Paulo" },
      { key: "estado", label: "Estado", sample: "SP" },
      { key: "responsavel", label: "Responsável", sample: "Maria Souza" },
    ],
  },
];

export const buildMockVariableMap = (variableGroups) => {
  return variableGroups.reduce((acc, { variables }) => {
    variables.forEach(({ key, sample }) => {
      acc[key] = sample;
    });
    return acc;
  }, {});
};

export const applyMockVariables = (html, variableGroups) => {
  const map = buildMockVariableMap(variableGroups);
  return Object.entries(map).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value || ""),
    html || ""
  );
};
