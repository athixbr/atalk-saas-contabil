import User from "../../models/User";

interface Request {
  companyId: number;
}

interface Response {
  users: Array<{
    id: number;
    name: string;
    email: string;
  }>;
}

const ListUsersForDepartamentoService = async ({
  companyId,
}: Request): Promise<Response> => {
  const users = await User.findAll({
    where: { companyId },
    attributes: ["id", "name", "email"],
    order: [["name", "ASC"]],
  });

  return {
    users,
  };
};

export default ListUsersForDepartamentoService;
