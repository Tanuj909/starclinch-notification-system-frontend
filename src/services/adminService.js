import api from "../api/axios";

// ==============================
// 1. Trigger APIs
// ==============================

export const getTriggers = async () => {
  const response = await api.get("/admin/triggers/");
  return response.data;
};

export const createTrigger = async (data) => {
  const response = await api.post("/admin/triggers/", data);
  return response.data;
};

export const updateTrigger = async (id, data) => {
  const response = await api.put(`/admin/triggers/${id}/`, data);
  return response.data;
};

export const deleteTrigger = async (id) => {
  const response = await api.delete(`/admin/triggers/${id}/`);
  return response.data;
};

// ==============================
// 2. Channel APIs
// ==============================

export const getChannels = async () => {
  const response = await api.get("/admin/channels/");
  return response.data;
};

export const createChannel = async (data) => {
  const response = await api.post("/admin/channels/", data);
  return response.data;
};

export const updateChannel = async (id, data) => {
  const response = await api.put(`/admin/channels/${id}/`, data);
  return response.data;
};

export const deleteChannel = async (id) => {
  const response = await api.delete(`/admin/channels/${id}/`);
  return response.data;
};

// ==============================
// 3. Notification Template APIs
// ==============================

export const getTemplates = async () => {
  const response = await api.get("/admin/templates/");
  return response.data;
};

export const createTemplate = async (data) => {
  const response = await api.post("/admin/templates/", data);
  return response.data;
};

export const updateTemplate = async (id, data) => {
  const response = await api.put(`/admin/templates/${id}/`, data);
  return response.data;
};

export const deleteTemplate = async (id) => {
  const response = await api.delete(`/admin/templates/${id}/`);
  return response.data;
};
