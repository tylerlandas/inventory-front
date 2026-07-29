import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });

export const lookupBarcode = (barcode) => api.get(`/lookup/${barcode}`).then((r) => r.data);
export const getItems = () => api.get('/items').then((r) => r.data);
export const getItemsByBarcode = (barcode) => api.get(`/items/barcode/${barcode}`).then((r) => r.data);
export const getLocations = () => api.get('/items/locations').then((r) => r.data);
export const createItem = (data) => api.post('/items', data).then((r) => r.data);
export const updateItemCount = (id, delta) =>
  api.patch(`/items/${id}/count`, { delta }).then((r) => r.data);
export const updateItemDetails = (id, data) =>
  api.patch(`/items/${id}`, data).then((r) => r.data);
export const deleteItem = (id) => api.delete(`/items/${id}`).then((r) => r.data);
