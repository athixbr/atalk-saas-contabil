import axios, { AxiosInstance, AxiosResponse } from "axios";
import AppError from "../../errors/AppError";

interface InfoSimplesConfig {
  apiUrl: string;
  apiToken: string;
  timeout: number;
}

interface ConsultaRequest {
  cnpj?: string;
  cpf?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  [key: string]: any;
}

interface ConsultaResponse {
  code: number;
  code_message: string;
  data?: any;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

class InfoSimplesService {
  private client: AxiosInstance;
  private config: InfoSimplesConfig;

  constructor() {
    this.config = {
      apiUrl: process.env.INFOSIMPLES_API_URL || "https://api.infosimples.com/api/v2",
      apiToken: process.env.INFOSIMPLES_API_TOKEN || "",
      timeout: parseInt(process.env.INFOSIMPLES_TIMEOUT || "60000", 10)
    };

    if (!this.config.apiToken) {
      console.warn("⚠️ INFOSIMPLES_API_TOKEN não configurado no .env");
    }

    this.client = axios.create({
      baseURL: this.config.apiUrl,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });

    // Interceptor para adicionar token em todas as requisições
    this.client.interceptors.request.use(
      (config) => {
        if (this.config.apiToken) {
          config.params = {
            ...config.params,
            token: this.config.apiToken
          };
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Realiza consulta na API Info Simples
   */
  async consultar(
    endpoint: string,
    params: ConsultaRequest
  ): Promise<ConsultaResponse> {
    const startTime = Date.now();

    try {
      console.log(`[InfoSimples] Consultando: ${endpoint}`);
      console.log(`[InfoSimples] Params:`, JSON.stringify(params));

      const response: AxiosResponse<ConsultaResponse> = await this.client.post(
        endpoint,
        params
      );

      const tempoResposta = Date.now() - startTime;
      console.log(`[InfoSimples] Resposta recebida em ${tempoResposta}ms`);

      return {
        ...response.data,
        tempoResposta
      } as any;

    } catch (error: any) {
      const tempoResposta = Date.now() - startTime;
      console.error(`[InfoSimples] Erro após ${tempoResposta}ms:`, error.message);

      // Erro de timeout
      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        throw new AppError("Timeout ao consultar API Info Simples", 504);
      }

      // Erro de rede
      if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
        throw new AppError("Erro de conexão com API Info Simples", 503);
      }

      // Erro da API
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 401 || status === 403) {
          throw new AppError("Token da API Info Simples inválido ou expirado", 401);
        }

        if (status === 402) {
          throw new AppError("Saldo insuficiente na API Info Simples", 402);
        }

        if (status === 429) {
          throw new AppError("Limite de requisições excedido na API Info Simples", 429);
        }

        // Retornar erro estruturado da API
        return {
          code: status,
          code_message: data?.code_message || "Erro na API",
          errors: data?.errors || [],
          data: data
        };
      }

      // Erro genérico
      throw new AppError(`Erro ao consultar API Info Simples: ${error.message}`, 500);
    }
  }

  /**
   * Baixa PDF de certidão
   */
  async baixarPdf(url: string): Promise<Buffer> {
    try {
      console.log(`[InfoSimples] Baixando PDF: ${url}`);

      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 30000
      });

      console.log(`[InfoSimples] PDF baixado com sucesso`);
      return Buffer.from(response.data);

    } catch (error: any) {
      console.error(`[InfoSimples] Erro ao baixar PDF:`, error.message);
      throw new AppError("Erro ao baixar PDF da certidão", 500);
    }
  }

  /**
   * Verifica saldo disponível na conta (se API suportar)
   */
  async verificarSaldo(): Promise<{ saldo: number; moeda: string } | null> {
    try {
      // Endpoint para verificar saldo (se disponível na API)
      const response = await this.client.get("/saldo");
      
      return {
        saldo: response.data.saldo || 0,
        moeda: "BRL"
      };
    } catch (error) {
      console.warn("[InfoSimples] Não foi possível verificar saldo");
      return null;
    }
  }

  /**
   * Valida se o token está configurado
   */
  isConfigured(): boolean {
    return !!this.config.apiToken && this.config.apiToken !== "seu_token_aqui_apos_criar_conta";
  }

  /**
   * Retorna configuração atual (sem expor token)
   */
  getConfig(): Omit<InfoSimplesConfig, "apiToken"> {
    return {
      apiUrl: this.config.apiUrl,
      timeout: this.config.timeout
    };
  }
}

export default new InfoSimplesService();
