import Certidao from "../../models/Certidao";
import Cliente from "../../models/Cliente";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
import ConsultarCertidaoService from "./ConsultarCertidaoService";

interface ReprocessarCertidoesResponse {
  total: number;
  sucesso: number;
  erro: number;
  certidoes: Array<{
    id: number;
    categoria: string;
    cliente: string;
    status: "sucesso" | "erro";
    mensagem: string;
  }>;
}

/**
 * Busca e reprocessa certidões com erro que estão prontas para nova tentativa
 */
const ReprocessarCertidoesService = async (
  companyId: number
): Promise<ReprocessarCertidoesResponse> => {
  const agora = new Date();
  const maxTentativas = parseInt(process.env.INFOSIMPLES_RETRY_ATTEMPTS || "3", 10);

  // Buscar certidões elegíveis para reprocessamento
  const certidoesParaReprocessar = await Certidao.findAll({
    where: {
      companyId,
      status: "erro",
      proximaTentativa: {
        [Op.lte]: agora
      },
      tentativasRealizadas: {
        [Op.lt]: maxTentativas
      }
    },
    include: [
      {
        model: Cliente,
        as: "cliente",
        attributes: ["id", "nome", "tipoCliente", "cpf", "cnpj"]
      }
    ],
    limit: 50 // Processar no máximo 50 por vez
  });

  console.log(
    `[Reprocessamento] Encontradas ${certidoesParaReprocessar.length} certidões para reprocessar`
  );

  const resultado: ReprocessarCertidoesResponse = {
    total: certidoesParaReprocessar.length,
    sucesso: 0,
    erro: 0,
    certidoes: []
  };

  for (const certidao of certidoesParaReprocessar) {
    try {
      console.log(
        `[Reprocessamento] Tentativa ${certidao.tentativasRealizadas + 1}/${maxTentativas} ` +
        `para certidão ${certidao.id} (${certidao.categoria})`
      );

      const response = await ConsultarCertidaoService({
        clienteId: certidao.clienteId,
        companyId: certidao.companyId,
        categoria: certidao.categoria,
        tentativa: certidao.tentativasRealizadas + 1
      });

      if (response.sucesso) {
        resultado.sucesso++;
        resultado.certidoes.push({
          id: certidao.id,
          categoria: certidao.categoria,
          cliente: certidao.cliente?.nome || "N/A",
          status: "sucesso",
          mensagem: response.mensagem
        });
      } else {
        resultado.erro++;
        resultado.certidoes.push({
          id: certidao.id,
          categoria: certidao.categoria,
          cliente: certidao.cliente?.nome || "N/A",
          status: "erro",
          mensagem: response.mensagem
        });
      }

      // Aguardar 2 segundos entre requisições para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error: any) {
      console.error(
        `[Reprocessamento] Erro ao reprocessar certidão ${certidao.id}:`,
        error.message
      );
      
      resultado.erro++;
      resultado.certidoes.push({
        id: certidao.id,
        categoria: certidao.categoria,
        cliente: certidao.cliente?.nome || "N/A",
        status: "erro",
        mensagem: error.message
      });
    }
  }

  console.log(
    `[Reprocessamento] Finalizado: ${resultado.sucesso} sucesso, ${resultado.erro} erro`
  );

  return resultado;
};

/**
 * Reprocessa uma certidão específica manualmente
 */
const ReprocessarCertidaoManualService = async (
  certidaoId: number,
  companyId: number
): Promise<{ sucesso: boolean; mensagem: string }> => {
  const certidao = await Certidao.findOne({
    where: { id: certidaoId, companyId },
    include: [
      {
        model: Cliente,
        as: "cliente"
      }
    ]
  });

  if (!certidao) {
    return {
      sucesso: false,
      mensagem: "Certidão não encontrada"
    };
  }

  if (certidao.status !== "erro") {
    return {
      sucesso: false,
      mensagem: "Apenas certidões com erro podem ser reprocessadas"
    };
  }

  const maxTentativas = parseInt(process.env.INFOSIMPLES_RETRY_ATTEMPTS || "3", 10);
  
  if (certidao.tentativasRealizadas >= maxTentativas) {
    return {
      sucesso: false,
      mensagem: `Número máximo de tentativas (${maxTentativas}) já foi atingido`
    };
  }

  try {
    const response = await ConsultarCertidaoService({
      clienteId: certidao.clienteId,
      companyId: certidao.companyId,
      categoria: certidao.categoria,
      tentativa: certidao.tentativasRealizadas + 1
    });

    return {
      sucesso: response.sucesso,
      mensagem: response.mensagem
    };
  } catch (error: any) {
    return {
      sucesso: false,
      mensagem: error.message
    };
  }
};

export { ReprocessarCertidoesService, ReprocessarCertidaoManualService };
