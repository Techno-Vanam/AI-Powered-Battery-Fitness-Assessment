import RNFS from 'react-native-fs';
import NetInfo from '@react-native-community/netinfo';
import { AthleteRepository } from '../database/repositories/AthleteRepository';
import { HeightRepository } from '../database/repositories/HeightRepository';
import { VideoRepository } from '../database/repositories/VideoRepository';
import { SyncRepository, type SyncQueueItem } from '../database/repositories/SyncRepository';
import { AthleteApi } from '../network/AthleteApi';
import { HeightApi } from '../network/HeightApi';
import { VideoApi } from '../network/VideoApi';

export type WorkerResult = 'success' | 'retry' | 'skip';

const MAX_BATCH_SIZE = 5;
const BATCH_DELAY_MS = 250; // Throttle to prevent battery drain on 3 GB RAM devices

/**
 * Process pending items in optimized batches to prevent CPU throttling & battery drain.
 */
export async function processQueueBatch(): Promise<number> {
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    return 0; // Abort early if offline to save battery
  }

  const pending = await SyncRepository.getPending();
  const items = pending.slice(0, MAX_BATCH_SIZE);
  let processedCount = 0;

  for (const item of items) {
    const result = await processQueueItem(item);
    if (result === 'success' || result === 'skip') {
      processedCount++;
    }
    // Small inter-item delay to keep UI responsive
    await new Promise<void>(resolve => {
      setTimeout(() => resolve(), BATCH_DELAY_MS);
    });
  }

  return processedCount;
}

export async function processQueueItem(item: SyncQueueItem): Promise<WorkerResult> {
  try {
    switch (item.tableName) {
      case 'athletes':
        return await uploadAthlete(item);
      case 'height_tests':
        return await uploadHeightTest(item);
      case 'videos':
        return await uploadVideo(item);
      default:
        await SyncRepository.delete(item.id);
        return 'skip';
    }
  } catch {
    await SyncRepository.incrementRetry(item.id);
    return 'retry';
  }
}

async function uploadAthlete(item: SyncQueueItem): Promise<WorkerResult> {
  const athlete = await AthleteRepository.findById(item.recordId);
  if (!athlete) {
    await SyncRepository.delete(item.id);
    return 'skip';
  }

  const alreadyExists = await AthleteApi.exists(athlete.id);
  if (!alreadyExists) {
    await AthleteApi.upload(athlete);
  }

  await SyncRepository.delete(item.id);
  return 'success';
}

async function uploadHeightTest(item: SyncQueueItem): Promise<WorkerResult> {
  const test = await HeightRepository.findById(item.recordId);
  if (!test) {
    await SyncRepository.delete(item.id);
    return 'skip';
  }

  // Ensure athlete exists on server first (upload from local if needed)
  const athlete = await AthleteRepository.findById(test.athleteId);
  if (athlete) {
    const athleteExists = await AthleteApi.exists(athlete.id);
    if (!athleteExists) {
      await AthleteApi.upload(athlete);
    }
  }

  await HeightRepository.updateSyncStatus(test.measurementId, 'uploading');

  const alreadyExists = await HeightApi.exists(test.measurementId);
  if (!alreadyExists) {
    await HeightApi.upload(test);
  }

  await HeightRepository.delete(test.measurementId);
  await SyncRepository.delete(item.id);
  return 'success';
}

async function uploadVideo(item: SyncQueueItem): Promise<WorkerResult> {
  const video = await VideoRepository.findById(item.recordId);
  if (!video) {
    await SyncRepository.delete(item.id);
    return 'skip';
  }

  const fileExists = await RNFS.exists(video.localPath);
  if (!fileExists) {
    await VideoRepository.delete(video.id);
    await SyncRepository.delete(item.id);
    return 'skip';
  }

  await VideoRepository.updateSyncStatus(video.id, 'uploading');

  const alreadyExists = await VideoApi.exists(video.id);
  if (!alreadyExists) {
    await VideoApi.upload(video);
  }

  await VideoRepository.updateSyncStatus(video.id, 'uploaded');
  await RNFS.unlink(video.localPath);
  await VideoRepository.delete(video.id);
  await SyncRepository.delete(item.id);
  return 'success';
}
