import __cjs_sequelize from "sequelize";
const { QueryInterface } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Permitir que tarefaInfoId seja NULL para tarefas geradas de controles
    await queryInterface.sequelize.query(`
      ALTER TABLE "TarefasGeradas" 
      ALTER COLUMN "tarefaInfoId" DROP NOT NULL;
    `);
  },

  down: async (queryInterface: QueryInterface) => {
    // Reverter - tornar campo obrigatório novamente
    await queryInterface.sequelize.query(`
      ALTER TABLE "TarefasGeradas" 
      ALTER COLUMN "tarefaInfoId" SET NOT NULL;
    `);
  }
};
