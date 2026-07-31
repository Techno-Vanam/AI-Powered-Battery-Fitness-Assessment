import { AppRegistry } from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import App from './App';
const { name: appName } = require('./app.json');
import { headlessTask } from './src/sync/BackgroundSync';

AppRegistry.registerComponent(appName, () => App);

// Android headless task — runs sync when app is not in foreground
BackgroundFetch.registerHeadlessTask(headlessTask);
