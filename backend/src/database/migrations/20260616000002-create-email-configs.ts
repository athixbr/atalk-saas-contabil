import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("EmailConfigs", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      provider: {
        type: DataTypes.ENUM("resend", "smtp", "gmail", "hotmail", "exchange"),
        allowNull: false,
        defaultValue: "resend",
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fromName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fromEmail: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      apiKey: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      smtpHost: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      smtpPort: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 587,
      },
      smtpSecure: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      smtpUser: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      smtpPassword: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    await queryInterface.addIndex("EmailConfigs", ["companyId"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("EmailConfigs");
  },
};
