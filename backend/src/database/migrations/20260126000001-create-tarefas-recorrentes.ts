import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("TarefasRecorrentes", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      // Informações Gerais
      codigo: {
        type: DataTypes.STRING,
        allowNull: true
      },
      classificacao: {
        type: DataTypes.STRING,
        allowNull: true
      },
      mininome: {
        type: DataTypes.STRING,
        allowNull: true
      },
      nomeTarefa: {
        type: DataTypes.STRING,
        allowNull: false
      },
      departamentoId: {
        type: DataTypes.INTEGER,
        references: { model: "Queues", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
      },
      
      // Entregas Mensais (JSON com configuração de cada mês)
      entregasMensais: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
      },
      
      // Prazos e Configurações
      prazoEntregaDias: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      prazoEntregaHoras: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      esfera: {
        type: DataTypes.ENUM("Municipal", "Estadual", "Federal"),
        allowNull: true
      },
      exigeAgendamento: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      habilitarDeclaracao: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      notificaVencimento: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
      },
      parecerAutomatico: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      recorrente: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
      },
      requerAnexo: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      requerCampoProcesso: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      responderProtocolo: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      ativa: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
      },
      retencaoMeses: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      prazoMinimoRealizacao: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      semVencimento: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      
      // Checklist
      checklistId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      
      // Notificações (Array de canais)
      canaisNotificacao: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
      
      // Financeiro
      valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      
      // Controle
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      createdBy: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
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
    return queryInterface.dropTable("TarefasRecorrentes");
  }
};
