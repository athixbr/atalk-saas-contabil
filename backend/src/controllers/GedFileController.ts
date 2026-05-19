import { Request, Response } from "express";
import multer from "multer";
import crypto from "crypto";
import path from "path";
import GedFile from "../models/GedFile";
import GedFolder from "../models/GedFolder";
import GedFileVersion from "../models/GedFileVersion";
import GedActivityLog from "../models/GedActivityLog";
import User from "../models/User";
import DigitalOceanService from "../services/DigitalOceanService";
import TextExtractionService from "../services/TextExtractionService";
import AppError from "../errors/AppError";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
// Configuração do Multer para upload em memória
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const {
    folderId,
    search,
    searchInContent,
    tags,
    showDeleted,
    sortBy = "createdAt",
    sortOrder = "DESC",
    page = 1,
    limit = 50
  } = req.query;

  const whereCondition: any = {
    companyId,
    isDeleted: showDeleted === "true"
  };

  if (folderId) {
    whereCondition.folderId = folderId;
  }

  if (search) {
    const searchConditions: any[] = [
      { name: { [Op.like]: `%${search}%` } },
      { originalName: { [Op.like]: `%${search}%` } },
      { tags: { [Op.contains]: [search] } }
    ];

    // Se a busca no conteúdo estiver ativada, adicionar condição
    if (searchInContent === "true") {
      searchConditions.push({
        extractedText: { [Op.like]: `%${search}%` }
      });
    }

    whereCondition[Op.or] = searchConditions;
  }

  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    whereCondition.tags = { [Op.overlap]: tagArray };
  }

  const offset = (Number(page) - 1) * Number(limit);

  const { count, rows: files } = await GedFile.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email", "profileImage"]
      },
      {
        model: GedFolder,
        as: "folder",
        attributes: ["id", "name", "path"]
      }
    ],
    order: [[sortBy as string, sortOrder as string]],
    limit: Number(limit),
    offset
  });

  return res.json({
    files,
    total: count,
    page: Number(page),
    totalPages: Math.ceil(count / Number(limit))
  });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const file = await GedFile.findOne({
    where: {
      id,
      companyId
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email", "profileImage"]
      },
      {
        model: GedFolder,
        as: "folder",
        attributes: ["id", "name", "path"]
      },
      {
        model: GedFileVersion,
        as: "versions",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name"]
          }
        ],
        order: [["versionNumber", "DESC"]]
      }
    ]
  });

  if (!file) {
    throw new AppError("Arquivo não encontrado", 404);
  }

  return res.json(file);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const { folderId, tags, description } = req.body;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw new AppError("Nenhum arquivo enviado", 400);
  }

  if (!folderId) {
    throw new AppError("ID da pasta é obrigatório", 400);
  }

  // Verificar se a pasta existe
  const folder = await GedFolder.findOne({
    where: {
      id: folderId,
      companyId
    }
  });

  if (!folder) {
    throw new AppError("Pasta não encontrada", 404);
  }

  const uploadedFiles = [];

  for (const file of files) {
    try {
      const ext = path.extname(file.originalname);
      const nameWithoutExt = path.basename(file.originalname, ext);

      // Upload para Digital Ocean
      const uploadResult = await DigitalOceanService.upload({
        companyId,
        folder: `folders/${folderId}`,
        file,
        generateThumbnail: file.mimetype.startsWith("image/")
      });

      // Criar registro do arquivo
      const gedFile = await GedFile.create({
        folderId,
        companyId,
        userId,
        name: nameWithoutExt,
        originalName: file.originalname,
        extension: ext.replace(".", ""),
        mimeType: file.mimetype,
        size: file.size,
        path: uploadResult.path,
        url: uploadResult.url,
        thumbnailPath: uploadResult.thumbnailPath,
        hash: uploadResult.hash,
        tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
        metadata: {
          uploadedFrom: "web",
          description: description || ""
        }
      });

      // Extrair texto do arquivo se suportado (assíncrono, não bloqueia)
      if (TextExtractionService.supportsTextExtraction(file.mimetype)) {
        TextExtractionService.extractText(file.buffer, file.mimetype)
          .then(async (extractedText) => {
            if (extractedText) {
              await gedFile.update({
                extractedText,
                textExtractedAt: new Date()
              });
            }
          })
          .catch((error) => {
            console.error("Erro ao extrair texto:", error);
          });
      }

      // Criar primeira versão
      await GedFileVersion.create({
        fileId: gedFile.id,
        companyId,
        userId,
        versionNumber: 1,
        name: file.originalname,
        path: uploadResult.path,
        size: file.size,
        hash: uploadResult.hash,
        isCurrent: true
      });

      // Log da atividade
      await GedActivityLog.create({
        companyId,
        userId,
        entityType: "file",
        entityId: gedFile.id,
        action: "upload",
        details: {
          fileName: file.originalname,
          size: file.size,
          folderId,
          folderName: folder.name
        },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      });

      uploadedFiles.push(gedFile);
    } catch (error) {
      console.error(`Erro ao fazer upload de ${file.originalname}:`, error);
      // Continua com os outros arquivos
    }
  }

  return res.status(201).json({
    message: `${uploadedFiles.length} arquivo(s) enviado(s) com sucesso`,
    files: uploadedFiles
  });
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId, id: userId } = req.user;
  const { name, tags, metadata } = req.body;

  const file = await GedFile.findOne({
    where: {
      id,
      companyId,
      isDeleted: false
    }
  });

  if (!file) {
    throw new AppError("Arquivo não encontrado", 404);
  }

  const oldData = { ...file.toJSON() };

  await file.update({
    name: name || file.name,
    tags: tags || file.tags,
    metadata: metadata ? { ...file.metadata, ...metadata } : file.metadata
  });

  // Log da atividade
  await GedActivityLog.create({
    companyId,
    userId,
    entityType: "file",
    entityId: file.id,
    action: "update",
    details: {
      oldData,
      newData: file.toJSON()
    },
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });

  return res.json(file);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId, id: userId } = req.user;
  const { permanent } = req.query;

  const file = await GedFile.findOne({
    where: {
      id,
      companyId
    }
  });

  if (!file) {
    throw new AppError("Arquivo não encontrado", 404);
  }

  if (permanent === "true") {
    // Exclusão permanente
    // Deletar arquivo do Digital Ocean
    try {
      await DigitalOceanService.delete(file.path);
      
      // Deletar thumbnail se existir
      if (file.thumbnailPath) {
        await DigitalOceanService.delete(file.thumbnailPath);
      }

      // Deletar todas as versões
      const versions = await GedFileVersion.findAll({
        where: { fileId: file.id }
      });

      for (const version of versions) {
        if (version.path !== file.path) {
          await DigitalOceanService.delete(version.path);
        }
      }
    } catch (error) {
      console.error("Erro ao deletar arquivos do storage:", error);
    }

    await file.destroy();

    // Log da atividade
    await GedActivityLog.create({
      companyId,
      userId,
      entityType: "file",
      entityId: file.id,
      action: "delete",
      details: {
        fileName: file.name,
        permanent: true
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });

    return res.json({ message: "Arquivo deletado permanentemente" });
  } else {
    // Soft delete - mover para lixeira
    const restoreUntil = new Date();
    restoreUntil.setDate(restoreUntil.getDate() + 30); // 30 dias na lixeira

    await file.update({
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: userId,
      restoreUntil
    });

    // Mover arquivo no storage para pasta trash
    const oldPath = file.path;
    const newPath = oldPath.replace("/folders/", "/trash/");
    
    try {
      await DigitalOceanService.move(oldPath, newPath);
      await file.update({ path: newPath });
    } catch (error) {
      console.error("Erro ao mover arquivo para lixeira:", error);
    }

    // Log da atividade
    await GedActivityLog.create({
      companyId,
      userId,
      entityType: "file",
      entityId: file.id,
      action: "delete",
      details: {
        fileName: file.name,
        restoreUntil
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });

    return res.json({ message: "Arquivo movido para lixeira" });
  }
};

export const restore = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId, id: userId } = req.user;

  const file = await GedFile.findOne({
    where: {
      id,
      companyId,
      isDeleted: true
    }
  });

  if (!file) {
    throw new AppError("Arquivo não encontrado na lixeira", 404);
  }

  // Verificar se ainda está dentro do prazo de restauração
  if (file.restoreUntil && new Date() > file.restoreUntil) {
    throw new AppError("Prazo para restauração expirado", 400);
  }

  // Mover arquivo de volta
  const oldPath = file.path;
  const newPath = oldPath.replace("/trash/", "/folders/");
  
  try {
    await DigitalOceanService.move(oldPath, newPath);
  } catch (error) {
    console.error("Erro ao restaurar arquivo:", error);
    throw new AppError("Erro ao restaurar arquivo", 500);
  }

  await file.update({
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
    restoreUntil: null,
    path: newPath
  });

  // Log da atividade
  await GedActivityLog.create({
    companyId,
    userId,
    entityType: "file",
    entityId: file.id,
    action: "restore",
    details: {
      fileName: file.name
    },
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });

  return res.json({ message: "Arquivo restaurado com sucesso", file });
};

