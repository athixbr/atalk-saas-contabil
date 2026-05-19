import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("ClientesCertidoes", "inscricaoEstadual", {
        type: DataTypes.STRING(50),
        allowNull: true
      }),
      queryInterface.addColumn("ClientesCertidoes", "inscricaoMunicipal", {
        type: DataTypes.STRING(50),
        allowNull: true
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("ClientesCertidoes", "inscricaoEstadual"),
      queryInterface.removeColumn("ClientesCertidoes", "inscricaoMunicipal")
    ]);
  }
};
