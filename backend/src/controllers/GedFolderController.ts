import { Request, Response } from "express";
import GedFolder from "../models/GedFolder";
import GedFile from "../models/GedFile";
import GedActivityLog from "../models/GedActivityLog";
import User from "../models/User";
import AppError from "../errors/AppError";
import __cjs_sequelize from "sequelize";
const { Op } = __cjs_sequelize;
interface FolderData {
  name: string;
  parentId?: number;
  type?: string;
  clientId?: number;
  departmentId?: number;
  description?: string;
  color?: string;
  icon?: string;
  isPublic?: boolean;
  permissions?: object;
  path?: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const { parentId, type, showAll } = req.query;

  const whereCondition: any = {
    companyId
  };

  // Filtrar por pasta pai
  if (parentId !== undefined) {
    whereCondition.parentId = parentId === "null" || parentId === "" ? null : parentId;
  }

  // Filtrar por tipo
  if (type) {
    whereCondition.type = type;
  }

  // Se não for admin, filtrar por permissões
  if (req.user.profile !== "admin" && !showAll) {
    whereCondition[Op.or] = [
      { userId }, // Pastas criadas pelo usuário
      { isPublic: true }, // Pastas públicas
      // TODO: Adicionar verificação de permissões específicas
    ];
  }

  const folders = await GedFolder.findAll({
    where: whereCondition,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email"]
      }
    ],
    order: [["name", "ASC"]]
  });

  // Contar arquivos e subpastas em cada pasta
  const foldersWithCounts = await Promise.all(
    folders.map(async (folder) => {
      const fileCount = await GedFile.count({
        where: {
          folderId: folder.id,
          isDeleted: false
        }
      });

      const subfolderCount = await GedFolder.count({
        where: {
          parentId: folder.id
        }
      });

      return {
        ...folder.toJSON(),
        fileCount,
        subfolderCount
      };
    })
  );

  return res.json(foldersWithCounts);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const folder = await GedFolder.findOne({
    where: {
      id,
      companyId
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email"]
      },
      {
        model: GedFolder,
        as: "parent",
        attributes: ["id", "name", "path"]
      },
      {
        model: GedFolder,
        as: "subfolders",
        attributes: ["id", "name", "type", "icon", "color"]
      }
    ]
  });

  if (!folder) {
    throw new AppError("Pasta não encontrada", 404);
  }

  // Verificar permissão
  // TODO: Implementar verificação completa de permissões

  // Contar arquivos
  const fileCount = await GedFile.count({
    where: {
      folderId: folder.id,
      isDeleted: false
    }
  });

  return res.json({
    ...folder.toJSON(),
    fileCount
  });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const folderData: FolderData = req.body;

  // Validações
  if (!folderData.name) {
    throw new AppError("Nome da pasta é obrigatório", 400);
  }

  // Verificar se já existe pasta com mesmo nome no mesmo local
  const existingFolder = await GedFolder.findOne({
    where: {
      companyId,
      name: folderData.name,
      parentId: folderData.parentId || null
    }
  });

  if (existingFolder) {
    throw new AppError("Já existe uma pasta com este nome neste local", 400);
  }

  // Construir path
  let path = `/${folderData.name}`;
  if (folderData.parentId) {
    const parentFolder = await GedFolder.findByPk(folderData.parentId);
    if (parentFolder) {
      path = `${parentFolder.path}/${folderData.name}`;
    }
  }

  const folder = await GedFolder.create({
    ...folderData,
    companyId,
    userId,
    path
  });

  // Log da atividade
  await GedActivityLog.create({
    companyId,
    userId,
    entityType: "folder",
    entityId: folder.id,
    action: "create",
    details: {
      folderName: folder.name,
      path: folder.path
    },
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });

  return res.status(201).json(folder);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId, id: userId } = req.user;
  const folderData: FolderData = req.body;

  const folder = await GedFolder.findOne({
    where: {
      id,
      companyId
    }
  });

  if (!folder) {
    throw new AppError("Pasta não encontrada", 404);
  }

  // Verificar permissão
  if (req.user.profile !== "admin" && folder.userId !== parseInt(userId.toString())) {
    throw new AppError("Sem permissão para editar esta pasta", 403);
  }

  const oldData = { ...folder.toJSON() };

  // Se mudar o nome, atualizar path
  if (folderData.name && folderData.name !== folder.name) {
    let newPath = `/${folderData.name}`;
    if (folder.parentId) {
      const parentFolder = await GedFolder.findByPk(folder.parentId);
      if (parentFolder) {
        newPath = `${parentFolder.path}/${folderData.name}`;
      }
    }
    folderData.path = newPath;

    // Atualizar path de subpastas
    await updateSubfoldersPath(folder.id, folder.path, newPath);
  }

  await folder.update(folderData);

  // Log da atividade
  await GedActivityLog.create({
    companyId,
    userId,
    entityType: "folder",
    entityId: folder.id,
    action: "update",
    details: {
      oldData,
      newData: folder.toJSON()
    },
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });

  return res.json(folder);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId, id: userId } = req.user;

  const folder = await GedFolder.findOne({
    where: {
      id,
      companyId
    }
  });

  if (!folder) {
    throw new AppError("Pasta não encontrada", 404);
  }

  // Verificar permissão
  if (req.user.profile !== "admin" && folder.userId !== parseInt(userId.toString())) {
    throw new AppError("Sem permissão para deletar esta pasta", 403);
  }

  // Verificar se tem arquivos
  const fileCount = await GedFile.count({
    where: {
      folderId: folder.id,
      isDeleted: false
    }
  });

  if (fileCount > 0) {
    throw new AppError("Não é possível deletar uma pasta com arquivos", 400);
  }

  // Verificar se tem subpastas
  const subfolderCount = await GedFolder.count({
    where: {
      parentId: folder.id
    }
  });

  if (subfolderCount > 0) {
    throw new AppError("Não é possível deletar uma pasta com subpastas", 400);
  }

  await folder.destroy();

  // Log da atividade
  await GedActivityLog.create({
    companyId,
    userId,
    entityType: "folder",
    entityId: folder.id,
    action: "delete",
    details: {
      folderName: folder.name,
      path: folder.path
    },
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });

  return res.json({ message: "Pasta deletada com sucesso" });
};

