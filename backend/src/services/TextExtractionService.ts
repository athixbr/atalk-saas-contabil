import mammoth from "mammoth";
import fs from "fs";
import { promisify } from "util";
import axios from "axios";
import { createRequire } from "module";
const _require = createRequire(import.meta.url);
// @ts-ignore
const pdfParse = _require("pdf-parse");
const readFile = promisify(fs.readFile);

/**
 * Serviço para extração de texto de diversos formatos de arquivo
 */
class TextExtractionService {
  /**
   * Extrai texto de um arquivo PDF
   */
  async extractFromPdf(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      console.error("Erro ao extrair texto do PDF:", error);
      return "";
    }
  }

  /**
   * Extrai texto de um arquivo Word (.docx)
   */
  async extractFromDocx(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      console.error("Erro ao extrair texto do Word:", error);
      return "";
    }
  }

  /**
   * Extrai texto de um arquivo de texto simples
   */
  async extractFromText(buffer: Buffer): Promise<string> {
    try {
      return buffer.toString("utf-8");
    } catch (error) {
      console.error("Erro ao extrair texto:", error);
      return "";
    }
  }

  /**
   * Baixa arquivo do Digital Ocean e extrai texto
   */
  async extractFromUrl(url: string, mimeType: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer"
      });
      
      const buffer = Buffer.from(response.data);
      return await this.extractText(buffer, mimeType);
    } catch (error) {
      console.error("Erro ao baixar e extrair texto:", error);
      return "";
    }
  }

  /**
   * Extrai texto de um arquivo baseado no tipo MIME
   */
  async extractText(buffer: Buffer, mimeType: string): Promise<string> {
    // PDF
    if (mimeType === "application/pdf") {
      return await this.extractFromPdf(buffer);
    }

    // Word
    if (
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword"
    ) {
      return await this.extractFromDocx(buffer);
    }

    // Texto simples
    if (
      mimeType?.startsWith("text/") ||
      ["application/json", "application/xml", "application/javascript"].includes(mimeType)
    ) {
      return await this.extractFromText(buffer);
    }

    // CSV (tratar como texto)
    if (mimeType === "text/csv" || mimeType === "application/csv") {
      return await this.extractFromText(buffer);
    }

    return "";
  }

  /**
   * Verifica se o tipo de arquivo suporta extração de texto
   */
  supportsTextExtraction(mimeType: string): boolean {
    const supportedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/",
      "application/json",
      "application/xml",
      "application/javascript",
      "text/csv",
      "application/csv"
    ];

    return supportedTypes.some(type => mimeType?.startsWith(type) || mimeType === type);
  }

  /**
   * Normaliza texto para busca (remove acentos, converte para minúsculas)
   */
  normalizeForSearch(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  /**
   * Busca termo no texto extraído
   */
  searchInText(text: string, searchTerm: string): boolean {
    const normalizedText = this.normalizeForSearch(text);
    const normalizedSearch = this.normalizeForSearch(searchTerm);
    return normalizedText.includes(normalizedSearch);
  }

  /**
   * Busca termo e retorna trechos destacados
   */
  searchWithContext(text: string, searchTerm: string, contextLength: number = 100): string[] {
    const normalizedText = this.normalizeForSearch(text);
    const normalizedSearch = this.normalizeForSearch(searchTerm);
    
    const results: string[] = [];
    let position = 0;

    while (position < normalizedText.length) {
      const index = normalizedText.indexOf(normalizedSearch, position);
      if (index === -1) break;

      // Pegar contexto ao redor
      const start = Math.max(0, index - contextLength);
      const end = Math.min(text.length, index + searchTerm.length + contextLength);
      
      let excerpt = text.substring(start, end);
      if (start > 0) excerpt = "..." + excerpt;
      if (end < text.length) excerpt = excerpt + "...";

      results.push(excerpt);
      position = index + searchTerm.length;

      // Limitar a 3 resultados
      if (results.length >= 3) break;
    }

    return results;
  }
}

export default new TextExtractionService();
