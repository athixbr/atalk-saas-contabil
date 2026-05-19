import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Billing from "../../models/Billing";
import BillingHistory from "../../models/BillingHistory";

interface Request {
  companyId: number | string;
  contactId?: number | string;
  clientName: string;
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
  createdBy: number | string;
}

const CreateService = async ({
  companyId,
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
  createdBy
}: Request): Promise<Billing> => {
  const schema = Yup.object().shape({
    clientName: Yup.string().required("Nome do cliente é obrigatório").min(3)
  });

  try {
    await schema.validate({ clientName });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const billing = await Billing.create({
    companyId,
    contactId: contactId || null,
    clientName,
    tradeName,
    accountPayable: accountPayable || 0,
    accountReceivable: accountReceivable || 0,
    balance: balance || 0,
    totalAmount: totalAmount || 0,
    dueDate: dueDate || null,
    nextContactDate: nextContactDate || null,
    contractNumber,
    paymentMethod,
    status: status || "pendente",
    notes,
    createdBy,
    updatedBy: createdBy
  });

  await billing.reload({
    include: [
      { association: "contact" },
      { association: "creator" },
      { association: "company" }
    ]
  });

  // Registrar no histórico
  await BillingHistory.create({
    billingId: billing.id,
    companyId,
    contactDate: new Date(),
    contactType: "sistema",
    description: "Cobrança criada no sistema",
    previousStatus: null,
    newStatus: billing.status,
    userId: createdBy
  });

  return billing;
};

export default CreateService;
