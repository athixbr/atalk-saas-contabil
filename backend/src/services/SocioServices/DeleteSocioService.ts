import Socio from "../../models/Socio";
import ClienteSocio from "../../models/ClienteSocio";
import AppError from "../../errors/AppError";

interface Request {
  id: string | number;
  companyId: number;
}

const DeleteSocioService = async ({ id, companyId }: Request): Promise<void> => {
  const socio = await Socio.findOne({
    where: { id, companyId },
  });

  if (!socio) {
    throw new AppError("Sócio não encontrado", 404);
  }

  // Verificar se há vínculos ativos com empresas
  const vinculosAtivos = await ClienteSocio.count({
    where: { socioId: id, ativo: true },
  });

  if (vinculosAtivos > 0) {
    throw new AppError(
      "Não é possível excluir sócio com vínculos ativos. Desative os vínculos primeiro.",
      400
    );
  }

  await socio.destroy();
};

export default DeleteSocioService;
