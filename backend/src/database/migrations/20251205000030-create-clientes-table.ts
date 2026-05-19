import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Criar tabela Clientes
      await queryInterface.createTable(
        "Clientes",
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          companyId: {
            type: DataTypes.INTEGER,
            references: { model: "Companies", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
            allowNull: false,
          },
          nome: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          tipoCliente: {
            type: DataTypes.ENUM("fisica", "juridica"),
            allowNull: false,
            defaultValue: "fisica",
          },
          cpf: {
            type: DataTypes.STRING(14),
            allowNull: true,
          },
          cnpj: {
            type: DataTypes.STRING(18),
            allowNull: true,
          },
          razaoSocial: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          inscricaoEstadual: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          inscricaoMunicipal: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          nomeFantasia: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          cep: {
            type: DataTypes.STRING(9),
            allowNull: true,
          },
          logradouro: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          numero: {
            type: DataTypes.STRING(10),
            allowNull: true,
          },
          complemento: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          bairro: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          cidade: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          estado: {
            type: DataTypes.STRING(2),
            allowNull: true,
          },
          telefone: {
            type: DataTypes.STRING(20),
            allowNull: true,
          },
          celular: {
            type: DataTypes.STRING(20),
            allowNull: true,
          },
          email: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          site: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          observacoes: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          responsavel: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          dataInicioContrato: {
            type: DataTypes.DATE,
            allowNull: true,
          },
          valorMensalidade: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
          },
          diaVencimento: {
            type: DataTypes.INTEGER,
            allowNull: true,
          },
          ativo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
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

      // Criar índices para otimização
      await queryInterface.addIndex("Clientes", ["companyId"], {
        name: "idx_clientes_company_id",
        transaction,
      });

      await queryInterface.addIndex("Clientes", ["cpf"], {
        name: "idx_clientes_cpf",
        transaction,
      });

      await queryInterface.addIndex("Clientes", ["cnpj"], {
        name: "idx_clientes_cnpj",
        transaction,
      });

      await queryInterface.addIndex("Clientes", ["ativo"], {
        name: "idx_clientes_ativo",
        transaction,
      });

      await queryInterface.addIndex("Clientes", ["email"], {
        name: "idx_clientes_email",
        transaction,
      });

      await queryInterface.addIndex("Clientes", ["tipoCliente"], {
        name: "idx_clientes_tipo",
        transaction,
      });
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable("Clientes", { transaction });
    });
  },
};
