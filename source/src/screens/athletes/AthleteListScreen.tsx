import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Modal,
} from 'react-native';
import { Search, Plus, Filter, X } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { AthleteRow } from '../../components/ui/AthleteRow';
import { EmptyState } from '../../components/ui/EmptyState';
import { Athlete, SortByOption } from '../../types/app';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

interface AthleteListScreenProps {
  onAddAthlete: () => void;
  onSelectAthlete: (athlete: Athlete) => void;
}

export const AthleteListScreen: React.FC<AthleteListScreenProps> = ({
  onAddAthlete,
  onSelectAthlete,
}) => {
  const { athletes } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortByOption>('Name_AZ');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // Filtering & Sorting logic (Sports filter removed)
  const filteredAthletes = athletes
    .filter(ath => {
      const matchesQuery =
        ath.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ath.school.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        selectedStatus === 'All'
          ? true
          : selectedStatus === 'Active'
          ? ath.status === 'In Progress' || ath.status === 'Active'
          : ath.status === selectedStatus;

      return matchesQuery && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'Name_AZ') return a.name.localeCompare(b.name);
      if (sortBy === 'Name_ZA') return b.name.localeCompare(a.name);
      if (sortBy === 'Age_Asc') return a.age - b.age;
      if (sortBy === 'Age_Desc') return b.age - a.age;
      if (sortBy === 'Completion_Asc') return a.testsCompleted - b.testsCompleted;
      if (sortBy === 'Completion_Desc') return b.testsCompleted - a.testsCompleted;
      if (sortBy === 'School') return a.school.localeCompare(b.school);
      return 0;
    });

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Athletes</Text>
        <TouchableOpacity style={styles.addBtn} onPress={onAddAthlete}>
          <Plus size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar Row with Filter Button directly on the right */}
      <View style={styles.filterSection}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search athletes..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.filterIconButton} onPress={() => setIsFilterModalVisible(true)}>
            <Filter size={18} color={colors.primary} />
            {(selectedStatus !== 'All' || sortBy !== 'Name_AZ') && (
              <View style={styles.filterActiveDot} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Athlete List */}
      <FlatList
        data={filteredAthletes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title="No Athletes Found"
            message="No athlete records match your current search and filter criteria."
            buttonLabel="Add New Athlete"
            onPress={onAddAthlete}
          />
        }
        renderItem={({ item }) => (
          <AthleteRow athlete={item} onPress={() => onSelectAthlete(item)} />
        )}
      />

      {/* Filter Bottom Sheet Modal */}
      <Modal visible={isFilterModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter & Sort Athletes</Text>
              <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
                <X size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Sort By Options */}
            <Text style={styles.filterLabel}>Sort By</Text>
            <View style={styles.optionsWrap}>
              {[
                { key: 'Name_AZ', label: 'Name (A–Z)' },
                { key: 'Name_ZA', label: 'Name (Z–A)' },
                { key: 'Age_Asc', label: 'Age (Ascending)' },
                { key: 'Age_Desc', label: 'Age (Descending)' },
                { key: 'Completion_Asc', label: 'Completion (Low to High)' },
                { key: 'Completion_Desc', label: 'Completion (High to Low)' },
                { key: 'School', label: 'School' },
              ].map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.modalOption, sortBy === opt.key && styles.modalOptionActive]}
                  onPress={() => setSortBy(opt.key as SortByOption)}
                >
                  <Text style={[styles.modalOptionText, sortBy === opt.key && styles.modalOptionTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Status Options */}
            <Text style={[styles.filterLabel, { marginTop: 16 }]}>Status Filter</Text>
            <View style={styles.optionsWrap}>
              {['All', 'Completed', 'Pending', 'Active'].map(st => (
                <TouchableOpacity
                  key={st}
                  style={[styles.modalOption, selectedStatus === st && styles.modalOptionActive]}
                  onPress={() => setSelectedStatus(st)}
                >
                  <Text style={[styles.modalOptionText, selectedStatus === st && styles.modalOptionTextActive]}>
                    {st}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.applyBtn} onPress={() => setIsFilterModalVisible(false)}>
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
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
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: layout.buttonRadius, // 12px
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  filterIconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterActiveDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  listContent: {
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalOption: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    marginRight: 8,
    marginBottom: 8,
  },
  modalOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modalOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalOptionTextActive: {
    color: '#FFFFFF',
  },
  applyBtn: {
    backgroundColor: colors.primary,
    borderRadius: layout.buttonRadius, // 12px
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  applyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
