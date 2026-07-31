import React from 'react';
import { StyleSheet, View } from 'react-native';
import TestCard from './TestCard';
import SectionTitle from './SectionTitle';
import { layout } from '../../theme';
import { t } from '../../utils/i18n';
import type { DashboardTest } from '../../types/athleteDashboard';

type Props = {
  tests: DashboardTest[];
  onOpenTest: (test: DashboardTest) => void;
};

export default function TestJourneyList({ tests, onOpenTest }: Props) {
  return (
    <View>
      <SectionTitle title={t('dashboard.testJourney')} />
      <View style={styles.list}>
        {tests.map(test => (
          <TestCard key={test.id} test={test} onPress={() => onOpenTest(test)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: layout.fieldGap + 4,
  },
});
