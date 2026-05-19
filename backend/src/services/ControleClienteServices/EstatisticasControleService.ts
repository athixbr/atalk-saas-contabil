import __cjs_sequelize from "sequelize";
const { Op, fn, col, literal } = __cjs_sequelize;
import ControleCliente from "../../models/ControleCliente";
import ControleConfig from "../../models/ControleConfig";
import sequelize from "../../database/index";

interface EstatisticasData {
  companyId: number;
  controleConfigId?: number;
  departamentoId?: number;
}

interface Estatisticas {
  totalVinculos: number;
  vinculosAtivos: number;
  vinculosInativos: number;
  totalClientes: number;
  totalControles: number;
  controlesSemCliente: number;
  controlesComCliente: number;
  vinculosPorControle: Array<{
    controleId: number;
    controleNome: string;
    totalVinculos: number;
    vinculosAtivos: number;
  }>;
  vinculosPorDepartamento: Array<{
    departamentoId: number;
    departamentoNome: string;
    totalVinculos: number;
  }>;
  proximosVencimentos: Array<{
    controleClienteId: number;
    controleNome: string;
    clienteNome: string;
    dataFim: Date;
    diasRestantes: number;
  }>;
}

const EstatisticasControleService = async ({
  companyId,
  controleConfigId,
  departamentoId,
}: EstatisticasData): Promise<Estatisticas> => {
  // Filtros base
  const whereVinculo: any = {};
  const whereConfig: any = { companyId };

  if (controleConfigId) {
    whereVinculo.controleConfigId = controleConfigId;
  }

  if (departamentoId) {
    whereVinculo.departamentoId = departamentoId;
  }

  // Total de vínculos
  const totalVinculos = await ControleCliente.count({
    where: whereVinculo,
    include: [
      {
        model: ControleConfig,
        as: "controleConfig",
        where: whereConfig,
      },
    ],
  });

  // Vínculos ativos/inativos
  const vinculosAtivos = await ControleCliente.count({
    where: { ...whereVinculo, ativo: true },
    include: [
      {
        model: ControleConfig,
        as: "controleConfig",
        where: whereConfig,
      },
    ],
  });

  const vinculosInativos = totalVinculos - vinculosAtivos;

  // Total de clientes únicos
  const totalClientes = await ControleCliente.count({
    where: whereVinculo,
    distinct: true,
    col: "clienteId",
    include: [
      {
        model: ControleConfig,
        as: "controleConfig",
        where: whereConfig,
      },
    ],
  });

  // Total de controles
  const totalControles = await ControleConfig.count({
    where: whereConfig,
  });

  // Controles sem cliente (não vinculados)
  const controlesComCliente = await ControleConfig.count({
    where: whereConfig,
    include: [
      {
        model: ControleCliente,
        as: "controleClientes",
        where: { ativo: true },
        required: true,
      },
    ],
    distinct: true,
  });

  const controlesSemCliente = totalControles - controlesComCliente;

  // Vínculos por controle
  const vinculosPorControle = await ControleCliente.findAll({
    attributes: [
      "controleConfigId",
      [fn("COUNT", col("ControleCliente.id")), "totalVinculos"],
      [
        fn(
          "COUNT",
          literal('CASE WHEN "ControleCliente"."ativo" = true THEN 1 END')
        ),
        "vinculosAtivos",
      ],
    ],
    where: whereVinculo,
    include: [
      {
        model: ControleConfig,
        as: "controleConfig",
        where: whereConfig,
        attributes: ["id", "nome"],
      },
    ],
    group: ["ControleCliente.controleConfigId", "controleConfig.id", "controleConfig.nome"],
    raw: true,
  });

  // Vínculos por departamento
  const vinculosPorDepartamento = await sequelize.query(
    `
    SELECT 
      cc."departamentoId" as "departamentoId",
      d."nome" as "departamentoNome",
      COUNT(cc.id) as "totalVinculos"
    FROM "ControleClientes" cc
    INNER JOIN "ControlesConfig" cfg ON cfg.id = cc."controleConfigId"
    LEFT JOIN "Departamentos" d ON d.id = cc."departamentoId"
    WHERE cfg."companyId" = :companyId
      AND cc."departamentoId" IS NOT NULL
      ${controleConfigId ? 'AND cc."controleConfigId" = :controleConfigId' : ""}
    GROUP BY cc."departamentoId", d."nome"
    ORDER BY "totalVinculos" DESC
    `,
    {
      replacements: { companyId, controleConfigId },
      type: "SELECT",
    }
  );

  // Próximos vencimentos (próximos 30 dias)
  const dataAtual = new Date();
  const data30Dias = new Date();
  data30Dias.setDate(data30Dias.getDate() + 30);

  const proximosVencimentos = await sequelize.query(
    `
    SELECT 
      cc.id as "controleClienteId",
      cfg."nome" as "controleNome",
      c."nome" as "clienteNome",
      cc."dataFim",
      DATE_PART('day', cc."dataFim" - CURRENT_DATE) as "diasRestantes"
    FROM "ControleClientes" cc
    INNER JOIN "ControlesConfig" cfg ON cfg.id = cc."controleConfigId"
    INNER JOIN "Clientes" c ON c.id = cc."clienteId"
    WHERE cfg."companyId" = :companyId
      AND cc."ativo" = true
      AND cc."dataFim" IS NOT NULL
      AND cc."dataFim" BETWEEN :dataAtual AND :data30Dias
      ${controleConfigId ? 'AND cc."controleConfigId" = :controleConfigId' : ""}
      ${departamentoId ? 'AND cc."departamentoId" = :departamentoId' : ""}
    ORDER BY cc."dataFim" ASC
    LIMIT 10
    `,
    {
      replacements: {
        companyId,
        controleConfigId,
        departamentoId,
        dataAtual: dataAtual.toISOString().split("T")[0],
        data30Dias: data30Dias.toISOString().split("T")[0],
      },
      type: "SELECT",
    }
  );

  return {
    totalVinculos,
    vinculosAtivos,
    vinculosInativos,
    totalClientes,
    totalControles,
    controlesSemCliente,
    controlesComCliente,
    vinculosPorControle: vinculosPorControle.map((v: any) => ({
      controleId: v.controleConfigId,
      controleNome: v["controleConfig.nome"],
      totalVinculos: parseInt(v.totalVinculos),
      vinculosAtivos: parseInt(v.vinculosAtivos),
    })),
    vinculosPorDepartamento: (vinculosPorDepartamento as any[]).map((v: any) => ({
      departamentoId: v.departamentoId,
      departamentoNome: v.departamentoNome || "Sem departamento",
      totalVinculos: parseInt(v.totalVinculos),
    })),
    proximosVencimentos: (proximosVencimentos as any[]).map((v: any) => ({
      controleClienteId: v.controleClienteId,
      controleNome: v.controleNome,
      clienteNome: v.clienteNome,
      dataFim: v.dataFim,
      diasRestantes: parseInt(v.diasRestantes),
    })),
  };
};

export default EstatisticasControleService;
