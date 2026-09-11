import CertificadoDigital from "../../models/CertificadoDigital";
import Cliente from "../../models/Cliente";

const ShowCertificadoDigitalService = async (companyId: number, clienteId?: number): Promise<CertificadoDigital[]> => {
  const certificados = await CertificadoDigital.findAll({
    where: { companyId, ...(clienteId ? { clienteId } : {}) },
    include: [{ model: Cliente, as: "cliente", attributes: ["id", "nome", "email", "celular", "telefone"] }],
    order: [["dataUpload", "DESC"]]
  });

  return certificados;
};

export default ShowCertificadoDigitalService;
