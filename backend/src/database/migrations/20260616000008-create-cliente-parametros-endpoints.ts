import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("ClienteParametrosEndpoints", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      clienteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Clientes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      tipo: {
        type: DataTypes.ENUM("controle", "recorrente", "tarefa", "parcelamento"),
        allowNull: false,
      },
      endpointId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex("ClienteParametrosEndpoints", ["clienteId"]);
    await queryInterface.addIndex("ClienteParametrosEndpoints", ["tipo", "endpointId"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("ClienteParametrosEndpoints");
  },
};
