import fs from "fs";
import path from "path";
import Certidao from "../../models/Certidao";
import Cliente from "../../models/Cliente";
import CertificadoDigital from "../../models/CertificadoDigital";
import AppError from "../../errors/AppError";
import InfoSimplesService from "./InfoSimplesService";
import CreateLogCertidaoService from "./CreateLogCertidaoService";
import { getCertidaoMapping } from "../../helpers/infosimplesMapper";
import GerarPdfService from "./GerarPdfService";
import CampoVerdeCoplanService from "./CampoVerdeCoplanService";
import crypto from "crypto";
import { createRequire as _aesCR } from "module";
// @ts-ignore
const { encrypt } = _aesCR(import.meta.url)("aes-bridge");

interface ConsultarCertidaoRequest {
  clienteId: number;
  companyId: number;
  categoria: string;
  tentativa?: number;
}

interface ConsultarCertidaoResponse {
  certidao: Certidao;
  sucesso: boolean;
  mensagem: string;
  pdfUrl?: string;
}

const ConsultarCertidaoService = async (
  data: ConsultarCertidaoRequest
): Promise<ConsultarCertidaoResponse> => {
  const { clienteId, companyId, categoria, tentativa = 1 } = data;

  // Buscar mapeamento da certidão
  const mapping = getCertidaoMapping(categoria);
  if (!mapping) {
    throw new AppError(`Certidão ${categoria} não está mapeada ou não disponível`, 400);
  }

  // Roteamento para APIs alternativas
  if (mapping.origemApi === "coplan") {
    return CampoVerdeCoplanService({ clienteId, companyId, tentativa });
  }

  // Verificar se API Info Simples está configurada
  if (!InfoSimplesService.isConfigured()) {
    throw new AppError(
      "API Info Simples não está configurada. Configure INFOSIMPLES_API_TOKEN no arquivo .env",
      500
    );
  }

  // Buscar cliente
  const cliente = await Cliente.findOne({
    where: { id: clienteId, companyId }
  });

  if (!cliente) {
    throw new AppError("Cliente não encontrado", 404);
  }

  // Validar campos necessários
  const camposFaltando: string[] = [];
  if (mapping.camposNecessarios.includes("cnpj") && !cliente.cnpj) {
    camposFaltando.push("CNPJ");
  }
  if (mapping.camposNecessarios.includes("cpf") && !cliente.cpf) {
    camposFaltando.push("CPF");
  }
  if (mapping.camposNecessarios.includes("inscricaoEstadual") && !cliente.inscricaoEstadual) {
    camposFaltando.push("Inscrição Estadual");
  }

  if (camposFaltando.length > 0) {
    throw new AppError(
      `Cliente não possui os campos necessários: ${camposFaltando.join(", ")}`,
      400
    );
  }

  // Criar registro de certidão
  const certidao = await Certidao.create({
    companyId,
    clienteId,
    tipo: mapping.tipo,
    categoria,
    status: "pendente",
    dataConsulta: new Date(),
    origemApi: "infosimples",
    tentativasRealizadas: tentativa
  });

  // Preparar dados da requisição
  const requestData: any = {};
  
  if (cliente.cnpj) {
    requestData.cnpj = cliente.cnpj.replace(/\D/g, "");
  }
  if (cliente.cpf) {
    requestData.cpf = cliente.cpf.replace(/\D/g, "");
  }
  if (cliente.inscricaoEstadual) {
    requestData.inscricao_estadual = cliente.inscricaoEstadual;
  }

  // Se a consulta requer certificado digital (ECAC, MTE Certidão ou Protesto), buscar certificado ativo
  if (categoria.startsWith("ecac-") || categoria === "mte-certidao" || categoria === "protesto-ieptb") {
    // Buscar certificado de pessoa física (CPF) para ECAC, MTE e Protesto
    const certificado = await CertificadoDigital.findOne({
      where: { 
        companyId, 
        ativo: true,
        cpfCnpj: "403.568.501-10" // CPF do JOSIEL DA SILVA ARAUJO
      },
      order: [["validade", "DESC"]]
    });

    if (!certificado) {
      throw new AppError(
        "Certificado digital de pessoa física não encontrado. Por favor, faça upload de um certificado CPF válido.",
        400
      );
    }

    // Verificar se certificado está válido
    if (new Date() > certificado.validade) {
      throw new AppError(
        `Certificado digital vencido em ${certificado.validade.toLocaleDateString()}`,
        400
      );
    }

    // Ler arquivo do certificado
    const certPath = path.resolve(__dirname, "..", "..", "..", certificado.caminhoArquivo);
    
    if (!fs.existsSync(certPath)) {
      throw new AppError(
        `Arquivo do certificado não encontrado: ${certificado.nomeArquivo}`,
        500
      );
    }

    const certBuffer = fs.readFileSync(certPath);
    const certBase64 = certBuffer.toString("base64");

    // Descriptografar senha
    const senhaDescriptografada = descriptografarSenha(certificado.senhaEncriptada);

    // Criptografar certificado e senha para Info Simples
    const encryptionKey = process.env.INFOSIMPLES_ENCRYPTION_KEY || "";
    const certEncrypted = await encrypt(certBase64, encryptionKey);
    const passEncrypted = await encrypt(senhaDescriptografada, encryptionKey);

    // Formatar conforme documentação Info Simples (substituir +, / e remover =)
    const certFormatted = certEncrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const passFormatted = passEncrypted.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    // Adicionar certificado aos parâmetros (criptografado)
    requestData.pkcs12_cert = certFormatted;
    requestData.pkcs12_pass = passFormatted;

    // Parâmetros específicos para caixa postal
    if (categoria === "ecac-postal") {
      // Não ignorar nenhum tipo de mensagem (buscar todas)
      requestData.ignora_nao_lidas = "0";
      requestData.ignora_lidas = "0";
      
      // Se tiver CNPJ do cliente, adicionar como perfil
      if (cliente.cnpj) {
        requestData.perfil_procurador_cnpj = cliente.cnpj.replace(/\D/g, "");
      }
    }

    console.log(`[ConsultaCertidao] Certificado digital adicionado: ${certificado.nomeArquivo} (validade: ${certificado.validade.toLocaleDateString()})`);
  }

  // Parâmetros específicos para MTE Processos Empregador
  if (categoria === "mte-processos" && cliente.cnpj) {
    // Adicionar CNPJ raiz (primeiros 8 dígitos)
    const cnpjLimpo = cliente.cnpj.replace(/\D/g, "");
    requestData.cnpj_raiz = cnpjLimpo.substring(0, 8);
  }

  // Criar log inicial
  const logInicial = await CreateLogCertidaoService({
    certidaoId: certidao.id,
    clienteId,
    companyId,
    tipo: mapping.tipo,
    categoria,
    status: "em_processamento",
    requestData: { ...requestData, pkcs12_cert: requestData.pkcs12_cert ? "[REDACTED]" : undefined },
    tentativa,
    custoConsulta: mapping.custoBase
  });

  const startTime = Date.now();

  try {
    console.log(`[ConsultaCertidao] Iniciando consulta: ${categoria} para cliente ${cliente.nome}`);

    // Chamar API Info Simples
    const response = await InfoSimplesService.consultar(
      mapping.infoSimplesPath,
      requestData
    );

    const tempoResposta = Date.now() - startTime;

    // Verificar resposta
    if (response.code !== 200 && response.code !== 201) {
      // Erro da API
      console.log(`[ConsultaCertidao] Resposta de erro (code ${response.code}):`, JSON.stringify(response, null, 2));
      
      const mensagemErro = response.errors && response.errors.length > 0
        ? response.errors.map(e => e.message).join("; ")
        : response.code_message || "Erro desconhecido";

      const codigoErro = classificarErro(response);

      // Atualizar certidão com erro
      await certidao.update({
        status: "erro",
        mensagemErro,
        dadosResposta: response.data
      });

      // Atualizar log
      await CreateLogCertidaoService({
        certidaoId: certidao.id,
        clienteId,
        companyId,
        tipo: mapping.tipo,
        categoria,
        status: "erro",
        codigoErro,
        mensagemErro,
        requestData,
        responseData: response,
        tentativa,
        tempoResposta,
        custoConsulta: mapping.custoBase
      });

      // Calcular próxima tentativa (se aplicável)
      if (deveTentarNovamente(codigoErro)) {
        const retryDays = parseInt(process.env.CERTIDOES_RETRY_DAYS || "10", 10);
        const proximaTentativa = new Date();
        proximaTentativa.setDate(proximaTentativa.getDate() + retryDays);
        
        await certidao.update({ proximaTentativa });
      }

      return {
        certidao,
        sucesso: false,
        mensagem: mensagemErro
      };
    }

    // Sucesso - processar resposta
    let dadosResposta = response.data;

    // Log da resposta completa para debug
    console.log(`[ConsultaCertidao] Resposta completa da API:`, JSON.stringify(response, null, 2));

    // Se data é um array, pegar o primeiro elemento
    if (Array.isArray(dadosResposta) && dadosResposta.length > 0) {
      console.log(`[ConsultaCertidao] dadosResposta é array, pegando primeiro elemento`);
      dadosResposta = dadosResposta[0];
    }

    console.log(`[ConsultaCertidao] dadosResposta (após array check):`, JSON.stringify(dadosResposta, null, 2));

    // Se for consulta de protesto IEPTB e houver cartórios de SP, buscar detalhes automaticamente
    if (categoria === "protesto-ieptb" && dadosResposta?.cartorios?.SP) {
      console.log(`[ConsultaCertidao] Encontrados protestos de SP, buscando detalhes...`);
      
      try {
        const cartoriosSP = dadosResposta.cartorios.SP;
        
        for (const cartorio of cartoriosSP) {
          if (cartorio.obter_detalhes) {
            console.log(`[ConsultaCertidao] Buscando detalhes do cartório: ${cartorio.nome}`);
            
            // Preparar dados para buscar detalhes
            const detalhesRequestData: any = {
              token: process.env.INFOSIMPLES_API_TOKEN || "",
              obter_detalhes: cartorio.obter_detalhes
            };

            // Adicionar certificado se disponível (já está nas variáveis do escopo)
            if (requestData.pkcs12_cert && requestData.pkcs12_pass) {
              detalhesRequestData.pkcs12_cert = requestData.pkcs12_cert;
              detalhesRequestData.pkcs12_pass = requestData.pkcs12_pass;
            }

            // Chamar API de detalhes SP
            const detalhesResponse = await InfoSimplesService.consultar(
              "/consultas/ieptb/protestos/detalhes-sp",
              detalhesRequestData
            );

            // Se obteve detalhes, adicionar ao cartório
            if (detalhesResponse.code === 200 && detalhesResponse.data?.[0]?.protestos) {
              console.log(`[ConsultaCertidao] Detalhes de SP obtidos: ${detalhesResponse.data[0].protestos.length} protestos`);
              cartorio.protestos_detalhados = detalhesResponse.data[0].protestos;
            }
          }
        }
      } catch (error: any) {
        console.error("[ConsultaCertidao] Erro ao buscar detalhes de SP:", error.message);
        // Não falhar a consulta principal se detalhes falharem
      }
    }

    // Extrair informações da certidão
    let dataEmissao: Date | null = null;
    let validade: Date | null = null;
    let pdfUrl: string | null = null;

    if (dadosResposta) {
      // Tentar extrair data de emissão (vários formatos possíveis)
      if (dadosResposta.emissao_data || dadosResposta.data_emissao || dadosResposta.dataEmissao) {
        const dataStr = dadosResposta.emissao_data || dadosResposta.data_emissao || dadosResposta.dataEmissao;
        dataEmissao = new Date(dataStr);
      }

      // Tentar extrair validade (vários formatos possíveis)
      if (dadosResposta.validade_data || dadosResposta.data_validade || dadosResposta.validade || dadosResposta.dataValidade) {
        const validadeStr = dadosResposta.validade_data || dadosResposta.data_validade || dadosResposta.validade || dadosResposta.dataValidade;
        validade = new Date(validadeStr);
      }

      // Tentar extrair URL ou base64 do PDF (múltiplos campos possíveis)
      // Prioridade: site_receipt (URL do PDF), depois outros campos
      pdfUrl = dadosResposta.site_receipt || dadosResposta.pdf || dadosResposta.pdf_url || dadosResposta.arquivo || dadosResposta.documento || null;
      
      console.log(`[ConsultaCertidao] Buscando PDF em campos: site_receipt=${!!dadosResposta.site_receipt}, pdf=${!!dadosResposta.pdf}, pdf_url=${!!dadosResposta.pdf_url}, arquivo=${!!dadosResposta.arquivo}`);
      if (pdfUrl) {
        console.log(`[ConsultaCertidao] PDF encontrado em: ${pdfUrl.substring(0, 100)}...`);
      }
    }

    let arquivoPdf: string | null = null;

    // Baixar PDF se disponível OU gerar PDF se não houver
    if (pdfUrl) {
      try {
        console.log(`[ConsultaCertidao] URL do PDF encontrada: ${pdfUrl}`);
        arquivoPdf = await baixarESalvarPdf(pdfUrl, companyId, cliente, categoria);
        console.log(`[ConsultaCertidao] PDF salvo em: ${arquivoPdf}`);
      } catch (error: any) {
        console.error("[ConsultaCertidao] Erro ao baixar/salvar PDF:", error);
        console.error("[ConsultaCertidao] Stack:", error.stack);
        // Não falhar a consulta por erro no download do PDF
      }
    } else {
      // Não tem PDF - verificar se precisa gerar
      console.log("[ConsultaCertidao] Nenhum PDF encontrado, verificando se deve gerar...");
      
      if ((categoria === "ecac-fiscal" || categoria === "ecac-postal") && dadosResposta) {
        try {
          console.log(`[ConsultaCertidao] Gerando PDF para ${categoria}`);
          arquivoPdf = await gerarPdfParaCategoria(categoria, dadosResposta, companyId, cliente);
          console.log(`[ConsultaCertidao] PDF gerado e salvo em: ${arquivoPdf}`);
        } catch (error: any) {
          console.error("[ConsultaCertidao] Erro ao gerar PDF:", error);
        }
      } else {
        console.log(`[ConsultaCertidao] Categoria ${categoria} não gera PDF automaticamente`);
      }
    }

    // Atualizar certidão com sucesso
    await certidao.update({
      status: "emitida",
      dataEmissao,
      validade,
      arquivoPdf,
      dadosResposta,
      mensagemErro: null
    });

    // Criar log de sucesso
    await CreateLogCertidaoService({
      certidaoId: certidao.id,
      clienteId,
      companyId,
      tipo: mapping.tipo,
      categoria,
      status: "sucesso",
      requestData,
      responseData: response,
      tentativa,
      tempoResposta,
      custoConsulta: mapping.custoBase
    });

    console.log(`[ConsultaCertidao] Sucesso: ${categoria} para cliente ${cliente.nome}`);

    return {
      certidao,
      sucesso: true,
      mensagem: "Certidão emitida com sucesso",
      pdfUrl: arquivoPdf ? `/public/${arquivoPdf}` : undefined
    };

  } catch (error: any) {
    const tempoResposta = Date.now() - startTime;
    const isTimeout = error.message.includes("timeout") || error.message.includes("Timeout");

    console.error(`[ConsultaCertidao] Erro:`, error.message);

    // Atualizar certidão com erro
    await certidao.update({
      status: "erro",
      mensagemErro: error.message
    });

    // Criar log de erro
    await CreateLogCertidaoService({
      certidaoId: certidao.id,
      clienteId,
      companyId,
      tipo: mapping.tipo,
      categoria,
      status: isTimeout ? "timeout" : "erro",
      codigoErro: isTimeout ? "API_TIMEOUT" : "API_ERROR",
      mensagemErro: error.message,
      requestData,
      tentativa,
      tempoResposta,
      custoConsulta: mapping.custoBase
    });

    // Calcular próxima tentativa para erros técnicos
    if (isTimeout || error.message.includes("conexão")) {
      const retryDays = parseInt(process.env.CERTIDOES_RETRY_DAYS || "10", 10);
      const proximaTentativa = new Date();
      proximaTentativa.setDate(proximaTentativa.getDate() + retryDays);
      
      await certidao.update({ proximaTentativa });
    }

    return {
      certidao,
      sucesso: false,
      mensagem: error.message
    };
  }
};

