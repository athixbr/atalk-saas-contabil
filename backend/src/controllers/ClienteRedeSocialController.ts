import { Request, Response } from "express";
import ClienteRedeSocial from "../models/ClienteRedeSocial";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { clienteId } = req.params;

  try {
    const redesSociais = await ClienteRedeSocial.findAll({
      where: { clienteId },
      order: [["tipo", "ASC"]],
    });

    return res.status(200).json(redesSociais);
  } catch (err) {
    console.error("Erro ao listar redes sociais:", err);
    return res.status(500).json({ error: "Erro ao listar redes sociais" });
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { clienteId } = req.params;
  const { tipo, url, usuario } = req.body;

  try {
    const novaRede = await ClienteRedeSocial.create({
      clienteId: Number(clienteId),
      tipo,
      url,
      usuario,
    });

    return res.status(201).json(novaRede);
  } catch (err) {
    console.error("Erro ao criar rede social:", err);
    return res.status(500).json({ error: "Erro ao criar rede social" });
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { clienteId, redeId } = req.params;
  const { tipo, url, usuario } = req.body;

  try {
    const rede = await ClienteRedeSocial.findOne({
      where: { id: redeId, clienteId },
    });

    if (!rede) {
      return res.status(404).json({ error: "Rede social não encontrada" });
    }

    await rede.update({
      tipo,
      url,
      usuario,
    });

    return res.status(200).json(rede);
  } catch (err) {
    console.error("Erro ao atualizar rede social:", err);
    return res.status(500).json({ error: "Erro ao atualizar rede social" });
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { clienteId, redeId } = req.params;

  try {
    const rede = await ClienteRedeSocial.findOne({
      where: { id: redeId, clienteId },
    });

    if (!rede) {
      return res.status(404).json({ error: "Rede social não encontrada" });
    }

    await rede.destroy();

    return res.status(200).json({ message: "Rede social excluída com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir rede social:", err);
    return res.status(500).json({ error: "Erro ao excluir rede social" });
  }
};
