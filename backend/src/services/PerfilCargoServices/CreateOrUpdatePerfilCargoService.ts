import PerfilCargo from "../../models/PerfilCargo";
import AppError from "../../errors/AppError";

interface Request {
  userId: number;
  companyId: number;
  perfilData: any;
}

const CreateOrUpdatePerfilCargoService = async ({
  userId,
  companyId,
  perfilData,
}: Request): Promise<PerfilCargo> => {
  // Verificar se já existe perfil para este usuário
  let perfil = await PerfilCargo.findOne({
    where: { userId, companyId },
  });

  if (perfil) {
    // Atualizar perfil existente
    await perfil.update(perfilData);
  } else {
    // Criar novo perfil
    perfil = await PerfilCargo.create({
      userId,
      companyId,
      ...perfilData,
    });
  }

  return perfil;
};

export default CreateOrUpdatePerfilCargoService;