// Helpers
function classificarErro(response: any): string {
  if (response.code === 400) {
    if (response.errors && response.errors.length > 0) {
      const firstError = response.errors[0];
      if (firstError.field === "cnpj" || firstError.field === "cpf") {
        return "DOCUMENTO_INVALIDO";
      }
      if (firstError.field === "inscricao_estadual") {
        return "INSCRICAO_INVALIDA";
      }
    }
    return "DADOS_INVALIDOS";
  }

  if (response.code === 404) {
    return "CONTRIBUINTE_NAO_ENCONTRADO";
  }

  if (response.code === 402) {
    return "SALDO_INSUFICIENTE";
  }

  if (response.code === 429) {
    return "LIMITE_EXCEDIDO";
  }

  if (response.code >= 500) {
    return "API_ERROR";
  }

  return "ERRO_DESCONHECIDO";
}

function deveTentarNovamente(codigoErro: string): boolean {
  const errosTemporarios = [
    "API_TIMEOUT",
    "API_ERROR",
    "LIMITE_EXCEDIDO",
    "CERTIDAO_INDISPONIVEL"
  ];
  return errosTemporarios.includes(codigoErro);
}

async function baixarESalvarPdf(
  pdfUrlOrBase64: string,
  companyId: number,
  cliente: Cliente,
  categoria: string
): Promise<string> {
  console.log(`[baixarESalvarPdf] Processando PDF (tamanho: ${pdfUrlOrBase64.length} chars)`);
  
  let pdfBuffer: Buffer;

  // Verificar se é base64 ou URL
  if (pdfUrlOrBase64.startsWith('http://') || pdfUrlOrBase64.startsWith('https://')) {
    // É uma URL - baixar o PDF
    console.log(`[baixarESalvarPdf] Baixando PDF da URL: ${pdfUrlOrBase64}`);
    pdfBuffer = await InfoSimplesService.baixarPdf(pdfUrlOrBase64);
    console.log(`[baixarESalvarPdf] PDF baixado, tamanho: ${pdfBuffer.length} bytes`);
  } else {
    // Assumir que é base64
    console.log(`[baixarESalvarPdf] Convertendo base64 para buffer`);
    pdfBuffer = Buffer.from(pdfUrlOrBase64, 'base64');
    console.log(`[baixarESalvarPdf] Buffer criado, tamanho: ${pdfBuffer.length} bytes`);
  }

  // Criar estrutura de pastas
  const publicFolder = path.resolve(__dirname, "..", "..", "..", "..", "public");
  const companyFolder = path.join(publicFolder, `company${companyId}`);
  const certidoesFolder = path.join(companyFolder, "certidoes");

  console.log(`[baixarESalvarPdf] Caminho completo: ${certidoesFolder}`);

  // Criar pasta da empresa se não existir
  if (!fs.existsSync(companyFolder)) {
    console.log(`[baixarESalvarPdf] Criando pasta da empresa: ${companyFolder}`);
    fs.mkdirSync(companyFolder, { recursive: true });
  }

  // Criar pasta de certidões se não existir
  if (!fs.existsSync(certidoesFolder)) {
    console.log(`[baixarESalvarPdf] Criando pasta de certidões: ${certidoesFolder}`);
    fs.mkdirSync(certidoesFolder, { recursive: true });
  }

  // Gerar nome do arquivo
  const timestamp = new Date().getTime();
  const documentoLimpo = (cliente.cnpj || cliente.cpf || "").replace(/\D/g, "");
  const fileName = `certidao_${categoria}_${documentoLimpo}_${timestamp}.pdf`;
  const filePath = path.join(certidoesFolder, fileName);

  console.log(`[baixarESalvarPdf] Salvando arquivo em: ${filePath}`);

  // Salvar arquivo
  fs.writeFileSync(filePath, pdfBuffer);

  console.log(`[baixarESalvarPdf] Arquivo salvo com sucesso!`);

  // Retornar caminho relativo
  return `company${companyId}/certidoes/${fileName}`;
}

