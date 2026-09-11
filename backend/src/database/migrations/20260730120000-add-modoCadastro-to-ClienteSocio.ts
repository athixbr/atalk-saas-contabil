import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("ClienteSocio", "modoCadastro", {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "avancado",
      comment: "Modo usado no formulário: basico ou avancado — controla quais campos aparecem por padrão ao reabrir para edição"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("ClienteSocio", "modoCadastro");
  }
};
