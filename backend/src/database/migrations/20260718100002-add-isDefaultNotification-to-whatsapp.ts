import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Whatsapps", "isDefaultNotification", {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Whatsapps", "isDefaultNotification");
  },
};
