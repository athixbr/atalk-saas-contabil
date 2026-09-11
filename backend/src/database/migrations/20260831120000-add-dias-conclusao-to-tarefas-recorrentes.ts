import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;

module.exports = {
  up: async (queryInterface: typeof QueryInterface) => {
    const table: any = await queryInterface.describeTable("TarefasRecorrentes");

    if (!table.diasConclusao) {
      await queryInterface.addColumn("TarefasRecorrentes", "diasConclusao", {
        type: DataTypes.INTEGER,
        allowNull: true
      });
    }
  },

  down: async (queryInterface: typeof QueryInterface) => {
    const table: any = await queryInterface.describeTable("TarefasRecorrentes");

    if (table.diasConclusao) {
      await queryInterface.removeColumn("TarefasRecorrentes", "diasConclusao");
    }
  }
};
