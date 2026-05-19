import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("CertificadosDigitais", {
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
      nomeArquivo: {
        type: DataTypes.STRING,
        allowNull: false
      },
      caminhoArquivo: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      senhaEncriptada: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      tipo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "A1"
      },
      titular: {
        type: DataTypes.STRING,
        allowNull: true
      },
      cpfCnpj: {
        type: DataTypes.STRING(18),
        allowNull: true
      },
      emissor: {
        type: DataTypes.STRING,
        allowNull: true
      },
      dataInicio: {
        type: DataTypes.DATE,
        allowNull: true
      },
      validade: {
        type: DataTypes.DATE,
        allowNull: false
      },
      algoritmo: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      serialNumber: {
        type: DataTypes.STRING,
        allowNull: true
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      dataUpload: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
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
    return queryInterface.dropTable("CertificadosDigitais");
  }
};
