import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("EmailLogs", {
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
      emailConfigId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "EmailConfigs", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      emailTemplateId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "EmailTemplates", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      toEmail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      provider: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("sent", "failed"),
        allowNull: false,
        defaultValue: "sent",
      },
      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
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

    await queryInterface.addIndex("EmailLogs", ["companyId"]);
    await queryInterface.addIndex("EmailLogs", ["emailConfigId"]);
    await queryInterface.addIndex("EmailLogs", ["emailTemplateId"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("EmailLogs");
  },
};
