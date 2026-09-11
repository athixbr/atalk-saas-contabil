import ClienteVigencia from "../../models/ClienteVigencia";
import Cliente from "../../models/Cliente";

interface Request {
  clienteId: number;
  companyId: number;
}

interface Response {
  vigencias: ClienteVigencia[];
}

const ListClienteVigenciasService = async ({
  clienteId,
  companyId,
}: Request): Promise<Response> => {
  const vigencias = await ClienteVigencia.findAll({
    where: { clienteId },
    include: [
      {
        model: Cliente,
        as: "cliente",
        attributes: ["id", "nome"],
        where: { companyId },
        required: true,
      },
    ],
    order: [["dataInicial", "DESC"]],
  });

  return { vigencias };
};

export default ListClienteVigenciasService;
