import __cjs_sequelize from "sequelize";
const { Op, Sequelize } = __cjs_sequelize;
import Announcement from "../../models/Announcement";
import Company from "../../models/Company";
import User from "../../models/User";
import DepartamentoUsuario from "../../models/DepartamentoUsuario";

interface QueryParams {
  userId: number;
  companyId: number;
}

const FindAdminNotificationsService = async (
  params: QueryParams
): Promise<Announcement[]> => {
  const { userId, companyId } = params;

  // Buscar departamentos do usuário via tabela de relacionamento
  let userDepartmentIds: number[] = [];
  try {
    const userDepts = await DepartamentoUsuario.findAll({
      where: { userId },
      attributes: ["departamentoId"]
    });
    userDepartmentIds = userDepts.map(d => d.departamentoId);
  } catch (err) {
    console.error("Erro ao buscar departamentos do usuário:", err);
  }

  const now = new Date();
  const safeUserId = Number(userId);

  // usuariosIds e departamentosIds são integer[] no banco, usar operadores de array do PostgreSQL
  const userDeptConditions: any[] = [
    Sequelize.literal(
      `${safeUserId} = ANY("Announcement"."usuariosIds")`
    )
  ];

  if (userDepartmentIds.length > 0) {
    const safeDeptIds = userDepartmentIds.map(Number).filter(n => !isNaN(n)).join(",");
    userDeptConditions.push(
      Sequelize.literal(
        `"Announcement"."departamentosIds" && ARRAY[${safeDeptIds}]::integer[]`
      )
    );
  }

  const notifications = await Announcement.findAll({
    where: {
      companyId,
      tipo: "admin_notification",
      notifiedAt: { [Op.not]: null },
      [Op.and]: [
        { [Op.or]: userDeptConditions } as any,
        {
          [Op.or]: [
            { expiresAt: { [Op.is]: null } },
            { expiresAt: { [Op.gt]: now } }
          ]
        } as any
      ]
    },
    include: [
      {
        model: Company,
        as: "company",
        attributes: ["id", "name"]
      },
      {
        model: User,
        as: "createdByUser",
        attributes: ["id", "name"]
      }
    ],
    order: [["createdAt", "DESC"]]
  });

  // Filtrar notificações já dispensadas ou lidas pelo usuário
  return notifications.filter((notification) => {
    const dismissedByUsers = (notification as any).dismissedByUsers || [];
    const readByUsers = (notification as any).readByUsers || [];
    const dismissed = dismissedByUsers.some((item: any) => item.userId === userId);
    const read = readByUsers.some((item: any) => item.userId === userId);
    return !dismissed && !read;
  });
};

export default FindAdminNotificationsService;
