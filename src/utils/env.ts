const env = import.meta.env;

export const API_BASE_URL = env.VITE_API_BASE_URL || '/api';
export const API_TOKEN = env.VITE_API_TOKEN || '';
