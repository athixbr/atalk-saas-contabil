import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Certidoes", {
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
      clienteCertidaoId: {
        type: DataTypes.INTEGER,
        references: { model: "ClientesCertidoes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      tipo: {
        type: DataTypes.ENUM("federal", "estadual", "municipal"),
        allowNull: false
      },
      categoria: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM("pendente", "emitida", "erro"),
        allowNull: false,
        defaultValue: "pendente"
      },
      mensagemErro: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      arquivoPdf: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      dataEmissao: {
        type: DataTypes.DATE,
        allowNull: true
      },
      validade: {
        type: DataTypes.DATE,
        allowNull: true
      },
      dataConsulta: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      origemApi: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      dadosResposta: {
        type: DataTypes.JSON,
        allowNull: true
      },
      agendamentoId: {
        type: DataTypes.INTEGER,
        references: { model: "AgendamentosCertidoes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
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
    return queryInterface.dropTable("Certidoes");
  }
};
