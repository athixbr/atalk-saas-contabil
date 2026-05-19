import api from "./api";

// Business Types
export const getBusinessTypes = async (params = {}) => {
  const { data } = await api.get("/crm/business-types", { params });
  return data;
};

export const createBusinessType = async (businessType) => {
  const { data } = await api.post("/crm/business-types", businessType);
  return data;
};

export const updateBusinessType = async (id, businessType) => {
  const { data } = await api.put(`/crm/business-types/${id}`, businessType);
  return data;
};

export const deleteBusinessType = async (id) => {
  const { data } = await api.delete(`/crm/business-types/${id}`);
  return data;
};

// Tax Regimes
export const getTaxRegimes = async (params = {}) => {
  const { data } = await api.get("/crm/tax-regimes", { params });
  return data;
};

export const createTaxRegime = async (taxRegime) => {
  const { data } = await api.post("/crm/tax-regimes", taxRegime);
  return data;
};

export const updateTaxRegime = async (id, taxRegime) => {
  const { data } = await api.put(`/crm/tax-regimes/${id}`, taxRegime);
  return data;
};

export const deleteTaxRegime = async (id) => {
  const { data } = await api.delete(`/crm/tax-regimes/${id}`);
  return data;
};

// Sources
export const getSources = async (params = {}) => {
  const { data } = await api.get("/crm/sources", { params });
  return data;
};

export const createSource = async (source) => {
  const { data } = await api.post("/crm/sources", source);
  return data;
};

export const updateSource = async (id, source) => {
  const { data } = await api.put(`/crm/sources/${id}`, source);
  return data;
};

export const deleteSource = async (id) => {
  const { data } = await api.delete(`/crm/sources/${id}`);
  return data;
};

// Stages
export const getStages = async (params = {}) => {
  const { data } = await api.get("/crm/stages", { params });
  return data;
};

export const createStage = async (stage) => {
  const { data } = await api.post("/crm/stages", stage);
  return data;
};

export const updateStage = async (id, stage) => {
  const { data } = await api.put(`/crm/stages/${id}`, stage);
  return data;
};

export const deleteStage = async (id) => {
  const { data } = await api.delete(`/crm/stages/${id}`);
  return data;
};

// Task Categories
export const getTaskCategories = async (params = {}) => {
  const { data } = await api.get("/crm/task-categories", { params });
  return data;
};

export const createTaskCategory = async (category) => {
  const { data } = await api.post("/crm/task-categories", category);
  return data;
};

export const updateTaskCategory = async (id, category) => {
  const { data } = await api.put(`/crm/task-categories/${id}`, category);
  return data;
};

export const deleteTaskCategory = async (id) => {
  const { data } = await api.delete(`/crm/task-categories/${id}`);
  return data;
};

// Leads
export const getLeads = async (params = {}) => {
  const { data } = await api.get("/crm/leads", { params });
  return data;
};

export const getLead = async (id) => {
  const { data } = await api.get(`/crm/leads/${id}`);
  return data;
};

export const createLead = async (lead) => {
  const { data } = await api.post("/crm/leads", lead);
  return data;
};

export const updateLead = async (id, lead) => {
  const { data } = await api.put(`/crm/leads/${id}`, lead);
  return data;
};

export const deleteLead = async (id) => {
  const { data } = await api.delete(`/crm/leads/${id}`);
  return data;
};

// CRM Tasks
export const getCrmTasks = async (params = {}) => {
  const { data } = await api.get("/crm/tasks", { params });
  return data;
};

export const getCrmTask = async (id) => {
  const { data } = await api.get(`/crm/tasks/${id}`);
  return data;
};

export const createCrmTask = async (task) => {
  const { data } = await api.post("/crm/tasks", task);
  return data;
};

export const updateCrmTask = async (id, task) => {
  const { data } = await api.put(`/crm/tasks/${id}`, task);
  return data;
};

export const deleteCrmTask = async (id) => {
  const { data } = await api.delete(`/crm/tasks/${id}`);
  return data;
};

// Interactions
export const getInteractions = async (params = {}) => {
  const { data } = await api.get("/crm/interactions", { params });
  return data;
};

export const getInteraction = async (id) => {
  const { data } = await api.get(`/crm/interactions/${id}`);
  return data;
};

export const createInteraction = async (interaction) => {
  const { data } = await api.post("/crm/interactions", interaction);
  return data;
};

export const updateInteraction = async (id, interaction) => {
  const { data } = await api.put(`/crm/interactions/${id}`, interaction);
  return data;
};

export const deleteInteraction = async (id) => {
  const { data } = await api.delete(`/crm/interactions/${id}`);
  return data;
};
