import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query(`
      UPDATE "Clientes"
      SET "razaoSocial" = COALESCE(NULLIF(TRIM("razaoSocial"), ''), NULLIF(TRIM("nome"), ''), 'Cliente sem razão social')
      WHERE "razaoSocial" IS NULL OR TRIM("razaoSocial") = '';
    `);

    await queryInterface.sequelize.query(`
      UPDATE "Clientes"
      SET "nomeFantasia" = COALESCE(NULLIF(TRIM("nomeFantasia"), ''), NULLIF(TRIM("razaoSocial"), ''), NULLIF(TRIM("nome"), ''), 'Cliente sem fantasia')
      WHERE "nomeFantasia" IS NULL OR TRIM("nomeFantasia") = '';
    `);

    await queryInterface.sequelize.query(`
      UPDATE "Clientes"
      SET "apelido" = COALESCE(NULLIF(TRIM("apelido"), ''), NULLIF(TRIM("nomeFantasia"), ''), NULLIF(TRIM("razaoSocial"), ''), NULLIF(TRIM("nome"), ''), 'Cliente sem apelido')
      WHERE "apelido" IS NULL OR TRIM("apelido") = '';
    `);

    await queryInterface.changeColumn("Clientes", "razaoSocial", {
      type: DataTypes.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn("Clientes", "nomeFantasia", {
      type: DataTypes.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn("Clientes", "apelido", {
      type: DataTypes.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.changeColumn("Clientes", "razaoSocial", {
      type: DataTypes.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn("Clientes", "nomeFantasia", {
      type: DataTypes.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn("Clientes", "apelido", {
      type: DataTypes.STRING,
      allowNull: true,
    });
  },
};
