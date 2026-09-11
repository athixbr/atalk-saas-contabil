import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;

module.exports = {
  up: async (queryInterface: any) => {
    const table = await queryInterface.describeTable("ControleComData");

    if (!table.cor) {
      await queryInterface.addColumn("ControleComData", "cor", {
        type: DataTypes.STRING(7),
        allowNull: false,
        defaultValue: "#f44336",
      });
    }
  },

  down: async (queryInterface: any) => {
    const table = await queryInterface.describeTable("ControleComData");

    if (table.cor) {
      await queryInterface.removeColumn("ControleComData", "cor");
    }
  },
};
