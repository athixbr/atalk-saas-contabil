import ClienteCertidao from "../../models/ClienteCertidao";
import AppError from "../../errors/AppError";

const DeleteClienteCertidaoService = async (id: string, companyId: number): Promise<void> => {
  const cliente = await ClienteCertidao.findOne({
    where: { id, companyId }
  });

  if (!cliente) {
    throw new AppError("Cliente não encontrado", 404);
  }

  // Soft delete
  await cliente.update({ ativo: false });
};

export default DeleteClienteCertidaoService;
