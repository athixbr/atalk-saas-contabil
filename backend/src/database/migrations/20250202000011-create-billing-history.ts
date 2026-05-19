import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("BillingHistory", {
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
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      contactDate: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "Data e hora do contato realizado"
      },
      contactType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "Tipo: telefone, email, whatsapp, presencial, outro"
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: "Descrição/anotação do contato realizado"
      },
      previousStatus: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "Status anterior da cobrança"
      },
      newStatus: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "Novo status da cobrança"
      },
      amountPaid: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: "Valor pago (se houve pagamento parcial)"
      },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
        allowNull: false,
        comment: "Usuário que realizou o contato"
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
    return queryInterface.dropTable("BillingHistory");
  }
};
