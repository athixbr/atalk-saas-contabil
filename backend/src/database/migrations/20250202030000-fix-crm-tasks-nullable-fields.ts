import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      // Alterar leadId para nullable (permitir tarefas apenas com clientId)
      queryInterface.changeColumn("CrmTasks", "leadId", {
        type: DataTypes.INTEGER,
        references: { model: "CrmLeads", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: true
      }),
      
      // Alterar clientId para nullable (permitir tarefas apenas com leadId)
      queryInterface.changeColumn("CrmTasks", "clientId", {
        type: DataTypes.INTEGER,
        references: { model: "CrmClients", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: true
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.changeColumn("CrmTasks", "leadId", {
        type: DataTypes.INTEGER,
        references: { model: "CrmLeads", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      }),
      
      queryInterface.changeColumn("CrmTasks", "clientId", {
        type: DataTypes.INTEGER,
        references: { model: "CrmClients", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      })
    ]);
  }
};
