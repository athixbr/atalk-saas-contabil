import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("ModeloParametrosEndpoints", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      modeloParametrosId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "modelos_parametros", key: "id" },
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

    await queryInterface.addIndex("ModeloParametrosEndpoints", ["modeloParametrosId"]);
    await queryInterface.addIndex("ModeloParametrosEndpoints", ["tipo", "endpointId"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("ModeloParametrosEndpoints");
  },
};
