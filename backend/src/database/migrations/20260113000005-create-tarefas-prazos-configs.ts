import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("TarefasPrazosConfigs", {
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
      tarefaInfoId: {
        type: DataTypes.INTEGER,
        references: { model: "TarefasInfoGerais", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      quantidadeDiasAnteciparEntrega: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      quantidadeDiasIniciar: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      tipoDosdiasAntes: {
        type: DataTypes.ENUM("Dias úteis", "Dias corridos"),
        defaultValue: "Dias úteis"
      },
      prazosFixosDiasNaoUteis: {
        type: DataTypes.ENUM(
          "Antecipar para o dia útil anterior",
          "Postergar para o próximo dia útil",
          "Manter o dia exato"
        ),
        defaultValue: "Antecipar para o dia útil anterior"
      },
      sabadoUtil: {
        type: DataTypes.ENUM("S", "N"),
        defaultValue: "N"
      },
      competenciaReferencia: {
        type: DataTypes.ENUM(
          "Mês anterior",
          "2 meses antes",
          "3 meses antes",
          "Ano anterior",
          "Ano atual",
          "Mês atual",
          "Mês seguinte"
        ),
        defaultValue: "Mês anterior"
      },
      obrigatorioChecklist: {
        type: DataTypes.ENUM("S", "N"),
        defaultValue: "N"
      },
      baixarAutomaticamenteTarefaAoConcluirAtividades: {
        type: DataTypes.ENUM("Sim", "Não"),
        defaultValue: "Não"
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
    return queryInterface.dropTable("TarefasPrazosConfigs");
  }
};
