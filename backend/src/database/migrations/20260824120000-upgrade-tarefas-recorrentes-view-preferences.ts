import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;

module.exports = {
  up: async (queryInterface: typeof QueryInterface) => {
    const table = await queryInterface.describeTable("TarefasRecorrentesViewPreferences");

    if (!table.name) {
      await queryInterface.addColumn("TarefasRecorrentesViewPreferences", "name", {
        type: DataTypes.STRING,
        allowNull: true,
      });
    }

    if (!table.isDefault) {
      await queryInterface.addColumn("TarefasRecorrentesViewPreferences", "isDefault", {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }

    await queryInterface.sequelize.query(`
      UPDATE "TarefasRecorrentesViewPreferences"
      SET "name" = COALESCE("name", 'Padrão')
      WHERE "name" IS NULL OR TRIM("name") = ''
    `);

    await queryInterface.changeColumn("TarefasRecorrentesViewPreferences", "name", {
      type: DataTypes.STRING,
      allowNull: false,
    });

    await queryInterface.removeIndex(
      "TarefasRecorrentesViewPreferences",
      "idx_tarefas_recorrentes_view_preferences_user_company"
    ).catch(() => undefined);

    await queryInterface.addIndex("TarefasRecorrentesViewPreferences", ["userId", "companyId", "name"], {
      name: "idx_tarefas_recorrentes_view_preferences_user_company_name",
      unique: true,
    });
  },

  down: async (queryInterface: typeof QueryInterface) => {
    await queryInterface.removeIndex(
      "TarefasRecorrentesViewPreferences",
      "idx_tarefas_recorrentes_view_preferences_user_company_name"
    ).catch(() => undefined);

    await queryInterface.addIndex("TarefasRecorrentesViewPreferences", ["userId", "companyId"], {
      name: "idx_tarefas_recorrentes_view_preferences_user_company",
      unique: true,
    }).catch(() => undefined);

    await queryInterface.removeColumn("TarefasRecorrentesViewPreferences", "isDefault");
    await queryInterface.removeColumn("TarefasRecorrentesViewPreferences", "name");
  },
};
