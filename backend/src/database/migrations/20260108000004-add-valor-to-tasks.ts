import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tasks", "valor", {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Valor negociado da tarefa em reais"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tasks", "valor");
  }
};
