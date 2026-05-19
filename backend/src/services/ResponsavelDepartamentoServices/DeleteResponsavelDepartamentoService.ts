import ResponsavelDepartamento from "../../models/ResponsavelDepartamento";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const DeleteResponsavelDepartamentoService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const responsavel = await ResponsavelDepartamento.findOne({
    where: {
      id,
      companyId,
    },
  });

  if (!responsavel) {
    throw new AppError("Responsável não encontrado", 404);
  }

  await responsavel.destroy();
};

export default DeleteResponsavelDepartamentoService;
