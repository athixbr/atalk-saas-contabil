import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("CrmClients", {
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
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "Nome do responsável/contato"
      },
      companyName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Razão social da empresa"
      },
      cnpj: {
        type: DataTypes.STRING(18),
        allowNull: true,
        comment: "CNPJ formatado"
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      whatsapp: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      street: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Rua/Avenida"
      },
      number: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: "Número do endereço"
      },
      complement: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Complemento"
      },
      neighborhood: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Bairro"
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Cidade"
      },
      state: {
        type: DataTypes.STRING(2),
        allowNull: true,
        comment: "UF do estado"
      },
      zipCode: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: "CEP"
      },
      businessTypeId: {
        type: DataTypes.INTEGER,
        references: { model: "CrmBusinessTypes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
      },
      taxRegimeId: {
        type: DataTypes.INTEGER,
        references: { model: "CrmTaxRegimes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
      },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true,
        comment: "Responsável pelo cliente"
      },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: "active",
        allowNull: false,
        comment: "active, inactive"
      },
      notes: {
        type: DataTypes.TEXT,
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
    return queryInterface.dropTable("CrmClients");
  }
};
