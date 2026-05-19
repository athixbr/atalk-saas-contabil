import axios from "axios";
import path from "path";
import fs from "fs";
import Certidao from "../../models/Certidao";
import Cliente from "../../models/Cliente";
import AppError from "../../errors/AppError";
import CreateLogCertidaoService from "./CreateLogCertidaoService";

interface CampoVerdeCoplanRequest {
  clienteId: number;
  companyId: number;
  tentativa?: number;
}

interface CampoVerdeCoplanResponse {
  certidao: Certidao;
  sucesso: boolean;
  mensagem: string;
  pdfUrl?: string;
}

const COPLAN_API_URL =
  process.env.COPLAN_API_URL || "http://api-coplan-atalk.athixdev.xyz";
const COPLAN_TIMEOUT = parseInt(
  process.env.COPLAN_TIMEOUT || "120000",
  10
);

const CampoVerdeCoplanService = async (
  data: CampoVerdeCoplanRequest
): Promise<CampoVerdeCoplanResponse> => {
  const { clienteId, companyId, tentativa = 1 } = data;

  // Buscar cliente
  const cliente = await Cliente.findOne({
    where: { id: clienteId, companyId }
  });

  if (!cliente) {
    throw new AppError("Cliente não encontrado", 404);
  }

  // Campo Verde aceita CNPJ ou CPF
  const cpfCnpjLimpo = (cliente.cnpj || cliente.cpf || "").replace(/\D/g, "");

  if (!cpfCnpjLimpo) {
    throw new AppError(
      "Cliente não possui CNPJ ou CPF cadastrado para consulta na Prefeitura de Campo Verde",
      400
    );
  }

  // Criar registro de certidão
  const certidao = await Certidao.create({
    companyId,
    clienteId,
    tipo: "municipal",
    categoria: "prefeitura-campo-verde",
    status: "pendente",
    dataConsulta: new Date(),
    origemApi: "coplan",
    tentativasRealizadas: tentativa
  });

  const requestData = { cpfCnpj: cpfCnpjLimpo };

  // Log inicial
  await CreateLogCertidaoService({
    certidaoId: certidao.id,
    clienteId,
    companyId,
    tipo: "municipal",
    categoria: "prefeitura-campo-verde",
    status: "em_processamento",
    requestData,
    tentativa,
    custoConsulta: 0.20
  });

  const startTime = Date.now();

  try {
    console.log(
      `[CampoVerdeCoplan] Consultando certidão para cliente ${cliente.nome} (${cpfCnpjLimpo})`
    );

    const response = await axios.post(
      `${COPLAN_API_URL}/api/v1/certidao`,
      requestData,
      {
        timeout: COPLAN_TIMEOUT,
        headers: { "Content-Type": "application/json" }
      }
    );

    const tempoResposta = Date.now() - startTime;
    const resData = response.data;

    if (!resData.success) {
      const mensagemErro =
        resData.message || "Erro ao consultar certidão na Prefeitura de Campo Verde";

      console.error(`[CampoVerdeCoplan] Erro retornado pela API: ${mensagemErro}`);

      await certidao.update({
        status: "erro",
        mensagemErro,
        dadosResposta: resData
      });

      await CreateLogCertidaoService({
        certidaoId: certidao.id,
        clienteId,
        companyId,
        tipo: "municipal",
        categoria: "prefeitura-campo-verde",
        status: "erro",
        codigoErro: "API_ERROR",
        mensagemErro,
        requestData,
        responseData: resData,
        tentativa,
        tempoResposta,
        custoConsulta: 0.20
      });

      return { certidao, sucesso: false, mensagem: mensagemErro };
    }

    // Sucesso — baixar e salvar PDF
    const downloadUrl: string = resData.data?.downloadUrl;
    let arquivoPdf: string | null = null;

    if (downloadUrl) {
      try {
        console.log(
          `[CampoVerdeCoplan] Baixando PDF: ${downloadUrl}`
        );
        arquivoPdf = await baixarESalvarPdf(
          downloadUrl,
          companyId,
          cliente,
          cpfCnpjLimpo
        );
        console.log(`[CampoVerdeCoplan] PDF salvo em: ${arquivoPdf}`);
      } catch (pdfErr: any) {
        console.error(
          `[CampoVerdeCoplan] Erro ao baixar PDF: ${pdfErr.message}`
        );
        // Não falha a consulta por erro de download
      }
    }

    await certidao.update({
      status: "emitida",
      dataConsulta: new Date(),
      arquivoPdf,
      dadosResposta: resData.data,
      mensagemErro: null
    });

    await CreateLogCertidaoService({
      certidaoId: certidao.id,
      clienteId,
      companyId,
      tipo: "municipal",
      categoria: "prefeitura-campo-verde",
      status: "sucesso",
      requestData,
      responseData: resData,
      tentativa,
      tempoResposta,
      custoConsulta: 0.20
    });

    console.log(
      `[CampoVerdeCoplan] Sucesso para cliente ${cliente.nome}`
    );

    return {
      certidao,
      sucesso: true,
      mensagem: "Certidão emitida com sucesso",
      pdfUrl: arquivoPdf ? `/public/${arquivoPdf}` : undefined
    };
  } catch (error: any) {
    const tempoResposta = Date.now() - startTime;
    const isTimeout =
      error.code === "ECONNABORTED" ||
      (error.message || "").toLowerCase().includes("timeout");

    const mensagemErro = isTimeout
      ? "Timeout ao consultar Prefeitura de Campo Verde. O portal pode estar lento."
      : error.response?.data?.message || error.message;

    console.error(`[CampoVerdeCoplan] Erro: ${mensagemErro}`);

    await certidao.update({
      status: "erro",
      mensagemErro
    });

    await CreateLogCertidaoService({
      certidaoId: certidao.id,
      clienteId,
      companyId,
      tipo: "municipal",
      categoria: "prefeitura-campo-verde",
      status: isTimeout ? "timeout" : "erro",
      codigoErro: isTimeout ? "API_TIMEOUT" : "API_ERROR",
      mensagemErro,
      requestData,
      tentativa,
      tempoResposta,
      custoConsulta: 0.20
    });

    return { certidao, sucesso: false, mensagem: mensagemErro };
  }
};

async function baixarESalvarPdf(
  pdfUrl: string,
  companyId: number,
  cliente: Cliente,
  cpfCnpj: string
): Promise<string> {
  const response = await axios.get(pdfUrl, {
    responseType: "arraybuffer",
    timeout: 60000
  });

  const pdfBuffer = Buffer.from(response.data);

  const publicFolder = path.resolve(__dirname, "..", "..", "..", "..", "public");
  const companyFolder = path.join(publicFolder, `company${companyId}`);
  const certidoesFolder = path.join(companyFolder, "certidoes");

  if (!fs.existsSync(certidoesFolder)) {
    fs.mkdirSync(certidoesFolder, { recursive: true });
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .substring(0, 19);
  const fileName = `certidao_campo_verde_${cpfCnpj}_${timestamp}.pdf`;
  const relativePath = `company${companyId}/certidoes/${fileName}`;
  const fullPath = path.join(certidoesFolder, fileName);

  fs.writeFileSync(fullPath, pdfBuffer);

  return relativePath;
}

export default CampoVerdeCoplanService;
