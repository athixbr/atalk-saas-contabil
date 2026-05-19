import CertificadoDigital from "../../models/CertificadoDigital";

const ShowCertificadoDigitalService = async (companyId: number): Promise<CertificadoDigital[]> => {
  const certificados = await CertificadoDigital.findAll({
    where: { companyId },
    order: [["dataUpload", "DESC"]]
  });

  return certificados;
};

export default ShowCertificadoDigitalService;
