import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        "ContatoDepartamentos",
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          clienteContatoId: {
            type: DataTypes.INTEGER,
            references: { model: "ClienteContatos", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            allowNull: false,
          },
          departamentoId: {
            type: DataTypes.INTEGER,
            references: { model: "Departamentos", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
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
        },
        { transaction }
      );

      await queryInterface.addIndex(
        "ContatoDepartamentos",
        ["clienteContatoId"],
        {
          name: "idx_contato_departamentos_clienteContatoId",
          transaction,
        }
      );

      await queryInterface.addIndex(
        "ContatoDepartamentos",
        ["departamentoId"],
        {
          name: "idx_contato_departamentos_departamentoId",
          transaction,
        }
      );

      await queryInterface.addIndex(
        "ContatoDepartamentos",
        ["clienteContatoId", "departamentoId"],
        {
          name: "idx_contato_departamentos_unique",
          unique: true,
          transaction,
        }
      );
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable("ContatoDepartamentos", { transaction });
    });
  },
};
