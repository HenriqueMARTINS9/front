import { api } from "./api";

// Fonction utilitaire pour vérifier si localStorage est disponible
const getLocalStorage = () => {
    if (typeof window !== 'undefined') {
        return localStorage;
    }
    return null;
};

// Fonction pour extraire le restaurant ID depuis l'email
// Format attendu: restaurantX@test.com où X est le restaurant ID
export const extractRestaurantIdFromEmail = (email: string): number | null => {
    const match = email.match(/^restaurant(\d+)@test\.com$/i);
    if (match && match[1]) {
        const restaurantId = parseInt(match[1], 10);
        return isNaN(restaurantId) ? null : restaurantId;
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

// Fonctions pour gérer le restaurant ID
export const setRestaurantId = (restaurantId: number) => {
    const storage = getLocalStorage();
    if (storage) {
        storage.setItem('restaurant_id', restaurantId.toString());
    }
};

export const getRestaurantId = (): number | null => {
    const storage = getLocalStorage();
    if (storage) {
        const restaurantId = storage.getItem('restaurant_id');
        return restaurantId ? parseInt(restaurantId, 10) : null;
    }
    return null;
};

export const clearRestaurantId = () => {
    const storage = getLocalStorage();
    if (storage) {
        storage.removeItem('restaurant_id');
    }
};

// Fonctions pour gérer la date de dernière modification
export const setLastModifiedDate = (date: Date = new Date()) => {
    const storage = getLocalStorage();
    if (storage) {
        storage.setItem('last_modified_date', date.toISOString());
    }
};

export const getLastModifiedDate = (): Date | null => {
    const storage = getLocalStorage();
    if (storage) {
        const dateStr = storage.getItem('last_modified_date');
        return dateStr ? new Date(dateStr) : null;
    }
    return null;
};

export const formatLastModifiedDate = (date: Date | null): string => {
    if (!date) return '';
    
    const months = [
        'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
        'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
};