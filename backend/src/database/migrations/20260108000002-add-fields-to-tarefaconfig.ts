import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("TarefasConfig", "sabadoUtil", {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Indica se sábado é considerado dia útil"
      }),
      queryInterface.addColumn("TarefasConfig", "diasNaoUteis", {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: "Ação para dias não úteis: Antecipar, Postergar ou Manter"
      }),
      queryInterface.addColumn("TarefasConfig", "tarefaInterna", {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Indica se é uma tarefa interna (não precisa de cliente)"
      }),
      queryInterface.addColumn("TarefasConfig", "valorReferencial", {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: "Valor referencial padrão da tarefa em reais"
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("TarefasConfig", "sabadoUtil"),
      queryInterface.removeColumn("TarefasConfig", "diasNaoUteis"),
      queryInterface.removeColumn("TarefasConfig", "tarefaInterna"),
      queryInterface.removeColumn("TarefasConfig", "valorReferencial")
    ]);
  }
};
