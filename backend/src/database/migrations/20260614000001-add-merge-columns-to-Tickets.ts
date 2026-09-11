import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const table = await queryInterface.describeTable("Tickets");

    if (!table.isMerged) {
      await queryInterface.addColumn("Tickets", "isMerged", {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    }

    if (!table.mergedIntoTicketId) {
      await queryInterface.addColumn("Tickets", "mergedIntoTicketId", {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "Tickets", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const table = await queryInterface.describeTable("Tickets");

    if (table.mergedIntoTicketId) {
      await queryInterface.removeColumn("Tickets", "mergedIntoTicketId");
    }

    if (table.isMerged) {
      await queryInterface.removeColumn("Tickets", "isMerged");
    }
  }
};
