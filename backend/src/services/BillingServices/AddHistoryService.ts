import * as Yup from "yup";
import AppError from "../../errors/AppError";
import BillingHistory from "../../models/BillingHistory";
import Billing from "../../models/Billing";

interface Request {
  billingId: number | string;
  companyId: number | string;
  contactDate: Date | string;
  contactType?: string;
  description: string;
  previousStatus?: string;
  newStatus: string;
  amountPaid?: number;
  userId: number | string;
}

const AddHistoryService = async ({
  billingId,
  companyId,
  contactDate,
  contactType,
  description,
  previousStatus,
  newStatus,
  amountPaid,
  userId
}: Request): Promise<BillingHistory> => {
  const schema = Yup.object().shape({
    description: Yup.string().required("Descrição é obrigatória").min(3)
  });

  try {
    await schema.validate({ description });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  // Verificar se a cobrança existe
  const billing = await Billing.findOne({
    where: { id: billingId, companyId }
  });

  if (!billing) {
    throw new AppError("ERR_NO_BILLING_FOUND", 404);
  }

  // Atualizar status da cobrança se mudou
  if (newStatus && billing.status !== newStatus) {
    await billing.update({ status: newStatus, updatedBy: userId });
  }

  // Criar histórico
  const history = await BillingHistory.create({
    billingId,
    companyId,
    contactDate: contactDate || new Date(),
    contactType,
    description,
    previousStatus: previousStatus || billing.status,
    newStatus,
    amountPaid,
    userId
  });

  await history.reload({
    include: [
      { association: "user" },
      { association: "billing" }
    ]
  });

  return history;
};

export default AddHistoryService;
