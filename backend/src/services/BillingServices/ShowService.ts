import Billing from "../../models/Billing";
import Contact from "../../models/Contact";
import User from "../../models/User";
import BillingHistory from "../../models/BillingHistory";
import BillingAttachment from "../../models/BillingAttachment";
import AppError from "../../errors/AppError";

const ShowService = async (
  id: string | number,
  companyId: number | string
): Promise<Billing> => {
  const billing = await Billing.findOne({
    where: {
      id,
      companyId
    },
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number", "email"]
      },
      {
        model: User,
        as: "creator",
        attributes: ["id", "name"]
      },
      {
        model: User,
        as: "updater",
        attributes: ["id", "name"]
      },
      {
        model: BillingHistory,
        as: "history",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name"]
          }
        ],
        order: [["contactDate", "DESC"]]
      },
      {
        model: BillingAttachment,
        as: "attachments",
        include: [
          {
            model: User,
            as: "uploader",
            attributes: ["id", "name"]
          }
        ]
      }
    ],
    order: [
      [{ model: BillingHistory, as: "history" }, "contactDate", "DESC"]
    ]
  });

  if (!billing) {
    throw new AppError("ERR_NO_BILLING_FOUND", 404);
  }

  return billing;
};

export default ShowService;
