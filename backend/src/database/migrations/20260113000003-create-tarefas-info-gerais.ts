import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("TarefasInfoGerais", {
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
      nomeObrigacao: {
        type: DataTypes.STRING,
        allowNull: false
      },
      departamentoId: {
        type: DataTypes.INTEGER,
        references: { model: "Departamentos", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
      },
      tipoServicoId: {
        type: DataTypes.INTEGER,
        references: { model: "TipoServico", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
      },
      grupoServicoId: {
        type: DataTypes.INTEGER,
        references: { model: "GrupoServico", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
      },
      titulo: {
        type: DataTypes.STRING,
        allowNull: true
      },
      descricao: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      obrigatorio: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      esfera: {
        type: DataTypes.ENUM("Federal", "Estadual", "Municipal", "Interno", "Outros"),
        defaultValue: "Federal"
      },
      exigeRobo: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      passivelMulta: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      alertaGuiaNaoLida: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      notificarCliente: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      servicoLiberadoNoApp: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      gerarPara: {
        type: DataTypes.ENUM("Matriz/Filial", "Apenas Matriz", "Apenas Filial"),
        defaultValue: "Matriz/Filial"
      },
      ativa: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      observacao: {
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
    return queryInterface.dropTable("TarefasInfoGerais");
  }
};
