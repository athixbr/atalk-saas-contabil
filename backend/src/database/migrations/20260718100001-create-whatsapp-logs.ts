import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("WhatsappLogs", {
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
      whatsappId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "Whatsapps", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      whatsappTemplateId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "WhatsappTemplates", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      to: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
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

    await queryInterface.addIndex("WhatsappLogs", ["companyId"]);
    await queryInterface.addIndex("WhatsappLogs", ["whatsappId"]);
    await queryInterface.addIndex("WhatsappLogs", ["whatsappTemplateId"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("WhatsappLogs");
  },
};