async function gerarPdfParaCategoria(
  categoria: string,
  dados: any,
  companyId: number,
  cliente: Cliente
): Promise<string> {
  console.log(`[gerarPdfParaCategoria] Gerando PDF para ${categoria}`);

  // Criar estrutura de pastas
  const publicFolder = path.resolve(__dirname, "..", "..", "..", "..", "public");
  const companyFolder = path.join(publicFolder, `company${companyId}`);
  const certidoesFolder = path.join(companyFolder, "certidoes");

  // Criar pastas se não existirem
  if (!fs.existsSync(companyFolder)) {
    fs.mkdirSync(companyFolder, { recursive: true });
  }
  if (!fs.existsSync(certidoesFolder)) {
    fs.mkdirSync(certidoesFolder, { recursive: true });
  }

  // Gerar nome do arquivo
  const timestamp = new Date().getTime();
  const documentoLimpo = (cliente.cnpj || cliente.cpf || "").replace(/\D/g, "");
  const fileName = `certidao_${categoria}_${documentoLimpo}_${timestamp}.pdf`;
  const filePath = path.join(certidoesFolder, fileName);

  console.log(`[gerarPdfParaCategoria] Caminho do arquivo: ${filePath}`);

  // Gerar PDF baseado na categoria
  switch (categoria) {
    case "ecac-fiscal":
      await GerarPdfService.gerarPdfEcacSituacaoFiscal(dados, filePath);
      break;
    
    case "ecac-postal":
      await GerarPdfService.gerarPdfEcacCaixaPostal(dados, cliente, filePath);
      break;
    
    // Adicionar outros casos conforme necessário
    default:
      throw new Error(`Geração de PDF não implementada para categoria: ${categoria}`);
  }

  console.log(`[gerarPdfParaCategoria] PDF gerado com sucesso!`);

  // Retornar caminho relativo
  return `company${companyId}/certidoes/${fileName}`;
}

function descriptografarSenha(senhaEncriptada: string): string {
  try {
    // Verificar se tem um secret key configurado
    const secretKey = process.env.CERT_PASSWORD_SECRET || "default-secret-key-change-me";
    
    // Se a senha não parece estar encriptada, retornar como está
    if (!senhaEncriptada.includes(":")) {
      console.log("[descriptografarSenha] Senha não parece estar encriptada, usando como está");
      return senhaEncriptada;
    }

    // Formato: iv:conteúdo_encriptado
    const [ivHex, encryptedHex] = senhaEncriptada.split(":");
    
    const iv = Buffer.from(ivHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    
    // Criar chave de 32 bytes (256 bits) a partir do secret
    const key = crypto.scryptSync(secretKey, "salt", 32);
    
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString("utf8");
  } catch (error) {
    console.error("[descriptografarSenha] Erro ao descriptografar:", error);
    // Se falhar, retornar a senha original (pode não estar encriptada)
    return senhaEncriptada;
  }
}

export default ConsultarCertidaoService;