export const download = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { companyId, id: userId } = req.user;

  const file = await GedFile.findOne({
    where: {
      id,
      companyId
    }
  });

  if (!file) {
    throw new AppError("Arquivo não encontrado", 404);
  }

  try {
    // Incrementar contador de downloads
    await file.increment("downloads");
    await file.update({ lastAccessedAt: new Date() });

    // Log da atividade
    await GedActivityLog.create({
      companyId,
      userId,
      entityType: "file",
      entityId: file.id,
      action: "download",
      details: {
        fileName: file.name
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });

    // Stream do arquivo
    const fileStream = DigitalOceanService.getDownloadStream(file.path);

    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${file.originalName}"`);
    res.setHeader("Content-Length", file.size);

    fileStream.pipe(res);
  } catch (error) {
    console.error("Erro ao fazer download:", error);
    throw new AppError("Erro ao fazer download do arquivo", 500);
  }
};

export const preview = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { companyId, id: userId } = req.user;

  const file = await GedFile.findOne({
    where: {
      id,
      companyId
    }
  });

  if (!file) {
    throw new AppError("Arquivo não encontrado", 404);
  }

  try {
    // Atualizar último acesso
    await file.update({ lastAccessedAt: new Date() });

    // Log da atividade
    await GedActivityLog.create({
      companyId,
      userId,
      entityType: "file",
      entityId: file.id,
      action: "preview",
      details: {
        fileName: file.name
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });

    // Stream do arquivo sem forçar download
    const fileStream = DigitalOceanService.getDownloadStream(file.path);

    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${file.originalName}"`);
    res.setHeader("Content-Length", file.size);

    fileStream.pipe(res);
  } catch (error) {
    console.error("Erro ao visualizar arquivo:", error);
    throw new AppError("Erro ao visualizar arquivo", 500);
  }
};

