module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Para PostgreSQL, adicionar valor ao enum existente
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_GedActivityLogs_action" ADD VALUE IF NOT EXISTS 'preview';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Não é possível remover valores de enum no PostgreSQL facilmente
    // Seria necessário recriar o enum, o que é complexo
    console.log('Rollback não implementado - remover valores de enum requer recriação da tabela');
  }
};
