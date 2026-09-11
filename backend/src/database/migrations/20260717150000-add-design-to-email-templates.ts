import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("EmailTemplates", "design", {
      type: DataTypes.JSONB,
      allowNull: true,
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("EmailTemplates", "design");
  },
};
