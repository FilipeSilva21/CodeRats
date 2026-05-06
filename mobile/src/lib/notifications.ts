import api from './api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationsService = {
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await api.get('/notifications');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  },

  markAsRead: async (id: string): Promise<void> => {
    try {
      await api.post(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }
};
