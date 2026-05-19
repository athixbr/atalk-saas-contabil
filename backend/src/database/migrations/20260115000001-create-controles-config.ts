import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("ControlesConfig", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      codigo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      departamentoId: {
        type: DataTypes.INTEGER,
        references: { model: "Departamentos", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      grupoServicoId: {
        type: DataTypes.INTEGER,
        references: { model: "GrupoServico", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      tipoServicoId: {
        type: DataTypes.INTEGER,
        references: { model: "TipoServico", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      prioridadeId: {
        type: DataTypes.INTEGER,
        references: { model: "Prioridades", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      prazoId: {
        type: DataTypes.INTEGER,
        references: { model: "Prazos", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      tipoControle: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "interno",
        comment: "interno ou cliente",
      },
      recorrente: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      valorReferencial: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      sabadoUtil: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      diasNaoUteis: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Antecipar, Postergar ou Manter",
      },
      diasLembrete: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      aceitaArquivos: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("ControlesConfig");
  },
};
