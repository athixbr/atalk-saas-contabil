import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tables = await queryInterface.showAllTables();
    
    if (!tables.includes("TagsParametros")) {
      await queryInterface.createTable("TagsParametros", {
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
        cor: {
          type: DataTypes.STRING(7),
          allowNull: false,
          defaultValue: "#A4CCCC",
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
      
      // Adicionar índices
      try {
        await queryInterface.addIndex("TagsParametros", ["companyId"], {
          name: "idx_tags_parametros_companyId",
        });
      } catch (e) {
        console.log("Índice idx_tags_parametros_companyId já existe");
      }
      
      try {
        await queryInterface.addIndex("TagsParametros", ["nome"], {
          name: "idx_tags_parametros_nome",
        });
      } catch (e) {
        console.log("Índice idx_tags_parametros_nome já existe");
      }
    }
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("TagsParametros");
  },
};
