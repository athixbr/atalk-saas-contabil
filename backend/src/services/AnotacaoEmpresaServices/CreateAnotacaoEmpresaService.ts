import AnotacaoEmpresa from "../../models/AnotacaoEmpresa";
import User from "../../models/User";
import AppError from "../../errors/AppError";

interface Request {
  clienteId: number;
  userId: number;
  anotacao: string;
  companyId: number;
}

const CreateAnotacaoEmpresaService = async ({
  clienteId,
  userId,
  anotacao,
  companyId,
}: Request): Promise<AnotacaoEmpresa> => {
  if (!anotacao || anotacao.trim() === "") {
    throw new AppError("A anotação não pode estar vazia", 400);
  }

  const anotacaoEmpresa = await AnotacaoEmpresa.create({
    clienteId,
    userId,
    anotacao: anotacao.trim(),
    companyId,
  });

  // Retornar com o relacionamento carregado
  const anotacaoCompleta = await AnotacaoEmpresa.findByPk(anotacaoEmpresa.id, {
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name"],
      },
    ],
  });

  return anotacaoCompleta!;
};

export default CreateAnotacaoEmpresaService;
