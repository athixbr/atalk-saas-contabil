import DemaisIdentificadores from "../../models/DemaisIdentificadores";
import TipoDocumento from "../../models/TipoDocumento";

interface Request {
  clienteId: number;
  companyId: number;
}

interface Response {
  identificadores: DemaisIdentificadores[];
}

const ListDemaisIdentificadoresService = async ({
  clienteId,
  companyId,
}: Request): Promise<Response> => {
  const identificadores = await DemaisIdentificadores.findAll({
    where: {
      clienteId,
      companyId,
    },
    include: [
      {
        model: TipoDocumento,
        as: "tipoDocumento",
        attributes: ["id", "nome"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return { identificadores };
};

export default ListDemaisIdentificadoresService;
