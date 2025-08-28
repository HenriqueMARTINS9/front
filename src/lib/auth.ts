import { api } from "./api";

export const setToken = (token: string) => {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};


export const clearToken = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
};


export const getToken = () => {
    return localStorage.getItem('token');
};