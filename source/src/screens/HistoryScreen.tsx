import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/camera';
import { useHistoryViewModel } from '../hooks/useHistoryViewModel';
import {
  ScreenHeader,
  FilterChip,
  StatusBadge,
} from '../components/FormComponents';
import { DateFilterOption, SyncFilterOption } from '../domain/models/HeightTest';
import { AthleteUseCases } from '../domain/usecases/AthleteUseCases';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

export default function HistoryScreen({ navigation, route }: Props) {
  const initialAthleteId = route.params?.athleteId;
  const {
    history,
    query,
    setQuery,
    dateFilter,
    setDateFilter,
    syncFilter,
    setSyncFilter,
    selectedRecord,
    setSelectedRecord,
    deleteRecord,
  } = useHistoryViewModel(initialAthleteId);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Record', 'Remove this height measurement from local database?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteRecord(id),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContent}>
        <ScreenHeader
          title="Measurement History"
          subtitle="Offline access to all recorded height tests"
          onBack={() => navigation.goBack()}
          rightElement={
            <TouchableOpacity
              style={styles.syncBtn}
              onPress={() => navigation.navigate('SyncStatus')}
            >
              <Text style={styles.syncBtnText}>🔄 Sync</Text>
            </TouchableOpacity>
          }
        />

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Athlete Name or ID..."
            placeholderTextColor="#4b5563"
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Date Filter Chips */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Date:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(['ALL', 'TODAY', 'WEEK', 'MONTH'] as DateFilterOption[]).map(f => (
              <FilterChip
                key={f}
                label={f === 'ALL' ? 'All Time' : f === 'TODAY' ? 'Today' : f === 'WEEK' ? 'Last 7 Days' : '30 Days'}
                selected={dateFilter === f}
                onPress={() => setDateFilter(f)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Sync Status Filter Chips */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Sync:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(['ALL', 'PENDING', 'UPLOADED', 'FAILED'] as SyncFilterOption[]).map(f => (
              <FilterChip
                key={f}
                label={f === 'ALL' ? 'All Status' : f === 'PENDING' ? 'Pending' : f === 'UPLOADED' ? 'Uploaded' : 'Failed'}
                selected={syncFilter === f}
                onPress={() => setSyncFilter(f)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Measurements List */}
        <FlatList
          data={history}
          keyExtractor={item => item.test.measurementId}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyTitle}>No Measurements Found</Text>
              <Text style={styles.emptySub}>
                {query.length > 0
                  ? `No tests match search "${query}"`
                  : 'Complete a height measurement test to see history'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setSelectedRecord(item)}
              activeOpacity={0.8}
            >
              <View style={styles.cardMain}>
                <View style={styles.cardLeft}>
                  <View style={styles.nameRow}>
                    <Text style={styles.athleteName}>
                      {item.athlete?.name ?? 'Unknown Athlete'}
                    </Text>
                    {item.athlete && (
                      <View style={styles.idBadge}>
                        <Text style={styles.idBadgeText}>{item.athlete.id}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.dateText}>
                    📅 {new Date(item.test.timestamp).toLocaleString()}
                  </Text>

                  <View style={styles.badgeRow}>
                    <StatusBadge status={item.test.syncStatus} />
                    <Text style={styles.confidenceText}>
                      Confidence: {item.test.confidence.toFixed(0)}%
                    </Text>
                  </View>
                </View>

                <View style={styles.cardRight}>
                  <Text style={styles.heightCmText}>{item.test.heightCm.toFixed(1)}</Text>
                  <Text style={styles.unitText}>cm</Text>
                  <TouchableOpacity
                    style={styles.deleteTouch}
                    onPress={() => handleDelete(item.test.measurementId)}
                  >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Offline Detail View Modal */}
        <Modal visible={Boolean(selectedRecord)} transparent animationType="slide">
          {selectedRecord && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Measurement Details</Text>
                  <TouchableOpacity onPress={() => setSelectedRecord(null)}>
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.heightBannerModal}>
                    <Text style={styles.modalHeightCm}>
                      {selectedRecord.test.heightCm.toFixed(1)} cm
                    </Text>
                    <Text style={styles.modalHeightFeet}>
                      {Math.floor(selectedRecord.test.heightCm / 30.48)}′{' '}
                      {Math.round((selectedRecord.test.heightCm % 30.48) / 2.54)}″
                    </Text>
                  </View>

                  <DetailRow
                    label="Athlete Name"
                    value={selectedRecord.athlete?.name ?? 'N/A'}
                  />
                  <DetailRow label="Athlete ID" value={selectedRecord.test.athleteId} />
                  <DetailRow
                    label="Gender & Age"
                    value={`${selectedRecord.athlete?.gender ?? ''} ${
                      selectedRecord.athlete?.dateOfBirth
                        ? `(${AthleteUseCases.calculateAge(selectedRecord.athlete.dateOfBirth)} yrs)`
                        : ''
                    }`}
                  />
                  <DetailRow
                    label="Category"
                    value={selectedRecord.athlete?.heightCategory ?? 'General'}
                  />
                  <DetailRow
                    label="School / Academy"
                    value={selectedRecord.athlete?.schoolAcademy ?? 'N/A'}
                  />
                  <DetailRow
                    label="Coach Name"
                    value={selectedRecord.athlete?.coachName ?? 'N/A'}
                  />
                  <DetailRow
                    label="Sync Status"
                    value={selectedRecord.test.syncStatus.toUpperCase()}
                  />
                  <DetailRow
                    label="Confidence"
                    value={`${selectedRecord.test.confidence.toFixed(0)}%`}
                  />
                  <DetailRow
                    label="Calibration"
                    value={selectedRecord.test.calibrationMethod}
                  />
                  <DetailRow
                    label="Device"
                    value={selectedRecord.test.deviceModel}
                  />
                  <DetailRow
                    label="Measurement ID"
                    value={selectedRecord.test.measurementId}
                  />
                  <DetailRow
                    label="Timestamp"
                    value={new Date(selectedRecord.test.timestamp).toLocaleString()}
                  />
                </ScrollView>

                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedRecord(null)}
                >
                  <Text style={styles.modalCloseBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Modal>
      </View>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  mainContent: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  syncBtn: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#374151',
  },
  syncBtnText: { color: '#60a5fa', fontSize: 12, fontWeight: '700' },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, color: '#ffffff', fontSize: 14 },
  clearSearch: { color: '#9ca3af', fontSize: 16, padding: 4 },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
    width: 44,
  },
  listContent: { paddingBottom: 30, gap: 12, paddingTop: 6 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: '#ffffff', fontSize: 18, fontWeight: '800', marginBottom: 6 },
  emptySub: { color: '#6b7280', fontSize: 13, textAlign: 'center' },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cardMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: { flex: 1, gap: 6, marginRight: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  athleteName: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  idBadge: {
    backgroundColor: '#1f2937',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  idBadgeText: { color: '#60a5fa', fontSize: 11, fontWeight: '700' },
  dateText: { color: '#9ca3af', fontSize: 12 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  confidenceText: { color: '#6b7280', fontSize: 11, fontWeight: '600' },
  cardRight: { alignItems: 'flex-end' },
  heightCmText: { color: '#22c55e', fontSize: 28, fontWeight: '900', lineHeight: 30 },
  unitText: { color: '#9ca3af', fontSize: 12, fontWeight: '700' },
  deleteTouch: { marginTop: 6, padding: 4 },
  deleteIcon: { fontSize: 14 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: '#1f2937',
  },
  modalTitle: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  modalCloseText: { color: '#9ca3af', fontSize: 18, fontWeight: '700', padding: 4 },
  modalBody: { paddingVertical: 14 },
  heightBannerModal: {
    backgroundColor: '#1e3a8a',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeightCm: { color: '#22c55e', fontSize: 40, fontWeight: '900' },
  modalHeightFeet: { color: '#93c5fd', fontSize: 16, fontWeight: '700' },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#1f2937',
  },
  detailLabel: { color: '#9ca3af', fontSize: 13 },
  detailValue: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  modalCloseBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  modalCloseBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
});
