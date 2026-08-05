import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { AthleteRow } from '../../components/ui/AthleteRow';
import { Athlete } from '../../types/app';
import { colors } from '../../theme/colors';

interface PendingAssessmentsScreenProps {
  onBack: () => void;
  onSelectAthlete: (athlete: Athlete) => void;
}

export const PendingAssessmentsScreen: React.FC<PendingAssessmentsScreenProps> = ({
  onBack,
  onSelectAthlete,
}) => {
  const { athletes } = useApp();
  const pendingAthletes = athletes.filter(a => a.status === 'Pending' || a.status === 'In Progress');

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pending Assessments ({pendingAthletes.length})</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={pendingAthletes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <AthleteRow athlete={item} onPress={() => onSelectAthlete(item)} />
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
  listContent: {
    padding: 16,
  },
});
