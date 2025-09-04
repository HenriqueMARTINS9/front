import { useState, useCallback } from 'react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    duration?: number;
}

export function useNotification() {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback((type: NotificationType, message: string, duration = 5000) => {
        const id = Date.now().toString();
        const notification: Notification = { id, type, message, duration };
        
        setNotifications(prev => [...prev, notification]);
        
        // Auto-remove after duration
        setTimeout(() => {
            removeNotification(id);
        }, duration);
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const showSuccess = useCallback((message: string, duration?: number) => {
        showNotification('success', message, duration);
    }, [showNotification]);

    const showError = useCallback((message: string, duration?: number) => {
        showNotification('error', message, duration);
    }, [showNotification]);

    const showInfo = useCallback((message: string, duration?: number) => {
        showNotification('info', message, duration);
    }, [showNotification]);

    return {
        notifications,
        showNotification,
        showSuccess,
        showError,
        showInfo,
        removeNotification,
    };
}
