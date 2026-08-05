import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { STANDARD_10_TESTS } from '../../data/mockData';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

interface TestSelectionScreenProps {
  onBack: () => void;
  onSelectTest: (testId: string, testName: string) => void;
}

export const TestSelectionScreen: React.FC<TestSelectionScreenProps> = ({
  onBack,
  onSelectTest,
}) => {
  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>10 Test Battery Selection</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={STANDARD_10_TESTS}
        keyExtractor={item => item.testId}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.testCard, layout.shadowSubtle]}
            onPress={() => onSelectTest(item.testId, item.testName)}
          >
            <View style={styles.infoCol}>
              <Text style={styles.testName}>{item.testName}</Text>
              <Text style={styles.testCategory}>{item.category} · Standard Unit ({item.unit})</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
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
  testCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 10,
  },
  infoCol: {
    flex: 1,
  },
  testName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  testCategory: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
