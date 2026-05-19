import { createRequire } from "module";
const _require = createRequire(import.meta.url);
const pdfParse = _require("pdf-parse");
import textract from "textract";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import os from "os";

const textractFromFile = promisify(textract.fromFileWithPath);

interface ExtractionResult {
  text: string;
  confidence: number;
  metadata?: any;
}

class DocumentReaderService {
  /**
   * Extrair texto de PDF
   */
  async extractTextFromPDF(fileBuffer: Buffer): Promise<ExtractionResult> {
    try {
      // @ts-ignore - pdf-parse tem problema com tipos
      const data = await pdfParse(fileBuffer);

      return {
        text: data.text,
        confidence: 1.0, // PDF sempre tem texto confiável se conseguiu extrair
        metadata: {
          pages: data.numpages,
          info: data.info,
          version: data.version
        }
      };
    } catch (error) {
      throw new Error(`Erro ao extrair texto do PDF: ${error.message}`);
    }
  }

  /**
   * Extrair texto de imagem usando OCR (Textract)
   */
  async extractTextFromImage(
    fileBuffer: Buffer,
    originalName: string
  ): Promise<ExtractionResult> {
    // Textract precisa de um arquivo físico, criar temporário
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(
      tempDir,
      `ocr-${Date.now()}-${originalName}`
    );

    try {
      // Salvar buffer em arquivo temporário
      fs.writeFileSync(tempFilePath, fileBuffer);

      // Executar OCR
      const text = await textractFromFile(tempFilePath, {
        preserveLineBreaks: true
      });

      return {
        text,
        confidence: 0.85, // OCR geralmente tem menor confiança
        metadata: {
          method: "textract-ocr"
        }
      };
    } catch (error) {
      throw new Error(`Erro no OCR: ${error.message}`);
    } finally {
      // Limpar arquivo temporário
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      } catch (cleanupError) {
        console.error("Erro ao limpar arquivo temporário:", cleanupError);
      }
    }
  }

  /**
   * Extrair texto (detecta tipo automaticamente)
   */
  async extractText(
    fileBuffer: Buffer,
    mimeType: string,
    originalName: string
  ): Promise<ExtractionResult> {
    if (mimeType === "application/pdf") {
      return this.extractTextFromPDF(fileBuffer);
    } else if (mimeType.startsWith("image/")) {
      return this.extractTextFromImage(fileBuffer, originalName);
    } else {
      throw new Error(`Tipo de arquivo não suportado: ${mimeType}`);
    }
  }

  /**
   * Verificar se arquivo é suportado
   */
  isSupportedFileType(mimeType: string): boolean {
    const supportedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/tiff",
      "image/bmp"
    ];

    return supportedTypes.includes(mimeType);
  }

  /**
   * Pré-processar texto extraído
   * Remove caracteres especiais, normaliza espaços, etc
   */
  preprocessText(text: string): string {
    return text
      .replace(/\r\n/g, "\n") // Normalizar quebras de linha
      .replace(/\t/g, " ") // Tabs para espaços
      .replace(/ {2,}/g, " ") // Múltiplos espaços para um
      .trim();
  }
}

export default new DocumentReaderService();
