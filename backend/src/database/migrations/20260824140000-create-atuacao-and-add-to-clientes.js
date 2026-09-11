import __cjs_sequelize from "sequelize";
const { DataTypes } = __cjs_sequelize;

const tableExists = async (queryInterface, tableName) => {
  const tables = await queryInterface.showAllTables();
  return tables.some(table => {
    const name = typeof table === "object" ? table.tableName || table.name : table;
    return name === tableName;
  });
};

const columnExists = async (queryInterface, tableName, columnName) => {
  if (!(await tableExists(queryInterface, tableName))) return false;
  const description = await queryInterface.describeTable(tableName);
  return Boolean(description[columnName]);
};

export default {
  up: async (queryInterface) => {
    if (!(await tableExists(queryInterface, "Atuacao"))) {
      await queryInterface.createTable("Atuacao", {
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
          allowNull: false,
          references: { model: "Companies", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
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

    try {
      await queryInterface.addIndex("Atuacao", ["companyId"], {
        name: "Atuacao_companyId_idx",
      });
    } catch (error) {
      if (!String(error?.message || "").includes("already exists")) throw error;
    }

    if (!(await columnExists(queryInterface, "Clientes", "atuacaoId"))) {
      await queryInterface.addColumn("Clientes", "atuacaoId", {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "Atuacao", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    }
  },

  down: async (queryInterface) => {
    if (await columnExists(queryInterface, "Clientes", "atuacaoId")) {
      await queryInterface.removeColumn("Clientes", "atuacaoId");
    }
    if (await tableExists(queryInterface, "Atuacao")) {
      await queryInterface.dropTable("Atuacao");
    }
  },
};
