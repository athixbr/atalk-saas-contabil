import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("TarefasGeradas", "controleClienteId", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "ControleClientes",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("TarefasGeradas", "controleClienteId");
  }
};
