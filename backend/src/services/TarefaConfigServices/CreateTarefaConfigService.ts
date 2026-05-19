import TarefaConfig from "../../models/TarefaConfig";
import TarefaConfigChecklist from "../../models/TarefaConfigChecklist";
import AppError from "../../errors/AppError";
import { saveChecklistImage } from "../../helpers/ChecklistImageHelper";

interface ChecklistItem {
  id?: number;
  text: string;
  order: number;
  image?: string;
}

interface Request {
  titulo: string;
  descricao?: string;
  departamentoId: number;
  temVencimento: boolean;
  diasParaVencimento?: number;
  statusId?: number;
  diasLembrete?: number;
  prazoId?: number;
  aceitaArquivos: boolean;
  ativo: boolean;
  checklist: ChecklistItem[];
  sabadoUtil?: boolean;
  diasNaoUteis?: string;
  tarefaInterna?: boolean;
  valorReferencial?: number;
  companyId: number;
}

const CreateTarefaConfigService = async ({
  titulo,
  descricao,
  departamentoId,
  temVencimento,
  diasParaVencimento,
  statusId,
  diasLembrete,
  prazoId,
  aceitaArquivos,
  ativo,
  checklist,
  sabadoUtil,
  diasNaoUteis,
  tarefaInterna,
  valorReferencial,
  companyId,
}: Request): Promise<TarefaConfig> => {
  if (!titulo || titulo.trim() === "") {
    throw new AppError("Título da tarefa é obrigatório", 400);
  }

  if (!departamentoId) {
    throw new AppError("Departamento é obrigatório", 400);
  }

  if (temVencimento && !diasParaVencimento) {
    throw new AppError("Dias para vencimento é obrigatório quando tarefa tem vencimento", 400);
  }

  if (temVencimento && !statusId) {
    throw new AppError("Status é obrigatório quando tarefa tem vencimento", 400);
  }

  // Criar a tarefa
  const tarefa = await TarefaConfig.create({
    titulo,
    descricao,
    departamentoId,
    temVencimento,
    diasParaVencimento: temVencimento ? diasParaVencimento : null,
    statusId: temVencimento ? statusId : null,
    diasLembrete: diasLembrete || null,
    prazoId: prazoId || null,
    aceitaArquivos,
    ativo,
    sabadoUtil: sabadoUtil || false,
    diasNaoUteis: diasNaoUteis || null,
    tarefaInterna: tarefaInterna || false,
    valorReferencial: valorReferencial || null,
    companyId,
  });

  // Criar checklist
  if (checklist && checklist.length > 0) {
    const checklistData = [];
    
    for (const item of checklist) {
      let imagePath = null;
      
      // Se o item tem imagem em base64, salvar no sistema de arquivos
      if (item.image && item.image.startsWith("data:image")) {
        imagePath = await saveChecklistImage({
          base64Data: item.image,
          companyId,
          tarefaId: tarefa.id,
          fileName: `item_${item.order}`,
        });
      } else if (item.image) {
        // Se já é um caminho de arquivo, manter
        imagePath = item.image;
      }
      
      checklistData.push({
        tarefaConfigId: tarefa.id,
        text: item.text,
        order: item.order,
        image: imagePath,
      });
    }

    await TarefaConfigChecklist.bulkCreate(checklistData);
  }

  // Buscar tarefa com relacionamentos
  const tarefaCompleta = await TarefaConfig.findByPk(tarefa.id, {
    include: [
      {
        model: TarefaConfigChecklist,
        as: "checklist",
        attributes: ["id", "text", "order", "image"],
        separate: true,
        order: [["order", "ASC"]],
      },
    ],
  });

  return tarefaCompleta;
};

export default CreateTarefaConfigService;
