import { Request, Response } from "express";
import * as ModeloParametrosService from "../services/ModeloParametrosService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const modelos = await ModeloParametrosService.listarModelos();
    return res.json(modelos);
  } catch (error) {
    console.error("Erro ao listar modelos de parâmetros:", error);
    return res.status(500).json({ error: "Erro ao listar modelos de parâmetros" });
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const modelo = await ModeloParametrosService.buscarModelo(parseInt(id));
    
    if (!modelo) {
      return res.status(404).json({ error: "Modelo não encontrado" });
    }
    
    return res.json(modelo);
  } catch (error) {
    console.error("Erro ao buscar modelo:", error);
    return res.status(500).json({ error: "Erro ao buscar modelo" });
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const modeloData = req.body;
    const modelo = await ModeloParametrosService.criarModelo(modeloData);
    return res.status(201).json(modelo);
  } catch (error) {
    console.error("Erro ao criar modelo:", error);
    return res.status(500).json({ error: "Erro ao criar modelo de parâmetros" });
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const modeloData = req.body;
    const modelo = await ModeloParametrosService.atualizarModelo(parseInt(id), modeloData);
    
    if (!modelo) {
      return res.status(404).json({ error: "Modelo não encontrado" });
    }
    
    return res.json(modelo);
  } catch (error) {
    console.error("Erro ao atualizar modelo:", error);
    return res.status(500).json({ error: "Erro ao atualizar modelo" });
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    await ModeloParametrosService.deletarModelo(parseInt(id));
    return res.status(200).json({ message: "Modelo deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar modelo:", error);
    return res.status(500).json({ error: "Erro ao deletar modelo" });
  }
};
