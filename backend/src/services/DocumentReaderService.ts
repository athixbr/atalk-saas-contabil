import { createRequire } from "module";
const _require = createRequire(import.meta.url);
const pdfParse = _require("pdf-parse");
import textract from "textract";
import tesseract from "tesseract.js";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import os from "os";

const { recognize } = tesseract;
const textractFromFile = promisify(textract.fromFileWithPath);
const tesseractLangRoot = path.resolve(
  process.cwd(),
  "node_modules/@tesseract.js-data"
);
const tesseractLangPath = path.join(os.tmpdir(), "atalk-tesseract-lang");
const tesseractCachePath = path.join(os.tmpdir(), "atalk-tesseract-cache");

interface ExtractionResult {
  text: string;
  confidence: number;
  metadata?: any;
}

class DocumentReaderService {
  private ensureTesseractLanguageFiles(): string {
    fs.mkdirSync(tesseractLangPath, { recursive: true });
    fs.mkdirSync(tesseractCachePath, { recursive: true });

    ["por", "eng"].forEach(language => {
      const source = path.join(
        tesseractLangRoot,
        language,
        "4.0.0_best_int",
        `${language}.traineddata.gz`
      );
      const target = path.join(tesseractLangPath, `${language}.traineddata.gz`);

      if (!fs.existsSync(target) && fs.existsSync(source)) {
        fs.copyFileSync(source, target);
      }
    });

    return tesseractLangPath;
  }

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
    try {
      const result = await recognize(fileBuffer, "por+eng", {
        langPath: this.ensureTesseractLanguageFiles(),
        cachePath: tesseractCachePath,
        gzip: true
      });
      const text = result?.data?.text || "";
      const confidence = Number(result?.data?.confidence || 0) / 100;

      if (text.trim()) {
        return {
          text,
          confidence: confidence || 0.75,
          metadata: {
            method: "tesseract-js",
            originalConfidence: result?.data?.confidence
          }
        };
      }
    } catch (tesseractError) {
      console.error("Erro no OCR com tesseract.js:", tesseractError);
    }

    // Textract precisa de um arquivo físico, criar temporário
    const tempDir = os.tmpdir();
    const safeName = originalName.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const tempFilePath = path.join(
      tempDir,
      `ocr-${Date.now()}-${safeName}`
    );

    try {
      // Salvar buffer em arquivo temporário
      fs.writeFileSync(tempFilePath, fileBuffer);

      // Executar OCR
      const text = await textractFromFile(tempFilePath, {
        preserveLineBreaks: true
      });

      if (String(text || "").trim()) {
        return {
          text,
          confidence: 0.65,
          metadata: {
            method: "textract-ocr"
          }
        };
      }

      throw new Error("OCR não encontrou texto na imagem");
    } catch (error) {
      throw new Error(
        `Erro no OCR da imagem. Verifique se a imagem está legível ou envie em PDF. Detalhes: ${error.message}`
      );
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
