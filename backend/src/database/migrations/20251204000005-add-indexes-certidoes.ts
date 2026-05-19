import __cjs_sequelize from "sequelize";
const { QueryInterface } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addIndex("ClientesCertidoes", ["companyId"], {
        name: "idx_clientes_certidoes_company"
      }),
      queryInterface.addIndex("ClientesCertidoes", ["cpf"], {
        name: "idx_clientes_certidoes_cpf"
      }),
      queryInterface.addIndex("ClientesCertidoes", ["cnpj"], {
        name: "idx_clientes_certidoes_cnpj"
      }),
      queryInterface.addIndex("ClientesCertidoes", ["ativo"], {
        name: "idx_clientes_certidoes_ativo"
      }),
      queryInterface.addIndex("AgendamentosCertidoes", ["companyId"], {
        name: "idx_agendamentos_certidoes_company"
      }),
      queryInterface.addIndex("AgendamentosCertidoes", ["data"], {
        name: "idx_agendamentos_certidoes_data"
      }),
      queryInterface.addIndex("AgendamentosCertidoes", ["status"], {
        name: "idx_agendamentos_certidoes_status"
      }),
      queryInterface.addIndex("CertificadosDigitais", ["companyId"], {
        name: "idx_certificados_digitais_company"
      }),
      queryInterface.addIndex("CertificadosDigitais", ["ativo"], {
        name: "idx_certificados_digitais_ativo"
      }),
      queryInterface.addIndex("CertificadosDigitais", ["validade"], {
        name: "idx_certificados_digitais_validade"
      }),
      queryInterface.addIndex("Certidoes", ["companyId"], {
        name: "idx_certidoes_company"
      }),
      queryInterface.addIndex("Certidoes", ["clienteCertidaoId"], {
        name: "idx_certidoes_cliente"
      }),
      queryInterface.addIndex("Certidoes", ["status"], {
        name: "idx_certidoes_status"
      }),
      queryInterface.addIndex("Certidoes", ["tipo"], {
        name: "idx_certidoes_tipo"
      }),
      queryInterface.addIndex("Certidoes", ["categoria"], {
        name: "idx_certidoes_categoria"
      }),
      queryInterface.addIndex("Certidoes", ["dataEmissao"], {
        name: "idx_certidoes_data_emissao"
      }),
      queryInterface.addIndex("Certidoes", ["agendamentoId"], {
        name: "idx_certidoes_agendamento"
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeIndex("ClientesCertidoes", "idx_clientes_certidoes_company"),
      queryInterface.removeIndex("ClientesCertidoes", "idx_clientes_certidoes_cpf"),
      queryInterface.removeIndex("ClientesCertidoes", "idx_clientes_certidoes_cnpj"),
      queryInterface.removeIndex("ClientesCertidoes", "idx_clientes_certidoes_ativo"),
      queryInterface.removeIndex("AgendamentosCertidoes", "idx_agendamentos_certidoes_company"),
      queryInterface.removeIndex("AgendamentosCertidoes", "idx_agendamentos_certidoes_data"),
      queryInterface.removeIndex("AgendamentosCertidoes", "idx_agendamentos_certidoes_status"),
      queryInterface.removeIndex("CertificadosDigitais", "idx_certificados_digitais_company"),
      queryInterface.removeIndex("CertificadosDigitais", "idx_certificados_digitais_ativo"),
      queryInterface.removeIndex("CertificadosDigitais", "idx_certificados_digitais_validade"),
      queryInterface.removeIndex("Certidoes", "idx_certidoes_company"),
      queryInterface.removeIndex("Certidoes", "idx_certidoes_cliente"),
      queryInterface.removeIndex("Certidoes", "idx_certidoes_status"),
      queryInterface.removeIndex("Certidoes", "idx_certidoes_tipo"),
      queryInterface.removeIndex("Certidoes", "idx_certidoes_categoria"),
      queryInterface.removeIndex("Certidoes", "idx_certidoes_data_emissao"),
      queryInterface.removeIndex("Certidoes", "idx_certidoes_agendamento")
    ]);
  }
};
