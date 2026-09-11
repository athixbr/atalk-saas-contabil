import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn("Socios", "cpf", {
      type: DataTypes.STRING(14),
      allowNull: true
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn("Socios", "cpf", {
      type: DataTypes.STRING(14),
      allowNull: false
    });
  }
};
