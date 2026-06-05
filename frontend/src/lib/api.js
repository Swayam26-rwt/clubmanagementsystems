import axios from 'axios';

const BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
export const API = `${BASE}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});
