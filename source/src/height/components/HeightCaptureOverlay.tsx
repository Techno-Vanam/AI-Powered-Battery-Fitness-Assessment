import React, { memo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { HeightMeasurementStatus } from '../types/HeightTypes';

type Props = {
  status: HeightMeasurementStatus;
  recordingDurationSec: number;
  minDurationSec: number;
  maxDurationSec: number;
  markerSizeCm: number;
  confidence?: number;
  heightCm?: number;
  errorMessage?: string | null;
};

export const HeightCaptureOverlay = memo(function HeightCaptureOverlay({
  status,
  recordingDurationSec,
  minDurationSec,
  maxDurationSec,
  markerSizeCm,
  confidence,
  heightCm,
  errorMessage,
}: Props) {
  const canStop = recordingDurationSec >= minDurationSec;

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.topBar}>
        <Text style={styles.badge}>AI HEIGHT · OFFLINE</Text>
        <Text style={styles.markerHint}>ArUco marker {markerSizeCm}×{markerSizeCm} cm at wall depth</Text>
      </View>

      <View style={styles.guideBox}>
        <Text style={styles.guideTitle}>Align subject + marker</Text>
        <Text style={styles.guideSub}>Full body visible · marker same plane as heels</Text>
      </View>

      {status === 'recording' && (
        <View style={styles.timerPill}>
          <View style={styles.recDot} />
          <Text style={styles.timerText}>
            {recordingDurationSec.toFixed(1)}s / {minDurationSec}–{maxDurationSec}s
          </Text>
          {!canStop && (
            <Text style={styles.waitText}>Hold steady…</Text>
          )}
        </View>
      )}

      {status === 'processing' && (
        <View style={styles.processingBox}>
          <ActivityIndicator color="#22c55e" size="large" />
          <Text style={styles.processingText}>On-device inference…</Text>
        </View>
      )}

      {status === 'complete' && heightCm != null && (
        <View style={styles.resultPill}>
          <Text style={styles.resultHeight}>{heightCm.toFixed(1)} cm</Text>
          {confidence != null && (
            <Text style={styles.resultConf}>Confidence {confidence}%</Text>
          )}
        </View>
      )}

      {errorMessage ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    padding: 16,
  },
  topBar: { gap: 4, marginTop: 8 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(34,197,94,0.25)',
    color: '#86efac',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    fontSize: 11,
    fontWeight: '700',
  },
  markerHint: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  guideBox: {
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.25)',
    marginTop: 40,
  },
  guideTitle: { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  guideSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4, textAlign: 'center' },
  timerPill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(220,38,38,0.85)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    gap: 4,
  },
  recDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  timerText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  waitText: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  processingBox: {
    alignSelf: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 24,
    borderRadius: 16,
  },
  processingText: { color: '#fff', fontSize: 14 },
  resultPill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(34,197,94,0.9)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  resultHeight: { color: '#fff', fontSize: 28, fontWeight: '800' },
  resultConf: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 4 },
  errorBox: {
    backgroundColor: 'rgba(220,38,38,0.9)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 80,
  },
  errorText: { color: '#fff', fontSize: 13, textAlign: 'center' },
});
