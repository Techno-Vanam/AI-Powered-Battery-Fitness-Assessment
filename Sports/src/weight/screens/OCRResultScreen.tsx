import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { OCRResult, WeightMeasurement } from '../types';
import syncService from '../services/SyncService';
import networkService from '../services/NetworkService';
import { WEIGHT_CONFIG } from '../constants';

interface OCRResultScreenProps {
  measurement: Partial<WeightMeasurement>;
  ocrResult: OCRResult;
  onNavigate: (screen: string, params?: any) => void;
}

export const OCRResultScreen: React.FC<OCRResultScreenProps> = ({
  measurement,
  ocrResult,
  onNavigate
}) => {
  const initialWeight = ocrResult.detectedWeight !== null ? ocrResult.detectedWeight.toString() : '70.0';
  const [weightInput, setWeightInput] = useState<string>(initialWeight);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const confidencePercent = Math.round(ocrResult.confidence * 100);
  const category = ocrResult.category;

  const handleConfirm = async () => {
    const numWeight = parseFloat(weightInput);
    if (isNaN(numWeight) || numWeight < WEIGHT_CONFIG.MIN_WEIGHT_KG || numWeight > WEIGHT_CONFIG.MAX_WEIGHT_KG) {
      Alert.alert('Invalid Weight', `Please enter a valid weight between ${WEIGHT_CONFIG.MIN_WEIGHT_KG}kg and ${WEIGHT_CONFIG.MAX_WEIGHT_KG}kg.`);
      return;
    }

    setIsSubmitting(true);

    const record: WeightMeasurement = {
      id: `wm-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      weight: numWeight,
      ocrRawText: ocrResult.rawText || `${numWeight} kg`,
      ocrConfidence: ocrResult.confidence,
      capturedImagePath: measurement.capturedImagePath || 'captured.jpg',
      timestamp: measurement.timestamp || new Date().toISOString(),
      syncStatus: 'Pending',
      retryCount: 0
    };

    // Process via SyncService (SQLite -> Upload if Online -> Purge SQLite & Image)
    const result = await syncService.processNewMeasurement(record);
    setIsSubmitting(false);

    if (result.uploadedImmediately) {
      Alert.alert(
        'Upload Successful 🎉',
        `Weight ${numWeight}kg has been permanently stored in MySQL database. Temporary SQLite cache cleared.`,
        [{ text: 'OK', onPress: () => onNavigate('WeightHome') }]
      );
    } else {
      Alert.alert(
        'Saved to SQLite Offline Cache 📦',
        `Weight ${numWeight}kg saved locally in SQLite. It will automatically upload to MySQL once internet is restored.`,
        [{ text: 'View Pending Queue', onPress: () => onNavigate('PendingUpload') }]
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Category Banner */}
      {category === 'ACCEPT' && (
        <View style={[styles.banner, styles.bannerSuccess]}>
          <Text style={styles.bannerTitle}>✓ HIGH CONFIDENCE MATCH (≥95%)</Text>
          <Text style={styles.bannerText}>Weight reading verified automatically.</Text>
        </View>
      )}

      {category === 'CONFIRM' && (
        <View style={[styles.banner, styles.bannerWarning]}>
          <Text style={styles.bannerTitle}>⚠️ USER CONFIRMATION REQUIRED (80% - 95%)</Text>
          <Text style={styles.bannerText}>Please inspect the value below before saving.</Text>
        </View>
      )}

      {category === 'RETAKE' && (
        <View style={[styles.banner, styles.bannerDanger]}>
          <Text style={styles.bannerTitle}>🚨 LOW CONFIDENCE (&lt;80%)</Text>
          <Text style={styles.bannerText}>Re-aligning the camera or retaking is recommended.</Text>
        </View>
      )}

      {/* Main Result Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>DETECTED WEIGHT</Text>

        {isEditing ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.weightInput}
              value={weightInput}
              onChangeText={setWeightInput}
              keyboardType="decimal-pad"
              autoFocus={true}
            />
            <Text style={styles.unitText}>KG</Text>
          </View>
        ) : (
          <View style={styles.displayRow}>
            <Text style={styles.weightDisplay}>{weightInput}</Text>
            <Text style={styles.unitText}>KG</Text>
          </View>
        )}

        {/* OCR Details Info Row */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>OCR Confidence</Text>
            <Text style={[styles.detailValue, { color: getConfidenceColor(ocrResult.confidence) }]}>
              {confidencePercent}%
            </Text>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Raw Text</Text>
            <Text style={styles.detailValue}>{ocrResult.rawText || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Network Mode</Text>
            <Text style={styles.detailValue}>
              {networkService.isOnline() ? '🌐 Online (Direct MySQL)' : '📦 Offline (SQLite Cache)'}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {/* Confirm Button */}
        <TouchableOpacity
          style={[styles.btn, styles.btnConfirm, isSubmitting && styles.btnDisabled]}
          disabled={isSubmitting}
          onPress={handleConfirm}
        >
          <Text style={styles.btnConfirmText}>
            {isSubmitting ? 'PROCESSING...' : '✓ CONFIRM & SAVE'}
          </Text>
        </TouchableOpacity>

        {/* Manual Edit Button */}
        <TouchableOpacity
          style={[styles.btn, styles.btnSecondary]}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Text style={styles.btnSecondaryText}>
            {isEditing ? 'DONE EDITING' : '✏️ MANUAL EDIT'}
          </Text>
        </TouchableOpacity>

        {/* Retake Button */}
        <TouchableOpacity
          style={[styles.btn, styles.btnRetake]}
          onPress={() => onNavigate('Camera')}
        >
          <Text style={styles.btnRetakeText}>🔄 RETAKE IMAGE</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const getConfidenceColor = (conf: number): string => {
  if (conf >= 0.95) return '#2E7D32';
  if (conf >= 0.80) return '#F57F17';
  return '#C62828';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9'
  },
  content: {
    padding: 20
  },
  banner: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20
  },
  bannerSuccess: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32'
  },
  bannerWarning: {
    backgroundColor: '#FFFDE7',
    borderLeftWidth: 4,
    borderLeftColor: '#F57F17'
  },
  bannerDanger: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#C62828'
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#212121',
    marginBottom: 4
  },
  bannerText: {
    fontSize: 12,
    color: '#616161'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#78909C',
    letterSpacing: 2,
    marginBottom: 16
  },
  displayRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24
  },
  weightDisplay: {
    fontSize: 54,
    fontWeight: '900',
    color: '#1A237E'
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24
  },
  weightInput: {
    fontSize: 44,
    fontWeight: '900',
    color: '#1A237E',
    borderBottomWidth: 3,
    borderBottomColor: '#3F51B5',
    minWidth: 140,
    textAlign: 'center',
    paddingVertical: 4
  },
  unitText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#5C6BC0',
    marginLeft: 8
  },
  detailRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ECEFF1',
    marginTop: 8
  },
  detailItem: {
    alignItems: 'center',
    flex: 1
  },
  detailDivider: {
    width: 1,
    backgroundColor: '#ECEFF1'
  },
  detailLabel: {
    fontSize: 11,
    color: '#90A4AE',
    fontWeight: '700',
    marginBottom: 4
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#37474F'
  },
  actionsContainer: {
    gap: 12
  },
  btn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%'
  },
  btnConfirm: {
    backgroundColor: '#1A237E'
  },
  btnConfirmText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 1
  },
  btnSecondary: {
    backgroundColor: '#E8EAF6',
    borderWidth: 1,
    borderColor: '#C5CAE9'
  },
  btnSecondaryText: {
    color: '#1A237E',
    fontWeight: '700',
    fontSize: 14
  },
  btnRetake: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CFD8DC'
  },
  btnRetakeText: {
    color: '#455A64',
    fontWeight: '700',
    fontSize: 14
  },
  btnDisabled: {
    opacity: 0.6
  }
});
