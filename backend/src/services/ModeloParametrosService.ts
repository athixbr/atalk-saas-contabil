import __cjs_sequelize from "sequelize";
const { QueryTypes } = __cjs_sequelize;
import sequelize from "../database/index";

interface ModeloParametrosData {
  nome?: string;
  descricao?: string;
  // Classificação
  statusClienteId?: number | null;
  statusComplementarId?: number | null;
  periodicidadeClienteId?: number | null;
  tipoClienteId?: number | null;
  tierClienteId?: number | null;
  clusterClienteId?: number | null;
  categoriaClienteId?: number | null;
  sedeClienteId?: number | null;
  localizacaoClienteId?: number | null;
  tagsId?: number | null;
  adiantamentoFolhaId?: number | null;
  distribuicaoLucrosId?: number | null;
  grupoClienteId?: number | null;
  segmentoId?: number | null;
  atuacaoId?: number | null;
  atuacaoIds?: number[] | null;
  // Enquadramento Tributário
  porteFederalId?: number | null;
  porteEstadualId?: number | null;
  porteMunicipalId?: number | null;
  regimeTributarioFederalId?: number | null;
  regimeTributarioEstadualId?: number | null;
  regimeTributarioMunicipalId?: number | null;
  // Enquadramento Operacional
  volumeFiscalId?: number | null;
  volumeContabilId?: number | null;
  volumeDPId?: number | null;
  volumeBPOId?: number | null;
  modalidadeFechamentoContabilId?: number | null;
  modalidadeFechamentoFiscalId?: number | null;
  modalidadeFechamentoDPId?: number | null;
  modalFechBPOId?: number | null;
}

export const listarModelos = async () => {
  const modelos = await sequelize.query(
    `SELECT * FROM modelos_parametros ORDER BY nome ASC`,
    { type: QueryTypes.SELECT }
  );
  return modelos;
};

export const buscarModelo = async (id: number) => {
  const [modelo] = await sequelize.query(
    `SELECT * FROM modelos_parametros WHERE id = :id`,
    {
      replacements: { id },
      type: QueryTypes.SELECT
    }
  );
  return modelo;
};

export const criarModelo = async (modeloData: ModeloParametrosData) => {
  const campos = [
    'nome', 'descricao',
    // Classificação
    'statusClienteId', 'statusComplementarId', 'periodicidadeClienteId',
    'tipoClienteId', 'tierClienteId', 'clusterClienteId',
    'categoriaClienteId', 'sedeClienteId', 'localizacaoClienteId',
    'tagsId', 'adiantamentoFolhaId', 'distribuicaoLucrosId',
    'grupoClienteId', 'segmentoId', 'atuacaoId', 'atuacaoIds',
    // Enquadramento Tributário
    'porteFederalId', 'porteEstadualId', 'porteMunicipalId',
    'regimeTributarioFederalId', 'regimeTributarioEstadualId', 'regimeTributarioMunicipalId',
    // Enquadramento Operacional
    'volumeFiscalId', 'volumeContabilId', 'volumeDPId', 'volumeBPOId',
    'modalidadeFechamentoContabilId', 'modalidadeFechamentoFiscalId',
    'modalidadeFechamentoDPId', 'modalFechBPOId'
  ];

  const camposPresentes = campos.filter(campo => modeloData[campo as keyof ModeloParametrosData] !== undefined);
  const valores = camposPresentes.map(campo => modeloData[campo as keyof ModeloParametrosData] || null);
  
  // Adicionar aspas duplas nos nomes das colunas para PostgreSQL
  const camposComAspas = camposPresentes.map(campo => `"${campo}"`).join(', ');
  // PostgreSQL usa $1, $2, $3... para placeholders
  const placeholders = camposPresentes.map((_, index) => `$${index + 1}`).join(', ');

  const [result]: any = await sequelize.query(
    `INSERT INTO modelos_parametros (${camposComAspas}) VALUES (${placeholders}) RETURNING id`,
    {
      bind: valores,
      type: QueryTypes.INSERT
    }
  );

  // result é um array com o objeto inserido que contém o id
  const insertedId = result[0]?.id || result?.id;
  return buscarModelo(insertedId);
};

export const atualizarModelo = async (id: number, modeloData: ModeloParametrosData) => {
  const campos = [
    'nome', 'descricao',
    // Classificação
    'statusClienteId', 'statusComplementarId', 'periodicidadeClienteId',
    'tipoClienteId', 'tierClienteId', 'clusterClienteId',
    'categoriaClienteId', 'sedeClienteId', 'localizacaoClienteId',
    'tagsId', 'adiantamentoFolhaId', 'distribuicaoLucrosId',
    'grupoClienteId', 'segmentoId', 'atuacaoId', 'atuacaoIds',
    // Enquadramento Tributário
    'porteFederalId', 'porteEstadualId', 'porteMunicipalId',
    'regimeTributarioFederalId', 'regimeTributarioEstadualId', 'regimeTributarioMunicipalId',
    // Enquadramento Operacional
    'volumeFiscalId', 'volumeContabilId', 'volumeDPId', 'volumeBPOId',
    'modalidadeFechamentoContabilId', 'modalidadeFechamentoFiscalId',
    'modalidadeFechamentoDPId', 'modalFechBPOId'
  ];

  const camposPresentes = campos.filter(campo => modeloData[campo as keyof ModeloParametrosData] !== undefined);
  // Adicionar aspas duplas nos nomes das colunas para PostgreSQL e usar $1, $2...
  const updates = camposPresentes.map((campo, index) => `"${campo}" = $${index + 1}`).join(', ');
  const valores = [...camposPresentes.map(campo => modeloData[campo as keyof ModeloParametrosData] || null), id];

  await sequelize.query(
    `UPDATE modelos_parametros SET ${updates} WHERE id = $${camposPresentes.length + 1}`,
    {
      bind: valores,
      type: QueryTypes.UPDATE
    }
  );

  return buscarModelo(id);
};

export const deletarModelo = async (id: number) => {
  await sequelize.query(
    `DELETE FROM modelos_parametros WHERE id = :id`,
    {
      replacements: { id },
      type: QueryTypes.DELETE
    }
  );
};
