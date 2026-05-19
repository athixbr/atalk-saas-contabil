import LogCertidao from "../../models/LogCertidao";

interface CreateLogData {
  certidaoId?: number;
  clienteId?: number;
  companyId: number;
  tipo?: string;
  categoria?: string;
  status: "em_processamento" | "sucesso" | "erro" | "timeout";
  codigoErro?: string;
  mensagemErro?: string;
  requestData?: object;
  responseData?: object;
  tentativa?: number;
  tempoResposta?: number;
  custoConsulta?: number;
}

const CreateLogCertidaoService = async (data: CreateLogData): Promise<LogCertidao> => {
  const log = await LogCertidao.create({
    certidaoId: data.certidaoId || null,
    clienteId: data.clienteId,
    companyId: data.companyId,
    tipo: data.tipo,
    categoria: data.categoria,
    status: data.status,
    codigoErro: data.codigoErro,
    mensagemErro: data.mensagemErro,
    requestData: data.requestData,
    responseData: data.responseData,
    tentativa: data.tentativa || 1,
    tempoResposta: data.tempoResposta,
    custoConsulta: data.custoConsulta
  });

  return log;
};

export default CreateLogCertidaoService;
