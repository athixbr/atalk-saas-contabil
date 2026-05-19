import ControleConfig from "../../models/ControleConfig";
import ControleCliente from "../../models/ControleCliente";
import AppError from "../../errors/AppError";

interface Request {
  controleConfigId: number;
}

const DeleteControleConfigService = async ({
  controleConfigId,
}: Request): Promise<void> => {
  const controleConfig = await ControleConfig.findByPk(controleConfigId);

  if (!controleConfig) {
    throw new AppError("ERR_CONTROLE_CONFIG_NOT_FOUND", 404);
  }

  // Remover clientes relacionados
  await ControleCliente.destroy({
    where: { controleConfigId },
  });

  // Remover o controle config
  await controleConfig.destroy();
};

export default DeleteControleConfigService;
