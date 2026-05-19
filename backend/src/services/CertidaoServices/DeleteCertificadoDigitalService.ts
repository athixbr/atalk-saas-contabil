import fs from "fs";
import path from "path";
import CertificadoDigital from "../../models/CertificadoDigital";
import AppError from "../../errors/AppError";

const DeleteCertificadoDigitalService = async (certificadoId: string, companyId: number): Promise<void> => {
  const certificado = await CertificadoDigital.findOne({
    where: { 
      id: certificadoId,
      companyId 
    }
  });

  if (!certificado) {
    throw new AppError("Certificado não encontrado", 404);
  }

  // Deletar arquivo físico
  const filePath = path.resolve(__dirname, "..", "..", "..", certificado.caminhoArquivo);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Deletar registro do banco
  await certificado.destroy();
};

export default DeleteCertificadoDigitalService;
