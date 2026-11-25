import analytics from '@react-native-firebase/analytics';

/**
 * Reusable Firebase Analytics Service
 */
class AnalyticsService {
  /**
   * Log a custom event to Firebase Analytics
   * @param {string} name - Event name (e.g., 'game_started')
   * @param {object} [params={}] - Additional parameters for the event
   */
  static async logEvent(name, params = {}) {
    try {
      if (!name) {
        return;
      }
      await analytics().logEvent(name, params);
      if (__DEV__) {
        console.log(`[Analytics] Event logged: ${name}`, params);
      }
    } catch (error) {
      console.warn(`[Analytics] Error logging event "${name}":`, error);
    }
  }

  /**
   * Log a screen view event
   * @param {string} screenName - Current screen name
   * @param {string} [screenClass] - Optional screen class/category name
   */
  static async logScreenView(screenName, screenClass) {
    try {
      if (!screenName) {
        return;
      }
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });
      if (__DEV__) {
        console.log(`[Analytics] Screen view logged: ${screenName}`);
      }
    } catch (error) {
      console.warn(`[Analytics] Error logging screen view "${screenName}":`, error);
    }
  }

  /**
   * Set user ID for current user session
   * @param {string|null} userId
   */
  static async setUserId(userId) {
    try {
      await analytics().setUserId(userId);
      if (__DEV__) {
        console.log(`[Analytics] User ID set: ${userId}`);
      }
    } catch (error) {
      console.warn('[Analytics] Error setting user ID:', error);
    }
  }

  /**
   * Set a custom user property
   * @param {string} name
   * @param {string|null} value
   */
  static async setUserProperty(name, value) {
    try {
      if (!name) {
        return;
      }
      await analytics().setUserProperty(name, value);
      if (__DEV__) {
        console.log(`[Analytics] User property set: ${name} = ${value}`);
      }
    } catch (error) {
      console.warn(`[Analytics] Error setting user property "${name}":`, error);
    }
  }

  /**
   * Set multiple custom user properties
   * @param {object} properties
   */
  static async setUserProperties(properties = {}) {
    try {
      await analytics().setUserProperties(properties);
      if (__DEV__) {
        console.log('[Analytics] User properties set:', properties);
      }
    } catch (error) {
      console.warn('[Analytics] Error setting user properties:', error);
    }
  }

  /**
   * Enable or disable analytics data collection
   * @param {boolean} enabled
   */
  static async setAnalyticsCollectionEnabled(enabled) {
    try {
      await analytics().setAnalyticsCollectionEnabled(enabled);
      if (__DEV__) {
        console.log(`[Analytics] Analytics collection enabled: ${enabled}`);
      }
    } catch (error) {
      console.warn('[Analytics] Error toggling collection enabled:', error);
    }
  }

  /**
   * Reset analytics data for this instance
   */
  static async resetAnalyticsData() {
    try {
      await analytics().resetAnalyticsData();
      if (__DEV__) {
        console.log('[Analytics] Analytics data reset');
      }
    } catch (error) {
      console.warn('[Analytics] Error resetting analytics data:', error);
    }
  }
}

export default AnalyticsService;