export const move = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { targetFolderId } = req.body;
  const { companyId, id: userId } = req.user;

  const file = await GedFile.findOne({
    where: {
      id,
      companyId,
      isDeleted: false
    },
    include: [{ model: GedFolder, as: "folder" }]
  });

  if (!file) {
    throw new AppError("Arquivo não encontrado", 404);
  }

  // Verificar se a pasta destino existe
  const targetFolder = await GedFolder.findOne({
    where: {
      id: targetFolderId,
      companyId
    }
  });

  if (!targetFolder) {
    throw new AppError("Pasta destino não encontrada", 404);
  }

  const oldFolderId = file.folderId;
  const oldFolderName = file.folder.name;

  await file.update({ folderId: targetFolderId });

  // Log da atividade
  await GedActivityLog.create({
    companyId,
    userId,
    entityType: "file",
    entityId: file.id,
    action: "move",
    details: {
      fileName: file.name,
      fromFolderId: oldFolderId,
      fromFolderName: oldFolderName,
      toFolderId: targetFolderId,
      toFolderName: targetFolder.name
    },
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });

  return res.json(file);
};

export const copy = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { targetFolderId, newName } = req.body;
  const { companyId, id: userId } = req.user;

  const originalFile = await GedFile.findOne({
    where: {
      id,
      companyId,
      isDeleted: false
    }
  });

  if (!originalFile) {
    throw new AppError("Arquivo não encontrado", 404);
  }

  // Copiar arquivo no storage
  const newPath = originalFile.path.replace(
    `/folders/${originalFile.folderId}/`,
    `/folders/${targetFolderId}/`
  );

  await DigitalOceanService.copy(originalFile.path, newPath);

  // Criar novo registro
  const copiedFile = await GedFile.create({
    ...originalFile.toJSON(),
    id: undefined,
    folderId: targetFolderId,
    userId,
    name: newName || `${originalFile.name} (cópia)`,
    path: newPath,
    currentVersion: 1,
    downloads: 0,
    isFavorite: false,
    createdAt: undefined,
    updatedAt: undefined
  });

  // Log da atividade
  await GedActivityLog.create({
    companyId,
    userId,
    entityType: "file",
    entityId: copiedFile.id,
    action: "copy",
    details: {
      originalFileId: originalFile.id,
      fileName: copiedFile.name
    },
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });

  return res.status(201).json(copiedFile);
};

export const toggleFavorite = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId, id: userId } = req.user;

  const file = await GedFile.findOne({
    where: {
      id,
      companyId
    }
  });

  if (!file) {
    throw new AppError("Arquivo não encontrado", 404);
  }

  const newFavoriteStatus = !file.isFavorite;
  await file.update({ isFavorite: newFavoriteStatus });

  // Log da atividade
  await GedActivityLog.create({
    companyId,
    userId,
    entityType: "file",
    entityId: file.id,
    action: newFavoriteStatus ? "favorite" : "unfavorite",
    details: {
      fileName: file.name
    },
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });

  return res.json({ isFavorite: newFavoriteStatus });
};

// Continua no próximo arquivo...
