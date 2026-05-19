import { Request, Response } from "express";
import ClienteContato from "../models/ClienteContato";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { clienteId } = req.params;

  try {
    const contatos = await ClienteContato.findAll({
      where: { clienteId },
      order: [["nome", "ASC"]],
    });

    return res.status(200).json(contatos);
  } catch (err) {
    console.error("Erro ao listar contatos:", err);
    return res.status(500).json({ error: "Erro ao listar contatos" });
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { clienteId } = req.params;
  const { nome, cargo, email, telefone, celular, observacoes, ativo } = req.body;

  try {
    const novoContato = await ClienteContato.create({
      clienteId: Number(clienteId),
      nome,
      cargo,
      email,
      telefone,
      celular,
      observacoes,
      ativo: ativo !== undefined ? ativo : true,
    });

    return res.status(201).json(novoContato);
  } catch (err) {
    console.error("Erro ao criar contato:", err);
    return res.status(500).json({ error: "Erro ao criar contato" });
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { clienteId, contatoId } = req.params;
  const { nome, cargo, email, telefone, celular, observacoes, ativo } = req.body;

  try {
    const contato = await ClienteContato.findOne({
      where: { id: contatoId, clienteId },
    });

    if (!contato) {
      return res.status(404).json({ error: "Contato não encontrado" });
    }

    await contato.update({
      nome,
      cargo,
      email,
      telefone,
      celular,
      observacoes,
      ativo: ativo !== undefined ? ativo : contato.ativo,
    });

    return res.status(200).json(contato);
  } catch (err) {
    console.error("Erro ao atualizar contato:", err);
    return res.status(500).json({ error: "Erro ao atualizar contato" });
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { clienteId, contatoId } = req.params;

  try {
    const contato = await ClienteContato.findOne({
      where: { id: contatoId, clienteId },
    });

    if (!contato) {
      return res.status(404).json({ error: "Contato não encontrado" });
    }

    await contato.destroy();

    return res.status(200).json({ message: "Contato excluído com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir contato:", err);
    return res.status(500).json({ error: "Erro ao excluir contato" });
  }
};
