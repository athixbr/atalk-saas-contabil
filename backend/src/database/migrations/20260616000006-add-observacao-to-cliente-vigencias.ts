import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("ClienteVigencias", "observacao", {
      type: DataTypes.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("ClienteVigencias", "observacao");
  },
};
