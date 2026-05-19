import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("ControleClienteHistorico", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      controleClienteId: {
        type: DataTypes.INTEGER,
        references: { model: "ControleClientes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
      },
      acao: {
        type: DataTypes.ENUM(
          "vinculacao",
          "desvinculacao",
          "alteracao_datas",
          "alteracao_responsavel",
          "ativacao",
          "desativacao"
        ),
        allowNull: false,
      },
      dadosAnteriores: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      dadosNovos: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      usuarioId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true,
      },
      observacao: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("ControleClienteHistorico");
  },
};
