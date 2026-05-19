import { Request, Response } from "express";
import UserClientesPreference from "../models/UserClientesPreference";
import UserClientesSavedFilter from "../models/UserClientesSavedFilter";
import AppError from "../errors/AppError";

// ==================== PREFERÊNCIAS GERAIS ====================

export const getPreferences = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId, companyId } = req.user;

  try {
    let preferences = await UserClientesPreference.findOne({
      where: {
        userId,
        empresaId: companyId
      }
    });

    if (!preferences) {
      // Criar preferências padrão se não existir
      preferences = await UserClientesPreference.create({
        userId,
        empresaId: companyId,
        columnOrder: [],
        columnVisibility: {},
        columnWidths: {},
        sortConfig: { key: "id", direction: "desc" },
        showFilters: true,
        defaultFilters: {}
      });
    }

    return res.json(preferences);
  } catch (error) {
    console.error("Erro ao buscar preferências:", error);
    throw new AppError("Erro ao buscar preferências do usuário", 500);
  }
};

export const updatePreferences = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId, companyId } = req.user;
  const {
    columnOrder,
    columnVisibility,
    columnWidths,
    sortConfig,
    showFilters,
    defaultFilters
  } = req.body;

  try {
    let preferences = await UserClientesPreference.findOne({
      where: {
        userId,
        empresaId: companyId
      }
    });

    if (!preferences) {
      preferences = await UserClientesPreference.create({
        userId,
        empresaId: companyId,
        columnOrder: columnOrder || [],
        columnVisibility: columnVisibility || {},
        columnWidths: columnWidths || {},
        sortConfig: sortConfig || { key: "id", direction: "desc" },
        showFilters: showFilters !== undefined ? showFilters : true,
        defaultFilters: defaultFilters || {}
      });
    } else {
      await preferences.update({
        columnOrder: columnOrder !== undefined ? columnOrder : preferences.columnOrder,
        columnVisibility: columnVisibility !== undefined ? columnVisibility : preferences.columnVisibility,
        columnWidths: columnWidths !== undefined ? columnWidths : preferences.columnWidths,
        sortConfig: sortConfig !== undefined ? sortConfig : preferences.sortConfig,
        showFilters: showFilters !== undefined ? showFilters : preferences.showFilters,
        defaultFilters: defaultFilters !== undefined ? defaultFilters : preferences.defaultFilters
      });
    }

    return res.json(preferences);
  } catch (error) {
    console.error("Erro ao atualizar preferências:", error);
    throw new AppError("Erro ao atualizar preferências do usuário", 500);
  }
};

export const resetPreferences = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId, companyId } = req.user;

  try {
    const preferences = await UserClientesPreference.findOne({
      where: {
        userId,
        empresaId: companyId
      }
    });

    if (preferences) {
      await preferences.update({
        columnOrder: [],
        columnVisibility: {},
        columnWidths: {},
        sortConfig: { key: "id", direction: "desc" },
        showFilters: true,
        defaultFilters: {}
      });
    }

    return res.json({ message: "Preferências resetadas com sucesso" });
  } catch (error) {
    console.error("Erro ao resetar preferências:", error);
    throw new AppError("Erro ao resetar preferências do usuário", 500);
  }
};

// ==================== FILTROS SALVOS ====================

export const getSavedFilters = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId, companyId } = req.user;

  try {
    const filters = await UserClientesSavedFilter.findAll({
      where: {
        userId,
        empresaId: companyId
      },
      order: [["isDefault", "DESC"], ["name", "ASC"]]
    });

    return res.json(filters);
  } catch (error) {
    console.error("Erro ao buscar filtros salvos:", error);
    throw new AppError("Erro ao buscar filtros salvos", 500);
  }
};

export const getSavedFilterById = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId, companyId } = req.user;
  const { filterId } = req.params;

  try {
    const filter = await UserClientesSavedFilter.findOne({
      where: {
        id: filterId,
        userId,
        empresaId: companyId
      }
    });

    if (!filter) {
      throw new AppError("Filtro não encontrado", 404);
    }

    return res.json(filter);
  } catch (error) {
    console.error("Erro ao buscar filtro:", error);
    if (error instanceof AppError) throw error;
    throw new AppError("Erro ao buscar filtro salvo", 500);
  }
};

