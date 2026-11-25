/**
 * @format
 */

import {AppRegistry} from 'react-native';
import {getMessaging, setBackgroundMessageHandler} from '@react-native-firebase/messaging';
import App from './App';
import {name as appName} from './app.json';

// Register background message handler for FCM
try {
  const messagingInst = getMessaging();
  setBackgroundMessageHandler(messagingInst, async remoteMessage => {
    console.log('[FCM] Message handled in the background!', remoteMessage);
  });
} catch (e) {
  console.warn('[FCM] Could not register background message handler:', e);
}

AppRegistry.registerComponent(appName, () => App);
