import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Verificar se clienteId já existe
    const columns: any = await queryInterface.describeTable("Certidoes");
    
    // Verificar se tabela ClientesCertidoes existe
    const tables = await queryInterface.showAllTables();
    const clientesCertidoesExiste = tables.includes("ClientesCertidoes");
    
    // 1. Adicionar coluna clienteId se não existir
    if (!columns.clienteId) {
      await queryInterface.addColumn("Certidoes", "clienteId", {
        type: DataTypes.INTEGER,
        references: { model: "Clientes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
      });

      // 2. Criar índice para melhor performance
      await queryInterface.addIndex("Certidoes", ["clienteId"], {
        name: "idx_certidoes_cliente_id"
      });
    }

    // 3. Migrar dados de ClientesCertidoes para Clientes (apenas se tabela existir)
    if (clientesCertidoesExiste) {
      // Primeiro, inserir clientes que não existem na tabela Clientes
      await queryInterface.sequelize.query(`
        INSERT INTO "Clientes" (
          "companyId", "nome", "tipoCliente", "cpf", "cnpj", 
          "razaoSocial", "inscricaoEstadual", "cep", "logradouro", 
          "numero", "complemento", "bairro", "cidade", "estado",
          "telefone", "email", "certidoesSelecionadas", "ativo",
          "createdAt", "updatedAt"
        )
        SELECT 
          cc."companyId", 
          cc."nome", 
          cc."tipoCliente"::text::"enum_Clientes_tipoCliente", 
          cc."cpf", 
          cc."cnpj",
          cc."razaoSocial", 
          cc."inscricaoEstadual", 
          cc."cep", 
          cc."logradouro",
          cc."numero", 
          cc."complemento", 
          cc."bairro", 
          cc."cidade", 
          cc."estado",
          cc."telefone", 
          cc."email", 
          cc."certidoesSelecionadas", 
          cc."ativo",
          cc."createdAt", 
          cc."updatedAt"
        FROM "ClientesCertidoes" cc
        WHERE NOT EXISTS (
          SELECT 1 FROM "Clientes" c 
          WHERE (c."cpf" = cc."cpf" AND cc."cpf" IS NOT NULL AND cc."cpf" != '')
          OR (c."cnpj" = cc."cnpj" AND cc."cnpj" IS NOT NULL AND cc."cnpj" != '')
        )
      `);
    }

    // 4. Atualizar clienteId nas certidões existentes (apenas se clienteCertidaoId existir)
    if (columns.clienteCertidaoId && clientesCertidoesExiste) {
      // Associar por CPF
      await queryInterface.sequelize.query(`
        UPDATE "Certidoes" cert
        SET "clienteId" = c."id"
        FROM "Clientes" c, "ClientesCertidoes" cc
        WHERE cert."clienteCertidaoId" = cc."id"
        AND c."cpf" = cc."cpf" 
        AND cc."cpf" IS NOT NULL 
        AND cc."cpf" != ''
        AND cert."clienteId" IS NULL
      `);

      // Associar por CNPJ
      await queryInterface.sequelize.query(`
        UPDATE "Certidoes" cert
        SET "clienteId" = c."id"
        FROM "Clientes" c, "ClientesCertidoes" cc
        WHERE cert."clienteCertidaoId" = cc."id"
        AND c."cnpj" = cc."cnpj" 
        AND cc."cnpj" IS NOT NULL 
        AND cc."cnpj" != ''
        AND cert."clienteId" IS NULL
      `);
    }

    // 5. Para clientes sem correspondência, mesclar certidoesSelecionadas (apenas se tabela existir)
    if (clientesCertidoesExiste) {
      await queryInterface.sequelize.query(`
        UPDATE "Clientes" c
        SET "certidoesSelecionadas" = (COALESCE(c."certidoesSelecionadas", '[]'::json)::jsonb || COALESCE(cc."certidoesSelecionadas", '[]'::json)::jsonb)::json
        FROM "ClientesCertidoes" cc
        WHERE (c."cpf" = cc."cpf" AND cc."cpf" IS NOT NULL AND cc."cpf" != '')
        OR (c."cnpj" = cc."cnpj" AND cc."cnpj" IS NOT NULL AND cc."cnpj" != '')
      `);
    }

    // 6. Remover coluna clienteCertidaoId (se existir)
    if (columns.clienteCertidaoId) {
      await queryInterface.removeColumn("Certidoes", "clienteCertidaoId");
    }

    // 7. Verificar se tabela ClientesCertidoes existe antes de dropar
    if (clientesCertidoesExiste) {
      // Remover constraint da tabela LogsCertidoes primeiro
      await queryInterface.sequelize.query(`
        ALTER TABLE "LogsCertidoes" DROP CONSTRAINT IF EXISTS "LogsCertidoes_clienteCertidaoId_fkey"
      `);
      
      // Dropar tabela ClientesCertidoes
      await queryInterface.dropTable("ClientesCertidoes");
    }
  },

  down: async (queryInterface: QueryInterface) => {
    // Recriar tabela ClientesCertidoes
    await queryInterface.createTable("ClientesCertidoes", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      nome: {
        type: DataTypes.STRING,
        allowNull: false
      },
      tipoCliente: {
        type: DataTypes.ENUM("fisica", "juridica"),
        allowNull: false,
        defaultValue: "fisica"
      },
      cpf: {
        type: DataTypes.STRING,
        allowNull: true
      },
      cnpj: {
        type: DataTypes.STRING,
        allowNull: true
      },
      razaoSocial: {
        type: DataTypes.STRING,
        allowNull: true
      },
      inscricaoEstadual: {
        type: DataTypes.STRING,
        allowNull: true
      },
      inscricaoMunicipal: {
        type: DataTypes.STRING,
        allowNull: true
      },
      cep: {
        type: DataTypes.STRING,
        allowNull: true
      },
      logradouro: {
        type: DataTypes.STRING,
        allowNull: true
      },
      numero: {
        type: DataTypes.STRING,
        allowNull: true
      },
      complemento: {
        type: DataTypes.STRING,
        allowNull: true
      },
      bairro: {
        type: DataTypes.STRING,
        allowNull: true
      },
      cidade: {
        type: DataTypes.STRING,
        allowNull: true
      },
      estado: {
        type: DataTypes.STRING,
        allowNull: true
      },
      telefone: {
        type: DataTypes.STRING,
        allowNull: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true
      },
      certidoesSelecionadas: {
        type: DataTypes.JSON,
        defaultValue: [],
        allowNull: false
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // Adicionar coluna clienteCertidaoId de volta
    await queryInterface.addColumn("Certidoes", "clienteCertidaoId", {
      type: DataTypes.INTEGER,
      references: { model: "ClientesCertidoes", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      allowNull: true
    });

    // Remover índice e coluna clienteId
    await queryInterface.removeIndex("Certidoes", "idx_certidoes_cliente_id");
    await queryInterface.removeColumn("Certidoes", "clienteId");
  }
};
