import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;

module.exports = {
  up: async (queryInterface: any) => {
    const table: any = await queryInterface.describeTable("TarefasRecorrentes");

    if (!table.faseConfig) {
      await queryInterface.addColumn("TarefasRecorrentes", "faseConfig", {
        type: DataTypes.JSON,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface: any) => {
    const table: any = await queryInterface.describeTable("TarefasRecorrentes");

    if (table.faseConfig) {
      await queryInterface.removeColumn("TarefasRecorrentes", "faseConfig");
    }
  },
};
