import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableDescription = await queryInterface.describeTable("Announcements");

    if (!tableDescription.tipo) {
      await queryInterface.addColumn("Announcements", "tipo", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      });
    }

    if (!tableDescription.usuariosIds) {
      await queryInterface.addColumn("Announcements", "usuariosIds", {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: true,
        defaultValue: null
      });
    }

    if (!tableDescription.departamentosIds) {
      await queryInterface.addColumn("Announcements", "departamentosIds", {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: true,
        defaultValue: null
      });
    }

    if (!tableDescription.dismissedByUsers) {
      await queryInterface.addColumn("Announcements", "dismissedByUsers", {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: null
      });
    }

    if (!tableDescription.readByUsers) {
      await queryInterface.addColumn("Announcements", "readByUsers", {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: null
      });
    }

    if (!tableDescription.expiresAt) {
      await queryInterface.addColumn("Announcements", "expiresAt", {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      });
    }

    if (!tableDescription.createdByUserId) {
      await queryInterface.addColumn("Announcements", "createdByUserId", {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Announcements", "tipo");
    await queryInterface.removeColumn("Announcements", "usuariosIds");
    await queryInterface.removeColumn("Announcements", "departamentosIds");
    await queryInterface.removeColumn("Announcements", "dismissedByUsers");
    await queryInterface.removeColumn("Announcements", "readByUsers");
    await queryInterface.removeColumn("Announcements", "expiresAt");
    await queryInterface.removeColumn("Announcements", "createdByUserId");
  }
};
