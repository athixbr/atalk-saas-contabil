import __cjs_sequelize from "sequelize";
const { QueryInterface } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tasks", "isAvulsa");
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tasks", "isAvulsa", {
      type: "BOOLEAN",
      allowNull: false,
      defaultValue: false
    });
  }
};
