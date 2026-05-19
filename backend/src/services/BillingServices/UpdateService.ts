import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Billing from "../../models/Billing";
import ShowService from "./ShowService";

interface BillingData {
  contactId?: number;
  clientName?: string;
  tradeName?: string;
  accountPayable?: number;
  accountReceivable?: number;
  balance?: number;
  totalAmount?: number;
  dueDate?: Date | string;
  nextContactDate?: Date | string;
  contractNumber?: string;
  paymentMethod?: string;
  status?: string;
  notes?: string;
}

interface Request {
  billingData: BillingData;
  id: string | number;
  companyId: number | string;
  updatedBy: number | string;
}

const UpdateService = async ({
  billingData,
  id,
  companyId,
  updatedBy
}: Request): Promise<Billing> => {
  const billing = await ShowService(id, companyId);

  if (!billing) {
    throw new AppError("ERR_NO_BILLING_FOUND", 404);
  }

  const schema = Yup.object().shape({
    clientName: Yup.string().min(3)
  });

  const {
    contactId,
    clientName,
    tradeName,
    accountPayable,
    accountReceivable,
    balance,
    totalAmount,
    dueDate,
    nextContactDate,
    contractNumber,
    paymentMethod,
    status,
    notes
  } = billingData;

  try {
    await schema.validate({ clientName });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  await billing.update({
    contactId,
    clientName,
    tradeName,
    accountPayable,
    accountReceivable,
    balance,
    totalAmount,
    dueDate,
    nextContactDate,
    contractNumber,
    paymentMethod,
    status,
    notes,
    updatedBy
  });

  await billing.reload({
    include: [
      { association: "contact" },
      { association: "creator" },
      { association: "updater" },
      { association: "history" },
      { association: "attachments" }
    ]
  });

  return billing;
};

export default UpdateService;
