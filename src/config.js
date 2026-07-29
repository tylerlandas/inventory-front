// Override via a .env file: VITE_API_BASE_URL=http://<host>:3000/api
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
