import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList, TextInput } from 'react-native';
import { ArrowLeft, Search, ChevronRight, FileText } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

import { Athlete } from '../../types/app';

interface AthleteWiseReportScreenProps {
  onBack: () => void;
  onOpenViewer: (title: string, athlete?: Athlete) => void;
}

export const AthleteWiseReportScreen: React.FC<AthleteWiseReportScreenProps> = ({
  onBack,
  onOpenViewer,
}) => {
  const { athletes } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAthletes = athletes.filter(ath =>
    ath.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ath.school.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Athlete for Report Card</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search athlete name or school..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Athlete List for Report Selection */}
      <FlatList
        data={filteredAthletes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.athleteReportCard, layout.shadowSubtle]}
            onPress={() => onOpenViewer(`Athlete Report - ${item.name}`, item)}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.initialsText}>{item.initials}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.athleteName}>{item.name}</Text>
              <Text style={styles.athleteSub}>{item.school} · Age {item.age}</Text>
              <Text style={styles.completionText}>
                {item.testsCompleted}/10 Tests Completed
              </Text>
            </View>
            <View style={styles.rightAction}>
              <View style={styles.viewBadge}>
                <FileText size={14} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.viewBadgeText}>Report</Text>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} style={{ marginTop: 4 }} />
            </View>
          </TouchableOpacity>
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
    paddingTop: 10,
    paddingBottom: 10,
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
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  listContent: {
    padding: 16,
  },
  athleteReportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  initialsText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  infoCol: {
    flex: 1,
  },
  athleteName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  athleteSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  completionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  rightAction: {
    alignItems: 'flex-end',
  },
  viewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  viewBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
