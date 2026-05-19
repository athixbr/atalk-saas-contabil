import Parcelamentos from "../../models/Parcelamentos";
import Cliente from "../../models/Cliente";
import Departamento from "../../models/Departamento";
import User from "../../models/User";
import TarefaConfig from "../../models/TarefaConfig";
import ParcelamentosParcela from "../../models/ParcelamentosParcela";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
  companyId: number;
}

const ShowParcelamentosService = async ({
  id,
  companyId,
}: Request): Promise<any> => {
  const parcelamento = await Parcelamentos.findOne({
    where: { id, companyId },
    include: [
      { model: Cliente, as: "cliente" },
      { model: Departamento, as: "departamento" },
      { model: User, as: "responsavel", attributes: ["id", "name"] },
      { model: TarefaConfig, as: "tarefaConfig" },
    ],
  });

  if (!parcelamento) {
    throw new AppError("Parcelamento não encontrado", 404);
  }

  // Buscar parcelas
  const parcelas = await ParcelamentosParcela.findAll({
    where: { parcelamentoId: id },
    order: [["numeroParcela", "ASC"]],
  });

  return {
    ...parcelamento.toJSON(),
    parcelas,
  };
};

export default ShowParcelamentosService;
