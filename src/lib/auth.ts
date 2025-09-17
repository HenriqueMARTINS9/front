import { api } from "./api";

// Fonction utilitaire pour vérifier si localStorage est disponible
const getLocalStorage = () => {
    if (typeof window !== 'undefined') {
        return localStorage;
    }
    return null;
};

export const setToken = (token: string) => {
    const storage = getLocalStorage();
    if (storage) {
        storage.setItem('access_token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
};

export const setRestaurantToken = (token: string) => {
    const storage = getLocalStorage();
    if (storage) {
        storage.setItem('restaurant_token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
};

export const clearToken = () => {
    const storage = getLocalStorage();
    if (storage) {
        storage.removeItem('access_token');
    }
    delete api.defaults.headers.common['Authorization'];
};

export const clearRestaurantToken = () => {
    const storage = getLocalStorage();
    if (storage) {
        storage.removeItem('restaurant_token');
    }
    delete api.defaults.headers.common['Authorization'];
};

export const clearAllTokens = () => {
    const storage = getLocalStorage();
    if (storage) {
        storage.removeItem('access_token');
        storage.removeItem('restaurant_token');
    }
    delete api.defaults.headers.common['Authorization'];
};

export const getToken = () => {
    const storage = getLocalStorage();
    return storage ? storage.getItem('access_token') : null;
};

export const getRestaurantToken = () => {
    const storage = getLocalStorage();
    return storage ? storage.getItem('restaurant_token') : null;
};

export const isRestaurantLoggedIn = () => {
    return !!getRestaurantToken();
};

export const isUserLoggedIn = () => {
    return !!getToken();
};