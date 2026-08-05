import BackgroundFetch from 'react-native-background-fetch';
import { openDatabase } from '../database/Database';
import { SyncManager } from './SyncManager';

const TASK_ID = 'com.sports.backgroundsync';

export async function configureBackgroundSync(): Promise<void> {
  BackgroundFetch.configure(
    {
      minimumFetchInterval: 15,       // minutes — minimum allowed by OS
      stopOnTerminate: false,          // continue after app is killed
      startOnBoot: true,               // resume after device reboot
      enableHeadless: true,            // Android headless task support
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
    },
    async (taskId: string) => {
      try {
        await openDatabase();
        await SyncManager.triggerSync();
      } finally {
        BackgroundFetch.finish(taskId);
      }
    },
    (taskId: string) => {
      // OS timeout — finish immediately
      BackgroundFetch.finish(taskId);
    },
  );

  // Schedule a one-off task that fires when network becomes available
  BackgroundFetch.scheduleTask({
    taskId: TASK_ID,
    delay: 0,
    periodic: false,
    requiresNetworkConnectivity: true,
    stopOnTerminate: false,
    enableHeadless: true,
  });
}

// Headless task handler — called by Android when app is not running
export async function headlessTask(event: { taskId: string }): Promise<void> {
  try {
    await openDatabase();
    await SyncManager.triggerSync();
  } finally {
    BackgroundFetch.finish(event.taskId);
  }
}
