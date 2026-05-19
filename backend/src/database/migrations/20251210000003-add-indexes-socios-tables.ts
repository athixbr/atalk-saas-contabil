import __cjs_sequelize from "sequelize";
const { QueryInterface } = __cjs_sequelize;
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Índices para a tabela Socios
    await queryInterface.addIndex("Socios", ["companyId"], {
      name: "idx_socios_companyId"
    });
    
    await queryInterface.addIndex("Socios", ["cpf"], {
      name: "idx_socios_cpf"
    });
    
    await queryInterface.addIndex("Socios", ["companyId", "cpf"], {
      name: "idx_socios_company_cpf",
      unique: true // CPF único por company
    });
    
    await queryInterface.addIndex("Socios", ["ativo"], {
      name: "idx_socios_ativo"
    });
    
    // Índices para a tabela ClienteSocio
    await queryInterface.addIndex("ClienteSocio", ["clienteId"], {
      name: "idx_cliente_socio_clienteId"
    });
    
    await queryInterface.addIndex("ClienteSocio", ["socioId"], {
      name: "idx_cliente_socio_socioId"
    });
    
    await queryInterface.addIndex("ClienteSocio", ["clienteId", "socioId"], {
      name: "idx_cliente_socio_unique",
      unique: true // Um sócio não pode estar duplicado na mesma empresa
    });
    
    await queryInterface.addIndex("ClienteSocio", ["ativo"], {
      name: "idx_cliente_socio_ativo"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    // Remove índices da tabela Socios
    await queryInterface.removeIndex("Socios", "idx_socios_companyId");
    await queryInterface.removeIndex("Socios", "idx_socios_cpf");
    await queryInterface.removeIndex("Socios", "idx_socios_company_cpf");
    await queryInterface.removeIndex("Socios", "idx_socios_ativo");
    
    // Remove índices da tabela ClienteSocio
    await queryInterface.removeIndex("ClienteSocio", "idx_cliente_socio_clienteId");
    await queryInterface.removeIndex("ClienteSocio", "idx_cliente_socio_socioId");
    await queryInterface.removeIndex("ClienteSocio", "idx_cliente_socio_unique");
    await queryInterface.removeIndex("ClienteSocio", "idx_cliente_socio_ativo");
  }
};
