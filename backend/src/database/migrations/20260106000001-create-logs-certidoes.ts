import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("LogsCertidoes", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      certidaoId: {
        type: DataTypes.INTEGER,
        references: { model: "Certidoes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: true
      },
      clienteCertidaoId: {
        type: DataTypes.INTEGER,
        references: { model: "ClientesCertidoes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      tipo: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      categoria: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "em_processamento"
      },
      codigoErro: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      mensagemErro: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      requestData: {
        type: DataTypes.JSON,
        allowNull: true
      },
      responseData: {
        type: DataTypes.JSON,
        allowNull: true
      },
      tentativa: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      tempoResposta: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Tempo de resposta em milissegundos"
      },
      custoConsulta: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: "Custo da consulta em reais"
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
    return queryInterface.dropTable("LogsCertidoes");
  }
};
