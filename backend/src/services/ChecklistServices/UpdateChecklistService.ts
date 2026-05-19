import Checklist from "../../models/Checklist";
import ChecklistItem from "../../models/ChecklistItem";
import User from "../../models/User";
import AppError from "../../errors/AppError";

interface ChecklistItemData {
  id?: number;
  ordem: number;
  titulo: string;
  descricao?: string;
  obrigatorio?: boolean;
  tipo: string;
  arquivoUrl?: string;
  arquivoNome?: string;
  arquivoPath?: string;
}

interface Request {
  id: number;
  companyId: number;
  userId: number;
  titulo?: string;
  descricao?: string;
  tipo?: string;
  ativo?: boolean;
  itens?: ChecklistItemData[];
}

const UpdateChecklistService = async ({
  id,
  companyId,
  userId,
  titulo,
  descricao,
  tipo,
  ativo,
  itens
}: Request): Promise<Checklist> => {
  const checklist = await Checklist.findOne({
    where: { id, companyId }
  });

  if (!checklist) {
    throw new AppError("ERR_CHECKLIST_NOT_FOUND", 404);
  }

  const updateData: any = {
    updatedBy: userId
  };

  if (titulo !== undefined) updateData.titulo = titulo.trim();
  if (descricao !== undefined) updateData.descricao = descricao;
  if (tipo !== undefined) updateData.tipo = tipo;
  if (ativo !== undefined) updateData.ativo = ativo;

  await checklist.update(updateData);

  // Atualizar itens se fornecidos
  if (itens !== undefined) {
    // Buscar itens existentes
    const existingItems = await ChecklistItem.findAll({
      where: { checklistId: id }
    });

    const existingItemIds = existingItems.map(item => item.id);
    const providedItemIds = itens.filter(item => item.id).map(item => item.id);

    // Deletar itens que foram removidos
    const itemsToDelete = existingItemIds.filter(itemId => !providedItemIds.includes(itemId));
    if (itemsToDelete.length > 0) {
      await ChecklistItem.destroy({
        where: { id: itemsToDelete }
      });
    }

    // Atualizar ou criar itens
    for (const itemData of itens) {
      if (itemData.id) {
        // Atualizar item existente
        await ChecklistItem.update(
          {
            ordem: itemData.ordem,
            titulo: itemData.titulo,
            descricao: itemData.descricao || null,
            obrigatorio: itemData.obrigatorio || false,
            tipo: itemData.tipo,
            arquivoUrl: itemData.arquivoUrl || null,
            arquivoNome: itemData.arquivoNome || null,
            arquivoPath: itemData.arquivoPath || null
          },
          {
            where: { id: itemData.id, checklistId: id }
          }
        );
      } else {
        // Criar novo item
        await ChecklistItem.create({
          checklistId: id,
          ordem: itemData.ordem,
          titulo: itemData.titulo,
          descricao: itemData.descricao || null,
          obrigatorio: itemData.obrigatorio || false,
          tipo: itemData.tipo,
          arquivoUrl: itemData.arquivoUrl || null,
          arquivoNome: itemData.arquivoNome || null,
          arquivoPath: itemData.arquivoPath || null
        });
      }
    }
  }

  // Recarregar com itens
  await checklist.reload({
    include: [
      {
        model: ChecklistItem,
        as: "itens",
        separate: true,
        order: [["ordem", "ASC"]]
      },
      {
        model: User,
        as: "creator",
        attributes: ["id", "name", "email"]
      },
      {
        model: User,
        as: "updater",
        attributes: ["id", "name", "email"]
      }
    ]
  });

  return checklist;
};

export default UpdateChecklistService;
