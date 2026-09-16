export interface NotificationsInterface {
  clearPushToken: () => Promise<void>;
  registerDevice: () => Promise<string | null>;
}

export let sharedNotifications: NotificationsInterface | null = null;

export const injectNotifications = (impl: NotificationsInterface) => {
  sharedNotifications = impl;
};
