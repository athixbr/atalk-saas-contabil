import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CrmClient from "../../models/CrmClient";

interface ClientData {
  name?: string;
  companyName?: string;
  cnpj?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  businessTypeId?: number;
  taxRegimeId?: number;
  userId?: number;
  status?: string;
  notes?: string;
}

interface Request {
  clientData: ClientData;
  id: string | number;
  companyId: number;
}

const UpdateService = async ({
  clientData,
  id,
  companyId
}: Request): Promise<CrmClient> => {
  const client = await CrmClient.findOne({
    where: { id, companyId }
  });

  if (!client) {
    throw new AppError("ERR_NO_CLIENT_FOUND", 404);
  }

  if (clientData.name) {
    const schema = Yup.object().shape({
      name: Yup.string().min(3, "Nome deve ter no mínimo 3 caracteres")
    });

    try {
      await schema.validate({ name: clientData.name });
    } catch (err: any) {
      throw new AppError(err.message);
    }
  }

  await client.update(clientData);

  await client.reload({
    include: ["user", "businessType", "taxRegime"]
  });

  return client;
};

export default UpdateService;
