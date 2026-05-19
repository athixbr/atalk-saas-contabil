import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Remover a constraint antiga (se existir)
    await queryInterface.sequelize.query(`
      ALTER TABLE "TarefasRecorrentes" 
      DROP CONSTRAINT IF EXISTS "TarefasRecorrentes_departamentoId_fkey";
    `);

    // Tornar departamentoId opcional e referenciar Departamentos
    await queryInterface.changeColumn("TarefasRecorrentes", "departamentoId", {
      type: DataTypes.INTEGER,
      allowNull: true,
    });

    // Adicionar a nova constraint referenciando Departamentos
    await queryInterface.sequelize.query(`
      ALTER TABLE "TarefasRecorrentes" 
      ADD CONSTRAINT "TarefasRecorrentes_departamentoId_fkey" 
      FOREIGN KEY ("departamentoId") 
      REFERENCES "Departamentos"("id") 
      ON UPDATE CASCADE 
      ON DELETE SET NULL;
    `);
  },

  down: async (queryInterface: QueryInterface) => {
    // Remover a constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE "TarefasRecorrentes" 
      DROP CONSTRAINT IF EXISTS "TarefasRecorrentes_departamentoId_fkey";
    `);

    // Reverter: tornar departamentoId obrigatório e referenciar Queues
    await queryInterface.changeColumn("TarefasRecorrentes", "departamentoId", {
      type: DataTypes.INTEGER,
      allowNull: false,
    });

    // Adicionar a constraint antiga
    await queryInterface.sequelize.query(`
      ALTER TABLE "TarefasRecorrentes" 
      ADD CONSTRAINT "TarefasRecorrentes_departamentoId_fkey" 
      FOREIGN KEY ("departamentoId") 
      REFERENCES "Queues"("id") 
      ON UPDATE CASCADE 
      ON DELETE CASCADE;
    `);
  },
};
