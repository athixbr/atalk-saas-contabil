import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("ClientesCertidoes", {
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
      nome: {
        type: DataTypes.STRING,
        allowNull: false
      },
      tipoCliente: {
        type: DataTypes.ENUM("fisica", "juridica"),
        allowNull: false,
        defaultValue: "fisica"
      },
      cpf: {
        type: DataTypes.STRING(14),
        allowNull: true
      },
      cnpj: {
        type: DataTypes.STRING(18),
        allowNull: true
      },
      razaoSocial: {
        type: DataTypes.STRING,
        allowNull: true
      },
      cep: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      logradouro: {
        type: DataTypes.STRING,
        allowNull: true
      },
      numero: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      complemento: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      bairro: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      cidade: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      estado: {
        type: DataTypes.STRING(2),
        allowNull: true
      },
      telefone: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true
      },
      certidoesSelecionadas: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
    return queryInterface.dropTable("ClientesCertidoes");
  }
};
