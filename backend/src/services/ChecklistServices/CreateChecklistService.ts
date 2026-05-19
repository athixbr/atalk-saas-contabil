import Checklist from "../../models/Checklist";
import ChecklistItem from "../../models/ChecklistItem";
import User from "../../models/User";
import AppError from "../../errors/AppError";

interface ChecklistItemData {
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
  companyId: number;
  userId: number;
  titulo: string;
  descricao?: string;
  tipo?: string;
  ativo?: boolean;
  itens?: ChecklistItemData[];
}

const CreateChecklistService = async ({
  companyId,
  userId,
  titulo,
  descricao,
  tipo = "padrao",
  ativo = true,
  itens = []
}: Request): Promise<Checklist> => {
  
  if (!titulo || titulo.trim() === "") {
    throw new AppError("ERR_CHECKLIST_TITULO_REQUIRED", 400);
  }

  const checklist = await Checklist.create({
    companyId,
    titulo: titulo.trim(),
    descricao,
    tipo,
    ativo,
    createdBy: userId,
    updatedBy: userId
  });

  // Criar itens do checklist
  if (itens && itens.length > 0) {
    const itensToCreate = itens.map((item, index) => ({
      checklistId: checklist.id,
      ordem: item.ordem !== undefined ? item.ordem : index + 1,
      titulo: item.titulo,
      descricao: item.descricao || null,
      obrigatorio: item.obrigatorio || false,
      tipo: item.tipo || "texto",
      arquivoUrl: item.arquivoUrl || null,
      arquivoNome: item.arquivoNome || null,
      arquivoPath: item.arquivoPath || null
    }));

    await ChecklistItem.bulkCreate(itensToCreate);
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
      }
    ]
  });

  return checklist;
};

export default CreateChecklistService;
