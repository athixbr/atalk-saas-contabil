import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn("Clientes", "codigoErp", {
      type: DataTypes.STRING,
      allowNull: true,
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn("Clientes", "codigoErp", {
      type: DataTypes.STRING,
      allowNull: true,
    });
  },
};
