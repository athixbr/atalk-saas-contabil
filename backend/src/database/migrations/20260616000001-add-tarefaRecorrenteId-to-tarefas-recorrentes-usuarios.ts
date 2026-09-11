import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableDescription = await queryInterface.describeTable("TarefasRecorrentesUsuarios");

    if (!tableDescription.tarefaRecorrenteId) {
      await queryInterface.addColumn("TarefasRecorrentesUsuarios", "tarefaRecorrenteId", {
        type: DataTypes.INTEGER,
        references: { model: "TarefasRecorrentes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: true
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const tableDescription = await queryInterface.describeTable("TarefasRecorrentesUsuarios");

    if (tableDescription.tarefaRecorrenteId) {
      await queryInterface.removeColumn("TarefasRecorrentesUsuarios", "tarefaRecorrenteId");
    }
  }
};
