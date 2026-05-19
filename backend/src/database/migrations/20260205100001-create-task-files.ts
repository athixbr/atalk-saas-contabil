import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("TaskFiles", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      taskId: {
        type: DataTypes.INTEGER,
        references: { model: "Tasks", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      templateLeituraId: {
        type: DataTypes.INTEGER,
        references: { model: "TemplatesLeitura", key: "id" },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
        allowNull: true,
        comment: "Template usado para leitura automática"
      },
      filename: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Nome do arquivo no storage"
      },
      originalName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Nome original do arquivo"
      },
      path: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: "Path no Digital Ocean Spaces: company{id}/tasks/{taskId}/arquivo.pdf"
      },
      size: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Tamanho em bytes"
      },
      mimeType: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      textoExtraido: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Texto completo extraído do documento"
      },
      dadosExtraidos: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: "Dados estruturados extraídos pelo template"
      },
      status: {
        type: DataTypes.STRING(50),
        defaultValue: "pending",
        allowNull: false,
        comment: "pending, processing, completed, error, review"
      },
      dataLeitura: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Quando foi processado"
      },
      erro: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Mensagem de erro se houver"
      },
      confianca: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        comment: "Nível de confiança da extração: 0.00 a 1.00"
      },
      uploadedBy: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
        allowNull: false
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
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
    return queryInterface.dropTable("TaskFiles");
  }
};
