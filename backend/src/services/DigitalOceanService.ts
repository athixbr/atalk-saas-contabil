import AWS from "aws-sdk";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import sharp from "sharp";
import { Stream } from "stream";

interface UploadOptions {
  companyId: number;
  folder: string;
  file: Express.Multer.File | Buffer;
  fileName?: string;
  isPublic?: boolean;
  generateThumbnail?: boolean;
}

interface UploadResult {
  path: string;
  url: string;
  size: number;
  mimeType: string;
  hash: string;
  thumbnailPath?: string;
}

class DigitalOceanService {
  private s3: AWS.S3;
  private bucketName: string;
  private cdnEndpoint: string;

  constructor() {
    // Configuração do Digital Ocean Spaces
    this.s3 = new AWS.S3({
      endpoint: process.env.DO_SPACES_ENDPOINT || "nyc3.digitaloceanspaces.com",
      accessKeyId: process.env.DO_SPACES_KEY,
      secretAccessKey: process.env.DO_SPACES_SECRET,
      s3ForcePathStyle: false,
      signatureVersion: "v4"
    });

    this.bucketName = process.env.DO_SPACES_BUCKET || "atalk";
    this.cdnEndpoint = process.env.DO_SPACES_CDN || `https://${this.bucketName}.nyc3.cdn.digitaloceanspaces.com`;
  }

