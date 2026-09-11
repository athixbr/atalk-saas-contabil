import User from "../../models/User";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import Company from "../../models/Company";
import Plan from "../../models/Plan";
import Departamento from "../../models/Departamento";

const ShowUserService = async (id: string | number): Promise<User> => {
  const user = await User.findByPk(id, {
    include: [
      { model: Queue, as: "queues", attributes: ["id", "name", "color"] },
      {
        model: Departamento,
        as: "departamentos",
        attributes: ["id", "nome"],
        through: { attributes: ["isCoordenador"] }
      },
      {
        model: Company,
        as: "company",
        attributes: ["id", "name", "dueDate", "document"],
        include: [
          {
            model: Plan, as: "plan",
            attributes: ["id",
              "name",
              "amount",
              "useWhatsapp",
              "useFacebook",
              "useInstagram",
              "useCampaigns",
              "useSchedules",
              "useInternalChat",
              "useExternalApi"]
          },
        ]
      },
    ]
  });

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  return user;
};

export default ShowUserService;
