import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const table: any = await queryInterface.describeTable("TarefasConfig");
    
    if (!table.templateLeituraId) {
      return queryInterface.addColumn("TarefasConfig", "templateLeituraId", {
        type: DataTypes.INTEGER,
        references: { model: "TemplatesLeitura", key: "id" },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
        allowNull: true,
        comment: "Template de leitura padrão para esta configuração de tarefa"
      });
    }
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("TarefasConfig", "templateLeituraId");
  }
};
