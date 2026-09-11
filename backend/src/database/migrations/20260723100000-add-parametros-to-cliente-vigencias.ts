import __cjs_sequelize from "sequelize";
const { QueryInterface, DataTypes } = __cjs_sequelize;

const PARAMETRO_COLUMNS = [
  // Classificação
  "statusClienteId",
  "statusComplementarId",
  "periodicidadeClienteId",
  "tipoClienteId",
  "tierClienteId",
  "clusterClienteId",
  "categoriaClienteId",
  "sedeClienteId",
  "localizacaoClienteId",
  "tagsId",
  "adiantamentoFolhaId",
  "distribuicaoLucrosId",
  // Enquadramento Tributário
  "porteFederalId",
  "porteEstadualId",
  "porteMunicipalId",
  "regimeTributarioFederalId",
  "regimeTributarioEstadualId",
  "regimeTributarioMunicipalId",
  // Enquadramento Operacional
  "volumeFiscalId",
  "volumeContabilId",
  "volumeDPId",
  "volumeBPOId",
  "modalidadeFechamentoContabilId",
  "modalidadeFechamentoFiscalId",
  "modalidadeFechamentoDPId",
  "modalFechBPOId",
];

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    for (const column of PARAMETRO_COLUMNS) {
      await queryInterface.addColumn("ClienteVigencias", column, {
        type: DataTypes.INTEGER,
        allowNull: true,
      });
    }

    const columnsSql = PARAMETRO_COLUMNS.map(c => `"${c}"`).join(", ");
    const setSql = PARAMETRO_COLUMNS.map(c => `"${c}" = c."${c}"`).join(", ");
    const selectSql = PARAMETRO_COLUMNS.map(c => `c."${c}"`).join(", ");

    // Copia os valores atuais do cliente para a vigência ativa já existente
    await queryInterface.sequelize.query(`
      UPDATE "ClienteVigencias" cv
      SET ${setSql}
      FROM "Clientes" c
      WHERE cv."clienteId" = c.id AND cv."dataFinal" IS NULL
    `);

    // Cria uma vigência ativa para clientes que ainda não têm uma,
    // carregando os valores atuais para não perder nada na migração
    await queryInterface.sequelize.query(`
      INSERT INTO "ClienteVigencias" ("clienteId", "dataInicial", "dataFinal", "observacao", ${columnsSql}, "createdAt", "updatedAt")
      SELECT c.id, COALESCE(c."dataInicioContrato", c."createdAt"::date, CURRENT_DATE), NULL,
             'Vigência criada automaticamente na migração de parâmetros',
             ${selectSql}, NOW(), NOW()
      FROM "Clientes" c
      WHERE NOT EXISTS (
        SELECT 1 FROM "ClienteVigencias" cv WHERE cv."clienteId" = c.id AND cv."dataFinal" IS NULL
      )
    `);
  },

  down: async (queryInterface: QueryInterface) => {
    for (const column of PARAMETRO_COLUMNS) {
      await queryInterface.removeColumn("ClienteVigencias", column);
    }
  },
};
