import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("ClienteVigencias", {
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
      dataInicial: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      dataFinal: {
        type: DataTypes.DATEONLY,
        allowNull: true,
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

    await queryInterface.addIndex("ClienteVigencias", ["clienteId"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("ClienteVigencias");
  },
};
