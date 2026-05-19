import __cjs_sequelize from "sequelize";
const { QueryInterface, QueryTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Buscar todas as empresas
    const companies: any = await queryInterface.sequelize.query(
      'SELECT id FROM "Companies";',
      { type: QueryTypes.SELECT }
    );

    const now = new Date();
    const stages = [];

    // Criar etapas padrão para cada empresa
    for (const company of companies) {
      stages.push(
        {
          companyId: company.id,
          name: "Pendente",
          color: "#9e9e9e",
          order: 1,
          createdAt: now,
          updatedAt: now
        },
        {
          companyId: company.id,
          name: "Em Andamento",
          color: "#2196f3",
          order: 2,
          createdAt: now,
          updatedAt: now
        },
        {
          companyId: company.id,
          name: "Em Revisão",
          color: "#ff9800",
          order: 3,
          createdAt: now,
          updatedAt: now
        },
        {
          companyId: company.id,
          name: "Concluída",
          color: "#4caf50",
          order: 4,
          createdAt: now,
          updatedAt: now
        }
      );
    }

    if (stages.length > 0) {
      await queryInterface.bulkInsert("CrmTaskStages", stages);
    }
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete("CrmTaskStages", {});
  }
};
