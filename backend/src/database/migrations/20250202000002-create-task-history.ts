import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("TaskHistory", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      taskId: {
        type: DataTypes.INTEGER,
        references: { model: "Tasks", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      fromUserId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
        allowNull: true
      },
      toUserId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
        allowNull: true
      },
      actionType: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "Tipo de ação: created, transferred, deleted, restored"
      },
      previousValue: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "JSON com dados anteriores"
      },
      newValue: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "JSON com dados novos"
      },
      performedBy: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
        allowNull: false,
        comment: "Usuário que executou a ação"
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Motivo/observações da ação"
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
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
    return queryInterface.dropTable("TaskHistory");
  }
};
