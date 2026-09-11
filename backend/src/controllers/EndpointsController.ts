import { Request, Response } from "express";
import {
  listarEndpointsDisponiveis,
  listarEndpointsModelo,
  salvarEndpointsModelo,
  listarEndpointsCliente,
  salvarEndpointsCliente,
  EndpointTipo,
} from "../services/EndpointsService";
import ClienteVigencia from "../models/ClienteVigencia";
import AppError from "../errors/AppError";

export const indexDisponiveis = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const endpoints = await listarEndpointsDisponiveis(companyId);
  return res.json(endpoints);
};

export const indexModelo = async (req: Request, res: Response): Promise<Response> => {
  const { modeloId } = req.params;
  const endpoints = await listarEndpointsModelo(parseInt(modeloId));
  return res.json(endpoints);
};

export const salvarModelo = async (req: Request, res: Response): Promise<Response> => {
  const { modeloId } = req.params;
  const { endpoints } = req.body as { endpoints: { tipo: EndpointTipo; endpointId: number }[] };

  await salvarEndpointsModelo(parseInt(modeloId), endpoints || []);
  return res.json({ message: "Endpoints do modelo salvos com sucesso" });
};

const validarVigenciaDoCliente = async (
  clienteId: number,
  vigenciaId: number
): Promise<void> => {
  const vigencia = await ClienteVigencia.findOne({
    where: { id: vigenciaId, clienteId },
  });

  if (!vigencia) {
    throw new AppError("Vigência não encontrada", 404);
  }
};

export const indexCliente = async (req: Request, res: Response): Promise<Response> => {
  const { clienteId, vigenciaId } = req.params;

  await validarVigenciaDoCliente(parseInt(clienteId), parseInt(vigenciaId));

  const endpoints = await listarEndpointsCliente(parseInt(clienteId), parseInt(vigenciaId));
  return res.json(endpoints);
};

export const salvarCliente = async (req: Request, res: Response): Promise<Response> => {
  const { clienteId, vigenciaId } = req.params;
  const { endpoints } = req.body as { endpoints: { tipo: EndpointTipo; endpointId: number }[] };

  await validarVigenciaDoCliente(parseInt(clienteId), parseInt(vigenciaId));

  await salvarEndpointsCliente(parseInt(clienteId), parseInt(vigenciaId), endpoints || []);
  return res.json({ message: "Endpoints do cliente salvos com sucesso" });
};
