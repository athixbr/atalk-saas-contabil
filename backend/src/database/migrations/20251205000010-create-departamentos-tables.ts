import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Criar tabela Departamentos
      await queryInterface.createTable(
        "Departamentos",
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          nome: {
            type: DataTypes.STRING,
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

      // Criar tabela DepartamentoUsuarios (relacionamento many-to-many)
      await queryInterface.createTable(
        "DepartamentoUsuarios",
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
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
          isCoordenador: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
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

      // Criar índices
      await queryInterface.addIndex(
        "Departamentos",
        ["companyId"],
        {
          name: "idx_departamentos_companyId",
          transaction,
        }
      );

      await queryInterface.addIndex(
        "Departamentos",
        ["nome", "companyId"],
        {
          name: "idx_departamentos_nome_companyId",
          transaction,
        }
      );

      await queryInterface.addIndex(
        "DepartamentoUsuarios",
        ["departamentoId"],
        {
          name: "idx_departamento_usuarios_departamentoId",
          transaction,
        }
      );

      await queryInterface.addIndex(
        "DepartamentoUsuarios",
        ["userId"],
        {
          name: "idx_departamento_usuarios_userId",
          transaction,
        }
      );

      await queryInterface.addIndex(
        "DepartamentoUsuarios",
        ["departamentoId", "userId"],
        {
          name: "idx_departamento_usuarios_unique",
          unique: true,
          transaction,
        }
      );
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable("DepartamentoUsuarios", { transaction });
      await queryInterface.dropTable("Departamentos", { transaction });
    });
  },
};
