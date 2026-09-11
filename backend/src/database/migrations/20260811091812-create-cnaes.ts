import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tables = await queryInterface.showAllTables();
    const tableExists = tables.some((table: any) => {
      const tableName = typeof table === "string" ? table : table.tableName;
      return tableName === "Cnaes";
    });

    if (!tableExists) {
      await queryInterface.createTable("Cnaes", {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        codigo: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        codigoNumerico: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        descricao: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        secao: {
          type: DataTypes.STRING,
        },
        secaoDescricao: {
          type: DataTypes.STRING,
        },
        divisao: {
          type: DataTypes.STRING,
        },
        divisaoDescricao: {
          type: DataTypes.STRING,
        },
        grupo: {
          type: DataTypes.STRING,
        },
        grupoDescricao: {
          type: DataTypes.STRING,
        },
        classe: {
          type: DataTypes.STRING,
        },
        classeDescricao: {
          type: DataTypes.STRING,
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
    }

    const [indexRows] = await queryInterface.sequelize.query(
      "SELECT to_regclass('public.cnaes_descricao_idx') AS index_name"
    );
    const indexExists = Boolean((indexRows as any[])[0]?.index_name);

    if (!indexExists) {
      await queryInterface.addIndex("Cnaes", ["descricao"], {
        name: "cnaes_descricao_idx",
      });
    }
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("Cnaes");
  },
};
