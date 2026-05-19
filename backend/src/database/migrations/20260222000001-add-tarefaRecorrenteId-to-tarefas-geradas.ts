import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Adicionar coluna tarefaRecorrenteId se não existir
    const tableInfo: any = await queryInterface.describeTable("TarefasGeradas");
    
    if (!tableInfo.tarefaRecorrenteId) {
      await queryInterface.addColumn("TarefasGeradas", "tarefaRecorrenteId", {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "TarefasRecorrentes",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      });

      // Adicionar índice
      await queryInterface.addIndex("TarefasGeradas", ["tarefaRecorrenteId"], {
        name: "idx_tarefas_geradas_recorrente_id"
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeIndex("TarefasGeradas", "idx_tarefas_geradas_recorrente_id");
    await queryInterface.removeColumn("TarefasGeradas", "tarefaRecorrenteId");
  }
};
