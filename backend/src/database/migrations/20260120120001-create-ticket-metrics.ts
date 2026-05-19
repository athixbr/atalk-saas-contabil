import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("TicketMetrics", {
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
        allowNull: false,
        unique: true
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      // TEMPOS GERAIS
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      firstResponseAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Primeira visualização do ticket por um usuário"
      },
      firstInteractionAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Primeira mensagem enviada por um atendente"
      },
      closedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      // TEMPOS EM SEGUNDOS
      tempoEsperaInicial: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "Segundos até primeira visualização"
      },
      tempoAtePrimeiraResposta: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "Segundos até primeira mensagem do atendente"
      },
      tempoTotalAtendimento: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "Segundos do início ao fechamento"
      },
      tempoOcioso: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "Tempo sem interação do atendente"
      },
      tempoAtivo: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "Tempo com interação ativa"
      },
      // TRANSFERÊNCIAS
      numeroTransferencias: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      numeroMudancasFila: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      // ESTATÍSTICAS
      totalMensagensUsuario: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "Total de mensagens enviadas pelos atendentes"
      },
      totalMensagensCliente: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "Total de mensagens do cliente"
      },
      // DADOS ADICIONAIS
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "waiting"
      },
      ultimaInteracaoClienteAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Última mensagem do cliente"
      },
      ultimaInteracaoUsuarioAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Última mensagem do atendente"
      },
      tempoDesdeUltimaInteracao: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "Segundos desde a última interação (para detectar tickets parados)"
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("TicketMetrics");
  }
};
