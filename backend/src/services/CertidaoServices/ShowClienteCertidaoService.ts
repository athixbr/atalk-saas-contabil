import ClienteCertidao from "../../models/ClienteCertidao";
import AppError from "../../errors/AppError";

const ShowClienteCertidaoService = async (id: string, companyId: number): Promise<ClienteCertidao> => {
  const cliente = await ClienteCertidao.findOne({
    where: { id, companyId }
  });

  if (!cliente) {
    throw new AppError("Cliente não encontrado", 404);
  }

  return cliente;
};

export default ShowClienteCertidaoService;
