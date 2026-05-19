import Departamento from "../../models/Departamento";
import DepartamentoUsuario from "../../models/DepartamentoUsuario";
import AppError from "../../errors/AppError";

interface Request {
  id: string | number;
  companyId: number;
}

const DeleteDepartamentoService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const departamento = await Departamento.findOne({
    where: { id, companyId },
  });

  if (!departamento) {
    throw new AppError("Departamento não encontrado", 404);
  }

  // Deletar associações primeiro
  await DepartamentoUsuario.destroy({
    where: { departamentoId: departamento.id },
  });

  // Deletar o departamento
  await departamento.destroy();
};

export default DeleteDepartamentoService;
