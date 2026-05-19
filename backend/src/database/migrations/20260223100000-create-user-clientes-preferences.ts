import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("UserClientesPreferences", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
      },
      empresaId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
      },
      columnOrder: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      columnVisibility: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      columnWidths: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      sortConfig: {
        type: DataTypes.JSONB,
        defaultValue: { key: "id", direction: "desc" },
      },
      showFilters: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      defaultFilters: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("UserClientesPreferences");
  },
};
