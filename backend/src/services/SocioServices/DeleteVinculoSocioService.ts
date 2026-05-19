import ClienteSocio from "../../models/ClienteSocio";
import AppError from "../../errors/AppError";

interface Request {
  vinculoId: string | number;
  companyId: number;
}

const DeleteVinculoSocioService = async ({
  vinculoId,
  companyId,
}: Request): Promise<void> => {
  const vinculo = await ClienteSocio.findByPk(vinculoId, {
    include: [
      {
        association: "cliente",
        where: { companyId },
      },
    ],
  });

  if (!vinculo) {
    throw new AppError("Vínculo não encontrado", 404);
  }

  await vinculo.destroy();
};

export default DeleteVinculoSocioService;
