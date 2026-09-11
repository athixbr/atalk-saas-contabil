import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("TarefasRecorrentesViewPreferences", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      columns: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      filters: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      sortConfig: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    }).then(() =>
      queryInterface.addIndex("TarefasRecorrentesViewPreferences", ["userId", "companyId"], {
        name: "idx_tarefas_recorrentes_view_preferences_user_company",
        unique: true
      })
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("TarefasRecorrentesViewPreferences");
  }
};
