import { Request, Response } from "express";
import ListSociosService from "../services/SocioServices/ListSociosService";
import ShowSocioService from "../services/SocioServices/ShowSocioService";
import CreateSocioService from "../services/SocioServices/CreateSocioService";
import UpdateSocioService from "../services/SocioServices/UpdateSocioService";
import DeleteSocioService from "../services/SocioServices/DeleteSocioService";
import VincularSocioClienteService from "../services/SocioServices/VincularSocioClienteService";
import UpdateVinculoSocioService from "../services/SocioServices/UpdateVinculoSocioService";
import DeleteVinculoSocioService from "../services/SocioServices/DeleteVinculoSocioService";
import GetNextCodigoSistemaSocioService from "../services/SocioServices/GetNextCodigoSistemaSocioService";

// CRUD Sócios

export const nextCodigoSistema = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;

  const codigoSistema = await GetNextCodigoSistemaSocioService(companyId);

  return res.json({ codigoSistema });
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam, pageNumber, limit, ativo } = req.query as any;

  const { socios, count, hasMore } = await ListSociosService({
    companyId,
    searchParam,
    pageNumber,
    limit,
    ativo: ativo !== undefined ? ativo === "true" : undefined,
  });

  return res.json({ socios, count, hasMore });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { socioId } = req.params;

  const socio = await ShowSocioService({
    id: socioId,
    companyId,
  });

  return res.json(socio);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const socioData = req.body;

  const socio = await CreateSocioService({
    ...socioData,
    companyId,
  });

  return res.status(201).json(socio);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { socioId } = req.params;
  const socioData = req.body;

  const socio = await UpdateSocioService({
    socioData,
    socioId,
    companyId,
  });

  return res.json(socio);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { socioId } = req.params;

  await DeleteSocioService({
    id: socioId,
    companyId,
  });

  return res.status(200).json({ message: "Sócio excluído com sucesso" });
};

// Gestão de Vínculos (ClienteSocio)

export const vincular = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const vinculoData = req.body;

  const vinculo = await VincularSocioClienteService({
    ...vinculoData,
    companyId,
  });

  return res.status(201).json(vinculo);
};

export const updateVinculo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { vinculoId } = req.params;
  const vinculoData = req.body;

  const vinculo = await UpdateVinculoSocioService({
    vinculoData,
    vinculoId,
    companyId,
  });

  return res.json(vinculo);
};

export const removeVinculo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { vinculoId } = req.params;

  await DeleteVinculoSocioService({
    vinculoId,
    companyId,
  });

  return res.status(200).json({ message: "Vínculo removido com sucesso" });
};
