import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Remover campo inscricaoMunicipal
      await queryInterface.removeColumn("Clientes", "inscricaoMunicipal", {
        transaction,
      });

      // Remover campos de Dados Comerciais
      await queryInterface.removeColumn("Clientes", "responsavel", {
        transaction,
      });
      await queryInterface.removeColumn("Clientes", "dataInicioContrato", {
        transaction,
      });
      await queryInterface.removeColumn("Clientes", "valorMensalidade", {
        transaction,
      });
      await queryInterface.removeColumn("Clientes", "diaVencimento", {
        transaction,
      });

      // Adicionar campo produtorRural
      await queryInterface.addColumn(
        "Clientes",
        "produtorRural",
        {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        { transaction }
      );

      // Modificar campo inscricaoEstadual para TEXT (permitir múltiplas)
      await queryInterface.changeColumn(
        "Clientes",
        "inscricaoEstadual",
        {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        { transaction }
      );
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Reverter inscricaoEstadual para STRING
      await queryInterface.changeColumn(
        "Clientes",
        "inscricaoEstadual",
        {
          type: DataTypes.STRING,
          allowNull: true,
        },
        { transaction }
      );

      // Remover produtorRural
      await queryInterface.removeColumn("Clientes", "produtorRural", {
        transaction,
      });

      // Adicionar de volta campos de Dados Comerciais
      await queryInterface.addColumn(
        "Clientes",
        "diaVencimento",
        {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        { transaction }
      );
      await queryInterface.addColumn(
        "Clientes",
        "valorMensalidade",
        {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
        },
        { transaction }
      );
      await queryInterface.addColumn(
        "Clientes",
        "dataInicioContrato",
        {
          type: DataTypes.DATE,
          allowNull: true,
        },
        { transaction }
      );
      await queryInterface.addColumn(
        "Clientes",
        "responsavel",
        {
          type: DataTypes.STRING,
          allowNull: true,
        },
        { transaction }
      );

      // Adicionar de volta inscricaoMunicipal
      await queryInterface.addColumn(
        "Clientes",
        "inscricaoMunicipal",
        {
          type: DataTypes.STRING,
          allowNull: true,
        },
        { transaction }
      );
    });
  },
};
