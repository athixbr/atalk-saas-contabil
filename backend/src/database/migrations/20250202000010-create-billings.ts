import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Billings", {
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
      contactId: {
        type: DataTypes.INTEGER,
        references: { model: "Contacts", key: "id" },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
        allowNull: true,
        comment: "Opcional - vincula com contato existente se selecionado"
      },
      clientName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Nome do cliente (digitado ou selecionado)"
      },
      tradeName: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Nome fantasia da empresa"
      },
      accountPayable: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
        comment: "Conta a pagar - quanto o cliente deve"
      },
      accountReceivable: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
        comment: "Conta a receber - quanto você deve ao cliente"
      },
      balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
        comment: "Saldo atual"
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
        comment: "Valor total"
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Data de vencimento da cobrança"
      },
      nextContactDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Próximo contato agendado"
      },
      contractNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Número do contrato ou nota fiscal"
      },
      paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "Forma de pagamento: boleto, pix, cartão, etc"
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "pendente",
        comment: "Status: pendente, aguardando_cliente, sem_resposta, andamento_com_parcelamento, andamento_sem_parcelamento, renegociacao, pago, cancelado, juridico"
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Observações gerais"
      },
      createdBy: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
        allowNull: true
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "SET NULL",
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
    return queryInterface.dropTable("Billings");
  }
};
