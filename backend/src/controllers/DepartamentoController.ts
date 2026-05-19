import { Request, Response } from "express";
import ListDepartamentosService from "../services/DepartamentoServices/ListDepartamentosService";
import ShowDepartamentoService from "../services/DepartamentoServices/ShowDepartamentoService";
import CreateDepartamentoService from "../services/DepartamentoServices/CreateDepartamentoService";
import UpdateDepartamentoService from "../services/DepartamentoServices/UpdateDepartamentoService";
import DeleteDepartamentoService from "../services/DepartamentoServices/DeleteDepartamentoService";
import ListUsersForDepartamentoService from "../services/DepartamentoServices/ListUsersForDepartamentoService";

export const listDepartamentos = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam?: string };

  const result = await ListDepartamentosService({
    companyId,
    searchParam,
  });

  return res.status(200).json(result);
};

export const showDepartamento = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const departamento = await ShowDepartamentoService({
    id,
    companyId,
  });

  return res.status(200).json(departamento);
};

export const createDepartamento = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { nome, usuarios } = req.body;

  const departamento = await CreateDepartamentoService({
    nome,
    usuarios,
    companyId,
  });

  return res.status(201).json(departamento);
};

export const updateDepartamento = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;
  const { nome, usuarios } = req.body;

  const departamento = await UpdateDepartamentoService({
    id,
    nome,
    usuarios,
    companyId,
  });

  return res.status(200).json(departamento);
};

export const deleteDepartamento = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeleteDepartamentoService({
    id,
    companyId,
  });

  return res.status(204).send();
};

export const listUsers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;

  const result = await ListUsersForDepartamentoService({ companyId });

  return res.status(200).json(result);
};
