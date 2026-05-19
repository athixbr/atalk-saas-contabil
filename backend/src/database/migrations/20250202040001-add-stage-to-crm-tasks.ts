import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      // Adicionar stageId em CrmTasks
      queryInterface.addColumn("CrmTasks", "stageId", {
        type: DataTypes.INTEGER,
        references: { model: "CrmTaskStages", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
      }),
      
      // Adicionar configuração de pipeline de tarefas (month ou stage)
      queryInterface.addColumn("CompaniesSettings", "taskPipelineMode", {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "month"
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("CrmTasks", "stageId"),
      queryInterface.removeColumn("CompaniesSettings", "taskPipelineMode")
    ]);
  }
};
