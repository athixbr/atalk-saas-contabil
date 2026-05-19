import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Renomear contactId para clienteId e atualizar a referência
    await queryInterface.renameColumn(
      "TarefasRecorrentesClientes",
      "contactId",
      "clienteId"
    );

    // Remover a constraint antiga
    await queryInterface.sequelize.query(`
      ALTER TABLE "TarefasRecorrentesClientes" 
      DROP CONSTRAINT IF EXISTS "TarefasRecorrentesClientes_contactId_fkey";
    `);

    // Adicionar a nova constraint referenciando Clientes
    await queryInterface.sequelize.query(`
      ALTER TABLE "TarefasRecorrentesClientes" 
      ADD CONSTRAINT "TarefasRecorrentesClientes_clienteId_fkey" 
      FOREIGN KEY ("clienteId") 
      REFERENCES "Clientes"("id") 
      ON UPDATE CASCADE 
      ON DELETE CASCADE;
    `);
  },

  down: async (queryInterface: QueryInterface) => {
    // Reverter: renomear clienteId para contactId
    await queryInterface.renameColumn(
      "TarefasRecorrentesClientes",
      "clienteId",
      "contactId"
    );

    // Remover a constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE "TarefasRecorrentesClientes" 
      DROP CONSTRAINT IF EXISTS "TarefasRecorrentesClientes_clienteId_fkey";
    `);

    // Adicionar a constraint antiga
    await queryInterface.sequelize.query(`
      ALTER TABLE "TarefasRecorrentesClientes" 
      ADD CONSTRAINT "TarefasRecorrentesClientes_contactId_fkey" 
      FOREIGN KEY ("contactId") 
      REFERENCES "Contacts"("id") 
      ON UPDATE CASCADE 
      ON DELETE CASCADE;
    `);
  },
};
