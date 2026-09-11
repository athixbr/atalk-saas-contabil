import __cjs_sequelize from "sequelize";
const { DataTypes } = __cjs_sequelize;

module.exports = {
  up: (queryInterface: any) => {
    return queryInterface.createTable("UsersViewPreferences", {
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
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
      queryInterface.addIndex("UsersViewPreferences", ["userId", "companyId", "name"], {
        name: "idx_users_view_preferences_user_company_name",
        unique: true
      })
    );
  },

  down: (queryInterface: any) => {
    return queryInterface.dropTable("UsersViewPreferences");
  }
};
