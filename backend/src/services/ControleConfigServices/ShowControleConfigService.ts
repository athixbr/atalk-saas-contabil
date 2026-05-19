import ControleConfig from "../../models/ControleConfig";
import AppError from "../../errors/AppError";

interface Request {
  controleConfigId: number;
  companyId: number;
}

const ShowControleConfigService = async ({
  controleConfigId,
  companyId,
}: Request): Promise<ControleConfig> => {
  const controleConfig = await ControleConfig.findOne({
    where: { id: controleConfigId, companyId },
    include: [
      { association: "departamento" },
      { association: "grupoServico" },
      { association: "tipoServico" },
      { association: "prioridade" },
      { association: "prazo" },
      {
        association: "controleClientes",
        include: [{ association: "cliente" }],
      },
    ],
  });

  if (!controleConfig) {
    throw new AppError("ERR_CONTROLE_CONFIG_NOT_FOUND", 404);
  }

  return controleConfig;
};

export default ShowControleConfigService;
