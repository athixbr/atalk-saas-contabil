import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;

module.exports = {
  up: async (queryInterface: typeof QueryInterface) => {
    const table: any = await queryInterface.describeTable("TarefasRecorrentes");

    if (!table.tipoTarefa) {
      await queryInterface.addColumn("TarefasRecorrentes", "tipoTarefa", {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "recorrente"
      });
    }

    await queryInterface.sequelize.query(`
      UPDATE "TarefasRecorrentes"
      SET "tipoTarefa" = 'recorrente'
      WHERE "tipoTarefa" IS NULL OR "tipoTarefa" = '';
    `);
  },

  down: async (queryInterface: typeof QueryInterface) => {
    const table: any = await queryInterface.describeTable("TarefasRecorrentes");

    if (table.tipoTarefa) {
      await queryInterface.removeColumn("TarefasRecorrentes", "tipoTarefa");
    }
  }
};
