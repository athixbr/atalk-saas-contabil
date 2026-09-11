import DepartamentoUsuario from "../../models/DepartamentoUsuario";

const ResolveNotificationTargetUsersService = async (
  usuariosIds: number[] = [],
  departamentosIds: number[] = []
): Promise<number[]> => {
  const targetUserIds = new Set<number>(usuariosIds);

  if (departamentosIds.length > 0) {
    const departmentUsers = await DepartamentoUsuario.findAll({
      where: { departamentoId: departamentosIds }
    });
    departmentUsers.forEach(du => targetUserIds.add(du.userId));
  }

  return Array.from(targetUserIds);
};

export default ResolveNotificationTargetUsersService;