export const move = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { targetFolderId } = req.body;
  const { companyId, id: userId } = req.user;

  const folder = await GedFolder.findOne({
    where: {
      id,
      companyId
    }
  });

  if (!folder) {
    throw new AppError("Pasta não encontrada", 404);
  }

  // Verificar se não está tentando mover para dentro de si mesma
  if (targetFolderId && parseInt(targetFolderId.toString()) === folder.id) {
    throw new AppError("Não é possível mover uma pasta para dentro dela mesma", 400);
  }

  const oldPath = folder.path;
  const oldParentId = folder.parentId;

  // Atualizar parent
  let newPath = `/${folder.name}`;
  if (targetFolderId) {
    const targetFolder = await GedFolder.findByPk(targetFolderId);
    if (!targetFolder) {
      throw new AppError("Pasta destino não encontrada", 404);
    }
    newPath = `${targetFolder.path}/${folder.name}`;
  }

  await folder.update({
    parentId: targetFolderId || null,
    path: newPath
  });

  // Atualizar path de subpastas
  await updateSubfoldersPath(folder.id, oldPath, newPath);

  // Log da atividade
  await GedActivityLog.create({
    companyId,
    userId,
    entityType: "folder",
    entityId: folder.id,
    action: "move",
    details: {
      folderName: folder.name,
      fromParentId: oldParentId,
      toParentId: targetFolderId,
      oldPath,
      newPath
    },
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });

  return res.json(folder);
};

export const getBreadcrumb = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const folder = await GedFolder.findOne({
    where: {
      id,
      companyId
    }
  });

  if (!folder) {
    throw new AppError("Pasta não encontrada", 404);
  }

  const breadcrumb = [];
  let currentFolder: GedFolder | null = folder;

  while (currentFolder) {
    breadcrumb.unshift({
      id: currentFolder.id,
      name: currentFolder.name,
      type: currentFolder.type
    });

    if (currentFolder.parentId) {
      currentFolder = await GedFolder.findByPk(currentFolder.parentId);
    } else {
      currentFolder = null;
    }
  }

  return res.json(breadcrumb);
};

// Função auxiliar para atualizar path de subpastas recursivamente
async function updateSubfoldersPath(
  folderId: number,
  oldPath: string,
  newPath: string
): Promise<void> {
  const subfolders = await GedFolder.findAll({
    where: {
      parentId: folderId
    }
  });

  for (const subfolder of subfolders) {
    const updatedPath = subfolder.path ? subfolder.path.replace(oldPath, newPath) : '';
    await subfolder.update({ path: updatedPath });
    
    // Recursão para subpastas aninhadas
    await updateSubfoldersPath(subfolder.id, subfolder.path || '', updatedPath);
  }
}
