import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("BillingAttachments", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      billingId: {
        type: DataTypes.INTEGER,
        references: { model: "Billings", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      fileName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Nome original do arquivo"
      },
      filePath: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Caminho do arquivo no servidor"
      },
      fileType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "Tipo do arquivo: pdf, jpg, png, doc, etc"
      },
      fileSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Tamanho do arquivo em bytes"
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Descrição do documento: contrato, nota fiscal, comprovante, etc"
      },
      uploadedBy: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
        allowNull: false,
        comment: "Usuário que fez upload"
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
    return queryInterface.dropTable("BillingAttachments");
  }
};
