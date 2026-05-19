import { Request, Response } from "express";
import ListDemaisIdentificadoresService from "../services/DemaisIdentificadoresServices/ListDemaisIdentificadoresService";
import CreateDemaisIdentificadoresService from "../services/DemaisIdentificadoresServices/CreateDemaisIdentificadoresService";
import UpdateDemaisIdentificadoresService from "../services/DemaisIdentificadoresServices/UpdateDemaisIdentificadoresService";
import DeleteDemaisIdentificadoresService from "../services/DemaisIdentificadoresServices/DeleteDemaisIdentificadoresService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { clienteId } = req.params;

  const { identificadores } = await ListDemaisIdentificadoresService({
    clienteId: parseInt(clienteId),
    companyId,
  });

  return res.json(identificadores);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { clienteId } = req.params;
  const { tipoDocumentoId, valor } = req.body;

  const identificador = await CreateDemaisIdentificadoresService({
    clienteId: parseInt(clienteId),
    tipoDocumentoId,
    valor,
    companyId,
  });

  return res.status(201).json(identificador);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { identificadorId } = req.params;
  const { tipoDocumentoId, valor } = req.body;

  const identificador = await UpdateDemaisIdentificadoresService({
    id: parseInt(identificadorId),
    tipoDocumentoId,
    valor,
    companyId,
  });

  return res.json(identificador);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { identificadorId } = req.params;

  await DeleteDemaisIdentificadoresService({
    id: parseInt(identificadorId),
    companyId,
  });

  return res.status(204).send();
};
