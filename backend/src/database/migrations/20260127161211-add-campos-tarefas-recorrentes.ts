import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Adicionar novos campos à tabela TarefasRecorrentes
    await queryInterface.addColumn("TarefasRecorrentes", "diasAntecipacao", {
      type: DataTypes.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("TarefasRecorrentes", "diasInicio", {
      type: DataTypes.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("TarefasRecorrentes", "tipoDiasAntes", {
      type: DataTypes.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("TarefasRecorrentes", "prazosFixos", {
      type: DataTypes.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("TarefasRecorrentes", "sabadoUtil", {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });

    await queryInterface.addColumn("TarefasRecorrentes", "competencia", {
      type: DataTypes.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("TarefasRecorrentes", "exigirRobo", {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });

    await queryInterface.addColumn("TarefasRecorrentes", "passivelMulta", {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });

    await queryInterface.addColumn("TarefasRecorrentes", "alertaGuia", {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });

    await queryInterface.addColumn("TarefasRecorrentes", "checklistObrigatorio", {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });

    await queryInterface.addColumn("TarefasRecorrentes", "notificarCliente", {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });

    await queryInterface.addColumn("TarefasRecorrentes", "servicoLiberado", {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });

    await queryInterface.addColumn("TarefasRecorrentes", "baixarAutomatico", {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });
  },

  down: async (queryInterface: QueryInterface) => {
    // Remover os campos adicionados
    await queryInterface.removeColumn("TarefasRecorrentes", "diasAntecipacao");
    await queryInterface.removeColumn("TarefasRecorrentes", "diasInicio");
    await queryInterface.removeColumn("TarefasRecorrentes", "tipoDiasAntes");
    await queryInterface.removeColumn("TarefasRecorrentes", "prazosFixos");
    await queryInterface.removeColumn("TarefasRecorrentes", "sabadoUtil");
    await queryInterface.removeColumn("TarefasRecorrentes", "competencia");
    await queryInterface.removeColumn("TarefasRecorrentes", "exigirRobo");
    await queryInterface.removeColumn("TarefasRecorrentes", "passivelMulta");
    await queryInterface.removeColumn("TarefasRecorrentes", "alertaGuia");
    await queryInterface.removeColumn("TarefasRecorrentes", "checklistObrigatorio");
    await queryInterface.removeColumn("TarefasRecorrentes", "notificarCliente");
    await queryInterface.removeColumn("TarefasRecorrentes", "servicoLiberado");
    await queryInterface.removeColumn("TarefasRecorrentes", "baixarAutomatico");
  },
};
