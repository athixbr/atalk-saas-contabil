import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tasks", "isAvulsa", {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Indica se é uma tarefa avulsa (true) ou do sistema/TarefaConfig (false)"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tasks", "isAvulsa");
  }
};
