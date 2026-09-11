import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;

const addColumnIfMissing = async (
  queryInterface: typeof QueryInterface,
  tableName: string,
  columnName: string,
  definition: any
) => {
  const table = await queryInterface.describeTable(tableName);
  if (!table[columnName]) {
    await queryInterface.addColumn(tableName, columnName, definition);
  }
};

const removeColumnIfExists = async (
  queryInterface: typeof QueryInterface,
  tableName: string,
  columnName: string
) => {
  const table = await queryInterface.describeTable(tableName);
  if (table[columnName]) {
    await queryInterface.removeColumn(tableName, columnName);
  }
};

module.exports = {
  up: async (queryInterface: typeof QueryInterface) => {
    await addColumnIfMissing(queryInterface, "Clientes", "atuacaoIds", {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    });

    await addColumnIfMissing(queryInterface, "ClienteVigencias", "segmentoId", {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, "ClienteVigencias", "atuacaoId", {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
    await addColumnIfMissing(queryInterface, "ClienteVigencias", "atuacaoIds", {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    });
    await addColumnIfMissing(queryInterface, "modelos_parametros", "atuacaoIds", {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    });

    await queryInterface.sequelize.query(`
      UPDATE "Clientes"
      SET "atuacaoIds" = CASE WHEN "atuacaoId" IS NULL THEN '[]'::json ELSE json_build_array("atuacaoId") END
      WHERE "atuacaoIds" IS NULL OR "atuacaoIds"::text = '[]'
    `);

    await queryInterface.sequelize.query(`
      UPDATE "ClienteVigencias" cv
      SET
        "segmentoId" = c."segmentoId",
        "atuacaoId" = c."atuacaoId",
        "atuacaoIds" = CASE WHEN c."atuacaoId" IS NULL THEN '[]'::json ELSE json_build_array(c."atuacaoId") END
      FROM "Clientes" c
      WHERE cv."clienteId" = c.id
        AND (cv."segmentoId" IS NULL OR cv."atuacaoId" IS NULL OR cv."atuacaoIds" IS NULL OR cv."atuacaoIds"::text = '[]')
    `);
  },

  down: async (queryInterface: typeof QueryInterface) => {
    await removeColumnIfExists(queryInterface, "ClienteVigencias", "atuacaoIds");
    await removeColumnIfExists(queryInterface, "ClienteVigencias", "atuacaoId");
    await removeColumnIfExists(queryInterface, "ClienteVigencias", "segmentoId");
    await removeColumnIfExists(queryInterface, "modelos_parametros", "atuacaoIds");
    await removeColumnIfExists(queryInterface, "Clientes", "atuacaoIds");
  },
};
