import BillingHistory from "../../models/BillingHistory";
import User from "../../models/User";
import Billing from "../../models/Billing";

interface Request {
  billingId: number | string;
  companyId: number | string;
}

const GetHistoryService = async ({
  billingId,
  companyId
}: Request): Promise<BillingHistory[]> => {
  const history = await BillingHistory.findAll({
    where: {
      billingId,
      companyId
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name"]
      },
      {
        model: Billing,
        as: "billing",
        attributes: ["id", "clientName", "status"]
      }
    ],
    order: [["contactDate", "DESC"]]
  });

  return history;
};

export default GetHistoryService;
