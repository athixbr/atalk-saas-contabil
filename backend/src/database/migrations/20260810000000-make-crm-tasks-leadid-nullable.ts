import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Uma tarefa pode ser vinculada a um Lead OU a um Cliente (clienteId),
    // então leadId precisa aceitar nulo para permitir tarefas só de Cliente.
    await queryInterface.changeColumn("CrmTasks", "leadId", {
      type: DataTypes.INTEGER,
      allowNull: true
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.changeColumn("CrmTasks", "leadId", {
      type: DataTypes.INTEGER,
      allowNull: false
    });
  }
};
