import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList } from 'react-native';
import { ArrowLeft, Search, Filter } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

interface SessionHistoryScreenProps {
  onBack: () => void;
}

export const SessionHistoryScreen: React.FC<SessionHistoryScreenProps> = ({ onBack }) => {
  const { sessions } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Assessed' | 'In Progress'>('All');

  const filteredSessions = sessions.filter(s => {
    const matchesSearch =
      s.sessionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.coachName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' ? true : s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search & Filter Bar */}
      <View style={styles.filterSection}>
        <View style={styles.searchBar}>
          <Search size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search sessions..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Pills */}
        <View style={styles.chipRow}>
          {(['All', 'In Progress', 'Assessed'] as const).map(st => (
            <TouchableOpacity
              key={st}
              style={[styles.chip, statusFilter === st && styles.chipActive]}
              onPress={() => setStatusFilter(st)}
            >
              <Text style={[styles.chipText, statusFilter === st && styles.chipTextActive]}>
                {st}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sessions List */}
      <FlatList
        data={filteredSessions}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.sessionCard, layout.shadowSubtle]}>
            <View style={styles.sessionHeaderRow}>
              <Text style={styles.sessionDate}>{item.date}</Text>
              <StatusBadge status={item.status} />
            </View>

            <Text style={styles.sessionTitle}>{item.sessionName}</Text>
            <Text style={styles.sessionSubText}>
              {item.schoolName} · Coach {item.coachName}
            </Text>

            <View style={styles.progressRow}>
              <Text style={styles.assessedCountText}>
                {item.assessedCount}/{item.totalAthletes} Athletes Assessed
              </Text>
              <Text style={styles.progressPctText}>{item.progressPercentage}% complete</Text>
            </View>

            <ProgressBar progress={item.progressPercentage} color={colors.primary} height={6} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  chipRow: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  sessionCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sessionDate: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  sessionSubText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  assessedCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  progressPctText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
});
