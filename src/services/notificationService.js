import {
  getMessaging,
  requestPermission,
  getToken,
  subscribeToTopic,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  onTokenRefresh,
} from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationService {
  constructor() {
    this._messaging = null;
  }

  getMessagingInstance() {
    if (!this._messaging) {
      try {
        this._messaging = getMessaging();
      } catch (err) {
        console.warn('[FCM] Error obtaining messaging instance:', err);
      }
    }
    return this._messaging;
  }

  /**
   * Request Notification permission from user (especially for Android 13+)
   */
  async requestUserPermission() {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('[FCM] Notification permission denied on Android 13+');
          return false;
        }
      }

      const messagingInst = this.getMessagingInstance();
      if (!messagingInst) {
        return false;
      }

      const authStatus = await requestPermission(messagingInst);
      const enabled = authStatus === 1 || authStatus === 2; // AUTHORIZED = 1, PROVISIONAL = 2

      console.log('[FCM] Authorization status:', authStatus, 'Enabled:', enabled);
      return enabled;
    } catch (error) {
      console.error('[FCM] Error requesting user permission:', error);
      return false;
    }
  }

  /**
   * Get device FCM token and persist in storage
   */
  async getFcmToken() {
    try {
      let fcmToken = await AsyncStorage.getItem('fcm_token');
      if (!fcmToken) {
        const messagingInst = this.getMessagingInstance();
        if (messagingInst) {
          fcmToken = await getToken(messagingInst);
          if (fcmToken) {
            console.log('[FCM] Registered new token:', fcmToken);
            await AsyncStorage.setItem('fcm_token', fcmToken);
          }
        }
      } else {
        console.log('[FCM] Cached token retrieved:', fcmToken);
      }
      return fcmToken;
    } catch (error) {
      console.error('[FCM] Error fetching token:', error);
      return null;
    }
  }

  /**
   * Subscribe user to broadcast topic so all users receive notifications sent from Firebase
   */
  async subscribeToAllUsersTopic() {
    try {
      const messagingInst = this.getMessagingInstance();
      if (messagingInst) {
        await subscribeToTopic(messagingInst, 'all_users');
        console.log('[FCM] Successfully subscribed to topic: all_users');
      }
    } catch (error) {
      console.error('[FCM] Failed to subscribe to topic all_users:', error);
    }
  }

  /**
   * Initialize notification listeners (Foreground, Background opened, Initial open, Token refresh)
   */
  initListeners() {
    const messagingInst = this.getMessagingInstance();
    if (!messagingInst) {
      return () => {};
    }

    // 1. Foreground message handler (when app is open)
    const unsubscribeForeground = onMessage(messagingInst, async remoteMessage => {
      console.log('[FCM] Foreground notification received:', remoteMessage);
      const title = remoteMessage.notification?.title || 'Notification';
      const body = remoteMessage.notification?.body || '';

      Alert.alert(title, body, [{ text: 'OK' }]);
    });

    // 2. Notification opened app while in background
    onNotificationOpenedApp(messagingInst, remoteMessage => {
      console.log('[FCM] App opened from background by notification:', remoteMessage);
    });

    // 3. Notification opened app from completely closed (quit) state
    getInitialNotification(messagingInst).then(remoteMessage => {
      if (remoteMessage) {
        console.log('[FCM] App opened from quit state by notification:', remoteMessage);
      }
    });

    // 4. Token refreshed by Firebase
    onTokenRefresh(messagingInst, async newToken => {
      console.log('[FCM] Token refreshed:', newToken);
      await AsyncStorage.setItem('fcm_token', newToken);
      await this.subscribeToAllUsersTopic();
    });

    return unsubscribeForeground;
  }

  /**
   * Full setup method
   */
  async initialize() {
    const hasPermission = await this.requestUserPermission();
    if (hasPermission) {
      await this.getFcmToken();
      await this.subscribeToAllUsersTopic();
    }
    return this.initListeners();
  }
}

const instance = new NotificationService();
export default instance;
