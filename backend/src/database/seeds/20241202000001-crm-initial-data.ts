import __cjs_sequelize from "sequelize";
const { QueryInterface } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Nota: Estes seeds devem ser executados manualmente ou através de um script
    // pois dependem do companyId específico de cada instalação
    
    // Exemplo de dados padrão que podem ser inseridos:
    
    // Business Types (Tipos de Negócio)
    const businessTypes = [
      { name: "MEI", description: "Microempreendedor Individual" },
      { name: "ME", description: "Microempresa" },
      { name: "EPP", description: "Empresa de Pequeno Porte" },
      { name: "LTDA", description: "Sociedade Limitada" },
      { name: "SA", description: "Sociedade Anônima" },
      { name: "EIRELI", description: "Empresa Individual de Responsabilidade Limitada" },
      { name: "Profissional Liberal", description: "Profissional Autônomo" }
    ];

    // Tax Regimes (Regimes Tributários)
    const taxRegimes = [
      { name: "Simples Nacional", description: "Regime Simplificado" },
      { name: "Lucro Presumido", description: "Tributação sobre Lucro Presumido" },
      { name: "Lucro Real", description: "Tributação sobre Lucro Real" }
    ];

    // Sources (Fontes de Lead)
    const sources = [
      { name: "Indicação", description: "Cliente indicado por outro cliente" },
      { name: "Google", description: "Busca orgânica ou anúncios Google" },
      { name: "Instagram", description: "Redes sociais - Instagram" },
      { name: "Facebook", description: "Redes sociais - Facebook" },
      { name: "LinkedIn", description: "Redes sociais - LinkedIn" },
      { name: "Site", description: "Formulário do site" },
      { name: "WhatsApp", description: "Contato direto via WhatsApp" },
      { name: "Email", description: "Contato por email" },
      { name: "Telefone", description: "Ligação telefônica" },
      { name: "Evento", description: "Evento ou feira" },
      { name: "Parceiro", description: "Parceiro comercial" }
    ];

    // Stages (Estágios do Pipeline)
    const stages = [
      { name: "Prospecção", order: 1, color: "#9E9E9E" },
      { name: "Qualificação", order: 2, color: "#2196F3" },
      { name: "Proposta", order: 3, color: "#FF9800" },
      { name: "Negociação", order: 4, color: "#FFC107" },
      { name: "Fechamento", order: 5, color: "#4CAF50" },
      { name: "Onboarding", order: 6, color: "#00BCD4" }
    ];

    // Task Categories (Categorias de Tarefas CRM)
    const taskCategories = [
      { name: "Ligação de Prospecção", type: "commercial", icon: "phone", color: "#2196F3" },
      { name: "Enviar Proposta", type: "commercial", icon: "file", color: "#FF9800" },
      { name: "Reunião Comercial", type: "commercial", icon: "users", color: "#9C27B0" },
      { name: "Follow-up", type: "commercial", icon: "message", color: "#00BCD4" },
      { name: "Negociação de Contrato", type: "commercial", icon: "document", color: "#FFC107" },
      { name: "Onboarding - Coleta de Documentos", type: "cs", icon: "folder", color: "#4CAF50" },
      { name: "Onboarding - Configuração Inicial", type: "cs", icon: "settings", color: "#009688" },
      { name: "Onboarding - Treinamento", type: "cs", icon: "graduation", color: "#3F51B5" },
      { name: "Check-in Mensal", type: "cs", icon: "calendar", color: "#673AB7" },
      { name: "Suporte Técnico", type: "operational", icon: "tool", color: "#FF5722" },
      { name: "Renovação de Contrato", type: "cs", icon: "refresh", color: "#8BC34A" }
    ];

    console.log("========================================");
    console.log("SEED DE DADOS INICIAIS DO CRM");
    console.log("========================================");
    console.log("\nPara popular os dados iniciais, execute os seguintes comandos no console SQL:");
    console.log("\n-- Substitua <COMPANY_ID> pelo ID da sua empresa\n");

    console.log("\n-- 1. TIPOS DE NEGÓCIO");
    businessTypes.forEach(bt => {
      console.log(`INSERT INTO "CrmBusinessTypes" ("companyId", "name", "description", "active", "createdAt", "updatedAt") VALUES (<COMPANY_ID>, '${bt.name}', '${bt.description}', true, NOW(), NOW());`);
    });

    console.log("\n-- 2. REGIMES TRIBUTÁRIOS");
    taxRegimes.forEach(tr => {
      console.log(`INSERT INTO "CrmTaxRegimes" ("companyId", "name", "description", "active", "createdAt", "updatedAt") VALUES (<COMPANY_ID>, '${tr.name}', '${tr.description}', true, NOW(), NOW());`);
    });

    console.log("\n-- 3. FONTES DE LEAD");
    sources.forEach(s => {
      console.log(`INSERT INTO "CrmSources" ("companyId", "name", "description", "active", "createdAt", "updatedAt") VALUES (<COMPANY_ID>, '${s.name}', '${s.description}', true, NOW(), NOW());`);
    });

    console.log("\n-- 4. ESTÁGIOS DO PIPELINE");
    stages.forEach(st => {
      console.log(`INSERT INTO "CrmStages" ("companyId", "name", "order", "color", "active", "createdAt", "updatedAt") VALUES (<COMPANY_ID>, '${st.name}', ${st.order}, '${st.color}', true, NOW(), NOW());`);
    });

    console.log("\n-- 5. CATEGORIAS DE TAREFAS CRM");
    taskCategories.forEach(tc => {
      console.log(`INSERT INTO "CrmTaskCategories" ("companyId", "name", "type", "icon", "color", "active", "createdAt", "updatedAt") VALUES (<COMPANY_ID>, '${tc.name}', '${tc.type}', '${tc.icon}', '${tc.color}', true, NOW(), NOW());`);
    });

    console.log("\n========================================\n");

    return Promise.resolve();
  },

  down: async (queryInterface: QueryInterface) => {
    return Promise.resolve();
  }
};
