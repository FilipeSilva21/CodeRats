import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { api } from '@coderats/shared';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  emailWeekly: boolean;
  squadAlerts: boolean;
}

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

const getProjectId = () => {
  const constants = Constants as any;
  return Constants.expoConfig?.extra?.eas?.projectId ?? constants.easConfig?.projectId;
};

const requestExpoPushToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') return null;

  if (Constants.appOwnership === 'expo') {
    return null;
  }

  try {
    const currentPermission = await Notifications.getPermissionsAsync();
    let finalStatus = currentPermission.status;

    if (finalStatus !== 'granted') {
      const requestedPermission = await Notifications.requestPermissionsAsync();
      finalStatus = requestedPermission.status;
    }

    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const projectId = getProjectId();
    const token = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    return token.data;
  } catch (error) {
    console.warn('Failed to register for push notifications:', error);
    return null;
  }
};

export const notificationsService = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications');
    return response.data.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.post(`/notifications/${id}/read`);
  },

  clearAll: async (): Promise<void> => {
    await api.delete('/notifications');
  },

  getPreferences: async (): Promise<NotificationPreferences> => {
    const response = await api.get('/notifications/preferences');
    return response.data.data;
  },

  updatePreferences: async (prefs: Partial<NotificationPreferences>): Promise<void> => {
    await api.put('/notifications/preferences', prefs);
  },

  registerDeviceForPushNotifications: async (): Promise<string | null> => {
    const token = await requestExpoPushToken();
    if (token) await api.post('/notifications/push-token', { token });
    return token;
  },

  syncPushTokenIfEnabled: async (): Promise<string | null> => {
    const prefs = await notificationsService.getPreferences();
    if (!prefs.pushEnabled) {
      await notificationsService.clearPushToken();
      return null;
    }
    return notificationsService.registerDeviceForPushNotifications();
  },

  clearPushToken: async (): Promise<void> => {
    await api.delete('/notifications/push-token');
  },
};
