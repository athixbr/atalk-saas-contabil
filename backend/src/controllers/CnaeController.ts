import { Request, Response } from "express";
import { Op } from "sequelize";
import Cnae from "../models/Cnae";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { search } = req.query;

  try {
    const where = search
      ? {
          [Op.or]: [
            { codigo: { [Op.iLike]: `%${search}%` } },
            { descricao: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {};

    const cnaes = await Cnae.findAll({
      where,
      order: [["codigo", "ASC"]],
    });

    return res.status(200).json(cnaes);
  } catch (err) {
    console.error("Erro ao listar CNAEs:", err);
    return res.status(500).json({ error: "Erro ao listar CNAEs" });
  }
};
