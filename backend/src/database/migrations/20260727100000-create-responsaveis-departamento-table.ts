import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        "ResponsaveisDepartamento",
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          clienteId: {
            type: DataTypes.INTEGER,
            references: { model: "Clientes", key: "id" },
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
          userId: {
            type: DataTypes.INTEGER,
            references: { model: "Users", key: "id" },
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
        "ResponsaveisDepartamento",
        ["clienteId"],
        {
          name: "idx_responsaveis_departamento_clienteId",
          transaction,
        }
      );

      await queryInterface.addIndex(
        "ResponsaveisDepartamento",
        ["departamentoId"],
        {
          name: "idx_responsaveis_departamento_departamentoId",
          transaction,
        }
      );

      await queryInterface.addIndex(
        "ResponsaveisDepartamento",
        ["userId"],
        {
          name: "idx_responsaveis_departamento_userId",
          transaction,
        }
      );

      await queryInterface.addIndex(
        "ResponsaveisDepartamento",
        ["clienteId", "departamentoId", "userId"],
        {
          name: "idx_responsaveis_departamento_unique",
          unique: true,
          transaction,
        }
      );
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable("ResponsaveisDepartamento", { transaction });
    });
  },
};
