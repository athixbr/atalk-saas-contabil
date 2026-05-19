import { CampoTemplate } from "../models/TemplateLeitura";

interface TemplateCompleto {
  id: number;
  nome: string;
  tipo: string;
  campos: CampoTemplate[];
  validacoes?: any;
}

interface ParseResult {
  dados: any;
  confianca: number;
  camposEncontrados: number;
  totalCampos: number;
  camposFaltantes: string[];
}

class DocumentParserService {
  /**
   * Extrair dados do texto usando template
   */
  extractData(text: string, template: TemplateCompleto): ParseResult {
    const resultado: any = {};
    let confiancaTotal = 0;
    let camposEncontrados = 0;
    const camposFaltantes: string[] = [];

    // Pré-processar texto
    const textProcessed = this.preprocessText(text);

    template.campos.forEach(campo => {
      try {
        const regex = new RegExp(campo.regex, "gim");
        const regexCaptura = new RegExp(campo.regex, "im");

        // Tentar encontrar o campo no texto
        const match = textProcessed.match(regexCaptura);

        if (match && match[1] !== undefined) {
          let valor = match[1].trim();

          // Transformar valor baseado no tipo
          valor = this.transformValue(valor, campo.tipo);

          resultado[campo.nome] = valor;
          camposEncontrados++;
          confiancaTotal += 1;
        } else {
          resultado[campo.nome] = null;

          if (campo.obrigatorio) {
            camposFaltantes.push(campo.nome);
            confiancaTotal += 0;
          } else {
            // Campo opcional não afeta tanto a confiança
            confiancaTotal += 0.5;
          }
        }
      } catch (error) {
        console.error(`Erro ao processar campo ${campo.nome}:`, error);
        resultado[campo.nome] = null;
        if (campo.obrigatorio) {
          camposFaltantes.push(campo.nome);
        }
      }
    });

    // Calcular confiança geral
    const confianca =
      template.campos.length > 0 ? confiancaTotal / template.campos.length : 0;

    return {
      dados: resultado,
      confianca,
      camposEncontrados,
      totalCampos: template.campos.length,
      camposFaltantes
    };
  }

  /**
   * Transformar valor baseado no tipo
   */
  private transformValue(valor: string, tipo: string): any {
    switch (tipo) {
      case "number":
        const num = valor.replace(/[^\d.-]/g, "");
        return num ? parseFloat(num) : null;

      case "currency":
        // R$ 1.500,50 -> 1500.50
        // Também aceita: 1500.50, 1.500,50, etc
        const currency = valor
          .replace(/[^\d,.-]/g, "") // Remove tudo exceto números, vírgula, ponto e hífen
          .replace(/\./g, "") // Remove pontos (separador de milhar)
          .replace(",", "."); // Vírgula vira ponto decimal
        return currency ? parseFloat(currency) : null;

      case "date":
        // Tentar vários formatos de data brasileira
        // 15/03/2026, 15-03-2026, 15.03.2026
        const datePatterns = [
          /(\d{2})[-\/\.](\d{2})[-\/\.](\d{4})/, // dd/mm/yyyy
          /(\d{4})[-\/\.](\d{2})[-\/\.](\d{2})/ // yyyy-mm-dd
        ];

        for (const pattern of datePatterns) {
          const match = valor.match(pattern);
          if (match) {
            // Verificar se é dd/mm/yyyy ou yyyy-mm-dd
            if (match[1].length === 4) {
              // yyyy-mm-dd
              return `${match[1]}-${match[2]}-${match[3]}`;
            } else {
              // dd/mm/yyyy -> yyyy-mm-dd
              return `${match[3]}-${match[2]}-${match[1]}`;
            }
          }
        }
        return valor;

      case "cpf":
        // Remove formatação: 123.456.789-00 -> 12345678900
        const cpf = valor.replace(/[^\d]/g, "");
        return cpf.length === 11 ? cpf : null;

      case "cnpj":
        // Remove formatação: 12.345.678/0001-00 -> 12345678000100
        const cnpj = valor.replace(/[^\d]/g, "");
        return cnpj.length === 14 ? cnpj : null;

      case "barcode":
        // Código de barras: apenas números, remove espaços
        const barcode = valor.replace(/\s/g, "").replace(/[^\d]/g, "");
        return barcode || null;

      case "email":
        // Extrair email válido
        const emailMatch = valor.match(/[\w.-]+@[\w.-]+\.\w+/);
        return emailMatch ? emailMatch[0] : null;

      default:
        return valor;
    }
  }

  /**
   * Validar dados extraídos
   */
  validateData(
    dados: any,
    template: TemplateCompleto
  ): { valido: boolean; erros: string[] } {
    const erros: string[] = [];

    // Validar campos obrigatórios
    template.campos.forEach(campo => {
      if (campo.obrigatorio && !dados[campo.nome]) {
        erros.push(
          `Campo obrigatório não encontrado ou inválido: ${campo.nome}`
        );
      }
    });

    // Validar tipos específicos
    if (dados.cpf && dados.cpf.length !== 11) {
      erros.push("CPF inválido (deve ter 11 dígitos)");
    }

    if (dados.cnpj && dados.cnpj.length !== 14) {
      erros.push("CNPJ inválido (deve ter 14 dígitos)");
    }

    if (dados.email && !this.isValidEmail(dados.email)) {
      erros.push("Email inválido");
    }

    // Validações customizadas do template
    if (template.validacoes) {
      // Implementar validações específicas por template
      // Ex: valor mínimo, data futura, etc
    }

    return {
      valido: erros.length === 0,
      erros
    };
  }

  /**
   * Pré-processar texto
   */
  private preprocessText(text: string): string {
    return text
      .replace(/\r\n/g, "\n")
      .replace(/\t/g, " ")
      .replace(/ {2,}/g, " ")
      .trim();
  }

  /**
   * Validar email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[\w.-]+@[\w.-]+\.\w+$/;
    return emailRegex.test(email);
  }

  /**
   * Tentar detectar automaticamente o tipo de documento
   */
  detectDocumentType(text: string): string | null {
    const textLower = text.toLowerCase();

    // Palavras-chave para identificar documentos
    const patterns = {
      guia_fgts: ["fgts", "fundo de garantia", "grfgts", "guia fgts"],
      guia_inss: ["gps", "inss", "previdência social", "guia da previdência"],
      darf: ["darf", "documento de arrecadação", "receita federal"],
      certidao_negativa: [
        "certidão negativa",
        "certidao negativa",
        "nada consta"
      ],
      boleto: ["boleto", "código de barras", "nosso número"],
      nfe: ["nota fiscal eletrônica", "nfe", "nf-e", "danfe"],
      contrato: ["contrato", "contratante", "contratado", "cláusula"]
    };

    for (const [tipo, keywords] of Object.entries(patterns)) {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        return tipo;
      }
    }

    return null;
  }
}

export default new DocumentParserService();
