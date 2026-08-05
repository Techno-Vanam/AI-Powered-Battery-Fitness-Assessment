import 'react-native-get-random-values';
import { AppRegistry } from 'react-native';
import App from './App';
const { name: appName } = require('./app.json');

AppRegistry.registerComponent(appName, () => App);

// Register headless sync only after the RN runtime is up.
try {
  const BackgroundFetch = require('react-native-background-fetch').default;
  const { headlessTask } = require('./src/sync/BackgroundSync');
  BackgroundFetch.registerHeadlessTask(headlessTask);
} catch (e) {
  console.warn('[index] BackgroundFetch headless task not registered:', e);
}
