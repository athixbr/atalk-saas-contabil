import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableDescription = await queryInterface.describeTable("Announcements");

    if (!tableDescription.scheduledAt) {
      await queryInterface.addColumn("Announcements", "scheduledAt", {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      });
    }

    if (!tableDescription.notifiedAt) {
      await queryInterface.addColumn("Announcements", "notifiedAt", {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Announcements", "scheduledAt");
    await queryInterface.removeColumn("Announcements", "notifiedAt");
  }
};
