import __cjs_sequelize from "sequelize";
const { QueryInterface } = __cjs_sequelize;
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert(
      "TemplatesLeitura",
      [
        // ========== GUIA FGTS ==========
        {
          nome: "Guia FGTS",
          descricao: "Guia de recolhimento do FGTS - Fundo de Garantia do Tempo de Serviço",
          tipo: "guia_fgts",
          ativo: true,
          companyId: 1, // Será substituído pela empresa real
          campos: JSON.stringify([
            {
              nome: "empresa",
              tipo: "text",
              regex: "(?:Empresa|Raz[aã]o Social|Empregador)[:\\s]+([A-Za-z0-9\\s\\.\\-&]+?)(?:\\n|CNPJ)",
              obrigatorio: true,
              descricao: "Nome da empresa/empregador"
            },
            {
              nome: "cnpj",
              tipo: "cnpj",
              regex: "CNPJ[:\\s]+([\\d./-]+)",
              obrigatorio: true,
              descricao: "CNPJ da empresa"
            },
            {
              nome: "competencia",
              tipo: "text",
              regex: "Compet[êe]ncia[:\\s]+(\\d{2}/\\d{4})",
              obrigatorio: true,
              descricao: "Mês/Ano de competência"
            },
            {
              nome: "valor",
              tipo: "currency",
              regex: "(?:Valor Total|Valor[:\\s]+)[R$\\s]*([\\d.,]+)",
              obrigatorio: true,
              descricao: "Valor total a recolher"
            },
            {
              nome: "vencimento",
              tipo: "date",
              regex: "(?:Vencimento|Data de Vencimento)[:\\s]+(\\d{2}[/-]\\d{2}[/-]\\d{4})",
              obrigatorio: true,
              descricao: "Data de vencimento"
            },
            {
              nome: "codigo_barras",
              tipo: "barcode",
              regex: "(?:C[óo]digo de Barras|Linha Digit[áa]vel)[:\\s]+([\\d\\s]+)",
              obrigatorio: false,
              descricao: "Código de barras para pagamento"
            }
          ]),
          validacoes: JSON.stringify({
            valor_minimo: 0.01,
            data_futura: true
          }),
          exemplos: JSON.stringify({
            exemplo1: "Guia FGTS 01/2026 - Empresa XYZ - R$ 5.234,50"
          }),
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // ========== GPS (INSS) ==========
        {
          nome: "GPS - Guia da Previdência Social (INSS)",
          descricao: "Guia de Previdência Social para recolhimento do INSS",
          tipo: "guia_inss",
          ativo: true,
          companyId: 1,
          campos: JSON.stringify([
            {
              nome: "contribuinte",
              tipo: "text",
              regex: "(?:Nome|Raz[aã]o Social|Contribuinte)[:\\s]+([A-Za-z\\s]+?)(?:\\n|CPF|CNPJ)",
              obrigatorio: true,
              descricao: "Nome do contribuinte"
            },
            {
              nome: "cpf_cnpj",
              tipo: "text",
              regex: "(?:CPF|CNPJ)[:\\s]+([\\d./-]+)",
              obrigatorio: true,
              descricao: "CPF ou CNPJ do contribuinte"
            },
            {
              nome: "codigo_pagamento",
              tipo: "text",
              regex: "(?:C[óo]digo de Pagamento)[:\\s]+(\\d{4})",
              obrigatorio: true,
              descricao: "Código de pagamento (4 dígitos)"
            },
            {
              nome: "competencia",
              tipo: "text",
              regex: "Compet[êe]ncia[:\\s]+(\\d{2}/\\d{4})",
              obrigatorio: true,
              descricao: "Mês/Ano de competência"
            },
            {
              nome: "valor_inss",
              tipo: "currency",
              regex: "(?:Valor INSS|Valor)[:\\s]+R?\\$?\\s*([\\d.,]+)",
              obrigatorio: true,
              descricao: "Valor do INSS"
            },
            {
              nome: "vencimento",
              tipo: "date",
              regex: "(?:Vencimento)[:\\s]+(\\d{2}[/-]\\d{2}[/-]\\d{4})",
              obrigatorio: true,
              descricao: "Data de vencimento"
            }
          ]),
          validacoes: JSON.stringify({}),
          exemplos: JSON.stringify({}),
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // ========== DARF ==========
        {
          nome: "DARF - Documento de Arrecadação",
          descricao: "Documento de Arrecadação de Receitas Federais (Impostos)",
          tipo: "darf",
          ativo: true,
          companyId: 1,
          campos: JSON.stringify([
            {
              nome: "contribuinte",
              tipo: "text",
              regex: "(?:Nome|Contribuinte)[:\\s]+([A-Za-z0-9\\s\\.\\-&]+?)(?:\\n|CPF|CNPJ)",
              obrigatorio: true,
              descricao: "Nome do contribuinte"
            },
            {
              nome: "cpf_cnpj",
              tipo: "text",
              regex: "(?:CPF|CNPJ)[:\\s]+([\\d./-]+)",
              obrigatorio: true,
              descricao: "CPF ou CNPJ"
            },
            {
              nome: "codigo_receita",
              tipo: "text",
              regex: "(?:C[óo]digo da Receita|Receita)[:\\s]+(\\d{4})",
              obrigatorio: true,
              descricao: "Código da receita (4 dígitos)"
            },
            {
              nome: "periodo_apuracao",
              tipo: "text",
              regex: "(?:Per[íi]odo de Apura[çc][ãa]o|Compet[êe]ncia)[:\\s]+(\\d{2}/\\d{2}/\\d{4})",
              obrigatorio: true,
              descricao: "Período de apuração"
            },
            {
              nome: "valor_principal",
              tipo: "currency",
              regex: "(?:Valor Principal|Valor do Principal)[:\\s]+R?\\$?\\s*([\\d.,]+)",
              obrigatorio: true,
              descricao: "Valor principal"
            },
            {
              nome: "multa",
              tipo: "currency",
              regex: "(?:Multa)[:\\s]+R?\\$?\\s*([\\d.,]+)",
              obrigatorio: false,
              descricao: "Valor da multa"
            },
            {
              nome: "juros",
              tipo: "currency",
              regex: "(?:Juros)[:\\s]+R?\\$?\\s*([\\d.,]+)",
              obrigatorio: false,
              descricao: "Valor dos juros"
            },
            {
              nome: "valor_total",
              tipo: "currency",
              regex: "(?:Valor Total|Total)[:\\s]+R?\\$?\\s*([\\d.,]+)",
              obrigatorio: true,
              descricao: "Valor total a pagar"
            },
            {
              nome: "vencimento",
              tipo: "date",
              regex: "(?:Vencimento|Data de Vencimento)[:\\s]+(\\d{2}[/-]\\d{2}[/-]\\d{4})",
              obrigatorio: true,
              descricao: "Data de vencimento"
            }
          ]),
          validacoes: JSON.stringify({}),
          exemplos: JSON.stringify({}),
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // ========== CERTIDÃO NEGATIVA ==========
        {
          nome: "Certidão Negativa",
          descricao: "Certidão Negativa de Débitos (Federal, Estadual, Municipal)",
          tipo: "certidao_negativa",
          ativo: true,
          companyId: 1,
          campos: JSON.stringify([
            {
              nome: "tipo_certidao",
              tipo: "text",
              regex: "(?:Certid[ãa]o|CERTID[ÃA]O)[\\s]+(?:Negativa|NEGATIVA)[\\s]+(?:de|DE)?[\\s]*(.*?)(?:\\n|N[úu]mero)",
              obrigatorio: true,
              descricao: "Tipo da certidão (Federal, Estadual, Municipal, Trabalhista)"
            },
            {
              nome: "nome_contribuinte",
              tipo: "text",
              regex: "(?:Nome|Raz[aã]o Social)[:\\s]+([A-Za-z0-9\\s\\.\\-&]+?)(?:\\n|CPF|CNPJ)",
              obrigatorio: true,
              descricao: "Nome do contribuinte"
            },
            {
              nome: "cpf_cnpj",
              tipo: "text",
              regex: "(?:CPF|CNPJ)[:\\s]+([\\d./-]+)",
              obrigatorio: true,
              descricao: "CPF ou CNPJ"
            },
            {
              nome: "numero_certidao",
              tipo: "text",
              regex: "(?:N[úu]mero|C[óo]digo)[:\\s]+([A-Z0-9./-]+)",
              obrigatorio: true,
              descricao: "Número da certidão"
            },
            {
              nome: "data_emissao",
              tipo: "date",
              regex: "(?:Emiss[ãa]o|Data)[:\\s]+(\\d{2}[/-]\\d{2}[/-]\\d{4})",
              obrigatorio: true,
              descricao: "Data de emissão"
            },
            {
              nome: "data_validade",
              tipo: "date",
              regex: "(?:Validade|V[áa]lida at[ée])[:\\s]+(\\d{2}[/-]\\d{2}[/-]\\d{4})",
              obrigatorio: true,
              descricao: "Data de validade"
            }
          ]),
          validacoes: JSON.stringify({}),
          exemplos: JSON.stringify({}),
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // ========== BOLETO BANCÁRIO ==========
        {
          nome: "Boleto Bancário",
          descricao: "Boleto bancário genérico",
          tipo: "boleto",
          ativo: true,
          companyId: 1,
          campos: JSON.stringify([
            {
              nome: "beneficiario",
              tipo: "text",
              regex: "(?:Benefici[áa]rio|Cedente)[:\\s]+([A-Za-z0-9\\s\\.\\-&]+?)(?:\\n|CNPJ)",
              obrigatorio: true,
              descricao: "Beneficiário/Cedente"
            },
            {
              nome: "pagador",
              tipo: "text",
              regex: "(?:Pagador|Sacado)[:\\s]+([A-Za-z0-9\\s\\.\\-&]+?)(?:\\n|CPF|CNPJ)",
              obrigatorio: false,
              descricao: "Pagador/Sacado"
            },
            {
              nome: "nosso_numero",
              tipo: "text",
              regex: "(?:Nosso N[úu]mero)[:\\s]+([\\d/-]+)",
              obrigatorio: false,
              descricao: "Nosso número"
            },
            {
              nome: "valor_documento",
              tipo: "currency",
              regex: "(?:Valor do Documento|Valor)[:\\s]+R?\\$?\\s*([\\d.,]+)",
              obrigatorio: true,
              descricao: "Valor do documento"
            },
            {
              nome: "vencimento",
              tipo: "date",
              regex: "(?:Vencimento|Data de Vencimento)[:\\s]+(\\d{2}[/-]\\d{2}[/-]\\d{4})",
              obrigatorio: true,
              descricao: "Data de vencimento"
            },
            {
              nome: "codigo_barras",
              tipo: "barcode",
              regex: "([\\d]{47,48})",
              obrigatorio: false,
              descricao: "Código de barras (47-48 dígitos)"
            },
            {
              nome: "linha_digitavel",
              tipo: "text",
              regex: "([\\d]{5}\\.[\\d]{5}\\s[\\d]{5}\\.[\\d]{6}\\s[\\d]{5}\\.[\\d]{6}\\s[\\d]\\s[\\d]{14})",
              obrigatorio: false,
              descricao: "Linha digitável"
            }
          ]),
          validacoes: JSON.stringify({}),
          exemplos: JSON.stringify({}),
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // ========== NOTA FISCAL ELETRÔNICA (NFe) ==========
        {
          nome: "Nota Fiscal Eletrônica (NFe)",
          descricao: "Nota Fiscal Eletrônica - DANFE",
          tipo: "nfe",
          ativo: true,
          companyId: 1,
          campos: JSON.stringify([
            {
              nome: "numero_nf",
              tipo: "text",
              regex: "(?:N[úu]mero|NF-e)[:\\s]+(\\d+)",
              obrigatorio: true,
              descricao: "Número da nota fiscal"
            },
            {
              nome: "serie",
              tipo: "text",
              regex: "(?:S[ée]rie)[:\\s]+(\\d+)",
              obrigatorio: false,
              descricao: "Série da nota"
            },
            {
              nome: "emitente",
              tipo: "text",
              regex: "(?:Emitente|Raz[aã]o Social do Emitente)[:\\s]+([A-Za-z0-9\\s\\.\\-&]+?)(?:\\n|CNPJ)",
              obrigatorio: true,
              descricao: "Razão social do emitente"
            },
            {
              nome: "cnpj_emitente",
              tipo: "cnpj",
              regex: "CNPJ[\\s]*(?:Emitente)?[:\\s]+([\\d./-]+)",
              obrigatorio: true,
              descricao: "CNPJ do emitente"
            },
            {
              nome: "destinatario",
              tipo: "text",
              regex: "(?:Destinat[áa]rio|Raz[aã]o Social do Destinat[áa]rio)[:\\s]+([A-Za-z0-9\\s\\.\\-&]+?)(?:\\n|CNPJ|CPF)",
              obrigatorio: false,
              descricao: "Razão social do destinatário"
            },
            {
              nome: "valor_total",
              tipo: "currency",
              regex: "(?:Valor Total|Total da Nota)[:\\s]+R?\\$?\\s*([\\d.,]+)",
              obrigatorio: true,
              descricao: "Valor total da nota"
            },
            {
              nome: "data_emissao",
              tipo: "date",
              regex: "(?:Data de Emiss[aã]o|Emiss[aã]o)[:\\s]+(\\d{2}[/-]\\d{2}[/-]\\d{4})",
              obrigatorio: true,
              descricao: "Data de emissão"
            },
            {
              nome: "chave_acesso",
              tipo: "text",
              regex: "(?:Chave de Acesso)[:\\s]+([\\d\\s]+)",
              obrigatorio: false,
              descricao: "Chave de acesso da NFe"
            }
          ]),
          validacoes: JSON.stringify({}),
          exemplos: JSON.stringify({}),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("TemplatesLeitura", {}, {});
  }
};
