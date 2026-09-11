import fs from "fs";
import path from "path";
import forge from "node-forge";
import CertificadoDigital from "../../models/CertificadoDigital";
import AppError from "../../errors/AppError";
import { encryptCredential } from "../DocumentoClienteCredentialCrypto";

interface Request {
  companyId: number;
  clienteId?: number;
  file: Express.Multer.File;
  password: string;
  notificarEmail?: boolean;
  notificarWhatsapp?: boolean;
  lembretesDias?: number[];
}

const UploadCertificadoDigitalService = async ({
  companyId,
  clienteId,
  file,
  password,
  notificarEmail = false,
  notificarWhatsapp = false,
  lembretesDias = [45, 30, 15, 5]
}: Request): Promise<CertificadoDigital> => {
  const publicFolder = path.resolve(__dirname, "..", "..", "..", "..", "public");
  const companyFolder = path.join(publicFolder, `company${companyId}`);
  const certificadosFolder = path.join(companyFolder, "certificados");

  // Criar pastas se não existirem
  if (!fs.existsSync(companyFolder)) {
    fs.mkdirSync(companyFolder, { recursive: true });
  }

  if (!fs.existsSync(certificadosFolder)) {
    fs.mkdirSync(certificadosFolder, { recursive: true });
  }

  // Extrair informações do certificado PFX
  let certInfo: any = {
    titular: null,
    cpfCnpj: null,
    emissor: null,
    dataInicio: null,
    validade: null,
    algoritmo: null,
    serialNumber: null
  };

  try {
    // Converter buffer para base64
    const p12Der = forge.util.decode64(file.buffer.toString("base64"));
    const p12Asn1 = forge.asn1.fromDer(p12Der);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

    // Extrair certificado
    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    const certBag = certBags[forge.pki.oids.certBag]?.[0];

    if (certBag && certBag.cert) {
      const cert = certBag.cert;
      
      // Titular (Common Name)
      certInfo.titular = cert.subject.getField("CN")?.value || "N/A";
      
      // Emissor
      certInfo.emissor = cert.issuer.getField("CN")?.value || "N/A";
      
      // Serial Number
      certInfo.serialNumber = cert.serialNumber;
      
      // Algoritmo
      certInfo.algoritmo = cert.signatureAlgorithm || "RSA 2048";
      
      // Datas
      certInfo.dataInicio = cert.validity.notBefore;
      certInfo.validade = cert.validity.notAfter;
      
      // Tentar extrair CPF/CNPJ do subject
      const serialNumberField = cert.subject.getField({ name: "serialNumber" })?.value;
      if (serialNumberField) {
        // Remove caracteres não numéricos
        const numeros = serialNumberField.replace(/\D/g, "");
        if (numeros.length === 11) {
          certInfo.cpfCnpj = numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        } else if (numeros.length === 14) {
          certInfo.cpfCnpj = numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
        }
      }
      
      // Se não encontrou no serialNumber, tenta no CN
      if (!certInfo.cpfCnpj && certInfo.titular) {
        const cnpjMatch = certInfo.titular.match(/\d{14}/);
        const cpfMatch = certInfo.titular.match(/\d{11}/);
        
        if (cnpjMatch) {
          const cnpj = cnpjMatch[0];
          certInfo.cpfCnpj = cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
        } else if (cpfMatch) {
          const cpf = cpfMatch[0];
          certInfo.cpfCnpj = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        }
      }
    }
  } catch (err: any) {
    console.error("Erro ao extrair informações do certificado:", err.message);
    throw new AppError("Senha do certificado incorreta ou arquivo inválido", 400);
  }

  // Gerar nome único para o arquivo
  const timestamp = new Date().getTime();
  const fileExtension = path.extname(file.originalname);
  const fileName = `certificado_${companyId}_${timestamp}${fileExtension}`;
  const filePath = path.join(certificadosFolder, fileName);

  // Salvar arquivo
  fs.writeFileSync(filePath, file.buffer as any);

  // Encriptar senha com AES-256-CBC (reversível)
  const senhaEncriptada = encryptCredential(password);

  // Caminho relativo
  const relativePath = `public/company${companyId}/certificados/${fileName}`;

  const certificado = await CertificadoDigital.create({
    companyId,
    clienteId: clienteId || null,
    nomeArquivo: file.originalname,
    caminhoArquivo: relativePath,
    senhaEncriptada,
    tipo: "A1",
    titular: certInfo.titular,
    cpfCnpj: certInfo.cpfCnpj,
    emissor: certInfo.emissor,
    dataInicio: certInfo.dataInicio,
    validade: certInfo.validade,
    algoritmo: certInfo.algoritmo,
    serialNumber: certInfo.serialNumber,
    ativo: true,
    dataUpload: new Date(),
    notificarEmail,
    notificarWhatsapp,
    lembretesDias,
    notificacoesEnviadas: []
  } as any);

  return certificado;
};

export default UploadCertificadoDigitalService;
