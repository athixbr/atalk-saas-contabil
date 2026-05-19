import fs from "fs";
import path from "path";
import { promisify } from "util";

const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);
const unlinkAsync = promisify(fs.unlink);

interface SaveImageParams {
  base64Data: string;
  companyId: number;
  tarefaId: number;
  fileName: string;
}

export const saveChecklistImage = async ({
  base64Data,
  companyId,
  tarefaId,
  fileName,
}: SaveImageParams): Promise<string> => {
  try {
    // Extrair o base64 puro (remover o prefixo data:image/...)
    const matches = base64Data.match(/^data:image\/([a-zA-Z]*);base64,([^"]*)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Formato de imagem inválido");
    }

    const imageType = matches[1]; // png, jpeg, etc
    const base64Image = matches[2];
    const buffer = Buffer.from(base64Image, "base64");

    // Criar estrutura de pastas: public/company{id}/tarefas/{tarefaId}/
    const companyDir = path.join(
      __dirname,
      "..",
      "..",
      "public",
      `company${companyId}`,
      "tarefas",
      `${tarefaId}`
    );

    // Criar diretórios se não existirem
    await mkdirAsync(companyDir, { recursive: true });

    // Nome do arquivo com timestamp para evitar conflitos
    const timestamp = Date.now();
    const imageFileName = `${timestamp}_${fileName}.${imageType}`;
    const filePath = path.join(companyDir, imageFileName);

    // Salvar o arquivo
    await writeFileAsync(filePath, buffer);

    // Retornar o caminho relativo para ser salvo no banco
    return `company${companyId}/tarefas/${tarefaId}/${imageFileName}`;
  } catch (error) {
    console.error("Erro ao salvar imagem:", error);
    throw new Error("Erro ao salvar imagem do checklist");
  }
};

export const deleteChecklistImage = async (imagePath: string): Promise<void> => {
  try {
    const fullPath = path.join(__dirname, "..", "..", "public", imagePath);
    
    if (fs.existsSync(fullPath)) {
      await unlinkAsync(fullPath);
    }
  } catch (error) {
    console.error("Erro ao deletar imagem:", error);
    // Não lançar erro para não interromper o fluxo
  }
};

export const deleteAllChecklistImages = async (
  companyId: number,
  tarefaId: number
): Promise<void> => {
  try {
    const tarefaDir = path.join(
      __dirname,
      "..",
      "..",
      "public",
      `company${companyId}`,
      "tarefas",
      `${tarefaId}`
    );

    if (fs.existsSync(tarefaDir)) {
      const files = fs.readdirSync(tarefaDir);
      
      for (const file of files) {
        const filePath = path.join(tarefaDir, file);
        await unlinkAsync(filePath);
      }
      
      // Remover o diretório vazio
      fs.rmdirSync(tarefaDir);
    }
  } catch (error) {
    console.error("Erro ao deletar imagens da tarefa:", error);
    // Não lançar erro para não interromper o fluxo
  }
};
