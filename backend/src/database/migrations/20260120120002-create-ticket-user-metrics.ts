import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("TicketUserMetrics", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      ticketId: {
        type: DataTypes.INTEGER,
        references: { model: "Tickets", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      ticketMetricId: {
        type: DataTypes.INTEGER,
        references: { model: "TicketMetrics", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      queueId: {
        type: DataTypes.INTEGER,
        references: { model: "Queues", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
      },
      // CONTROLE DE TEMPO
      startedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "Quando usuário pegou/recebeu o ticket"
      },
      finishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Quando transferiu/finalizou"
      },
      tempoTotal: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "Segundos totais com o ticket"
      },
      tempoAtivo: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "Tempo realmente interagindo"
      },
      tempoOcioso: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "Tempo parado (sem responder)"
      },
      // AÇÕES
      totalMensagensEnviadas: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      foiTransferido: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: "Se transferiu para outro usuário"
      },
      recebeuTransferencia: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: "Se recebeu ticket transferido"
      },
      finalizouTicket: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: "Se foi quem fechou o ticket"
      },
      // QUALIDADE
      tempoMedioResposta: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "Média de tempo de resposta em segundos"
      },
      tempoAtePrimeiraResposta: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "Tempo até enviar primeira mensagem"
      },
      // ORDEM NA SEQUÊNCIA
      order: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false,
        comment: "Ordem na sequência de atendimento (1º, 2º, 3º)"
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
    return queryInterface.dropTable("TicketUserMetrics");
  }
};
