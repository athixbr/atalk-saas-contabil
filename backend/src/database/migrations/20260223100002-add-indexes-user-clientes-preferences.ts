import __cjs_sequelize from "sequelize";
const { QueryInterface } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addIndex("UserClientesPreferences", ["userId"], {
      name: "idx_user_clientes_preferences_userId",
    });

    await queryInterface.addIndex("UserClientesPreferences", ["empresaId"], {
      name: "idx_user_clientes_preferences_empresaId",
    });

    await queryInterface.addIndex(
      "UserClientesPreferences",
      ["userId", "empresaId"],
      {
        name: "idx_user_clientes_preferences_user_empresa",
        unique: true,
      }
    );

    await queryInterface.addIndex("UserClientesSavedFilters", ["userId"], {
      name: "idx_user_clientes_saved_filters_userId",
    });

    await queryInterface.addIndex("UserClientesSavedFilters", ["empresaId"], {
      name: "idx_user_clientes_saved_filters_empresaId",
    });

    await queryInterface.addIndex(
      "UserClientesSavedFilters",
      ["userId", "empresaId", "name"],
      {
        name: "idx_user_clientes_saved_filters_unique_name",
        unique: true,
      }
    );

    await queryInterface.addIndex("UserClientesSavedFilters", ["isDefault"], {
      name: "idx_user_clientes_saved_filters_isDefault",
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeIndex(
      "UserClientesPreferences",
      "idx_user_clientes_preferences_userId"
    );
    await queryInterface.removeIndex(
      "UserClientesPreferences",
      "idx_user_clientes_preferences_empresaId"
    );
    await queryInterface.removeIndex(
      "UserClientesPreferences",
      "idx_user_clientes_preferences_user_empresa"
    );

    await queryInterface.removeIndex(
      "UserClientesSavedFilters",
      "idx_user_clientes_saved_filters_userId"
    );
    await queryInterface.removeIndex(
      "UserClientesSavedFilters",
      "idx_user_clientes_saved_filters_empresaId"
    );
    await queryInterface.removeIndex(
      "UserClientesSavedFilters",
      "idx_user_clientes_saved_filters_unique_name"
    );
    await queryInterface.removeIndex(
      "UserClientesSavedFilters",
      "idx_user_clientes_saved_filters_isDefault"
    );
  },
};
