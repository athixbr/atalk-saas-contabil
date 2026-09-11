import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        "ContatoAppAcessos",
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
          companyId: {
            type: DataTypes.INTEGER,
            references: { model: "Companies", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            allowNull: false,
          },
          ativo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          senhaHash: {
            type: DataTypes.STRING,
            allowNull: true,
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
        "ContatoAppAcessos",
        ["clienteContatoId"],
        {
          name: "idx_contato_app_acessos_clienteContatoId_unique",
          unique: true,
          transaction,
        }
      );
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable("ContatoAppAcessos", { transaction });
    });
  },
};