export const createSavedFilter = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId, companyId } = req.user;
  const { name, description, filters, isDefault } = req.body;

  if (!name || !filters) {
    throw new AppError("Nome e filtros são obrigatórios", 400);
  }

  try {
    // Verificar se já existe um filtro com o mesmo nome
    const existingFilter = await UserClientesSavedFilter.findOne({
      where: {
        userId,
        empresaId: companyId,
        name
      }
    });

    if (existingFilter) {
      throw new AppError("Já existe um filtro com este nome", 409);
    }

    // Se for padrão, desmarcar outros filtros padrão
    if (isDefault) {
      await UserClientesSavedFilter.update(
        { isDefault: false },
        {
          where: {
            userId,
            empresaId: companyId
          }
        }
      );
    }

    const savedFilter = await UserClientesSavedFilter.create({
      userId,
      empresaId: companyId,
      name,
      description: description || null,
      filters,
      isDefault: isDefault || false
    });

    return res.status(201).json(savedFilter);
  } catch (error) {
    console.error("Erro ao criar filtro salvo:", error);
    if (error instanceof AppError) throw error;
    throw new AppError("Erro ao criar filtro salvo", 500);
  }
};

export const updateSavedFilter = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId, companyId } = req.user;
  const { filterId } = req.params;
  const { name, description, filters, isDefault } = req.body;

  try {
    const savedFilter = await UserClientesSavedFilter.findOne({
      where: {
        id: filterId,
        userId,
        empresaId: companyId
      }
    });

    if (!savedFilter) {
      throw new AppError("Filtro não encontrado", 404);
    }

    // Verificar se já existe outro filtro com o mesmo nome
    if (name && name !== savedFilter.name) {
      const existingFilter = await UserClientesSavedFilter.findOne({
        where: {
          userId,
          empresaId: companyId,
          name
        }
      });

      if (existingFilter) {
        throw new AppError("Já existe um filtro com este nome", 409);
      }
    }

    // Se for padrão, desmarcar outros filtros padrão
    if (isDefault && !savedFilter.isDefault) {
      await UserClientesSavedFilter.update(
        { isDefault: false },
        {
          where: {
            userId,
            empresaId: companyId
          }
        }
      );
    }

    await savedFilter.update({
      name: name !== undefined ? name : savedFilter.name,
      description: description !== undefined ? description : savedFilter.description,
      filters: filters !== undefined ? filters : savedFilter.filters,
      isDefault: isDefault !== undefined ? isDefault : savedFilter.isDefault
    });

    return res.json(savedFilter);
  } catch (error) {
    console.error("Erro ao atualizar filtro salvo:", error);
    if (error instanceof AppError) throw error;
    throw new AppError("Erro ao atualizar filtro salvo", 500);
  }
};

export const deleteSavedFilter = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId, companyId } = req.user;
  const { filterId } = req.params;

  try {
    const savedFilter = await UserClientesSavedFilter.findOne({
      where: {
        id: filterId,
        userId,
        empresaId: companyId
      }
    });

    if (!savedFilter) {
      throw new AppError("Filtro não encontrado", 404);
    }

    await savedFilter.destroy();

    return res.json({ message: "Filtro excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir filtro salvo:", error);
    if (error instanceof AppError) throw error;
    throw new AppError("Erro ao excluir filtro salvo", 500);
  }
};

export const setDefaultFilter = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId, companyId } = req.user;
  const { filterId } = req.params;

  try {
    const savedFilter = await UserClientesSavedFilter.findOne({
      where: {
        id: filterId,
        userId,
        empresaId: companyId
      }
    });

    if (!savedFilter) {
      throw new AppError("Filtro não encontrado", 404);
    }

    // Desmarcar todos os outros filtros padrão
    await UserClientesSavedFilter.update(
      { isDefault: false },
      {
        where: {
          userId,
          empresaId: companyId
        }
      }
    );

    // Marcar este como padrão
    await savedFilter.update({ isDefault: true });

    return res.json(savedFilter);
  } catch (error) {
    console.error("Erro ao definir filtro padrão:", error);
    if (error instanceof AppError) throw error;
    throw new AppError("Erro ao definir filtro padrão", 500);
  }
};

export const clearDefaultFilter = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId, companyId } = req.user;

  try {
    await UserClientesSavedFilter.update(
      { isDefault: false },
      {
        where: {
          userId,
          empresaId: companyId,
          isDefault: true
        }
      }
    );

    return res.json({ message: "Filtro padrão removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover filtro padrão:", error);
    throw new AppError("Erro ao remover filtro padrão", 500);
  }
};
