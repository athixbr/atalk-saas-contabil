import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const table: any = await queryInterface.describeTable("Tickets");
    
    const promises = [];
    
    if (!table.lastUserId) {
      promises.push(
        queryInterface.addColumn("Tickets", "lastUserId", {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: { model: "Users", key: "id" },
          onUpdate: "SET NULL",
          onDelete: "SET NULL",
          comment: "Último usuário que estava atendendo antes de retornar por inatividade"
        })
      );
    }
    
    if (!table.lastUserName) {
      promises.push(
        queryInterface.addColumn("Tickets", "lastUserName", {
          type: DataTypes.STRING,
          allowNull: true,
          comment: "Nome do último usuário para exibição no frontend"
        })
      );
    }
    
    return Promise.all(promises);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Tickets", "lastUserId"),
      queryInterface.removeColumn("Tickets", "lastUserName")
    ]);
  }
};
