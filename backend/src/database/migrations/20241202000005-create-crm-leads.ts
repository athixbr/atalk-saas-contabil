import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("CrmLeads", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
        type: DataTypes.STRING(255),
        allowNull: false
      },
      contactId: {
        type: DataTypes.INTEGER,
        references: { model: "Contacts", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      businessTypeId: {
        type: DataTypes.INTEGER,
        references: { model: "CrmBusinessTypes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
      },
      taxRegimeId: {
        type: DataTypes.INTEGER,
        references: { model: "CrmTaxRegimes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
      },
      sourceId: {
        type: DataTypes.INTEGER,
        references: { model: "CrmSources", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
      },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
      },
      stage: {
        type: DataTypes.STRING(50),
        defaultValue: "prospecting",
        allowNull: false
      },
      estimatedValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      lastContactDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      nextAction: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      nextActionDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      lostReason: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      closedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: "active",
        allowNull: false
      },
      notes: {
        type: DataTypes.TEXT,
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
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("CrmLeads");
  }
};
