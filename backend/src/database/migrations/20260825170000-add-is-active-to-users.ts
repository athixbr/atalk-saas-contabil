import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const table = await queryInterface.describeTable("Users");

    if (!table.isActive) {
      await queryInterface.addColumn("Users", "isActive", {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const table = await queryInterface.describeTable("Users");

    if (table.isActive) {
      await queryInterface.removeColumn("Users", "isActive");
    }
  }
};
