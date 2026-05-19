import api from "./api";

export const listCategories = (params) => {
  return api.get("/knowledge-base/categories", { params });
};

export const getCategory = (categoryId) => {
  return api.get(`/knowledge-base/categories/${categoryId}`);
};

export const createCategory = (data) => {
  return api.post("/knowledge-base/categories", data);
};

export const updateCategory = (categoryId, data) => {
  return api.put(`/knowledge-base/categories/${categoryId}`, data);
};

export const deleteCategory = (categoryId) => {
  return api.delete(`/knowledge-base/categories/${categoryId}`);
};

export const listArticles = (params) => {
  return api.get("/knowledge-base/articles", { params });
};

export const getArticle = (articleId) => {
  return api.get(`/knowledge-base/articles/${articleId}`);
};

export const createArticle = (data) => {
  return api.post("/knowledge-base/articles", data);
};

export const updateArticle = (articleId, data) => {
  return api.put(`/knowledge-base/articles/${articleId}`, data);
};

export const deleteArticle = (articleId) => {
  return api.delete(`/knowledge-base/articles/${articleId}`);
};

export const incrementArticleView = (articleId) => {
  return api.post(`/knowledge-base/articles/${articleId}/view`);
};

export const searchArticles = (params) => {
  return api.get("/knowledge-base/articles/search", { params });
};

export const getFeaturedArticles = () => {
  return api.get("/knowledge-base/articles/featured");
};

export const uploadAttachment = (articleId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post(`/knowledge-base/articles/${articleId}/attachments`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export const deleteAttachment = (attachmentId) => {
  return api.delete(`/knowledge-base/attachments/${attachmentId}`);
};

export const addVideo = (articleId, data) => {
  return api.post(`/knowledge-base/articles/${articleId}/videos`, data);
};

export const deleteVideo = (videoId) => {
  return api.delete(`/knowledge-base/videos/${videoId}`);
};
