import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("AgendamentosCertidoes", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      data: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      hora: {
        type: DataTypes.TIME,
        allowNull: false
      },
      descricao: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      clienteIds: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      },
      status: {
        type: DataTypes.ENUM("pendente", "processando", "concluido", "erro"),
        allowNull: false,
        defaultValue: "pendente"
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("AgendamentosCertidoes");
  }
};
