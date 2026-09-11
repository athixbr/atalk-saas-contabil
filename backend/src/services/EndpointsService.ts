import __cjs_sequelize from "sequelize";
const { QueryTypes } = __cjs_sequelize;
import sequelize from "../database/index";

export type EndpointTipo = "controle" | "recorrente" | "tarefa" | "parcelamento";

export interface EndpointItem {
  tipo: EndpointTipo;
  endpointId: number;
  nome: string;
  codigo?: string;
  departamento?: string;
  descricao?: string;
  ativo?: boolean;
  recorrente?: boolean;
}

export const listarEndpointsDisponiveis = async (companyId: number): Promise<EndpointItem[]> => {
  const result = await sequelize.query(
    `
    SELECT
      'controle' AS tipo,
      cc.id AS "endpointId",
      cc.nome,
      cc.codigo,
      d.nome AS departamento,
      NULL::text AS descricao,
      cc.ativo,
      cc.recorrente
    FROM "ControlesConfig" cc
    LEFT JOIN "Departamentos" d ON d.id = cc."departamentoId"
    WHERE cc."companyId" = :companyId

    UNION ALL

    SELECT
      'recorrente' AS tipo,
      tr.id AS "endpointId",
      COALESCE(tr."nomeTarefa", tr."mininome", '') AS nome,
      tr.codigo,
      d.nome AS departamento,
      NULL::text AS descricao,
      TRUE AS ativo,
      TRUE AS recorrente
    FROM "TarefasRecorrentes" tr
    LEFT JOIN "Departamentos" d ON d.id = tr."departamentoId"
    WHERE tr."companyId" = :companyId

    UNION ALL

    SELECT
      'tarefa' AS tipo,
      tc.id AS "endpointId",
      tc.titulo AS nome,
      NULL::text AS codigo,
      d.nome AS departamento,
      tc.descricao,
      tc.ativo,
      FALSE AS recorrente
    FROM "TarefasConfig" tc
    LEFT JOIN "Departamentos" d ON d.id = tc."departamentoId"
    WHERE tc."companyId" = :companyId

    UNION ALL

    SELECT
      'parcelamento' AS tipo,
      p.id AS "endpointId",
      p.nome,
      NULL::text AS codigo,
      d.nome AS departamento,
      p.descricao,
      p.ativo,
      FALSE AS recorrente
    FROM "Parcelamentos" p
    LEFT JOIN "Departamentos" d ON d.id = p."departamentoId"
    WHERE p."companyId" = :companyId AND p."clienteId" IS NULL

    ORDER BY tipo, nome
    `,
    {
      replacements: { companyId },
      type: QueryTypes.SELECT,
    }
  );

  return result as EndpointItem[];
};

export const listarEndpointsModelo = async (modeloParametrosId: number): Promise<{ tipo: EndpointTipo; endpointId: number }[]> => {
  const result = await sequelize.query(
    `SELECT tipo, "endpointId" FROM "ModeloParametrosEndpoints" WHERE "modeloParametrosId" = :modeloParametrosId`,
    {
      replacements: { modeloParametrosId },
      type: QueryTypes.SELECT,
    }
  );
  return result as { tipo: EndpointTipo; endpointId: number }[];
};

export const salvarEndpointsModelo = async (
  modeloParametrosId: number,
  endpoints: { tipo: EndpointTipo; endpointId: number }[]
): Promise<void> => {
  await sequelize.query(
    `DELETE FROM "ModeloParametrosEndpoints" WHERE "modeloParametrosId" = :modeloParametrosId`,
    {
      replacements: { modeloParametrosId },
      type: QueryTypes.DELETE,
    }
  );

  if (endpoints.length === 0) return;

  const now = new Date().toISOString();
  const values = endpoints
    .map((e) => `(${modeloParametrosId}, '${e.tipo}', ${e.endpointId}, '${now}', '${now}')`)
    .join(", ");

  await sequelize.query(
    `INSERT INTO "ModeloParametrosEndpoints" ("modeloParametrosId", tipo, "endpointId", "createdAt", "updatedAt") VALUES ${values}`,
    { type: QueryTypes.INSERT }
  );
};

export const listarEndpointsCliente = async (
  clienteId: number,
  vigenciaId: number
): Promise<{ tipo: EndpointTipo; endpointId: number }[]> => {
  const result = await sequelize.query(
    `SELECT tipo, "endpointId" FROM "ClienteParametrosEndpoints" WHERE "clienteId" = :clienteId AND "vigenciaId" = :vigenciaId`,
    {
      replacements: { clienteId, vigenciaId },
      type: QueryTypes.SELECT,
    }
  );
  return result as { tipo: EndpointTipo; endpointId: number }[];
};

export const salvarEndpointsCliente = async (
  clienteId: number,
  vigenciaId: number,
  endpoints: { tipo: EndpointTipo; endpointId: number }[]
): Promise<void> => {
  await sequelize.query(
    `DELETE FROM "ClienteParametrosEndpoints" WHERE "clienteId" = :clienteId AND "vigenciaId" = :vigenciaId`,
    {
      replacements: { clienteId, vigenciaId },
      type: QueryTypes.DELETE,
    }
  );

  if (endpoints.length === 0) return;

  const now = new Date();
  await sequelize.getQueryInterface().bulkInsert(
    "ClienteParametrosEndpoints",
    endpoints.map((e) => ({
      clienteId,
      vigenciaId,
      tipo: e.tipo,
      endpointId: e.endpointId,
      createdAt: now,
      updatedAt: now,
    }))
  );
};
