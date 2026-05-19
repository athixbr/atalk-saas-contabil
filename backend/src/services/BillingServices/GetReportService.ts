import __cjs_sequelize from "sequelize";
const { Op, fn, col } = __cjs_sequelize;
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import Billing from "../../models/Billing";
import BillingHistory from "../../models/BillingHistory";

interface Request {
  companyId: number | string;
  period: "daily" | "weekly" | "monthly";
  date?: Date;
}

interface Response {
  totalBillings: number;
  totalAmount: number;
  byStatus: any[];
  contactsCount: number;
  contacts: BillingHistory[];
}

const GetReportService = async ({
  companyId,
  period,
  date = new Date()
}: Request): Promise<Response> => {
  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case "daily":
      startDate = startOfDay(date);
      endDate = endOfDay(date);
      break;
    case "weekly":
      startDate = startOfWeek(date);
      endDate = endOfWeek(date);
      break;
    case "monthly":
      startDate = startOfMonth(date);
      endDate = endOfMonth(date);
      break;
    default:
      startDate = startOfDay(date);
      endDate = endOfDay(date);
  }

  // Total de cobranças
  const totalBillings = await Billing.count({
    where: { companyId }
  });

  // Soma total
  const billings = await Billing.findAll({
    where: { companyId },
    attributes: ["accountPayable", "totalAmount"]
  });

  const totalAmount = billings.reduce(
    (sum, b) => sum + (parseFloat(b.accountPayable?.toString() || "0") || 0),
    0
  );

  // Por status
  const byStatus = await Billing.findAll({
    where: { companyId },
    attributes: [
      "status",
      [fn("COUNT", col("id")), "count"],
      [fn("SUM", col("accountPayable")), "total"]
    ],
    group: ["status"],
    raw: true
  });

  // Contatos no período
  const contacts = await BillingHistory.findAll({
    where: {
      companyId,
      contactDate: {
        [Op.between]: [startDate, endDate] as any
      }
    },
    include: [
      { association: "user", attributes: ["id", "name"] },
      { association: "billing", attributes: ["id", "clientName"] }
    ],
    order: [["contactDate", "DESC"]]
  });

  return {
    totalBillings,
    totalAmount,
    byStatus,
    contactsCount: contacts.length,
    contacts
  };
};

export default GetReportService;
