import crashlytics from '@react-native-firebase/crashlytics';

/**
 * Reusable Firebase Crashlytics Service
 */
class CrashlyticsService {
  /**
   * Log a message that will be attached to any future crash reports
   * @param {string} message
   */
  static log(message) {
    try {
      if (!message) return;
      crashlytics().log(message);
      if (__DEV__) {
        console.log(`[Crashlytics] ${message}`);
      }
    } catch (e) {
      console.warn('[Crashlytics] Error logging message:', e);
    }
  }

  /**
   * Record a non-fatal error / exception
   * @param {Error|any} error
   * @param {string} [jsErrorName]
   */
  static recordError(error, jsErrorName = 'HandledException') {
    try {
      if (!error) return;
      if (typeof error === 'string') {
        const customErr = new Error(error);
        customErr.name = jsErrorName;
        crashlytics().recordError(customErr, jsErrorName);
      } else {
        crashlytics().recordError(error, jsErrorName);
      }
      if (__DEV__) {
        console.log(`[Crashlytics] Recorded error:`, error);
      }
    } catch (e) {
      console.warn('[Crashlytics] Error recording error:', e);
    }
  }

  /**
   * Set user identifier in crash reports
   * @param {string} userId
   */
  static async setUserId(userId) {
    try {
      if (userId) {
        await crashlytics().setUserId(String(userId));
      }
    } catch (e) {
      console.warn('[Crashlytics] Error setting user ID:', e);
    }
  }

  /**
   * Set custom key-value attribute
   * @param {string} key
   * @param {string} value
   */
  static async setAttribute(key, value) {
    try {
      if (key && value !== undefined) {
        await crashlytics().setAttribute(key, String(value));
      }
    } catch (e) {
      console.warn('[Crashlytics] Error setting attribute:', e);
    }
  }

  /**
   * Set multiple custom attributes
   * @param {Record<string, string>} attributes
   */
  static async setAttributes(attributes = {}) {
    try {
      if (attributes && typeof attributes === 'object') {
        const stringified = {};
        for (const [k, v] of Object.entries(attributes)) {
          stringified[k] = String(v);
        }
        await crashlytics().setAttributes(stringified);
      }
    } catch (e) {
      console.warn('[Crashlytics] Error setting attributes:', e);
    }
  }

  /**
   * Initialize Global Error Handlers (catches unhandled JS exceptions & promises)
   */
  static initGlobalHandlers() {
    try {
      // Set Crashlytics data collection enabled
      crashlytics().setCrashlyticsCollectionEnabled(true);

      // Handle unhandled JS exceptions
      const defaultHandler =
        global.ErrorUtils && global.ErrorUtils.getGlobalHandler
          ? global.ErrorUtils.getGlobalHandler()
          : null;

      if (global.ErrorUtils && global.ErrorUtils.setGlobalHandler) {
        global.ErrorUtils.setGlobalHandler((error, isFatal) => {
          try {
            CrashlyticsService.log(`Fatal Error: ${isFatal}`);
            CrashlyticsService.recordError(error, isFatal ? 'FatalJSError' : 'NonFatalJSError');
          } catch (_) {}

          if (defaultHandler) {
            defaultHandler(error, isFatal);
          }
        });
      }

      this.log('Crashlytics initialized successfully');
    } catch (e) {
      console.warn('[Crashlytics] Initialization error:', e);
    }
  }

  /**
   * Test Crashlytics by forcing a crash (use for testing only!)
   */
  static testCrash() {
    crashlytics().crash();
  }
}

export default CrashlyticsService;