  /**
   * Upload de arquivo para o Digital Ocean Spaces
   */
  async upload(options: UploadOptions): Promise<UploadResult> {
    const {
      companyId,
      folder,
      file,
      fileName,
      isPublic = false,
      generateThumbnail = false
    } = options;

    let fileBuffer: Buffer;
    let originalName: string;
    let mimeType: string;

    // Processar arquivo (Multer ou Buffer)
    if (Buffer.isBuffer(file)) {
      fileBuffer = file;
      originalName = fileName || "file";
      mimeType = "application/octet-stream";
    } else {
      fileBuffer = file.buffer;
      originalName = file.originalname;
      mimeType = file.mimetype;
    }

    // Gerar hash do arquivo
    const hash = crypto.createHash("md5").update(fileBuffer).digest("hex");

    // Gerar nome único
    const ext = path.extname(originalName);
    const uniqueName = fileName || `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;

    // Path no storage: company{id}/ged/{folder}/{filename}
    const filePath = `company${companyId}/ged/${folder}/${uniqueName}`;

    // Upload do arquivo principal
    await this.s3.putObject({
      Bucket: this.bucketName,
      Key: filePath,
      Body: fileBuffer,
      ContentType: mimeType,
      ACL: isPublic ? "public-read" : "private",
      Metadata: {
        originalName,
        hash,
        uploadedAt: new Date().toISOString()
      }
    }).promise();

    const url = isPublic ? `${this.cdnEndpoint}/${filePath}` : "";

    const result: UploadResult = {
      path: filePath,
      url,
      size: fileBuffer.length,
      mimeType,
      hash
    };

    // Gerar thumbnail se for imagem
    if (generateThumbnail && this.isImage(mimeType)) {
      const thumbnailPath = await this.generateThumbnail(
        fileBuffer,
        filePath,
        companyId
      );
      result.thumbnailPath = thumbnailPath;
    }

    return result;
  }

  /**
   * Download de arquivo
   */
  async download(filePath: string): Promise<Buffer> {
    const result = await this.s3.getObject({
      Bucket: this.bucketName,
      Key: filePath
    }).promise();

    return result.Body as Buffer;
  }

  /**
   * Stream de arquivo (para arquivos grandes)
   */
  getDownloadStream(filePath: string): Stream {
    return this.s3.getObject({
      Bucket: this.bucketName,
      Key: filePath
    }).createReadStream();
  }

  /**
   * Deletar arquivo
   */
  async delete(filePath: string): Promise<void> {
    await this.s3.deleteObject({
      Bucket: this.bucketName,
      Key: filePath
    }).promise();
  }

  /**
   * Deletar múltiplos arquivos
   */
  async deleteMany(filePaths: string[]): Promise<void> {
    if (filePaths.length === 0) return;

    await this.s3.deleteObjects({
      Bucket: this.bucketName,
      Delete: {
        Objects: filePaths.map(path => ({ Key: path }))
      }
    }).promise();
  }

  /**
   * Mover arquivo
   */
  async move(oldPath: string, newPath: string): Promise<void> {
    // Copiar para novo local
    await this.s3.copyObject({
      Bucket: this.bucketName,
      CopySource: `${this.bucketName}/${oldPath}`,
      Key: newPath
    }).promise();

    // Deletar arquivo antigo
    await this.delete(oldPath);
  }

  /**
   * Copiar arquivo
   */
  async copy(sourcePath: string, destPath: string): Promise<void> {
    await this.s3.copyObject({
      Bucket: this.bucketName,
      CopySource: `${this.bucketName}/${sourcePath}`,
      Key: destPath
    }).promise();
  }

  /**
   * Verificar se arquivo existe
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      await this.s3.headObject({
        Bucket: this.bucketName,
        Key: filePath
      }).promise();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obter metadados do arquivo
   */
  async getMetadata(filePath: string) {
    const result = await this.s3.headObject({
      Bucket: this.bucketName,
      Key: filePath
    }).promise();

    return {
      size: result.ContentLength,
      mimeType: result.ContentType,
      lastModified: result.LastModified,
      metadata: result.Metadata
    };
  }

  /**
   * Gerar URL assinada (para acesso temporário)
   */
  getSignedUrl(filePath: string, expiresIn: number = 3600): string {
    return this.s3.getSignedUrl("getObject", {
      Bucket: this.bucketName,
      Key: filePath,
      Expires: expiresIn
    });
  }

  /**
   * Gerar thumbnail de imagem
   */
  private async generateThumbnail(
    imageBuffer: Buffer,
    originalPath: string,
    companyId: number
  ): Promise<string> {
    try {
      // Criar thumbnail 300x300
      const thumbnailBuffer = await sharp(imageBuffer)
        .resize(300, 300, {
          fit: "inside",
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Path do thumbnail
      const pathParts = originalPath.split("/");
      const fileName = pathParts.pop();
      const thumbnailPath = `${pathParts.join("/")}/thumbnails/${fileName}`;

      // Upload do thumbnail
      await this.s3.putObject({
        Bucket: this.bucketName,
        Key: thumbnailPath,
        Body: thumbnailBuffer,
        ContentType: "image/jpeg",
        ACL: "private"
      }).promise();

      return thumbnailPath;
    } catch (error) {
      console.error("Erro ao gerar thumbnail:", error);
      return "";
    }
  }

  /**
   * Verificar se é imagem
   */
  private isImage(mimeType: string): boolean {
    return mimeType.startsWith("image/");
  }

  /**
   * Limpar arquivos antigos da lixeira (cron job)
   */
  async cleanupTrash(companyId: number, daysOld: number = 30): Promise<number> {
    const prefix = `company${companyId}/ged/trash/`;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const objects = await this.s3.listObjectsV2({
      Bucket: this.bucketName,
      Prefix: prefix
    }).promise();

    const toDelete = objects.Contents?.filter(obj => {
      return obj.LastModified && obj.LastModified < cutoffDate;
    }).map(obj => obj.Key!) || [];

    if (toDelete.length > 0) {
      await this.deleteMany(toDelete);
    }

    return toDelete.length;
  }

  /**
   * Obter uso de espaço por empresa
   */
  async getCompanyUsage(companyId: number): Promise<{ size: number; files: number }> {
    const prefix = `company${companyId}/ged/`;
    let totalSize = 0;
    let fileCount = 0;
    let continuationToken: string | undefined;

    do {
      const result = await this.s3.listObjectsV2({
        Bucket: this.bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken
      }).promise();

      if (result.Contents) {
        totalSize += result.Contents.reduce((sum, obj) => sum + (obj.Size || 0), 0);
        fileCount += result.Contents.length;
      }

      continuationToken = result.NextContinuationToken;
    } while (continuationToken);

    return { size: totalSize, files: fileCount };
  }
}

export default new DigitalOceanService();
