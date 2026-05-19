import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
import Announcement from "../../models/Announcement";
import Company from "../../models/Company";
import User from "../../models/User";
import Departamento from "../../models/Departamento";

interface QueryParams {
  userId: number;
  companyId: number;
}

const FindAdminNotificationsService = async (
  params: QueryParams
): Promise<Announcement[]> => {
  const { userId, companyId } = params;

  // Buscar usuário para saber seus departamentos
  let userDepartmentIds: number[] = [];
  try {
    const user = await User.findByPk(userId);
    if (user) {
      // Carregar departamentos do usuário
      // @ts-ignore
      await user.$get("departamentos");
      // @ts-ignore
      if (user.departamentos && user.departamentos.length > 0) {
        // @ts-ignore
        userDepartmentIds = user.departamentos.map((d: Departamento) => d.id);
      }
    }
  } catch (err) {
    console.error("Erro ao buscar departamentos do usuário:", err);
  }

  // Buscar notificações que:
  // 1. São do tipo "admin_notification"
  // 2. Têm o usuário em usuariosIds OU um de seus departamentos em departamentosIds
  // 3. Ainda não foram dismissidas pelo usuário
  // 4. Não expiraram (ou não têm expiração)
  // 5. Pertencem à empresa do usuário
  const now = new Date();

  const notifications = await Announcement.findAll({
    where: {
      companyId,
      tipo: "admin_notification",
      [Op.or]: [
        { usuariosIds: { [Op.contains]: [userId] } },
        { departamentosIds: { [Op.overlap]: userDepartmentIds } }
      ],
      [Op.or]: [
        { expiresAt: { [Op.is]: null } },
        { expiresAt: { [Op.gt]: now } }
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

  // Filtrar notificações que foram dismissidas pelo usuário
  const filteredNotifications = notifications.filter((notification) => {
    const dismissedByUsers = (notification as any).dismissedByUsers || [];
    const isDismissedByUser = dismissedByUsers.some(
      (item: any) => item.userId === userId
    );
    return !isDismissedByUser;
  });

  return filteredNotifications;
};

export default FindAdminNotificationsService;
