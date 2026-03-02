import api from "./api";

export const getNetWorth          = ()          => api.get("/networth");
export const addNetWorthItem      = (data)      => api.post("/networth", data);
export const updateNetWorthItem   = (id, data)  => api.put(`/networth/${id}`, data);
export const deleteNetWorthItem   = (id)        => api.delete(`/networth/${id}`);