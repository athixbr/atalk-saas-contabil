module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [types] = await queryInterface.sequelize.query(`
      SELECT 1
      FROM pg_type
      WHERE typname = 'enum_TarefasRecorrentes_esfera'
      LIMIT 1;
    `);

    if (types.length > 0) {
      // Para PostgreSQL, adicionar valor ao enum existente
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_TarefasRecorrentes_esfera" ADD VALUE IF NOT EXISTS 'Outros';
      `);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Não é possível remover valores de enum no PostgreSQL facilmente
    // Seria necessário recriar o enum, o que é complexo
    console.log('Rollback não implementado - remover valores de enum requer recriação da tabela');
  }
};
