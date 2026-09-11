import Cliente from "../../models/Cliente";

const GetNextCodigoSistemaService = async (companyId: number): Promise<string> => {
  const lastCliente = await Cliente.findOne({
    where: { companyId },
    attributes: ["id"],
    order: [["id", "DESC"]],
  });

  return String((lastCliente?.id || 0) + 1);
};

export default GetNextCodigoSistemaService;
