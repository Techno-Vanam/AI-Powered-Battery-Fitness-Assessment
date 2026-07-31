import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/camera';
import { useAthleteListViewModel } from '../hooks/useAthleteListViewModel';
import { ScreenHeader } from '../components/FormComponents';
import { Athlete } from '../database/repositories/AthleteRepository';
import { AthleteUseCases } from '../domain/usecases/AthleteUseCases';

type Props = NativeStackScreenProps<RootStackParamList, 'AthleteList'>;

export function AthleteListScreen({ navigation, route }: Props) {
  const isSelectForTest = route.params?.selectForTest ?? false;
  const { athletes, query, setQuery, isLoading, refresh } = useAthleteListViewModel();

  const handleSelectAthlete = (athlete: Athlete) => {
    navigation.navigate('HeightTestInstructions', { athlete });
  };

  const handleEditAthlete = (athlete: Athlete) => {
    navigation.navigate('AthleteRegistration', { athlete });
  };

  const handleViewHistory = (athlete: Athlete) => {
    navigation.navigate('History', { athleteId: athlete.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ScreenHeader
          title={isSelectForTest ? 'Select Athlete' : 'Athlete Roster'}
          subtitle={
            isSelectForTest
              ? 'Choose athlete to proceed with height test'
              : 'View, edit, or test registered athletes'
          }
          onBack={() => navigation.goBack()}
          rightElement={
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => navigation.navigate('AthleteRegistration')}
            >
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          }
        />

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search athlete by Name, ID, School, Coach..."
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

        {/* Athlete List */}
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Loading athlete database…</Text>
          </View>
        ) : (
          <FlatList
            data={athletes}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>👤</Text>
                <Text style={styles.emptyTitle}>No Athletes Found</Text>
                <Text style={styles.emptySub}>
                  {query.length > 0
                    ? `No results matching "${query}"`
                    : 'Register an athlete to get started'}
                </Text>
                <TouchableOpacity
                  style={styles.registerEmptyBtn}
                  onPress={() => navigation.navigate('AthleteRegistration')}
                >
                  <Text style={styles.registerEmptyText}>+ Register Athlete</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item }) => {
              const age = item.dateOfBirth
                ? AthleteUseCases.calculateAge(item.dateOfBirth)
                : null;

              return (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>
                        {item.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.headerInfo}>
                      <View style={styles.nameRow}>
                        <Text style={styles.athleteName}>{item.name}</Text>
                        <View style={styles.idBadge}>
                          <Text style={styles.idBadgeText}>{item.id}</Text>
                        </View>
                      </View>
                      <Text style={styles.athleteDetails}>
                        {item.gender} {age ? `• ${age} yrs` : ''} •{' '}
                        {item.heightCategory ?? 'General'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.metaDivider} />

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Coach:</Text>
                      <Text style={styles.metaValue}>{item.coachName ?? 'N/A'}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Academy:</Text>
                      <Text style={styles.metaValue}>{item.schoolAcademy ?? 'N/A'}</Text>
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.testBtn}
                      onPress={() => handleSelectAthlete(item)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.testBtnText}>📐 Start Height Test</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.iconActionBtn}
                      onPress={() => handleEditAthlete(item)}
                    >
                      <Text style={styles.iconActionText}>✏️ Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.iconActionBtn}
                      onPress={() => handleViewHistory(item)}
                    >
                      <Text style={styles.iconActionText}>📜 History</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  addBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
  },
  clearSearch: {
    color: '#9ca3af',
    fontSize: 16,
    padding: 4,
  },
  listContent: {
    paddingBottom: 30,
    gap: 14,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySub: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  registerEmptyBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  registerEmptyText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1e3a8a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  athleteName: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  idBadge: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#374151',
  },
  idBadgeText: {
    color: '#60a5fa',
    fontSize: 11,
    fontWeight: '700',
  },
  athleteDetails: {
    color: '#9ca3af',
    fontSize: 13,
  },
  metaDivider: {
    height: 1,
    backgroundColor: '#1f2937',
    marginVertical: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: 'row',
    gap: 4,
  },
  metaLabel: {
    color: '#6b7280',
    fontSize: 12,
  },
  metaValue: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testBtn: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  testBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  iconActionBtn: {
    backgroundColor: '#1f2937',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#374151',
  },
  iconActionText: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: '600',
  },
});
